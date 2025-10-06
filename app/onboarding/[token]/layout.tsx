/**
 * Onboarding Layout
 * Clean, minimal layout for public onboarding pages
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Onboarding - ClientFlow",
  description: "Complete your project onboarding",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
