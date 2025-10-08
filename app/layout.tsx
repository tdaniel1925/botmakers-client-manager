import { getProfileByUserIdAction } from "@/actions/profiles-actions";
import { PaymentStatusAlert } from "@/components/payment/payment-status-alert";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { Providers } from "@/components/utilities/providers";
import LayoutWrapper from "@/components/layout-wrapper";
import { ErrorBoundary } from "@/components/error-boundary"; // ✅ FIX BUG-006
import { ClerkProvider } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createProfileAction } from "@/actions/profiles-actions";
import { claimPendingProfile } from "@/actions/whop-actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClientFlow",
  description: "Multi-tenant CRM platform for managing client organizations."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {/* ✅ FIX BUG-006: Wrap entire app in error boundary */}
          <ErrorBoundary>
            <Providers
              attribute="class"
              defaultTheme="light"
              disableTransitionOnChange
            >
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
              <Toaster />
              <Sonner 
                position="bottom-center"
                expand={false}
                richColors={false}
                closeButton={false}
                toastOptions={{
                  unstyled: true,
                  classNames: {
                    toast: "w-full max-w-2xl",
                  },
                }}
              />
            </Providers>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
