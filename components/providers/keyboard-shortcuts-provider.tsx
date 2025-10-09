"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CommandPalette } from "@/components/ui/command-palette";
import { KeyboardShortcutsHelp } from "@/components/ui/keyboard-shortcuts-help";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsContextType {
  openCommandPalette: () => void;
  openHelp: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType>({
  openCommandPalette: () => {},
  openHelp: () => {},
});

export function useKeyboardShortcutsContext() {
  return useContext(KeyboardShortcutsContext);
}

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    // Command Palette
    {
      key: "k",
      meta: true,
      action: () => setCommandPaletteOpen(true),
      description: "Open command palette",
      category: "General",
    },
    {
      key: "k",
      ctrl: true,
      action: () => setCommandPaletteOpen(true),
      description: "Open command palette",
      category: "General",
    },
    // Help
    {
      key: "/",
      meta: true,
      action: () => setHelpOpen(true),
      description: "Show keyboard shortcuts",
      category: "General",
    },
    {
      key: "/",
      ctrl: true,
      action: () => setHelpOpen(true),
      description: "Show keyboard shortcuts",
      category: "General",
    },
    // Navigation
    {
      key: "h",
      meta: true,
      action: () => router.push("/dashboard"),
      description: "Go to Dashboard",
      category: "Navigation",
    },
    {
      key: "h",
      ctrl: true,
      action: () => router.push("/dashboard"),
      description: "Go to Dashboard",
      category: "Navigation",
    },
    {
      key: "c",
      meta: true,
      shift: true,
      action: () => router.push("/dashboard/contacts"),
      description: "Go to Contacts",
      category: "Navigation",
    },
    {
      key: "c",
      ctrl: true,
      shift: true,
      action: () => router.push("/dashboard/contacts"),
      description: "Go to Contacts",
      category: "Navigation",
    },
    {
      key: "d",
      meta: true,
      shift: true,
      action: () => router.push("/dashboard/deals"),
      description: "Go to Deals",
      category: "Navigation",
    },
    {
      key: "d",
      ctrl: true,
      shift: true,
      action: () => router.push("/dashboard/deals"),
      description: "Go to Deals",
      category: "Navigation",
    },
    {
      key: "a",
      meta: true,
      shift: true,
      action: () => router.push("/dashboard/activities"),
      description: "Go to Activities",
      category: "Navigation",
    },
    {
      key: "a",
      ctrl: true,
      shift: true,
      action: () => router.push("/dashboard/activities"),
      description: "Go to Activities",
      category: "Navigation",
    },
    {
      key: "p",
      meta: true,
      shift: true,
      action: () => router.push("/dashboard/projects"),
      description: "Go to Projects",
      category: "Navigation",
    },
    {
      key: "p",
      ctrl: true,
      shift: true,
      action: () => router.push("/dashboard/projects"),
      description: "Go to Projects",
      category: "Navigation",
    },
    {
      key: "v",
      meta: true,
      shift: true,
      action: () => router.push("/dashboard/voice-campaigns"),
      description: "Go to Voice Campaigns",
      category: "Navigation",
    },
    {
      key: "v",
      ctrl: true,
      shift: true,
      action: () => router.push("/dashboard/voice-campaigns"),
      description: "Go to Voice Campaigns",
      category: "Navigation",
    },
  ]);

  const contextValue: KeyboardShortcutsContextType = {
    openCommandPalette: () => setCommandPaletteOpen(true),
    openHelp: () => setHelpOpen(true),
  };

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
      <KeyboardShortcutsHelp
        open={helpOpen}
        onOpenChange={setHelpOpen}
      />
    </KeyboardShortcutsContext.Provider>
  );
}

