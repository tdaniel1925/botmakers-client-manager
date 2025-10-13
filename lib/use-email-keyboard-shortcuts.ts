/**
 * Email Keyboard Shortcuts Hook
 * Gmail-style keyboard navigation
 */

'use client';

import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  onCompose?: () => void;
  onReply?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onStar?: () => void;
  onMarkRead?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSearch?: () => void;
}

export function useEmailKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Compose new email: C
      if (event.key === 'c' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handlers.onCompose?.();
      }

      // Reply: R
      if (event.key === 'r' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handlers.onReply?.();
      }

      // Archive: E
      if (event.key === 'e' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handlers.onArchive?.();
      }

      // Delete: #
      if (event.key === '#') {
        event.preventDefault();
        handlers.onDelete?.();
      }

      // Star: S
      if (event.key === 's' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handlers.onStar?.();
      }

      // Mark as read: Shift + I
      if (event.key === 'I' && event.shiftKey) {
        event.preventDefault();
        handlers.onMarkRead?.();
      }

      // Next email: J
      if (event.key === 'j' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handlers.onNext?.();
      }

      // Previous email: K
      if (event.key === 'k' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handlers.onPrevious?.();
      }

      // Search: /
      if (event.key === '/') {
        event.preventDefault();
        handlers.onSearch?.();
      }

      // Search: Ctrl/Cmd + K
      if (event.key === 'k' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        handlers.onSearch?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

// Keyboard shortcuts reference
export const KEYBOARD_SHORTCUTS = [
  { key: 'c', description: 'Compose new email' },
  { key: 'r', description: 'Reply to email' },
  { key: 'e', description: 'Archive email' },
  { key: '#', description: 'Delete email' },
  { key: 's', description: 'Star/unstar email' },
  { key: 'Shift + I', description: 'Mark as read' },
  { key: 'j', description: 'Next email' },
  { key: 'k', description: 'Previous email' },
  { key: '/', description: 'Search' },
  { key: 'Ctrl/Cmd + K', description: 'Quick search' },
];






