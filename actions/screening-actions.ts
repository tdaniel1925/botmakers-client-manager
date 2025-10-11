/**
 * Contact Screening Actions (Hey's core feature)
 */

'use server';

import { db } from '@/db/db';
import { contactScreeningTable, emailsTable } from '@/db/schema/email-schema';
import { eq, and, desc, sql, gte } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { classifyEmail, getEmailAddress, getEmailName } from '@/lib/email-classifier';
import { revalidatePath } from 'next/cache';

interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export type ScreeningDecision = 'imbox' | 'feed' | 'paper_trail' | 'blocked';

/**
 * Get screening decision for a sender
 */
export async function getScreeningDecision(emailAddress: string): Promise<ActionResult<ScreeningDecision | null>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const [screening] = await db
      .select()
      .from(contactScreeningTable)
      .where(
        and(
          eq(contactScreeningTable.userId, userId),
          eq(contactScreeningTable.emailAddress, emailAddress)
        )
      )
      .limit(1);

    return {
      success: true,
      data: screening?.decision as ScreeningDecision | null,
    };
  } catch (error) {
    console.error('Error getting screening decision:', error);
    return { success: false, error: 'Failed to get screening decision' };
  }
}

/**
 * Screen a sender (Yes, Feed, Block)
 */
export async function screenSender(
  emailAddress: string,
  decision: ScreeningDecision,
  firstEmailId?: string,
  notes?: string
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    // Save screening decision
    await db
      .insert(contactScreeningTable)
      .values({
        userId,
        emailAddress,
        decision,
        decidedAt: new Date(),
        firstEmailId,
        notes,
      })
      .onConflictDoUpdate({
        target: [contactScreeningTable.userId, contactScreeningTable.emailAddress],
        set: {
          decision,
          decidedAt: new Date(),
          notes,
          updatedAt: new Date(),
        },
      });

    // Update all emails from this sender
    const view = decision === 'blocked' ? null : decision;
    
    // Get all emails from this sender (fromAddress can be string or object)
    const userEmails = await db
      .select()
      .from(emailsTable)
      .where(eq(emailsTable.userId, userId));
    
    // Find emails matching this sender's email address
    const emailsToUpdate = userEmails.filter(email => {
      const fromAddr = getEmailAddress(email.fromAddress);
      return fromAddr === emailAddress;
    });
    
    // Update each email
    console.log(`🔄 Updating ${emailsToUpdate.length} emails in database...`);
    
    for (const email of emailsToUpdate) {
      await db
        .update(emailsTable)
        .set({
          heyView: view,
          screeningStatus: 'screened',
        })
        .where(eq(emailsTable.id, email.id));
      
      console.log(`  ✓ Updated email: ${email.subject} - heyView set to "${view}"`);
    }
    
    // VERIFY the update worked
    const verifyEmails = await db
      .select()
      .from(emailsTable)
      .where(eq(emailsTable.userId, userId));
    
    const updatedEmails = verifyEmails.filter(e => {
      const fromAddr = getEmailAddress(e.fromAddress);
      return fromAddr === emailAddress;
    });
    
    console.log(`✅ VERIFICATION: ${updatedEmails.length} emails now have heyView="${updatedEmails[0]?.heyView}"`);
    console.log(`✅ Screened ${emailsToUpdate.length} emails from ${emailAddress} as "${decision}"`);
    console.log(`📬 Emails will now appear in: ${
      decision === 'imbox' ? '✨ Imbox (Important)' :
      decision === 'feed' ? '📰 The Feed (Newsletters)' :
      decision === 'paper_trail' ? '🧾 Paper Trail (Receipts)' :
      '🚫 Blocked (Hidden)'
    }`);

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');
    
    return { success: true, updatedCount: emailsToUpdate.length };
  } catch (error) {
    console.error('Error screening sender:', error);
    return { success: false, error: 'Failed to screen sender' };
  }
}

/**
 * Get unscreened emails
 */
export async function getUnscreenedEmails(): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    // Only show emails from last 2 weeks in Screener
    // Older emails are auto-classified during sync
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    console.log(`📅 Screener: Only showing emails newer than ${twoWeeksAgo.toLocaleDateString()}`);

    // Get emails with pending screening status (last 2 weeks only)
    const emails = await db
      .select()
      .from(emailsTable)
      .where(
        and(
          eq(emailsTable.userId, userId),
          eq(emailsTable.screeningStatus, 'pending'),
          gte(emailsTable.receivedAt, twoWeeksAgo)
        )
      )
      .orderBy(desc(emailsTable.receivedAt))
      .limit(50);

    // Group by sender
    const senderMap = new Map();
    for (const email of emails) {
      const sender = getEmailAddress(email.fromAddress);
      if (!senderMap.has(sender)) {
        senderMap.set(sender, {
          emailAddress: sender,
          name: getEmailName(email.fromAddress),
          firstEmail: email,
          count: 1,
          classification: classifyEmail(email),
        });
      } else {
        senderMap.get(sender).count++;
      }
    }

    return {
      success: true,
      data: Array.from(senderMap.values()),
    };
  } catch (error) {
    console.error('Error getting unscreened emails:', error);
    return { success: false, error: 'Failed to get unscreened emails' };
  }
}

/**
 * Auto-classify emails (runs on sync)
 */
export async function autoClassifyEmail(emailId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const [email] = await db
      .select()
      .from(emailsTable)
      .where(eq(emailsTable.id, emailId));

    if (!email) return { success: false, error: 'Email not found' };

    // Check if sender is screened
    const sender = getEmailAddress(email.fromAddress);
    const screeningResult = await getScreeningDecision(sender);

    if (screeningResult.data) {
      // Use screened decision
      const view = screeningResult.data === 'blocked' ? null : screeningResult.data;
      await db
        .update(emailsTable)
        .set({
          heyView: view,
          screeningStatus: 'screened',
        })
        .where(eq(emailsTable.id, emailId));
      
      console.log(`📬 Auto-routed email from ${sender} to: ${
        screeningResult.data === 'imbox' ? '✨ Imbox' :
        screeningResult.data === 'feed' ? '📰 The Feed' :
        screeningResult.data === 'paper_trail' ? '🧾 Paper Trail' :
        '🚫 Blocked'
      } (based on screening decision)`);
    } else {
      // Auto-classify
      const classification = classifyEmail(email);
      await db
        .update(emailsTable)
        .set({
          heyView: classification.view,
          heyCategory: classification.category,
          screeningStatus: classification.view === 'screener' ? 'pending' : 'auto_classified',
        })
        .where(eq(emailsTable.id, emailId));
    }

    return { success: true };
  } catch (error) {
    console.error('Error auto-classifying email:', error);
    return { success: false, error: 'Failed to auto-classify email' };
  }
}
