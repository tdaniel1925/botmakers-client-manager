"use client";

/**
 * Client-side Providers Wrapper
 * Wraps all client-only providers to prevent hydration issues
 */

import { ReactNode } from "react";
import { CopilotProvider } from "@/lib/ai-copilot-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { Providers } from "@/components/utilities/providers";

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <CopilotProvider>
        <Providers
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          {children}
        </Providers>
      </CopilotProvider>
    </ErrorBoundary>
  );
}





