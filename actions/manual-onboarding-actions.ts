'use server';

/**
 * Manual Onboarding Server Actions
 * Enables admins to complete onboarding on behalf of clients
 */

import { auth } from '@clerk/nextjs/server';
import {
  getOnboardingSessionById,
  getOnboardingSessionByProjectId,
  updateOnboardingSession,
  updateSessionCompletionMode,
  updateSectionCompletion,
  markSessionFinalized,
  markSessionReviewedByClient,
  createOnboardingSession,
} from '@/db/queries/onboarding-queries';
import { getTemplateById } from '@/db/queries/onboarding-templates-queries';
import { getProjectById } from '@/db/queries/projects-queries';
import { logAudit } from '@/lib/audit-logger';
import { sendClientReviewNotificationEmail } from '@/lib/email-service';
import { analyzeOnboardingCompletion } from '@/lib/ai-onboarding-completion-analyzer';
import { generateTodos } from '@/lib/ai-todo-generator';

export interface ManualOnboardingResult {
  success: boolean;
  sessionId?: string;
  error?: string;
  message?: string; // For success messages
}

/**
 * Start a new manual onboarding session or convert existing
 */
export async function startManualOnboardingAction(
  projectId: string,
  templateId: string,
  mode: 'manual' | 'hybrid' = 'manual',
  sessionId?: string // For converting existing session
): Promise<ManualOnboardingResult> {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    let session;

    if (sessionId) {
      // Convert existing session to manual mode
      session = await getOnboardingSessionById(sessionId);
      
      if (!session) {
        return { success: false, error: 'Session not found' };
      }

      // Update to manual mode
      await updateSessionCompletionMode(sessionId, mode, userId);
      
      await logAudit({
        userId,
        action: 'onboarding_converted_to_manual',
        resourceType: 'onboarding_session',
        resourceId: sessionId,
        metadata: { mode, projectId },
      });
    } else {
      // ✅ FIX #1: Check for existing session before creating
      const existingSession = await getOnboardingSessionByProjectId(projectId);
      if (existingSession) {
        // Reuse existing session, just convert it to manual
        await updateSessionCompletionMode(existingSession.id, mode, userId);
        
        await logAudit({
          userId,
          action: 'onboarding_reused_and_converted',
          resourceType: 'onboarding_session',
          resourceId: existingSession.id,
          metadata: { mode, projectId, templateId },
        });
        
        return { success: true, sessionId: existingSession.id };
      }

      // Create new manual session
      const project = await getProjectById(projectId);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      const template = await getTemplateById(templateId);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      session = await createOnboardingSession({
        projectId,
        organizationId: project.organizationId,
        templateLibraryId: templateId,
        onboardingType: template.projectType as any,
        steps: template.questions,
        status: 'in_progress',
        completionMode: mode,
        manuallyCompletedBy: userId,
        manuallyCompletedAt: new Date(),
        startedAt: new Date(),
      });

      await logAudit({
        userId,
        action: 'manual_onboarding_started',
        resourceType: 'onboarding_session',
        resourceId: session.id,
        metadata: { mode, projectId, templateId },
      });
    }

    return { success: true, sessionId: session.id };
  } catch (error: any) {
    console.error('Error starting manual onboarding:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save a section with admin attribution
 */
export async function saveManualSectionAction(
  sessionId: string,
  sectionId: string,
  responses: Record<string, any>,
  delegateToClient: boolean = false
): Promise<ManualOnboardingResult> {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const session = await getOnboardingSessionById(sessionId);
    
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    // Merge new responses with existing ones
    const existingResponses = (session.responses as Record<string, any>) || {};
    const updatedResponses = { ...existingResponses, ...responses };

    // Update session with new responses
    await updateOnboardingSession(sessionId, {
      responses: updatedResponses,
      lastActivityAt: new Date(),
    });

    // Track who completed this section
    if (!delegateToClient) {
      await updateSectionCompletion(sessionId, sectionId, userId);
    }

    await logAudit({
      userId,
      action: 'manual_onboarding_section_saved',
      resourceType: 'onboarding_session',
      resourceId: sessionId,
      metadata: { sectionId, delegated: delegateToClient },
    });

    return { success: true, sessionId };
  } catch (error: any) {
    console.error('Error saving manual section:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Submit manual onboarding (finalize or send for review)
 */
export async function submitManualOnboardingAction(
  sessionId: string,
  finalizeNow: boolean
): Promise<ManualOnboardingResult> {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const session = await getOnboardingSessionById(sessionId);
    
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    // ✅ FIX #2: Get project with client info
    const project = await getProjectById(session.projectId);
    if (!project) {
      return { success: false, error: 'Project not found' };
    }

    if (finalizeNow) {
      // Mark as finalized by admin, skip client review
      await markSessionFinalized(sessionId, true, false);
      
      // Trigger AI analysis and todo generation
      const analysis = await analyzeOnboardingCompletion(sessionId);
      
      if (analysis) {
        await updateOnboardingSession(sessionId, {
          aiAnalysis: analysis,
          status: 'completed',
          completedAt: new Date(),
        });

        // Generate todos
        await generateTodos(sessionId);
      }

      await logAudit({
        userId,
        action: 'manual_onboarding_finalized',
        resourceType: 'onboarding_session',
        resourceId: sessionId,
        metadata: { skipClientReview: true },
      });
    } else {
      // Send for client review
      await markSessionFinalized(sessionId, false, true);

      // ✅ FIX #2: Validate client email exists
      const clientEmail = project.clientEmail;
      const clientName = project.clientName || 'Client';

      if (!clientEmail) {
        return { success: false, error: 'No client email found. Please add client email to the project first.' };
      }

      // Send notification email to client
      const completedBySections = (session.completedBySections as Record<string, any>) || {};
      const adminFilledSections = Object.keys(completedBySections).filter(
        (key) => completedBySections[key].completed_by === userId
      );

      await sendClientReviewNotificationEmail(
        clientEmail,
        clientName,
        sessionId,
        session.accessToken,
        adminFilledSections
      );

      await logAudit({
        userId,
        action: 'manual_onboarding_sent_for_review',
        resourceType: 'onboarding_session',
        resourceId: sessionId,
      });
    }

    return { success: true, sessionId };
  } catch (error: any) {
    console.error('Error submitting manual onboarding:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Client submits reviewed/edited onboarding
 */
export async function submitClientReviewAction(
  token: string,
  reviewNotes: string,
  updatedResponses?: Record<string, any>
): Promise<ManualOnboardingResult> {
  try {
    const session = await getOnboardingSessionByToken(token);
    
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    // ✅ FIX BUG-005: Validate and sanitize client responses before merging
    if (updatedResponses) {
      // Get template to validate against
      const template = session.templateLibraryId 
        ? await getTemplateById(session.templateLibraryId)
        : null;

      if (!template || !template.questions) {
        return { success: false, error: 'Invalid session template' };
      }

      // Build a map of valid field IDs from template
      const validFieldIds = new Set<string>();
      template.questions.forEach((section: any) => {
        section.fields?.forEach((field: any) => {
          validFieldIds.add(field.id);
        });
      });

      // Validate each response
      const validatedResponses: Record<string, any> = {};
      const errors: string[] = [];

      for (const [fieldId, value] of Object.entries(updatedResponses)) {
        // Check if field exists in template
        if (!validFieldIds.has(fieldId)) {
          errors.push(`Invalid field: ${fieldId}`);
          continue;
        }

        // Basic XSS prevention: sanitize strings
        if (typeof value === 'string') {
          // Remove script tags and limit length
          const sanitized = value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .substring(0, 10000); // Max 10k characters per field
          validatedResponses[fieldId] = sanitized;
        } else if (Array.isArray(value)) {
          // Validate array items
          validatedResponses[fieldId] = value.slice(0, 100); // Max 100 array items
        } else if (typeof value === 'object' && value !== null) {
          // Limit object size
          validatedResponses[fieldId] = value;
        } else {
          validatedResponses[fieldId] = value;
        }
      }

      if (errors.length > 0) {
        console.warn('Client review validation errors:', errors);
        return { success: false, error: `Invalid fields: ${errors.join(', ')}` };
      }

      // Merge validated responses with existing data
      const existingResponses = (session.responses as Record<string, any>) || {};
      const mergedResponses = { ...existingResponses, ...validatedResponses };
      
      await updateOnboardingSession(session.id, {
        responses: mergedResponses,
      });
    }

    // Sanitize review notes
    const sanitizedNotes = reviewNotes
      ?.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .substring(0, 5000) || '';

    // Mark as reviewed by client
    await markSessionReviewedByClient(session.id, sanitizedNotes);

    // Trigger AI analysis and todo generation
    const analysis = await analyzeOnboardingCompletion(session.id);
    
    if (analysis) {
      await updateOnboardingSession(session.id, {
        aiAnalysis: analysis,
      });

      // Generate todos
      await generateTodos(session.id);
    }

    return { success: true, sessionId: session.id };
  } catch (error: any) {
    console.error('Error submitting client review:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Convert an abandoned session to manual mode
 */
export async function convertToManualOnboardingAction(
  sessionId: string
): Promise<ManualOnboardingResult> {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // ✅ FIX #9: Validate session state before converting
    const session = await getOnboardingSessionById(sessionId);
    
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    // Don't convert already completed sessions
    if (session.status === 'completed') {
      return { success: false, error: 'Cannot convert completed sessions. This onboarding is already finished.' };
    }

    // Don't convert already manual sessions
    if (session.completionMode === 'manual') {
      return { success: false, error: 'Session is already in manual mode' };
    }

    // Check if session has meaningful client responses to preserve
    const hasClientResponses = session.responses && Object.keys(session.responses).length > 0;
    
    // Convert to hybrid mode if there are client responses, manual otherwise
    const newMode = hasClientResponses ? 'hybrid' : 'manual';
    await updateSessionCompletionMode(sessionId, newMode, userId);

    await logAudit({
      userId,
      action: 'onboarding_converted_to_manual',
      resourceType: 'onboarding_session',
      resourceId: sessionId,
      metadata: { 
        previousMode: session.completionMode || 'client',
        newMode,
        hadClientResponses: hasClientResponses,
        responseCount: hasClientResponses ? Object.keys(session.responses).length : 0
      },
    });

    return { 
      success: true, 
      sessionId,
      message: hasClientResponses 
        ? 'Session converted to hybrid mode. Client responses preserved.'
        : 'Session converted to manual mode.'
    };
  } catch (error: any) {
    console.error('Error converting to manual onboarding:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get onboarding session by token (for client review)
 */
async function getOnboardingSessionByToken(token: string) {
  // This is a duplicate of the query function, but we need it here for client review
  const { getOnboardingSessionByToken: getSession } = await import('@/db/queries/onboarding-queries');
  return getSession(token);
}
