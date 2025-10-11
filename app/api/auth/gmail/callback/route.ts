/**
 * Gmail OAuth Callback Handler
 * Handles OAuth redirect from Google after user grants permission
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { exchangeGmailCode } from '@/lib/email-providers/gmail-oauth';
import { createEmailAccount } from '@/db/queries/email-account-queries';
import { encrypt } from '@/lib/email-encryption';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.redirect(
        new URL('/sign-in?error=unauthorized', request.url)
      );
    }

    // Get OAuth code and state from query params
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      console.error('Gmail OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/platform/emails?error=oauth_failed&provider=gmail`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/platform/emails?error=missing_code', request.url)
      );
    }

    // Verify state matches user ID (CSRF protection)
    if (state && state !== userId) {
      console.error('State mismatch:', { expected: userId, received: state });
      return NextResponse.redirect(
        new URL('/platform/emails?error=state_mismatch', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeGmailCode(code);

    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(tokens.accessToken, userId);
    const encryptedRefreshToken = encrypt(tokens.refreshToken, userId);

    // Save account to database
    await createEmailAccount({
      userId,
      provider: 'gmail',
      authType: 'oauth',
      emailAddress: tokens.email,
      displayName: tokens.name,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      tokenExpiresAt: new Date(tokens.expiryDate),
      status: 'active',
      isDefault: false, // User can set this later
    });

    // Redirect to email page with success message
    return NextResponse.redirect(
      new URL('/platform/emails?success=gmail_connected', request.url)
    );
  } catch (error) {
    console.error('Gmail OAuth callback error:', error);
    
    return NextResponse.redirect(
      new URL('/platform/emails?error=connection_failed', request.url)
    );
  }
}





