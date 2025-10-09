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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Copy } from "lucide-react";
import type { SelectVoiceCampaign } from "@/db/schema";

interface DuplicateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: SelectVoiceCampaign;
  onDuplicate: (newName: string, provisionNewPhone: boolean) => Promise<void>;
}

export function DuplicateCampaignDialog({
  open,
  onOpenChange,
  campaign,
  onDuplicate,
}: DuplicateCampaignDialogProps) {
  const [newName, setNewName] = useState(`${campaign.name} (Copy)`);
  const [provisionNewPhone, setProvisionNewPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newName.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onDuplicate(newName.trim(), provisionNewPhone);
      onOpenChange(false);
      setNewName(`${campaign.name} (Copy)`);
      setProvisionNewPhone(false);
    } catch (error) {
      console.error("Duplication error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Duplicate Campaign
          </DialogTitle>
          <DialogDescription>
            Create a copy of "{campaign.name}" with the same configuration.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="campaignName">New Campaign Name</Label>
              <Input
                id="campaignName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter campaign name"
                disabled={isSubmitting}
                required
              />
              <p className="text-xs text-gray-500">
                The duplicated campaign will start in "Draft" status
              </p>
            </div>

            {campaign.phoneNumber && campaign.phoneNumber !== "pending" && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="provisionPhone"
                    checked={provisionNewPhone}
                    onCheckedChange={(checked) => setProvisionNewPhone(checked as boolean)}
                    disabled={isSubmitting}
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="provisionPhone"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Provision new phone number
                    </Label>
                    <p className="text-xs text-gray-600">
                      {provisionNewPhone ? (
                        <>A new phone number will be provisioned for this campaign (additional cost may apply)</>
                      ) : (
                        <>The duplicated campaign will share the existing phone number: <span className="font-mono">{campaign.phoneNumber}</span></>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900">What will be copied:</h4>
              <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                <li>System prompt and first message</li>
                <li>Agent personality and voice settings</li>
                <li>Campaign configuration and goals</li>
                <li>Voicemail message settings</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                ⚠️ Call history and analytics will NOT be copied
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !newName.trim()}
            >
              {isSubmitting ? (
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
