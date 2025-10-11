"use client";

import { useState, useEffect } from "react";
import { CampaignWizard } from "./campaign-wizard";
import { AICampaignWizard } from "./ai-campaign-wizard";
import { CampaignsList } from "./campaigns-list";
import { CampaignSettingsDialogEnhanced } from "./campaign-settings-dialog-enhanced";
import { useCampaignStore } from "@/lib/stores/campaign-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, List } from "lucide-react";
import type { SelectVoiceCampaign } from "@/db/schema";

export function CampaignsPageWrapper({ 
  projectId, 
  isPlatformAdmin = false 
}: { 
  projectId: string;
  isPlatformAdmin?: boolean;
}) {
  const [showWizard, setShowWizard] = useState(false);
  const [wizardType, setWizardType] = useState<'ai' | 'manual'>('ai'); // Default to AI wizard
  const [selectedCampaign, setSelectedCampaign] = useState<SelectVoiceCampaign | null>(null);
  const { addCampaign, fetchCampaigns } = useCampaignStore();
  
  // Initial fetch
  useEffect(() => {
    fetchCampaigns(projectId);
  }, [projectId, fetchCampaigns]);
  
  if (showWizard) {
    return (
      <div className="mt-8">
        {/* Wizard Type Switcher */}
        <div className="flex justify-center mb-6 gap-2">
          <Button
            variant={wizardType === 'ai' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setWizardType('ai')}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Wizard
            <Badge variant="secondary" className="ml-2">Recommended</Badge>
          </Button>
          <Button
            variant={wizardType === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setWizardType('manual')}
          >
            <List className="h-4 w-4 mr-2" />
            Manual Form
          </Button>
        </div>

        {wizardType === 'ai' ? (
          <AICampaignWizard
            projectId={projectId}
            onComplete={(campaignId, campaign) => {
              setShowWizard(false);
              if (campaign) {
                addCampaign(campaign);
              } else {
                fetchCampaigns(projectId, true);
              }
            }}
            onCancel={() => setShowWizard(false)}
          />
        ) : (
          <CampaignWizard
            projectId={projectId}
            onComplete={(campaignId, campaign) => {
              setShowWizard(false);
              if (campaign) {
                addCampaign(campaign);
              } else {
                fetchCampaigns(projectId, true);
              }
            }}
            onCancel={() => setShowWizard(false)}
          />
        )}
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
