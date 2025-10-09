/**
 * Gmail OAuth 2.0 Integration
 * Handles OAuth flow for Gmail API access
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// ============================================================================
// Configuration
// ============================================================================

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

/**
 * Create OAuth2 client
 */
export function createGmailOAuthClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Google OAuth credentials in environment variables');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Generate OAuth authorization URL
 * User will be redirected to this URL to grant permissions
 */
export function getGmailAuthUrl(userId: string, state?: string): string {
  const oauth2Client = createGmailOAuthClient();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required to get refresh token
    scope: GMAIL_SCOPES,
    prompt: 'consent', // Force consent screen to get refresh token
    state: state || userId, // Pass user ID as state for verification
  });

  return authUrl;
}

/**
 * Exchange authorization code for tokens
 * Called in OAuth callback after user grants permission
 */
export async function exchangeGmailCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
  email: string;
  name?: string;
}> {
  const oauth2Client = createGmailOAuthClient();

  // Exchange code for tokens
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error('Failed to obtain access token or refresh token');
  }

  // Set credentials to get user info
  oauth2Client.setCredentials(tokens);

  // Get user email address
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expiry_date || Date.now() + 3600 * 1000, // Default 1 hour
    email: data.email || '',
    name: data.name,
  };
}

/**
 * Refresh access token using refresh token
 * Called automatically when access token expires
 */
export async function refreshGmailToken(refreshToken: string): Promise<{
  accessToken: string;
  expiryDate: number;
}> {
  const oauth2Client = createGmailOAuthClient();

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  // Refresh the token
  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error('Failed to refresh access token');
  }

  return {
    accessToken: credentials.access_token,
    expiryDate: credentials.expiry_date || Date.now() + 3600 * 1000,
  };
}

/**
 * Revoke OAuth access
 * Called when user disconnects their Gmail account
 */
export async function revokeGmailAccess(accessToken: string): Promise<void> {
  const oauth2Client = createGmailOAuthClient();
  oauth2Client.setCredentials({ access_token: accessToken });

  await oauth2Client.revokeCredentials();
}

/**
 * Check if token is expired or about to expire
 * Returns true if token expires within 5 minutes
 */
export function isGmailTokenExpired(expiryDate: number): boolean {
  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
  return expiryDate <= fiveMinutesFromNow;
}

/**
 * Get authenticated OAuth client with valid access token
 * Automatically refreshes token if expired
 */
export async function getAuthenticatedGmailClient(
  accessToken: string,
  refreshToken: string,
  expiryDate: number
): Promise<OAuth2Client> {
  const oauth2Client = createGmailOAuthClient();

  // Check if token needs refresh
  if (isGmailTokenExpired(expiryDate)) {
    // Refresh token
    const { accessToken: newAccessToken, expiryDate: newExpiryDate } =
      await refreshGmailToken(refreshToken);

    oauth2Client.setCredentials({
      access_token: newAccessToken,
      refresh_token: refreshToken,
      expiry_date: newExpiryDate,
    });

    // Return both client and new tokens for database update
    return oauth2Client;
  }

  // Token is still valid
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: expiryDate,
  });

  return oauth2Client;
}

/**
 * Test Gmail API connection
 * Verifies that credentials are valid
 */
export async function testGmailConnection(
  accessToken: string,
  refreshToken: string,
  expiryDate: number
): Promise<boolean> {
  try {
    const oauth2Client = await getAuthenticatedGmailClient(
      accessToken,
      refreshToken,
      expiryDate
    );

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Try to get user profile
    await gmail.users.getProfile({ userId: 'me' });

    return true;
  } catch (error) {
    console.error('Gmail connection test failed:', error);
    return false;
  }
}

/**
 * Get Gmail profile information
 */
export async function getGmailProfile(
  accessToken: string,
  refreshToken: string,
  expiryDate: number
): Promise<{
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}> {
  const oauth2Client = await getAuthenticatedGmailClient(
    accessToken,
    refreshToken,
    expiryDate
  );

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const { data } = await gmail.users.getProfile({ userId: 'me' });

  return {
    emailAddress: data.emailAddress || '',
    messagesTotal: data.messagesTotal || 0,
    threadsTotal: data.threadsTotal || 0,
    historyId: data.historyId || '',
  };
}

/**
 * Parse error from Google API
 */
export function parseGmailError(error: any): string {
  if (error.response?.data?.error) {
    const apiError = error.response.data.error;
    return `${apiError.code}: ${apiError.message}`;
  }

  if (error.message) {
    return error.message;
  }

  return 'Unknown Gmail API error';
}

