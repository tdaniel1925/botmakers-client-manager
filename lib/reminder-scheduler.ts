/**
 * Reminder Scheduler
 * Manages scheduling and sending of onboarding reminder emails
 */

import { addDays, addHours, isBefore, isAfter } from "date-fns";

export type ReminderType = "initial" | "gentle" | "encouragement" | "final" | "custom";
export type ReminderSchedule = "standard" | "aggressive" | "gentle" | "custom";

export interface ReminderScheduleConfig {
  type: ReminderType;
  daysAfterCreation: number;
  hoursAfterCreation?: number;
}

/**
 * Get reminder schedule based on schedule type
 */
export function getReminderSchedule(
  scheduleType: ReminderSchedule
): ReminderScheduleConfig[] {
  const schedules: Record<ReminderSchedule, ReminderScheduleConfig[]> = {
    standard: [
      { type: "gentle", daysAfterCreation: 2 },
      { type: "encouragement", daysAfterCreation: 5 },
      { type: "final", daysAfterCreation: 7 },
    ],
    aggressive: [
      { type: "gentle", daysAfterCreation: 1 },
      { type: "encouragement", daysAfterCreation: 3 },
      { type: "final", daysAfterCreation: 5 },
    ],
    gentle: [
      { type: "gentle", daysAfterCreation: 3 },
      { type: "encouragement", daysAfterCreation: 7 },
      { type: "final", daysAfterCreation: 10 },
    ],
    custom: [],
  };

  return schedules[scheduleType];
}

/**
 * Calculate scheduled time for a reminder
 */
export function calculateScheduledTime(
  sessionCreatedAt: Date,
  config: ReminderScheduleConfig
): Date {
  let scheduledAt = addDays(sessionCreatedAt, config.daysAfterCreation);
  
  if (config.hoursAfterCreation) {
    scheduledAt = addHours(scheduledAt, config.hoursAfterCreation);
  }
  
  return scheduledAt;
}

/**
 * Check if a reminder should be sent
 * Returns false if:
 * - Session is completed
 * - Client is actively working (lastActivityAt within 1 hour)
 * - Reminder already sent
 * - Session has expired
 */
export function shouldSendReminder(
  sessionStatus: string,
  lastActivityAt: Date | null,
  expiresAt: Date | null
): boolean {
  // Don't send if completed
  if (sessionStatus === "completed") {
    return false;
  }

  // Don't send if expired
  if (expiresAt && isAfter(new Date(), expiresAt)) {
    return false;
  }

  // Don't send if client is actively working (within last hour)
  if (lastActivityAt) {
    const oneHourAgo = addHours(new Date(), -1);
    if (isAfter(lastActivityAt, oneHourAgo)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a reminder is due to be sent
 */
export function isReminderDue(scheduledAt: Date): boolean {
  return isBefore(scheduledAt, new Date());
}

/**
 * Generate reminder schedule for a session
 */
export function generateReminderSchedule(
  sessionCreatedAt: Date,
  scheduleType: ReminderSchedule,
  customSchedule?: ReminderScheduleConfig[]
): Array<{ type: ReminderType; scheduledAt: Date }> {
  const configs =
    scheduleType === "custom" && customSchedule
      ? customSchedule
      : getReminderSchedule(scheduleType);

  return configs.map((config) => ({
    type: config.type,
    scheduledAt: calculateScheduledTime(sessionCreatedAt, config),
  }));
}

/**
 * Get next reminder to send
 */
export function getNextReminder(
  sessionCreatedAt: Date,
  scheduleType: ReminderSchedule,
  sentReminderTypes: ReminderType[]
): { type: ReminderType; scheduledAt: Date } | null {
  const schedule = generateReminderSchedule(sessionCreatedAt, scheduleType);

  // Find next reminder that hasn't been sent and is due
  for (const reminder of schedule) {
    if (
      !sentReminderTypes.includes(reminder.type) &&
      isReminderDue(reminder.scheduledAt)
    ) {
      return reminder;
    }
  }

  return null;
}

/**
 * Calculate days until reminder expires
 */
export function daysUntilExpiration(expiresAt: Date | null): number | null {
  if (!expiresAt) return null;

  const now = new Date();
  const diffTime = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

/**
 * Format reminder type for display
 */
export function formatReminderType(type: ReminderType): string {
  const labels: Record<ReminderType, string> = {
    initial: "Initial Invitation",
    gentle: "Gentle Reminder",
    encouragement: "Encouragement",
    final: "Final Reminder",
    custom: "Custom Reminder",
  };

  return labels[type] || type;
}

/**
 * Get recommended schedule based on session characteristics
 */
export function getRecommendedSchedule(
  projectPriority?: "low" | "medium" | "high" | "critical",
  projectBudget?: number
): ReminderSchedule {
  // Aggressive schedule for high-priority or high-budget projects
  if (projectPriority === "critical" || projectPriority === "high") {
    return "aggressive";
  }

  if (projectBudget && projectBudget > 50000) {
    return "aggressive";
  }

  // Gentle schedule for low-priority projects
  if (projectPriority === "low") {
    return "gentle";
  }

  // Standard for everything else
  return "standard";
}
