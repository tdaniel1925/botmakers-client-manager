/**
 * Email Thread Management Server Actions
 * Smart thread bundling, importance scoring, and auto-categorization
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/db';
import { emailsTable, emailThreadsTable } from '@/db/schema/email-schema';
import { eq, and, sql } from 'drizzle-orm';
import { calculateThreadImportance, categorizeEmail } from '@/lib/ai/thread-scoring';

/**
 * Score importance for a thread
 */
export async function scoreThreadImportanceAction(threadId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get thread
    const thread = await db.query.emailThreadsTable.findFirst({
      where: eq(emailThreadsTable.id, threadId),
    });

    if (!thread || thread.userId !== userId) {
      return { success: false, error: 'Thread not found' };
    }

    // Get all emails in thread
    const emails = await db
      .select()
      .from(emailsTable)
      .where(eq(emailsTable.threadId, threadId));

    // Get user email from first email (approximation)
    const userEmail = emails[0]?.userId || userId;

    // Calculate importance
    const scoreResult = calculateThreadImportance(thread, emails, userEmail);

    // Update thread with score
    await db
      .update(emailThreadsTable)
      .set({
        importanceScore: scoreResult.score,
        importanceReason: scoreResult.reason,
      })
      .where(eq(emailThreadsTable.id, threadId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true, score: scoreResult };
  } catch (error: any) {
    console.error('Error scoring thread importance:', error);
    return { success: false, error: error.message || 'Failed to score thread' };
  }
}

/**
 * Score importance for all threads of current user
 */
export async function scoreAllThreadsAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get all threads for user
    const threads = await db
      .select()
      .from(emailThreadsTable)
      .where(eq(emailThreadsTable.userId, userId));

    let scoredCount = 0;

    for (const thread of threads) {
      try {
        // Get all emails in thread
        const emails = await db
          .select()
          .from(emailsTable)
          .where(eq(emailsTable.threadId, thread.id));

        if (emails.length === 0) continue;

        // Calculate importance
        const scoreResult = calculateThreadImportance(thread, emails, userId);

        // Update thread
        await db
          .update(emailThreadsTable)
          .set({
            importanceScore: scoreResult.score,
            importanceReason: scoreResult.reason,
          })
          .where(eq(emailThreadsTable.id, thread.id));

        scoredCount++;
      } catch (error) {
        console.error(`Error scoring thread ${thread.id}:`, error);
        // Continue with next thread
      }
    }

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true, scoredCount, totalThreads: threads.length };
  } catch (error: any) {
    console.error('Error scoring all threads:', error);
    return { success: false, error: error.message || 'Failed to score threads' };
  }
}

/**
 * Categorize an email using AI
 */
export async function categorizeEmailAction(emailId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get email
    const email = await db.query.emailsTable.findFirst({
      where: eq(emailsTable.id, emailId),
    });

    if (!email || email.userId !== userId) {
      return { success: false, error: 'Email not found' };
    }

    // Categorize
    const categoryResult = categorizeEmail(email);

    // Update email
    await db
      .update(emailsTable)
      .set({
        aiCategory: categoryResult.category,
        aiCategoryConfidence: categoryResult.confidence,
      })
      .where(eq(emailsTable.id, emailId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true, category: categoryResult };
  } catch (error: any) {
    console.error('Error categorizing email:', error);
    return { success: false, error: error.message || 'Failed to categorize email' };
  }
}

/**
 * Categorize all emails for current user
 */
export async function categorizeAllEmailsAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get all uncategorized emails
    const emails = await db
      .select()
      .from(emailsTable)
      .where(
        and(
          eq(emailsTable.userId, userId),
          sql`${emailsTable.aiCategory} IS NULL`
        )
      )
      .limit(500); // Process in batches to avoid timeout

    let categorizedCount = 0;

    for (const email of emails) {
      try {
        const categoryResult = categorizeEmail(email);

        await db
          .update(emailsTable)
          .set({
            aiCategory: categoryResult.category,
            aiCategoryConfidence: categoryResult.confidence,
          })
          .where(eq(emailsTable.id, email.id));

        categorizedCount++;
      } catch (error) {
        console.error(`Error categorizing email ${email.id}:`, error);
        // Continue with next email
      }
    }

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true, categorizedCount, totalEmails: emails.length };
  } catch (error: any) {
    console.error('Error categorizing all emails:', error);
    return { success: false, error: error.message || 'Failed to categorize emails' };
  }
}

/**
 * Get category statistics for current user
 */
export async function getCategoryStatsAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const stats = await db
      .select({
        category: emailsTable.aiCategory,
        count: sql<number>`count(*)`,
      })
      .from(emailsTable)
      .where(
        and(
          eq(emailsTable.userId, userId),
          sql`${emailsTable.aiCategory} IS NOT NULL`
        )
      )
      .groupBy(emailsTable.aiCategory);

    return { success: true, stats };
  } catch (error: any) {
    console.error('Error getting category stats:', error);
    return { success: false, error: error.message || 'Failed to get category stats' };
  }
}

/**
 * Get emails by category
 */
export async function getEmailsByCategoryAction(category: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const emails = await db
      .select()
      .from(emailsTable)
      .where(
        and(
          eq(emailsTable.userId, userId),
          eq(emailsTable.aiCategory, category)
        )
      )
      .limit(50);

    return { success: true, emails };
  } catch (error: any) {
    console.error('Error getting emails by category:', error);
    return { success: false, error: error.message || 'Failed to get emails' };
  }
}


