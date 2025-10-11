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
    
    console.log(`\n🎯 SCREENING DECISION:`, {
      decision,
      computedView: view,
      emailAddress,
      userId: userId.substring(0, 10) + '...'
    });
    
    // OPTIMIZED: Query only emails from this sender using SQL LIKE
    // fromAddress is stored as JSON string like: {"email":"sender@example.com","name":"Sender"}
    // We search for the email address within the JSON string
    const startTime = performance.now();
    
    const emailsToUpdate = await db
      .select()
      .from(emailsTable)
      .where(
        and(
          eq(emailsTable.userId, userId),
          sql`${emailsTable.fromAddress}::text LIKE ${`%${emailAddress}%`}`
        )
      );
    
    const queryTime = performance.now() - startTime;
    console.log(`⚡ Query for sender emails took ${queryTime.toFixed(2)}ms`);
    console.log(`🎯 Found ${emailsToUpdate.length} emails to update from ${emailAddress}\n`);
    
    // Verify matches (in case of false positives from LIKE query)
    const verifiedEmails = emailsToUpdate.filter(email => {
      const fromAddr = getEmailAddress(email.fromAddress);
      return fromAddr === emailAddress;
    });
    
    if (verifiedEmails.length !== emailsToUpdate.length) {
      console.log(`⚠️ Filtered out ${emailsToUpdate.length - verifiedEmails.length} false positive matches`);
    }
    
    // Update each verified email
    console.log(`🔄 Updating ${verifiedEmails.length} emails in database...`);
    
    for (const email of verifiedEmails) {
      console.log(`  🔄 Updating email ID: ${email.id}`);
      console.log(`     Current heyView: ${email.heyView}`);
      console.log(`     Will set heyView to: "${view}"`);
      console.log(`     Will set screeningStatus to: "screened"`);
      
      const result = await db
        .update(emailsTable)
        .set({
          heyView: view,
          screeningStatus: 'screened',
        })
        .where(eq(emailsTable.id, email.id))
        .returning();
      
      if (result.length > 0) {
        console.log(`  ✓ CONFIRMED: Email updated successfully`);
        console.log(`     New heyView: ${result[0].heyView}`);
        console.log(`     New screeningStatus: ${result[0].screeningStatus}`);
      } else {
        console.log(`  ⚠️  WARNING: Update returned no rows!`);
      }
      console.log('');
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
    
    return { success: true, updatedCount: verifiedEmails.length };
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
