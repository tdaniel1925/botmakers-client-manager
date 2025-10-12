"use client";

/**
 * Layout Wrapper component for ClientFlow
 * Simple wrapper with error boundary - no header, only sidebars throughout the app
 */
import { ReactNode } from "react";
import { ErrorBoundary } from "./error-boundary";

interface LayoutWrapperProps {
  children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <ErrorBoundary>
      <main>
        {children}
      </main>
    </ErrorBoundary>
  );
}
