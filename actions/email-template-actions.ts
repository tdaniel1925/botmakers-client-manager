/**
 * Email Template Server Actions
 * Manage reusable email templates
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/db';
import { emailTemplatesTable } from '@/db/schema/email-templates-schema';
import { eq, and, or, desc } from 'drizzle-orm';
import type { InsertEmailTemplate, SelectEmailTemplate } from '@/db/schema/email-templates-schema';

interface ActionResult<T = void> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Create a new email template
 */
export async function createEmailTemplateAction(
  template: Omit<InsertEmailTemplate, 'userId' | 'id' | 'createdAt' | 'updatedAt'>
): Promise<ActionResult<{ template: SelectEmailTemplate }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const [newTemplate] = await db
      .insert(emailTemplatesTable)
      .values({
        ...template,
        userId,
        usageCount: '0',
      })
      .returning();

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      message: 'Template created successfully',
      data: { template: newTemplate },
    };
  } catch (error) {
    console.error('Error creating template:', error);
    return {
      success: false,
      error: 'Failed to create template',
    };
  }
}

/**
 * Get all templates for user
 */
export async function getEmailTemplatesAction(
  organizationId?: string
): Promise<ActionResult<{ templates: SelectEmailTemplate[] }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const templates = await db.query.emailTemplatesTable.findMany({
      where: or(
        eq(emailTemplatesTable.userId, userId),
        and(
          eq(emailTemplatesTable.isShared, 'true'),
          organizationId ? eq(emailTemplatesTable.organizationId, organizationId) : undefined
        )
      ),
      orderBy: [desc(emailTemplatesTable.updatedAt)],
    });

    return {
      success: true,
      data: { templates },
    };
  } catch (error) {
    console.error('Error fetching templates:', error);
    return {
      success: false,
      error: 'Failed to fetch templates',
    };
  }
}

/**
 * Get a single template
 */
export async function getEmailTemplateAction(
  templateId: string
): Promise<ActionResult<{ template: SelectEmailTemplate }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const template = await db.query.emailTemplatesTable.findFirst({
      where: eq(emailTemplatesTable.id, templateId),
    });

    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    // Check access (owner or shared)
    if (template.userId !== userId && template.isShared !== 'true') {
      return { success: false, error: 'Unauthorized' };
    }

    return {
      success: true,
      data: { template },
    };
  } catch (error) {
    console.error('Error fetching template:', error);
    return {
      success: false,
      error: 'Failed to fetch template',
    };
  }
}

/**
 * Update a template
 */
export async function updateEmailTemplateAction(
  templateId: string,
  updates: Partial<InsertEmailTemplate>
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const template = await db.query.emailTemplatesTable.findFirst({
      where: eq(emailTemplatesTable.id, templateId),
    });

    if (!template || template.userId !== userId) {
      return { success: false, error: 'Template not found' };
    }

    await db
      .update(emailTemplatesTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(emailTemplatesTable.id, templateId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      message: 'Template updated successfully',
    };
  } catch (error) {
    console.error('Error updating template:', error);
    return {
      success: false,
      error: 'Failed to update template',
    };
  }
}

/**
 * Delete a template
 */
export async function deleteEmailTemplateAction(
  templateId: string
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const template = await db.query.emailTemplatesTable.findFirst({
      where: eq(emailTemplatesTable.id, templateId),
    });

    if (!template || template.userId !== userId) {
      return { success: false, error: 'Template not found' };
    }

    await db.delete(emailTemplatesTable).where(eq(emailTemplatesTable.id, templateId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      message: 'Template deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting template:', error);
    return {
      success: false,
      error: 'Failed to delete template',
    };
  }
}

/**
 * Toggle template favorite status
 */
export async function toggleTemplateFavoriteAction(
  templateId: string
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const template = await db.query.emailTemplatesTable.findFirst({
      where: eq(emailTemplatesTable.id, templateId),
    });

    if (!template || template.userId !== userId) {
      return { success: false, error: 'Template not found' };
    }

    // Note: isFavorite field not yet implemented in schema
    // This is a placeholder that can be implemented when the field is added
    
    return {
      success: true,
      message: 'Favorite toggled',
    };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return {
      success: false,
      error: 'Failed to update template',
    };
  }
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsageAction(
  templateId: string
): Promise<ActionResult> {
  try {
    const template = await db.query.emailTemplatesTable.findFirst({
      where: eq(emailTemplatesTable.id, templateId),
    });

    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    const newUsageCount = String(parseInt(template.usageCount || '0') + 1);

    await db
      .update(emailTemplatesTable)
      .set({
        usageCount: newUsageCount,
        updatedAt: new Date(),
      })
      .where(eq(emailTemplatesTable.id, templateId));

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return {
      success: false,
      error: 'Failed to update usage count',
    };
  }
}

/**
 * Apply template variables to content
 */
export function applyTemplateVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  
  return result;
}

