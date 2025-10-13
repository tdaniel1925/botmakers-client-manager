/**
 * Blocked Senders Actions
 * Server actions for managing blocked email senders
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { blockedSendersTable, emailAccountsTable } from '@/db/schema/email-schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { SelectBlockedSender } from '@/db/schema/email-schema';

/**
 * Get all blocked senders for an account
 */
export async function getBlockedSendersAction(accountId: string): Promise<{
  success: boolean;
  blockedSenders?: SelectBlockedSender[];
  error?: string;
}> {
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

    // Get blocked senders
    const blockedSenders = await db.query.blockedSendersTable.findMany({
      where: eq(blockedSendersTable.accountId, accountId),
      orderBy: (senders, { desc }) => [desc(senders.blockedAt)],
    });

    return { success: true, blockedSenders };
  } catch (error: any) {
    console.error('Error getting blocked senders:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Block a sender
 */
export async function blockSenderAction(
  accountId: string,
  emailAddress: string,
  reason?: string
): Promise<{
  success: boolean;
  blockedSender?: SelectBlockedSender;
  error?: string;
}> {
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

    // Check if already blocked
    const existing = await db.query.blockedSendersTable.findFirst({
      where: and(
        eq(blockedSendersTable.accountId, accountId),
        eq(blockedSendersTable.emailAddress, emailAddress)
      ),
    });

    if (existing) {
      return { success: true, blockedSender: existing };
    }

    // Block sender
    const [blockedSender] = await db
      .insert(blockedSendersTable)
      .values({
        accountId,
        userId,
        emailAddress,
        reason,
      })
      .returning();

    revalidatePath('/platform/emails/settings');
    revalidatePath('/dashboard/emails/settings');

    return { success: true, blockedSender };
  } catch (error: any) {
    console.error('Error blocking sender:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Unblock a sender
 */
export async function unblockSenderAction(blockId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get blocked sender and verify ownership
    const blockedSender = await db.query.blockedSendersTable.findFirst({
      where: and(
        eq(blockedSendersTable.id, blockId),
        eq(blockedSendersTable.userId, userId)
      ),
    });

    if (!blockedSender) {
      return { success: false, error: 'Blocked sender not found' };
    }

    // Unblock sender
    await db
      .delete(blockedSendersTable)
      .where(eq(blockedSendersTable.id, blockId));

    revalidatePath('/platform/emails/settings');
    revalidatePath('/dashboard/emails/settings');

    return { success: true };
  } catch (error: any) {
    console.error('Error unblocking sender:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if an email address is blocked
 */
export async function isBlockedAction(accountId: string, emailAddress: string): Promise<{
  success: boolean;
  isBlocked?: boolean;
  error?: string;
}> {
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

    // Check if blocked
    const blocked = await db.query.blockedSendersTable.findFirst({
      where: and(
        eq(blockedSendersTable.accountId, accountId),
        eq(blockedSendersTable.emailAddress, emailAddress)
      ),
    });

    return { success: true, isBlocked: !!blocked };
  } catch (error: any) {
    console.error('Error checking if sender is blocked:', error);
    return { success: false, error: error.message };
  }
}



