"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CampaignHeader } from "./campaign-header";
import { StatsDashboard } from "./stats-dashboard";
import { CallHistoryTable } from "./call-history-table";
import { CallTranscriptDialog } from "./call-transcript-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CampaignSettingsDialogEnhanced } from "../campaign-settings-dialog-enhanced";
import { CampaignDetailSkeleton } from "@/components/ui/loading-skeleton";
import { toast } from "@/lib/toast";
import {
  getCampaignAnalyticsAction,
  getCampaignCallHistoryAction,
} from "@/actions/campaign-analytics-actions";
import {
  pauseCampaignAction,
  resumeCampaignAction,
  deleteCampaignAction,
  launchCampaignAction,
  verifyPhoneWebhookAction,
} from "@/actions/voice-campaign-actions";
import type { SelectVoiceCampaign, SelectCallRecord } from "@/db/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactListUpload } from "../contact-list-upload";
import { CampaignSummary } from "../campaign-summary";
import { LaunchCampaignDialog } from "../launch-campaign-dialog";
import { CampaignMessagingManager } from "../messaging/campaign-messaging-manager";

interface CampaignDetailPageClientProps {
  campaign: SelectVoiceCampaign;
  projectId: string;
  isPlatformAdmin: boolean;
}

export function CampaignDetailPageClient({
  campaign: initialCampaign,
  projectId,
  isPlatformAdmin,
}: CampaignDetailPageClientProps) {
  const router = useRouter();
  const [campaign, setCampaign] = useState(initialCampaign);
  const [analytics, setAnalytics] = useState<any>(null);
  const [callRecords, setCallRecords] = useState<SelectCallRecord[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<SelectCallRecord | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch analytics
  useEffect(() => {
    fetchAnalytics();
    fetchCallHistory(1);
  }, [campaign.id]);

  const fetchAnalytics = async () => {
    const result = await getCampaignAnalyticsAction(campaign.id);
    if (result.success && result.analytics) {
      setAnalytics(result.analytics);
    }
    setLoading(false);
  };

  const fetchCallHistory = async (page: number = 1, filters?: any) => {
    const result = await getCampaignCallHistoryAction(
      campaign.id,
      page,
      20,
      filters
    );
    if (result.success) {
      setCallRecords(result.callRecords || []);
      setPagination(result.pagination);
    }
  };

  const handleBack = () => {
    router.push(
      isPlatformAdmin
        ? `/platform/projects/${projectId}/campaigns`
        : `/dashboard/projects/${projectId}/campaigns`
    );
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };
  
  const handleEditSaved = () => {
    // Refresh analytics and campaign data
    fetchAnalytics();
    fetchCallHistory(1);
    // Update local campaign state
    setCampaign({ ...campaign });
    toast.success("Campaign updated successfully!");
  };

  const handlePause = async () => {
    setIsProcessing(true);
    try {
      const result = await pauseCampaignAction(campaign.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setCampaign({ ...campaign, status: "paused", isActive: false });
        toast.success("Campaign paused");
      }
    } catch (error) {
      toast.error("Failed to pause campaign");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResume = async () => {
    setIsProcessing(true);
    try {
      const result = await resumeCampaignAction(campaign.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setCampaign({ ...campaign, status: "active", isActive: true });
        toast.success("Campaign resumed");
      }
    } catch (error) {
      toast.error("Failed to resume campaign");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLaunched = () => {
    // Refresh campaign data after launch
    setCampaign({ ...campaign, status: "active", isActive: true });
    fetchAnalytics();
    toast.success("Campaign launched successfully! 🚀");
  };

  const handleDuplicate = () => {
    toast.info("Campaign duplication coming soon!");
    // TODO: Implement duplication
  };

  const handleDelete = async () => {
    const result = await deleteCampaignAction(campaign.id);
    if (result.error) {
      toast.error(result.error);
      throw new Error(result.error);
    }
    toast.success("Campaign deleted");
    router.push(
      isPlatformAdmin
        ? `/platform/projects/${projectId}/campaigns`
        : `/dashboard/projects/${projectId}/campaigns`
    );
  };

  const handleExport = () => {
    const exportData = {
      campaign: {
        ...campaign,
        createdAt: undefined,
        updatedAt: undefined,
        id: undefined,
        projectId: undefined,
        webhookId: undefined,
      },
      analytics,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `campaign-${campaign.name.replace(/\s+/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Campaign exported");
  };

  const handleVerifyWebhook = async () => {
    setIsProcessing(true);
    try {
      const result = await verifyPhoneWebhookAction(campaign.id);
      if (result.error) {
        toast.error(result.error);
      } else if (result.alreadyCorrect) {
        toast.success(result.message || "✅ Webhook is correctly configured!");
      } else if (result.wasUpdated) {
        toast.success(result.message || "✅ Webhook updated successfully!");
      } else {
        toast.success("✅ Webhook verified!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify webhook");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <CampaignDetailSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CampaignHeader
        campaign={campaign}
        onBack={handleBack}
        onEdit={isPlatformAdmin ? handleEdit : undefined}
        onPause={isPlatformAdmin && campaign.status === "active" ? handlePause : undefined}
        onResume={isPlatformAdmin && campaign.status === "paused" ? handleResume : undefined}
        onDuplicate={isPlatformAdmin ? handleDuplicate : undefined}
        onDelete={isPlatformAdmin ? () => setShowDeleteDialog(true) : undefined}
        onExport={handleExport}
        onVerifyWebhook={isPlatformAdmin ? handleVerifyWebhook : undefined}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Launch Button for Pending Campaigns */}
        {campaign.status === "pending" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-yellow-900">Campaign Pending Launch</h3>
                <p className="text-sm text-yellow-700">
                  This campaign is ready to launch. Review the details below and click Launch when ready.
                </p>
              </div>
              <LaunchCampaignDialog campaign={campaign} onLaunched={handleLaunched} />
            </div>
          </div>
        )}

        {/* Tabbed Interface */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calls">Call History</TabsTrigger>
            {campaign.campaignType === "outbound" && (
              <TabsTrigger value="contacts">Contact List</TabsTrigger>
            )}
            {isPlatformAdmin && (
              <TabsTrigger value="messaging">SMS & Email</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Dashboard */}
            {analytics && <StatsDashboard stats={analytics} />}
            
            {/* Campaign Summary with Timezone Info */}
            {campaign.campaignType === "outbound" && (
              <CampaignSummary campaign={campaign} />
            )}
          </TabsContent>

          <TabsContent value="calls">
            {/* Call History */}
            <CallHistoryTable
              callRecords={callRecords}
              pagination={pagination}
              onPageChange={(page) => fetchCallHistory(page)}
              onFilterChange={(filters) => fetchCallHistory(1, filters)}
              onCallClick={(call) => setSelectedCall(call)}
            />
          </TabsContent>

          {campaign.campaignType === "outbound" && (
            <TabsContent value="contacts">
              {/* Contact List Upload */}
              <ContactListUpload
                campaignId={campaign.id}
                onUploadComplete={() => {
                  // Refresh analytics to show updated contact counts
                  fetchAnalytics();
                  toast.success("Contact list uploaded successfully!");
                }}
              />
            </TabsContent>
          )}

          {isPlatformAdmin && (
            <TabsContent value="messaging">
              {/* SMS & Email Messaging Configuration */}
              <CampaignMessagingManager
                campaignId={campaign.id}
                projectId={projectId}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Call Details Dialog */}
      <CallTranscriptDialog
        callRecord={selectedCall}
        open={!!selectedCall}
        onOpenChange={(open) => !open && setSelectedCall(null)}
      />

      {/* Edit Dialog */}
      <CampaignSettingsDialogEnhanced
        campaign={campaign}
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSaved={handleEditSaved}
        isPlatformAdmin={isPlatformAdmin}
      />
      
      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Campaign"
        description={`Are you sure you want to delete "${campaign.name}"? This will permanently remove the campaign and all associated data.`}
        confirmText="Delete Campaign"
        variant="danger"
        requireTyping
        typingConfirmText={campaign.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
