/**
 * Email Database Queries
 * CRUD operations for emails, threads, attachments, labels, and drafts
 */

import { db } from "../index";
import {
  emailsTable,
  emailThreadsTable,
  emailAttachmentsTable,
  emailLabelsTable,
  emailDraftsTable,
  type InsertEmail,
  type SelectEmail,
  type InsertEmailThread,
  type SelectEmailThread,
  type InsertEmailAttachment,
  type SelectEmailAttachment,
  type InsertEmailLabel,
  type SelectEmailLabel,
  type InsertEmailDraft,
  type SelectEmailDraft,
} from "../schema/email-schema";
import { eq, and, desc, asc, gte, lte, or, inArray, sql, count } from "drizzle-orm";

// ============================================================================
// Emails - Create
// ============================================================================

export async function createEmail(data: InsertEmail): Promise<SelectEmail> {
  const [email] = await db.insert(emailsTable).values(data).returning();
  return email;
}

export async function createEmailsBatch(emails: InsertEmail[]): Promise<SelectEmail[]> {
  if (emails.length === 0) return [];
  return await db.insert(emailsTable).values(emails).returning();
}

// ============================================================================
// Emails - Read
// ============================================================================

export async function getEmailById(id: string): Promise<SelectEmail | undefined> {
  const [email] = await db
    .select()
    .from(emailsTable)
    .where(eq(emailsTable.id, id))
    .limit(1);
  return email;
}

export async function getEmailByMessageId(
  accountId: string,
  messageId: string
): Promise<SelectEmail | undefined> {
  const [email] = await db
    .select()
    .from(emailsTable)
    .where(
      and(
        eq(emailsTable.accountId, accountId),
        eq(emailsTable.messageId, messageId)
      )
    )
    .limit(1);
  return email;
}

export async function getEmailsByAccountId(
  accountId: string,
  limit: number = 50,
  offset: number = 0
): Promise<SelectEmail[]> {
  return await db
    .select()
    .from(emailsTable)
    .where(eq(emailsTable.accountId, accountId))
    .orderBy(desc(emailsTable.receivedAt))
    .limit(limit)
    .offset(offset);
}

export async function getEmailsByUserId(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<SelectEmail[]> {
  return await db
    .select()
    .from(emailsTable)
    .where(eq(emailsTable.userId, userId))
    .orderBy(desc(emailsTable.receivedAt))
    .limit(limit)
    .offset(offset);
}

export async function getEmailsByThreadId(threadId: string): Promise<SelectEmail[]> {
  return await db
    .select()
    .from(emailsTable)
    .where(eq(emailsTable.threadId, threadId))
    .orderBy(asc(emailsTable.receivedAt));
}

export async function getEmailsByFolder(
  accountId: string,
  folderName: string,
  limit: number = 50,
  offset: number = 0
): Promise<SelectEmail[]> {
  return await db
    .select()
    .from(emailsTable)
    .where(
      and(
        eq(emailsTable.accountId, accountId),
        eq(emailsTable.folderName, folderName)
      )
    )
    .orderBy(desc(emailsTable.receivedAt))
    .limit(limit)
    .offset(offset);
}

export async function getUnreadEmails(
  accountId: string,
  limit: number = 50
): Promise<SelectEmail[]> {
  return await db
    .select()
    .from(emailsTable)
    .where(
      and(
        eq(emailsTable.accountId, accountId),
        eq(emailsTable.isRead, false),
        eq(emailsTable.isTrash, false),
        eq(emailsTable.isSpam, false)
      )
    )
    .orderBy(desc(emailsTable.receivedAt))
    .limit(limit);
}

export async function getSnoozedEmails(accountId: string): Promise<SelectEmail[]> {
  const now = new Date();
  return await db
    .select()
    .from(emailsTable)
    .where(
      and(
        eq(emailsTable.accountId, accountId),
        eq(emailsTable.isSnoozed, true),
        lte(emailsTable.snoozeUntil!, now)
      )
    )
    .orderBy(asc(emailsTable.snoozeUntil));
}

// ============================================================================
// Emails - Update
// ============================================================================

export async function updateEmail(
  id: string,
  data: Partial<InsertEmail>
): Promise<SelectEmail | undefined> {
  const [updated] = await db
    .update(emailsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(emailsTable.id, id))
    .returning();
  return updated;
}

export async function markEmailAsRead(id: string, isRead: boolean = true): Promise<void> {
  await db
    .update(emailsTable)
    .set({ isRead, updatedAt: new Date() })
    .where(eq(emailsTable.id, id));
}

export async function markEmailsAsRead(ids: string[], isRead: boolean = true): Promise<void> {
  if (ids.length === 0) return;
  await db
    .update(emailsTable)
    .set({ isRead, updatedAt: new Date() })
    .where(inArray(emailsTable.id, ids));
}

export async function starEmail(id: string, isStarred: boolean = true): Promise<void> {
  await db
    .update(emailsTable)
    .set({ isStarred, updatedAt: new Date() })
    .where(eq(emailsTable.id, id));
}

export async function snoozeEmail(id: string, snoozeUntil: Date): Promise<void> {
  await db
    .update(emailsTable)
    .set({
      isSnoozed: true,
      snoozeUntil,
      isArchived: true,
      updatedAt: new Date(),
    })
    .where(eq(emailsTable.id, id));
}

export async function unsnoozeEmail(id: string): Promise<void> {
  await db
    .update(emailsTable)
    .set({
      isSnoozed: false,
      snoozeUntil: null,
      isArchived: false,
      updatedAt: new Date(),
    })
    .where(eq(emailsTable.id, id));
}

export async function archiveEmail(id: string): Promise<void> {
  await db
    .update(emailsTable)
    .set({ isArchived: true, updatedAt: new Date() })
    .where(eq(emailsTable.id, id));
}

export async function moveEmailToTrash(id: string): Promise<void> {
  await db
    .update(emailsTable)
    .set({ isTrash: true, updatedAt: new Date() })
    .where(eq(emailsTable.id, id));
}

export async function moveEmailsToTrash(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await db
    .update(emailsTable)
    .set({ isTrash: true, updatedAt: new Date() })
    .where(inArray(emailsTable.id, ids));
}

// ============================================================================
// Emails - Delete
// ============================================================================

export async function deleteEmail(id: string): Promise<void> {
  await db.delete(emailsTable).where(eq(emailsTable.id, id));
}

export async function deleteEmails(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await db.delete(emailsTable).where(inArray(emailsTable.id, ids));
}

// ============================================================================
// Email Threads - Create/Update
// ============================================================================

export async function createEmailThread(data: InsertEmailThread): Promise<SelectEmailThread> {
  const [thread] = await db.insert(emailThreadsTable).values(data).returning();
  return thread;
}

export async function getThreadById(id: string): Promise<SelectEmailThread | undefined> {
  const [thread] = await db
    .select()
    .from(emailThreadsTable)
    .where(eq(emailThreadsTable.id, id))
    .limit(1);
  return thread;
}

export async function getThreadsByAccountId(
  accountId: string,
  limit: number = 50,
  offset: number = 0
): Promise<SelectEmailThread[]> {
  return await db
    .select()
    .from(emailThreadsTable)
    .where(eq(emailThreadsTable.accountId, accountId))
    .orderBy(desc(emailThreadsTable.lastMessageAt))
    .limit(limit)
    .offset(offset);
}

export async function updateThread(
  id: string,
  data: Partial<InsertEmailThread>
): Promise<SelectEmailThread | undefined> {
  const [updated] = await db
    .update(emailThreadsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(emailThreadsTable.id, id))
    .returning();
  return updated;
}

export async function incrementThreadCounts(
  threadId: string,
  incrementUnread: boolean = false
): Promise<void> {
  const thread = await getThreadById(threadId);
  if (!thread) return;

  await db
    .update(emailThreadsTable)
    .set({
      messageCount: thread.messageCount + 1,
      unreadCount: incrementUnread ? thread.unreadCount + 1 : thread.unreadCount,
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(emailThreadsTable.id, threadId));
}

// ============================================================================
// Email Attachments
// ============================================================================

export async function createAttachment(
  data: InsertEmailAttachment
): Promise<SelectEmailAttachment> {
  const [attachment] = await db.insert(emailAttachmentsTable).values(data).returning();
  return attachment;
}

export async function getAttachmentsByEmailId(
  emailId: string
): Promise<SelectEmailAttachment[]> {
  return await db
    .select()
    .from(emailAttachmentsTable)
    .where(eq(emailAttachmentsTable.emailId, emailId));
}

export async function deleteAttachment(id: string): Promise<void> {
  await db.delete(emailAttachmentsTable).where(eq(emailAttachmentsTable.id, id));
}

// ============================================================================
// Email Labels
// ============================================================================

export async function createLabel(data: InsertEmailLabel): Promise<SelectEmailLabel> {
  const [label] = await db.insert(emailLabelsTable).values(data).returning();
  return label;
}

export async function getLabelsByAccountId(accountId: string): Promise<SelectEmailLabel[]> {
  return await db
    .select()
    .from(emailLabelsTable)
    .where(eq(emailLabelsTable.accountId, accountId))
    .orderBy(asc(emailLabelsTable.name));
}

export async function getLabelById(id: string): Promise<SelectEmailLabel | undefined> {
  const [label] = await db
    .select()
    .from(emailLabelsTable)
    .where(eq(emailLabelsTable.id, id))
    .limit(1);
  return label;
}

export async function updateLabel(
  id: string,
  data: Partial<InsertEmailLabel>
): Promise<SelectEmailLabel | undefined> {
  const [updated] = await db
    .update(emailLabelsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(emailLabelsTable.id, id))
    .returning();
  return updated;
}

export async function deleteLabel(id: string): Promise<void> {
  await db.delete(emailLabelsTable).where(eq(emailLabelsTable.id, id));
}

// ============================================================================
// Email Drafts
// ============================================================================

export async function createDraft(data: InsertEmailDraft): Promise<SelectEmailDraft> {
  const [draft] = await db.insert(emailDraftsTable).values(data).returning();
  return draft;
}

export async function getDraftsByAccountId(accountId: string): Promise<SelectEmailDraft[]> {
  return await db
    .select()
    .from(emailDraftsTable)
    .where(
      and(
        eq(emailDraftsTable.accountId, accountId),
        eq(emailDraftsTable.isSent, false)
      )
    )
    .orderBy(desc(emailDraftsTable.updatedAt));
}

export async function getDraftById(id: string): Promise<SelectEmailDraft | undefined> {
  const [draft] = await db
    .select()
    .from(emailDraftsTable)
    .where(eq(emailDraftsTable.id, id))
    .limit(1);
  return draft;
}

export async function updateDraft(
  id: string,
  data: Partial<InsertEmailDraft>
): Promise<SelectEmailDraft | undefined> {
  const [updated] = await db
    .update(emailDraftsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(emailDraftsTable.id, id))
    .returning();
  return updated;
}

export async function markDraftAsSent(id: string): Promise<void> {
  await db
    .update(emailDraftsTable)
    .set({
      isSent: true,
      sentAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(emailDraftsTable.id, id));
}

export async function deleteDraft(id: string): Promise<void> {
  await db.delete(emailDraftsTable).where(eq(emailDraftsTable.id, id));
}

export async function getScheduledDrafts(): Promise<SelectEmailDraft[]> {
  const now = new Date();
  return await db
    .select()
    .from(emailDraftsTable)
    .where(
      and(
        eq(emailDraftsTable.isSent, false),
        lte(emailDraftsTable.scheduledSendAt!, now)
      )
    )
    .orderBy(asc(emailDraftsTable.scheduledSendAt));
}

// ============================================================================
// Statistics
// ============================================================================

export async function getEmailStats(accountId: string) {
  const [stats] = await db
    .select({
      totalEmails: count(),
      unreadCount: sql<number>`COUNT(*) FILTER (WHERE is_read = false AND is_trash = false AND is_spam = false)`,
      inboxCount: sql<number>`COUNT(*) FILTER (WHERE folder_name = 'INBOX' AND is_trash = false)`,
      sentCount: sql<number>`COUNT(*) FILTER (WHERE is_sent = true)`,
      draftCount: sql<number>`COUNT(*) FILTER (WHERE is_draft = true)`,
      archivedCount: sql<number>`COUNT(*) FILTER (WHERE is_archived = true)`,
      trashCount: sql<number>`COUNT(*) FILTER (WHERE is_trash = true)`,
    })
    .from(emailsTable)
    .where(eq(emailsTable.accountId, accountId));

  return stats;
}

export async function getThreadStats(accountId: string) {
  const [stats] = await db
    .select({
      totalThreads: count(),
      unreadThreads: sql<number>`COUNT(*) FILTER (WHERE unread_count > 0)`,
      starredThreads: sql<number>`COUNT(*) FILTER (WHERE is_starred = true)`,
    })
    .from(emailThreadsTable)
    .where(eq(emailThreadsTable.accountId, accountId));

  return stats;
}

