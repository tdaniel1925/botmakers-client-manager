/**
 * IMAP Connection Actions
 * Simple server actions for connecting email accounts
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { emailAccounts } from '@/db/schema/email-schema';
import { encrypt } from '@/lib/email-encryption';
import { nanoid } from 'nanoid';

interface ConnectImapAccountParams {
  emailAddress: string;
  password: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
}

interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
  accountId?: string;
}

/**
 * Connect an IMAP email account
 * For now, just saves credentials - full IMAP connection coming soon
 */
export async function connectImapAccountAction(
  params: ConnectImapAccountParams
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized - Please sign in',
      };
    }

    // Basic validation
    if (!params.emailAddress || !params.password) {
      return {
        success: false,
        error: 'Email and password are required',
      };
    }

    if (!params.imapHost || !params.smtpHost) {
      return {
        success: false,
        error: 'IMAP and SMTP hosts are required',
      };
    }

    // Encrypt the password with userId
    const encryptedPassword = encrypt(params.password, userId);

    // Create the account record
    const accountId = nanoid();
    
    await db.insert(emailAccounts).values({
      id: accountId,
      userId,
      emailAddress: params.emailAddress,
      provider: 'imap', // Generic IMAP
      authType: 'password',
      password: encryptedPassword,
      imapHost: params.imapHost,
      imapPort: params.imapPort,
      smtpHost: params.smtpHost,
      smtpPort: params.smtpPort,
      smtpSecure: params.smtpSecure,
      status: 'active', // Mark as active for now
      settings: {
        syncEnabled: true,
        sendEnabled: true,
        aiSummariesEnabled: true,
        aiCopilotEnabled: true,
        realtimeNotificationsEnabled: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: 'Email account connected successfully! Sync will start shortly.',
      accountId,
    };
  } catch (error) {
    console.error('Error connecting IMAP account:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return {
          success: false,
          error: 'This email account is already connected',
        };
      }
      
      return {
        success: false,
        error: `Connection failed: ${error.message}`,
      };
    }
    
    return {
      success: false,
      error: 'Failed to connect email account. Please check your credentials and try again.',
    };
  }
}

