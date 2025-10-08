import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isPlatformAdmin } from "@/db/queries/platform-queries";
import { getCampaignById } from "@/db/queries/voice-campaigns-queries";
import { CampaignDetailPageClient } from "@/components/voice-campaigns/campaign-detail/campaign-detail-page-client";

interface CampaignDetailPageProps {
  params: {
    id: string; // project ID
    campaignId: string;
  };
}

export default async function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const isAdmin = await isPlatformAdmin(userId);
  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Fetch campaign
  const campaign = await getCampaignById(params.campaignId);

  if (!campaign) {
    redirect(`/platform/projects/${params.id}/campaigns`);
  }

  return (
    <CampaignDetailPageClient
      campaign={campaign}
      projectId={params.id}
      isPlatformAdmin={true}
    />
  );
}
