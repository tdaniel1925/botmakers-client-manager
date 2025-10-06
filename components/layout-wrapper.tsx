"use client";

/**
 * Layout Wrapper component for ClientFlow
 * Simple wrapper - no header, only sidebars throughout the app
 */
import { ReactNode } from "react";

interface LayoutWrapperProps {
  children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <main>
      {children}
    </main>
  );
}
