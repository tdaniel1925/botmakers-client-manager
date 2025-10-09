/**
 * Microsoft Graph API Client
 * Email operations using Microsoft Graph API (list, fetch, send, modify)
 */

import { getValidMicrosoftToken, makeMicrosoftGraphRequest } from './microsoft-oauth';
import type { EmailMessage, EmailAddress } from '../email-types';

// ============================================================================
// Types
// ============================================================================

interface GraphListOptions {
  top?: number; // Max results (default 50)
  skip?: number; // Pagination offset
  filter?: string; // OData filter
  orderBy?: string; // Sort order
  search?: string; // Search query
  select?: string[]; // Fields to return
}

interface GraphSendOptions {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  importance?: 'low' | 'normal' | 'high';
  attachments?: Array<{
    filename: string;
    mimeType: string;
    data: Buffer;
  }>;
}

interface GraphMessage {
  id: string;
  conversationId: string;
  subject: string;
  bodyPreview: string;
  body: {
    contentType: 'text' | 'html';
    content: string;
  };
  from: {
    emailAddress: {
      name?: string;
      address: string;
    };
  };
  toRecipients: Array<{
    emailAddress: {
      name?: string;
      address: string;
    };
  }>;
  ccRecipients?: Array<{
    emailAddress: {
      name?: string;
      address: string;
    };
  }>;
  bccRecipients?: Array<{
    emailAddress: {
      name?: string;
      address: string;
    };
  }>;
  replyTo?: Array<{
    emailAddress: {
      name?: string;
      address: string;
    };
  }>;
  receivedDateTime: string;
  sentDateTime?: string;
  isRead: boolean;
  isDraft: boolean;
  flag?: {
    flagStatus: 'notFlagged' | 'flagged' | 'complete';
  };
  importance: 'low' | 'normal' | 'high';
  hasAttachments: boolean;
  internetMessageId: string;
  categories?: string[];
}

// ============================================================================
// Microsoft Graph API Client Class
// ============================================================================

export class MicrosoftGraphClient {
  constructor(
    private accessToken: string,
    private refreshToken: string,
    private expiryDate: number
  ) {}

  /**
   * Make authenticated request to Microsoft Graph
   */
  private async request(endpoint: string, options?: RequestInit): Promise<Response> {
    return await makeMicrosoftGraphRequest(
      this.accessToken,
      this.refreshToken,
      this.expiryDate,
      endpoint,
      options
    );
  }

  // ========================================================================
  // List & Search Emails
  // ========================================================================

  /**
   * List emails from mailbox
   */
  async listEmails(folderId: string = 'inbox', options: GraphListOptions = {}): Promise<{
    messages: GraphMessage[];
    nextLink?: string;
  }> {
    const params = new URLSearchParams();
    if (options.top) params.append('$top', options.top.toString());
    if (options.skip) params.append('$skip', options.skip.toString());
    if (options.filter) params.append('$filter', options.filter);
    if (options.orderBy) params.append('$orderby', options.orderBy);
    if (options.search) params.append('$search', options.search);
    if (options.select) params.append('$select', options.select.join(','));

    const response = await this.request(
      `/me/mailFolders/${folderId}/messages?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Failed to list emails: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      messages: data.value || [],
      nextLink: data['@odata.nextLink'],
    };
  }

  /**
   * Get single email by ID
   */
  async getEmail(messageId: string): Promise<GraphMessage> {
    const response = await this.request(`/me/messages/${messageId}`);

    if (!response.ok) {
      throw new Error(`Failed to get email: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Search emails
   */
  async searchEmails(query: string, options: GraphListOptions = {}): Promise<{
    messages: GraphMessage[];
    nextLink?: string;
  }> {
    const params = new URLSearchParams();
    params.append('$search', `"${query}"`);
    if (options.top) params.append('$top', options.top.toString());
    if (options.skip) params.append('$skip', options.skip.toString());

    const response = await this.request(`/me/messages?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to search emails: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      messages: data.value || [],
      nextLink: data['@odata.nextLink'],
    };
  }

  // ========================================================================
  // Send Emails
  // ========================================================================

  /**
   * Send email
   */
  async sendEmail(options: GraphSendOptions): Promise<{ success: boolean; messageId?: string }> {
    const message = {
      subject: options.subject,
      body: {
        contentType: options.bodyHtml ? 'html' : 'text',
        content: options.bodyHtml || options.bodyText || '',
      },
      toRecipients: options.to.map((addr) => ({
        emailAddress: {
          name: addr.name,
          address: addr.email,
        },
      })),
      ccRecipients: options.cc?.map((addr) => ({
        emailAddress: {
          name: addr.name,
          address: addr.email,
        },
      })),
      bccRecipients: options.bcc?.map((addr) => ({
        emailAddress: {
          name: addr.name,
          address: addr.email,
        },
      })),
      importance: options.importance || 'normal',
      attachments: options.attachments?.map((att) => ({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: att.filename,
        contentType: att.mimeType,
        contentBytes: att.data.toString('base64'),
      })),
    };

    const response = await this.request('/me/sendMail', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    return { success: true };
  }

  /**
   * Create draft email
   */
  async createDraft(options: GraphSendOptions): Promise<GraphMessage> {
    const message = {
      subject: options.subject,
      body: {
        contentType: options.bodyHtml ? 'html' : 'text',
        content: options.bodyHtml || options.bodyText || '',
      },
      toRecipients: options.to.map((addr) => ({
        emailAddress: {
          name: addr.name,
          address: addr.email,
        },
      })),
      ccRecipients: options.cc?.map((addr) => ({
        emailAddress: {
          name: addr.name,
          address: addr.email,
        },
      })),
      bccRecipients: options.bcc?.map((addr) => ({
        emailAddress: {
          name: addr.name,
          address: addr.email,
        },
      })),
      importance: options.importance || 'normal',
    };

    const response = await this.request('/me/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Failed to create draft: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Reply to email
   */
  async replyToEmail(
    messageId: string,
    replyText: string,
    replyAll: boolean = false
  ): Promise<void> {
    const comment = replyText;

    const response = await this.request(
      `/me/messages/${messageId}/${replyAll ? 'replyAll' : 'reply'}`,
      {
        method: 'POST',
        body: JSON.stringify({ comment }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to reply to email: ${response.statusText}`);
    }
  }

  // ========================================================================
  // Modify Emails
  // ========================================================================

  /**
   * Mark email as read/unread
   */
  async markAsRead(messageId: string, read: boolean = true): Promise<void> {
    const response = await this.request(`/me/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isRead: read }),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark as read: ${response.statusText}`);
    }
  }

  /**
   * Flag/unflag email (similar to starring)
   */
  async flagEmail(messageId: string, flagged: boolean = true): Promise<void> {
    const response = await this.request(`/me/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        flag: {
          flagStatus: flagged ? 'flagged' : 'notFlagged',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to flag email: ${response.statusText}`);
    }
  }

  /**
   * Set importance
   */
  async setImportance(
    messageId: string,
    importance: 'low' | 'normal' | 'high'
  ): Promise<void> {
    const response = await this.request(`/me/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ importance }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set importance: ${response.statusText}`);
    }
  }

  /**
   * Move email to folder
   */
  async moveToFolder(messageId: string, destinationFolderId: string): Promise<void> {
    const response = await this.request(`/me/messages/${messageId}/move`, {
      method: 'POST',
      body: JSON.stringify({ destinationId: destinationFolderId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to move email: ${response.statusText}`);
    }
  }

  /**
   * Copy email to folder
   */
  async copyToFolder(messageId: string, destinationFolderId: string): Promise<GraphMessage> {
    const response = await this.request(`/me/messages/${messageId}/copy`, {
      method: 'POST',
      body: JSON.stringify({ destinationId: destinationFolderId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to copy email: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Delete email
   */
  async deleteEmail(messageId: string): Promise<void> {
    const response = await this.request(`/me/messages/${messageId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete email: ${response.statusText}`);
    }
  }

  /**
   * Add category (similar to labels)
   */
  async addCategories(messageId: string, categories: string[]): Promise<void> {
    const message = await this.getEmail(messageId);
    const existingCategories = message.categories || [];
    const newCategories = Array.from(new Set([...existingCategories, ...categories]));

    const response = await this.request(`/me/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ categories: newCategories }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add categories: ${response.statusText}`);
    }
  }

  /**
   * Remove categories
   */
  async removeCategories(messageId: string, categoriesToRemove: string[]): Promise<void> {
    const message = await this.getEmail(messageId);
    const existingCategories = message.categories || [];
    const newCategories = existingCategories.filter(
      (cat) => !categoriesToRemove.includes(cat)
    );

    const response = await this.request(`/me/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ categories: newCategories }),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove categories: ${response.statusText}`);
    }
  }

  // ========================================================================
  // Folders
  // ========================================================================

  /**
   * List mail folders
   */
  async listFolders(): Promise<any[]> {
    const response = await this.request('/me/mailFolders');

    if (!response.ok) {
      throw new Error(`Failed to list folders: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value || [];
  }

  /**
   * Create mail folder
   */
  async createFolder(displayName: string, parentFolderId?: string): Promise<any> {
    const endpoint = parentFolderId
      ? `/me/mailFolders/${parentFolderId}/childFolders`
      : '/me/mailFolders';

    const response = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ displayName }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create folder: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Delete folder
   */
  async deleteFolder(folderId: string): Promise<void> {
    const response = await this.request(`/me/mailFolders/${folderId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete folder: ${response.statusText}`);
    }
  }

  // ========================================================================
  // Attachments
  // ========================================================================

  /**
   * List attachments for a message
   */
  async listAttachments(messageId: string): Promise<any[]> {
    const response = await this.request(`/me/messages/${messageId}/attachments`);

    if (!response.ok) {
      throw new Error(`Failed to list attachments: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value || [];
  }

  /**
   * Get attachment data
   */
  async getAttachment(messageId: string, attachmentId: string): Promise<Buffer> {
    const response = await this.request(
      `/me/messages/${messageId}/attachments/${attachmentId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to get attachment: ${response.statusText}`);
    }

    const data = await response.json();

    // Attachment data is base64 encoded in contentBytes
    if (data.contentBytes) {
      return Buffer.from(data.contentBytes, 'base64');
    }

    throw new Error('No attachment data found');
  }

  // ========================================================================
  // Categories (Labels)
  // ========================================================================

  /**
   * List all master categories
   */
  async listMasterCategories(): Promise<any[]> {
    const response = await this.request('/me/outlook/masterCategories');

    if (!response.ok) {
      throw new Error(`Failed to list categories: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value || [];
  }

  /**
   * Create master category
   */
  async createMasterCategory(displayName: string, color?: string): Promise<any> {
    const response = await this.request('/me/outlook/masterCategories', {
      method: 'POST',
      body: JSON.stringify({
        displayName,
        color: color || 'preset0',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create category: ${response.statusText}`);
    }

    return await response.json();
  }

  // ========================================================================
  // Delta Query (Incremental Sync)
  // ========================================================================

  /**
   * Get delta changes since last sync
   * Used for incremental synchronization
   */
  async getDeltaMessages(deltaLink?: string): Promise<{
    messages: GraphMessage[];
    deltaLink?: string;
    nextLink?: string;
  }> {
    const endpoint = deltaLink || '/me/messages/delta';

    const response = await this.request(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to get delta: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      messages: data.value || [],
      deltaLink: data['@odata.deltaLink'],
      nextLink: data['@odata.nextLink'],
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse Microsoft Graph message to our EmailMessage type
 */
export function parseGraphMessage(graphMessage: GraphMessage): Partial<EmailMessage> {
  const from: EmailAddress = {
    email: graphMessage.from.emailAddress.address,
    name: graphMessage.from.emailAddress.name,
  };

  const to: EmailAddress[] = graphMessage.toRecipients.map((r) => ({
    email: r.emailAddress.address,
    name: r.emailAddress.name,
  }));

  const cc: EmailAddress[] | undefined = graphMessage.ccRecipients?.map((r) => ({
    email: r.emailAddress.address,
    name: r.emailAddress.name,
  }));

  const bcc: EmailAddress[] | undefined = graphMessage.bccRecipients?.map((r) => ({
    email: r.emailAddress.address,
    name: r.emailAddress.name,
  }));

  const replyTo: EmailAddress[] | undefined = graphMessage.replyTo?.map((r) => ({
    email: r.emailAddress.address,
    name: r.emailAddress.name,
  }));

  return {
    externalId: graphMessage.id,
    messageId: graphMessage.internetMessageId,
    threadId: graphMessage.conversationId,
    fromAddress: from,
    toAddresses: to,
    ccAddresses: cc,
    bccAddresses: bcc,
    replyToAddresses: replyTo,
    subject: graphMessage.subject,
    snippet: graphMessage.bodyPreview,
    bodyText: graphMessage.body.contentType === 'text' ? graphMessage.body.content : undefined,
    bodyHtml: graphMessage.body.contentType === 'html' ? graphMessage.body.content : undefined,
    receivedAt: new Date(graphMessage.receivedDateTime),
    sentAt: graphMessage.sentDateTime ? new Date(graphMessage.sentDateTime) : undefined,
    isRead: graphMessage.isRead,
    isStarred: graphMessage.flag?.flagStatus === 'flagged',
    isImportant: graphMessage.importance === 'high',
    isDraft: graphMessage.isDraft,
    hasAttachments: graphMessage.hasAttachments,
    category: graphMessage.categories?.[0],
    labelIds: graphMessage.categories || [],
  };
}

