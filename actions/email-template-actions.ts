/**
 * Email Template Server Actions
 * Manage reusable email templates
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { emailTemplates } from '@/db/schema/email-templates-schema';
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
      .insert(emailTemplates)
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

    const templates = await db.query.emailTemplates.findMany({
      where: or(
        eq(emailTemplates.userId, userId),
        and(
          eq(emailTemplates.isGlobal, true),
          organizationId ? eq(emailTemplates.organizationId, organizationId) : undefined
        )
      ),
      orderBy: [desc(emailTemplates.isFavorite), desc(emailTemplates.usageCount)],
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

    const template = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.id, templateId),
    });

    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    // Check access (owner or global)
    if (template.userId !== userId && !template.isGlobal) {
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
    const template = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.id, templateId),
    });

    if (!template || template.userId !== userId) {
      return { success: false, error: 'Template not found' };
    }

    await db
      .update(emailTemplates)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(emailTemplates.id, templateId));

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
    const template = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.id, templateId),
    });

    if (!template || template.userId !== userId) {
      return { success: false, error: 'Template not found' };
    }

    await db.delete(emailTemplates).where(eq(emailTemplates.id, templateId));

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

    const template = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.id, templateId),
    });

    if (!template || template.userId !== userId) {
      return { success: false, error: 'Template not found' };
    }

    await db
      .update(emailTemplates)
      .set({
        isFavorite: !template.isFavorite,
        updatedAt: new Date(),
      })
      .where(eq(emailTemplates.id, templateId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return {
      success: true,
      message: template.isFavorite ? 'Removed from favorites' : 'Added to favorites',
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
    const template = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.id, templateId),
    });

    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    const newUsageCount = String(parseInt(template.usageCount || '0') + 1);

    await db
      .update(emailTemplates)
      .set({
        usageCount: newUsageCount,
        lastUsedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(emailTemplates.id, templateId));

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

