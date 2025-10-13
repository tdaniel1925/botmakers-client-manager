/**
 * AI Email Summarizer
 * Uses OpenAI GPT-4 to generate intelligent email summaries
 * With in-memory caching and request deduplication
 */

import OpenAI from 'openai';
import {
  createAISummary,
  getAISummaryByEmailId,
  getAISummaryByThreadId,
} from '@/db/queries/email-sync-queries';
import type { SelectEmail } from '@/db/schema/email-schema';
import { db } from '@/db/db';
import { emailAttachmentsTable } from '@/db/schema/email-schema';
import { eq } from 'drizzle-orm';
import { extractMultipleAttachments, formatAttachmentsForAI } from './attachment-extractor';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory cache for ultra-fast access
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Request deduplication - prevent multiple concurrent requests for same email
const pendingRequests = new Map<string, Promise<any>>();

function getCachedValue<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  
  // Check if expired
  if (Date.now() - cached.timestamp > MEMORY_CACHE_TTL) {
    memoryCache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

function setCachedValue(key: string, data: any): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

async function dedupRequest<T>(key: string, fn: () => Promise<T>): Promise<T> {
  // Check if request is already pending
  const pending = pendingRequests.get(key);
  if (pending) {
    return pending as Promise<T>;
  }
  
  // Create new request
  const promise = fn().finally(() => {
    // Remove from pending when done
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
}

// ============================================================================
// Email Summarization
// ============================================================================

export interface EmailSummary {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  suggestedReply?: string;
}

/**
 * Generate AI summary for an email
 * Cached for 24 hours with in-memory cache layer
 */
export async function summarizeEmail(
  email: SelectEmail,
  userId: string
): Promise<EmailSummary> {
  const cacheKey = `email-summary-${email.id}`;
  
  // Check in-memory cache first
  const memoryCached = getCachedValue<EmailSummary>(cacheKey);
  if (memoryCached) {
    return memoryCached;
  }
  
  // Use request deduplication
  return dedupRequest(cacheKey, async () => {
    try {
      // Check if summary already exists in database
      const existingSummary = await getAISummaryByEmailId(email.id);

      if (existingSummary) {
        const summary = {
          summary: existingSummary.summaryText,
          keyPoints: (existingSummary.keyPoints as string[]) || [],
          actionItems: (existingSummary.actionItems as string[]) || [],
          sentiment: (existingSummary.sentiment as any) || 'neutral',
          urgency: (existingSummary.urgency as any) || 'medium',
          suggestedReply: existingSummary.suggestedReply || undefined,
        };
        setCachedValue(cacheKey, summary);
        return summary;
      }

    // Generate new summary with attachment content
    let emailContent = buildEmailContext(email);
    
    // Fetch and extract attachment content if email has attachments
    if (email.hasAttachments) {
      try {
        const attachments = await db
          .select()
          .from(emailAttachmentsTable)
          .where(eq(emailAttachmentsTable.emailId, email.id));
        
        if (attachments.length > 0) {
          const extractedContent = await extractMultipleAttachments(attachments as any);
          const attachmentContext = formatAttachmentsForAI(extractedContent);
          emailContent += attachmentContext;
        }
      } catch (error) {
        console.error('Error extracting attachment content:', error);
        // Continue without attachment content
      }
    }

    const prompt = `Analyze this email and provide:
1. A concise 2-3 sentence summary
2. Key points (max 5, bullet points)
3. Action items required (if any)
4. Sentiment (positive/neutral/negative)
5. Urgency level (low/medium/high/urgent)
6. Suggested professional reply (if appropriate)

Email:
${emailContent}

Respond in JSON format:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "actionItems": ["...", "..."],
  "sentiment": "positive|neutral|negative",
  "urgency": "low|medium|high|urgent",
  "suggestedReply": "..." or null
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an AI email analyst. Provide concise, accurate analysis of emails.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(content) as EmailSummary;

    // Cache the summary (expires in 24 hours)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await createAISummary({
      emailId: email.id,
      userId,
      summaryText: analysis.summary,
      keyPoints: analysis.keyPoints as any,
      actionItems: analysis.actionItems as any,
      sentiment: analysis.sentiment as any,
      urgency: analysis.urgency as any,
      suggestedReply: analysis.suggestedReply || null,
      expiresAt,
    });

    // Store in memory cache
    setCachedValue(cacheKey, analysis);
    
    return analysis;
    } catch (error) {
      console.error('Error summarizing email:', error);

      // Fallback summary
      const fallback = {
        summary: email.snippet || email.subject,
        keyPoints: [],
        actionItems: [],
        sentiment: 'neutral' as const,
        urgency: 'medium' as const,
      };
      
      setCachedValue(cacheKey, fallback);
      return fallback;
    }
  });
}

/**
 * Generate AI summary for an email thread
 */
export async function summarizeThread(
  emails: SelectEmail[],
  threadId: string,
  userId: string
): Promise<{
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  participants: string[];
  timeline: string[];
}> {
  try {
    // Check if summary already exists
    const existingSummary = await getAISummaryByThreadId(threadId);

    if (existingSummary) {
      return {
        summary: existingSummary.summaryText,
        keyPoints: (existingSummary.keyPoints as string[]) || [],
        actionItems: (existingSummary.actionItems as string[]) || [],
        participants: [],
        timeline: [],
      };
    }

    // Build thread context
    const threadContext = emails
      .map((email, index) => {
        const from = typeof email.fromAddress === 'object' 
          ? email.fromAddress.email 
          : email.fromAddress;
        
        return `
Message ${index + 1} - From: ${from}
Subject: ${email.subject}
Date: ${email.receivedAt?.toISOString()}
Content: ${(email.bodyText as any)?.substring(0, 500) || email.snippet || ''}
---`;
      })
      .join('\n');

    const prompt = `Analyze this email thread and provide:
1. Overall thread summary (3-4 sentences)
2. Key discussion points
3. Action items or next steps
4. Main participants
5. Timeline of key events

Thread (${emails.length} messages):
${threadContext}

Respond in JSON format:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "actionItems": ["...", "..."],
  "participants": ["...", "..."],
  "timeline": ["...", "..."]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI thread analyst. Provide clear, actionable summaries of email conversations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(content);

    // Cache the summary (expires in 24 hours)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await createAISummary({
      threadId,
      userId,
      summaryText: analysis.summary,
      keyPoints: analysis.keyPoints as any,
      actionItems: analysis.actionItems as any,
      expiresAt,
    });

    return analysis;
  } catch (error) {
    console.error('Error summarizing thread:', error);

    // Fallback
    return {
      summary: `Thread with ${emails.length} messages`,
      keyPoints: [],
      actionItems: [],
      participants: [],
      timeline: [],
    };
  }
}

/**
 * Categorize email using AI
 */
export async function categorizeEmail(email: SelectEmail): Promise<{
  category: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}> {
  try {
    const emailContent = buildEmailContext(email);

    const prompt = `Categorize this email:

Email:
${emailContent}

Provide:
1. Category (Work, Personal, Marketing, Support, Newsletter, etc.)
2. Relevant tags (max 3)
3. Priority level

Respond in JSON format:
{
  "category": "...",
  "tags": ["...", "..."],
  "priority": "low|medium|high|urgent"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an email categorization AI. Be precise and consistent.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error categorizing email:', error);

    return {
      category: 'Uncategorized',
      tags: [],
      priority: 'medium',
    };
  }
}

/**
 * Extract action items from email
 */
export async function extractActionItems(email: SelectEmail): Promise<string[]> {
  try {
    const emailContent = buildEmailContext(email);

    const prompt = `Extract action items from this email. List only specific, actionable tasks.

Email:
${emailContent}

Respond with JSON array of action items:
{
  "actionItems": ["...", "...", "..."]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an action item extraction AI. Only list clear, specific action items.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return [];
    }

    const result = JSON.parse(content);
    return result.actionItems || [];
  } catch (error) {
    console.error('Error extracting action items:', error);
    return [];
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build email context for AI analysis
 */
function buildEmailContext(email: SelectEmail): string {
  const from = typeof email.fromAddress === 'object'
    ? `${email.fromAddress.name || ''} <${email.fromAddress.email}>`
    : email.fromAddress;

  const to = Array.isArray(email.toAddresses)
    ? email.toAddresses.map((addr: any) => addr.email || addr).join(', ')
    : '';

  return `
From: ${from}
To: ${to}
Subject: ${email.subject}
Date: ${email.receivedAt?.toISOString()}

${email.bodyText || email.snippet || '(No content)'}
  `.trim();
}

/**
 * Quick summary (for hover popups)
 * Generates ultra-fast 1-2 sentence summary
 * With in-memory caching and request deduplication
 */
export async function quickSummary(email: SelectEmail): Promise<string> {
  const cacheKey = `quick-summary-${email.id}`;
  
  // Check in-memory cache first (5 min TTL)
  const memoryCached = getCachedValue<string>(cacheKey);
  if (memoryCached) {
    return memoryCached;
  }
  
  // Use request deduplication to prevent concurrent requests
  return dedupRequest(cacheKey, async () => {
    try {
      // Check database cache
      const cached = await getAISummaryByEmailId(email.id);
      if (cached) {
        const summary = cached.summaryText;
        setCachedValue(cacheKey, summary);
        return summary;
      }

      // Use snippet if available
      if (email.snippet && email.snippet.length > 50) {
        const snippet = email.snippet.substring(0, 150) + '...';
        setCachedValue(cacheKey, snippet);
        return snippet;
      }

      // Generate quick summary
      const emailContent = buildEmailContext(email).substring(0, 500);

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Faster, cheaper model
        messages: [
          {
            role: 'system',
            content: 'Summarize this email in 1-2 sentences. Be concise.',
          },
          {
            role: 'user',
            content: emailContent,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      });

      const summary = response.choices[0]?.message?.content || email.subject;
      setCachedValue(cacheKey, summary);
      return summary;
    } catch (error) {
      console.error('Error generating quick summary:', error);
      const fallback = email.snippet || email.subject;
      setCachedValue(cacheKey, fallback);
      return fallback;
    }
  });
}






