/**
 * Email Account Server Actions
 * Server-side API for email account management
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import {
  getEmailAccountsByUserId,
  getEmailAccountById,
  createEmailAccount,
  updateEmailAccount,
  deleteEmailAccount,
  setDefaultEmailAccount,
  getDefaultEmailAccount,
  updateEmailAccountStatus,
} from '@/db/queries/email-account-queries';
import { encrypt, decrypt } from '@/lib/email-encryption';
import { getGmailAuthUrl, testGmailConnection } from '@/lib/email-providers/gmail-oauth';
import { getMicrosoftAuthUrl, testMicrosoftConnection } from '@/lib/email-providers/microsoft-oauth';
import type { SelectEmailAccount } from '@/db/schema/email-schema';

// ============================================================================
// Get Email Accounts
// ============================================================================

export async function getEmailAccountsAction(): Promise<{
  success: boolean;
  accounts?: SelectEmailAccount[];
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const accounts = await getEmailAccountsByUserId(userId);

    return { success: true, accounts };
  } catch (error) {
    console.error('Error fetching email accounts:', error);
    return { success: false, error: 'Failed to fetch email accounts' };
  }
}

export async function getEmailAccountByIdAction(accountId: string): Promise<{
  success: boolean;
  account?: SelectEmailAccount;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const account = await getEmailAccountById(accountId);

    if (!account || account.userId !== userId) {
      return { success: false, error: 'Account not found or access denied' };
    }

    return { success: true, account };
  } catch (error) {
    console.error('Error fetching email account:', error);
    return { success: false, error: 'Failed to fetch email account' };
  }
}

export async function getDefaultEmailAccountAction(): Promise<{
  success: boolean;
  account?: SelectEmailAccount;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const account = await getDefaultEmailAccount(userId);

    return { success: true, account };
  } catch (error) {
    console.error('Error fetching default email account:', error);
    return { success: false, error: 'Failed to fetch default account' };
  }
}

// ============================================================================
// OAuth Connection
// ============================================================================

export async function getGmailOAuthUrlAction(): Promise<{
  success: boolean;
  authUrl?: string;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const authUrl = getGmailAuthUrl(userId);

    return { success: true, authUrl };
  } catch (error) {
    console.error('Error generating Gmail OAuth URL:', error);
    return { success: false, error: 'Failed to generate OAuth URL' };
  }
}

export async function getMicrosoftOAuthUrlAction(): Promise<{
  success: boolean;
  authUrl?: string;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const authUrl = await getMicrosoftAuthUrl(userId);

    return { success: true, authUrl };
  } catch (error) {
    console.error('Error generating Microsoft OAuth URL:', error);
    return { success: false, error: 'Failed to generate OAuth URL' };
  }
}

// ============================================================================
// IMAP/SMTP Connection
// ============================================================================

export async function connectImapAccountAction(data: {
  emailAddress: string;
  displayName?: string;
  imapHost: string;
  imapPort: number;
  imapUsername: string;
  imapPassword: string;
  imapUseSsl?: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpUseSsl?: boolean;
}): Promise<{
  success: boolean;
  accountId?: string;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Encrypt passwords
    const encryptedImapPassword = encrypt(data.imapPassword, userId);
    const encryptedSmtpPassword = encrypt(data.smtpPassword, userId);

    // Create account
    const account = await createEmailAccount({
      userId,
      provider: 'custom',
      authType: 'password',
      emailAddress: data.emailAddress,
      displayName: data.displayName,
      imapHost: data.imapHost,
      imapPort: data.imapPort,
      imapUsername: data.imapUsername,
      imapPassword: encryptedImapPassword,
      imapUseSsl: data.imapUseSsl ?? true,
      smtpHost: data.smtpHost,
      smtpPort: data.smtpPort,
      smtpUsername: data.smtpUsername,
      smtpPassword: encryptedSmtpPassword,
      smtpUseSsl: data.smtpUseSsl ?? true,
      status: 'active',
      isDefault: false,
    });

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true, accountId: account.id };
  } catch (error) {
    console.error('Error connecting IMAP account:', error);
    return { success: false, error: 'Failed to connect IMAP account' };
  }
}

// ============================================================================
// Test Connection
// ============================================================================

export async function testEmailAccountConnectionAction(accountId: string): Promise<{
  success: boolean;
  isValid?: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const account = await getEmailAccountById(accountId);

    if (!account || account.userId !== userId) {
      return { success: false, error: 'Account not found or access denied' };
    }

    let isValid = false;

    if (account.provider === 'gmail' && account.authType === 'oauth') {
      // Test Gmail connection
      const accessToken = decrypt(account.accessToken!, userId);
      const refreshToken = decrypt(account.refreshToken!, userId);
      const expiryDate = account.tokenExpiresAt!.getTime();

      isValid = await testGmailConnection(accessToken, refreshToken, expiryDate);
    } else if (account.provider === 'microsoft' && account.authType === 'oauth') {
      // Test Microsoft connection
      const accessToken = decrypt(account.accessToken!, userId);
      const refreshToken = decrypt(account.refreshToken!, userId);
      const expiryDate = account.tokenExpiresAt!.getTime();

      isValid = await testMicrosoftConnection(accessToken, refreshToken, expiryDate);
    } else {
      // TODO: Test IMAP/SMTP connection
      isValid = true; // Placeholder
    }

    // Update account status
    await updateEmailAccountStatus(accountId, isValid ? 'active' : 'error');

    return { success: true, isValid };
  } catch (error) {
    console.error('Error testing email account connection:', error);
    return { success: false, error: 'Failed to test connection' };
  }
}

// ============================================================================
// Update Account
// ============================================================================

export async function setDefaultAccountAction(accountId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const account = await getEmailAccountById(accountId);

    if (!account || account.userId !== userId) {
      return { success: false, error: 'Account not found or access denied' };
    }

    await setDefaultEmailAccount(userId, accountId);

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error) {
    console.error('Error setting default account:', error);
    return { success: false, error: 'Failed to set default account' };
  }
}

export async function updateEmailAccountSignatureAction(
  accountId: string,
  signature: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const account = await getEmailAccountById(accountId);

    if (!account || account.userId !== userId) {
      return { success: false, error: 'Account not found or access denied' };
    }

    await updateEmailAccount(accountId, { signature });

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error) {
    console.error('Error updating signature:', error);
    return { success: false, error: 'Failed to update signature' };
  }
}

// ============================================================================
// Delete Account
// ============================================================================

export async function deleteEmailAccountAction(accountId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const account = await getEmailAccountById(accountId);

    if (!account || account.userId !== userId) {
      return { success: false, error: 'Account not found or access denied' };
    }

    await deleteEmailAccount(accountId);

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error) {
    console.error('Error deleting email account:', error);
    return { success: false, error: 'Failed to delete account' };
  }
}

// ============================================================================
// Sync Trigger
// ============================================================================

export async function triggerManualSyncAction(accountId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const account = await getEmailAccountById(accountId);

    if (!account || account.userId !== userId) {
      return { success: false, error: 'Account not found or access denied' };
    }

    // Update status to syncing
    await updateEmailAccountStatus(accountId, 'syncing');

    // TODO: Trigger sync job (will be implemented in Phase 5)
    // For now, just revert status back to active
    setTimeout(async () => {
      await updateEmailAccountStatus(accountId, 'active');
    }, 2000);

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error) {
    console.error('Error triggering sync:', error);
    return { success: false, error: 'Failed to trigger sync' };
  }
}

