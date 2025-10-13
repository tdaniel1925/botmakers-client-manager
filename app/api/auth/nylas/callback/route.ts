/**
 * Nylas OAuth Callback Handler
 * 
 * Handles the OAuth callback from Nylas after user authorization.
 * Exchanges the authorization code for a grant ID and saves the account.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { exchangeNylasCode, createNylasWebhook } from '@/lib/email-providers/nylas-client';
import { db } from '@/db/db';
import { emailAccountsTable } from '@/db/schema/email-schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.redirect(
        new URL('/sign-in?error=unauthorized', request.url)
      );
    }

    // Get the authorization code from query params
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Nylas OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/platform/emails?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/platform/emails?error=no_code', request.url)
      );
    }

    // Exchange the code for a grant
    const { grantId, email, provider } = await exchangeNylasCode(code);

    // Check if account already exists
    const existingAccount = await db.query.emailAccountsTable.findFirst({
      where: eq(emailAccountsTable.emailAddress, email),
    });

    if (existingAccount) {
      // Update existing account with new grant ID
      await db
        .update(emailAccountsTable)
        .set({
          nylasGrantId: grantId,
          authType: 'oauth',
          provider: provider as any,
          status: 'active',
          lastSyncAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(emailAccountsTable.id, existingAccount.id));

      // Set up webhook if not already configured
      if (!existingAccount.webhookSubscriptionId) {
        try {
          const webhookUrl = `${request.nextUrl.origin}/api/webhooks/nylas`;
          console.log('🔔 Setting up webhook for reconnected account:', email);
          
          const webhook = await createNylasWebhook(
            webhookUrl,
            ['message.created', 'message.updated', 'thread.replied', 'message.deleted']
          );

          await db
            .update(emailAccountsTable)
            .set({
              webhookSubscriptionId: webhook.data.id,
              updatedAt: new Date(),
            })
            .where(eq(emailAccountsTable.id, existingAccount.id));

          console.log('✅ Webhook setup successful:', webhook.data.id);
        } catch (webhookError) {
          console.error('⚠️ Failed to set up webhook (non-fatal):', webhookError);
        }
      }

      return NextResponse.redirect(
        new URL(
          `/platform/emails?success=reconnected&email=${encodeURIComponent(email)}`,
          request.url
        )
      );
    }

    // Create new email account
    const [newAccount] = await db.insert(emailAccountsTable).values({
      userId,
      emailAddress: email,
      displayName: email.split('@')[0], // Extract name from email
      provider: provider as any,
      authType: 'oauth',
      nylasGrantId: grantId,
      status: 'active',
      isDefault: false, // You can make first account default
      lastSyncAt: new Date(),
    }).returning();

    // Automatically set up webhook for real-time email sync
    try {
      const webhookUrl = `${request.nextUrl.origin}/api/webhooks/nylas`;
      console.log('🔔 Setting up webhook for new account:', email, 'URL:', webhookUrl);
      
      const webhook = await createNylasWebhook(
        webhookUrl,
        ['message.created', 'message.updated', 'thread.replied', 'message.deleted']
      );

      // Save webhook ID to account
      await db
        .update(emailAccountsTable)
        .set({
          webhookSubscriptionId: webhook.data.id,
          updatedAt: new Date(),
        })
        .where(eq(emailAccountsTable.id, newAccount.id));

      console.log('✅ Webhook setup successful:', webhook.data.id);
    } catch (webhookError) {
      // Don't fail account creation if webhook fails
      console.error('⚠️ Failed to set up webhook (non-fatal):', webhookError);
    }

    // Redirect back to emails page with success message
    return NextResponse.redirect(
      new URL(
        `/platform/emails?success=connected&email=${encodeURIComponent(email)}`,
        request.url
      )
    );
  } catch (error) {
    console.error('Nylas callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/platform/emails?error=${encodeURIComponent('Failed to connect account')}`,
        request.url
      )
    );
  }
}

