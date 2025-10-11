/**
 * Instant Search - Client-side email search with Fuse.js
 * Hey-style instant results as you type
 */

'use client';

import Fuse from 'fuse.js';
import type { SelectEmail } from '@/db/schema/email-schema';

export interface SearchResult {
  email: SelectEmail;
  score: number;
  matches: Array<{
    key: string;
    value: string;
    indices: [number, number][];
  }>;
}

/**
 * Create email search index
 */
export function createEmailSearchIndex(emails: SelectEmail[]) {
  return new Fuse(emails, {
    keys: [
      { name: 'subject', weight: 0.4 },
      { name: 'bodyText', weight: 0.3 },
      { name: 'snippet', weight: 0.2 },
      { name: 'fromAddress', weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    ignoreLocation: true,
  });
}

/**
 * Search emails instantly
 */
export function searchEmails(
  searchIndex: Fuse<SelectEmail>,
  query: string,
  limit: number = 50
): SearchResult[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const results = searchIndex.search(query, { limit });

  return results.map((result) => ({
    email: result.item,
    score: result.score || 0,
    matches: result.matches || [],
  }));
}

/**
 * Extract email address from fromAddress field
 */
export function getEmailAddress(fromAddress: any): string {
  if (!fromAddress) return '';
  if (typeof fromAddress === 'string') return fromAddress;
  if (typeof fromAddress === 'object' && fromAddress.email) return fromAddress.email;
  return '';
}

/**
 * Extract name from fromAddress field
 */
export function getEmailName(fromAddress: any): string {
  if (!fromAddress) return '';
  if (typeof fromAddress === 'string') return fromAddress.split('@')[0];
  if (typeof fromAddress === 'object' && fromAddress.name) return fromAddress.name;
  if (typeof fromAddress === 'object' && fromAddress.email) return fromAddress.email.split('@')[0];
  return '';
}

/**
 * Highlight matched text in search results
 * Returns array of text segments with match information
 */
export interface TextSegment {
  text: string;
  isMatch: boolean;
}

export function highlightMatches(text: string, indices: [number, number][]): TextSegment[] {
  if (!indices || indices.length === 0) return [{ text, isMatch: false }];

  const parts: TextSegment[] = [];
  let lastIndex = 0;

  indices.forEach(([start, end]) => {
    // Add text before match
    if (start > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, start),
        isMatch: false,
      });
    }

    // Add matched text
    parts.push({
      text: text.substring(start, end + 1),
      isMatch: true,
    });

    lastIndex = end + 1;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      isMatch: false,
    });
  }

  return parts;
}

/**
 * Get search suggestions based on partial query
 */
export function getSearchSuggestions(
  emails: SelectEmail[],
  query: string
): string[] {
  if (query.length < 2) return [];

  const suggestions = new Set<string>();

  // Extract unique senders
  emails.forEach((email) => {
    const name = getEmailName(email.fromAddress);
    const address = getEmailAddress(email.fromAddress);
    
    if (name.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(name);
    }
    if (address.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(address);
    }
  });

  // Extract common subjects
  emails.forEach((email) => {
    if (email.subject?.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(email.subject);
    }
  });

  return Array.from(suggestions).slice(0, 5);
}

/**
 * Filter emails by date range
 */
export function filterByDateRange(
  emails: SelectEmail[],
  range: 'today' | 'week' | 'month' | 'year' | 'all'
): SelectEmail[] {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'today':
      return emails.filter((email) => new Date(email.receivedAt) >= startOfDay);
    
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return emails.filter((email) => new Date(email.receivedAt) >= weekAgo);
    
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return emails.filter((email) => new Date(email.receivedAt) >= monthAgo);
    
    case 'year':
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      return emails.filter((email) => new Date(email.receivedAt) >= yearAgo);
    
    case 'all':
    default:
      return emails;
  }
}

/**
 * Advanced search with filters
 */
export interface SearchFilters {
  query?: string;
  from?: string;
  to?: string;
  subject?: string;
  hasAttachment?: boolean;
  isUnread?: boolean;
  isStarred?: boolean;
  dateRange?: 'today' | 'week' | 'month' | 'year' | 'all';
  heyView?: 'imbox' | 'feed' | 'paper_trail';
}

export function advancedSearch(
  emails: SelectEmail[],
  filters: SearchFilters
): SelectEmail[] {
  let results = [...emails];

  // Filter by date range first (most common filter)
  if (filters.dateRange) {
    results = filterByDateRange(results, filters.dateRange);
  }

  // Filter by sender
  if (filters.from) {
    results = results.filter((email) => {
      const address = getEmailAddress(email.fromAddress);
      return address.toLowerCase().includes(filters.from!.toLowerCase());
    });
  }

  // Filter by subject
  if (filters.subject) {
    results = results.filter((email) =>
      email.subject?.toLowerCase().includes(filters.subject!.toLowerCase())
    );
  }

  // Filter by attachment
  if (filters.hasAttachment) {
    results = results.filter((email) => email.hasAttachments);
  }

  // Filter by read status
  if (filters.isUnread !== undefined) {
    results = results.filter((email) => !email.isRead === filters.isUnread);
  }

  // Filter by starred
  if (filters.isStarred !== undefined) {
    results = results.filter((email) => email.isStarred === filters.isStarred);
  }

  // Filter by Hey view
  if (filters.heyView) {
    results = results.filter((email) => email.heyView === filters.heyView);
  }

  // Finally, full-text search if query provided
  if (filters.query && filters.query.trim().length >= 2) {
    const searchIndex = createEmailSearchIndex(results);
    const searchResults = searchEmails(searchIndex, filters.query);
    results = searchResults.map((r) => r.email);
  }

  return results;
}

