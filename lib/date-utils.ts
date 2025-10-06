/**
 * Date Utilities with Timezone Support
 * ✅ FIX BUG-024: Timezone-aware date formatting and handling
 * Uses built-in Intl API and date-fns (no external timezone library needed)
 */

import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Get user's timezone (browser timezone)
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Format date with timezone awareness
 * Shows date in user's local timezone with timezone indicator
 */
export function formatDateWithTimezone(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }
): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const userTz = getUserTimezone();
  
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      ...options,
      timeZone: userTz,
      timeZoneName: 'short',
    });
    return formatter.format(dateObj);
  } catch (error) {
    // Fallback
    return dateObj.toLocaleString();
  }
}

/**
 * Format date for display (short format)
 */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  } catch (error) {
    return dateObj.toLocaleDateString();
  }
}

/**
 * Format date and time for display (with timezone)
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(dateObj);
  } catch (error) {
    return dateObj.toLocaleString();
  }
}

/**
 * Format date relative to now ("2 hours ago", "in 3 days")
 */
export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Check if date is today in user's timezone
 */
export function isToday(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  
  // Compare date strings in local timezone
  return dateObj.toDateString() === today.toDateString();
}

/**
 * Check if date is overdue (past) in user's timezone
 */
export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  
  return dateObj < now;
}

/**
 * Get timezone abbreviation (e.g., "PST", "EST", "UTC")
 */
export function getTimezoneAbbreviation(timezone?: string): string {
  const tz = timezone || getUserTimezone();
  
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    });
    
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    return tzPart?.value || tz;
  } catch (error) {
    return tz;
  }
}

/**
 * Convert datetime-local input to UTC Date object
 * For use with HTML datetime-local inputs
 */
export function datetimeLocalToDate(datetimeLocal: string): Date {
  // datetime-local format: "2023-10-06T14:30"
  // This represents local time, we need to convert to UTC
  return new Date(datetimeLocal);
}

/**
 * Convert Date object to datetime-local string
 * For use with HTML datetime-local inputs
 */
export function dateToDatetimeLocal(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  // Convert to local time and format for datetime-local input
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Format due date with status indicators
 * Returns formatted string with color class
 */
export function formatDueDateWithStatus(
  date: Date | string | null | undefined
): { text: string; isOverdue: boolean; isToday: boolean } {
  if (!date) {
    return { text: 'No due date', isOverdue: false, isToday: false };
  }
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const overdueCheck = isOverdue(dateObj);
  const todayCheck = isToday(dateObj);
  
  let text = formatDateTime(dateObj);
  
  if (overdueCheck) {
    text = `Overdue: ${text}`;
  } else if (todayCheck) {
    text = `Today: ${text}`;
  }
  
  return {
    text,
    isOverdue: overdueCheck,
    isToday: todayCheck,
  };
}
