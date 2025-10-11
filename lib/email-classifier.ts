/**
 * Email Classifier - AI-powered categorization for Hey-style views
 */

import type { SelectEmail } from '@/db/schema/email-schema';

export type HeyView = 'imbox' | 'feed' | 'paper_trail' | 'screener';
export type HeyCategory = 'newsletter' | 'receipt' | 'confirmation' | 'important' | 'promotional';

export interface ClassificationResult {
  view: HeyView;
  category: HeyCategory;
  confidence: number;
  reasoning: string;
}

/**
 * Classify email using fast rule-based logic
 */
export function classifyEmail(email: Partial<SelectEmail>): ClassificationResult {
  const subject = (email.subject || '').toLowerCase();
  const body = (email.bodyText || email.bodyHtml || '').toLowerCase();
  const from = getEmailAddress(email.fromAddress);
  
  // Paper Trail: Receipts, invoices, confirmations
  if (isPaperTrail(subject, body)) {
    return {
      view: 'paper_trail',
      category: subject.includes('receipt') || subject.includes('invoice') ? 'receipt' : 'confirmation',
      confidence: 0.9,
      reasoning: 'Detected receipt/confirmation keywords'
    };
  }
  
  // Feed: Newsletters, marketing, bulk emails (with enhanced detection)
  if (isNewsletter(subject, body, from, email)) {
    return {
      view: 'feed',
      category: 'newsletter',
      confidence: 0.85,
      reasoning: 'Detected bulk/marketing email patterns'
    };
  }
  
  // Imbox: Only personal and important emails
  return {
    view: 'imbox',
    category: 'important',
    confidence: 0.7,
    reasoning: 'Personal or important email'
  };
}

function isPaperTrail(subject: string, body: string): boolean {
  const keywords = [
    'receipt', 'invoice', 'payment', 'confirmation', 'booking', 
    'reservation', 'order', 'ticket', 'shipped', 'delivery',
    'transaction', 'statement', 'bill'
  ];
  
  return keywords.some(kw => 
    subject.includes(kw) || body.slice(0, 500).includes(kw)
  );
}

function isNewsletter(subject: string, body: string, from: string, email?: Partial<SelectEmail>): boolean {
  // 1. Unsubscribe link is most reliable indicator
  if (body.includes('unsubscribe') || body.includes('opt out') || body.includes('opt-out')) return true;
  
  // 2. List-Unsubscribe header (email standard for bulk mail)
  if (email?.rawHeaders) {
    const headers = email.rawHeaders as Record<string, any>;
    if (headers['list-unsubscribe'] || headers['List-Unsubscribe']) return true;
    if (headers['precedence']?.toLowerCase() === 'bulk') return true;
    if (headers['Precedence']?.toLowerCase() === 'bulk') return true;
    if (headers['x-campaign-id'] || headers['X-Campaign-Id']) return true;
  }
  
  // 3. Newsletter keywords (expanded list)
  const keywords = [
    'newsletter', 'digest', 'weekly', 'daily', 'update', 'news',
    'promo', 'offer', 'deal', 'sale', 'discount', 'limited time',
    'subscribe', 'manage preferences', 'email preferences', 'view in browser'
  ];
  if (keywords.some(kw => subject.includes(kw) || body.slice(0, 500).includes(kw))) return true;
  
  // 4. Common bulk sender patterns (expanded)
  const bulkFromPatterns = [
    'noreply', 'no-reply', 'newsletter', 'marketing', 'hello',
    'updates', 'news', 'notifications', 'info@', 'support@',
    'team@', 'hi@', 'hey@', 'mail@'
  ];
  if (bulkFromPatterns.some(p => from.includes(p))) return true;
  
  // 5. Marketing platforms
  const marketingPlatforms = [
    'sendgrid', 'mailchimp', 'constantcontact', 'campaignmonitor',
    'hubspot', 'marketo', 'mailjet', 'sendinblue', 'mailgun'
  ];
  if (marketingPlatforms.some(p => from.includes(p))) return true;
  
  // 6. Common newsletter/promo domains
  const domains = ['newsletter', 'news', 'marketing', 'hello', 'updates'];
  if (domains.some(d => from.includes(d + '@'))) return true;
  
  return false;
}

export function getEmailAddress(fromAddress: any): string {
  if (!fromAddress) return '';
  if (typeof fromAddress === 'string') return fromAddress;
  if (typeof fromAddress === 'object' && fromAddress.email) return fromAddress.email;
  return '';
}

export function getEmailName(fromAddress: any): string {
  if (!fromAddress) return '';
  if (typeof fromAddress === 'string') return fromAddress.split('@')[0];
  if (typeof fromAddress === 'object' && fromAddress.name) return fromAddress.name;
  if (typeof fromAddress === 'object' && fromAddress.email) return fromAddress.email.split('@')[0];
  return '';
}

