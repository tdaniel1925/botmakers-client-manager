/**
 * Template Server Actions
 * Handles template CRUD operations and testing
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import {
  getAllTemplates,
  getTemplatesByType,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
} from '@/db/queries/template-queries';
import { validateTemplate, previewTemplate, extractVariables } from '@/lib/template-service';
import { sendEmail } from '@/lib/email-service';
import { sendSMS } from '@/lib/sms-service';
import { getPlatformAdminPreferences } from '@/db/queries/notification-preferences-queries';

/**
 * Get all templates
 */
export async function getTemplatesAction() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Check if platform admin
  const isPlatformAdmin = !!(await getPlatformAdminPreferences(userId));
  if (!isPlatformAdmin) {
    throw new Error('Only platform admins can manage templates');
  }

  const templates = await getAllTemplates();
  return { success: true, templates };
}

/**
 * Get templates by type
 */
export async function getTemplatesByTypeAction(type: 'email' | 'sms') {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const templates = await getTemplatesByType(type);
  return { success: true, templates };
}

/**
 * Get template by ID
 */
export async function getTemplateByIdAction(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const template = await getTemplateById(id);
  if (!template) {
    return { success: false, error: 'Template not found' };
  }

  return { success: true, template };
}

/**
 * Create new template
 */
export async function createTemplateAction(data: {
  name: string;
  type: 'email' | 'sms';
  category: string;
  subject?: string;
  bodyText: string;
  bodyHtml?: string;
  variables?: any[];
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Check if platform admin
  const isPlatformAdmin = !!(await getPlatformAdminPreferences(userId));
  if (!isPlatformAdmin) {
    throw new Error('Only platform admins can create templates');
  }

  // Validate content
  const validation = validateTemplate(data.bodyText, data.type);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join(', ') };
  }

  if (data.bodyHtml) {
    const htmlValidation = validateTemplate(data.bodyHtml, data.type);
    if (!htmlValidation.valid) {
      return { success: false, error: htmlValidation.errors.join(', ') };
    }
  }

  const result = await createTemplate(data);
  return result;
}

/**
 * Update template
 */
export async function updateTemplateAction(
  id: string,
  data: {
    name?: string;
    subject?: string;
    bodyText?: string;
    bodyHtml?: string;
    variables?: any[];
  }
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Check if platform admin
  const isPlatformAdmin = !!(await getPlatformAdminPreferences(userId));
  if (!isPlatformAdmin) {
    throw new Error('Only platform admins can edit templates');
  }

  // Get template to check type
  const template = await getTemplateById(id);
  if (!template) {
    return { success: false, error: 'Template not found' };
  }

  // Validate if body content is being updated
  if (data.bodyText) {
    const validation = validateTemplate(data.bodyText, template.type as 'email' | 'sms');
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') };
    }
  }

  if (data.bodyHtml) {
    const htmlValidation = validateTemplate(data.bodyHtml, 'email');
    if (!htmlValidation.valid) {
      return { success: false, error: htmlValidation.errors.join(', ') };
    }
  }

  const result = await updateTemplate(id, data);
  return result;
}

/**
 * Delete template
 */
export async function deleteTemplateAction(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Check if platform admin
  const isPlatformAdmin = !!(await getPlatformAdminPreferences(userId));
  if (!isPlatformAdmin) {
    throw new Error('Only platform admins can delete templates');
  }

  const result = await deleteTemplate(id);
  return result;
}

/**
 * Duplicate template
 */
export async function duplicateTemplateAction(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Check if platform admin
  const isPlatformAdmin = !!(await getPlatformAdminPreferences(userId));
  if (!isPlatformAdmin) {
    throw new Error('Only platform admins can duplicate templates');
  }

  const result = await duplicateTemplate(id);
  return result;
}

/**
 * Preview template with sample data
 */
export async function previewTemplateAction(
  content: string,
  sampleData: Record<string, string>
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const rendered = previewTemplate(content, sampleData);
  return { success: true, preview: rendered };
}

/**
 * Extract variables from content
 */
export async function extractVariablesAction(content: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const variables = extractVariables(content);
  return { success: true, variables };
}

/**
 * Send test email
 */
export async function sendTestEmailAction(
  templateId: string,
  testEmail: string,
  sampleData: Record<string, string>
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const template = await getTemplateById(templateId);
  if (!template || template.type !== 'email') {
    return { success: false, error: 'Invalid email template' };
  }

  // Replace variables
  const subject = template.subject
    ? previewTemplate(template.subject, sampleData)
    : 'Test Email';
  const text = previewTemplate(template.bodyText, sampleData);
  const html = template.bodyHtml
    ? previewTemplate(template.bodyHtml, sampleData)
    : undefined;

  // Send test email
  const result = await sendEmail({
    to: testEmail,
    subject: `[TEST] ${subject}`,
    html: html || text,
  });

  return result;
}

/**
 * Send test SMS
 */
export async function sendTestSMSAction(
  templateId: string,
  testPhone: string,
  sampleData: Record<string, string>
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const template = await getTemplateById(templateId);
  if (!template || template.type !== 'sms') {
    return { success: false, error: 'Invalid SMS template' };
  }

  // Replace variables
  const message = previewTemplate(template.bodyText, sampleData);

  // Send test SMS
  const result = await sendSMS({
    to: testPhone,
    message: `[TEST] ${message}`,
  });

  return result;
}
