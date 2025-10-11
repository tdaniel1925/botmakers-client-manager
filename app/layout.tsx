import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import LayoutWrapper from "@/components/layout-wrapper";
import { ClientProviders } from "@/components/client-providers";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
          <ClientProviders>
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
          </ClientProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
