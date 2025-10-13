"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";
import { DEFAULT_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const shortcuts = Object.entries(DEFAULT_SHORTCUTS);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Keyboard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
              <DialogDescription>
                Speed up your workflow with these keyboard shortcuts
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              Available Shortcuts
            </h3>
            <div className="space-y-2">
              {shortcuts.map(([name, shortcut], index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-700">
                        {shortcut.description}
                      </span>
                      <Badge
                        variant="outline"
                        className="font-mono text-xs px-2 py-1"
                      >
                        {shortcut.key}
                      </Badge>
                    </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t text-sm text-gray-500">
          <p>
            <strong>Tip:</strong> Press <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs">?</kbd> anytime to see this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
