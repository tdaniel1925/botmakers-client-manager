/**
 * Email Signatures Server Actions
 * CRUD operations for email signatures
 */

'use server';

import { db } from '@/db/db';
import { emailSignaturesTable } from '@/db/schema/email-signatures-schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get all signatures for current user
 */
export async function getEmailSignaturesAction(accountId?: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Build conditions
    const conditions = [eq(emailSignaturesTable.userId, userId)];
    
    if (accountId) {
      conditions.push(eq(emailSignaturesTable.accountId, accountId));
    }

    const signatures = await db
      .select()
      .from(emailSignaturesTable)
      .where(and(...conditions))
      .orderBy(desc(emailSignaturesTable.updatedAt));

    return {
      success: true,
      data: signatures,
    };
  } catch (error) {
    console.error('Error fetching email signatures:', error);
    return {
      success: false,
      error: 'Failed to fetch signatures',
    };
  }
}

/**
 * Get default signature for account or user
 */
export async function getDefaultSignatureAction(accountId?: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const signatures = await db
      .select()
      .from(emailSignaturesTable)
      .where(
        and(
          eq(emailSignaturesTable.userId, userId),
          eq(emailSignaturesTable.isDefault, true),
          accountId ? eq(emailSignaturesTable.accountId, accountId) : undefined
        )
      )
      .limit(1);

    return {
      success: true,
      data: signatures[0] || null,
    };
  } catch (error) {
    console.error('Error fetching default signature:', error);
    return {
      success: false,
      error: 'Failed to fetch default signature',
    };
  }
}

/**
 * Create new email signature
 */
export async function createEmailSignatureAction(data: {
  name: string;
  content: string;
  accountId?: string;
  isDefault?: boolean;
}): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // If setting as default, unset other defaults for this account
    if (data.isDefault) {
      await db
        .update(emailSignaturesTable)
        .set({ isDefault: false })
        .where(
          and(
            eq(emailSignaturesTable.userId, userId),
            data.accountId ? eq(emailSignaturesTable.accountId, data.accountId) : undefined
          )
        );
    }

    const [signature] = await db
      .insert(emailSignaturesTable)
      .values({
        userId,
        name: data.name,
        content: data.content,
        accountId: data.accountId,
        isDefault: data.isDefault || false,
      })
      .returning();

    return {
      success: true,
      data: signature,
    };
  } catch (error) {
    console.error('Error creating email signature:', error);
    return {
      success: false,
      error: 'Failed to create signature',
    };
  }
}

/**
 * Update email signature
 */
export async function updateEmailSignatureAction(
  id: string,
  data: {
    name?: string;
    content?: string;
    isDefault?: boolean;
  }
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // If setting as default, get the signature's accountId first
    if (data.isDefault) {
      const [existing] = await db
        .select()
        .from(emailSignaturesTable)
        .where(
          and(
            eq(emailSignaturesTable.id, id),
            eq(emailSignaturesTable.userId, userId)
          )
        );

      if (existing) {
        // Unset other defaults for this account
        await db
          .update(emailSignaturesTable)
          .set({ isDefault: false })
          .where(
            and(
              eq(emailSignaturesTable.userId, userId),
              existing.accountId ? eq(emailSignaturesTable.accountId, existing.accountId) : undefined
            )
          );
      }
    }

    const [updated] = await db
      .update(emailSignaturesTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(emailSignaturesTable.id, id),
          eq(emailSignaturesTable.userId, userId)
        )
      )
      .returning();

    if (!updated) {
      return { success: false, error: 'Signature not found' };
    }

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error('Error updating email signature:', error);
    return {
      success: false,
      error: 'Failed to update signature',
    };
  }
}

/**
 * Delete email signature
 */
export async function deleteEmailSignatureAction(id: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await db
      .delete(emailSignaturesTable)
      .where(
        and(
          eq(emailSignaturesTable.id, id),
          eq(emailSignaturesTable.userId, userId)
        )
      );

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting email signature:', error);
    return {
      success: false,
      error: 'Failed to delete signature',
    };
  }
}


