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
  
  // Feed: Newsletters, marketing, updates
  if (isNewsletter(subject, body, from)) {
    return {
      view: 'feed',
      category: 'newsletter',
      confidence: 0.85,
      reasoning: 'Detected newsletter patterns'
    };
  }
  
  // Default to Imbox (important mail)
  return {
    view: 'imbox',
    category: 'important',
    confidence: 0.7,
    reasoning: 'Default classification - likely important'
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

function isNewsletter(subject: string, body: string, from: string): boolean {
  // Unsubscribe link is most reliable indicator
  if (body.includes('unsubscribe')) return true;
  
  // Newsletter keywords
  const keywords = ['newsletter', 'digest', 'weekly', 'daily', 'update', 'news'];
  if (keywords.some(kw => subject.includes(kw) || from.includes(kw))) return true;
  
  // Common newsletter domains
  const domains = ['newsletter', 'news', 'marketing', 'hello', 'updates'];
  if (domains.some(d => from.includes(d + '@') || from.includes('no-reply') || from.includes('noreply'))) {
    return true;
  }
  
  return false;
}

function getEmailAddress(fromAddress: any): string {
  if (!fromAddress) return '';
  if (typeof fromAddress === 'string') return fromAddress;
  if (typeof fromAddress === 'object' && fromAddress.email) return fromAddress.email;
  return '';
}

