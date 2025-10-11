/**
 * Email Reminders Server Actions
 * Automated follow-up detection and reminder system
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/db';
import { emailRemindersTable, emailsTable } from '@/db/schema/email-schema';
import { eq, and, lt, desc } from 'drizzle-orm';
import type { InsertEmailReminder, SelectEmailReminder } from '@/db/schema/email-schema';

/**
 * Get all pending reminders for current user
 */
export async function getPendingRemindersAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const reminders = await db
      .select({
        reminder: emailRemindersTable,
        email: emailsTable,
      })
      .from(emailRemindersTable)
      .innerJoin(emailsTable, eq(emailRemindersTable.emailId, emailsTable.id))
      .where(
        and(
          eq(emailRemindersTable.userId, userId),
          eq(emailRemindersTable.status, 'pending')
        )
      )
      .orderBy(emailRemindersTable.remindAt);

    return { success: true, reminders };
  } catch (error: any) {
    console.error('Error getting reminders:', error);
    return { success: false, error: error.message || 'Failed to get reminders' };
  }
}

/**
 * Get reminders due now (for notifications)
 */
export async function getDueRemindersAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const now = new Date();

    const reminders = await db
      .select({
        reminder: emailRemindersTable,
        email: emailsTable,
      })
      .from(emailRemindersTable)
      .innerJoin(emailsTable, eq(emailRemindersTable.emailId, emailsTable.id))
      .where(
        and(
          eq(emailRemindersTable.userId, userId),
          eq(emailRemindersTable.status, 'pending'),
          lt(emailRemindersTable.remindAt, now),
          eq(emailRemindersTable.notificationSent, false)
        )
      )
      .orderBy(emailRemindersTable.remindAt);

    return { success: true, reminders };
  } catch (error: any) {
    console.error('Error getting due reminders:', error);
    return { success: false, error: error.message || 'Failed to get due reminders' };
  }
}

/**
 * Create a reminder for an email
 */
export async function createReminderAction(
  emailId: string,
  remindAt: Date,
  reason?: string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify email ownership
    const email = await db.query.emailsTable.findFirst({
      where: eq(emailsTable.id, emailId),
    });

    if (!email || email.userId !== userId) {
      return { success: false, error: 'Email not found' };
    }

    const [reminder] = await db
      .insert(emailRemindersTable)
      .values({
        emailId,
        userId,
        remindAt,
        reason,
        status: 'pending',
      })
      .returning();

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true, reminder };
  } catch (error: any) {
    console.error('Error creating reminder:', error);
    return { success: false, error: error.message || 'Failed to create reminder' };
  }
}

/**
 * Mark reminder as completed
 */
export async function completeReminderAction(reminderId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const reminder = await db.query.emailRemindersTable.findFirst({
      where: eq(emailRemindersTable.id, reminderId),
    });

    if (!reminder || reminder.userId !== userId) {
      return { success: false, error: 'Reminder not found' };
    }

    await db
      .update(emailRemindersTable)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(emailRemindersTable.id, reminderId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error: any) {
    console.error('Error completing reminder:', error);
    return { success: false, error: error.message || 'Failed to complete reminder' };
  }
}

/**
 * Dismiss a reminder
 */
export async function dismissReminderAction(reminderId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const reminder = await db.query.emailRemindersTable.findFirst({
      where: eq(emailRemindersTable.id, reminderId),
    });

    if (!reminder || reminder.userId !== userId) {
      return { success: false, error: 'Reminder not found' };
    }

    await db
      .update(emailRemindersTable)
      .set({
        status: 'dismissed',
      })
      .where(eq(emailRemindersTable.id, reminderId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error: any) {
    console.error('Error dismissing reminder:', error);
    return { success: false, error: error.message || 'Failed to dismiss reminder' };
  }
}

/**
 * Mark reminder notification as sent
 */
export async function markReminderNotifiedAction(reminderId: string) {
  try {
    await db
      .update(emailRemindersTable)
      .set({
        notificationSent: true,
      })
      .where(eq(emailRemindersTable.id, reminderId));

    return { success: true };
  } catch (error: any) {
    console.error('Error marking reminder notified:', error);
    return { success: false, error: error.message || 'Failed to mark reminder notified' };
  }
}

/**
 * Auto-detect emails that need follow-up
 * This analyzes sent emails and suggests reminders
 */
export async function detectFollowUpEmailsAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized', suggestions: [] };
    }

    // Get sent emails from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sentEmails = await db
      .select()
      .from(emailsTable)
      .where(
        and(
          eq(emailsTable.userId, userId),
          eq(emailsTable.isSent, true)
        )
      )
      .orderBy(desc(emailsTable.sentAt))
      .limit(50);

    // Analyze each email for follow-up signals
    const suggestions = [];
    for (const email of sentEmails) {
      const analysis = analyzeEmailForFollowUp(email);
      if (analysis.needsFollowUp) {
        // Check if reminder already exists
        const existingReminder = await db.query.emailRemindersTable.findFirst({
          where: and(
            eq(emailRemindersTable.emailId, email.id),
            eq(emailRemindersTable.status, 'pending')
          ),
        });

        if (!existingReminder) {
          suggestions.push({
            email,
            reason: analysis.reason,
            suggestedDate: analysis.suggestedDate,
          });
        }
      }
    }

    return { success: true, suggestions };
  } catch (error: any) {
    console.error('Error detecting follow-up emails:', error);
    return { success: false, error: error.message || 'Failed to detect follow-ups', suggestions: [] };
  }
}

/**
 * Analyze email content to determine if it needs follow-up
 */
function analyzeEmailForFollowUp(email: any): {
  needsFollowUp: boolean;
  reason?: string;
  suggestedDate?: Date;
} {
  const subject = (email.subject || '').toLowerCase();
  const body = (email.bodyText || '').toLowerCase();
  const sentDate = new Date(email.sentAt || email.receivedAt);
  const daysSinceSent = Math.floor((Date.now() - sentDate.getTime()) / (1000 * 60 * 60 * 24));

  // Check for question marks (asking for something)
  if (subject.includes('?') || body.includes('?')) {
    if (daysSinceSent >= 3) {
      const suggestedDate = new Date();
      suggestedDate.setHours(suggestedDate.getHours() + 2);
      return {
        needsFollowUp: true,
        reason: 'Asked a question but no reply in 3 days',
        suggestedDate,
      };
    }
  }

  // Check for action request keywords
  const actionKeywords = ['please review', 'can you', 'could you', 'would you', 'need', 'request', 'waiting for'];
  const hasActionKeyword = actionKeywords.some(keyword => 
    subject.includes(keyword) || body.includes(keyword)
  );

  if (hasActionKeyword && daysSinceSent >= 2) {
    const suggestedDate = new Date();
    suggestedDate.setHours(suggestedDate.getHours() + 1);
    return {
      needsFollowUp: true,
      reason: 'Requested action but no response in 2 days',
      suggestedDate,
    };
  }

  // Check for deadline/urgent keywords
  const urgentKeywords = ['deadline', 'urgent', 'asap', 'important', 'time-sensitive'];
  const hasUrgentKeyword = urgentKeywords.some(keyword => 
    subject.includes(keyword) || body.includes(keyword)
  );

  if (hasUrgentKeyword && daysSinceSent >= 1) {
    const suggestedDate = new Date();
    suggestedDate.setMinutes(suggestedDate.getMinutes() + 30);
    return {
      needsFollowUp: true,
      reason: 'Urgent email with no response in 1 day',
      suggestedDate,
    };
  }

  // Check for meeting-related
  const meetingKeywords = ['meeting', 'call', 'schedule', 'appointment', 'zoom', 'teams'];
  const hasMeetingKeyword = meetingKeywords.some(keyword => 
    subject.includes(keyword) || body.includes(keyword)
  );

  if (hasMeetingKeyword && daysSinceSent >= 2) {
    const suggestedDate = new Date();
    suggestedDate.setHours(suggestedDate.getHours() + 4);
    return {
      needsFollowUp: true,
      reason: 'Meeting request with no confirmation',
      suggestedDate,
    };
  }

  return { needsFollowUp: false };
}


