"use client";

import { ReactNode } from "react";
import { OrganizationProvider } from "@/lib/organization-context";
import { KeyboardShortcutsProvider } from "@/components/providers/keyboard-shortcuts-provider";

interface DashboardClientWrapperProps {
  children: ReactNode;
}

export function DashboardClientWrapper({ children }: DashboardClientWrapperProps) {
  return (
    <OrganizationProvider>
      <KeyboardShortcutsProvider>
        {children}
      </KeyboardShortcutsProvider>
    </OrganizationProvider>
  );
}
