/**
 * Onboarding Server Actions (Platform Admin)
 * Actions for platform admins to manage onboarding sessions
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { ActionResult } from "@/types";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { analyzeProjectForOnboarding, generateCustomSteps, generateWelcomeMessage } from "@/lib/ai-onboarding-analyzer";
import { getTemplateByType, getTemplateById as getLocalTemplateById, ONBOARDING_TEMPLATES } from "@/lib/onboarding-templates";
import {
  createOnboardingSession,
  getOnboardingSessionById,
  getAllSessions,
  getSessionsByOrganization,
  getSessionsByStatus,
  updateOnboardingSession,
  deleteOnboardingSession,
  regenerateSessionToken,
  getActiveTemplates,
  incrementTemplateUsage,
  getCompletionRateStats,
  getSessionResponses,
} from "@/db/queries/onboarding-queries";
import { getProjectById } from "@/db/queries/projects-queries";
import { sendOnboardingInvitation } from "@/lib/email-service";
import { logOrganizationChange, logPlatformAction } from "@/lib/audit-logger";

/**
 * Create a new onboarding session for a project
 */
export async function createOnboardingSessionAction(
  projectId: string,
  templateType?: 'web_design' | 'voice_ai' | 'software_dev' | 'auto'
): Promise<ActionResult<{ sessionId: string; accessToken: string; onboardingUrl: string }>> {
  try {
    const { userId } = await auth();
    if (!userId || !(await isPlatformAdmin())) {
      return { isSuccess: false, message: "Unauthorized. Platform admin access required." };
    }

    // Get project details
    const project = await getProjectById(projectId);
    if (!project) {
      return { isSuccess: false, message: "Project not found." };
    }

    // Determine template type
    let finalTemplateType = templateType || 'auto';
    let template;
    let steps;

    if (finalTemplateType === 'auto') {
      // Use AI to analyze project and determine best template
      const analysis = await analyzeProjectForOnboarding(
        project.description || '',
        project.name
      );
      // Map AI result to allowed template types
      const projectTypeMap: Record<string, 'auto' | 'web_design' | 'voice_ai' | 'software_dev'> = {
        'web_design': 'web_design',
        'voice_ai': 'voice_ai',
        'software_dev': 'software_dev',
        'custom': 'software_dev', // Fallback
        'marketing': 'web_design', // Fallback
        'other': 'software_dev', // Fallback
      };
      finalTemplateType = projectTypeMap[analysis.projectType] || 'software_dev';
    }

    // Get template
    template = getTemplateByType(finalTemplateType);
    if (!template) {
      // Fallback to generic template
      template = getLocalTemplateById('generic');
      finalTemplateType = 'software_dev'; // Set to a valid type when using fallback
    }

    steps = template?.steps || [];

    // Calculate expiration (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Ensure finalTemplateType is never 'auto' at this point
    const onboardingType: 'custom' | 'other' | 'web_design' | 'voice_ai' | 'software_dev' | 'marketing' = 
      finalTemplateType === 'auto' ? 'software_dev' : finalTemplateType as any;

    // Create session
    const session = await createOnboardingSession({
      projectId,
      organizationId: project.organizationId,
      templateId: undefined, // We're using local templates for now
      onboardingType,
      status: 'pending',
      steps: steps as any, // JSONB
      responses: {},
      currentStep: 0,
      completionPercentage: 0,
      expiresAt,
    });

    // Generate onboarding URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const onboardingUrl = `${appUrl}/onboarding/${session.accessToken}`;

    // Log action
    await logOrganizationChange(
      'create',
      project.organizationId,
      {
        action: 'onboarding.created',
        sessionId: session.id,
        projectId,
        projectName: project.name,
        templateType: finalTemplateType,
      }
    );

    return {
      isSuccess: true,
      message: "Onboarding session created successfully.",
      data: {
        sessionId: session.id,
        accessToken: session.accessToken,
        onboardingUrl,
      },
    };
  } catch (error) {
    console.error("Error creating onboarding session:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to create onboarding session.",
    };
  }
}

/**
 * Send onboarding invitation email to client
 */
export async function sendOnboardingInvitationAction(
  sessionId: string,
  clientEmail: string,
  clientName: string
): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId || !(await isPlatformAdmin())) {
      return { isSuccess: false, message: "Unauthorized." };
    }

    const session = await getOnboardingSessionById(sessionId);
    if (!session) {
      return { isSuccess: false, message: "Session not found." };
    }

    const project = await getProjectById(session.projectId);
    if (!project) {
      return { isSuccess: false, message: "Project not found." };
    }

    // Calculate estimated time
    const steps = session.steps as any[];
    const estimatedMinutes = steps.reduce((total: number, step: any) => total + (step.estimatedMinutes || 5), 0);

    // Generate onboarding URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const onboardingLink = `${appUrl}/onboarding/${session.accessToken}`;

    // Send email
    const result = await sendOnboardingInvitation({
      clientEmail,
      clientName,
      projectName: project.name,
      onboardingLink,
      estimatedMinutes,
    });

    if (!result.isSuccess) {
      return { isSuccess: false, message: result.message || "Failed to send email." };
    }

    // Log action
    await logOrganizationChange(
      'update',
      session.organizationId,
      {
        action: 'onboarding.invitation_sent',
        sessionId,
        clientEmail,
        clientName,
      }
    );

    return {
      isSuccess: true,
      message: "Invitation email sent successfully.",
    };
  } catch (error) {
    console.error("Error sending onboarding invitation:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to send invitation.",
    };
  }
}

/**
 * Get all onboarding sessions (with optional filters)
 */
export async function getOnboardingSessionsAction(
  filter?: {
    organizationId?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'abandoned';
  }
): Promise<ActionResult<any[]>> {
  try {
    const { userId } = await auth();
    if (!userId || !(await isPlatformAdmin())) {
      return { isSuccess: false, message: "Unauthorized." };
    }

    let sessions;

    if (filter?.status) {
      sessions = await getSessionsByStatus(filter.status);
    } else if (filter?.organizationId) {
      sessions = await getSessionsByOrganization(filter.organizationId);
    } else {
      sessions = await getAllSessions();
    }

    return {
      isSuccess: true,
      message: "Sessions fetched successfully.",
      data: sessions,
    };
  } catch (error) {
    console.error("Error fetching onboarding sessions:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to fetch sessions.",
    };
  }
}

/**
 * Get onboarding session details with responses
 */
export async function getOnboardingSessionDetailsAction(
  sessionId: string
): Promise<ActionResult<any>> {
  try {
    const { userId } = await auth();
    if (!userId || !(await isPlatformAdmin())) {
      return { isSuccess: false, message: "Unauthorized." };
    }

    const session = await getOnboardingSessionById(sessionId);
    if (!session) {
      return { isSuccess: false, message: "Session not found." };
    }

    const project = await getProjectById(session.projectId);
    const responses = await getSessionResponses(sessionId);

    return {
      isSuccess: true,
      message: "Session details fetched successfully.",
      data: {
        session,
        project,
        responses,
      },
    };
  } catch (error) {
    console.error("Error fetching session details:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to fetch session details.",
    };
  }
}

/**
 * Regenerate access token for a session
 */
export async function regenerateOnboardingTokenAction(
  sessionId: string
): Promise<ActionResult<{ accessToken: string; onboardingUrl: string }>> {
  try {
    const { userId } = await auth();
    if (!userId || !(await isPlatformAdmin())) {
      return { isSuccess: false, message: "Unauthorized." };
    }

    const updated = await regenerateSessionToken(sessionId);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const onboardingUrl = `${appUrl}/onboarding/${updated.accessToken}`;

    // Log action
    await logPlatformAction('onboarding.token_regenerated', 'onboarding', sessionId);

    return {
      isSuccess: true,
      message: "Access token regenerated successfully.",
      data: {
        accessToken: updated.accessToken,
        onboardingUrl,
      },
    };
  } catch (error) {
    console.error("Error regenerating token:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to regenerate token.",
    };
  }
}

/**
 * Delete an onboarding session
 */
export async function deleteOnboardingSessionAction(sessionId: string): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId || !(await isPlatformAdmin())) {
      return { isSuccess: false, message: "Unauthorized." };
    }

    const session = await getOnboardingSessionById(sessionId);
    if (!session) {
      return { isSuccess: false, message: "Session not found." };
    }

    await deleteOnboardingSession(sessionId);

    // Log action
    await logOrganizationChange(
      'delete',
      session.organizationId,
      {
        action: 'onboarding.deleted',
        sessionId,
      }
    );

    return {
      isSuccess: true,
      message: "Onboarding session deleted successfully.",
    };
  } catch (error) {
    console.error("Error deleting onboarding session:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to delete session.",
    };
  }
}

/**
 * Get onboarding analytics/stats
 */
export async function getOnboardingAnalyticsAction(): Promise<ActionResult<any>> {
  try {
    const { userId } = await auth();
    if (!userId || !(await isPlatformAdmin())) {
      return { isSuccess: false, message: "Unauthorized." };
    }

    const completionStats = await getCompletionRateStats();
    const allSessions = await getAllSessions();

    const stats = {
      total: completionStats.total,
      completed: completionStats.completed,
      completionRate: completionStats.rate,
      inProgress: allSessions.filter((s) => s.status === 'in_progress').length,
      pending: allSessions.filter((s) => s.status === 'pending').length,
      abandoned: allSessions.filter((s) => s.status === 'abandoned').length,
    };

    return {
      isSuccess: true,
      message: "Analytics fetched successfully.",
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to fetch analytics.",
    };
  }
}

/**
 * Get available templates
 */
export async function getAvailableTemplatesAction(): Promise<ActionResult<any[]>> {
  try {
    return {
      isSuccess: true,
      message: "Templates fetched successfully.",
      data: ONBOARDING_TEMPLATES,
    };
  } catch (error) {
    console.error("Error fetching templates:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to fetch templates.",
    };
  }
}

/**
 * Reset onboarding session - deletes current session and creates a new one
 */
export async function resetOnboardingSessionAction(
  projectId: string,
  templateType?: 'web_design' | 'voice_ai' | 'software_dev' | 'auto'
): Promise<ActionResult<{ sessionId: string; accessToken: string; onboardingUrl: string }>> {
  try {
    const { userId } = await auth();
    if (!userId || !(await isPlatformAdmin())) {
      return { isSuccess: false, message: "Unauthorized. Platform admin access required." };
    }

    // Get project details
    const project = await getProjectById(projectId);
    if (!project) {
      return { isSuccess: false, message: "Project not found." };
    }

    // Find existing session(s) for this project
    const existingSessions = await getSessionsByOrganization(project.organizationId);
    const projectSession = existingSessions.find(s => s.projectId === projectId);

    // Delete the existing session if found
    if (projectSession) {
      await deleteOnboardingSession(projectSession.id);
      
      // Log deletion
      await logOrganizationChange(
        'delete',
        project.organizationId,
        {
          action: 'onboarding.deleted',
          sessionId: projectSession.id,
          reason: 'reset',
        }
      );
    }

    // Create a new session using the same logic as createOnboardingSessionAction
    let finalTemplateType = templateType || 'auto';
    let template;
    let steps;

    if (finalTemplateType === 'auto') {
      // Use AI to analyze project and determine best template
      const analysis = await analyzeProjectForOnboarding(
        project.description || '',
        project.name
      );
      // Map AI result to allowed template types
      const projectTypeMap: Record<string, 'auto' | 'web_design' | 'voice_ai' | 'software_dev'> = {
        'web_design': 'web_design',
        'voice_ai': 'voice_ai',
        'software_dev': 'software_dev',
        'custom': 'software_dev', // Fallback
        'marketing': 'web_design', // Fallback
        'other': 'software_dev', // Fallback
      };
      finalTemplateType = projectTypeMap[analysis.projectType] || 'software_dev';
    }

    // Get template
    template = getTemplateByType(finalTemplateType);
    if (!template) {
      // Fallback to generic template
      template = getLocalTemplateById('generic');
      finalTemplateType = 'software_dev'; // Set to a valid type when using fallback
    }

    steps = template?.steps || [];

    // Calculate expiration (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Ensure finalTemplateType is never 'auto' at this point
    const onboardingType: 'custom' | 'other' | 'web_design' | 'voice_ai' | 'software_dev' | 'marketing' = 
      finalTemplateType === 'auto' ? 'software_dev' : finalTemplateType as any;

    // Create new session
    const newSession = await createOnboardingSession({
      projectId,
      organizationId: project.organizationId,
      templateId: undefined,
      onboardingType,
      status: 'pending',
      steps: steps as any,
      responses: {},
      currentStep: 0,
      completionPercentage: 0,
      expiresAt,
    });

    // Generate onboarding URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const onboardingUrl = `${appUrl}/onboarding/${newSession.accessToken}`;

    // Log action
    await logOrganizationChange(
      'create',
      project.organizationId,
      {
        action: 'onboarding.reset',
        sessionId: newSession.id,
        templateType: finalTemplateType,
        oldSessionId: projectSession?.id,
      }
    );

    return {
      isSuccess: true,
      message: "Onboarding session reset successfully!",
      data: {
        sessionId: newSession.id,
        accessToken: newSession.accessToken,
        onboardingUrl,
      },
    };
  } catch (error) {
    console.error("Error resetting onboarding session:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to reset onboarding session.",
    };
  }
}
