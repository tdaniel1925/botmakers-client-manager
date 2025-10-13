/**
 * Reply Later Actions (Hey's enhanced snooze)
 */

'use server';

import { db } from '@/db/db';
import { emailsTable } from '@/db/schema/email-schema';
import { eq, and, lte } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Mark email for Reply Later
 */
export async function markReplyLater(
  emailId: string,
  until: Date,
  note?: string
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    await db
      .update(emailsTable)
      .set({
        isReplyLater: true,
        replyLaterUntil: until,
        replyLaterNote: note,
      })
      .where(and(eq(emailsTable.id, emailId), eq(emailsTable.userId, userId)));

    revalidatePath('/platform/emails');
    return { success: true };
  } catch (error) {
    console.error('Error marking Reply Later:', error);
    return { success: false, error: 'Failed to mark Reply Later' };
  }
}

/**
 * Remove from Reply Later
 */
export async function removeReplyLater(emailId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    await db
      .update(emailsTable)
      .set({
        isReplyLater: false,
        replyLaterUntil: null,
        replyLaterNote: null,
      })
      .where(and(eq(emailsTable.id, emailId), eq(emailsTable.userId, userId)));

    revalidatePath('/platform/emails');
    return { success: true };
  } catch (error) {
    console.error('Error removing Reply Later:', error);
    return { success: false, error: 'Failed to remove Reply Later' };
  }
}

/**
 * Get Reply Later emails
 */
export async function getReplyLaterEmails(): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const emails = await db
      .select()
      .from(emailsTable)
      .where(
        and(
          eq(emailsTable.userId, userId),
          eq(emailsTable.isReplyLater, true),
          lte(emailsTable.replyLaterUntil, new Date()) // Due now or overdue
        )
      )
      .orderBy(emailsTable.replyLaterUntil);

    return { success: true, data: emails };
  } catch (error) {
    console.error('Error getting Reply Later emails:', error);
    return { success: false, error: 'Failed to get Reply Later emails' };
  }
}

/**
 * Mark email as Set Aside
 */
export async function markSetAside(emailId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    await db
      .update(emailsTable)
      .set({
        isSetAside: true,
        setAsideAt: new Date(),
      })
      .where(and(eq(emailsTable.id, emailId), eq(emailsTable.userId, userId)));

    revalidatePath('/platform/emails');
    return { success: true };
  } catch (error) {
    console.error('Error marking Set Aside:', error);
    return { success: false, error: 'Failed to mark Set Aside' };
  }
}

/**
 * Remove from Set Aside
 */
export async function removeSetAside(emailId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    await db
      .update(emailsTable)
      .set({
        isSetAside: false,
        setAsideAt: null,
      })
      .where(and(eq(emailsTable.id, emailId), eq(emailsTable.userId, userId)));

    revalidatePath('/platform/emails');
    return { success: true };
  } catch (error) {
    console.error('Error removing Set Aside:', error);
    return { success: false, error: 'Failed to remove Set Aside' };
  }
}

/**
 * Get Set Aside emails
 */
export async function getSetAsideEmails(): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const emails = await db
      .select()
      .from(emailsTable)
      .where(
        and(
          eq(emailsTable.userId, userId),
          eq(emailsTable.isSetAside, true)
        )
      )
      .orderBy(emailsTable.setAsideAt);

    return { success: true, data: emails };
  } catch (error) {
    console.error('Error getting Set Aside emails:', error);
    return { success: false, error: 'Failed to get Set Aside emails' };
  }
}

/**
 * Bubble Up email (resurface to top)
 */
export async function bubbleUpEmail(emailId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    await db
      .update(emailsTable)
      .set({
        isBubbledUp: true,
        bubbledUpAt: new Date(),
      })
      .where(and(eq(emailsTable.id, emailId), eq(emailsTable.userId, userId)));

    revalidatePath('/platform/emails');
    return { success: true };
  } catch (error) {
    console.error('Error bubbling up email:', error);
    return { success: false, error: 'Failed to bubble up email' };
  }
}


