"use client";

import { useState, useEffect } from "react";
import { CampaignWizard } from "./campaign-wizard";
import { CampaignsList } from "./campaigns-list";
import { CampaignSettingsDialogEnhanced } from "./campaign-settings-dialog-enhanced";
import { useCampaignStore } from "@/lib/stores/campaign-store";
import type { SelectVoiceCampaign } from "@/db/schema";

export function CampaignsPageWrapper({ 
  projectId, 
  isPlatformAdmin = false 
}: { 
  projectId: string;
  isPlatformAdmin?: boolean;
}) {
  const [showWizard, setShowWizard] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<SelectVoiceCampaign | null>(null);
  const { addCampaign, fetchCampaigns } = useCampaignStore();
  
  // Initial fetch
  useEffect(() => {
    fetchCampaigns(projectId);
  }, [projectId, fetchCampaigns]);
  
  if (showWizard) {
    return (
      <div className="mt-8">
        <CampaignWizard
          projectId={projectId}
          onComplete={(campaignId, campaign) => {
            setShowWizard(false);
            // Add new campaign to store
            if (campaign) {
              addCampaign(campaign);
            } else {
              // Fallback: refetch all campaigns
              fetchCampaigns(projectId, true);
            }
          }}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    );
  }
  
  return (
    <>
      <CampaignsList
        projectId={projectId}
        onCreateNew={() => setShowWizard(true)}
        onEditCampaign={(campaign) => setSelectedCampaign(campaign)}
        onViewDetails={(campaign) => {
          const basePath = window.location.pathname.includes("/platform/") ? "/platform" : "/dashboard";
          window.location.href = `${basePath}/projects/${projectId}/campaigns/${campaign.id}`;
        }}
      />
      
      <CampaignSettingsDialogEnhanced
        campaign={selectedCampaign}
        open={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        onSaved={() => {
          setSelectedCampaign(null);
          // Refetch campaigns to show updates
          fetchCampaigns(projectId, true);
        }}
        isPlatformAdmin={isPlatformAdmin}
      />
    </>
  );
}
