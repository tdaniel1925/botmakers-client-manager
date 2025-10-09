/**
 * Email Operations Server Actions
 * Server-side API for email management (read, move, delete, etc.)
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import {
  getEmailsByAccountId,
  getEmailById,
  getEmailsByUserId,
  markEmailAsRead,
  markEmailsAsRead,
  starEmail,
  archiveEmail,
  moveEmailToTrash,
  moveEmailsToTrash,
  deleteEmail,
  deleteEmails,
  getUnreadEmails,
  getEmailsByFolder,
} from '@/db/queries/email-queries';
import { syncAccount } from '@/lib/email-sync/sync-engine';
import type { SelectEmail } from '@/db/schema/email-schema';

// ============================================================================
// Get Emails
// ============================================================================

export async function getEmailsAction(accountId?: string): Promise<{
  success: boolean;
  emails?: SelectEmail[];
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const emails = accountId
      ? await getEmailsByAccountId(accountId)
      : await getEmailsByUserId(userId);

    return { success: true, emails };
  } catch (error) {
    console.error('Error fetching emails:', error);
    return { success: false, error: 'Failed to fetch emails' };
  }
}

export async function getEmailByIdAction(emailId: string): Promise<{
  success: boolean;
  email?: SelectEmail;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const email = await getEmailById(emailId);

    if (!email || email.userId !== userId) {
      return { success: false, error: 'Email not found or access denied' };
    }

    return { success: true, email };
  } catch (error) {
    console.error('Error fetching email:', error);
    return { success: false, error: 'Failed to fetch email' };
  }
}

export async function getUnreadEmailsAction(accountId: string): Promise<{
  success: boolean;
  emails?: SelectEmail[];
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const emails = await getUnreadEmails(accountId);

    return { success: true, emails };
  } catch (error) {
    console.error('Error fetching unread emails:', error);
    return { success: false, error: 'Failed to fetch unread emails' };
  }
}

export async function getEmailsByFolderAction(
  accountId: string,
  folderName: string
): Promise<{
  success: boolean;
  emails?: SelectEmail[];
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const emails = await getEmailsByFolder(accountId, folderName);

    return { success: true, emails };
  } catch (error) {
    console.error('Error fetching emails by folder:', error);
    return { success: false, error: 'Failed to fetch emails' };
  }
}

// ============================================================================
// Email Actions
// ============================================================================

export async function markAsReadAction(
  emailId: string,
  isRead: boolean = true
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const email = await getEmailById(emailId);

    if (!email || email.userId !== userId) {
      return { success: false, error: 'Email not found or access denied' };
    }

    await markEmailAsRead(emailId, isRead);

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error) {
    console.error('Error marking email as read:', error);
    return { success: false, error: 'Failed to mark email as read' };
  }
}

export async function markMultipleAsReadAction(
  emailIds: string[],
  isRead: boolean = true
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await markEmailsAsRead(emailIds, isRead);

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error) {
    console.error('Error marking emails as read:', error);
    return { success: false, error: 'Failed to mark emails as read' };
  }
}

export async function starEmailAction(
  emailId: string,
  starred: boolean = true
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const email = await getEmailById(emailId);

    if (!email || email.userId !== userId) {
      return { success: false, error: 'Email not found or access denied' };
    }

    await starEmail(emailId, starred);

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error) {
    console.error('Error starring email:', error);
    return { success: false, error: 'Failed to star email' };
  }
}

export async function archiveEmailAction(emailId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const email = await getEmailById(emailId);

    if (!email || email.userId !== userId) {
      return { success: false, error: 'Email not found or access denied' };
    }

    await archiveEmail(emailId);

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error) {
    console.error('Error archiving email:', error);
    return { success: false, error: 'Failed to archive email' };
  }
}

export async function trashEmailAction(emailId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const email = await getEmailById(emailId);

    if (!email || email.userId !== userId) {
      return { success: false, error: 'Email not found or access denied' };
    }

    await moveEmailToTrash(emailId);

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error) {
    console.error('Error moving email to trash:', error);
    return { success: false, error: 'Failed to move email to trash' };
  }
}

export async function trashMultipleEmailsAction(emailIds: string[]): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await moveEmailsToTrash(emailIds);

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error) {
    console.error('Error moving emails to trash:', error);
    return { success: false, error: 'Failed to move emails to trash' };
  }
}

export async function deleteEmailAction(emailId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const email = await getEmailById(emailId);

    if (!email || email.userId !== userId) {
      return { success: false, error: 'Email not found or access denied' };
    }

    await deleteEmail(emailId);

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error) {
    console.error('Error deleting email:', error);
    return { success: false, error: 'Failed to delete email' };
  }
}

export async function deleteMultipleEmailsAction(emailIds: string[]): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await deleteEmails(emailIds);

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error) {
    console.error('Error deleting emails:', error);
    return { success: false, error: 'Failed to delete emails' };
  }
}

// ============================================================================
// Sync Actions
// ============================================================================

export async function syncEmailsAction(accountId: string): Promise<{
  success: boolean;
  stats?: {
    emailsFetched: number;
    emailsProcessed: number;
    emailsSkipped: number;
    emailsFailed: number;
  };
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await syncAccount(accountId, userId, { maxEmails: 50 });

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: result.success,
      stats: {
        emailsFetched: result.emailsFetched,
        emailsProcessed: result.emailsProcessed,
        emailsSkipped: result.emailsSkipped,
        emailsFailed: result.emailsFailed,
      },
      error: result.error,
    };
  } catch (error) {
    console.error('Error syncing emails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync emails',
    };
  }
}

