/**
 * Hook for auto-polling pending phone numbers
 * Automatically checks phone number status every 5 seconds until it's ready
 */

import { useEffect, useRef } from "react";
import { refreshCampaignPhoneNumberAction } from "@/actions/voice-campaign-refresh-actions";
import { useCampaignStore } from "@/lib/stores/campaign-store";
import { toast } from "sonner";

interface PhoneNumberPollingOptions {
  campaignId: string;
  phoneNumber: string;
  enabled?: boolean;
  interval?: number; // milliseconds
  maxAttempts?: number;
  onSuccess?: (phoneNumber: string) => void;
  onError?: (error: string) => void;
}

export function usePhoneNumberPolling({
  campaignId,
  phoneNumber,
  enabled = true,
  interval = 5000, // 5 seconds
  maxAttempts = 60, // 5 minutes total
  onSuccess,
  onError,
}: PhoneNumberPollingOptions) {
  const { updateCampaign } = useCampaignStore();
  const attemptCountRef = useRef(0);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Don't poll if phone number is not pending or polling is disabled
    if (!enabled || phoneNumber !== "pending") {
      return;
    }

    console.log(`[Phone Polling] Starting polling for campaign ${campaignId}`);
    attemptCountRef.current = 0;

    const poll = async () => {
      attemptCountRef.current += 1;
      console.log(
        `[Phone Polling] Attempt ${attemptCountRef.current}/${maxAttempts} for campaign ${campaignId}`
      );

      try {
        const result = await refreshCampaignPhoneNumberAction(campaignId);

        if (result.isSuccess && result.phoneNumber && result.phoneNumber !== "pending") {
          // Phone number is ready!
          console.log(`[Phone Polling] ✓ Phone number ready: ${result.phoneNumber}`);
          
          // Update store
          updateCampaign(campaignId, { phoneNumber: result.phoneNumber });
          
          // Show success toast
          toast.success(`Phone number assigned: ${result.phoneNumber}`);
          
          // Call success callback
          onSuccess?.(result.phoneNumber);
          
          // Stop polling
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
        } else if (attemptCountRef.current >= maxAttempts) {
          // Max attempts reached, stop polling
          console.warn(`[Phone Polling] Max attempts reached for campaign ${campaignId}`);
          
          toast.error(
            "Phone number provisioning is taking longer than expected. Please check back later."
          );
          
          onError?.("Max polling attempts reached");
          
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
        }
      } catch (error: any) {
        console.error(`[Phone Polling] Error:`, error);
        
        // Don't stop polling on error, just log it
        // Provider might be temporarily unavailable
        if (attemptCountRef.current >= maxAttempts) {
          onError?.(error.message || "Polling error");
          
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
        }
      }
    };

    // Poll immediately, then on interval
    poll();
    intervalIdRef.current = setInterval(poll, interval);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalIdRef.current) {
        console.log(`[Phone Polling] Stopping polling for campaign ${campaignId}`);
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [campaignId, phoneNumber, enabled, interval, maxAttempts, updateCampaign, onSuccess, onError]);

  // Return current attempt count for debugging
  return {
    attemptCount: attemptCountRef.current,
    isPolling: intervalIdRef.current !== null,
  };
}

/**
 * Hook for polling multiple campaigns at once
 * Uses a single effect to manage all campaigns to avoid hook ordering issues
 */
export function useBulkPhoneNumberPolling(
  campaigns: Array<{ id: string; phoneNumber: string }>
) {
  const { updateCampaign } = useCampaignStore();
  const intervalIdsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const attemptCountsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const pendingCampaigns = campaigns.filter((c) => c.phoneNumber === "pending");

    if (pendingCampaigns.length === 0) {
      return;
    }

    console.log(`[Bulk Polling] Starting polling for ${pendingCampaigns.length} campaigns`);

    const pollCampaign = async (campaignId: string) => {
      const attempts = attemptCountsRef.current.get(campaignId) || 0;
      attemptCountsRef.current.set(campaignId, attempts + 1);

      try {
        const result = await refreshCampaignPhoneNumberAction(campaignId);

        if (result.isSuccess && result.phoneNumber && result.phoneNumber !== "pending") {
          // Phone number is ready!
          console.log(`[Bulk Polling] ✓ Phone number ready for ${campaignId}: ${result.phoneNumber}`);
          
          // Update store
          updateCampaign(campaignId, { phoneNumber: result.phoneNumber });
          
          // Show success toast
          toast.success(`Phone number assigned: ${result.phoneNumber}`);
          
          // Stop polling this campaign
          const intervalId = intervalIdsRef.current.get(campaignId);
          if (intervalId) {
            clearInterval(intervalId);
            intervalIdsRef.current.delete(campaignId);
            attemptCountsRef.current.delete(campaignId);
          }
        } else if (attempts >= 60) {
          // Max attempts reached
          console.warn(`[Bulk Polling] Max attempts reached for ${campaignId}`);
          
          const intervalId = intervalIdsRef.current.get(campaignId);
          if (intervalId) {
            clearInterval(intervalId);
            intervalIdsRef.current.delete(campaignId);
            attemptCountsRef.current.delete(campaignId);
          }
        }
      } catch (error) {
        console.error(`[Bulk Polling] Error for ${campaignId}:`, error);
      }
    };

    // Start polling for each pending campaign
    pendingCampaigns.forEach((campaign) => {
      // Don't start if already polling
      if (!intervalIdsRef.current.has(campaign.id)) {
        attemptCountsRef.current.set(campaign.id, 0);
        
        // Poll immediately
        pollCampaign(campaign.id);
        
        // Then poll on interval
        const intervalId = setInterval(() => pollCampaign(campaign.id), 5000);
        intervalIdsRef.current.set(campaign.id, intervalId);
      }
    });

    // Cleanup: stop polling campaigns that are no longer pending
    intervalIdsRef.current.forEach((intervalId, campaignId) => {
      const stillPending = pendingCampaigns.some((c) => c.id === campaignId);
      if (!stillPending) {
        clearInterval(intervalId);
        intervalIdsRef.current.delete(campaignId);
        attemptCountsRef.current.delete(campaignId);
      }
    });

    // Cleanup on unmount
    return () => {
      intervalIdsRef.current.forEach((intervalId) => clearInterval(intervalId));
      intervalIdsRef.current.clear();
      attemptCountsRef.current.clear();
    };
  }, [campaigns, updateCampaign]);

  return {
    pollingCount: campaigns.filter((c) => c.phoneNumber === "pending").length,
  };
}
