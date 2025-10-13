/**
 * AI Email Drafter
 * Uses OpenAI GPT-4 to generate intelligent email drafts and replies
 */

import OpenAI from 'openai';
import type { SelectEmail } from '@/db/schema/email-schema';
import type { EmailAddress } from './email-types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// Types
// ============================================================================

export type DraftTone =
  | 'professional'
  | 'casual'
  | 'friendly'
  | 'formal'
  | 'brief'
  | 'detailed';

export interface DraftOptions {
  tone?: DraftTone;
  length?: 'short' | 'medium' | 'long';
  includeSignature?: boolean;
  signature?: string;
  context?: string; // Additional context for the AI
}

export interface DraftedEmail {
  subject: string;
  body: string;
  bodyHtml: string;
  confidence: number; // 0-100
  suggestions?: string[]; // Alternative phrasings or improvements
}

// ============================================================================
// Draft Generation
// ============================================================================

/**
 * Generate reply to an email
 */
export async function draftReply(
  originalEmail: SelectEmail,
  userMessage: string,
  options: DraftOptions = {}
): Promise<DraftedEmail> {
  try {
    const tone = options.tone || 'professional';
    const length = options.length || 'medium';

    const originalContent = buildEmailContext(originalEmail);

    const prompt = `You are helping draft a reply to this email:

${originalContent}

User's instructions: "${userMessage}"

Requirements:
- Tone: ${tone}
- Length: ${length}
- Be clear, concise, and actionable
- Maintain professional email etiquette
${options.context ? `- Context: ${options.context}` : ''}

Generate a complete email reply including:
1. An appropriate subject line (Re: ... or new subject)
2. Email body in plain text
3. Email body in HTML format

Respond in JSON format:
{
  "subject": "...",
  "body": "...",
  "bodyHtml": "...",
  "confidence": 85,
  "suggestions": ["...", "..."]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert email writer. Draft professional, effective emails.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const draft = JSON.parse(content);

    // Add signature if requested
    if (options.includeSignature && options.signature) {
      draft.body += `\n\n${options.signature}`;
      draft.bodyHtml += `<br><br><div class="signature">${options.signature}</div>`;
    }

    return draft;
  } catch (error) {
    console.error('Error drafting reply:', error);

    // Fallback draft
    return {
      subject: `Re: ${originalEmail.subject}`,
      body: userMessage,
      bodyHtml: `<p>${userMessage}</p>`,
      confidence: 50,
    };
  }
}

/**
 * Generate new email from scratch
 */
export async function draftNewEmail(
  prompt: string,
  options: DraftOptions = {}
): Promise<DraftedEmail> {
  try {
    const tone = options.tone || 'professional';
    const length = options.length || 'medium';

    const systemPrompt = `You are an expert email writer. Draft professional, effective emails.

Requirements:
- Tone: ${tone}
- Length: ${length}
- Be clear, concise, and actionable
${options.context ? `- Context: ${options.context}` : ''}

Generate a complete email including:
1. Subject line
2. Email body in plain text
3. Email body in HTML format
4. Confidence score (0-100)
5. Suggestions for improvement

Respond in JSON format:
{
  "subject": "...",
  "body": "...",
  "bodyHtml": "...",
  "confidence": 85,
  "suggestions": ["...", "..."]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const draft = JSON.parse(content);

    // Add signature if requested
    if (options.includeSignature && options.signature) {
      draft.body += `\n\n${options.signature}`;
      draft.bodyHtml += `<br><br><div class="signature">${options.signature}</div>`;
    }

    return draft;
  } catch (error) {
    console.error('Error drafting new email:', error);

    return {
      subject: 'New Email',
      body: prompt,
      bodyHtml: `<p>${prompt}</p>`,
      confidence: 50,
    };
  }
}

/**
 * Generate quick reply suggestions
 * For common responses like "Thanks!", "Will do", "Got it", etc.
 */
export async function generateQuickReplies(
  originalEmail: SelectEmail
): Promise<string[]> {
  try {
    const originalContent = buildEmailContext(originalEmail).substring(0, 500);

    const prompt = `Generate 5 quick reply options for this email. Each should be 1-2 sentences, professional, and contextually appropriate.

Email:
${originalContent}

Respond in JSON format:
{
  "replies": ["...", "...", "...", "...", "..."]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Generate brief, professional email replies.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return [];
    }

    const result = JSON.parse(content);
    return result.replies || [];
  } catch (error) {
    console.error('Error generating quick replies:', error);
    return [
      'Thank you for reaching out.',
      'Got it, thanks!',
      'Will do.',
      'Sounds good.',
      'Let me look into this and get back to you.',
    ];
  }
}

/**
 * Improve existing draft
 * Refines user-written email for clarity, tone, grammar
 */
export async function improveDraft(
  draftText: string,
  improvements: string[]
): Promise<DraftedEmail> {
  try {
    const improvementsList = improvements.join(', ');

    const prompt = `Improve this email draft:

${draftText}

Improvements requested: ${improvementsList}

Maintain the core message but enhance:
- Clarity
- Tone
- Grammar
- Professional presentation

Respond in JSON format:
{
  "subject": "..." (keep original or suggest better),
  "body": "...",
  "bodyHtml": "...",
  "confidence": 90,
  "suggestions": ["what was improved", "..."]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an email editor. Improve drafts while maintaining the author\'s voice.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error improving draft:', error);

    return {
      subject: 'Improved Draft',
      body: draftText,
      bodyHtml: `<p>${draftText}</p>`,
      confidence: 50,
    };
  }
}

/**
 * Generate email from template with AI filling
 */
export async function fillEmailTemplate(
  template: string,
  variables: Record<string, string>
): Promise<string> {
  try {
    const variablesList = Object.entries(variables)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const prompt = `Fill this email template with the provided variables. Replace placeholders intelligently and make it sound natural.

Template:
${template}

Variables:
${variablesList}

Return only the filled email text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You fill email templates naturally and professionally.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 800,
    });

    return response.choices[0]?.message?.content || template;
  } catch (error) {
    console.error('Error filling template:', error);
    return template;
  }
}

/**
 * Check if draft needs review before sending
 * Returns warnings or suggestions
 */
export async function reviewDraft(draft: string): Promise<{
  needsReview: boolean;
  warnings: string[];
  suggestions: string[];
  confidence: number;
}> {
  try {
    const prompt = `Review this email draft for potential issues:

${draft}

Check for:
- Unclear or confusing language
- Potentially offensive content
- Missing information
- Tone issues
- Grammar errors
- Attachments mentioned but not included (clues in text)

Respond in JSON format:
{
  "needsReview": true/false,
  "warnings": ["...", "..."],
  "suggestions": ["...", "..."],
  "confidence": 85
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an email quality reviewer. Be helpful but not overly critical.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return {
        needsReview: false,
        warnings: [],
        suggestions: [],
        confidence: 100,
      };
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error reviewing draft:', error);

    return {
      needsReview: false,
      warnings: [],
      suggestions: [],
      confidence: 100,
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build email context for AI
 */
function buildEmailContext(email: SelectEmail): string {
  const from = typeof email.fromAddress === 'object'
    ? `${email.fromAddress.name || ''} <${email.fromAddress.email}>`
    : email.fromAddress;

  return `
From: ${from}
Subject: ${email.subject}
Date: ${email.receivedAt?.toISOString()}

${email.bodyText || email.snippet || ''}
  `.trim();
}

/**
 * Generate email with specific purpose
 */
export async function generatePurposeEmail(
  purpose: string,
  details: Record<string, any>
): Promise<DraftedEmail> {
  const purposePrompts: Record<string, string> = {
    'thank-you': 'Write a professional thank you email.',
    'follow-up': 'Write a polite follow-up email.',
    'introduction': 'Write a professional introduction email.',
    'meeting-request': 'Write an email requesting a meeting.',
    'apology': 'Write a sincere apology email.',
    'congratulations': 'Write a congratulations email.',
    'announcement': 'Write an announcement email.',
  };

  const basePrompt = purposePrompts[purpose] || 'Write a professional email.';
  const detailsText = Object.entries(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return draftNewEmail(`${basePrompt}\n\nDetails:\n${detailsText}`);
}






