/**
 * Microsoft OAuth 2.0 Integration
 * Handles OAuth flow for Microsoft Graph API (Outlook/Office 365)
 */

import { ConfidentialClientApplication, AuthorizationUrlRequest, AuthorizationCodeRequest } from '@azure/msal-node';

// ============================================================================
// Configuration
// ============================================================================

const MICROSOFT_SCOPES = [
  'https://graph.microsoft.com/Mail.ReadWrite',
  'https://graph.microsoft.com/Mail.Send',
  'https://graph.microsoft.com/User.Read',
  'offline_access', // Required for refresh token
];

/**
 * Create MSAL confidential client
 */
function createMicrosoftAuthClient(): ConfidentialClientApplication {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Microsoft OAuth credentials in environment variables');
  }

  const config = {
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientSecret,
    },
  };

  return new ConfidentialClientApplication(config);
}

/**
 * Generate OAuth authorization URL
 * User will be redirected to this URL to grant permissions
 */
export async function getMicrosoftAuthUrl(userId: string, state?: string): Promise<string> {
  const msalClient = createMicrosoftAuthClient();
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI!;

  const authUrlRequest: AuthorizationUrlRequest = {
    scopes: MICROSOFT_SCOPES,
    redirectUri,
    state: state || userId,
    prompt: 'consent', // Force consent to get refresh token
  };

  const authUrl = await msalClient.getAuthCodeUrl(authUrlRequest);
  return authUrl;
}

/**
 * Exchange authorization code for tokens
 * Called in OAuth callback after user grants permission
 */
export async function exchangeMicrosoftCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
  email: string;
  name?: string;
}> {
  const msalClient = createMicrosoftAuthClient();
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI!;

  const tokenRequest: AuthorizationCodeRequest = {
    code,
    scopes: MICROSOFT_SCOPES,
    redirectUri,
  };

  const response = await msalClient.acquireTokenByCode(tokenRequest);

  if (!response || !response.accessToken || !response.refreshToken) {
    throw new Error('Failed to obtain access token or refresh token');
  }

  // Get user info from Microsoft Graph
  const userInfo = await getMicrosoftUserInfo(response.accessToken);

  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiryDate: response.expiresOn ? response.expiresOn.getTime() : Date.now() + 3600 * 1000,
    email: userInfo.email,
    name: userInfo.name,
  };
}

/**
 * Refresh access token using refresh token
 * Called automatically when access token expires
 */
export async function refreshMicrosoftToken(refreshToken: string): Promise<{
  accessToken: string;
  expiryDate: number;
}> {
  const msalClient = createMicrosoftAuthClient();

  const refreshTokenRequest = {
    refreshToken,
    scopes: MICROSOFT_SCOPES,
  };

  const response = await msalClient.acquireTokenByRefreshToken(refreshTokenRequest);

  if (!response || !response.accessToken) {
    throw new Error('Failed to refresh access token');
  }

  return {
    accessToken: response.accessToken,
    expiryDate: response.expiresOn ? response.expiresOn.getTime() : Date.now() + 3600 * 1000,
  };
}

/**
 * Check if token is expired or about to expire
 * Returns true if token expires within 5 minutes
 */
export function isMicrosoftTokenExpired(expiryDate: number): boolean {
  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
  return expiryDate <= fiveMinutesFromNow;
}

/**
 * Get valid access token, refreshing if necessary
 */
export async function getValidMicrosoftToken(
  accessToken: string,
  refreshToken: string,
  expiryDate: number
): Promise<{ accessToken: string; expiryDate: number; needsUpdate: boolean }> {
  if (isMicrosoftTokenExpired(expiryDate)) {
    const refreshed = await refreshMicrosoftToken(refreshToken);
    return {
      ...refreshed,
      needsUpdate: true,
    };
  }

  return {
    accessToken,
    expiryDate,
    needsUpdate: false,
  };
}

/**
 * Get user information from Microsoft Graph
 */
async function getMicrosoftUserInfo(accessToken: string): Promise<{
  email: string;
  name?: string;
  id: string;
}> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    email: data.mail || data.userPrincipalName,
    name: data.displayName,
    id: data.id,
  };
}

/**
 * Test Microsoft Graph API connection
 * Verifies that credentials are valid
 */
export async function testMicrosoftConnection(
  accessToken: string,
  refreshToken: string,
  expiryDate: number
): Promise<boolean> {
  try {
    const { accessToken: validToken } = await getValidMicrosoftToken(
      accessToken,
      refreshToken,
      expiryDate
    );

    // Try to get mailbox settings
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/mailboxSettings',
      {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Microsoft connection test failed:', error);
    return false;
  }
}

/**
 * Get mailbox profile information
 */
export async function getMicrosoftMailboxInfo(
  accessToken: string,
  refreshToken: string,
  expiryDate: number
): Promise<{
  emailAddress: string;
  displayName?: string;
  timeZone: string;
}> {
  const { accessToken: validToken } = await getValidMicrosoftToken(
    accessToken,
    refreshToken,
    expiryDate
  );

  // Get user info
  const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      Authorization: `Bearer ${validToken}`,
    },
  });

  if (!userResponse.ok) {
    throw new Error(`Failed to fetch mailbox info: ${userResponse.statusText}`);
  }

  const userData = await userResponse.json();

  // Get mailbox settings
  const settingsResponse = await fetch(
    'https://graph.microsoft.com/v1.0/me/mailboxSettings',
    {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    }
  );

  let timeZone = 'UTC';
  if (settingsResponse.ok) {
    const settingsData = await settingsResponse.json();
    timeZone = settingsData.timeZone || 'UTC';
  }

  return {
    emailAddress: userData.mail || userData.userPrincipalName,
    displayName: userData.displayName,
    timeZone,
  };
}

/**
 * Revoke OAuth access
 * Microsoft doesn't have a direct revoke endpoint, but we can clear local tokens
 */
export async function revokeMicrosoftAccess(accessToken: string): Promise<void> {
  // Microsoft Graph doesn't have a token revocation endpoint like Google
  // Tokens will expire naturally, and refresh tokens can be invalidated by
  // removing the app permission in the Microsoft account settings
  console.log('Microsoft tokens cleared. User should revoke app access in Microsoft account settings.');
}

/**
 * Parse error from Microsoft Graph API
 */
export function parseMicrosoftError(error: any): string {
  if (error.response?.data?.error) {
    const apiError = error.response.data.error;
    return `${apiError.code}: ${apiError.message}`;
  }

  if (error.message) {
    return error.message;
  }

  return 'Unknown Microsoft Graph API error';
}

/**
 * Make authenticated request to Microsoft Graph API
 */
export async function makeMicrosoftGraphRequest(
  accessToken: string,
  refreshToken: string,
  expiryDate: number,
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const { accessToken: validToken } = await getValidMicrosoftToken(
    accessToken,
    refreshToken,
    expiryDate
  );

  const url = endpoint.startsWith('https://')
    ? endpoint
    : `https://graph.microsoft.com/v1.0${endpoint}`;

  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${validToken}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
}

