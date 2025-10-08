"use server";

import { auth } from "@clerk/nextjs/server";
import { getCampaignById, updateCampaign } from "@/db/queries/voice-campaigns-queries";
import { getVoiceProvider } from "@/lib/voice-providers/provider-factory";

/**
 * Refresh a campaign's phone number status from the provider
 * Useful for campaigns with "pending" phone numbers
 */
export async function refreshCampaignPhoneNumberAction(campaignId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }

    console.log("[Refresh] Fetching campaign:", campaignId);
    const campaign = await getCampaignById(campaignId);
    
    if (!campaign) {
      return { isSuccess: false, message: "Campaign not found" };
    }

    // If already has a real number, no need to refresh
    if (campaign.phoneNumber && campaign.phoneNumber !== "pending") {
      return { 
        isSuccess: true, 
        message: "Phone number already active",
        phoneNumber: campaign.phoneNumber 
      };
    }

    console.log("[Refresh] Checking phone number status with provider:", campaign.provider);
    
    // Get provider instance
    const providerInstance = getVoiceProvider(campaign.provider as any);
    
    // Fetch phone number details from provider
    if (campaign.providerPhoneNumberId) {
      try {
        const phoneDetails = await providerInstance.makeRequest<any>(
          `/phone-number/${campaign.providerPhoneNumberId}`
        );
        
        console.log("[Refresh] Phone number details from provider:", JSON.stringify(phoneDetails, null, 2));
        
        // Check if number is now available
        const phoneNumber = phoneDetails.number || phoneDetails.phoneNumber;
        
        if (phoneNumber && phoneNumber !== "pending") {
          // Update the campaign with the new phone number
          await updateCampaign(campaignId, {
            phoneNumber: phoneNumber
          });
          
          console.log("[Refresh] Updated campaign with phone number:", phoneNumber);
          
          return {
            isSuccess: true,
            message: "Phone number updated successfully",
            phoneNumber: phoneNumber
          };
        } else {
          return {
            isSuccess: true,
            message: "Phone number still pending provisioning. Please try again in a few moments.",
            phoneNumber: "pending"
          };
        }
      } catch (error: any) {
        console.error("[Refresh] Error fetching phone number:", error);
        return {
          isSuccess: false,
          message: `Failed to fetch phone number: ${error.message}`
        };
      }
    }

    return {
      isSuccess: false,
      message: "No phone number ID found for this campaign"
    };

  } catch (error: any) {
    console.error("[Refresh] Error:", error);
    return {
      isSuccess: false,
      message: error.message || "Failed to refresh phone number"
    };
  }
}
