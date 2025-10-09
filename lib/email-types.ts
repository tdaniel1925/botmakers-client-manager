/**
 * Email System - Core TypeScript Types
 * Comprehensive type definitions for the AI-powered email client
 */

// ============================================================================
// Email Account Types
// ============================================================================

export type EmailProvider = 'gmail' | 'microsoft' | 'imap' | 'yahoo' | 'aol' | 'custom';
export type EmailAuthType = 'oauth' | 'password';
export type EmailAccountStatus = 'active' | 'inactive' | 'error' | 'syncing';

export interface EmailAccount {
  id: string;
  userId: string;
  provider: EmailProvider;
  authType: EmailAuthType;
  emailAddress: string;
  displayName?: string;
  
  // OAuth fields (Gmail, Microsoft)
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  
  // IMAP/SMTP fields (encrypted)
  imapHost?: string;
  imapPort?: number;
  imapUsername?: string;
  imapPassword?: string; // Encrypted
  imapUseSsl?: boolean;
  
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string; // Encrypted
  smtpUseSsl?: boolean;
  
  // Sync state
  status: EmailAccountStatus;
  lastSyncAt?: Date;
  lastSyncError?: string;
  lastUid?: number; // For IMAP incremental sync
  
  // Webhook/Push notification
  webhookSubscriptionId?: string;
  webhookExpiresAt?: Date;
  
  // Settings
  signature?: string;
  replyToEmail?: string;
  isDefault: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Email Message Types
// ============================================================================

export interface EmailAddress {
  name?: string;
  email: string;
}

export interface EmailMessage {
  id: string;
  accountId: string;
  userId: string;
  threadId?: string;
  
  // Message identifiers
  messageId: string; // RFC 2822 Message-ID
  externalId?: string; // Provider-specific ID (Gmail ID, MS Graph ID)
  inReplyTo?: string;
  references?: string[];
  
  // Headers
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress[];
  
  subject: string;
  snippet?: string; // First ~150 chars for previews
  
  // Body
  bodyText?: string;
  bodyHtml?: string;
  
  // Metadata
  receivedAt: Date;
  sentAt?: Date;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  isSnoozed: boolean;
  snoozeUntil?: Date;
  
  // Flags
  hasAttachments: boolean;
  isDraft: boolean;
  isSent: boolean;
  isTrash: boolean;
  isSpam: boolean;
  isArchived: boolean;
  
  // Labels/folders
  labelIds: string[];
  folderName?: string;
  
  // AI features
  aiSummaryId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  sentiment?: 'positive' | 'neutral' | 'negative';
  category?: string;
  
  // Raw data
  rawHeaders?: Record<string, string>;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Email Thread Types
// ============================================================================

export interface EmailThread {
  id: string;
  accountId: string;
  userId: string;
  
  // Thread metadata
  subject: string;
  snippet?: string;
  participants: EmailAddress[];
  
  // Stats
  messageCount: number;
  unreadCount: number;
  
  // Flags
  isStarred: boolean;
  isMuted: boolean;
  hasAttachments: boolean;
  
  // Timestamps
  firstMessageAt: Date;
  lastMessageAt: Date;
  
  // AI features
  aiSummaryId?: string;
  keyPoints?: string[];
  actionItems?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Email Attachment Types
// ============================================================================

export interface EmailAttachment {
  id: string;
  emailId: string;
  userId: string;
  
  filename: string;
  mimeType: string;
  size: number; // bytes
  
  // Storage
  storageUrl?: string; // UploadThing CDN URL
  externalId?: string; // Provider attachment ID
  contentId?: string; // For inline images
  
  isInline: boolean;
  
  createdAt: Date;
}

// ============================================================================
// Email Label Types
// ============================================================================

export interface EmailLabel {
  id: string;
  accountId: string;
  userId: string;
  
  name: string;
  color?: string;
  isSystemLabel: boolean;
  
  // Provider sync
  externalId?: string; // Gmail label ID, Outlook category ID
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Email AI Summary Types
// ============================================================================

export interface EmailAISummary {
  id: string;
  emailId?: string;
  threadId?: string;
  userId: string;
  
  summaryText: string;
  keyPoints?: string[];
  actionItems?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  suggestedReply?: string;
  
  // Caching
  expiresAt: Date;
  
  createdAt: Date;
}

// ============================================================================
// Email Sync Log Types
// ============================================================================

export type SyncStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type SyncType = 'full' | 'incremental' | 'webhook' | 'manual';

export interface EmailSyncLog {
  id: string;
  accountId: string;
  userId: string;
  
  syncType: SyncType;
  status: SyncStatus;
  
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
  
  // Stats
  emailsFetched: number;
  emailsProcessed: number;
  emailsSkipped: number;
  emailsFailed: number;
  
  // Error tracking
  errorMessage?: string;
  errorStack?: string;
  
  createdAt: Date;
}

// ============================================================================
// Email Draft Types
// ============================================================================

export type DraftSource = 'user' | 'ai_suggestion' | 'ai_autonomous';

export interface EmailDraft {
  id: string;
  accountId: string;
  userId: string;
  threadId?: string;
  inReplyToEmailId?: string;
  
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  
  // AI metadata
  source: DraftSource;
  aiPrompt?: string;
  aiConfidence?: number;
  
  // Scheduling
  scheduledSendAt?: Date;
  
  // Status
  isSent: boolean;
  sentAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Email Search & Filter Types
// ============================================================================

export interface EmailSearchQuery {
  query?: string;
  from?: string;
  to?: string;
  subject?: string;
  hasAttachment?: boolean;
  isUnread?: boolean;
  isStarred?: boolean;
  labelIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  
  // AI-powered semantic search
  semanticQuery?: string;
}

export interface EmailSearchResult {
  emails: EmailMessage[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

// ============================================================================
// Email Operation Types
// ============================================================================

export interface EmailBulkOperation {
  emailIds: string[];
  operation: 'mark_read' | 'mark_unread' | 'star' | 'unstar' | 'archive' | 'trash' | 'delete' | 'label' | 'move';
  labelId?: string;
  folderName?: string;
}

// ============================================================================
// Email Compose Types
// ============================================================================

export interface EmailComposeRequest {
  accountId: string;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  attachments?: File[];
  inReplyTo?: string;
  threadId?: string;
  scheduleSendAt?: Date;
}

// ============================================================================
// AI Copilot Types
// ============================================================================

export interface EmailCopilotAction {
  type: 'summarize' | 'draft_reply' | 'search' | 'schedule' | 'remind' | 'categorize';
  emailId?: string;
  threadId?: string;
  parameters?: Record<string, any>;
}

export interface EmailCopilotResponse {
  message: string;
  action?: {
    type: string;
    data: any;
  };
  suggestedActions?: EmailCopilotAction[];
}

// ============================================================================
// Email Statistics Types
// ============================================================================

export interface EmailAccountStats {
  accountId: string;
  totalEmails: number;
  unreadCount: number;
  inboxCount: number;
  sentCount: number;
  draftCount: number;
  archivedCount: number;
  trashCount: number;
  lastSyncAt?: Date;
}

