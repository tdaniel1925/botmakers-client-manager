/**
 * Contacts & Reminders Schema
 * Database schema for contact management and email-based reminders
 */

// @ts-nocheck - Temporary: Schema type inference issues

import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  varchar,
  index,
  integer,
} from "drizzle-orm/pg-core";

// ============================================================================
// Enums
// ============================================================================

export const contactSourceEnum = pgEnum("contact_source", [
  "email",
  "manual",
  "import",
  "calendar",
]);

export const emailReminderMethodEnum = pgEnum("email_reminder_method", [
  "email",
  "sms",
  "both",
]);

export const emailReminderStatusEnum = pgEnum("email_reminder_status", [
  "pending",
  "sent",
  "failed",
  "cancelled",
  "completed",
]);

export const aiActionTypeEnum = pgEnum("ai_action_type", [
  "add_to_calendar",
  "set_reminder",
  "save_receipt",
  "create_task",
  "save_contact",
  "book_meeting",
  "reply_later",
  "set_aside",
]);

// ============================================================================
// EMAIL CONTACTS TABLE (for email client)
// ============================================================================

export const emailContactsTable = pgTable(
  "email_contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    organizationId: text("organization_id"),

    // Contact details
    email: varchar("email", { length: 255 }).notNull(),
    name: text("name"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    displayName: text("display_name"),

    // Additional info
    phone: varchar("phone", { length: 50 }),
    company: text("company"),
    jobTitle: text("job_title"),
    notes: text("notes"),
    tags: jsonb("tags").$type<string[]>(), // Array of tags

    // Avatar/photo
    avatarUrl: text("avatar_url"),
    photoData: text("photo_data"), // Base64 or URL

    // Social/links
    linkedinUrl: text("linkedin_url"),
    twitterHandle: text("twitter_handle"),
    website: text("website"),

    // Address
    address: jsonb("address").$type<{
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    }>(),

    // Email statistics
    emailCount: integer("email_count").default(0),
    lastEmailedAt: timestamp("last_emailed_at"),
    lastEmailSubject: text("last_email_subject"),

    // Source
    source: contactSourceEnum("source").default("email"),
    sourceEmailId: uuid("source_email_id"), // The email that created this contact

    // Status
    isFavorite: boolean("is_favorite").default(false),
    isBlocked: boolean("is_blocked").default(false),

    // Custom fields
    customFields: jsonb("custom_fields").$type<Record<string, any>>(),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("email_contacts_user_id_idx").on(table.userId),
    emailIdx: index("email_contacts_email_idx").on(table.email),
    nameIdx: index("email_contacts_name_idx").on(table.name),
    companyIdx: index("email_contacts_company_idx").on(table.company),
  })
);

// ============================================================================
// CONTACT GROUPS TABLE
// ============================================================================

export const contactGroupsTable = pgTable(
  "contact_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    organizationId: text("organization_id"),

    // Group details
    name: text("name").notNull(),
    description: text("description"),
    color: varchar("color", { length: 7 }).default("#3B82F6"),

    // Settings
    isDefault: boolean("is_default").default(false),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("contact_groups_user_id_idx").on(table.userId),
  })
);

// ============================================================================
// CONTACT GROUP MEMBERS TABLE
// ============================================================================

export const contactGroupMembersTable = pgTable(
  "contact_group_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id").notNull().references(() => contactGroupsTable.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id").notNull().references(() => emailContactsTable.id, { onDelete: "cascade" }),

    // Metadata
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => ({
    groupIdIdx: index("contact_group_members_group_id_idx").on(table.groupId),
    contactIdIdx: index("contact_group_members_contact_id_idx").on(table.contactId),
  })
);

// ============================================================================
// AI EMAIL REMINDERS TABLE (for AI contextual actions)
// ============================================================================

export const aiEmailRemindersTable = pgTable(
  "ai_email_reminders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    emailId: uuid("email_id"), // Reference to the email

    // Reminder details
    title: text("title").notNull(),
    description: text("description"),
    reminderAt: timestamp("reminder_at").notNull(),
    method: emailReminderMethodEnum("method").default("email"),

    // Status
    status: emailReminderStatusEnum("status").default("pending"),
    sentAt: timestamp("sent_at"),
    completedAt: timestamp("completed_at"),

    // Recurring
    isRecurring: boolean("is_recurring").default(false),
    recurrenceRule: text("recurrence_rule"), // Cron format or RRULE

    // Metadata
    metadata: jsonb("metadata").$type<Record<string, any>>(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("ai_email_reminders_user_id_idx").on(table.userId),
    emailIdIdx: index("ai_email_reminders_email_id_idx").on(table.emailId),
    reminderAtIdx: index("ai_email_reminders_reminder_at_idx").on(table.reminderAt),
    statusIdx: index("ai_email_reminders_status_idx").on(table.status),
  })
);

// ============================================================================
// USER SMS SETTINGS TABLE
// ============================================================================

export const userSmsSettingsTable = pgTable(
  "user_sms_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().unique(),

    // Phone details
    phoneNumber: varchar("phone_number", { length: 20 }),
    phoneNumberVerified: boolean("phone_number_verified").default(false),
    verificationCode: varchar("verification_code", { length: 10 }),
    verificationExpiry: timestamp("verification_expiry"),

    // Settings
    smsEnabled: boolean("sms_enabled").default(false),
    smsReminderEnabled: boolean("sms_reminder_enabled").default(true),

    // Twilio details (encrypted)
    twilioAccountSid: text("twilio_account_sid"),
    twilioAuthToken: text("twilio_auth_token"),
    twilioPhoneNumber: text("twilio_phone_number"),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("user_sms_settings_user_id_idx").on(table.userId),
  })
);

// ============================================================================
// AI CONTEXTUAL ACTIONS CACHE TABLE
// ============================================================================

export const aiContextualActionsTable = pgTable(
  "ai_contextual_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    emailId: uuid("email_id").notNull(),
    userId: text("user_id").notNull(),

    // AI Analysis Results
    actions: jsonb("actions").$type<Array<{
      type: string;
      label: string;
      icon: string;
      data: Record<string, any>;
      confidence: number;
    }>>(),

    // Extracted data
    extractedEvents: jsonb("extracted_events").$type<Array<{
      title: string;
      startTime: string;
      endTime: string;
      location?: string;
      description?: string;
    }>>(),

    extractedContacts: jsonb("extracted_contacts").$type<Array<{
      name?: string;
      email?: string;
      phone?: string;
      company?: string;
    }>>(),

    extractedTasks: jsonb("extracted_tasks").$type<Array<{
      title: string;
      description?: string;
      dueDate?: string;
      priority?: string;
    }>>(),

    // Analysis metadata
    analysisModel: varchar("analysis_model", { length: 50 }),
    confidence: integer("confidence"), // 0-100
    tokensUsed: integer("tokens_used"),

    // Cache control
    expiresAt: timestamp("expires_at"), // Cache expiry (e.g., 24 hours)

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdIdx: index("ai_contextual_actions_email_id_idx").on(table.emailId),
    userIdIdx: index("ai_contextual_actions_user_id_idx").on(table.userId),
    expiresAtIdx: index("ai_contextual_actions_expires_at_idx").on(table.expiresAt),
  })
);

// ============================================================================
// Type Exports
// ============================================================================

export type InsertEmailContact = typeof emailContactsTable.$inferInsert;
export type SelectEmailContact = typeof emailContactsTable.$inferSelect;

export type InsertContactGroup = typeof contactGroupsTable.$inferInsert;
export type SelectContactGroup = typeof contactGroupsTable.$inferSelect;

export type InsertContactGroupMember = typeof contactGroupMembersTable.$inferInsert;
export type SelectContactGroupMember = typeof contactGroupMembersTable.$inferSelect;

export type InsertAiEmailReminder = typeof aiEmailRemindersTable.$inferInsert;
export type SelectAiEmailReminder = typeof aiEmailRemindersTable.$inferSelect;

export type InsertUserSmsSettings = typeof userSmsSettingsTable.$inferInsert;
export type SelectUserSmsSettings = typeof userSmsSettingsTable.$inferSelect;

export type InsertAiContextualAction = typeof aiContextualActionsTable.$inferInsert;
export type SelectAiContextualAction = typeof aiContextualActionsTable.$inferSelect;

