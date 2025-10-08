/**
 * Reminder Schema
 * Database schema for onboarding reminder system
 */

import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { clientOnboardingSessionsTable, reminderScheduleEnum } from "./onboarding-schema";

// Reminder type enum
export const reminderTypeEnum = pgEnum("reminder_type", [
  "initial",
  "gentle",
  "encouragement",
  "final",
  "custom"
]);

// Reminder status enum
export const reminderStatusEnum = pgEnum("reminder_status", [
  "pending",
  "sent",
  "failed",
  "cancelled"
]);

// Onboarding reminders table
export const onboardingRemindersTable = pgTable("onboarding_reminders", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => clientOnboardingSessionsTable.id, { onDelete: "cascade" }),
  
  // Reminder details
  reminderType: reminderTypeEnum("reminder_type").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  sentAt: timestamp("sent_at"),
  status: reminderStatusEnum("status").notNull().default("pending"),
  
  // Email content
  emailSubject: text("email_subject"),
  emailBody: text("email_body"),
  
  // Additional data
  metadata: jsonb("metadata"),
  
  // Tracking
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type InsertOnboardingReminder = typeof onboardingRemindersTable.$inferInsert;
export type SelectOnboardingReminder = typeof onboardingRemindersTable.$inferSelect;
