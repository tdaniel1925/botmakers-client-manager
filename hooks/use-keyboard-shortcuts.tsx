import { useEffect, useCallback } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
  category?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs, textareas, or content-editable elements
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Cmd+K / Ctrl+K even in inputs
        if (!(event.key === "k" && (event.metaKey || event.ctrlKey))) {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey;

        // On Windows/Linux, treat Ctrl as the modifier; on Mac, treat Cmd (Meta) as the modifier
        const modifierMatch =
          shortcut.ctrl || shortcut.meta
            ? event.ctrlKey || event.metaKey
            : true;

        if (keyMatch && modifierMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);
}

export function isMac() {
  return typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  const mod = isMac() ? "⌘" : "Ctrl";

  if (shortcut.ctrl || shortcut.meta) parts.push(mod);
  if (shortcut.shift) parts.push(isMac() ? "⇧" : "Shift");
  if (shortcut.alt) parts.push(isMac() ? "⌥" : "Alt");
  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac() ? "" : "+");
}

