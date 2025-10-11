/**
 * Background AI Email Analysis Generator
 * Pre-generates AI analysis when emails arrive for instant popup loading
 */

'use server';

import { db } from '@/db/db';
import { emailsTable } from '@/db/schema/email-schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import type { SmartAction } from '@/actions/email-smart-actions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface EmailForAI {
  id: string;
  subject: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  fromAddress: any;
  hasAttachments: boolean;
}

/**
 * Generate AI analysis for a single email
 * Called when email arrives or when first viewed
 */
export async function generateEmailAI(emailId: string): Promise<void> {
  try {
    console.log(`🤖 Starting AI generation for email: ${emailId.substring(0, 8)}...`);
    const startTime = Date.now();

    // Get email from database
    const [email] = await db
      .select()
      .from(emailsTable)
      .where(eq(emailsTable.id, emailId));

    if (!email) {
      console.error(`❌ Email not found: ${emailId}`);
      return;
    }

    // Skip if AI already generated in last 24 hours
    if (email.aiGeneratedAt) {
      const hoursSinceGeneration = (Date.now() - new Date(email.aiGeneratedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceGeneration < 24) {
        console.log(`✓ AI already generated ${hoursSinceGeneration.toFixed(1)}h ago, skipping`);
        return;
      }
    }

    // Generate AI analysis in parallel
    const [quickReplies, smartActions] = await Promise.all([
      generateQuickRepliesAI(email),
      generateSmartActionsAI(email),
    ]);

    // Store in database
    await db
      .update(emailsTable)
      .set({
        aiQuickReplies: quickReplies,
        aiSmartActions: smartActions,
        aiGeneratedAt: new Date(),
      })
      .where(eq(emailsTable.id, emailId));

    const endTime = Date.now();
    console.log(`✅ AI generated in ${endTime - startTime}ms for ${emailId.substring(0, 8)}...`);
  } catch (error) {
    console.error(`❌ Failed to generate AI for ${emailId}:`, error);
  }
}

/**
 * Generate AI quick replies - CONTEXTUAL to email content
 */
async function generateQuickRepliesAI(email: EmailForAI): Promise<string[]> {
  try {
    const senderEmail = typeof email.fromAddress === 'object' 
      ? email.fromAddress.email 
      : email.fromAddress;
    
    const senderName = typeof email.fromAddress === 'object' 
      ? email.fromAddress.name || senderEmail.split('@')[0]
      : senderEmail.split('@')[0];

    const emailBody = email.bodyText?.substring(0, 800) || email.bodyHtml?.substring(0, 800) || '';

    const prompt = `You are writing quick reply suggestions for an email. Analyze the email and generate 3 SPECIFIC, CONTEXTUAL replies that directly address what the sender said or asked.

IMPORTANT RULES:
1. Read the email carefully and understand what it's about
2. If they ask questions, your replies should answer them
3. If they request something, acknowledge and respond to that request
4. If they share information, acknowledge it specifically
5. Be natural, professional, and conversational
6. Each reply should be different (positive response, neutral response, request more info)
7. Keep replies 1-2 sentences maximum
8. DO NOT use generic replies - be SPECIFIC to this email

Email Details:
From: ${senderName}
Subject: ${email.subject}
Body:
${emailBody}

Has Attachments: ${email.hasAttachments ? 'Yes' : 'No'}

Examples of GOOD contextual replies:
- If email asks "Can we meet Tuesday?": ["Tuesday works great! What time?", "I'm available Tuesday afternoon - does 2pm work?", "Tuesday is tight for me, but Wednesday is wide open. Would that work?"]
- If email shares a receipt: ["Thanks for sending the receipt! I've filed it.", "Got it, thanks! I'll review the charges.", "Received - everything looks good!"]
- If email is a question about a project: ["Good question! The deadline is next Friday.", "Let me check with the team and get back to you.", "I'll look into this and follow up by EOD."]

Now generate 3 contextual replies for the email above.

Return ONLY valid JSON array, no other text:
["reply 1", "reply 2", "reply 3"]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at writing contextual, specific email replies. You analyze the email content and generate replies that directly address what was said. Never give generic responses.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8, // Higher temperature for more variety
      max_tokens: 300, // More tokens for detailed replies
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (content) {
      try {
        // Try to extract JSON array from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const replies = JSON.parse(jsonMatch[0]);
          if (Array.isArray(replies) && replies.length > 0) {
            console.log('✅ Generated contextual quick replies:', replies);
            return replies.slice(0, 3);
          }
        }
      } catch (e) {
        console.warn('Failed to parse quick replies JSON:', e);
      }
    }
  } catch (error) {
    console.error('Error generating quick replies:', error);
  }

  // Fallback: Generate rule-based contextual replies
  return generateContextualFallbackReplies(email);
}

/**
 * Generate contextual fallback replies based on email content (no AI)
 */
function generateContextualFallbackReplies(email: EmailForAI): string[] {
  const subject = (email.subject || '').toLowerCase();
  const body = (email.bodyText || email.bodyHtml || '').toLowerCase();
  const senderName = typeof email.fromAddress === 'object'
    ? email.fromAddress.name?.split(' ')[0] || 'there'
    : 'there';

  const replies: string[] = [];

  // Check for questions
  if (body.includes('?') || subject.includes('?')) {
    replies.push(`Thanks for reaching out! Let me look into this and get back to you.`);
    replies.push(`Good question! I'll check on this and follow up soon.`);
  }

  // Check for meeting requests
  if (body.includes('meet') || body.includes('call') || body.includes('schedule')) {
    replies.push(`I'd be happy to meet! What times work best for you?`);
    replies.push(`Let me check my calendar and propose some times.`);
  }

  // Check for attachments
  if (email.hasAttachments) {
    replies.push(`Thanks for sending this! I'll review and get back to you.`);
    replies.push(`Got it, thanks! I'll take a look at the attachment.`);
  }

  // Check for thanks/appreciation
  if (body.includes('thank') || subject.includes('thank')) {
    replies.push(`You're very welcome! Happy to help.`);
    replies.push(`My pleasure! Let me know if you need anything else.`);
  }

  // Check for FYI/informational
  if (body.includes('fyi') || subject.includes('fyi') || body.includes('just wanted to let you know')) {
    replies.push(`Thanks for the heads up!`);
    replies.push(`Noted, thanks for letting me know.`);
  }

  // Default contextual replies
  if (replies.length === 0) {
    replies.push(`Thanks ${senderName}! I'll review this and follow up.`);
    replies.push(`Got it, thanks! I'll take a look and get back to you.`);
    replies.push(`Appreciate you sending this over. Let me check and respond soon.`);
  }

  return replies.slice(0, 3);
}

/**
 * Generate AI smart actions
 */
async function generateSmartActionsAI(email: EmailForAI): Promise<SmartAction[]> {
  try {
    const emailContent = `
Subject: ${email.subject}
Body: ${email.bodyText?.substring(0, 600) || email.bodyHtml?.substring(0, 600)}
Has Attachments: ${email.hasAttachments}
`;

    const prompt = `Analyze this email and suggest 3-5 contextually relevant actions. Be specific and practical.

Email:
${emailContent}

Return ONLY valid JSON in this exact format:
{
  "actions": [
    {
      "icon": "Calendar",
      "label": "Add to Calendar",
      "description": "Create calendar event",
      "action": "add_to_calendar",
      "color": "green"
    }
  ]
}

Available icons: Calendar, ListTodo, Receipt, FolderPlus, UserPlus, ShoppingCart, MapPin, Phone, Download
Colors: blue, green, purple, orange, red`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You generate contextual email actions. Always return valid JSON with the exact structure requested.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (content) {
      try {
        const result = JSON.parse(content);
        if (result.actions && Array.isArray(result.actions)) {
          return result.actions.slice(0, 5);
        }
      } catch (e) {
        console.warn('Failed to parse smart actions JSON, using fallback');
      }
    }
  } catch (error) {
    console.error('Error generating smart actions:', error);
  }

  // Fallback to rule-based actions
  return generateFallbackSmartActions(email);
}

/**
 * Fallback rule-based smart actions
 */
function generateFallbackSmartActions(email: EmailForAI): SmartAction[] {
  const actions: SmartAction[] = [];
  const bodyText = (email.bodyText || '').toLowerCase();
  const subject = (email.subject || '').toLowerCase();
  
  if (email.hasAttachments) {
    actions.push({
      icon: 'Download',
      label: 'Download All',
      description: 'Save all attachments',
      action: 'download_attachments',
      color: 'blue',
    });
  }
  
  if (bodyText.includes('meeting') || bodyText.includes('event') || subject.includes('meeting')) {
    actions.push({
      icon: 'Calendar',
      label: 'Add to Calendar',
      description: 'Create calendar event',
      action: 'add_to_calendar',
      color: 'green',
    });
  }
  
  actions.push({
    icon: 'Reply',
    label: 'Quick Reply',
    description: 'Send a response',
    action: 'reply',
    color: 'blue',
  });
  
  return actions;
}

/**
 * Generate AI for multiple emails in batch (viewport emails)
 */
export async function generateBatchEmailAI(emailIds: string[]): Promise<void> {
  console.log(`🚀 Batch AI generation for ${emailIds.length} emails`);
  
  // Process in parallel but limit concurrency to avoid overwhelming API
  const batchSize = 3;
  for (let i = 0; i < emailIds.length; i += batchSize) {
    const batch = emailIds.slice(i, i + batchSize);
    await Promise.all(batch.map(id => generateEmailAI(id)));
    
    // Small delay between batches
    if (i + batchSize < emailIds.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`✅ Batch AI generation complete`);
}

/**
 * Check if email needs AI generation
 */
export async function needsAIGeneration(emailId: string): Promise<boolean> {
  const [email] = await db
    .select({
      aiGeneratedAt: emailsTable.aiGeneratedAt,
    })
    .from(emailsTable)
    .where(eq(emailsTable.id, emailId));

  if (!email) return false;
  
  // Generate if never generated
  if (!email.aiGeneratedAt) return true;
  
  // Regenerate if older than 7 days
  const daysSince = (Date.now() - new Date(email.aiGeneratedAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince > 7;
}

