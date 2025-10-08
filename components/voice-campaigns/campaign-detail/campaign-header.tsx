"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampaignStatusBadge, ProviderBadge } from "../campaign-status-badge";
import {
  ArrowLeft,
  MoreVertical,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Download,
  Check,
  Phone,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { SelectVoiceCampaign } from "@/db/schema";

interface CampaignHeaderProps {
  campaign: SelectVoiceCampaign;
  onBack?: () => void;
  onEdit?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  onVerifyWebhook?: () => void;
}

export function CampaignHeader({
  campaign,
  onBack,
  onEdit,
  onPause,
  onResume,
  onDuplicate,
  onDelete,
  onExport,
  onVerifyWebhook,
}: CampaignHeaderProps) {
  const isActive = campaign.status === "active" && campaign.isActive;
  const [phoneCopied, setPhoneCopied] = useState(false);

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
      toast.success("Phone number copied to clipboard!");
      setTimeout(() => setPhoneCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        )}

        {/* Header Content */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              <CampaignStatusBadge
                status={campaign.status as any}
                isActive={campaign.isActive || false}
              />
              <ProviderBadge provider={campaign.provider} />
            </div>

            {campaign.description && (
              <p className="text-gray-600 max-w-2xl">
                {campaign.description}
              </p>
            )}

            {/* Prominent Phone Number Display */}
            {campaign.phoneNumber && campaign.phoneNumber !== "pending" && (
              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg inline-flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-full">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-blue-700 uppercase mb-1">
                      Campaign Phone Number
                    </div>
                    <div className="text-2xl font-bold text-blue-900 font-mono">
                      {formatPhoneNumber(campaign.phoneNumber)}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Call this number to test your AI agent
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyPhone}
                  className={cn(
                    "border-blue-300 hover:bg-blue-100",
                    phoneCopied && "bg-green-100 border-green-300"
                  )}
                >
                  {phoneCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-green-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            )}

            {campaign.phoneNumber === "pending" && (
              <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg inline-flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                <div>
                  <div className="text-sm font-medium text-yellow-900">
                    Phone number is being provisioned...
                  </div>
                  <div className="text-xs text-yellow-700">
                    This usually takes 30-60 seconds. The page will update automatically.
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span>{" "}
                {new Date(campaign.createdAt).toLocaleDateString()}
              </div>
              {campaign.lastCallAt && (
                <div>
                  <span className="font-medium">Last Call:</span>{" "}
                  {new Date(campaign.lastCallAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}

            {isActive ? (
              onPause && (
                <Button variant="outline" onClick={onPause}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )
            ) : (
              onResume && (
                <Button onClick={onResume}>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onVerifyWebhook && campaign.provider === "vapi" && campaign.phoneNumber && (
                  <DropdownMenuItem onClick={onVerifyWebhook}>
                    <Check className="h-4 w-4 mr-2" />
                    Verify Phone Webhook
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                {onExport && (
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                )}
                {onVerifyWebhook && campaign.provider === "vapi" && campaign.phoneNumber && (
                  <DropdownMenuSeparator />
                )}
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
