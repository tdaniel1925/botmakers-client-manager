"use client";

import { useRouter } from "next/navigation";
import { CampaignDashboardWidget } from "./campaign-dashboard-widget";

interface CampaignDashboardWidgetWrapperProps {
  projectId: string;
  viewType: "admin" | "org";
}

export function CampaignDashboardWidgetWrapper({ 
  projectId,
  viewType 
}: CampaignDashboardWidgetWrapperProps) {
  const router = useRouter();
  
  const basePath = viewType === "admin" ? "/platform" : "/dashboard";
  
  return (
    <CampaignDashboardWidget 
      projectId={projectId}
      onCreateNew={viewType === "admin" ? () => router.push(`${basePath}/projects/${projectId}/campaigns`) : undefined}
      onViewAll={() => router.push(`${basePath}/projects/${projectId}/campaigns`)}
    />
  );
}
