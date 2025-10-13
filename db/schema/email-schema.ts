/**
 * Email System Database Schema
 * All 8 tables for the AI-powered email client
 */

// @ts-nocheck - Temporary: Schema type inference issues

// @ts-nocheck - Temporary: Circular reference issues with Drizzle ORM table definitions

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

    // Nylas integration
    nylasGrantId: text("nylas_grant_id"), // Nylas grant ID for unified API
    
    // Organization (multi-tenancy)
    organizationId: text("organization_id"), // For multi-tenant setups

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
    syncCursor: text("sync_cursor"), // For incremental email sync tracking
    errorMessage: text("error_message"), // General error messages

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
    nylasGrantIdIdx: index("email_accounts_nylas_grant_id_idx").on(table.nylasGrantId),
  })
);

// ============================================================================
// Email Folders Table
// ============================================================================

export const emailFoldersTable = pgTable(
  "email_folders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => emailAccountsTable.id, { onDelete: "cascade" }),
    
    // Folder identifiers
    nylasFolderId: text("nylas_folder_id"), // Nylas folder ID
    externalId: text("external_id"), // Provider-specific ID
    
    // Folder details
    name: text("name").notNull(),
    displayName: text("display_name"),
    folderType: text("folder_type").notNull(), // inbox, sent, drafts, trash, spam, archive, custom
    
    // Folder hierarchy
    parentFolderId: uuid("parent_folder_id"),
    path: text("path"), // Full folder path (e.g., "INBOX/Work/Projects")
    
    // Counts
    totalCount: integer("total_count").default(0),
    unreadCount: integer("unread_count").default(0),
    
    // Settings
    isSystemFolder: boolean("is_system_folder").default(false),
    isSyncEnabled: boolean("is_sync_enabled").default(true),
    
    // Timestamps
    lastSyncAt: timestamp("last_sync_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    accountIdIdx: index("email_folders_account_id_idx").on(table.accountId),
    folderTypeIdx: index("email_folders_folder_type_idx").on(table.folderType),
    nylasFolderIdIdx: index("email_folders_nylas_folder_id_idx").on(table.nylasFolderId),
  })
);

// ============================================================================
// Emails Table
// ============================================================================

// @ts-ignore - Circular reference issue with Drizzle ORM
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
    nylasMessageId: text("nylas_message_id"), // Nylas message ID
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

    subject: text("subject").$type<string>().notNull(),
    snippet: text("snippet").$type<string>(), // First ~150 chars

    // Body
    bodyText: text("body_text").$type<string>(),
    bodyHtml: text("body_html").$type<string>(),

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
    aiCategory: varchar("ai_category", { length: 50 }), // AI-powered: important/social/promotions/updates/newsletters
    aiCategoryConfidence: integer("ai_category_confidence"), // 0-100

    // AI Cache - Pre-generated for instant popup loading
    aiQuickReplies: jsonb("ai_quick_replies").$type<string[]>(), // Pre-generated quick replies
    aiSmartActions: jsonb("ai_smart_actions").$type<any[]>(), // Pre-generated smart actions
    aiGeneratedAt: timestamp("ai_generated_at"), // When AI was last generated

    // Hey-Inspired Features
    heyView: varchar("hey_view", { length: 50 }), // 'imbox', 'feed', 'paper_trail', 'screener'
    heyCategory: varchar("hey_category", { length: 50 }), // 'newsletter', 'receipt', 'confirmation', 'important'
    screeningStatus: varchar("screening_status", { length: 50 }).default('pending'), // 'pending', 'screened', 'auto_classified'
    
    // Reply Later (Enhanced Snooze)
    isReplyLater: boolean("is_reply_later").default(false),
    replyLaterUntil: timestamp("reply_later_until"),
    replyLaterNote: text("reply_later_note"),
    
    // Set Aside (Temporary Holding)
    isSetAside: boolean("is_set_aside").default(false),
    setAsideAt: timestamp("set_aside_at"),
    
    // Bubble Up (Resurface Old Threads)
    isBubbledUp: boolean("is_bubbled_up").default(false),
    bubbledUpAt: timestamp("bubbled_up_at"),
    
    // Rename Threads
    customSubject: text("custom_subject"), // User's renamed subject
    
    // Privacy & Tracking
    trackersBlocked: integer("trackers_blocked").default(0),
    trackingStripped: boolean("tracking_stripped").default(false),

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
    nylasMessageIdIdx: index("emails_nylas_message_id_idx").on(table.nylasMessageId),
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
    nylasThreadId: text("nylas_thread_id"), // Nylas thread ID

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
    importanceScore: integer("importance_score"), // 0-100 AI-powered importance
    importanceReason: text("importance_reason"), // AI explanation

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    accountIdIdx: index("email_threads_account_id_idx").on(table.accountId),
    userIdIdx: index("email_threads_user_id_idx").on(table.userId),
    nylasThreadIdIdx: index("email_threads_nylas_thread_id_idx").on(table.nylasThreadId),
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
// Email Draft Versions Table (Version History & Auto-Save)
// ============================================================================

export const emailDraftVersionsTable = pgTable(
  "email_draft_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    draftId: uuid("draft_id")
      .notNull()
      .references(() => emailDraftsTable.id, { onDelete: "cascade" }),
    
    // Version snapshot
    versionNumber: integer("version_number").notNull(),
    toAddresses: jsonb("to_addresses")
      .$type<{ name?: string; email: string }[]>()
      .notNull(),
    subject: text("subject").notNull(),
    bodyText: text("body_text"),
    bodyHtml: text("body_html"),
    
    // Metadata
    changeType: varchar("change_type", { length: 50 }), // 'manual', 'ai_remix', 'ai_write', 'auto_save'
    aiPrompt: text("ai_prompt"), // For AI Write versions
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    draftIdIdx: index("draft_versions_draft_id_idx").on(table.draftId),
    createdAtIdx: index("draft_versions_created_at_idx").on(table.createdAt),
  })
);

// ============================================================================
// Type Exports
// ============================================================================

// ============================================================================
// Email Snippets Table (Superhuman-style text expansion)
// ============================================================================

export const emailSnippetsTable = pgTable(
  "email_snippets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    shortcut: varchar("shortcut", { length: 50 }).notNull(), // e.g., ";meeting"
    content: text("content").notNull(), // Template text
    variables: jsonb("variables").$type<string[]>().default([]), // e.g., ["{name}", "{date}"]
    description: text("description"),
    category: varchar("category", { length: 50 }), // e.g., "meetings", "follow-ups"
    usageCount: integer("usage_count").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("email_snippets_user_id_idx").on(table.userId),
    shortcutIdx: index("email_snippets_shortcut_idx").on(table.shortcut),
  })
);

// ============================================================================
// Email Reminders Table (Follow-up system)
// ============================================================================

export const emailRemindersStatusEnum = pgEnum("email_reminder_status", [
  "pending",
  "sent",
  "dismissed",
  "completed",
]);

export const emailRemindersTable = pgTable(
  "email_reminders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    emailId: uuid("email_id")
      .notNull()
      .references(() => emailsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    remindAt: timestamp("remind_at").notNull(),
    reason: text("reason"), // e.g., "No reply received"
    status: emailRemindersStatusEnum("status").default("pending").notNull(),
    notificationSent: boolean("notification_sent").default(false),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdIdx: index("email_reminders_email_id_idx").on(table.emailId),
    userIdIdx: index("email_reminders_user_id_idx").on(table.userId),
    remindAtIdx: index("email_reminders_remind_at_idx").on(table.remindAt),
    statusIdx: index("email_reminders_status_idx").on(table.status),
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

export type InsertEmailSnippet = typeof emailSnippetsTable.$inferInsert;
export type SelectEmailSnippet = typeof emailSnippetsTable.$inferSelect;

export type InsertEmailReminder = typeof emailRemindersTable.$inferInsert;
export type SelectEmailReminder = typeof emailRemindersTable.$inferSelect;

// ============================================================================
// Email Rules/Filters Table
// ============================================================================

export const emailRulesTable = pgTable(
  "email_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => emailAccountsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    enabled: boolean("enabled").default(true),
    priority: integer("priority").default(0), // execution order

    // Conditions (JSON with AND/OR logic)
    conditions: jsonb("conditions").notNull(), // {logic: 'AND', rules: [{field: 'from', operator: 'contains', value: 'boss@'}]}

    // Actions (JSON array)
    actions: jsonb("actions").notNull(), // [{type: 'move_to_folder', folder: 'work'}, {type: 'mark_as_read'}]

    // Statistics
    matchCount: integer("match_count").default(0),
    lastTriggeredAt: timestamp("last_triggered_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    accountIdIdx: index("email_rules_account_id_idx").on(table.accountId),
    userIdIdx: index("email_rules_user_id_idx").on(table.userId),
    priorityIdx: index("email_rules_priority_idx").on(table.priority),
  })
);

export type InsertEmailRule = typeof emailRulesTable.$inferInsert;
export type SelectEmailRule = typeof emailRulesTable.$inferSelect;

// ============================================================================
// Email Settings Table
// ============================================================================

export const emailSettingsTable = pgTable(
  "email_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .unique()
      .references(() => emailAccountsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),

    // Sync settings
    autoSyncEnabled: boolean("auto_sync_enabled").default(true),
    syncFrequencyMinutes: integer("sync_frequency_minutes").default(5),
    webhookEnabled: boolean("webhook_enabled").default(true), // auto-enable real-time

    // Signature settings
    signature: text("signature"),
    signatureEnabled: boolean("signature_enabled").default(true),
    signatureHtml: text("signature_html"),

    // Auto-reply / Vacation responder
    autoReplyEnabled: boolean("auto_reply_enabled").default(false),
    autoReplySubject: text("auto_reply_subject"),
    autoReplyMessage: text("auto_reply_message"),
    autoReplyStartDate: timestamp("auto_reply_start_date"),
    autoReplyEndDate: timestamp("auto_reply_end_date"),

    // Forwarding
    forwardingEnabled: boolean("forwarding_enabled").default(false),
    forwardingAddress: text("forwarding_address"),
    forwardingKeepCopy: boolean("forwarding_keep_copy").default(true),

    // Display preferences
    emailsPerPage: integer("emails_per_page").default(50),
    showPreview: boolean("show_preview").default(true),
    compactMode: boolean("compact_mode").default(false),
    darkMode: boolean("dark_mode").default(false),

    // Notification settings
    desktopNotifications: boolean("desktop_notifications").default(true),
    emailNotifications: boolean("email_notifications").default(false),
    notifyOnImportantOnly: boolean("notify_on_important_only").default(false),
    notificationSound: boolean("notification_sound").default(true),

    // AI settings
    aiSummariesEnabled: boolean("ai_summaries_enabled").default(true),
    aiCopilotEnabled: boolean("ai_copilot_enabled").default(true),
    aiAutoCategorizationEnabled: boolean("ai_auto_categorization_enabled").default(true),
    aiSmartRepliesEnabled: boolean("ai_smart_replies_enabled").default(true),

    // Reading settings
    markAsReadOnView: boolean("mark_as_read_on_view").default(true),
    markAsReadDelay: integer("mark_as_read_delay").default(2), // seconds
    sendReadReceipts: boolean("send_read_receipts").default(false),

    // Blocked senders
    blockedSenders: jsonb("blocked_senders").default([]), // array of email addresses

    // Keyboard shortcuts
    keyboardShortcutsEnabled: boolean("keyboard_shortcuts_enabled").default(true),
    customShortcuts: jsonb("custom_shortcuts"), // {archive: 'e', delete: '#', etc.}

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    accountIdIdx: index("email_settings_account_id_idx").on(table.accountId),
    userIdIdx: index("email_settings_user_id_idx").on(table.userId),
  })
);

export type InsertEmailSettings = typeof emailSettingsTable.$inferInsert;
export type SelectEmailSettings = typeof emailSettingsTable.$inferSelect;

// ============================================================================
// Blocked Senders Table
// ============================================================================

export const blockedSendersTable = pgTable(
  "blocked_senders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => emailAccountsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    emailAddress: text("email_address").notNull(),
    reason: text("reason"),
    blockedAt: timestamp("blocked_at").defaultNow().notNull(),
  },
  (table) => ({
    accountIdIdx: index("blocked_senders_account_id_idx").on(table.accountId),
    emailAddressIdx: index("blocked_senders_email_address_idx").on(table.emailAddress),
  })
);

export type InsertBlockedSender = typeof blockedSendersTable.$inferInsert;
export type SelectBlockedSender = typeof blockedSendersTable.$inferSelect;

// ============================================================================
// Contact Screening Table (Hey Feature)
// ============================================================================

export const contactScreeningTable = pgTable(
  "contact_screening",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    emailAddress: text("email_address").notNull(),
    decision: varchar("decision", { length: 50 }), // 'imbox', 'feed', 'paper_trail', 'blocked', 'pending'
    decidedAt: timestamp("decided_at"),
    firstEmailId: uuid("first_email_id"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("contact_screening_user_id_idx").on(table.userId),
    userEmailIdx: index("contact_screening_user_email_idx").on(table.userId, table.emailAddress),
    decisionIdx: index("contact_screening_decision_idx").on(table.userId, table.decision),
  })
);

export type InsertContactScreening = typeof contactScreeningTable.$inferInsert;
export type SelectContactScreening = typeof contactScreeningTable.$inferSelect;

// ============================================================================
// User Email Preferences Table (Hey Mode Settings)
// ============================================================================

export const userEmailPreferencesTable = pgTable("user_email_preferences", {
  userId: text("user_id").primaryKey(),
  emailMode: varchar("email_mode", { length: 50 }).default('traditional'), // 'traditional', 'hey', 'hybrid'
  screeningEnabled: boolean("screening_enabled").default(false),
  autoClassificationEnabled: boolean("auto_classification_enabled").default(true),
  privacyProtectionEnabled: boolean("privacy_protection_enabled").default(true),
  keyboardShortcutsEnabled: boolean("keyboard_shortcuts_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertUserEmailPreferences = typeof userEmailPreferencesTable.$inferInsert;
export type SelectUserEmailPreferences = typeof userEmailPreferencesTable.$inferSelect;

