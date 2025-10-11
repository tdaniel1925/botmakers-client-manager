/**
 * Nylas Email Client
 * 
 * Unified email API client for Gmail, Outlook, IMAP, and more.
 * Handles OAuth, syncing, sending, and webhooks.
 */

import Nylas from 'nylas';

// Initialize Nylas client
const nylasClient = new Nylas({
  apiKey: process.env.NYLAS_API_KEY!,
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
});

export { nylasClient };

/**
 * Get OAuth authorization URL for email provider
 */
export async function getNylasAuthUrl(
  provider: 'gmail' | 'microsoft' | 'imap',
  userEmail?: string,
  redirectUri?: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const redirect = redirectUri || `${baseUrl}/api/auth/nylas/callback`;

  const config = {
    clientId: process.env.NYLAS_CLIENT_ID!,
    redirectUri: redirect,
  };

  // Build the auth URL with Nylas hosted authentication
  const authUrl = `https://api.us.nylas.com/v3/connect/auth?` +
    `client_id=${config.clientId}` +
    `&redirect_uri=${encodeURIComponent(config.redirectUri)}` +
    `&response_type=code` +
    `&provider=${provider}` +
    (userEmail ? `&login_hint=${encodeURIComponent(userEmail)}` : '');

  return authUrl;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeNylasCode(code: string, redirectUri?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const redirect = redirectUri || `${baseUrl}/api/auth/nylas/callback`;

  try {
    const response = await fetch('https://api.us.nylas.com/v3/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.NYLAS_CLIENT_ID,
        client_secret: process.env.NYLAS_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirect,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Nylas token exchange failed: ${error}`);
    }

    const data = await response.json();
    return {
      grantId: data.grant_id,
      email: data.email,
      provider: data.provider,
    };
  } catch (error) {
    console.error('Nylas code exchange error:', error);
    throw error;
  }
}

/**
 * Get account information
 */
export async function getNylasAccountInfo(grantId: string) {
  try {
    const grant = await nylasClient.auth.grants.find({ grantId });
    return {
      id: grant.id,
      email: grant.email,
      provider: grant.provider,
      status: grant.grantStatus,
    };
  } catch (error) {
    console.error('Failed to get Nylas account info:', error);
    throw error;
  }
}

/**
 * List messages (emails) for a grant
 */
export async function listNylasMessages(
  grantId: string,
  options?: {
    limit?: number;
    pageToken?: string;
    in?: string[]; // folder IDs
    unread?: boolean;
    starred?: boolean;
    from?: string;
    subject?: string;
    receivedAfter?: number; // Unix timestamp
    receivedBefore?: number; // Unix timestamp
  }
) {
  try {
    const queryParams: any = {
      limit: options?.limit || 50,
    };

    if (options?.pageToken) queryParams.page_token = options.pageToken;
    if (options?.in) queryParams.in = options.in;
    if (options?.unread !== undefined) queryParams.unread = options.unread;
    if (options?.starred !== undefined) queryParams.starred = options.starred;
    if (options?.from) queryParams.from = options.from;
    if (options?.subject) queryParams.subject = options.subject;
    if (options?.receivedAfter) queryParams.received_after = options.receivedAfter;
    if (options?.receivedBefore) queryParams.received_before = options.receivedBefore;

    console.log('Fetching Nylas messages with params:', { grantId, queryParams });
    
    const messages = await nylasClient.messages.list({
      identifier: grantId,
      queryParams,
    });

    console.log('Nylas messages fetched:', {
      count: messages.data?.length || 0,
      nextCursor: messages.nextCursor || 'none'
    });

    return messages;
  } catch (error) {
    console.error('Failed to list Nylas messages:', error);
    throw error;
  }
}

/**
 * Get a specific message by ID
 */
export async function getNylasMessage(grantId: string, messageId: string) {
  try {
    const message = await nylasClient.messages.find({
      identifier: grantId,
      messageId,
    });
    return message;
  } catch (error) {
    console.error('Failed to get Nylas message:', error);
    throw error;
  }
}

/**
 * Send an email
 */
export async function sendNylasEmail(
  grantId: string,
  message: {
    to: { name?: string; email: string }[];
    cc?: { name?: string; email: string }[];
    bcc?: { name?: string; email: string }[];
    replyTo?: { name?: string; email: string }[];
    subject: string;
    body: string;
    replyToMessageId?: string;
    trackOpens?: boolean;
    trackLinks?: boolean;
  }
) {
  try {
    const sentMessage = await nylasClient.messages.send({
      identifier: grantId,
      requestBody: {
        to: message.to,
        cc: message.cc,
        bcc: message.bcc,
        reply_to: message.replyTo,
        subject: message.subject,
        body: message.body,
        reply_to_message_id: message.replyToMessageId,
        tracking_options: {
          opens: message.trackOpens,
          links: message.trackLinks,
        },
      },
    });

    return sentMessage;
  } catch (error) {
    console.error('Failed to send Nylas email:', error);
    throw error;
  }
}

/**
 * List threads for a grant
 */
export async function listNylasThreads(
  grantId: string,
  options?: {
    limit?: number;
    pageToken?: string;
    in?: string[];
    unread?: boolean;
    starred?: boolean;
  }
) {
  try {
    const queryParams: any = {
      limit: options?.limit || 50,
    };

    if (options?.pageToken) queryParams.page_token = options.pageToken;
    if (options?.in) queryParams.in = options.in;
    if (options?.unread !== undefined) queryParams.unread = options.unread;
    if (options?.starred !== undefined) queryParams.starred = options.starred;

    const threads = await nylasClient.threads.list({
      identifier: grantId,
      queryParams,
    });

    return threads;
  } catch (error) {
    console.error('Failed to list Nylas threads:', error);
    throw error;
  }
}

/**
 * Update a message (mark as read, star, archive, etc.)
 */
export async function updateNylasMessage(
  grantId: string,
  messageId: string,
  updates: {
    unread?: boolean;
    starred?: boolean;
    folders?: string[];
  }
) {
  try {
    const updatedMessage = await nylasClient.messages.update({
      identifier: grantId,
      messageId,
      requestBody: {
        unread: updates.unread,
        starred: updates.starred,
        folders: updates.folders,
      },
    });

    return updatedMessage;
  } catch (error) {
    console.error('Failed to update Nylas message:', error);
    throw error;
  }
}

/**
 * Delete a message
 */
export async function deleteNylasMessage(grantId: string, messageId: string) {
  try {
    await nylasClient.messages.destroy({
      identifier: grantId,
      messageId,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete Nylas message:', error);
    throw error;
  }
}

/**
 * List folders for a grant
 */
export async function listNylasFolders(grantId: string) {
  try {
    const folders = await nylasClient.folders.list({
      identifier: grantId,
    });
    return folders;
  } catch (error) {
    console.error('Failed to list Nylas folders:', error);
    throw error;
  }
}

/**
 * Search messages
 */
export async function searchNylasMessages(
  grantId: string,
  query: string,
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  try {
    const messages = await nylasClient.messages.list({
      identifier: grantId,
      queryParams: {
        search_query_native: query,
        limit: options?.limit || 50,
        offset: options?.offset || 0,
      },
    });

    return messages;
  } catch (error) {
    console.error('Failed to search Nylas messages:', error);
    throw error;
  }
}

/**
 * Download attachment
 */
export async function downloadNylasAttachment(
  grantId: string,
  attachmentId: string
) {
  try {
    const attachment = await nylasClient.attachments.download({
      identifier: grantId,
      attachmentId,
    });

    return attachment;
  } catch (error) {
    console.error('Failed to download Nylas attachment:', error);
    throw error;
  }
}

/**
 * Revoke grant (disconnect account)
 */
export async function revokeNylasGrant(grantId: string) {
  try {
    await nylasClient.auth.grants.destroy({ grantId });
    return { success: true };
  } catch (error) {
    console.error('Failed to revoke Nylas grant:', error);
    throw error;
  }
}

/**
 * Create webhook for real-time notifications
 */
export async function createNylasWebhook(
  webhookUrl: string,
  triggers: string[] = ['message.created', 'message.updated', 'thread.replied']
) {
  try {
    const webhook = await nylasClient.webhooks.create({
      requestBody: {
        webhookUrl,
        triggers,
        description: 'ClientFlow Email Sync',
      },
    });

    return webhook;
  } catch (error) {
    console.error('Failed to create Nylas webhook:', error);
    throw error;
  }
}

/**
 * Verify webhook signature
 */
export function verifyNylasWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  
  return signature === expectedSignature;
}




