// Platform Admin - Voice Campaigns Management Page

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isPlatformAdmin } from "@/db/queries/platform-queries";
import { getProjectById } from "@/db/queries/projects-queries";
import { CampaignsPageWrapper } from "@/components/voice-campaigns/campaigns-page-wrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function PlatformCampaignsPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  const isAdmin = await isPlatformAdmin(userId);
  if (!isAdmin) {
    redirect("/dashboard");
  }
  
  const project = await getProjectById(params.id);
  
  if (!project) {
    redirect("/platform/projects");
  }
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/platform/projects/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
        </Link>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold mb-2">Voice Campaigns</h1>
        <p className="text-gray-600">
          Project: <span className="font-semibold">{project.name}</span>
        </p>
      </div>
      
      {/* Campaigns List - Client Component handles state */}
      <CampaignsPageWrapper projectId={params.id} isPlatformAdmin={isAdmin} />
    </div>
  );
}
