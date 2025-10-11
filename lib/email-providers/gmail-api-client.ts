/**
 * Gmail API Client
 * Email operations using Gmail API (list, fetch, send, modify)
 */

import { google, gmail_v1 } from 'googleapis';
import { getAuthenticatedGmailClient } from './gmail-oauth';
import type { EmailMessage, EmailAddress } from '../email-types';

// ============================================================================
// Types
// ============================================================================

interface GmailListOptions {
  maxResults?: number;
  pageToken?: string;
  labelIds?: string[];
  q?: string; // Gmail search query
  includeSpamTrash?: boolean;
}

interface GmailSendOptions {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  inReplyTo?: string;
  threadId?: string;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    data: Buffer;
  }>;
}

// ============================================================================
// Gmail API Client Class
// ============================================================================

export class GmailApiClient {
  private gmail: gmail_v1.Gmail;
  private userId: string = 'me';

  constructor(
    private accessToken: string,
    private refreshToken: string,
    private expiryDate: number
  ) {
    // Initialize will be called async
    this.gmail = google.gmail({ version: 'v1' });
  }

  /**
   * Initialize the client with authenticated OAuth client
   */
  private async init() {
    const authClient = await getAuthenticatedGmailClient(
      this.accessToken,
      this.refreshToken,
      this.expiryDate
    );
    this.gmail = google.gmail({ version: 'v1', auth: authClient });
  }

  // ========================================================================
  // List & Search Emails
  // ========================================================================

  /**
   * List emails with pagination
   */
  async listEmails(options: GmailListOptions = {}): Promise<{
    messages: Array<{ id: string; threadId: string }>;
    nextPageToken?: string;
    resultSizeEstimate: number;
  }> {
    await this.init();

    const response = await this.gmail.users.messages.list({
      userId: this.userId,
      maxResults: options.maxResults || 50,
      pageToken: options.pageToken,
      labelIds: options.labelIds,
      q: options.q,
      includeSpamTrash: options.includeSpamTrash || false,
    });

    return {
      messages: response.data.messages || [],
      nextPageToken: response.data.nextPageToken || undefined,
      resultSizeEstimate: response.data.resultSizeEstimate || 0,
    };
  }

  /**
   * Get single email by ID
   */
  async getEmail(messageId: string, format: 'full' | 'minimal' = 'full'): Promise<gmail_v1.Schema$Message> {
    await this.init();

    const response = await this.gmail.users.messages.get({
      userId: this.userId,
      id: messageId,
      format,
    });

    return response.data;
  }

  /**
   * Get multiple emails in batch
   */
  async getEmailsBatch(messageIds: string[]): Promise<gmail_v1.Schema$Message[]> {
    await this.init();

    const promises = messageIds.map((id) =>
      this.gmail.users.messages.get({
        userId: this.userId,
        id,
        format: 'full',
      })
    );

    const responses = await Promise.allSettled(promises);

    return responses
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map((r) => r.value.data);
  }

  // ========================================================================
  // Send Emails
  // ========================================================================

  /**
   * Send email
   */
  async sendEmail(options: GmailSendOptions): Promise<{ id: string; threadId: string; labelIds: string[] }> {
    await this.init();

    const message = this.createMimeMessage(options);
    const encodedMessage = Buffer.from(message).toString('base64url');

    const response = await this.gmail.users.messages.send({
      userId: this.userId,
      requestBody: {
        raw: encodedMessage,
        threadId: options.threadId,
      },
    });

    return {
      id: response.data.id!,
      threadId: response.data.threadId!,
      labelIds: response.data.labelIds || [],
    };
  }

  /**
   * Create MIME message for sending
   */
  private createMimeMessage(options: GmailSendOptions): string {
    const boundary = `----boundary_${Date.now()}`;
    const lines: string[] = [];

    // Headers
    lines.push(`To: ${options.to.map((addr) => this.formatEmailAddress(addr)).join(', ')}`);

    if (options.cc && options.cc.length > 0) {
      lines.push(`Cc: ${options.cc.map((addr) => this.formatEmailAddress(addr)).join(', ')}`);
    }

    if (options.bcc && options.bcc.length > 0) {
      lines.push(`Bcc: ${options.bcc.map((addr) => this.formatEmailAddress(addr)).join(', ')}`);
    }

    lines.push(`Subject: ${options.subject}`);

    if (options.inReplyTo) {
      lines.push(`In-Reply-To: ${options.inReplyTo}`);
      lines.push(`References: ${options.inReplyTo}`);
    }

    lines.push('MIME-Version: 1.0');

    // Body
    if (options.attachments && options.attachments.length > 0) {
      lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
      lines.push('');
      lines.push(`--${boundary}`);
    }

    if (options.bodyText && options.bodyHtml) {
      // Multipart alternative (text + html)
      const altBoundary = `----alt_boundary_${Date.now()}`;
      lines.push(`Content-Type: multipart/alternative; boundary="${altBoundary}"`);
      lines.push('');
      lines.push(`--${altBoundary}`);
      lines.push('Content-Type: text/plain; charset=UTF-8');
      lines.push('');
      lines.push(options.bodyText);
      lines.push('');
      lines.push(`--${altBoundary}`);
      lines.push('Content-Type: text/html; charset=UTF-8');
      lines.push('');
      lines.push(options.bodyHtml);
      lines.push(`--${altBoundary}--`);
    } else if (options.bodyHtml) {
      lines.push('Content-Type: text/html; charset=UTF-8');
      lines.push('');
      lines.push(options.bodyHtml);
    } else if (options.bodyText) {
      lines.push('Content-Type: text/plain; charset=UTF-8');
      lines.push('');
      lines.push(options.bodyText);
    }

    // Attachments
    if (options.attachments && options.attachments.length > 0) {
      for (const attachment of options.attachments) {
        lines.push('');
        lines.push(`--${boundary}`);
        lines.push(`Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`);
        lines.push('Content-Transfer-Encoding: base64');
        lines.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
        lines.push('');
        lines.push(attachment.data.toString('base64'));
      }
      lines.push(`--${boundary}--`);
    }

    return lines.join('\r\n');
  }

  /**
   * Format email address with name
   */
  private formatEmailAddress(addr: EmailAddress): string {
    if (addr.name) {
      return `"${addr.name}" <${addr.email}>`;
    }
    return addr.email;
  }

  // ========================================================================
  // Modify Emails
  // ========================================================================

  /**
   * Mark email as read/unread
   */
  async markAsRead(messageId: string, read: boolean = true): Promise<void> {
    await this.init();

    await this.gmail.users.messages.modify({
      userId: this.userId,
      id: messageId,
      requestBody: {
        addLabelIds: read ? [] : ['UNREAD'],
        removeLabelIds: read ? ['UNREAD'] : [],
      },
    });
  }

  /**
   * Star/unstar email
   */
  async starEmail(messageId: string, starred: boolean = true): Promise<void> {
    await this.init();

    await this.gmail.users.messages.modify({
      userId: this.userId,
      id: messageId,
      requestBody: {
        addLabelIds: starred ? ['STARRED'] : [],
        removeLabelIds: starred ? [] : ['STARRED'],
      },
    });
  }

  /**
   * Archive email (remove INBOX label)
   */
  async archiveEmail(messageId: string): Promise<void> {
    await this.init();

    await this.gmail.users.messages.modify({
      userId: this.userId,
      id: messageId,
      requestBody: {
        removeLabelIds: ['INBOX'],
      },
    });
  }

  /**
   * Move email to trash
   */
  async trashEmail(messageId: string): Promise<void> {
    await this.init();

    await this.gmail.users.messages.trash({
      userId: this.userId,
      id: messageId,
    });
  }

  /**
   * Permanently delete email
   */
  async deleteEmail(messageId: string): Promise<void> {
    await this.init();

    await this.gmail.users.messages.delete({
      userId: this.userId,
      id: messageId,
    });
  }

  /**
   * Add labels to email
   */
  async addLabels(messageId: string, labelIds: string[]): Promise<void> {
    await this.init();

    await this.gmail.users.messages.modify({
      userId: this.userId,
      id: messageId,
      requestBody: {
        addLabelIds: labelIds,
      },
    });
  }

  /**
   * Remove labels from email
   */
  async removeLabels(messageId: string, labelIds: string[]): Promise<void> {
    await this.init();

    await this.gmail.users.messages.modify({
      userId: this.userId,
      id: messageId,
      requestBody: {
        removeLabelIds: labelIds,
      },
    });
  }

  // ========================================================================
  // Labels
  // ========================================================================

  /**
   * List all labels
   */
  async listLabels(): Promise<gmail_v1.Schema$Label[]> {
    await this.init();

    const response = await this.gmail.users.labels.list({
      userId: this.userId,
    });

    return response.data.labels || [];
  }

  /**
   * Create custom label
   */
  async createLabel(name: string, color?: string): Promise<gmail_v1.Schema$Label> {
    await this.init();

    const response = await this.gmail.users.labels.create({
      userId: this.userId,
      requestBody: {
        name,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
        color: color ? { backgroundColor: color, textColor: '#000000' } : undefined,
      },
    });

    return response.data;
  }

  /**
   * Delete label
   */
  async deleteLabel(labelId: string): Promise<void> {
    await this.init();

    await this.gmail.users.labels.delete({
      userId: this.userId,
      id: labelId,
    });
  }

  // ========================================================================
  // Threads
  // ========================================================================

  /**
   * Get email thread
   */
  async getThread(threadId: string): Promise<gmail_v1.Schema$Thread> {
    await this.init();

    const response = await this.gmail.users.threads.get({
      userId: this.userId,
      id: threadId,
      format: 'full',
    });

    return response.data;
  }

  /**
   * List threads
   */
  async listThreads(options: Omit<GmailListOptions, 'maxResults'> & { maxResults?: number } = {}): Promise<{
    threads: Array<{ id: string; snippet: string; historyId: string }>;
    nextPageToken?: string;
  }> {
    await this.init();

    const response = await this.gmail.users.threads.list({
      userId: this.userId,
      maxResults: options.maxResults || 50,
      pageToken: options.pageToken,
      labelIds: options.labelIds,
      q: options.q,
      includeSpamTrash: options.includeSpamTrash || false,
    });

    return {
      threads: response.data.threads || [],
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  // ========================================================================
  // Attachments
  // ========================================================================

  /**
   * Get attachment data
   */
  async getAttachment(messageId: string, attachmentId: string): Promise<Buffer> {
    await this.init();

    const response = await this.gmail.users.messages.attachments.get({
      userId: this.userId,
      messageId,
      id: attachmentId,
    });

    const data = response.data.data;
    if (!data) {
      throw new Error('No attachment data returned');
    }

    // Decode base64url
    return Buffer.from(data, 'base64url');
  }

  // ========================================================================
  // History & Sync
  // ========================================================================

  /**
   * Get history of changes since historyId
   * Used for incremental sync
   */
  async getHistory(startHistoryId: string, historyTypes?: string[]): Promise<gmail_v1.Schema$History[]> {
    await this.init();

    const response = await this.gmail.users.history.list({
      userId: this.userId,
      startHistoryId,
      historyTypes,
    });

    return response.data.history || [];
  }

  /**
   * Watch for Gmail push notifications
   * Sets up webhook for real-time email notifications
   */
  async watch(topicName: string): Promise<{ historyId: string; expiration: string }> {
    await this.init();

    const response = await this.gmail.users.watch({
      userId: this.userId,
      requestBody: {
        topicName,
        labelIds: ['INBOX'],
      },
    });

    return {
      historyId: response.data.historyId!,
      expiration: response.data.expiration!,
    };
  }

  /**
   * Stop watching for push notifications
   */
  async stopWatch(): Promise<void> {
    await this.init();

    await this.gmail.users.stop({
      userId: this.userId,
    });
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse Gmail message to our EmailMessage type
 */
export function parseGmailMessage(gmailMessage: gmail_v1.Schema$Message): Partial<EmailMessage> {
  const headers = gmailMessage.payload?.headers || [];
  const getHeader = (name: string) => headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

  const from = parseEmailAddressString(getHeader('from'))[0];
  const to = parseEmailAddressString(getHeader('to'));
  const cc = parseEmailAddressString(getHeader('cc'));
  const bcc = parseEmailAddressString(getHeader('bcc'));
  const replyTo = parseEmailAddressString(getHeader('reply-to'));

  const subject = getHeader('subject');
  const messageId = getHeader('message-id');
  const inReplyTo = getHeader('in-reply-to');
  const references = getHeader('references').split(/\s+/).filter(Boolean);
  const date = new Date(getHeader('date') || gmailMessage.internalDate!);

  return {
    externalId: gmailMessage.id,
    messageId,
    threadId: gmailMessage.threadId,
    fromAddress: from,
    toAddresses: to,
    ccAddresses: cc.length > 0 ? cc : undefined,
    bccAddresses: bcc.length > 0 ? bcc : undefined,
    replyToAddresses: replyTo.length > 0 ? replyTo : undefined,
    subject,
    snippet: gmailMessage.snippet,
    receivedAt: date,
    inReplyTo,
    references,
    isRead: !gmailMessage.labelIds?.includes('UNREAD'),
    isStarred: gmailMessage.labelIds?.includes('STARRED') || false,
    isImportant: gmailMessage.labelIds?.includes('IMPORTANT') || false,
    isDraft: gmailMessage.labelIds?.includes('DRAFT') || false,
    isSent: gmailMessage.labelIds?.includes('SENT') || false,
    isTrash: gmailMessage.labelIds?.includes('TRASH') || false,
    isSpam: gmailMessage.labelIds?.includes('SPAM') || false,
    labelIds: gmailMessage.labelIds || [],
  };
}

/**
 * Parse email address string to EmailAddress array
 */
function parseEmailAddressString(str: string): EmailAddress[] {
  if (!str) return [];

  const addresses: EmailAddress[] = [];
  const regex = /(?:"?([^"]*)"?\s)?<?([^<>\s,]+@[^<>\s,]+)>?/g;
  let match;

  while ((match = regex.exec(str)) !== null) {
    addresses.push({
      name: match[1]?.trim() || undefined,
      email: match[2].trim(),
    });
  }

  return addresses;
}





