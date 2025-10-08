"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Rocket, Loader2, CheckCircle2 } from "lucide-react";
import { launchCampaignAction } from "@/actions/voice-campaign-actions";
import { toast } from "sonner";
import { SelectVoiceCampaign } from "@/db/schema";

interface LaunchCampaignDialogProps {
  campaign: SelectVoiceCampaign;
  trigger?: React.ReactNode;
  onLaunched?: () => void;
}

export function LaunchCampaignDialog({
  campaign,
  trigger,
  onLaunched,
}: LaunchCampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const [launching, setLaunching] = useState(false);

  const handleLaunch = async () => {
    setLaunching(true);

    try {
      const result = await launchCampaignAction(campaign.id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Campaign launched successfully! 🚀");
      setOpen(false);

      if (onLaunched) {
        onLaunched();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to launch campaign");
    } finally {
      setLaunching(false);
    }
  };

  // Only show for pending campaigns
  if (campaign.status !== "pending") {
    return null;
  }

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setOpen(true)} size="sm" className="gap-2">
          <Rocket className="w-4 h-4" />
          Launch Campaign
        </Button>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Launch Campaign?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                You're about to launch <strong>{campaign.name}</strong>. Once launched, the
                campaign will become active and:
              </p>

              <ul className="list-disc list-inside space-y-2 text-sm">
                {campaign.campaignType === "inbound" && (
                  <>
                    <li>Start receiving incoming calls to {campaign.phoneNumber}</li>
                    <li>AI agent will handle calls according to your configuration</li>
                    <li>Call data and transcripts will be recorded</li>
                  </>
                )}
                {campaign.campaignType === "outbound" && (
                  <>
                    <li>Begin making outbound calls to your contact list</li>
                    <li>Calls will be placed according to your schedule configuration</li>
                    <li>
                      Timezone-aware scheduling will respect local business hours
                    </li>
                  </>
                )}
                <li className="font-medium">
                  Credits will be consumed for each minute of call time
                </li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Ready to go!</p>
                    <p>
                      Your AI agent is configured and your phone number is active. You can pause the
                      campaign at any time.
                    </p>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={launching}>Cancel</AlertDialogCancel>
            <Button onClick={handleLaunch} disabled={launching}>
              {launching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Launching...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Launch Campaign
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
