"use client";

import { ReactNode } from "react";
import { OrganizationProvider } from "@/lib/organization-context";

interface DashboardClientWrapperProps {
  children: ReactNode;
}

export function DashboardClientWrapper({ children }: DashboardClientWrapperProps) {
  return (
    <OrganizationProvider>
      {children}
    </OrganizationProvider>
  );
}
