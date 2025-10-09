/**
 * Email Sync Engine
 * Orchestrates email synchronization from IMAP/OAuth providers
 */

import { ImapClient } from './imap-client';
import { decrypt } from '../email-encryption';
import { GmailApiClient } from '../email-providers/gmail-api-client';
import { MicrosoftGraphClient } from '../email-providers/microsoft-graph-client';
import {
  getEmailAccountById,
  updateEmailAccountSyncState,
} from '@/db/queries/email-account-queries';
import {
  createEmail,
  createEmailsBatch,
  getEmailByMessageId,
  createEmailThread,
  getThreadById,
  updateThread,
  incrementThreadCounts,
} from '@/db/queries/email-queries';
import {
  startSyncLog,
  completeSyncLog,
  failSyncLog,
  incrementSyncStats,
} from '@/db/queries/email-sync-queries';
import type { SelectEmailAccount } from '@/db/schema/email-schema';
import type { EmailMessage } from '../email-types';

// ============================================================================
// Types
// ============================================================================

export interface SyncOptions {
  fullSync?: boolean; // Full sync vs incremental
  maxEmails?: number; // Max emails to fetch per sync
  folder?: string; // Specific folder to sync
}

export interface SyncResult {
  success: boolean;
  emailsFetched: number;
  emailsProcessed: number;
  emailsSkipped: number;
  emailsFailed: number;
  error?: string;
}

// ============================================================================
// Sync Engine Class
// ============================================================================

export class EmailSyncEngine {
  private accountId: string;
  private userId: string;
  private syncLogId?: string;

  constructor(accountId: string, userId: string) {
    this.accountId = accountId;
    this.userId = userId;
  }

  /**
   * Main sync method - routes to appropriate provider
   */
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    try {
      // Get account details
      const account = await getEmailAccountById(this.accountId);

      if (!account) {
        return {
          success: false,
          emailsFetched: 0,
          emailsProcessed: 0,
          emailsSkipped: 0,
          emailsFailed: 0,
          error: 'Account not found',
        };
      }

      // Start sync log
      const syncLog = await startSyncLog(
        this.accountId,
        this.userId,
        options.fullSync ? 'full' : 'incremental'
      );
      this.syncLogId = syncLog.id;

      // Route to appropriate sync method
      let result: SyncResult;

      if (account.provider === 'gmail' && account.authType === 'oauth') {
        result = await this.syncGmail(account, options);
      } else if (account.provider === 'microsoft' && account.authType === 'oauth') {
        result = await this.syncMicrosoft(account, options);
      } else {
        // IMAP/SMTP providers
        result = await this.syncImap(account, options);
      }

      // Complete sync log
      if (result.success) {
        await completeSyncLog(this.syncLogId, {
          emailsFetched: result.emailsFetched,
          emailsProcessed: result.emailsProcessed,
          emailsSkipped: result.emailsSkipped,
          emailsFailed: result.emailsFailed,
        });

        // Update account sync state
        await updateEmailAccountSyncState(
          this.accountId,
          new Date(),
          result.emailsFetched > 0 ? result.emailsFetched : undefined
        );
      } else {
        await failSyncLog(this.syncLogId, result.error || 'Unknown error');
      }

      return result;
    } catch (error) {
      console.error('Email sync error:', error);

      if (this.syncLogId) {
        await failSyncLog(
          this.syncLogId,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }

      return {
        success: false,
        emailsFetched: 0,
        emailsProcessed: 0,
        emailsSkipped: 0,
        emailsFailed: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync Gmail via Gmail API
   */
  private async syncGmail(
    account: SelectEmailAccount,
    options: SyncOptions
  ): Promise<SyncResult> {
    const accessToken = decrypt(account.accessToken!, this.userId);
    const refreshToken = decrypt(account.refreshToken!, this.userId);
    const expiryDate = account.tokenExpiresAt!.getTime();

    const client = new GmailApiClient(accessToken, refreshToken, expiryDate);

    let emailsFetched = 0;
    let emailsProcessed = 0;
    let emailsSkipped = 0;
    let emailsFailed = 0;

    try {
      // List messages
      const { messages } = await client.listEmails({
        maxResults: options.maxEmails || 50,
        labelIds: ['INBOX'],
      });

      emailsFetched = messages.length;

      // Fetch and process each email
      for (const msg of messages) {
        try {
          // Check if email already exists
          const existing = await getEmailByMessageId(this.accountId, msg.id);

          if (existing) {
            emailsSkipped++;
            continue;
          }

          // Fetch full message
          const fullMessage = await client.getEmail(msg.id);

          // Parse and store
          const emailData = this.buildEmailData(fullMessage, account);
          await this.saveEmail(emailData);

          emailsProcessed++;
        } catch (error) {
          console.error('Error processing Gmail message:', error);
          emailsFailed++;
        }
      }

      return {
        success: true,
        emailsFetched,
        emailsProcessed,
        emailsSkipped,
        emailsFailed,
      };
    } catch (error) {
      console.error('Gmail sync error:', error);
      return {
        success: false,
        emailsFetched,
        emailsProcessed,
        emailsSkipped,
        emailsFailed,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync Microsoft via Graph API
   */
  private async syncMicrosoft(
    account: SelectEmailAccount,
    options: SyncOptions
  ): Promise<SyncResult> {
    const accessToken = decrypt(account.accessToken!, this.userId);
    const refreshToken = decrypt(account.refreshToken!, this.userId);
    const expiryDate = account.tokenExpiresAt!.getTime();

    const client = new MicrosoftGraphClient(accessToken, refreshToken, expiryDate);

    let emailsFetched = 0;
    let emailsProcessed = 0;
    let emailsSkipped = 0;
    let emailsFailed = 0;

    try {
      // List messages
      const { messages } = await client.listEmails('inbox', {
        top: options.maxEmails || 50,
        orderBy: 'receivedDateTime desc',
      });

      emailsFetched = messages.length;

      // Process each email
      for (const msg of messages) {
        try {
          // Check if email already exists
          const existing = await getEmailByMessageId(this.accountId, msg.internetMessageId);

          if (existing) {
            emailsSkipped++;
            continue;
          }

          // Parse and store
          const emailData = this.buildEmailDataFromGraph(msg, account);
          await this.saveEmail(emailData);

          emailsProcessed++;
        } catch (error) {
          console.error('Error processing Microsoft message:', error);
          emailsFailed++;
        }
      }

      return {
        success: true,
        emailsFetched,
        emailsProcessed,
        emailsSkipped,
        emailsFailed,
      };
    } catch (error) {
      console.error('Microsoft sync error:', error);
      return {
        success: false,
        emailsFetched,
        emailsProcessed,
        emailsSkipped,
        emailsFailed,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync via IMAP
   */
  private async syncImap(
    account: SelectEmailAccount,
    options: SyncOptions
  ): Promise<SyncResult> {
    const password = decrypt(account.imapPassword!, this.userId);

    const client = new ImapClient({
      host: account.imapHost!,
      port: account.imapPort!,
      user: account.imapUsername!,
      password,
      tls: account.imapUseSsl ?? true,
    });

    let emailsFetched = 0;
    let emailsProcessed = 0;
    let emailsSkipped = 0;
    let emailsFailed = 0;

    try {
      // Connect
      await client.connect();

      // Fetch emails
      const lastUid = options.fullSync ? 0 : (account.lastUid || 0);
      const result = await client.fetchNewEmails(
        options.folder || 'INBOX',
        lastUid,
        options.maxEmails || 50
      );

      emailsFetched = result.totalFetched;

      // Process each email
      for (const emailData of result.emails) {
        try {
          // Check if email already exists
          if (emailData.messageId) {
            const existing = await getEmailByMessageId(this.accountId, emailData.messageId);

            if (existing) {
              emailsSkipped++;
              continue;
            }
          }

          // Add account and user IDs
          const completeEmailData = {
            ...emailData,
            accountId: this.accountId,
            userId: this.userId,
          } as Partial<EmailMessage> & { accountId: string; userId: string };

          await this.saveEmail(completeEmailData);

          emailsProcessed++;
        } catch (error) {
          console.error('Error processing IMAP message:', error);
          emailsFailed++;
        }
      }

      // Disconnect
      client.disconnect();

      return {
        success: true,
        emailsFetched,
        emailsProcessed,
        emailsSkipped,
        emailsFailed,
      };
    } catch (error) {
      console.error('IMAP sync error:', error);
      client.disconnect();
      
      return {
        success: false,
        emailsFetched,
        emailsProcessed,
        emailsSkipped,
        emailsFailed,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Build email data from Gmail message (placeholder)
   */
  private buildEmailData(message: any, account: SelectEmailAccount): Partial<EmailMessage> & { accountId: string; userId: string } {
    // This would use the parseGmailMessage function from gmail-api-client
    return {
      accountId: this.accountId,
      userId: this.userId,
      // Add parsed fields here
    } as any;
  }

  /**
   * Build email data from Microsoft Graph message (placeholder)
   */
  private buildEmailDataFromGraph(message: any, account: SelectEmailAccount): Partial<EmailMessage> & { accountId: string; userId: string } {
    // This would use the parseGraphMessage function from microsoft-graph-client
    return {
      accountId: this.accountId,
      userId: this.userId,
      // Add parsed fields here
    } as any;
  }

  /**
   * Save email to database with thread management
   */
  private async saveEmail(emailData: Partial<EmailMessage> & { accountId: string; userId: string }): Promise<void> {
    // Handle threading
    let threadId: string | undefined;

    if (emailData.inReplyTo || (emailData.references && emailData.references.length > 0)) {
      // This email is part of a thread
      // TODO: Find existing thread by subject or references
      // For now, create new thread for each email
    }

    // Create email
    const email = await createEmail({
      ...emailData,
      threadId,
      folderName: 'INBOX', // Default folder
    } as any);

    // Update or create thread
    if (threadId) {
      await incrementThreadCounts(threadId, !emailData.isRead);
    }
  }
}

// ============================================================================
// Sync Helper Functions
// ============================================================================

/**
 * Sync single account
 */
export async function syncAccount(
  accountId: string,
  userId: string,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const engine = new EmailSyncEngine(accountId, userId);
  return await engine.sync(options);
}

/**
 * Sync multiple accounts
 */
export async function syncAccounts(
  accounts: Array<{ id: string; userId: string }>,
  options: SyncOptions = {}
): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  for (const account of accounts) {
    const result = await syncAccount(account.id, account.userId, options);
    results.push(result);

    // Small delay between accounts
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}

