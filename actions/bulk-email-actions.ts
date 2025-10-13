/**
 * Bulk Email Operations
 * Handle multiple emails at once for improved productivity
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { emailsTable } from '@/db/schema/email-schema';
import { eq, and, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

interface BulkResult {
  success: boolean;
  updatedCount: number;
  error?: string;
}

/**
 * Mark multiple emails as read/unread
 */
export async function bulkMarkAsReadAction(
  emailIds: string[],
  isRead: boolean
): Promise<BulkResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, updatedCount: 0, error: 'Unauthorized' };
    }

    if (emailIds.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    // Update all emails
    const result = await db
      .update(emailsTable)
      .set({ isRead, updatedAt: new Date() })
      .where(
        and(
          eq(emailsTable.userId, userId),
          inArray(emailsTable.id, emailIds)
        )
      )
      .returning();

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      updatedCount: result.length,
    };
  } catch (error) {
    console.error('Error in bulk mark as read:', error);
    return {
      success: false,
      updatedCount: 0,
      error: 'Failed to update emails',
    };
  }
}

/**
 * Star/unstar multiple emails
 */
export async function bulkStarAction(
  emailIds: string[],
  isStarred: boolean
): Promise<BulkResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, updatedCount: 0, error: 'Unauthorized' };
    }

    if (emailIds.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    const result = await db
      .update(emailsTable)
      .set({ isStarred, updatedAt: new Date() })
      .where(
        and(
          eq(emailsTable.userId, userId),
          inArray(emailsTable.id, emailIds)
        )
      )
      .returning();

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      updatedCount: result.length,
    };
  } catch (error) {
    console.error('Error in bulk star:', error);
    return {
      success: false,
      updatedCount: 0,
      error: 'Failed to update emails',
    };
  }
}

/**
 * Archive multiple emails
 */
export async function bulkArchiveAction(
  emailIds: string[]
): Promise<BulkResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, updatedCount: 0, error: 'Unauthorized' };
    }

    if (emailIds.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    const result = await db
      .update(emailsTable)
      .set({ 
        isArchived: true,
        folderName: 'ARCHIVE',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(emailsTable.userId, userId),
          inArray(emailsTable.id, emailIds)
        )
      )
      .returning();

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      updatedCount: result.length,
    };
  } catch (error) {
    console.error('Error in bulk archive:', error);
    return {
      success: false,
      updatedCount: 0,
      error: 'Failed to archive emails',
    };
  }
}

/**
 * Move multiple emails to trash
 */
export async function bulkTrashAction(
  emailIds: string[]
): Promise<BulkResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, updatedCount: 0, error: 'Unauthorized' };
    }

    if (emailIds.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    const result = await db
      .update(emailsTable)
      .set({ 
        isTrash: true,
        folderName: 'TRASH',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(emailsTable.userId, userId),
          inArray(emailsTable.id, emailIds)
        )
      )
      .returning();

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      updatedCount: result.length,
    };
  } catch (error) {
    console.error('Error in bulk trash:', error);
    return {
      success: false,
      updatedCount: 0,
      error: 'Failed to move emails to trash',
    };
  }
}

/**
 * Permanently delete multiple emails
 */
export async function bulkDeleteAction(
  emailIds: string[]
): Promise<BulkResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, updatedCount: 0, error: 'Unauthorized' };
    }

    if (emailIds.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    const result = await db
      .delete(emailsTable)
      .where(
        and(
          eq(emailsTable.userId, userId),
          inArray(emailsTable.id, emailIds)
        )
      )
      .returning();

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      updatedCount: result.length,
    };
  } catch (error) {
    console.error('Error in bulk delete:', error);
    return {
      success: false,
      updatedCount: 0,
      error: 'Failed to delete emails',
    };
  }
}

/**
 * Move multiple emails to a folder
 */
export async function bulkMoveToFolderAction(
  emailIds: string[],
  folderName: string
): Promise<BulkResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, updatedCount: 0, error: 'Unauthorized' };
    }

    if (emailIds.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    const result = await db
      .update(emailsTable)
      .set({ 
        folderName,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(emailsTable.userId, userId),
          inArray(emailsTable.id, emailIds)
        )
      )
      .returning();

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      updatedCount: result.length,
    };
  } catch (error) {
    console.error('Error in bulk move to folder:', error);
    return {
      success: false,
      updatedCount: 0,
      error: 'Failed to move emails',
    };
  }
}


