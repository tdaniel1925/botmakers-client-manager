"use server";

/**
 * Reminder Actions
 * Server actions for managing onboarding reminders
 */

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  createReminder,
  getSessionReminders,
  cancelSessionReminders,
  updateSessionReminderSettings,
  markReminderAsSent,
  getReminderStats,
} from "@/db/queries/reminder-queries";
import { getOnboardingSessionById } from "@/db/queries/onboarding-queries";
import { isPlatformAdmin } from "@/lib/platform-admin";
import {
  generateReminderSchedule,
  ReminderSchedule,
} from "@/lib/reminder-scheduler";
import { getReminderEmailTemplate } from "@/lib/reminder-email-templates";
import { sendEmail } from "@/lib/email-service";

/**
 * Schedule reminders for a new onboarding session
 */
export async function scheduleRemindersAction(
  sessionId: string,
  scheduleType: ReminderSchedule = "standard"
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify platform admin
    if (!(await isPlatformAdmin())) {
      return { success: false, error: "Not authorized" };
    }

    // Get session details
    const session = await getOnboardingSessionById(sessionId);
    if (!session) {
      return { success: false, error: "Session not found" };
    }

    // Generate reminder schedule
    const schedule = generateReminderSchedule(
      new Date(session.createdAt),
      scheduleType
    );

    // Create reminder records
    const reminders = [];
    for (const { type, scheduledAt } of schedule) {
      const sessionData = {
        id: session.id,
        accessToken: session.accessToken,
        projectName: session.projectName || "your project",
        organizationName: session.organizationName || "Organization",
        completionPercentage: session.completionPercentage || 0,
        currentStep: session.currentStep || 0,
        totalSteps: session.totalSteps || 10,
        createdAt: new Date(session.createdAt),
        expiresAt: session.expiresAt ? new Date(session.expiresAt) : null,
      };

      const template = getReminderEmailTemplate(
        type,
        sessionData,
        session.clientName || "there"
      );

      const reminder = await createReminder({
        sessionId: session.id,
        reminderType: type,
        scheduledAt,
        emailSubject: template.subject,
        emailBody: template.htmlBody,
        metadata: { textBody: template.textBody },
      });

      reminders.push(reminder);
    }

    // Update session reminder settings
    await updateSessionReminderSettings(sessionId, {
      reminderSchedule: scheduleType,
      reminderEnabled: true,
    });

    revalidatePath(`/platform/onboarding/${sessionId}`);
    revalidatePath("/platform/onboarding");

    return {
      success: true,
      data: {
        remindersScheduled: reminders.length,
        reminders,
      },
    };
  } catch (error) {
    console.error("Error scheduling reminders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to schedule reminders",
    };
  }
}

/**
 * Send a manual reminder immediately
 */
export async function sendManualReminderAction(
  sessionId: string,
  customSubject?: string,
  customMessage?: string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify platform admin
    if (!(await isPlatformAdmin())) {
      return { success: false, error: "Not authorized" };
    }

    // Get session details
    const session = await getOnboardingSessionById(sessionId);
    if (!session) {
      return { success: false, error: "Session not found" };
    }

    if (!session.clientEmail) {
      return { success: false, error: "No client email found" };
    }

    const sessionData = {
      id: session.id,
      accessToken: session.accessToken,
      projectName: session.projectName || "your project",
      organizationName: session.organizationName || "Organization",
      completionPercentage: session.completionPercentage || 0,
      currentStep: session.currentStep || 0,
      totalSteps: session.totalSteps || 10,
      createdAt: new Date(session.createdAt),
      expiresAt: session.expiresAt ? new Date(session.expiresAt) : null,
    };

    // Get email template
    const template = customSubject && customMessage
      ? getReminderEmailTemplate(
          "custom",
          sessionData,
          session.clientName || "there",
          customSubject,
          customMessage
        )
      : getReminderEmailTemplate("gentle", sessionData, session.clientName || "there");

    // Create reminder record
    const reminder = await createReminder({
      sessionId: session.id,
      reminderType: customSubject ? "custom" : "gentle",
      scheduledAt: new Date(),
      emailSubject: template.subject,
      emailBody: template.htmlBody,
      metadata: { manual: true, textBody: template.textBody },
    });

    // Send email
    await sendEmail({
      to: session.clientEmail,
      subject: template.subject,
      html: template.htmlBody,
    });

    // Mark as sent
    await markReminderAsSent(reminder.id);

    revalidatePath(`/platform/onboarding/${sessionId}`);

    return {
      success: true,
      data: { reminderId: reminder.id },
    };
  } catch (error) {
    console.error("Error sending manual reminder:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send reminder",
    };
  }
}

/**
 * Cancel all pending reminders for a session
 */
export async function cancelRemindersAction(sessionId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify platform admin
    if (!(await isPlatformAdmin())) {
      return { success: false, error: "Not authorized" };
    }

    const cancelled = await cancelSessionReminders(sessionId);

    // Update session settings
    await updateSessionReminderSettings(sessionId, {
      reminderEnabled: false,
    });

    revalidatePath(`/platform/onboarding/${sessionId}`);
    revalidatePath("/platform/onboarding");

    return {
      success: true,
      data: { cancelledCount: cancelled.length },
    };
  } catch (error) {
    console.error("Error cancelling reminders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel reminders",
    };
  }
}

/**
 * Get reminder history for a session
 */
export async function getSessionRemindersAction(sessionId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify platform admin
    if (!(await isPlatformAdmin())) {
      return { success: false, error: "Not authorized" };
    }

    const reminders = await getSessionReminders(sessionId);

    return {
      success: true,
      data: reminders,
    };
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch reminders",
    };
  }
}

/**
 * Update reminder schedule for a session
 */
export async function updateReminderScheduleAction(
  sessionId: string,
  scheduleType: ReminderSchedule
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify platform admin
    if (!(await isPlatformAdmin())) {
      return { success: false, error: "Not authorized" };
    }

    // Cancel existing reminders
    await cancelSessionReminders(sessionId);

    // Schedule new reminders
    const result = await scheduleRemindersAction(sessionId, scheduleType);

    revalidatePath(`/platform/onboarding/${sessionId}`);

    return result;
  } catch (error) {
    console.error("Error updating reminder schedule:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update schedule",
    };
  }
}

/**
 * Get reminder analytics
 */
export async function getReminderAnalyticsAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify platform admin
    if (!(await isPlatformAdmin())) {
      return { success: false, error: "Not authorized" };
    }

    const stats = await getReminderStats();

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch analytics",
    };
  }
}
