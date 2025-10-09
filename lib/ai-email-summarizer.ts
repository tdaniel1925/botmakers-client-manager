/**
 * AI Email Summarizer
 * Uses OpenAI GPT-4 to generate intelligent email summaries
 */

import OpenAI from 'openai';
import {
  createAISummary,
  getAISummaryByEmailId,
  getAISummaryByThreadId,
} from '@/db/queries/email-sync-queries';
import type { SelectEmail } from '@/db/schema/email-schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
 * Cached for 24 hours
 */
export async function summarizeEmail(
  email: SelectEmail,
  userId: string
): Promise<EmailSummary> {
  try {
    // Check if summary already exists and is not expired
    const existingSummary = await getAISummaryByEmailId(email.id);

    if (existingSummary) {
      return {
        summary: existingSummary.summaryText,
        keyPoints: (existingSummary.keyPoints as string[]) || [],
        actionItems: (existingSummary.actionItems as string[]) || [],
        sentiment: (existingSummary.sentiment as any) || 'neutral',
        urgency: (existingSummary.urgency as any) || 'medium',
        suggestedReply: existingSummary.suggestedReply || undefined,
      };
    }

    // Generate new summary
    const emailContent = buildEmailContext(email);

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

    return analysis;
  } catch (error) {
    console.error('Error summarizing email:', error);

    // Fallback summary
    return {
      summary: email.snippet || email.subject,
      keyPoints: [],
      actionItems: [],
      sentiment: 'neutral',
      urgency: 'medium',
    };
  }
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
Content: ${email.bodyText?.substring(0, 500) || email.snippet || ''}
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
 */
export async function quickSummary(email: SelectEmail): Promise<string> {
  try {
    // Check cache first
    const cached = await getAISummaryByEmailId(email.id);
    if (cached) {
      return cached.summaryText;
    }

    // Use snippet if available
    if (email.snippet && email.snippet.length > 50) {
      return email.snippet.substring(0, 150) + '...';
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

    return response.choices[0]?.message?.content || email.subject;
  } catch (error) {
    console.error('Error generating quick summary:', error);
    return email.snippet || email.subject;
  }
}

