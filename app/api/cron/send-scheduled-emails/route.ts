/**
 * Send Scheduled Emails Cron Job
 * Runs every minute to check for emails ready to send
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getEmailsReadyToSendAction,
  markScheduledEmailSentAction,
  markScheduledEmailFailedAction,
} from '@/actions/scheduled-email-actions';

export const runtime = 'edge';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Send Scheduled Emails - Starting...');

    // Get emails ready to send
    const result = await getEmailsReadyToSendAction();
    
    if (!result.success || !result.data?.emails) {
      console.log('[CRON] No emails to send or error occurred');
      return NextResponse.json({
        processed: 0,
        errors: result.error ? [result.error] : [],
      });
    }

    const emails = result.data.emails;
    console.log(`[CRON] Found ${emails.length} emails to send`);

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each email
    for (const scheduledEmail of emails) {
      try {
        results.processed++;

        // TODO: Implement actual email sending via SMTP
        // For now, we'll just mark it as sent
        // In production, this would call the SMTP client to send the email
        
        const sendResult = await markScheduledEmailSentAction(scheduledEmail.id);
        
        if (sendResult.success) {
          results.sent++;
          console.log(`[CRON] Sent email ${scheduledEmail.id}`);
        } else {
          results.failed++;
          await markScheduledEmailFailedAction(
            scheduledEmail.id,
            sendResult.error || 'Unknown error'
          );
          results.errors.push(`Email ${scheduledEmail.id}: ${sendResult.error}`);
        }
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        await markScheduledEmailFailedAction(scheduledEmail.id, errorMessage);
        results.errors.push(`Email ${scheduledEmail.id}: ${errorMessage}`);
        
        console.error(`[CRON] Error sending email ${scheduledEmail.id}:`, error);
      }
    }

    console.log('[CRON] Send Scheduled Emails - Complete', results);

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('[CRON] Fatal error in send scheduled emails:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

