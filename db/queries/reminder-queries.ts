/**
 * Reminder Queries
 * Database queries for onboarding reminder management
 */

import { db } from "../db";
import { onboardingRemindersTable, clientOnboardingSessionsTable } from "../schema";
import { eq, and, isNull, lt, desc } from "drizzle-orm";

export type ReminderStatus = "pending" | "sent" | "failed" | "cancelled";
export type ReminderType = "initial" | "gentle" | "encouragement" | "final" | "custom";

/**
 * Create a new reminder
 */
export async function createReminder(data: {
  sessionId: string;
  reminderType: ReminderType;
  scheduledAt: Date;
  emailSubject: string;
  emailBody: string;
  metadata?: Record<string, any>;
}) {
  const [reminder] = await db
    .insert(onboardingRemindersTable)
    .values({
      sessionId: data.sessionId,
      reminderType: data.reminderType,
      scheduledAt: data.scheduledAt,
      status: "pending",
      emailSubject: data.emailSubject,
      emailBody: data.emailBody,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    })
    .returning();

  return reminder;
}

/**
 * Get all reminders for a session
 */
export async function getSessionReminders(sessionId: string) {
  return await db
    .select()
    .from(onboardingRemindersTable)
    .where(eq(onboardingRemindersTable.sessionId, sessionId))
    .orderBy(desc(onboardingRemindersTable.scheduledAt));
}

/**
 * Get pending reminders that are due
 */
export async function getDueReminders(limit: number = 100) {
  const now = new Date();

  return await db
    .select({
      reminder: onboardingRemindersTable,
      session: clientOnboardingSessionsTable,
    })
    .from(onboardingRemindersTable)
    .leftJoin(
      clientOnboardingSessionsTable,
      eq(onboardingRemindersTable.sessionId, clientOnboardingSessionsTable.id)
    )
    .where(
      and(
        eq(onboardingRemindersTable.status, "pending"),
        isNull(onboardingRemindersTable.sentAt),
        lt(onboardingRemindersTable.scheduledAt, now)
      )
    )
    .orderBy(onboardingRemindersTable.scheduledAt)
    .limit(limit);
}

/**
 * Mark reminder as sent
 */
export async function markReminderAsSent(reminderId: string) {
  const [updated] = await db
    .update(onboardingRemindersTable)
    .set({
      status: "sent",
      sentAt: new Date(),
    })
    .where(eq(onboardingRemindersTable.id, reminderId))
    .returning();

  return updated;
}

/**
 * Mark reminder as failed
 */
export async function markReminderAsFailed(reminderId: string, error?: string) {
  const metadata = error ? JSON.stringify({ error }) : null;

  const [updated] = await db
    .update(onboardingRemindersTable)
    .set({
      status: "failed",
      metadata,
    })
    .where(eq(onboardingRemindersTable.id, reminderId))
    .returning();

  return updated;
}

/**
 * Cancel all pending reminders for a session
 */
export async function cancelSessionReminders(sessionId: string) {
  return await db
    .update(onboardingRemindersTable)
    .set({
      status: "cancelled",
    })
    .where(
      and(
        eq(onboardingRemindersTable.sessionId, sessionId),
        eq(onboardingRemindersTable.status, "pending")
      )
    )
    .returning();
}

/**
 * Get reminder statistics for analytics
 */
export async function getReminderStats() {
  const reminders = await db.select().from(onboardingRemindersTable);

  const stats = {
    total: reminders.length,
    byStatus: {
      pending: reminders.filter((r) => r.status === "pending").length,
      sent: reminders.filter((r) => r.status === "sent").length,
      failed: reminders.filter((r) => r.status === "failed").length,
      cancelled: reminders.filter((r) => r.status === "cancelled").length,
    },
    byType: {
      initial: reminders.filter((r) => r.reminderType === "initial").length,
      gentle: reminders.filter((r) => r.reminderType === "gentle").length,
      encouragement: reminders.filter((r) => r.reminderType === "encouragement").length,
      final: reminders.filter((r) => r.reminderType === "final").length,
      custom: reminders.filter((r) => r.reminderType === "custom").length,
    },
    opened: reminders.filter((r) => r.openedAt !== null).length,
    clicked: reminders.filter((r) => r.clickedAt !== null).length,
  };

  // Calculate rates
  const sentCount = stats.byStatus.sent;
  stats["openRate"] = sentCount > 0 ? ((stats.opened / sentCount) * 100).toFixed(1) + "%" : "0%";
  stats["clickRate"] = sentCount > 0 ? ((stats.clicked / sentCount) * 100).toFixed(1) + "%" : "0%";

  return stats;
}

/**
 * Track reminder email open
 */
export async function trackReminderOpen(reminderId: string) {
  const [updated] = await db
    .update(onboardingRemindersTable)
    .set({
      openedAt: new Date(),
    })
    .where(eq(onboardingRemindersTable.id, reminderId))
    .returning();

  return updated;
}

/**
 * Track reminder email click
 */
export async function trackReminderClick(reminderId: string) {
  const [updated] = await db
    .update(onboardingRemindersTable)
    .set({
      clickedAt: new Date(),
    })
    .where(eq(onboardingRemindersTable.id, reminderId))
    .returning();

  return updated;
}

/**
 * Delete old reminders (for cleanup)
 */
export async function deleteOldReminders(daysOld: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return await db
    .delete(onboardingRemindersTable)
    .where(
      and(
        lt(onboardingRemindersTable.createdAt, cutoffDate),
        eq(onboardingRemindersTable.status, "sent")
      )
    )
    .returning();
}

/**
 * Get reminder by ID
 */
export async function getReminderById(reminderId: string) {
  const [reminder] = await db
    .select()
    .from(onboardingRemindersTable)
    .where(eq(onboardingRemindersTable.id, reminderId))
    .limit(1);

  return reminder || null;
}

/**
 * Update session reminder settings
 */
export async function updateSessionReminderSettings(
  sessionId: string,
  settings: {
    reminderSchedule?: "standard" | "aggressive" | "gentle" | "custom";
    reminderEnabled?: boolean;
  }
) {
  const [updated] = await db
    .update(clientOnboardingSessionsTable)
    .set(settings)
    .where(eq(clientOnboardingSessionsTable.id, sessionId))
    .returning();

  return updated;
}

/**
 * Increment reminder count for session
 */
export async function incrementReminderCount(sessionId: string) {
  const [session] = await db
    .select()
    .from(clientOnboardingSessionsTable)
    .where(eq(clientOnboardingSessionsTable.id, sessionId))
    .limit(1);

  if (!session) return null;

  const [updated] = await db
    .update(clientOnboardingSessionsTable)
    .set({
      reminderCount: (session.reminderCount || 0) + 1,
      lastReminderSentAt: new Date(),
    })
    .where(eq(clientOnboardingSessionsTable.id, sessionId))
    .returning();

  return updated;
}
