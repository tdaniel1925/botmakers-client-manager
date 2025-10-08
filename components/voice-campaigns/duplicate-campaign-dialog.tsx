"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Copy, Info, Phone } from "lucide-react";
import { toast } from "sonner";
import { duplicateCampaignAction } from "@/actions/voice-campaign-actions";
import type { SelectVoiceCampaign } from "@/db/schema";

interface DuplicateCampaignDialogProps {
  campaign: SelectVoiceCampaign | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (newCampaignId: string) => void;
}

export function DuplicateCampaignDialog({
  campaign,
  open,
  onClose,
  onSuccess,
}: DuplicateCampaignDialogProps) {
  const [newName, setNewName] = useState("");
  const [phoneOption, setPhoneOption] = useState<"new" | "existing">("new");
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open && campaign) {
      setNewName(`${campaign.name} (Copy)`);
      setPhoneOption("new");
    } else {
      setNewName("");
      setPhoneOption("new");
    }
    if (!open) {
      onClose();
    }
  };

  const handleDuplicate = async () => {
    if (!campaign) return;

    if (!newName.trim()) {
      toast.error("Please enter a name for the duplicated campaign");
      return;
    }

    setIsDuplicating(true);

    try {
      const result = await duplicateCampaignAction(campaign.id, {
        newName: newName.trim(),
        provisionNewPhoneNumber: phoneOption === "new",
      });

      if (result.error) {
        toast.error(result.error);
      } else if (result.campaign) {
        toast.success("Campaign duplicated successfully!");
        onSuccess?.(result.campaign.id);
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to duplicate campaign");
    } finally {
      setIsDuplicating(false);
    }
  };

  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Duplicate Campaign
          </DialogTitle>
          <DialogDescription>
            Create a copy of "{campaign.name}" with the same configuration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* New Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="new-name">New Campaign Name *</Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter name for duplicated campaign"
              autoFocus
            />
          </div>

          {/* Phone Number Option */}
          <div className="space-y-3">
            <Label>Phone Number</Label>
            <RadioGroup value={phoneOption} onValueChange={(v) => setPhoneOption(v as any)}>
              <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="new" id="phone-new" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="phone-new" className="font-medium cursor-pointer">
                    Provision New Number
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Get a new phone number from {campaign.provider.toUpperCase()}. 
                    Recommended for production use.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="existing" id="phone-existing" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="phone-existing" className="font-medium cursor-pointer">
                    Share Existing Number
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Use the same number as the original campaign ({campaign.phoneNumber}). 
                    Both campaigns will receive calls to this number.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>What will be copied:</strong>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li>System prompt and messages</li>
                <li>Agent personality and settings</li>
                <li>Data collection configuration</li>
                <li>Voice preferences</li>
                <li>Campaign goal and type</li>
              </ul>
              <div className="mt-3">
                <strong>What won't be copied:</strong>
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  <li>Call history and analytics</li>
                  <li>Campaign status (starts as draft)</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Cost Warning for New Number */}
          {phoneOption === "new" && (
            <Alert className="bg-amber-50 border-amber-200">
              <Phone className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-900">
                Provisioning a new phone number may incur additional costs from your provider.
                Check your {campaign.provider.toUpperCase()} pricing for phone number fees.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDuplicating}>
            Cancel
          </Button>
          <Button onClick={handleDuplicate} disabled={isDuplicating || !newName.trim()}>
            {isDuplicating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Duplicating...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Campaign
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
