"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Play, Pause, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  bulkPauseCampaignsAction,
  bulkResumeCampaignsAction,
  bulkDeleteCampaignsAction,
} from "@/actions/voice-campaign-actions";

interface BulkActionToolbarProps {
  selectedCampaignIds: string[];
  selectedCampaigns: Array<{ id: string; name: string; status: string }>;
  onClearSelection: () => void;
  onComplete: () => void;
}

export function BulkActionToolbar({
  selectedCampaignIds,
  selectedCampaigns,
  onClearSelection,
  onComplete,
}: BulkActionToolbarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleBulkPause = async () => {
    setIsProcessing(true);
    setCurrentOperation("Pausing campaigns...");
    setProgress(0);

    try {
      const result = await bulkPauseCampaignsAction(selectedCampaignIds);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        const { successful, failed } = result;
        toast.success(`Paused ${successful} campaign(s)`);
        if (failed && failed > 0) {
          toast.error(`Failed to pause ${failed} campaign(s)`);
        }
        onComplete();
        onClearSelection();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to pause campaigns");
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
      setProgress(0);
    }
  };

  const handleBulkResume = async () => {
    setIsProcessing(true);
    setCurrentOperation("Resuming campaigns...");
    setProgress(0);

    try {
      const result = await bulkResumeCampaignsAction(selectedCampaignIds);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        const { successful, failed } = result;
        toast.success(`Resumed ${successful} campaign(s)`);
        if (failed && failed > 0) {
          toast.error(`Failed to resume ${failed} campaign(s)`);
        }
        onComplete();
        onClearSelection();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to resume campaigns");
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
      setProgress(0);
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    setCurrentOperation("Deleting campaigns...");
    setProgress(0);

    try {
      const result = await bulkDeleteCampaignsAction(selectedCampaignIds);
      
      if (result.error) {
        toast.error(result.error);
        throw new Error(result.error);
      } else {
        const { successful, failed } = result;
        toast.success(`Deleted ${successful} campaign(s)`);
        if (failed && failed > 0) {
          toast.error(`Failed to delete ${failed} campaign(s)`);
        }
        onComplete();
        onClearSelection();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete campaigns");
      throw error;
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
      setProgress(0);
      setShowDeleteDialog(false);
    }
  };

  const activeCampaignsCount = selectedCampaigns.filter(c => c.status === "active").length;
  const pausedCampaignsCount = selectedCampaigns.filter(c => c.status === "paused").length;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white border-2 border-blue-200 rounded-lg shadow-2xl px-6 py-4 min-w-[500px]">
          {isProcessing ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{currentOperation}</span>
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              {/* Selection Info */}
              <div className="flex items-center gap-3">
                <Badge variant="default" className="text-sm px-3 py-1">
                  {selectedCampaignIds.length} Selected
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelection}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {pausedCampaignsCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkResume}
                    disabled={isProcessing}
                    className="h-8"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume {pausedCampaignsCount > 0 && `(${pausedCampaignsCount})`}
                  </Button>
                )}

                {activeCampaignsCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkPause}
                    disabled={isProcessing}
                    className="h-8"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause {activeCampaignsCount > 0 && `(${activeCampaignsCount})`}
                  </Button>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isProcessing}
                  className="h-8"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Multiple Campaigns"
        description={`You are about to delete ${selectedCampaignIds.length} campaigns. This action cannot be undone. All campaign data, call history, and analytics will be permanently removed.`}
        confirmText="Delete All"
        variant="danger"
        requireTyping
        typingConfirmText="DELETE"
        onConfirm={handleBulkDelete}
      />
    </>
  );
}
