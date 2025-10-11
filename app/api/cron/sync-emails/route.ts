/**
 * Background Email Sync Cron Job
 * This API route syncs all active email accounts automatically
 * Can be triggered by:
 * - Vercel Cron (every 15 minutes)
 * - Manual API call
 * - Webhook event
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { emailAccountsTable } from '@/db/schema/email-schema';
import { eq } from 'drizzle-orm';
import { syncNylasEmailsAction } from '@/actions/email-nylas-actions';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'your-secret-key-change-this';
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify authorization
    if (!verifyCronSecret(request)) {
      console.warn('🚫 Unauthorized cron access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('⏰ CRON: Starting background email sync...');

    // Get all active email accounts
    const accounts = await db
      .select()
      .from(emailAccountsTable)
      .where(eq(emailAccountsTable.status, 'active'));

    console.log(`📧 CRON: Found ${accounts.length} active accounts to sync`);

    const results = {
      total: accounts.length,
      successful: 0,
      failed: 0,
      details: [] as any[],
    };

    // Sync each account
    for (const account of accounts) {
      try {
        console.log(`🔄 CRON: Syncing ${account.emailAddress}...`);
        
        // Only sync Nylas accounts
        if (!account.nylasGrantId) {
          console.log(`⚠️ CRON: Skipping ${account.emailAddress} - no Nylas grant`);
          results.details.push({
            email: account.emailAddress,
            status: 'skipped',
            reason: 'No Nylas grant ID',
          });
          continue;
        }

        const result = await syncNylasEmailsAction(account.id);

        if (result.success) {
          results.successful++;
          results.details.push({
            email: account.emailAddress,
            status: 'success',
            syncedCount: result.syncedCount || 0,
          });
          console.log(`✅ CRON: ${account.emailAddress} - synced ${result.syncedCount || 0} emails`);
        } else {
          results.failed++;
          results.details.push({
            email: account.emailAddress,
            status: 'error',
            error: result.error,
          });
          console.error(`❌ CRON: ${account.emailAddress} - ${result.error}`);
        }
      } catch (error: any) {
        results.failed++;
        results.details.push({
          email: account.emailAddress,
          status: 'error',
          error: error.message,
        });
        console.error(`❌ CRON: ${account.emailAddress} - ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ CRON: Completed in ${duration}ms - ${results.successful} successful, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      duration,
      ...results,
    });

  } catch (error: any) {
    console.error('❌ CRON: Fatal error:', error);
    return NextResponse.json(
      { 
        error: 'Background sync failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
