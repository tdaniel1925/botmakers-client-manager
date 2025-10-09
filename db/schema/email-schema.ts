/**
 * Email System Database Schema
 * All 8 tables for the AI-powered email client
 */

import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  varchar,
  index,
} from "drizzle-orm/pg-core";

// ============================================================================
// Enums
// ============================================================================

export const emailProviderEnum = pgEnum("email_provider", [
  "gmail",
  "microsoft",
  "imap",
  "yahoo",
  "aol",
  "custom",
]);

export const emailAuthTypeEnum = pgEnum("email_auth_type", ["oauth", "password"]);

export const emailAccountStatusEnum = pgEnum("email_account_status", [
  "active",
  "inactive",
  "error",
  "syncing",
]);

export const syncStatusEnum = pgEnum("sync_status", [
  "pending",
  "in_progress",
  "completed",
  "failed",
]);

export const syncTypeEnum = pgEnum("sync_type", [
  "full",
  "incremental",
  "webhook",
  "manual",
]);

export const draftSourceEnum = pgEnum("draft_source", [
  "user",
  "ai_suggestion",
  "ai_autonomous",
]);

export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "urgent"]);

export const sentimentEnum = pgEnum("sentiment", ["positive", "neutral", "negative"]);

// ============================================================================
// Email Accounts Table
// ============================================================================

export const emailAccountsTable = pgTable(
  "email_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(), // Clerk user ID
    provider: emailProviderEnum("provider").notNull(),
    authType: emailAuthTypeEnum("auth_type").notNull(),
    emailAddress: varchar("email_address", { length: 255 }).notNull(),
    displayName: text("display_name"),

    // OAuth fields (encrypted)
    accessToken: text("access_token"), // Encrypted
    refreshToken: text("refresh_token"), // Encrypted
    tokenExpiresAt: timestamp("token_expires_at"),

    // IMAP/SMTP fields (encrypted)
    imapHost: varchar("imap_host", { length: 255 }),
    imapPort: integer("imap_port"),
    imapUsername: varchar("imap_username", { length: 255 }),
    imapPassword: text("imap_password"), // Encrypted
    imapUseSsl: boolean("imap_use_ssl").default(true),

    smtpHost: varchar("smtp_host", { length: 255 }),
    smtpPort: integer("smtp_port"),
    smtpUsername: varchar("smtp_username", { length: 255 }),
    smtpPassword: text("smtp_password"), // Encrypted
    smtpUseSsl: boolean("smtp_use_ssl").default(true),

    // Sync state
    status: emailAccountStatusEnum("status").notNull().default("active"),
    lastSyncAt: timestamp("last_sync_at"),
    lastSyncError: text("last_sync_error"),
    lastUid: integer("last_uid"), // For IMAP incremental sync

    // Webhook/Push notifications
    webhookSubscriptionId: text("webhook_subscription_id"),
    webhookExpiresAt: timestamp("webhook_expires_at"),

    // Settings
    signature: text("signature"),
    replyToEmail: varchar("reply_to_email", { length: 255 }),
    isDefault: boolean("is_default").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("email_accounts_user_id_idx").on(table.userId),
    emailAddressIdx: index("email_accounts_email_address_idx").on(table.emailAddress),
    statusIdx: index("email_accounts_status_idx").on(table.status),
  })
);

// ============================================================================
// Emails Table
// ============================================================================

export const emailsTable = pgTable(
  "emails",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => emailAccountsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    threadId: uuid("thread_id").references(() => emailThreadsTable.id, {
      onDelete: "set null",
    }),

    // Message identifiers
    messageId: text("message_id").notNull(), // RFC 2822 Message-ID
    externalId: text("external_id"), // Provider-specific ID
    inReplyTo: text("in_reply_to"),
    references: jsonb("references").$type<string[]>().default([]),

    // Headers (JSONB for flexibility)
    fromAddress: jsonb("from_address")
      .$type<{ name?: string; email: string }>()
      .notNull(),
    toAddresses: jsonb("to_addresses")
      .$type<{ name?: string; email: string }[]>()
      .notNull(),
    ccAddresses: jsonb("cc_addresses").$type<{ name?: string; email: string }[]>(),
    bccAddresses: jsonb("bcc_addresses").$type<{ name?: string; email: string }[]>(),
    replyToAddresses: jsonb("reply_to_addresses").$type<
      { name?: string; email: string }[]
    >(),

    subject: text("subject").notNull(),
    snippet: text("snippet"), // First ~150 chars

    // Body
    bodyText: text("body_text"),
    bodyHtml: text("body_html"),

    // Metadata
    receivedAt: timestamp("received_at").notNull(),
    sentAt: timestamp("sent_at"),
    isRead: boolean("is_read").default(false).notNull(),
    isStarred: boolean("is_starred").default(false).notNull(),
    isImportant: boolean("is_important").default(false).notNull(),
    isSnoozed: boolean("is_snoozed").default(false).notNull(),
    snoozeUntil: timestamp("snooze_until"),

    // Flags
    hasAttachments: boolean("has_attachments").default(false).notNull(),
    isDraft: boolean("is_draft").default(false).notNull(),
    isSent: boolean("is_sent").default(false).notNull(),
    isTrash: boolean("is_trash").default(false).notNull(),
    isSpam: boolean("is_spam").default(false).notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),

    // Labels/folders
    labelIds: jsonb("label_ids").$type<string[]>().default([]),
    folderName: varchar("folder_name", { length: 100 }),

    // AI features
    aiSummaryId: uuid("ai_summary_id").references(() => emailAISummariesTable.id, {
      onDelete: "set null",
    }),
    priority: priorityEnum("priority"),
    sentiment: sentimentEnum("sentiment"),
    category: varchar("category", { length: 100 }),

    // Raw data
    rawHeaders: jsonb("raw_headers").$type<Record<string, string>>(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    accountIdIdx: index("emails_account_id_idx").on(table.accountId),
    userIdIdx: index("emails_user_id_idx").on(table.userId),
    threadIdIdx: index("emails_thread_id_idx").on(table.threadId),
    messageIdIdx: index("emails_message_id_idx").on(table.messageId),
    receivedAtIdx: index("emails_received_at_idx").on(table.receivedAt),
    isReadIdx: index("emails_is_read_idx").on(table.isRead),
    folderNameIdx: index("emails_folder_name_idx").on(table.folderName),
  })
);

// ============================================================================
// Email Threads Table
// ============================================================================

export const emailThreadsTable = pgTable(
  "email_threads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => emailAccountsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),

    // Thread metadata
    subject: text("subject").notNull(),
    snippet: text("snippet"),
    participants: jsonb("participants")
      .$type<{ name?: string; email: string }[]>()
      .notNull(),

    // Stats
    messageCount: integer("message_count").default(0).notNull(),
    unreadCount: integer("unread_count").default(0).notNull(),

    // Flags
    isStarred: boolean("is_starred").default(false).notNull(),
    isMuted: boolean("is_muted").default(false).notNull(),
    hasAttachments: boolean("has_attachments").default(false).notNull(),

    // Timestamps
    firstMessageAt: timestamp("first_message_at").notNull(),
    lastMessageAt: timestamp("last_message_at").notNull(),

    // AI features
    aiSummaryId: uuid("ai_summary_id").references(() => emailAISummariesTable.id, {
      onDelete: "set null",
    }),
    keyPoints: jsonb("key_points").$type<string[]>(),
    actionItems: jsonb("action_items").$type<string[]>(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    accountIdIdx: index("email_threads_account_id_idx").on(table.accountId),
    userIdIdx: index("email_threads_user_id_idx").on(table.userId),
    lastMessageAtIdx: index("email_threads_last_message_at_idx").on(
      table.lastMessageAt
    ),
  })
);

// ============================================================================
// Email Attachments Table
// ============================================================================

export const emailAttachmentsTable = pgTable(
  "email_attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    emailId: uuid("email_id")
      .notNull()
      .references(() => emailsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),

    filename: varchar("filename", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    size: integer("size").notNull(), // bytes

    // Storage
    storageUrl: text("storage_url"), // UploadThing CDN URL
    externalId: text("external_id"), // Provider attachment ID
    contentId: text("content_id"), // For inline images

    isInline: boolean("is_inline").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdIdx: index("email_attachments_email_id_idx").on(table.emailId),
    userIdIdx: index("email_attachments_user_id_idx").on(table.userId),
  })
);

// ============================================================================
// Email Labels Table
// ============================================================================

export const emailLabelsTable = pgTable(
  "email_labels",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => emailAccountsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),

    name: varchar("name", { length: 100 }).notNull(),
    color: varchar("color", { length: 7 }), // Hex color code
    isSystemLabel: boolean("is_system_label").default(false).notNull(),

    // Provider sync
    externalId: text("external_id"), // Gmail label ID, Outlook category ID

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    accountIdIdx: index("email_labels_account_id_idx").on(table.accountId),
    userIdIdx: index("email_labels_user_id_idx").on(table.userId),
    nameIdx: index("email_labels_name_idx").on(table.name),
  })
);

// ============================================================================
// Email AI Summaries Table
// ============================================================================

export const emailAISummariesTable = pgTable(
  "email_ai_summaries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    emailId: uuid("email_id").references(() => emailsTable.id, {
      onDelete: "cascade",
    }),
    threadId: uuid("thread_id").references(() => emailThreadsTable.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id").notNull(),

    summaryText: text("summary_text").notNull(),
    keyPoints: jsonb("key_points").$type<string[]>(),
    actionItems: jsonb("action_items").$type<string[]>(),
    sentiment: sentimentEnum("sentiment"),
    urgency: priorityEnum("urgency"),
    suggestedReply: text("suggested_reply"),

    // Caching
    expiresAt: timestamp("expires_at").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdIdx: index("email_ai_summaries_email_id_idx").on(table.emailId),
    threadIdIdx: index("email_ai_summaries_thread_id_idx").on(table.threadId),
    userIdIdx: index("email_ai_summaries_user_id_idx").on(table.userId),
    expiresAtIdx: index("email_ai_summaries_expires_at_idx").on(table.expiresAt),
  })
);

// ============================================================================
// Email Sync Logs Table
// ============================================================================

export const emailSyncLogsTable = pgTable(
  "email_sync_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => emailAccountsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),

    syncType: syncTypeEnum("sync_type").notNull(),
    status: syncStatusEnum("status").notNull().default("pending"),

    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    duration: integer("duration"), // milliseconds

    // Stats
    emailsFetched: integer("emails_fetched").default(0).notNull(),
    emailsProcessed: integer("emails_processed").default(0).notNull(),
    emailsSkipped: integer("emails_skipped").default(0).notNull(),
    emailsFailed: integer("emails_failed").default(0).notNull(),

    // Error tracking
    errorMessage: text("error_message"),
    errorStack: text("error_stack"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    accountIdIdx: index("email_sync_logs_account_id_idx").on(table.accountId),
    userIdIdx: index("email_sync_logs_user_id_idx").on(table.userId),
    statusIdx: index("email_sync_logs_status_idx").on(table.status),
    startedAtIdx: index("email_sync_logs_started_at_idx").on(table.startedAt),
  })
);

// ============================================================================
// Email Drafts Table
// ============================================================================

export const emailDraftsTable = pgTable(
  "email_drafts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => emailAccountsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    threadId: uuid("thread_id").references(() => emailThreadsTable.id, {
      onDelete: "set null",
    }),
    inReplyToEmailId: uuid("in_reply_to_email_id").references(() => emailsTable.id, {
      onDelete: "set null",
    }),

    toAddresses: jsonb("to_addresses")
      .$type<{ name?: string; email: string }[]>()
      .notNull(),
    ccAddresses: jsonb("cc_addresses").$type<{ name?: string; email: string }[]>(),
    bccAddresses: jsonb("bcc_addresses").$type<{ name?: string; email: string }[]>(),
    subject: text("subject").notNull(),
    bodyText: text("body_text"),
    bodyHtml: text("body_html"),

    // AI metadata
    source: draftSourceEnum("source").notNull().default("user"),
    aiPrompt: text("ai_prompt"),
    aiConfidence: integer("ai_confidence"), // 0-100

    // Scheduling
    scheduledSendAt: timestamp("scheduled_send_at"),

    // Status
    isSent: boolean("is_sent").default(false).notNull(),
    sentAt: timestamp("sent_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    accountIdIdx: index("email_drafts_account_id_idx").on(table.accountId),
    userIdIdx: index("email_drafts_user_id_idx").on(table.userId),
    threadIdIdx: index("email_drafts_thread_id_idx").on(table.threadId),
    isSentIdx: index("email_drafts_is_sent_idx").on(table.isSent),
    scheduledSendAtIdx: index("email_drafts_scheduled_send_at_idx").on(
      table.scheduledSendAt
    ),
  })
);

// ============================================================================
// Type Exports
// ============================================================================

export type InsertEmailAccount = typeof emailAccountsTable.$inferInsert;
export type SelectEmailAccount = typeof emailAccountsTable.$inferSelect;

export type InsertEmail = typeof emailsTable.$inferInsert;
export type SelectEmail = typeof emailsTable.$inferSelect;

export type InsertEmailThread = typeof emailThreadsTable.$inferInsert;
export type SelectEmailThread = typeof emailThreadsTable.$inferSelect;

export type InsertEmailAttachment = typeof emailAttachmentsTable.$inferInsert;
export type SelectEmailAttachment = typeof emailAttachmentsTable.$inferSelect;

export type InsertEmailLabel = typeof emailLabelsTable.$inferInsert;
export type SelectEmailLabel = typeof emailLabelsTable.$inferSelect;

export type InsertEmailAISummary = typeof emailAISummariesTable.$inferInsert;
export type SelectEmailAISummary = typeof emailAISummariesTable.$inferSelect;

export type InsertEmailSyncLog = typeof emailSyncLogsTable.$inferInsert;
export type SelectEmailSyncLog = typeof emailSyncLogsTable.$inferSelect;

export type InsertEmailDraft = typeof emailDraftsTable.$inferInsert;
export type SelectEmailDraft = typeof emailDraftsTable.$inferSelect;

