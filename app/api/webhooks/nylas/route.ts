/**
 * Nylas Webhook Handler
 * 
 * Receives real-time notifications from Nylas when emails arrive, are updated, etc.
 * This enables instant email sync without polling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyNylasWebhook, getNylasMessage } from '@/lib/email-providers/nylas-client';
import { db } from '@/db/db';
import { emailsTable, emailAccountsTable, emailThreadsTable } from '@/db/schema/email-schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature for verification
    const signature = request.headers.get('x-nylas-signature');
    const rawBody = await request.text();

    // Verify webhook authenticity
    const webhookSecret = process.env.NYLAS_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('NYLAS_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    if (!signature || !verifyNylasWebhook(rawBody, signature, webhookSecret)) {
      console.error('Invalid Nylas webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log('Nylas webhook received:', payload.type);

    // Handle different webhook types
    switch (payload.type) {
      case 'message.created':
        await handleMessageCreated(payload.data);
        break;
      
      case 'message.updated':
        await handleMessageUpdated(payload.data);
        break;
      
      case 'thread.replied':
        await handleThreadReplied(payload.data);
        break;

      default:
        console.log('Unhandled webhook type:', payload.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Nylas webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Handle new message created
 */
async function handleMessageCreated(data: any) {
  try {
    const { grant_id, object } = data;
    const message = object;

    // Find the email account for this grant
    const account = await db.query.emailAccountsTable.findFirst({
      where: eq(emailAccountsTable.nylasGrantId, grant_id),
    });

    if (!account) {
      console.error('No account found for grant ID:', grant_id);
      return;
    }

    // Check if message already exists
    const existingEmail = await db.query.emailsTable.findFirst({
      where: eq(emailsTable.nylasMessageId, message.id),
    });

    if (existingEmail) {
      console.log('Message already exists:', message.id);
      return;
    }

    // Extract participants for thread
    const participants = [];
    if (message.from && Array.isArray(message.from)) {
      for (const sender of message.from) {
        if (sender.email) {
          participants.push({ email: sender.email, name: sender.name || sender.email });
        }
      }
    }
    if (message.to && Array.isArray(message.to)) {
      for (const recipient of message.to) {
        if (recipient.email) {
          participants.push({ email: recipient.email, name: recipient.name || recipient.email });
        }
      }
    }
    // Ensure at least one participant
    if (participants.length === 0) {
      participants.push({ email: account.emailAddress, name: account.displayName || account.emailAddress });
    }

    // Create or get thread
    let threadId: string;
    if (message.thread_id) {
      const existingThread = await db.query.emailThreadsTable.findFirst({
        where: eq(emailThreadsTable.nylasThreadId, message.thread_id),
      });

      if (existingThread) {
        threadId = existingThread.id;
      } else {
        const [newThread] = await db.insert(emailThreadsTable).values({
          userId: account.userId,
          accountId: account.id,
          nylasThreadId: message.thread_id,
          subject: message.subject || '(No subject)',
          snippet: message.snippet || '',
          participants: participants,
          messageCount: 1,
          firstMessageAt: new Date(message.date * 1000),
          lastMessageAt: new Date(message.date * 1000),
        }).returning();
        threadId = newThread.id;
      }
    } else {
      // Create new thread for this message
      const [newThread] = await db.insert(emailThreadsTable).values({
        userId: account.userId,
        accountId: account.id,
        nylasThreadId: message.id, // Use message ID if no thread ID
        subject: message.subject || '(No subject)',
        snippet: message.snippet || '',
        participants: participants,
        messageCount: 1,
        firstMessageAt: new Date(message.date * 1000),
        lastMessageAt: new Date(message.date * 1000),
      }).returning();
      threadId = newThread.id;
    }

    // Determine email flags based on folders
    let isSent = false;
    let isDraft = false;
    let isTrash = false;
    let isArchived = false;

    if (message.folders && Array.isArray(message.folders)) {
      const folderNames = message.folders.map((f: string) => f.toLowerCase());
      isSent = folderNames.some((name: string) => 
        name.includes('sent') || name.includes('sent items') || name.includes('sent mail')
      );
      isDraft = folderNames.some((name: string) => name.includes('draft'));
      isTrash = folderNames.some((name: string) => 
        name.includes('trash') || name.includes('deleted') || name.includes('bin')
      );
      isArchived = folderNames.some((name: string) => name.includes('archive'));
    }

    // Parse from/to addresses
    const fromAddress = message.from && message.from[0] 
      ? { email: message.from[0].email, name: message.from[0].name || message.from[0].email }
      : { email: account.emailAddress, name: account.displayName || account.emailAddress };

    const toAddresses = message.to && Array.isArray(message.to)
      ? message.to.map((recipient: any) => ({
          email: recipient.email,
          name: recipient.name || recipient.email
        }))
      : [];

    const ccAddresses = message.cc && Array.isArray(message.cc)
      ? message.cc.map((recipient: any) => ({
          email: recipient.email,
          name: recipient.name || recipient.email
        }))
      : [];

    const bccAddresses = message.bcc && Array.isArray(message.bcc)
      ? message.bcc.map((recipient: any) => ({
          email: recipient.email,
          name: recipient.name || recipient.email
        }))
      : [];

    // Insert the email
    const [insertedEmail] = await db.insert(emailsTable).values({
      userId: account.userId,
      accountId: account.id,
      threadId,
      messageId: message.id,
      nylasMessageId: message.id,
      subject: message.subject || '(No subject)',
      snippet: message.snippet || '',
      fromAddress: fromAddress,
      toAddresses: toAddresses,
      ccAddresses: ccAddresses.length > 0 ? ccAddresses : null,
      bccAddresses: bccAddresses.length > 0 ? bccAddresses : null,
      bodyHtml: message.body || '',
      bodyText: message.body || '',
      receivedAt: new Date(message.date * 1000),
      isRead: !message.unread,
      isStarred: message.starred || false,
      hasAttachments: message.attachments && message.attachments.length > 0,
      isSent: isSent,
      isDraft: isDraft,
      isTrash: isTrash,
      isArchived: isArchived,
    }).returning();

    console.log('Created new email from webhook:', message.id);

    // Execute email rules for this email
    try {
      const { executeRulesForEmail } = await import('@/lib/email/rule-executor');
      await executeRulesForEmail(insertedEmail.id as string);
      console.log('✅ Rules executed for webhook email');
    } catch (ruleError) {
      console.error('Error executing rules for webhook email:', ruleError);
      // Don't fail webhook processing if rules fail
    }

    // Update account last sync time
    await db
      .update(emailAccountsTable)
      .set({ lastSyncAt: new Date() })
      .where(eq(emailAccountsTable.id, account.id));

  } catch (error) {
    console.error('Error handling message.created:', error);
  }
}

/**
 * Handle message updated (read status, star, etc.)
 */
async function handleMessageUpdated(data: any) {
  try {
    const { object } = data;
    const message = object;

    // Find the existing email
    const existingEmail = await db.query.emailsTable.findFirst({
      where: eq(emailsTable.nylasMessageId, message.id),
    });

    if (!existingEmail) {
      console.log('Message not found for update:', message.id);
      return;
    }

    // Update the email
    await db
      .update(emailsTable)
      .set({
        isRead: !message.unread,
        isStarred: message.starred || false,
        updatedAt: new Date(),
      })
      .where(eq(emailsTable.id, existingEmail.id));

    console.log('Updated email from webhook:', message.id);

  } catch (error) {
    console.error('Error handling message.updated:', error);
  }
}

/**
 * Handle thread replied
 */
async function handleThreadReplied(data: any) {
  try {
    const { object } = data;
    const thread = object;

    // Update thread last message time
    const existingThread = await db.query.emailThreadsTable.findFirst({
      where: eq(emailThreadsTable.nylasThreadId, thread.id),
    });

    if (existingThread) {
      await db
        .update(emailThreadsTable)
        .set({
          lastMessageAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(emailThreadsTable.id, existingThread.id));

      console.log('Updated thread from webhook:', thread.id);
    }

  } catch (error) {
    console.error('Error handling thread.replied:', error);
  }
}

// Allow GET for webhook verification (Nylas may send a verification request)
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('challenge');
  if (challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
  return NextResponse.json({ status: 'ok' });
}




