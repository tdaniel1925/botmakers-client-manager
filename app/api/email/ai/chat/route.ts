/**
 * AI Email Assistant Chat API
 * Powered by OpenAI GPT-4 with full email context
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { db } from '@/db/db';
import { emailsTable, emailAccountsTable, emailFoldersTable } from '@/db/schema/email-schema';
import { eq, and, desc } from 'drizzle-orm';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // requests per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      message,
      accountId,
      selectedEmailId,
      conversationHistory = [],
      includeAllEmails = false,
    } = body;

    if (!message || !accountId) {
      return NextResponse.json(
        { error: 'Message and accountId are required' },
        { status: 400 }
      );
    }

    // Build comprehensive context
    const context = await buildEmailContext(userId, accountId, selectedEmailId, includeAllEmails);

    // Prepare messages for OpenAI
    const systemPrompt = buildSystemPrompt(context);
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';

    return NextResponse.json({
      success: true,
      response: aiResponse,
      tokensUsed: completion.usage?.total_tokens || 0,
    });

  } catch (error: any) {
    console.error('AI Chat Error:', error);
    
    // Handle OpenAI API errors
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'OpenAI rate limit exceeded. Please try again shortly.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process AI request', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Build comprehensive email context for AI
 */
async function buildEmailContext(
  userId: string,
  accountId: string,
  selectedEmailId?: string,
  includeAllEmails = false
) {
  try {
    // Get account info
    const account = await db.query.emailAccountsTable.findFirst({
      where: and(
        eq(emailAccountsTable.id, accountId),
        eq(emailAccountsTable.userId, userId)
      ),
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Get folders
    const folders = await db.query.emailFoldersTable.findMany({
      where: eq(emailFoldersTable.accountId, accountId),
    });

    // Get selected email (if provided)
    let selectedEmail = null;
    if (selectedEmailId) {
      selectedEmail = await db.query.emailsTable.findFirst({
        where: and(
          eq(emailsTable.id, selectedEmailId),
          eq(emailsTable.accountId, accountId)
        ),
      });
    }

    // Get recent emails (last 50 or all if requested)
    const emailLimit = includeAllEmails ? 500 : 50;
    const recentEmails = await db.query.emailsTable.findMany({
      where: eq(emailsTable.accountId, accountId),
      orderBy: [desc(emailsTable.receivedAt)],
      limit: emailLimit,
    });

    // Calculate statistics
    const stats = {
      totalEmails: recentEmails.length,
      unreadCount: recentEmails.filter(e => !e.isRead).length,
      importantCount: recentEmails.filter(e => e.isImportant).length,
      starredCount: recentEmails.filter(e => e.isStarred).length,
      folderCount: folders.length,
    };

    // Get unique senders
    const uniqueSenders = new Set(
      recentEmails.map(e => 
        typeof e.fromAddress === 'object' && e.fromAddress ? (e.fromAddress as any).email : e.fromAddress
      ).filter(Boolean)
    );

    return {
      account: {
        email: account.emailAddress,
        provider: account.provider,
        status: account.status,
      },
      stats,
      folders: folders.map(f => ({
        name: f.name,
        displayName: f.displayName,
        type: f.folderType,
        unreadCount: f.unreadCount,
      })),
      selectedEmail: selectedEmail ? {
        id: selectedEmail.id,
        from: typeof selectedEmail.fromAddress === 'object' && selectedEmail.fromAddress
          ? (selectedEmail.fromAddress as any).email
          : selectedEmail.fromAddress,
        to: selectedEmail.toAddresses,
        subject: selectedEmail.subject,
        snippet: selectedEmail.snippet,
        bodyText: (selectedEmail.bodyText as any)?.substring(0, 5000), // Limit body size
        receivedAt: selectedEmail.receivedAt,
        isRead: selectedEmail.isRead,
        isImportant: selectedEmail.isImportant,
        isStarred: selectedEmail.isStarred,
        hasAttachments: selectedEmail.hasAttachments,
        folderName: selectedEmail.folderName,
      } : null,
      recentEmails: recentEmails.slice(0, 20).map(e => ({
        id: e.id,
        from: typeof e.fromAddress === 'object' && e.fromAddress ? (e.fromAddress as any).email : e.fromAddress,
        subject: e.subject,
        snippet: e.snippet,
        receivedAt: e.receivedAt,
        isRead: e.isRead,
        isImportant: e.isImportant,
        folderName: e.folderName,
      })),
      uniqueSenders: Array.from(uniqueSenders).slice(0, 30),
    };
  } catch (error) {
    console.error('Error building context:', error);
    return {
      account: null,
      stats: {},
      folders: [],
      selectedEmail: null,
      recentEmails: [],
      uniqueSenders: [],
    };
  }
}

/**
 * Build system prompt with email context
 */
function buildSystemPrompt(context: any): string {
  const { account, stats, folders, selectedEmail, recentEmails, uniqueSenders } = context;

  return `You are an advanced AI email assistant with complete access to the user's email account.

**ACCOUNT INFORMATION:**
- Email: ${account?.email || 'Unknown'}
- Provider: ${account?.provider || 'Unknown'}
- Status: ${account?.status || 'Unknown'}

**EMAIL STATISTICS:**
- Total Emails: ${stats.totalEmails || 0}
- Unread: ${stats.unreadCount || 0}
- Important: ${stats.importantCount || 0}
- Starred: ${stats.starredCount || 0}
- Folders: ${stats.folderCount || 0}

**AVAILABLE FOLDERS:**
${folders?.map((f: any) => `- ${f.displayName || f.name} (${f.type}) - ${f.unreadCount || 0} unread`).join('\n') || 'None'}

**FREQUENT SENDERS:**
${uniqueSenders?.slice(0, 10).join(', ') || 'None'}

${selectedEmail ? `**CURRENTLY SELECTED EMAIL:**
From: ${selectedEmail.from}
To: ${selectedEmail.to}
Subject: ${selectedEmail.subject}
Received: ${new Date(selectedEmail.receivedAt).toLocaleString()}
Status: ${selectedEmail.isRead ? 'Read' : 'Unread'}${selectedEmail.isImportant ? ', Important' : ''}${selectedEmail.isStarred ? ', Starred' : ''}
Folder: ${selectedEmail.folderName || 'Inbox'}

Preview: ${selectedEmail.snippet || 'No preview available'}

${selectedEmail.bodyText ? `Full Content:\n${selectedEmail.bodyText}` : ''}
` : ''}

**RECENT EMAILS (Last 20):**
${recentEmails?.map((e: any, i: number) => 
  `${i + 1}. From: ${e.from} | Subject: "${e.subject}" | ${e.isRead ? '✓' : '✉️'} ${e.isImportant ? '⚠️' : ''} | ${new Date(e.receivedAt).toLocaleString()}`
).join('\n') || 'None'}

**YOUR CAPABILITIES:**
1. **Email Analysis**: Summarize emails, extract action items, identify sentiment, assess priority
2. **Draft Replies**: Write professional, casual, or custom-toned responses
3. **Search & Find**: Search across all emails, find conversations, identify patterns
4. **Organization**: Suggest folder moves, flag important emails, categorize
5. **Insights**: Identify trends, analyze sender patterns, provide inbox statistics
6. **Action Items**: Extract tasks, deadlines, meeting requests
7. **Thread Analysis**: Summarize conversation threads, track discussion topics
8. **Smart Suggestions**: Recommend follow-ups, identify unanswered emails, suggest responses

**CRITICAL FORMATTING RULES:**
- NEVER use markdown syntax - NO asterisks for bold (** **), NO underscores, NO hashtags for headers, NO backticks for code
- Write in plain text only with natural spacing and line breaks
- Use simple hyphens (-) for lists, numbers (1., 2., 3.) for ordered lists
- Do NOT emphasize text with special characters - just write it naturally

**OTHER INSTRUCTIONS:**
- Be concise but thorough in your responses
- When drafting replies, match the tone of the original email
- Always cite specific emails when making recommendations (e.g., "Email from John Smith...")
- Use emojis sparingly and professionally (📧, ✅, ⚡, 🔍)

**USER CONTEXT:**
The user is currently ${selectedEmail ? `viewing an email from ${selectedEmail.from}` : 'browsing their inbox'}. They may ask about this specific email, search across all emails, or request general inbox management help.

Provide helpful, actionable responses that leverage your complete knowledge of their email account.`;
}

