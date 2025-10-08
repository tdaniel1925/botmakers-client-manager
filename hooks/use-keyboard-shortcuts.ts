/**
 * Keyboard Shortcuts Hook
 * Power user keyboard shortcuts
 */

import { useEffect } from "react";

export interface KeyboardShortcutsConfig {
  onNew?: () => void;
  onSearch?: () => void;
  onHelp?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const { onNew, onSearch, onHelp, onEscape, enabled = true } = config;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow escape to work in inputs
        if (event.key === "Escape" && onEscape) {
          onEscape();
          return;
        }
        return;
      }

      // Cmd/Ctrl + K → Search
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        onSearch?.();
        return;
      }

      // N → New campaign
      if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        onNew?.();
        return;
      }

      // / → Focus search
      if (event.key === "/") {
        event.preventDefault();
        onSearch?.();
        return;
      }

      // ? → Show help
      if (event.key === "?") {
        event.preventDefault();
        onHelp?.();
        return;
      }

      // Escape → Clear/Cancel
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape?.();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onNew, onSearch, onHelp, onEscape, enabled]);
}

export const KEYBOARD_SHORTCUTS = [
  {
    key: "N",
    description: "Create new campaign",
    category: "Actions",
  },
  {
    key: "/",
    description: "Focus search",
    category: "Navigation",
  },
  {
    key: "Cmd/Ctrl + K",
    description: "Quick search",
    category: "Navigation",
  },
  {
    key: "?",
    description: "Show keyboard shortcuts",
    category: "Help",
  },
  {
    key: "Esc",
    description: "Close dialog / Clear selection",
    category: "Navigation",
  },
] as const;
