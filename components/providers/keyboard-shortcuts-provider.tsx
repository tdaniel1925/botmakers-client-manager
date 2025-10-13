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
  useKeyboardShortcuts({
    // Command Palette
    commandPaletteMeta: {
      key: "k",
      metaKey: true,
      action: () => setCommandPaletteOpen(true),
      description: "Open command palette",
    },
    commandPaletteCtrl: {
      key: "k",
      ctrlKey: true,
      action: () => setCommandPaletteOpen(true),
      description: "Open command palette",
    },
    // Help
    helpMeta: {
      key: "/",
      metaKey: true,
      action: () => setHelpOpen(true),
      description: "Show keyboard shortcuts",
    },
    helpCtrl: {
      key: "/",
      ctrlKey: true,
      action: () => setHelpOpen(true),
      description: "Show keyboard shortcuts",
    },
    // Navigation
    dashboardMeta: {
      key: "h",
      metaKey: true,
      action: () => router.push("/dashboard"),
      description: "Go to Dashboard",
    },
    dashboardCtrl: {
      key: "h",
      ctrlKey: true,
      action: () => router.push("/dashboard"),
      description: "Go to Dashboard",
    },
    contactsMeta: {
      key: "c",
      metaKey: true,
      shiftKey: true,
      action: () => router.push("/dashboard/contacts"),
      description: "Go to Contacts",
    },
    contactsCtrl: {
      key: "c",
      ctrlKey: true,
      shiftKey: true,
      action: () => router.push("/dashboard/contacts"),
      description: "Go to Contacts",
    },
    dealsMeta: {
      key: "d",
      metaKey: true,
      shiftKey: true,
      action: () => router.push("/dashboard/deals"),
      description: "Go to Deals",
    },
    dealsCtrl: {
      key: "d",
      ctrlKey: true,
      shiftKey: true,
      action: () => router.push("/dashboard/deals"),
      description: "Go to Deals",
    },
    activitiesMeta: {
      key: "a",
      metaKey: true,
      shiftKey: true,
      action: () => router.push("/dashboard/activities"),
      description: "Go to Activities",
    },
    activitiesCtrl: {
      key: "a",
      ctrlKey: true,
      shiftKey: true,
      action: () => router.push("/dashboard/activities"),
      description: "Go to Activities",
    },
    projectsMeta: {
      key: "p",
      metaKey: true,
      shiftKey: true,
      action: () => router.push("/dashboard/projects"),
      description: "Go to Projects",
    },
    projectsCtrl: {
      key: "p",
      ctrlKey: true,
      shiftKey: true,
      action: () => router.push("/dashboard/projects"),
      description: "Go to Projects",
    },
    voiceCampaignsMeta: {
      key: "v",
      metaKey: true,
      shiftKey: true,
      action: () => router.push("/dashboard/voice-campaigns"),
      description: "Go to Voice Campaigns",
    },
    voiceCampaignsCtrl: {
      key: "v",
      ctrlKey: true,
      shiftKey: true,
      action: () => router.push("/dashboard/voice-campaigns"),
      description: "Go to Voice Campaigns",
    },
  });

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

