/**
 * Email Insights Server Actions
 * Provides context, sender insights, and related emails
 * With in-memory caching for faster subsequent requests
 */

'use server';

import { db } from '@/db/db';
import { emailsTable, emailThreadsTable, emailAttachmentsTable } from '@/db/schema/email-schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { formatDistanceToNow } from 'date-fns';

interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// In-memory cache for email insights with aggressive TTL for instant loading
const insightsCache = new Map<string, { data: any; timestamp: number }>();
const INSIGHTS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes for most queries (emails don't change often)
const RELATED_EMAILS_CACHE_TTL = 60 * 60 * 1000; // 60 minutes for related emails (very stable)

function getCachedInsight<T>(key: string, customTTL?: number): T | null {
  const cached = insightsCache.get(key);
  if (!cached) return null;
  
  const ttl = customTTL || INSIGHTS_CACHE_TTL;
  if (Date.now() - cached.timestamp > ttl) {
    insightsCache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

function setCachedInsight(key: string, data: any): void {
  insightsCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Get thread context for an email
 */
export async function getThreadContextAction(emailId: string): Promise<ActionResult> {
  try {
    // Check cache first
    const cacheKey = `thread-context-${emailId}`;
    const cached = getCachedInsight<ActionResult>(cacheKey);
    if (cached) return cached;

    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the email
    const [email] = await db
      .select()
      .from(emailsTable)
      .where(eq(emailsTable.id, emailId));

    if (!email || !email.threadId) {
      return { success: false, error: 'Email or thread not found' };
    }

    // Get all emails in the thread
    const threadEmails = await db
      .select()
      .from(emailsTable)
      .where(eq(emailsTable.threadId, email.threadId))
      .orderBy(desc(emailsTable.receivedAt));

    // Get unique participants
    const participants = new Set<string>();
    threadEmails.forEach((e) => {
      if (e.fromAddress) {
        const from = typeof e.fromAddress === 'string' 
          ? e.fromAddress 
          : e.fromAddress.email;
        participants.add(from);
      }
    });

    const firstEmail = threadEmails[threadEmails.length - 1];
    const threadAge = firstEmail?.receivedAt
      ? formatDistanceToNow(new Date(firstEmail.receivedAt), { addSuffix: false })
      : 'Unknown';

    const result = {
      success: true,
      data: {
        messageCount: threadEmails.length,
        participantCount: participants.size,
        threadAge,
      },
    };

    // Cache the result
    setCachedInsight(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error getting thread context:', error);
    return { success: false, error: 'Failed to get thread context' };
  }
}

/**
 * Get sender insights
 */
export async function getSenderInsightsAction(emailId: string): Promise<ActionResult> {
  try {
    // Check cache first
    const cacheKey = `sender-insights-${emailId}`;
    const cached = getCachedInsight<ActionResult>(cacheKey);
    if (cached) return cached;

    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the email
    const [email] = await db
      .select()
      .from(emailsTable)
      .where(eq(emailsTable.id, emailId));

    if (!email) {
      return { success: false, error: 'Email not found' };
    }

    const senderEmail = typeof email.fromAddress === 'string'
      ? email.fromAddress
      : email.fromAddress?.email;

    if (!senderEmail) {
      return { success: false, error: 'Sender not found' };
    }

    // Count total emails from this sender
    const senderEmails = await db
      .select()
      .from(emailsTable)
      .where(
        and(
          eq(emailsTable.accountId, email.accountId),
          sql`${emailsTable.fromAddress}::text LIKE ${'%' + senderEmail + '%'}`
        )
      );

    const emailCount = senderEmails.length;
    
    // Determine frequency
    let frequency = 'Occasional';
    if (emailCount > 50) frequency = 'Very frequent';
    else if (emailCount > 20) frequency = 'Frequent';
    else if (emailCount > 10) frequency = 'Regular';

    const result = {
      success: true,
      data: {
        emailCount,
        communicationFrequency: frequency,
      },
    };

    // Cache the result
    setCachedInsight(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error getting sender insights:', error);
    return { success: false, error: 'Failed to get sender insights' };
  }
}

/**
 * Get related emails (same sender, last 7 days)
 */
export async function getRelatedEmailsAction(emailId: string): Promise<ActionResult> {
  try {
    // Check cache first with longer TTL (related emails rarely change)
    const cacheKey = `related-emails-${emailId}`;
    const cached = getCachedInsight<ActionResult>(cacheKey, RELATED_EMAILS_CACHE_TTL);
    if (cached) return cached;

    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the email
    const [email] = await db
      .select()
      .from(emailsTable)
      .where(eq(emailsTable.id, emailId));

    if (!email) {
      return { success: false, error: 'Email not found' };
    }

    const senderEmail = typeof email.fromAddress === 'string'
      ? email.fromAddress
      : email.fromAddress?.email;

    if (!senderEmail) {
      return { success: false };
    }

    // Get emails from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const relatedEmails = await db
      .select({
        id: emailsTable.id,
        subject: emailsTable.subject,
        receivedAt: emailsTable.receivedAt,
      })
      .from(emailsTable)
      .where(
        and(
          eq(emailsTable.accountId, email.accountId),
          sql`${emailsTable.fromAddress}::text LIKE ${'%' + senderEmail + '%'}`,
          sql`${emailsTable.receivedAt} > ${sevenDaysAgo.toISOString()}`
        )
      )
      .orderBy(desc(emailsTable.receivedAt))
      .limit(5);

    const result = {
      success: true,
      data: relatedEmails,
    };

    // Cache the result
    setCachedInsight(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error getting related emails:', error);
    return { success: false, error: 'Failed to get related emails' };
  }
}

/**
 * Get full thread messages for an email
 */
export async function getThreadMessagesAction(emailId: string): Promise<ActionResult> {
  try {
    // Check cache first
    const cacheKey = `thread-messages-${emailId}`;
    const cached = getCachedInsight<ActionResult>(cacheKey);
    if (cached) return cached;

    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the email
    const [email] = await db
      .select()
      .from(emailsTable)
      .where(eq(emailsTable.id, emailId));

    if (!email || !email.threadId) {
      return { success: false, error: 'Email or thread not found' };
    }

    // Get all emails in the thread, ordered chronologically
    const threadMessages = await db
      .select({
        id: emailsTable.id,
        subject: emailsTable.subject,
        fromAddress: emailsTable.fromAddress,
        toAddresses: emailsTable.toAddresses,
        bodyText: emailsTable.bodyText,
        bodyHtml: emailsTable.bodyHtml,
        snippet: emailsTable.snippet,
        receivedAt: emailsTable.receivedAt,
        hasAttachments: emailsTable.hasAttachments,
        isRead: emailsTable.isRead,
      })
      .from(emailsTable)
      .where(eq(emailsTable.threadId, email.threadId))
      .orderBy(emailsTable.receivedAt); // Chronological order

    const result = {
      success: true,
      data: threadMessages,
    };

    // Cache the result
    setCachedInsight(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error getting thread messages:', error);
    return { success: false, error: 'Failed to get thread messages' };
  }
}

/**
 * Generate quick reply suggestions
 */
export async function generateQuickRepliesAction(emailId: string): Promise<ActionResult> {
  try {
    // Check cache first
    const cacheKey = `quick-replies-${emailId}`;
    const cached = getCachedInsight<ActionResult>(cacheKey);
    if (cached) return cached;

    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the email
    const [email] = await db
      .select()
      .from(emailsTable)
      .where(eq(emailsTable.id, emailId));

    if (!email) {
      return { success: false, error: 'Email not found' };
    }

    // Generate simple quick replies based on email content
    const replies = [];
    
    // Check for attachments
    if (email.hasAttachments) {
      const attachments = await db
        .select()
        .from(emailAttachmentsTable)
        .where(eq(emailAttachmentsTable.emailId, emailId));
      
      if (attachments.length > 0) {
        const fileNames = attachments.map(a => a.filename).join(', ');
        replies.push(`Thanks for sending ${attachments.length > 1 ? 'these files' : 'this file'}. I'll review ${attachments.length > 1 ? 'them' : 'it'} and get back to you.`);
      }
    }
    
    // Check for questions
    if (email.bodyText?.includes('?') || email.subject?.includes('?')) {
      replies.push('Thank you for reaching out. Let me get back to you with the details.');
    }

    // Check for meeting/schedule
    if (
      email.bodyText?.toLowerCase().includes('meeting') ||
      email.bodyText?.toLowerCase().includes('schedule') ||
      email.subject?.toLowerCase().includes('meeting')
    ) {
      replies.push('That time works for me. I\'ve added it to my calendar.');
    }

    // Check for thanks/appreciation
    if (
      email.bodyText?.toLowerCase().includes('thank') ||
      email.subject?.toLowerCase().includes('thank')
    ) {
      replies.push('You\'re welcome! Happy to help.');
    }

    // Default replies
    if (replies.length === 0) {
      replies.push('Thanks for your email. I\'ll review and get back to you shortly.');
      replies.push('Received. I\'ll take a look at this and follow up.');
    }

    const result = {
      success: true,
      data: replies.slice(0, 3),
    };

    // Cache the result
    setCachedInsight(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error generating quick replies:', error);
    return { success: false, error: 'Failed to generate quick replies' };
  }
}
