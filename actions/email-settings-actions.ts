/**
 * Email Settings Actions
 * Server actions for managing email account settings
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { emailSettingsTable, emailAccountsTable } from '@/db/schema/email-schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { InsertEmailSettings, SelectEmailSettings } from '@/db/schema/email-schema';

/**
 * Get email settings for an account
 */
export async function getEmailSettingsAction(accountId: string): Promise<{
  success: boolean;
  settings?: SelectEmailSettings;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify account ownership
    const account = await db.query.emailAccountsTable.findFirst({
      where: and(
        eq(emailAccountsTable.id, accountId),
        eq(emailAccountsTable.userId, userId)
      ),
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Get settings
    const settings = await db.query.emailSettingsTable.findFirst({
      where: eq(emailSettingsTable.accountId, accountId),
    });

    // If settings don't exist, create default
    if (!settings) {
      const result = await createDefaultSettingsAction(accountId);
      if (result.success && result.settings) {
        return { success: true, settings: result.settings };
      }
      return { success: false, error: 'Failed to create default settings' };
    }

    return { success: true, settings };
  } catch (error: any) {
    console.error('Error getting email settings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create default settings for an account
 */
export async function createDefaultSettingsAction(accountId: string): Promise<{
  success: boolean;
  settings?: SelectEmailSettings;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify account ownership
    const account = await db.query.emailAccountsTable.findFirst({
      where: and(
        eq(emailAccountsTable.id, accountId),
        eq(emailAccountsTable.userId, userId)
      ),
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Check if settings already exist
    const existing = await db.query.emailSettingsTable.findFirst({
      where: eq(emailSettingsTable.accountId, accountId),
    });

    if (existing) {
      return { success: true, settings: existing };
    }

    // Migrate signature from old account settings if it exists
    const signature = account.signature || '';

    // Create default settings
    const [newSettings] = await db
      .insert(emailSettingsTable)
      .values({
        accountId,
        userId,
        signature,
        signatureEnabled: !!signature,
        // All other fields use defaults from schema
      })
      .returning();

    revalidatePath('/platform/emails/settings');
    revalidatePath('/dashboard/emails/settings');

    return { success: true, settings: newSettings };
  } catch (error: any) {
    console.error('Error creating default settings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update email settings
 */
export async function updateEmailSettingsAction(
  accountId: string,
  updates: Partial<InsertEmailSettings>
): Promise<{
  success: boolean;
  settings?: SelectEmailSettings;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify account ownership
    const account = await db.query.emailAccountsTable.findFirst({
      where: and(
        eq(emailAccountsTable.id, accountId),
        eq(emailAccountsTable.userId, userId)
      ),
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Get or create settings
    let settings = await db.query.emailSettingsTable.findFirst({
      where: eq(emailSettingsTable.accountId, accountId),
    });

    if (!settings) {
      const createResult = await createDefaultSettingsAction(accountId);
      if (!createResult.success || !createResult.settings) {
        return { success: false, error: 'Failed to create settings' };
      }
      settings = createResult.settings;
    }

    // Update settings
    const [updatedSettings] = await db
      .update(emailSettingsTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(emailSettingsTable.id, settings.id))
      .returning();

    revalidatePath('/platform/emails/settings');
    revalidatePath('/dashboard/emails/settings');

    return { success: true, settings: updatedSettings };
  } catch (error: any) {
    console.error('Error updating email settings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get or create settings (convenience function)
 */
export async function getOrCreateSettingsAction(accountId: string): Promise<{
  success: boolean;
  settings?: SelectEmailSettings;
  error?: string;
}> {
  const result = await getEmailSettingsAction(accountId);
  
  if (!result.success || !result.settings) {
    return await createDefaultSettingsAction(accountId);
  }

  return result;
}


