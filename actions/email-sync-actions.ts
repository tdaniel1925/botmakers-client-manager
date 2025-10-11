/**
 * Email Sync Server Actions
 * Trigger email synchronization from IMAP/OAuth providers
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { syncImapAccount } from '@/lib/email-sync/imap-sync';

interface SyncActionResult {
  success: boolean;
  message?: string;
  emailsFetched?: number;
  error?: string;
}

/**
 * Manually trigger sync for an email account
 */
export async function syncEmailAccountAction(accountId: string): Promise<SyncActionResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    console.log(`Starting email sync for account ${accountId}`);

    const result = await syncImapAccount(accountId, userId);

    if (result.success) {
      revalidatePath('/dashboard/emails');
      revalidatePath('/platform/emails');
      
      return {
        success: true,
        message: `Successfully synced ${result.emailsFetched} new emails`,
        emailsFetched: result.emailsFetched,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to sync emails',
      };
    }
  } catch (error) {
    console.error('Error in syncEmailAccountAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync emails',
    };
  }
}





