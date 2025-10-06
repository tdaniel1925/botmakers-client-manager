/**
 * Template Service
 * Handles template loading, variable substitution, and rendering
 * Server-side only - uses database queries
 */

import { getTemplateByCategory } from '@/db/queries/template-queries';
import { getPlatformBranding } from '@/db/queries/branding-queries';
import { replaceVariables } from './template-utils';

// Re-export client-safe utilities
export {
  replaceVariables,
  extractVariables,
  validateTemplate,
  previewTemplate,
  getSMSInfo,
  sanitizeEmailHTML,
} from './template-utils';

/**
 * Get branding variables for templates
 */
export async function getBrandingVariables(): Promise<Record<string, string>> {
  try {
    const branding = await getPlatformBranding();
    
    if (!branding) {
      console.log('[template-service] No branding found in database, using defaults');
      // Return default branding if none configured
      return {
        logoUrl: '',
        companyName: 'Botmakers',
        companyAddress: '123 Main Street, Suite 100\nCity, State 12345',
        supportEmail: 'support@botmakers.com',
        twitterUrl: 'https://twitter.com/botmakers',
        linkedinUrl: 'https://linkedin.com/company/botmakers',
        facebookUrl: '',
        instagramUrl: '',
        websiteUrl: 'https://botmakers.com',
        unsubscribeLink: '#', // Placeholder
      };
    }
    
    console.log('[template-service] Branding loaded from database:', {
      logoUrl: branding.logoUrl,
      companyName: branding.companyName,
    });
    
    return {
      logoUrl: branding.logoUrl || '',
      companyName: branding.companyName || 'Botmakers',
      companyAddress: branding.companyAddress || '123 Main Street, Suite 100\nCity, State 12345',
      supportEmail: branding.supportEmail || branding.companyEmail || 'support@botmakers.com',
      twitterUrl: branding.twitterUrl || '',
      linkedinUrl: branding.linkedinUrl || '',
      facebookUrl: branding.facebookUrl || '',
      instagramUrl: branding.instagramUrl || '',
      websiteUrl: branding.websiteUrl || 'https://botmakers.com',
      unsubscribeLink: '#', // TODO: Implement unsubscribe functionality
    };
  } catch (error) {
    console.error('Error fetching branding:', error);
    // Return defaults on error
    return {
      logoUrl: '',
      companyName: 'Botmakers',
      companyAddress: '123 Main Street, Suite 100\nCity, State 12345',
      supportEmail: 'support@botmakers.com',
      twitterUrl: '',
      linkedinUrl: '',
      websiteUrl: 'https://botmakers.com',
      unsubscribeLink: '#',
    };
  }
}

/**
 * Get and render template (server-side only)
 * Automatically includes branding variables
 */
export async function renderTemplate(
  category: string,
  type: 'email' | 'sms',
  variables: Record<string, string | number>
): Promise<{ subject?: string; text: string; html?: string } | null> {
  try {
    const template = await getTemplateByCategory(category, type);
    
    if (!template) {
      console.error(`Template not found: ${category} (${type})`);
      return null;
    }
    
    // Merge branding variables with provided variables
    const brandingVars = await getBrandingVariables();
    const allVariables = { ...brandingVars, ...variables };
    
    const result: any = {
      text: replaceVariables(template.bodyText, allVariables),
    };
    
    if (template.subject) {
      result.subject = replaceVariables(template.subject, allVariables);
    }
    
    if (template.bodyHtml) {
      result.html = replaceVariables(template.bodyHtml, allVariables);
    }
    
    return result;
  } catch (error) {
    console.error('Error rendering template:', error);
    return null;
  }
}
