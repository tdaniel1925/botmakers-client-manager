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

      // Send notification email to client
      const project = await getProjectById(session.projectId);
      if (project && project.clientEmail) {
        const completedBySections = (session.completedBySections as Record<string, any>) || {};
        const adminFilledSections = Object.keys(completedBySections).filter(
          (key) => completedBySections[key].completed_by === userId
        );

        await sendClientReviewNotificationEmail(
          project.clientEmail,
          project.clientName || 'Client',
          sessionId,
          session.accessToken,
          adminFilledSections
        );
      }

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

    // Merge client updates with existing responses
    if (updatedResponses) {
      const existingResponses = (session.responses as Record<string, any>) || {};
      const mergedResponses = { ...existingResponses, ...updatedResponses };
      
      await updateOnboardingSession(session.id, {
        responses: mergedResponses,
      });
    }

    // Mark as reviewed by client
    await markSessionReviewedByClient(session.id, reviewNotes);

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
    const session = await getOnboardingSessionById(sessionId);
    
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    // Convert to hybrid mode (preserve client responses, admin continues)
    await updateSessionCompletionMode(sessionId, 'hybrid', userId);

    await logAudit({
      userId,
      action: 'onboarding_converted_to_manual',
      resourceType: 'onboarding_session',
      resourceId: sessionId,
      metadata: { previousMode: session.completionMode || 'client' },
    });

    return { success: true, sessionId };
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
