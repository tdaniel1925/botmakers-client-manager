/**
 * Email Operations Server Actions
 * Core email management operations (read, delete, archive, etc.)
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/db';
import { emailsTable, emailAccountsTable, emailLabelsTable, emailThreadsTable, emailAttachmentsTable } from '@/db/schema/email-schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { SelectEmail, SelectEmailAttachment } from '@/db/schema/email-schema';

interface ActionResult<T = void> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Get all emails for a specific account
 * OPTIMIZED: Fetches only essential fields initially for fast loading
 */
export async function getEmailsAction(
  accountId: string,
  options?: {
    limit?: number;
    offset?: number;
    folder?: string;
  }
): Promise<ActionResult<{ emails: SelectEmail[]; hasMore: boolean }>> {
  try {
    console.log('🚀 getEmailsAction: Starting, accountId:', accountId);
    
    const authResult = await auth();
    const { userId } = authResult;
    if (!userId) {
      console.log('❌ getEmailsAction: No userId in auth result');
      return { success: false, error: 'Unauthorized - No user ID' };
    }

    console.log('🔍 getEmailsAction: Fetching emails for account:', { accountId, userId: userId.substring(0, 10) + '...' });

    // Verify account ownership
    const account = await db.query.emailAccountsTable.findFirst({
      where: and(
        eq(emailAccountsTable.id, accountId),
        eq(emailAccountsTable.userId, userId)
      ),
    });

    if (!account) {
      console.log('❌ getEmailsAction: Account not found');
      return { success: false, error: 'Account not found' };
    }

    console.log('✅ getEmailsAction: Account verified, fetching emails...');

    const limit = options?.limit || 50; // Load 50 emails initially (Gmail-style pagination)
    const offset = options?.offset || 0;

    console.log(`📊 Fetching emails with limit: ${limit}, offset: ${offset}`);

    const startTime = performance.now();

    // Fetch emails with pagination - FAST query (no joins)
    const emailList = await db.query.emailsTable.findMany({
      where: eq(emailsTable.accountId, accountId),
      orderBy: [desc(emailsTable.receivedAt)],
      limit: limit + 1, // Fetch one extra to check if there are more
      offset,
    });

    const queryTime = performance.now() - startTime;
    console.log(`⚡ Database query took ${queryTime.toFixed(2)}ms`);

    const hasMore = emailList.length > limit;
    const emails = hasMore ? emailList.slice(0, limit) : emailList;

    console.log('✅ getEmailsAction: Query complete, found emails:', emails.length, 'hasMore:', hasMore);
    
    // Debug: Count by heyView
    const viewCounts = {
      imbox: emails.filter(e => e.heyView === 'imbox').length,
      feed: emails.filter(e => e.heyView === 'feed').length,
      paper_trail: emails.filter(e => e.heyView === 'paper_trail').length,
      null: emails.filter(e => !e.heyView).length,
    };
    console.log('📊 Loaded emails by view:', viewCounts);

    // Force revalidation to ensure fresh data
    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      data: { emails, hasMore },
    };
  } catch (error: any) {
    console.error('❌ getEmailsAction: Exception caught:', {
      message: error?.message,
      stack: error?.stack,
      error: error
    });
    return {
      success: false,
      error: error?.message || 'Failed to fetch emails',
    };
  }
}

/**
 * Get a single email by ID
 */
export async function getEmailAction(emailId: string): Promise<ActionResult<{ email: SelectEmail }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const email = await db.query.emailsTable.findFirst({
      where: eq(emailsTable.id, emailId),
      with: {
        account: true,
        thread: true,
        attachments: true,
      },
    });

    if (!email) {
      return { success: false, error: 'Email not found' };
    }

    // Verify ownership through account
    if (email.account.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    return {
      success: true,
      data: { email },
    };
  } catch (error) {
    console.error('Error fetching email:', error);
    return {
      success: false,
      error: 'Failed to fetch email',
    };
  }
}

/**
 * Mark email as read/unread
 */
export async function markEmailReadAction(
  emailId: string,
  isRead: boolean
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const email = await db.query.emailsTable.findFirst({
      where: eq(emailsTable.id, emailId),
      with: { account: true },
    });

    if (!email || email.account.userId !== userId) {
      return { success: false, error: 'Email not found' };
    }

    await db
      .update(emailsTable)
      .set({ 
        isRead,
        updatedAt: new Date(),
      })
      .where(eq(emailsTable.id, emailId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      message: `Email marked as ${isRead ? 'read' : 'unread'}`,
    };
  } catch (error) {
    console.error('Error updating email:', error);
    return {
      success: false,
      error: 'Failed to update email',
    };
  }
}

/**
 * Star/unstar an email
 */
export async function toggleStarEmailAction(emailId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const email = await db.query.emailsTable.findFirst({
      where: eq(emailsTable.id, emailId),
      with: { account: true },
    });

    if (!email || email.account.userId !== userId) {
      return { success: false, error: 'Email not found' };
    }

    await db
      .update(emailsTable)
      .set({ 
        isStarred: !email.isStarred,
        updatedAt: new Date(),
      })
      .where(eq(emailsTable.id, emailId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      message: email.isStarred ? 'Removed star' : 'Starred email',
    };
  } catch (error) {
    console.error('Error toggling star:', error);
    return {
      success: false,
      error: 'Failed to toggle star',
    };
  }
}

/**
 * Archive an email
 */
export async function archiveEmailAction(emailId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const email = await db.query.emailsTable.findFirst({
      where: eq(emailsTable.id, emailId),
      with: { account: true },
    });

    if (!email || email.account.userId !== userId) {
      return { success: false, error: 'Email not found' };
    }

    await db
      .update(emailsTable)
      .set({ 
        folder: 'ARCHIVE',
        updatedAt: new Date(),
      })
      .where(eq(emailsTable.id, emailId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      message: 'Email archived',
    };
  } catch (error) {
    console.error('Error archiving email:', error);
    return {
      success: false,
      error: 'Failed to archive email',
    };
  }
}

/**
 * Delete an email (move to trash)
 */
export async function deleteEmailAction(emailId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const email = await db.query.emailsTable.findFirst({
      where: eq(emailsTable.id, emailId),
      with: { account: true },
    });

    if (!email || email.account.userId !== userId) {
      return { success: false, error: 'Email not found' };
    }

    if (email.folder === 'TRASH') {
      // Permanently delete if already in trash
      await db.delete(emailsTable).where(eq(emailsTable.id, emailId));
    } else {
      // Move to trash
      await db
        .update(emailsTable)
        .set({ 
          folder: 'TRASH',
          updatedAt: new Date(),
        })
        .where(eq(emailsTable.id, emailId));
    }

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      message: email.folder === 'TRASH' ? 'Email deleted permanently' : 'Email moved to trash',
    };
  } catch (error) {
    console.error('Error deleting email:', error);
    return {
      success: false,
      error: 'Failed to delete email',
    };
  }
}

/**
 * Bulk operations on multiple emails
 */
export async function bulkEmailOperationAction(
  emailIds: string[],
  operation: 'read' | 'unread' | 'archive' | 'delete' | 'star' | 'unstar'
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify all emails belong to user
    const emailList = await db.query.emailsTable.findMany({
      where: sql`${emailsTable.id} IN (${sql.join(emailIds.map((id) => sql`${id}`), sql`, `)})`,
      with: { account: true },
    });

    if (emailList.some((email) => email.account.userId !== userId)) {
      return { success: false, error: 'Unauthorized' };
    }

    // Perform operation
    switch (operation) {
      case 'read':
        await db
          .update(emailsTable)
          .set({ isRead: true, updatedAt: new Date() })
          .where(sql`${emailsTable.id} IN (${sql.join(emailIds.map((id) => sql`${id}`), sql`, `)})`);
        break;
      
      case 'unread':
        await db
          .update(emailsTable)
          .set({ isRead: false, updatedAt: new Date() })
          .where(sql`${emailsTable.id} IN (${sql.join(emailIds.map((id) => sql`${id}`), sql`, `)})`);
        break;
      
      case 'archive':
        await db
          .update(emailsTable)
          .set({ folder: 'ARCHIVE', updatedAt: new Date() })
          .where(sql`${emailsTable.id} IN (${sql.join(emailIds.map((id) => sql`${id}`), sql`, `)})`);
        break;
      
      case 'delete':
        await db
          .update(emailsTable)
          .set({ folder: 'TRASH', updatedAt: new Date() })
          .where(sql`${emailsTable.id} IN (${sql.join(emailIds.map((id) => sql`${id}`), sql`, `)})`);
        break;
      
      case 'star':
        await db
          .update(emailsTable)
          .set({ isStarred: true, updatedAt: new Date() })
          .where(sql`${emailsTable.id} IN (${sql.join(emailIds.map((id) => sql`${id}`), sql`, `)})`);
        break;
      
      case 'unstar':
        await db
          .update(emailsTable)
          .set({ isStarred: false, updatedAt: new Date() })
          .where(sql`${emailsTable.id} IN (${sql.join(emailIds.map((id) => sql`${id}`), sql`, `)})`);
        break;
    }

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      message: `${emailIds.length} emails updated`,
    };
  } catch (error) {
    console.error('Error in bulk operation:', error);
    return {
      success: false,
      error: 'Failed to perform bulk operation',
    };
  }
}

/**
 * Get all folders for a specific email account
 */
export async function getEmailFoldersAction(accountId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify account ownership
    const account = await db.query.emailAccountsTable.findFirst({
      where: and(
        eq(emailAccountsTable.id, accountId),
        eq(emailAccountsTable.userId, userId)
      ),
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Import the folders table
    const { getEmailFoldersByAccountId } = await import('@/db/queries/email-queries');
    
    // Get folders from database
    const folders = await getEmailFoldersByAccountId(accountId);
    
    return {
      success: true,
      folders,
    };
  } catch (error) {
    console.error('Error getting folders:', error);
    return {
      success: false,
      error: 'Failed to get folders',
    };
  }
}

/**
 * Get thread message count for emails
 * Returns a map of threadId -> count
 */
export async function getThreadCountsAction(
  accountId: string,
  threadIds: string[]
): Promise<ActionResult<Record<string, number>>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify account ownership
    const account = await db.query.emailAccountsTable.findFirst({
      where: and(
        eq(emailAccountsTable.id, accountId),
        eq(emailAccountsTable.userId, userId)
      ),
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // If no thread IDs provided, return empty
    if (threadIds.length === 0) {
      return { success: true, data: {} };
    }

    // Count emails per thread
    const threadCounts: Record<string, number> = {};
    
    for (const threadId of threadIds) {
      const count = await db
        .select({ count: sql<number>`count(*)` })
        .from(emailsTable)
        .where(
          and(
            eq(emailsTable.accountId, accountId),
            eq(emailsTable.threadId, threadId)
          )
        );
      
      threadCounts[threadId] = Number(count[0]?.count || 0);
    }

    return {
      success: true,
      data: threadCounts,
    };
  } catch (error) {
    console.error('Error getting thread counts:', error);
    return {
      success: false,
      error: 'Failed to get thread counts',
    };
  }
}

/**
 * Get attachments for an email
 */
export async function getEmailAttachmentsAction(emailId: string): Promise<ActionResult<{ attachments: SelectEmailAttachment[] }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const attachments = await db
      .select()
      .from(emailAttachmentsTable)
      .where(
        and(
          eq(emailAttachmentsTable.emailId, emailId),
          eq(emailAttachmentsTable.userId, userId)
        )
      );

    return {
      success: true,
      data: { attachments },
    };
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return {
      success: false,
      error: 'Failed to fetch attachments',
    };
  }
}

// Alias exports for backward compatibility
export { markEmailReadAction as markAsReadAction };
export { toggleStarEmailAction as toggleStarAction };
