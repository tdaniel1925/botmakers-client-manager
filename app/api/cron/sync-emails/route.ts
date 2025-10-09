/**
 * Email Sync Cron Job
 * Runs every 5 minutes to sync emails from all active accounts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAccountsNeedingSync } from '@/db/queries/email-account-queries';
import { syncAccounts } from '@/lib/email-sync/sync-engine';

export const maxDuration = 60; // 60 seconds max execution time

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate cron request
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.EMAIL_SYNC_SECRET}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Email Sync Cron] Starting email sync job...');

    // Get accounts that need syncing
    const accounts = await getAccountsNeedingSync(50); // Batch of 50

    if (accounts.length === 0) {
      console.log('[Email Sync Cron] No accounts need syncing');
      return NextResponse.json({
        success: true,
        message: 'No accounts need syncing',
        duration: Date.now() - startTime,
      });
    }

    console.log(`[Email Sync Cron] Syncing ${accounts.length} accounts...`);

    // Sync accounts
    const results = await syncAccounts(
      accounts.map((acc) => ({ id: acc.id, userId: acc.userId })),
      { maxEmails: 50 }
    );

    // Calculate stats
    const totalFetched = results.reduce((sum, r) => sum + r.emailsFetched, 0);
    const totalProcessed = results.reduce((sum, r) => sum + r.emailsProcessed, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.emailsSkipped, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.emailsFailed, 0);
    const successfulSyncs = results.filter((r) => r.success).length;

    const duration = Date.now() - startTime;

    console.log(`[Email Sync Cron] Completed in ${duration}ms`);
    console.log(`[Email Sync Cron] Stats: ${totalProcessed} processed, ${totalSkipped} skipped, ${totalFailed} failed`);

    return NextResponse.json({
      success: true,
      accountsSynced: accounts.length,
      successfulSyncs,
      failedSyncs: accounts.length - successfulSyncs,
      emailsFetched: totalFetched,
      emailsProcessed: totalProcessed,
      emailsSkipped: totalSkipped,
      emailsFailed: totalFailed,
      duration,
    });
  } catch (error) {
    console.error('[Email Sync Cron] Error:', error);

    return NextResponse.json(
      {
        error: 'Email sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

