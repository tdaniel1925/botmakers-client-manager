/**
 * Undo Screening Action
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { emailsTable, contactScreeningTable } from '@/db/schema/email-schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  success: boolean;
  error?: string;
  affectedCount?: number;
}

/**
 * Undo a screening decision - returns emails to unscreened state
 */
export async function undoScreeningAction(emailAddress: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    console.log(`🔄 Undoing screening for: ${emailAddress}`);

    // Remove screening decision
    await db
      .delete(contactScreeningTable)
      .where(
        and(
          eq(contactScreeningTable.userId, userId),
          eq(contactScreeningTable.emailAddress, emailAddress)
        )
      );

    // Reset all emails from this sender to pending screening status
    const updatedEmails = await db
      .update(emailsTable)
      .set({
        heyView: null,
        screeningStatus: 'pending',
      })
      .where(
        and(
          eq(emailsTable.userId, userId),
          sql`${emailsTable.fromAddress}::text LIKE ${`%${emailAddress}%`}`
        )
      )
      .returning();

    console.log(`✅ Undid screening for ${updatedEmails.length} emails from ${emailAddress}`);

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true, affectedCount: updatedEmails.length };
  } catch (error) {
    console.error('Error undoing screening:', error);
    return { success: false, error: 'Failed to undo screening' };
  }
}

/**
 * Get screening history for a user
 */
export async function getScreeningHistoryAction() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const history = await db
      .select()
      .from(contactScreeningTable)
      .where(eq(contactScreeningTable.userId, userId))
      .orderBy(contactScreeningTable.updatedAt);

    return { success: true, data: history };
  } catch (error) {
    console.error('Error getting screening history:', error);
    return { success: false, error: 'Failed to get screening history' };
  }
}


