// Organization Dashboard - Voice Campaigns View Page

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProjectById } from "@/db/queries/projects-queries";
import { CampaignsList } from "@/components/voice-campaigns/campaigns-list";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, FolderKanban, Phone } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function DashboardCampaignsPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  const project = await getProjectById(params.id);
  
  if (!project) {
    redirect("/dashboard/projects");
  }
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/dashboard/projects", icon: <FolderKanban className="h-3.5 w-3.5" /> },
          { label: project.name, href: `/dashboard/projects/${params.id}` },
          { label: "Voice Campaigns", icon: <Phone className="h-3.5 w-3.5" /> }
        ]}
        className="mb-6"
      />
      
      <div>
        <h1 className="text-3xl font-bold mb-2">Voice Campaigns</h1>
        <p className="text-gray-600">
          Project: <span className="font-semibold">{project.name}</span>
        </p>
      </div>
      
      {/* Client View Notice */}
      <Alert className="bg-blue-50 border-blue-200">
        <Lock className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Client View:</strong> You can view campaign performance and call data here.
          To create or modify voice campaigns, please contact your account manager.
        </AlertDescription>
      </Alert>
      
      {/* Campaigns List - Read-only for clients */}
      <CampaignsList projectId={params.id} />
    </div>
  );
}
