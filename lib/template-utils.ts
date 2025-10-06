/**
 * Client-safe Template Utilities
 * Pure functions for template manipulation without database dependencies
 */

/**
 * Escape HTML special characters to prevent XSS
 * ✅ FIX BUG-012: HTML escaping for template variables
 */
export function escapeHtml(str: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
}

/**
 * Replace variables in template content
 * Replaces {{variableName}} with actual values
 * Use shouldEscapeHtml=true for HTML templates to prevent XSS
 */
export function replaceVariables(
  content: string,
  variables: Record<string, string | number>,
  shouldEscapeHtml = false
): string {
  let result = content;
  
  // Replace each variable
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    const stringValue = String(value);
    // Escape HTML if this is HTML content
    const finalValue = shouldEscapeHtml ? escapeHtml(stringValue) : stringValue;
    result = result.replace(regex, finalValue);
  });
  
  return result;
}

/**
 * Extract variable names from template content
 * Finds all {{variableName}} patterns
 */
export function extractVariables(content: string): string[] {
  const regex = /{{(\w+)}}/g;
  const matches = content.matchAll(regex);
  const variables = new Set<string>();
  
  for (const match of matches) {
    variables.add(match[1]);
  }
  
  return Array.from(variables);
}

/**
 * Validate template content
 */
export function validateTemplate(
  content: string,
  type: 'email' | 'sms'
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!content || content.trim().length === 0) {
    errors.push('Template content cannot be empty');
  }
  
  // Check for unclosed variable tags
  const openBraces = (content.match(/{{/g) || []).length;
  const closeBraces = (content.match(/}}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    errors.push('Unclosed variable tags detected');
  }
  
  // SMS-specific validation
  if (type === 'sms') {
    if (content.length > 1600) {
      errors.push('SMS template should be under 1600 characters');
    }
  }
  
  // Email HTML validation (basic)
  if (type === 'email' && content.includes('<script')) {
    errors.push('Script tags are not allowed in email templates');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Preview template with sample data
 */
export function previewTemplate(
  content: string,
  sampleVariables: Record<string, string | number>
): string {
  return replaceVariables(content, sampleVariables);
}

/**
 * Get character count for SMS (including multi-part)
 */
export function getSMSInfo(content: string): {
  characterCount: number;
  messageCount: number;
  charactersPerMessage: number;
} {
  const characterCount = content.length;
  
  // Standard SMS: 160 chars per message
  // With unicode/emojis: 70 chars per message
  const hasUnicode = /[^\x00-\x7F]/.test(content);
  const charactersPerMessage = hasUnicode ? 70 : 160;
  
  const messageCount = Math.ceil(characterCount / charactersPerMessage) || 1;
  
  return {
    characterCount,
    messageCount,
    charactersPerMessage,
  };
}

/**
 * Validate email HTML safety
 */
export function sanitizeEmailHTML(html: string): string {
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  return sanitized;
}
