import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClientFlow - AI Voice Campaigns & CRM",
  description: "Create intelligent inbound & outbound calling campaigns with GPT-4o powered AI agents.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
