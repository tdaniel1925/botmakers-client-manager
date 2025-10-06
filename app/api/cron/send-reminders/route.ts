import { NextRequest, NextResponse } from "next/server";
import {
  getDueReminders,
  markReminderAsSent,
  markReminderAsFailed,
  incrementReminderCount,
} from "@/db/queries/reminder-queries";
import { sendEmail } from "@/lib/email-service";
import { shouldSendReminder } from "@/lib/reminder-scheduler";

/**
 * Cron Job: Send Due Reminders
 * 
 * This endpoint should be called hourly by a cron service (e.g., Vercel Cron, GitHub Actions, or external cron)
 * 
 * Security: Requires CRON_SECRET environment variable to match for authentication
 * 
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-reminders",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate cron request
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[CRON] Starting reminder sending job...");

    // Fetch due reminders (limit to 100 per run to avoid timeouts)
    const dueReminders = await getDueReminders(100);

    if (dueReminders.length === 0) {
      console.log("[CRON] No due reminders found");
      return NextResponse.json({
        success: true,
        processed: 0,
        sent: 0,
        skipped: 0,
        failed: 0,
        duration: Date.now() - startTime,
      });
    }

    console.log(`[CRON] Found ${dueReminders.length} due reminders`);

    const results = {
      sent: 0,
      skipped: 0,
      failed: 0,
    };

    // Process each reminder
    for (const { reminder, session } of dueReminders) {
      try {
        // Skip if no session (orphaned reminder)
        if (!session) {
          console.log(`[CRON] Skipping reminder ${reminder.id}: No session found`);
          await markReminderAsFailed(reminder.id, "Session not found");
          results.skipped++;
          continue;
        }

        // Skip if no client email
        if (!session.clientEmail) {
          console.log(`[CRON] Skipping reminder ${reminder.id}: No client email`);
          await markReminderAsFailed(reminder.id, "No client email");
          results.skipped++;
          continue;
        }

        // Check if reminder should be sent
        const shouldSend = shouldSendReminder(
          session.status,
          session.lastActivityAt,
          session.expiresAt
        );

        if (!shouldSend) {
          console.log(
            `[CRON] Skipping reminder ${reminder.id}: Session ${session.status} or recently active`
          );
          results.skipped++;
          continue;
        }

        // Send email
        console.log(
          `[CRON] Sending ${reminder.reminderType} reminder to ${session.clientEmail}`
        );

        await sendEmail({
          to: session.clientEmail,
          subject: reminder.emailSubject,
          html: reminder.emailBody,
        });

        // Mark as sent
        await markReminderAsSent(reminder.id);

        // Increment reminder count for session
        await incrementReminderCount(session.id);

        results.sent++;
        console.log(`[CRON] Successfully sent reminder ${reminder.id}`);
      } catch (error) {
        console.error(`[CRON] Failed to send reminder ${reminder.id}:`, error);
        
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await markReminderAsFailed(reminder.id, errorMessage);
        
        results.failed++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[CRON] Completed in ${duration}ms:`, results);

    return NextResponse.json({
      success: true,
      processed: dueReminders.length,
      ...results,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Fatal error in send-reminders job:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

/**
 * Manual trigger endpoint (POST)
 * Allows platform admins to manually trigger the cron job
 */
export async function POST(request: NextRequest) {
  try {
    // This uses the same logic as GET but can be called manually
    // You could add additional authentication here if needed
    return await GET(request);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
