/**
 * Keyboard Shortcuts Hook - Hey-style keyboard navigation
 */

'use client';

import { useEffect, useCallback } from 'react';

export interface ShortcutConfig {
  key: string;
  action: () => void;
  description: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean; // Cmd on Mac
  enabled?: boolean;
}

export const DEFAULT_SHORTCUTS: Record<string, ShortcutConfig> = {
  // Composition
  compose: {
    key: 'c',
    action: () => {},
    description: 'Compose new email',
  },
  reply: {
    key: 'r',
    action: () => {},
    description: 'Reply to email',
  },
  replyAll: {
    key: 'a',
    action: () => {},
    description: 'Reply all',
  },
  forward: {
    key: 'f',
    action: () => {},
    description: 'Forward email',
  },
  
  // Views
  imbox: {
    key: '1',
    action: () => {},
    description: 'Go to Imbox',
  },
  feed: {
    key: '2',
    action: () => {},
    description: 'Go to The Feed',
  },
  paperTrail: {
    key: '3',
    action: () => {},
    description: 'Go to Paper Trail',
  },
  screener: {
    key: '4',
    action: () => {},
    description: 'Go to Screener',
  },
  
  // Actions
  archive: {
    key: 'e',
    action: () => {},
    description: 'Archive email',
  },
  delete: {
    key: '#',
    action: () => {},
    description: 'Delete email',
  },
  replyLater: {
    key: 'l',
    action: () => {},
    description: 'Reply Later',
  },
  setAside: {
    key: 's',
    action: () => {},
    description: 'Set Aside',
  },
  star: {
    key: '*',
    action: () => {},
    description: 'Toggle star',
  },
  
  // Navigation
  nextEmail: {
    key: 'j',
    action: () => {},
    description: 'Next email',
  },
  previousEmail: {
    key: 'k',
    action: () => {},
    description: 'Previous email',
  },
  
  // Marking
  markRead: {
    key: 'i',
    action: () => {},
    description: 'Mark as read',
  },
  markUnread: {
    key: 'u',
    action: () => {},
    description: 'Mark as unread',
  },
  
  // Command Palette
  commandPalette: {
    key: 'k',
    metaKey: true, // Cmd+K or Ctrl+K
    action: () => {},
    description: 'Open command palette',
  },
  
  // Search
  search: {
    key: '/',
    action: () => {},
    description: 'Search emails',
  },
};

export function useKeyboardShortcuts(shortcuts: Record<string, ShortcutConfig>) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Exception: Allow command palette in input fields
        if (!(event.metaKey || event.ctrlKey) || event.key !== 'k') {
          return;
        }
      }

      for (const shortcut of Object.values(shortcuts)) {
        if (shortcut.enabled === false) continue;

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const altMatches = shortcut.altKey ? event.altKey : !event.altKey;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const metaMatches = shortcut.metaKey
          ? event.metaKey || event.ctrlKey
          : !(event.metaKey || event.ctrlKey);

        if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
}

/**
 * Simplified hook for single shortcuts
 */
export function useShortcut(
  key: string,
  action: () => void,
  options?: {
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
    enabled?: boolean;
  }
) {
  const shortcuts = {
    shortcut: {
      key,
      action,
      description: '',
      ...options,
    },
  };

  useKeyboardShortcuts(shortcuts);
}
