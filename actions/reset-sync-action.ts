/**
 * Reset Sync Action - Reset stuck email sync
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { emailAccountsTable } from '@/db/schema/email-schema';
import { eq, and, lt } from 'drizzle-orm';

export async function resetStuckSyncAction(accountId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the account
    const account = await db.query.emailAccountsTable.findFirst({
      where: and(
        eq(emailAccountsTable.id, accountId),
        eq(emailAccountsTable.userId, userId)
      ),
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Reset sync status
    await db
      .update(emailAccountsTable)
      .set({
        status: 'active',
        lastSyncAt: new Date(),
      })
      .where(eq(emailAccountsTable.id, accountId));

    console.log(`✅ Reset sync status for account: ${account.emailAddress}`);

    return { success: true };
  } catch (error: any) {
    console.error('Error resetting sync:', error);
    return { success: false, error: error.message || 'Failed to reset sync' };
  }
}

/**
 * Check for accounts stuck in syncing status (>30 minutes) and reset them
 */
export async function resetAllStuckSyncsAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Find accounts stuck in syncing status for >30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const stuckAccounts = await db
      .select()
      .from(emailAccountsTable)
      .where(
        and(
          eq(emailAccountsTable.userId, userId),
          eq(emailAccountsTable.status, 'syncing'),
          lt(emailAccountsTable.lastSyncAt, thirtyMinutesAgo)
        )
      );

    if (stuckAccounts.length === 0) {
      return { success: true, resetCount: 0 };
    }

    // Reset all stuck accounts
    for (const account of stuckAccounts) {
      await db
        .update(emailAccountsTable)
        .set({
          status: 'error',
          lastSyncAt: new Date(),
        })
        .where(eq(emailAccountsTable.id, account.id));

      console.log(`⚠️ Reset stuck sync for account: ${account.emailAddress}`);
    }

    return { success: true, resetCount: stuckAccounts.length };
  } catch (error: any) {
    console.error('Error resetting stuck syncs:', error);
    return { success: false, error: error.message || 'Failed to reset stuck syncs' };
  }
}


