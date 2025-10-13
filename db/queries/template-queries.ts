/**
 * Template Queries
 * Database operations for notification templates
 */

import { db } from '@/db/db';
import { notificationTemplatesTable } from '@/db/schema/templates-schema';
import { eq, and, desc, sql } from 'drizzle-orm';

/**
 * Get all templates
 */
export async function getAllTemplates() {
  try {
    const templates = await db
      .select()
      .from(notificationTemplatesTable)
      .where(eq(notificationTemplatesTable.isActive, true))
      .orderBy(
        notificationTemplatesTable.type,
        notificationTemplatesTable.category
      );
    
    return templates;
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
}

/**
 * Get templates by type (email or sms)
 */
export async function getTemplatesByType(type: 'email' | 'sms') {
  try {
    const templates = await db
      .select()
      .from(notificationTemplatesTable)
      .where(
        and(
          eq(notificationTemplatesTable.type, type),
          eq(notificationTemplatesTable.isActive, true)
        )
      )
      .orderBy(notificationTemplatesTable.category);
    
    return templates;
  } catch (error) {
    console.error(`Error fetching ${type} templates:`, error);
    return [];
  }
}

/**
 * Get template by ID
 */
export async function getTemplateById(id: string) {
  try {
    const template = await db
      .select()
      .from(notificationTemplatesTable)
      .where(eq(notificationTemplatesTable.id, id))
      .limit(1);
    
    return template[0] || null;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

/**
 * Get template by category and type
 */
export async function getTemplateByCategory(category: string, type: 'email' | 'sms') {
  try {
    const template = await db
      .select()
      .from(notificationTemplatesTable)
      .where(
        and(
          eq(notificationTemplatesTable.category, category),
          eq(notificationTemplatesTable.type, type),
          eq(notificationTemplatesTable.isActive, true)
        )
      )
      .limit(1);
    
    return template[0] || null;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

/**
 * Create new template
 */
export async function createTemplate(data: {
  name: string;
  type: 'email' | 'sms';
  category: string;
  subject?: string;
  bodyText: string;
  bodyHtml?: string;
  variables?: any[];
  isSystem?: boolean;
}) {
  try {
    const template = await db
      .insert(notificationTemplatesTable)
      .values({
        name: data.name,
        type: data.type,
        category: data.category,
        subject: data.subject,
        bodyText: data.bodyText,
        bodyHtml: data.bodyHtml,
        variables: data.variables || [],
        isSystem: data.isSystem || false,
      })
      .returning();
    
    return { success: true, template: template[0] };
  } catch (error) {
    console.error('Error creating template:', error);
    return { success: false, error };
  }
}

/**
 * Update template
 */
export async function updateTemplate(
  id: string,
  data: {
    name?: string;
    subject?: string;
    bodyText?: string;
    bodyHtml?: string;
    variables?: any[];
    isActive?: boolean;
  }
) {
  try {
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.bodyText !== undefined) updateData.bodyText = data.bodyText;
    if (data.bodyHtml !== undefined) updateData.bodyHtml = data.bodyHtml;
    if (data.variables !== undefined) updateData.variables = data.variables;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    
    const template = await db
      .update(notificationTemplatesTable)
      .set(updateData)
      .where(eq(notificationTemplatesTable.id, id))
      .returning();
    
    return { success: true, template: template[0] };
  } catch (error) {
    console.error('Error updating template:', error);
    return { success: false, error };
  }
}

/**
 * Delete template (only non-system templates)
 */
export async function deleteTemplate(id: string) {
  try {
    // Check if it's a system template
    const template = await getTemplateById(id);
    if (!template) {
      return { success: false, error: 'Template not found' };
    }
    
    if (template.isSystem) {
      return { success: false, error: 'Cannot delete system templates' };
    }
    
    // Soft delete by setting inactive
    await db
      .update(notificationTemplatesTable)
      .set({ isActive: false })
      .where(eq(notificationTemplatesTable.id, id));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting template:', error);
    return { success: false, error };
  }
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsage(id: string) {
  try {
    await db
      .update(notificationTemplatesTable)
      .set({
        usageCount: sql`${notificationTemplatesTable.usageCount} + 1`,
      })
      .where(eq(notificationTemplatesTable.id, id));
    
    return { success: true };
  } catch (error) {
    console.error('Error incrementing template usage:', error);
    return { success: false };
  }
}

/**
 * Duplicate template
 */
export async function duplicateTemplate(id: string) {
  try {
    const original = await getTemplateById(id);
    if (!original) {
      return { success: false, error: 'Template not found' };
    }
    
    const duplicate = await createTemplate({
      name: `${original.name} (Copy)`,
      type: original.type as 'email' | 'sms',
      category: original.category,
      subject: original.subject || undefined,
      bodyText: original.bodyText,
      bodyHtml: original.bodyHtml || undefined,
      variables: original.variables as any[],
      isSystem: false, // Duplicates are never system templates
    });
    
    return duplicate;
  } catch (error) {
    console.error('Error duplicating template:', error);
    return { success: false, error };
  }
}
