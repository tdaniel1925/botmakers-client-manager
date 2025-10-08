"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Phone,
  MoreVertical,
  Play,
  Pause,
  Edit,
  Trash2,
  BarChart3,
  Clock,
  DollarSign,
  PhoneCall,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { pauseCampaignAction, resumeCampaignAction, deleteCampaignAction } from "@/actions/voice-campaign-actions";
import { useCampaignStore } from "@/lib/stores/campaign-store";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CampaignStatusBadge, ProviderBadge } from "./campaign-status-badge";
import type { SelectVoiceCampaign } from "@/db/schema";

interface CampaignCardProps {
  campaign: SelectVoiceCampaign;
  onEdit?: () => void;
  onDeleted?: () => void;
  onViewDetails?: () => void;
}

export function CampaignCard({ campaign, onEdit, onDeleted, onViewDetails }: CampaignCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const { optimisticUpdate, deleteCampaign: removeCampaignFromStore } = useCampaignStore();

  // Format phone number for display: +17185212804 -> (718) 521-2804
  const formatPhoneNumber = (phone: string | null) => {
    if (!phone || phone === "pending") return null;
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      const areaCode = cleaned.slice(1, 4);
      const prefix = cleaned.slice(4, 7);
      const lineNumber = cleaned.slice(7, 11);
      return `(${areaCode}) ${prefix}-${lineNumber}`;
    }
    return phone;
  };

  const handleCopyPhone = () => {
    if (campaign.phoneNumber && campaign.phoneNumber !== "pending") {
      navigator.clipboard.writeText(campaign.phoneNumber);
      setPhoneCopied(true);
      toast.success("Phone number copied!");
      setTimeout(() => setPhoneCopied(false), 2000);
    }
  };
  
  const handlePause = async () => {
    setIsProcessing(true);
    try {
      await optimisticUpdate(
        campaign.id,
        { status: "paused", isActive: false },
        async () => {
          const result = await pauseCampaignAction(campaign.id);
          if (result.error) {
            throw new Error(result.error);
          }
        }
      );
      toast.success("Campaign paused");
    } catch (error: any) {
      toast.error(error.message || "Failed to pause campaign");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleResume = async () => {
    setIsProcessing(true);
    try {
      await optimisticUpdate(
        campaign.id,
        { status: "active", isActive: true },
        async () => {
          const result = await resumeCampaignAction(campaign.id);
          if (result.error) {
            throw new Error(result.error);
          }
        }
      );
      toast.success("Campaign resumed");
    } catch (error: any) {
      toast.error(error.message || "Failed to resume campaign");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDelete = async () => {
    const result = await deleteCampaignAction(campaign.id);
    if (result.error) {
      toast.error(result.error);
      throw new Error(result.error);
    }
    // Remove from store
    removeCampaignFromStore(campaign.id);
    toast.success("Campaign deleted");
    onDeleted?.();
  };
  
  const isActive = campaign.status === "active" && campaign.isActive;
  const isPaused = campaign.status === "paused";
  
  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Campaign Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base">{campaign.name}</CardTitle>
                <CampaignStatusBadge 
                  status={campaign.status as any} 
                  isActive={campaign.isActive || false}
                />
                <ProviderBadge provider={campaign.provider} />
              </div>
              {campaign.description && (
                <CardDescription className="line-clamp-1 text-xs">
                  {campaign.description}
                </CardDescription>
              )}
            </div>
            
            {/* Middle: Phone Number */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-blue-700">Phone Number</span>
                  {campaign.phoneNumber && campaign.phoneNumber !== "pending" ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-blue-900">
                        {formatPhoneNumber(campaign.phoneNumber)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPhone();
                        }}
                        className="p-1 hover:bg-blue-200 rounded transition-colors"
                        title="Copy phone number"
                      >
                        {phoneCopied ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3 text-blue-600" />
                        )}
                      </button>
                    </div>
                  ) : campaign.phoneNumber === "pending" ? (
                    <span className="text-xs text-yellow-600 font-medium">Provisioning...</span>
                  ) : (
                    <span className="text-xs text-gray-500">Not assigned</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Stats - Horizontal */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <PhoneCall className="h-3 w-3 text-gray-400" />
                  <div className="text-lg font-bold">{campaign.totalCalls || 0}</div>
                </div>
                <div className="text-xs text-gray-500">Total Calls</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <div className="text-lg font-bold">
                    {campaign.averageCallDuration 
                      ? `${Math.floor(campaign.averageCallDuration / 60)}m`
                      : "0m"}
                  </div>
                </div>
                <div className="text-xs text-gray-500">Avg Duration</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-gray-400" />
                  <div className="text-lg font-bold">
                    ${((campaign.totalCost || 0) / 100).toFixed(2)}
                  </div>
                </div>
                <div className="text-xs text-gray-500">Total Cost</div>
              </div>
            </div>
            
            {/* Right: Meta Info & Actions */}
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500 text-right">
                <div>Created: {new Date(campaign.createdAt).toLocaleDateString()}</div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={isProcessing}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onViewDetails && (
                    <DropdownMenuItem onClick={onViewDetails}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Settings
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {isActive ? (
                    <DropdownMenuItem onClick={handlePause}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Campaign
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={handleResume}>
                      <Play className="h-4 w-4 mr-2" />
                      Resume Campaign
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Campaign
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    
    {/* Delete Confirmation Dialog */}
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
  </>
  );
}
