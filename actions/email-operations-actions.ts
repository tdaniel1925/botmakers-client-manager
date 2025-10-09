/**
 * Email Operations Server Actions
 * Core email management operations (read, delete, archive, etc.)
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { emails, emailAccounts, emailLabels, emailThreads } from '@/db/schema/email-schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { SelectEmail } from '@/db/schema/email-schema';

interface ActionResult<T = void> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Get all emails for a specific account
 */
export async function getEmailsAction(accountId: string): Promise<ActionResult<{ emails: SelectEmail[] }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify account ownership
    const account = await db.query.emailAccounts.findFirst({
      where: and(
        eq(emailAccounts.id, accountId),
        eq(emailAccounts.userId, userId)
      ),
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Fetch emails with pagination (limit to 100 most recent)
    const emailList = await db.query.emails.findMany({
      where: eq(emails.accountId, accountId),
      orderBy: [desc(emails.receivedAt)],
      limit: 100,
      with: {
        thread: true,
      },
    });

    return {
      success: true,
      data: { emails: emailList },
    };
  } catch (error) {
    console.error('Error fetching emails:', error);
    return {
      success: false,
      error: 'Failed to fetch emails',
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

    const email = await db.query.emails.findFirst({
      where: eq(emails.id, emailId),
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
    const email = await db.query.emails.findFirst({
      where: eq(emails.id, emailId),
      with: { account: true },
    });

    if (!email || email.account.userId !== userId) {
      return { success: false, error: 'Email not found' };
    }

    await db
      .update(emails)
      .set({ 
        isRead,
        updatedAt: new Date(),
      })
      .where(eq(emails.id, emailId));

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

    const email = await db.query.emails.findFirst({
      where: eq(emails.id, emailId),
      with: { account: true },
    });

    if (!email || email.account.userId !== userId) {
      return { success: false, error: 'Email not found' };
    }

    await db
      .update(emails)
      .set({ 
        isStarred: !email.isStarred,
        updatedAt: new Date(),
      })
      .where(eq(emails.id, emailId));

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

    const email = await db.query.emails.findFirst({
      where: eq(emails.id, emailId),
      with: { account: true },
    });

    if (!email || email.account.userId !== userId) {
      return { success: false, error: 'Email not found' };
    }

    await db
      .update(emails)
      .set({ 
        folder: 'ARCHIVE',
        updatedAt: new Date(),
      })
      .where(eq(emails.id, emailId));

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

    const email = await db.query.emails.findFirst({
      where: eq(emails.id, emailId),
      with: { account: true },
    });

    if (!email || email.account.userId !== userId) {
      return { success: false, error: 'Email not found' };
    }

    if (email.folder === 'TRASH') {
      // Permanently delete if already in trash
      await db.delete(emails).where(eq(emails.id, emailId));
    } else {
      // Move to trash
      await db
        .update(emails)
        .set({ 
          folder: 'TRASH',
          updatedAt: new Date(),
        })
        .where(eq(emails.id, emailId));
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
    const emailList = await db.query.emails.findMany({
      where: sql`${emails.id} IN (${sql.join(emailIds.map((id) => sql`${id}`), sql`, `)})`,
      with: { account: true },
    });

    if (emailList.some((email) => email.account.userId !== userId)) {
      return { success: false, error: 'Unauthorized' };
    }

    // Perform operation
    switch (operation) {
      case 'read':
        await db
          .update(emails)
          .set({ isRead: true, updatedAt: new Date() })
          .where(sql`${emails.id} IN (${sql.join(emailIds.map((id) => sql`${id}`), sql`, `)})`);
        break;
      
      case 'unread':
        await db
          .update(emails)
          .set({ isRead: false, updatedAt: new Date() })
          .where(sql`${emails.id} IN (${sql.join(emailIds.map((id) => sql`${id}`), sql`, `)})`);
        break;
      
      case 'archive':
        await db
          .update(emails)
          .set({ folder: 'ARCHIVE', updatedAt: new Date() })
          .where(sql`${emails.id} IN (${sql.join(emailIds.map((id) => sql`${id}`), sql`, `)})`);
        break;
      
      case 'delete':
        await db
          .update(emails)
          .set({ folder: 'TRASH', updatedAt: new Date() })
          .where(sql`${emails.id} IN (${sql.join(emailIds.map((id) => sql`${id}`), sql`, `)})`);
        break;
      
      case 'star':
        await db
          .update(emails)
          .set({ isStarred: true, updatedAt: new Date() })
          .where(sql`${emails.id} IN (${sql.join(emailIds.map((id) => sql`${id}`), sql`, `)})`);
        break;
      
      case 'unstar':
        await db
          .update(emails)
          .set({ isStarred: false, updatedAt: new Date() })
          .where(sql`${emails.id} IN (${sql.join(emailIds.map((id) => sql`${id}`), sql`, `)})`);
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
