/**
 * Client Onboarding Actions (Public - Token-Based)
 * Actions for clients to complete onboarding without authentication
 */

"use server";

import { ActionResult } from "@/types";
import {
  getOnboardingSessionByToken,
  updateSessionResponses,
  updateSessionProgress,
  markSessionStarted,
  markSessionCompleted,
  saveStepResponse,
} from "@/db/queries/onboarding-queries";
import { sendOnboardingComplete, sendPlatformAdminNotification } from "@/lib/email-service";
import { getProjectById } from "@/db/queries/projects-queries";
import { logOrganizationChange } from "@/lib/audit-logger";

/**
 * Get onboarding session by token (public access)
 */
export async function getOnboardingByTokenAction(
  token: string
): Promise<ActionResult<any>> {
  try {
    const session = await getOnboardingSessionByToken(token);

    if (!session) {
      return {
        isSuccess: false,
        message: "Invalid or expired onboarding link.",
      };
    }

    // Check if token is expired
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      return {
        isSuccess: false,
        message: "This onboarding link has expired. Please contact us for a new link.",
      };
    }

    // Get project details
    const project = await getProjectById(session.projectId);

    return {
      isSuccess: true,
      message: "Session loaded successfully",
      data: {
        session,
        project,
      },
    };
  } catch (error) {
    console.error("Error fetching onboarding session:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to load onboarding.",
    };
  }
}

/**
 * Start onboarding session (mark as in progress)
 */
export async function startOnboardingAction(token: string): Promise<ActionResult<void>> {
  try {
    const session = await getOnboardingSessionByToken(token);
    if (!session) {
      return { isSuccess: false, message: "Invalid token." };
    }

    // ✅ FIX BUG-011: Check expiration before allowing start
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      return {
        isSuccess: false,
        message: "This onboarding link has expired. Please contact us for a new link.",
      };
    }

    if (session.status === 'pending') {
      await markSessionStarted(session.id);
    }

    return {
      isSuccess: true,
      message: "Onboarding started.",
    };
  } catch (error) {
    console.error("Error starting onboarding:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to start onboarding.",
    };
  }
}

/**
 * Save step response (auto-save functionality)
 */
export async function saveStepResponseAction(
  token: string,
  stepIndex: number,
  stepData: any
): Promise<ActionResult<void>> {
  try {
    const session = await getOnboardingSessionByToken(token);
    if (!session) {
      return { isSuccess: false, message: "Invalid token." };
    }

    // ✅ FIX BUG-011: Check expiration before allowing save
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      return {
        isSuccess: false,
        message: "This onboarding link has expired. Please contact us for a new link.",
      };
    }

    // Merge new step data with existing responses
    const currentResponses = (session.responses as any) || {};
    currentResponses[stepIndex] = stepData;

    // Update session responses
    await updateSessionResponses(session.id, currentResponses);

    // Calculate completion percentage
    const steps = session.steps as any[];
    const totalSteps = steps.length;
    const completedSteps = Object.keys(currentResponses).length;
    const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

    // Update progress
    if (stepIndex > session.currentStep) {
      await updateSessionProgress(session.id, stepIndex, completionPercentage);
    }

    return {
      isSuccess: true,
      message: "Progress saved.",
    };
  } catch (error) {
    console.error("Error saving step response:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to save progress.",
    };
  }
}

/**
 * Submit a step and move to next
 */
export async function submitStepAction(
  token: string,
  stepIndex: number,
  stepData: any,
  timeSpent?: number
): Promise<ActionResult<{ nextStep: number; completionPercentage: number }>> {
  try {
    const session = await getOnboardingSessionByToken(token);
    if (!session) {
      return { isSuccess: false, message: "Invalid token." };
    }

    const steps = session.steps as any[];
    const currentStep = steps[stepIndex];

    // Save step response to analytics table
    await saveStepResponse({
      sessionId: session.id,
      stepIndex,
      stepType: currentStep.type,
      responseData: stepData as any,
      timeSpent,
    });

    // Merge with existing responses
    const currentResponses = (session.responses as any) || {};
    currentResponses[stepIndex] = stepData;
    await updateSessionResponses(session.id, currentResponses);

    // Calculate next step and completion percentage
    const nextStep = stepIndex + 1;
    const completionPercentage = Math.round((nextStep / steps.length) * 100);

    // Update progress
    await updateSessionProgress(session.id, nextStep, completionPercentage);

    return {
      isSuccess: true,
      message: "Step completed.",
      data: {
        nextStep,
        completionPercentage,
      },
    };
  } catch (error) {
    console.error("Error submitting step:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to submit step.",
    };
  }
}

/**
 * Complete onboarding (final submission)
 * Note: File uploads are now handled directly via Uploadthing API on the client side
 */
export async function completeOnboardingAction(
  token: string,
  finalData?: any
): Promise<ActionResult<void>> {
  try {
    const session = await getOnboardingSessionByToken(token);
    if (!session) {
      return { isSuccess: false, message: "Invalid token." };
    }

    // ✅ FIX BUG-011: Check expiration before allowing completion
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      return {
        isSuccess: false,
        message: "This onboarding link has expired. Your progress has been saved, but please contact us for a new link to complete.",
      };
    }

    // Save final data if provided
    if (finalData) {
      const currentResponses = (session.responses as any) || {};
      const steps = session.steps as any[];
      currentResponses[steps.length - 1] = finalData;
      await updateSessionResponses(session.id, currentResponses);
    }

    // Mark session as completed
    await markSessionCompleted(session.id);

    // Get project details for email
    const project = await getProjectById(session.projectId);

    // Send completion email to client
    if (project) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const projectDashboardLink = `${appUrl}/dashboard/projects/${project.id}`;

      // Note: We don't have client email stored directly, so this would need to be passed
      // or retrieved from project/contact data
      // await sendOnboardingComplete({
      //   clientEmail: 'client@example.com',
      //   clientName: 'Client Name',
      //   projectName: project.name,
      //   projectDashboardLink,
      // });
    }

    // Send notification to platform admin
    await sendPlatformAdminNotification({
      adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@example.com',
      subject: `Client Onboarding Completed: ${project?.name}`,
      message: `A client has completed the onboarding for project "${project?.name}". View responses in the platform dashboard.`,
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/platform/onboarding/${session.id}`,
    });

    // Log action
    await logOrganizationChange(
      'update',
      session.organizationId,
      {
        action: 'onboarding.completed',
        sessionId: session.id,
        projectId: session.projectId,
      }
    );

    return {
      isSuccess: true,
      message: "Onboarding completed successfully!",
    };
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to complete onboarding.",
    };
  }
}

/**
 * Get current progress
 */
export async function getProgressAction(
  token: string
): Promise<ActionResult<{ currentStep: number; completionPercentage: number; totalSteps: number }>> {
  try {
    const session = await getOnboardingSessionByToken(token);
    if (!session) {
      return { isSuccess: false, message: "Invalid token." };
    }

    const steps = session.steps as any[];

    return {
      isSuccess: true,
      message: "Progress loaded successfully",
      data: {
        currentStep: session.currentStep,
        completionPercentage: session.completionPercentage,
        totalSteps: steps.length,
      },
    };
  } catch (error) {
    console.error("Error fetching progress:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to fetch progress.",
    };
  }
}
