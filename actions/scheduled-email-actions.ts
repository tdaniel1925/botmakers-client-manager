/**
 * Scheduled Email Server Actions
 * Schedule emails to be sent at a future time
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/db';
import { scheduledEmails } from '@/db/schema/scheduled-emails-schema';
import { eq, and, lte, gte } from 'drizzle-orm';
import type { InsertScheduledEmail, SelectScheduledEmail } from '@/db/schema/scheduled-emails-schema';

interface ActionResult<T = void> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Schedule an email to be sent later
 */
export async function scheduleEmailAction(
  email: Omit<InsertScheduledEmail, 'userId' | 'id' | 'createdAt' | 'updatedAt'>
): Promise<ActionResult<{ scheduledEmail: SelectScheduledEmail }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate scheduled time is in the future
    const scheduledAt = new Date(email.scheduledAt);
    const now = new Date();
    
    if (scheduledAt <= now) {
      return { success: false, error: 'Scheduled time must be in the future' };
    }

    // Create scheduled email
    const [scheduledEmail] = await db
      .insert(scheduledEmails)
      .values({
        ...email,
        userId,
        status: 'pending',
      })
      .returning();

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      message: `Email scheduled for ${scheduledAt.toLocaleString()}`,
      data: { scheduledEmail },
    };
  } catch (error) {
    console.error('Error scheduling email:', error);
    return {
      success: false,
      error: 'Failed to schedule email',
    };
  }
}

/**
 * Get all scheduled emails for user
 */
export async function getScheduledEmailsAction(): Promise<
  ActionResult<{ scheduledEmails: SelectScheduledEmail[] }>
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const scheduled = await db.query.scheduledEmails.findMany({
      where: and(
        eq(scheduledEmails.userId, userId),
        eq(scheduledEmails.status, 'pending')
      ),
      orderBy: (scheduledEmails, { asc }) => [asc(scheduledEmails.scheduledAt)],
    });

    return {
      success: true,
      data: { scheduledEmails: scheduled },
    };
  } catch (error) {
    console.error('Error fetching scheduled emails:', error);
    return {
      success: false,
      error: 'Failed to fetch scheduled emails',
    };
  }
}

/**
 * Cancel a scheduled email
 */
export async function cancelScheduledEmailAction(
  scheduledEmailId: string
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const scheduled = await db.query.scheduledEmails.findFirst({
      where: eq(scheduledEmails.id, scheduledEmailId),
    });

    if (!scheduled || scheduled.userId !== userId) {
      return { success: false, error: 'Scheduled email not found' };
    }

    if (scheduled.status !== 'pending') {
      return { success: false, error: 'Email has already been sent or cancelled' };
    }

    // Update status to cancelled
    await db
      .update(scheduledEmails)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(scheduledEmails.id, scheduledEmailId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      message: 'Scheduled email cancelled',
    };
  } catch (error) {
    console.error('Error cancelling scheduled email:', error);
    return {
      success: false,
      error: 'Failed to cancel scheduled email',
    };
  }
}

/**
 * Reschedule an email
 */
export async function rescheduleEmailAction(
  scheduledEmailId: string,
  newScheduledAt: Date
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate new time is in the future
    const now = new Date();
    if (newScheduledAt <= now) {
      return { success: false, error: 'Scheduled time must be in the future' };
    }

    // Verify ownership
    const scheduled = await db.query.scheduledEmails.findFirst({
      where: eq(scheduledEmails.id, scheduledEmailId),
    });

    if (!scheduled || scheduled.userId !== userId) {
      return { success: false, error: 'Scheduled email not found' };
    }

    if (scheduled.status !== 'pending') {
      return { success: false, error: 'Email has already been sent or cancelled' };
    }

    // Update scheduled time
    await db
      .update(scheduledEmails)
      .set({
        scheduledAt: newScheduledAt,
        updatedAt: new Date(),
      })
      .where(eq(scheduledEmails.id, scheduledEmailId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      message: `Email rescheduled to ${newScheduledAt.toLocaleString()}`,
    };
  } catch (error) {
    console.error('Error rescheduling email:', error);
    return {
      success: false,
      error: 'Failed to reschedule email',
    };
  }
}

/**
 * Get emails ready to be sent (for cron job)
 */
export async function getEmailsReadyToSendAction(): Promise<
  ActionResult<{ emails: SelectScheduledEmail[] }>
> {
  try {
    const now = new Date();

    const readyEmails = await db.query.scheduledEmails.findMany({
      where: and(
        eq(scheduledEmails.status, 'pending'),
        lte(scheduledEmails.scheduledAt, now)
      ),
      limit: 50, // Process in batches
    });

    return {
      success: true,
      data: { emails: readyEmails },
    };
  } catch (error) {
    console.error('Error fetching emails ready to send:', error);
    return {
      success: false,
      error: 'Failed to fetch emails',
    };
  }
}

/**
 * Mark scheduled email as sent
 */
export async function markScheduledEmailSentAction(
  scheduledEmailId: string,
  sentEmailId?: string
): Promise<ActionResult> {
  try {
    await db
      .update(scheduledEmails)
      .set({
        status: 'sent',
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(scheduledEmails.id, scheduledEmailId));

    return {
      success: true,
      message: 'Email marked as sent',
    };
  } catch (error) {
    console.error('Error marking email as sent:', error);
    return {
      success: false,
      error: 'Failed to update email status',
    };
  }
}

/**
 * Mark scheduled email as failed
 */
export async function markScheduledEmailFailedAction(
  scheduledEmailId: string,
  errorMessage: string
): Promise<ActionResult> {
  try {
    await db
      .update(scheduledEmails)
      .set({
        status: 'failed',
        error: errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(scheduledEmails.id, scheduledEmailId));

    return {
      success: true,
      message: 'Email marked as failed',
    };
  } catch (error) {
    console.error('Error marking email as failed:', error);
    return {
      success: false,
      error: 'Failed to update email status',
    };
  }
}

