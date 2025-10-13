/**
 * Draft Persistence Utility
 * Auto-saves email drafts to localStorage for crash recovery
 */

export interface DraftData {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  accountId: string;
  replyTo?: {
    messageId: string;
    threadId: string;
    subject: string;
    from: string;
  };
  timestamp: number;
}

const DRAFTS_KEY = 'email_drafts';
const MAX_DRAFTS = 10;

/**
 * Save a draft to localStorage
 */
export function saveDraft(draftId: string, draft: DraftData): void {
  try {
    const drafts = getAllDrafts();
    drafts[draftId] = {
      ...draft,
      timestamp: Date.now(),
    };

    // Limit stored drafts
    const draftEntries = Object.entries(drafts);
    if (draftEntries.length > MAX_DRAFTS) {
      // Remove oldest drafts
      const sorted = draftEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toKeep = sorted.slice(-MAX_DRAFTS);
      const trimmedDrafts = Object.fromEntries(toKeep);
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(trimmedDrafts));
    } else {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    }
  } catch (error) {
    console.error('Error saving draft to localStorage:', error);
  }
}

/**
 * Get a specific draft
 */
export function getDraft(draftId: string): DraftData | null {
  try {
    const drafts = getAllDrafts();
    return drafts[draftId] || null;
  } catch (error) {
    console.error('Error getting draft from localStorage:', error);
    return null;
  }
}

/**
 * Get all drafts
 */
export function getAllDrafts(): Record<string, DraftData> {
  try {
    const stored = localStorage.getItem(DRAFTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting all drafts from localStorage:', error);
    return {};
  }
}

/**
 * Delete a specific draft
 */
export function deleteDraft(draftId: string): void {
  try {
    const drafts = getAllDrafts();
    delete drafts[draftId];
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error('Error deleting draft from localStorage:', error);
  }
}

/**
 * Clear all drafts
 */
export function clearAllDrafts(): void {
  try {
    localStorage.removeItem(DRAFTS_KEY);
  } catch (error) {
    console.error('Error clearing drafts from localStorage:', error);
  }
}

/**
 * Get drafts for a specific account
 */
export function getDraftsByAccount(accountId: string): Record<string, DraftData> {
  try {
    const drafts = getAllDrafts();
    return Object.fromEntries(
      Object.entries(drafts).filter(([, draft]) => draft.accountId === accountId)
    );
  } catch (error) {
    console.error('Error getting drafts by account:', error);
    return {};
  }
}

/**
 * Check if a draft has any content
 */
export function isDraftEmpty(draft: Partial<DraftData>): boolean {
  return !draft.to && !draft.subject && !draft.body;
}

/**
 * Format time since last save
 */
export function getTimeSinceLastSave(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 5) {
    return 'just now';
  } else if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
}


