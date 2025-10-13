/**
 * Email Search Utility
 * Full-text search including body content with filters
 */

import type { SelectEmail } from '@/db/schema/email-schema';

export interface SearchFilters {
  hasAttachments?: boolean;
  isStarred?: boolean;
  isUnread?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  from?: string;
  to?: string;
  folder?: string;
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  includeBody?: boolean;
  caseSensitive?: boolean;
}

/**
 * Search emails with full-text support
 */
export function searchEmails(
  emails: SelectEmail[],
  options: SearchOptions
): SelectEmail[] {
  const { query, filters, includeBody = true, caseSensitive = false } = options;

  if (!query && !filters) return emails;

  let results = [...emails];

  // Apply text search
  if (query) {
    const searchTerm = caseSensitive ? query : query.toLowerCase();
    
    results = results.filter(email => {
      const subject = caseSensitive 
        ? (email.subject || '') 
        : (email.subject || '').toLowerCase();
      
      const from = caseSensitive
        ? getEmailAddress(email.fromAddress)
        : getEmailAddress(email.fromAddress).toLowerCase();
      
      const to = caseSensitive
        ? getEmailAddress(email.toAddress)
        : getEmailAddress(email.toAddress).toLowerCase();
      
      const body = includeBody
        ? caseSensitive
          ? (email.bodyText || email.snippet || '')
          : (email.bodyText || email.snippet || '').toLowerCase()
        : '';

      return (
        subject.includes(searchTerm) ||
        from.includes(searchTerm) ||
        to.includes(searchTerm) ||
        (includeBody && body.includes(searchTerm))
      );
    });
  }

  // Apply filters
  if (filters) {
    if (filters.hasAttachments !== undefined) {
      results = results.filter(email => email.hasAttachments === filters.hasAttachments);
    }

    if (filters.isStarred !== undefined) {
      results = results.filter(email => email.isStarred === filters.isStarred);
    }

    if (filters.isUnread !== undefined) {
      results = results.filter(email => !email.isRead === filters.isUnread);
    }

    if (filters.dateFrom) {
      results = results.filter(email => 
        email.receivedAt && new Date(email.receivedAt) >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      results = results.filter(email => 
        email.receivedAt && new Date(email.receivedAt) <= filters.dateTo!
      );
    }

    if (filters.from) {
      const fromFilter = caseSensitive ? filters.from : filters.from.toLowerCase();
      results = results.filter(email => {
        const from = caseSensitive
          ? getEmailAddress(email.fromAddress)
          : getEmailAddress(email.fromAddress).toLowerCase();
        return from.includes(fromFilter);
      });
    }

    if (filters.to) {
      const toFilter = caseSensitive ? filters.to : filters.to.toLowerCase();
      results = results.filter(email => {
        const to = caseSensitive
          ? getEmailAddress(email.toAddress)
          : getEmailAddress(email.toAddress).toLowerCase();
        return to.includes(toFilter);
      });
    }

    if (filters.folder) {
      results = results.filter(email => 
        email.folderName === filters.folder
      );
    }
  }

  return results;
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerm(
  text: string,
  searchTerm: string,
  caseSensitive = false
): string {
  if (!searchTerm || !text) return text;

  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, flags);
  
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
}

/**
 * Extract email address from various formats
 */
function getEmailAddress(address: any): string {
  if (!address) return '';
  
  if (typeof address === 'string') {
    return address;
  }
  
  if (typeof address === 'object' && address.email) {
    return address.email;
  }
  
  if (Array.isArray(address) && address.length > 0) {
    return address[0].email || '';
  }
  
  return '';
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get search suggestions based on query
 */
export function getSearchSuggestions(
  query: string,
  emails: SelectEmail[]
): string[] {
  if (!query || query.length < 2) return [];

  const suggestions = new Set<string>();
  const lowerQuery = query.toLowerCase();

  // Add matching email addresses
  emails.forEach(email => {
    const from = getEmailAddress(email.fromAddress).toLowerCase();
    if (from.includes(lowerQuery)) {
      suggestions.add(getEmailAddress(email.fromAddress));
    }
  });

  // Add matching subjects (first 3 words)
  emails.forEach(email => {
    if ((email.subject as any)?.toLowerCase().includes(lowerQuery)) {
      const words = (email.subject as any).split(' ').slice(0, 3).join(' ');
      if (words.length > query.length) {
        suggestions.add(words);
      }
    }
  });

  return Array.from(suggestions).slice(0, 5);
}

/**
 * Parse search query for advanced operators
 * Supports: from:email, to:email, subject:text, has:attachments
 */
export function parseSearchQuery(query: string): {
  text: string;
  filters: SearchFilters;
} {
  const filters: SearchFilters = {};
  let text = query;

  // Extract from:
  const fromMatch = query.match(/from:(\S+)/i);
  if (fromMatch) {
    filters.from = fromMatch[1];
    text = text.replace(fromMatch[0], '').trim();
  }

  // Extract to:
  const toMatch = query.match(/to:(\S+)/i);
  if (toMatch) {
    filters.to = toMatch[1];
    text = text.replace(toMatch[0], '').trim();
  }

  // Extract has:attachments
  if (/has:attachments?/i.test(query)) {
    filters.hasAttachments = true;
    text = text.replace(/has:attachments?/i, '').trim();
  }

  // Extract is:starred
  if (/is:starred?/i.test(query)) {
    filters.isStarred = true;
    text = text.replace(/is:starred?/i, '').trim();
  }

  // Extract is:unread
  if (/is:unread?/i.test(query)) {
    filters.isUnread = true;
    text = text.replace(/is:unread?/i, '').trim();
  }

  return { text, filters };
}



