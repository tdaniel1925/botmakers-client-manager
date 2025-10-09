"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";
import { isMac } from "@/hooks/use-keyboard-shortcuts";

interface ShortcutGroup {
  category: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const mod = isMac() ? "⌘" : "Ctrl";

  const shortcutGroups: ShortcutGroup[] = [
    {
      category: "General",
      shortcuts: [
        { keys: [mod, "K"], description: "Open command palette" },
        { keys: [mod, "/"], description: "Show keyboard shortcuts" },
        { keys: ["Esc"], description: "Close dialog or cancel" },
      ],
    },
    {
      category: "Navigation",
      shortcuts: [
        { keys: [mod, "H"], description: "Go to Dashboard" },
        { keys: [mod, "Shift", "C"], description: "Go to Contacts" },
        { keys: [mod, "Shift", "D"], description: "Go to Deals" },
        { keys: [mod, "Shift", "A"], description: "Go to Activities" },
        { keys: [mod, "Shift", "P"], description: "Go to Projects" },
        { keys: [mod, "Shift", "V"], description: "Go to Voice Campaigns" },
      ],
    },
    {
      category: "Actions",
      shortcuts: [
        { keys: [mod, "N"], description: "Create new contact" },
        { keys: [mod, "Shift", "N"], description: "Create new deal" },
        { keys: [mod, "E"], description: "Export current view" },
        { keys: [mod, "F"], description: "Focus search" },
      ],
    },
    {
      category: "Lists",
      shortcuts: [
        { keys: ["↑", "↓"], description: "Navigate items" },
        { keys: ["Enter"], description: "Open selected item" },
        { keys: [mod, "A"], description: "Select all" },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcutGroups.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {group.category}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-700">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <kbd
                          key={keyIdx}
                          className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t text-xs text-gray-500">
          <p>
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">{mod}</kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded ml-1">/</kbd> anytime to see this help
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

