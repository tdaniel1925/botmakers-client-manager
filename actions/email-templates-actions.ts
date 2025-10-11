/**
 * Email Templates Server Actions
 * CRUD operations for email templates
 */

'use server';

import { db } from '@/db/db';
import { emailTemplatesTable } from '@/db/schema/email-templates-schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get all templates for current user
 */
export async function getEmailTemplatesAction(): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const templates = await db
      .select()
      .from(emailTemplatesTable)
      .where(eq(emailTemplatesTable.userId, userId))
      .orderBy(desc(emailTemplatesTable.updatedAt));

    return {
      success: true,
      data: templates,
    };
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return {
      success: false,
      error: 'Failed to fetch templates',
    };
  }
}

/**
 * Create new email template
 */
export async function createEmailTemplateAction(data: {
  name: string;
  category?: string;
  subject?: string;
  body: string;
}): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const [template] = await db
      .insert(emailTemplatesTable)
      .values({
        userId,
        name: data.name,
        category: data.category || 'general',
        subject: data.subject,
        body: data.body,
      })
      .returning();

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    console.error('Error creating email template:', error);
    return {
      success: false,
      error: 'Failed to create template',
    };
  }
}

/**
 * Update email template
 */
export async function updateEmailTemplateAction(
  id: string,
  data: {
    name?: string;
    category?: string;
    subject?: string;
    body?: string;
  }
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const [updated] = await db
      .update(emailTemplatesTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(emailTemplatesTable.id, id),
          eq(emailTemplatesTable.userId, userId)
        )
      )
      .returning();

    if (!updated) {
      return { success: false, error: 'Template not found' };
    }

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error('Error updating email template:', error);
    return {
      success: false,
      error: 'Failed to update template',
    };
  }
}

/**
 * Delete email template
 */
export async function deleteEmailTemplateAction(id: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await db
      .delete(emailTemplatesTable)
      .where(
        and(
          eq(emailTemplatesTable.id, id),
          eq(emailTemplatesTable.userId, userId)
        )
      );

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting email template:', error);
    return {
      success: false,
      error: 'Failed to delete template',
    };
  }
}

/**
 * Increment usage count for template
 */
export async function incrementTemplateUsageAction(id: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get current count
    const [template] = await db
      .select()
      .from(emailTemplatesTable)
      .where(
        and(
          eq(emailTemplatesTable.id, id),
          eq(emailTemplatesTable.userId, userId)
        )
      );

    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    const currentCount = parseInt(template.usageCount || '0');

    await db
      .update(emailTemplatesTable)
      .set({
        usageCount: (currentCount + 1).toString(),
        updatedAt: new Date(),
      })
      .where(eq(emailTemplatesTable.id, id));

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error incrementing template usage:', error);
    return {
      success: false,
      error: 'Failed to increment usage',
    };
  }
}

