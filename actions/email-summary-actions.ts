/**
 * Email Summary Server Actions
 * Server-side actions for AI email summaries (safe for client components to call)
 */

'use server';

import { quickSummary } from '@/lib/ai-email-summarizer';
import type { SelectEmail } from '@/db/schema/email-schema';

interface SummaryResult {
  success: boolean;
  summary?: string;
  error?: string;
}

/**
 * Get AI summary for an email (safe for client components)
 */
export async function getEmailSummaryAction(email: SelectEmail): Promise<SummaryResult> {
  try {
    const summary = await quickSummary(email);
    return {
      success: true,
      summary,
    };
  } catch (error) {
    console.error('Error generating email summary:', error);
    return {
      success: false,
      error: 'Failed to generate summary',
      summary: (email.snippet as any) || (email.subject as any) || 'No summary available',
    };
  }
}






