/**
 * IMAP Email Sync
 * Fetches emails from IMAP servers and stores them in the database
 */

import { ImapFlow } from 'imapflow';
import { db } from '@/db/db';
import { emailsTable, emailAccountsTable } from '@/db/schema/email-schema';
import { decrypt } from '@/lib/email-encryption';
import { eq } from 'drizzle-orm';
import { simpleParser } from 'mailparser';

interface SyncResult {
  success: boolean;
  emailsFetched?: number;
  error?: string;
}

/**
 * Sync emails from an IMAP account
 */
export async function syncImapAccount(accountId: string, userId: string): Promise<SyncResult> {
  try {
    // Get account details
    const account = await db.query.emailAccountsTable.findFirst({
      where: eq(emailAccountsTable.id, accountId),
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    if (!account.imapPassword || !account.imapHost || !account.imapPort) {
      return { success: false, error: 'IMAP credentials incomplete' };
    }

    // Decrypt password
    const password = decrypt(account.imapPassword, userId);

    // Connect to IMAP server
    const client = new ImapFlow({
      host: account.imapHost,
      port: account.imapPort,
      secure: account.imapUseSsl ?? true,
      auth: {
        user: account.emailAddress,
        pass: password,
      },
      logger: false,
    });

    await client.connect();

    // Open INBOX
    await client.mailboxOpen('INBOX');

    // Fetch last 50 emails
    const messages = [];
    for await (const message of client.fetch('1:50', { 
      envelope: true, 
      bodyStructure: true,
      source: true 
    })) {
      messages.push(message);
    }

    console.log(`Fetched ${messages.length} messages from IMAP`);

    // Parse and save emails
    let savedCount = 0;
    for (const message of messages) {
      try {
        const parsed = await simpleParser(message.source);
        
        // Check if email already exists
        const existing = await db.query.emailsTable.findFirst({
          where: eq(emailsTable.messageId, parsed.messageId || `${message.uid}`),
        });

        if (!existing) {
          await db.insert(emailsTable).values({
            accountId: account.id,
            messageId: parsed.messageId || `${message.uid}`,
            threadId: parsed.inReplyTo || parsed.messageId || `${message.uid}`,
            subject: parsed.subject || '(No Subject)',
            from: parsed.from?.text || 'Unknown',
            to: parsed.to?.text || account.emailAddress,
            cc: parsed.cc?.text,
            bcc: parsed.bcc?.text,
            replyTo: parsed.replyTo?.text,
            snippet: parsed.text?.substring(0, 200) || '',
            bodyText: parsed.text || '',
            bodyHtml: parsed.html || '',
            receivedAt: parsed.date || new Date(),
            sentAt: parsed.date || new Date(),
            folder: 'INBOX',
            isRead: message.flags?.has('\\Seen') || false,
            isStarred: message.flags?.has('\\Flagged') || false,
            isImportant: false,
            size: message.size || 0,
            hasAttachments: (parsed.attachments?.length || 0) > 0,
            labels: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          savedCount++;
        }
      } catch (parseError) {
        console.error('Error parsing email:', parseError);
      }
    }

    // Update last sync time
    await db
      .update(emailAccountsTable)
      .set({
        lastSyncAt: new Date(),
        lastSyncError: null,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(emailAccountsTable.id, accountId));

    await client.logout();

    return {
      success: true,
      emailsFetched: savedCount,
    };
  } catch (error) {
    console.error('IMAP sync error:', error);
    
    // Update account with error
    await db
      .update(emailAccountsTable)
      .set({
        lastSyncError: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        updatedAt: new Date(),
      })
      .where(eq(emailAccountsTable.id, accountId));

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync emails',
    };
  }
}

