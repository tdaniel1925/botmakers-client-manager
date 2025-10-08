// Voice Campaign Actions - Server actions for voice campaign management

"use server";

import { auth } from "@clerk/nextjs/server";
import { isPlatformAdmin } from "@/db/queries/platform-queries";
import {
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignById,
  getCampaignsByProject,
  getActiveCampaignsByProject,
  updateCampaignStatus,
  incrementCampaignCallCount,
  getCampaignAnalytics,
  createCampaignProviderMetadata,
} from "@/db/queries/voice-campaigns-queries";
import { createWebhook } from "@/db/queries/calls-queries";
import { generateCampaignConfig } from "@/lib/ai-campaign-generator";
import { getVoiceProvider } from "@/lib/voice-providers/provider-factory";
import { withTransaction } from "@/lib/campaign-transaction";
import { nanoid } from "nanoid";
import type { CampaignSetupAnswers } from "@/types/voice-campaign-types";
import { getActiveSubscription, getPlanById } from "@/db/queries/billing-queries";
import { getProjectById } from "@/db/queries/projects-queries";
import { checkUsageLimit } from "@/lib/billing/usage-tracker";

// ===== CREATE CAMPAIGN =====

export async function createVoiceCampaignAction(
  projectId: string,
  provider: "vapi" | "autocalls" | "synthflow" | "retell",
  setupAnswers: CampaignSetupAnswers
) {
  try {
    console.log("[Campaign] Starting creation with transaction...", { projectId, provider });
    
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can create voice campaigns" };
    }
    
    // ===== SUBSCRIPTION & USAGE CHECKS =====
    // Get project to find organization
    const project = await getProjectById(projectId);
    if (!project || !project.organizationId) {
      return { error: "Project not found or not associated with an organization" };
    }
    
    // Check billing type - if admin_free, skip all subscription checks
    const billingType = setupAnswers.billing_type || "billable";
    const isAdminFreeCampaign = billingType === "admin_free" && isAdmin;
    
    if (!isAdminFreeCampaign) {
      // Only run subscription checks for billable campaigns
      
      // Check if organization has an active subscription
      const subscription = await getActiveSubscription(project.organizationId);
      if (!subscription) {
        return { 
          error: "No active subscription found. Please select a subscription plan to create campaigns.",
          requiresSubscription: true,
        };
      }
      
      // Check usage limits
      const usageStatus = await checkUsageLimit(project.organizationId);
      if (!usageStatus || !usageStatus.canMakeCalls) {
        return { 
          error: "Your subscription is not active. Please update your payment method or contact support.",
        };
      }
      
      // Check campaign limit based on plan
      const plan = await getPlanById(subscription.planId);
      if (plan) {
        const activeCampaigns = await getActiveCampaignsByProject(projectId);
        const campaignLimit = plan.maxActiveCampaigns;
        
        if (campaignLimit !== -1 && activeCampaigns.length >= campaignLimit) {
          return { 
            error: `Campaign limit reached (${campaignLimit} active campaigns). Please upgrade your plan to create more campaigns.`,
            requiresUpgrade: true,
          };
        }
      }
      
      console.log(`[Campaign] Subscription check passed for org ${project.organizationId}: ${usageStatus.minutesRemaining} minutes remaining`);
    } else {
      console.log(`[Campaign] Admin-free campaign - skipping subscription checks for org ${project.organizationId}`);
    }
    
    // Execute campaign creation within a transaction context
    // Resources will be automatically rolled back if any step fails
    const result = await withTransaction(async (transaction) => {
      // Step 1: Generate AI configuration
      console.log("[Campaign] Generating AI config...");
      const aiConfig = await generateCampaignConfig(setupAnswers);
      
      // Step 2: Create webhook for this campaign
      console.log("[Campaign] Creating webhook...");
      const webhook = await createWebhook({
        projectId,
        label: `Voice Campaign: ${setupAnswers.campaign_name}`,
        webhookToken: `wh_${nanoid(32)}`,
        apiKey: `sk_${nanoid(32)}`,
        createdBy: userId,
        isActive: true,
      });
      
      // Track webhook for rollback
      transaction.track({ type: "webhook", id: webhook.id });
      
      const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/calls/${webhook.webhookToken}`;
      
      // Step 3: Create agent with provider
      console.log("[Campaign] Creating agent with provider...");
      const providerInstance = getVoiceProvider(provider);
      const agent = await providerInstance.createAgent(setupAnswers, aiConfig, webhookUrl);
      
      // Track agent for rollback
      transaction.track({ type: "agent", id: agent.id, provider });
      
      // Step 4: Get or provision phone number
      console.log("[Campaign] Setting up phone number...");
      const phoneSource = (setupAnswers as any).phone_source || "vapi";
      console.log("[Campaign] Phone source:", phoneSource);
      
      let phoneNumber;
      if (phoneSource === "twilio" && (setupAnswers as any).twilio_phone_number) {
        // Use Twilio number (only Vapi supports this currently)
        if (provider === "vapi") {
          console.log("[Campaign] Using Twilio number:", (setupAnswers as any).twilio_phone_number);
          const vapiProvider = providerInstance as any; // Cast to access registerTwilioNumber
          phoneNumber = await vapiProvider.registerTwilioNumber(
            agent.id,
            (setupAnswers as any).twilio_phone_number,
            process.env.TWILIO_ACCOUNT_SID!,
            process.env.TWILIO_AUTH_TOKEN!,
            setupAnswers.campaign_name
          );
          console.log("[Campaign] Twilio number registered:", phoneNumber);
        } else {
          throw new Error(`Provider ${provider} does not support Twilio numbers yet`);
        }
      } else {
        // Provision new number from provider
        const areaCode = setupAnswers.area_code?.trim() || undefined;
        console.log("[Campaign] Provisioning new number with area code:", areaCode);
        phoneNumber = await providerInstance.provisionPhoneNumber(
          agent.id,
          areaCode,
          setupAnswers.campaign_name
        );
        console.log("[Campaign] Phone number provisioned:", phoneNumber);
      }
      
      // Track phone number for rollback
      transaction.track({ type: "phoneNumber", id: phoneNumber.id, provider });

      // Step 5: Store campaign in database
      console.log("[Campaign] Saving to database...");
      const campaign = await createCampaign({
        projectId,
        webhookId: webhook.id,
        name: setupAnswers.campaign_name,
        description: setupAnswers.business_context,
        campaignType: setupAnswers.campaign_type,
        status: "pending", // Awaiting launch confirmation
        billingType: billingType, // "admin_free" or "billable"
        provider,
        providerAssistantId: agent.id,
        providerPhoneNumberId: phoneNumber.id,
        phoneNumber: phoneNumber.number,
        setupAnswers: setupAnswers as any,
        aiGeneratedConfig: aiConfig as any,
        providerConfig: agent.metadata as any,
        campaignGoal: setupAnswers.campaign_goal,
        agentPersonality: setupAnswers.agent_personality,
        systemPrompt: aiConfig.systemPrompt,
        firstMessage: aiConfig.firstMessage,
        voicemailMessage: aiConfig.voicemailMessage,
        scheduleConfig: setupAnswers.schedule_config as any, // Call scheduling configuration
        isActive: false, // Not active until launched
        createdBy: userId,
      });
      
      // Step 6: Store provider-specific metadata
      await createCampaignProviderMetadata({
        campaignId: campaign.id,
        provider,
        metadata: {
          agentId: agent.id,
          phoneNumberId: phoneNumber.id,
          webhookUrl,
          fullAgentConfig: agent.metadata,
        } as any,
      });
      
      console.log("[Campaign] Successfully created:", campaign.id);
      
      return {
        campaign,
        phoneNumber: phoneNumber.number,
        agentId: agent.id,
      };
    });
    
    return {
      success: true,
      ...result,
    };
    
  } catch (error: any) {
    console.error("[Campaign] Creation error (rollback triggered):", error);
    return { 
      error: error.message || "Failed to create voice campaign",
      details: error.toString()
    };
  }
}

// ===== GET CAMPAIGNS =====

export async function getCampaignsForProjectAction(projectId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const campaigns = await getCampaignsByProject(projectId);
    return { campaigns };
  } catch (error) {
    console.error("[Campaign] Get campaigns error:", error);
    return { error: "Failed to get campaigns" };
  }
}

export async function getActiveCampaignsForProjectAction(projectId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const campaigns = await getActiveCampaignsByProject(projectId);
    return { campaigns };
  } catch (error) {
    console.error("[Campaign] Get active campaigns error:", error);
    return { error: "Failed to get active campaigns" };
  }
}

export async function getCampaignByIdAction(campaignId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return { error: "Campaign not found" };
    }
    
    return { campaign };
  } catch (error) {
    console.error("[Campaign] Get campaign error:", error);
    return { error: "Failed to get campaign" };
  }
}

// ===== UPDATE CAMPAIGN =====

export async function updateCampaignAction(
  campaignId: string,
  updates: {
    name?: string;
    description?: string;
    status?: "draft" | "active" | "paused" | "completed" | "failed";
    isActive?: boolean;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can update campaigns" };
    }
    
    const campaign = await updateCampaign(campaignId, updates);
    
    if (!campaign) {
      return { error: "Campaign not found" };
    }
    
    return { campaign };
  } catch (error) {
    console.error("[Campaign] Update error:", error);
    return { error: "Failed to update campaign" };
  }
}

export async function pauseCampaignAction(campaignId: string) {
  return updateCampaignAction(campaignId, { 
    status: "paused",
    isActive: false 
  });
}

export async function resumeCampaignAction(campaignId: string) {
  return updateCampaignAction(campaignId, { 
    status: "active",
    isActive: true 
  });
}

/**
 * Update campaign configuration and sync to provider
 */
export async function updateCampaignConfigAction(
  campaignId: string,
  config: {
    name?: string;
    description?: string;
    campaignType?: "inbound" | "outbound";
    isActive?: boolean;
    campaignGoal?: string;
    systemPrompt?: string;
    firstMessage?: string;
    voicemailMessage?: string;
    agentPersonality?: string;
    voicePreference?: string;
    mustCollect?: string[];
    scheduleConfig?: any;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can update campaign configuration" };
    }
    
    // Get existing campaign
    const existingCampaign = await getCampaignById(campaignId);
    if (!existingCampaign) {
      return { error: "Campaign not found" };
    }
    
    console.log("[Campaign Config] Updating campaign:", campaignId);
    
    // Update database first
    const dbUpdates: any = {};
    if (config.name !== undefined) dbUpdates.name = config.name;
    if (config.description !== undefined) dbUpdates.description = config.description;
    if (config.campaignType !== undefined) dbUpdates.campaignType = config.campaignType;
    if (config.isActive !== undefined) dbUpdates.isActive = config.isActive;
    if (config.campaignGoal !== undefined) dbUpdates.campaignGoal = config.campaignGoal;
    if (config.systemPrompt !== undefined) dbUpdates.systemPrompt = config.systemPrompt;
    if (config.firstMessage !== undefined) dbUpdates.firstMessage = config.firstMessage;
    if (config.voicemailMessage !== undefined) dbUpdates.voicemailMessage = config.voicemailMessage;
    if (config.agentPersonality !== undefined) dbUpdates.agentPersonality = config.agentPersonality;
    if (config.scheduleConfig !== undefined) dbUpdates.scheduleConfig = config.scheduleConfig;
    
    // Update setup answers if provided
    if (config.voicePreference || config.mustCollect) {
      const currentSetupAnswers = existingCampaign.setupAnswers as any || {};
      dbUpdates.setupAnswers = {
        ...currentSetupAnswers,
        ...(config.voicePreference && { voice_preference: config.voicePreference }),
        ...(config.mustCollect && { must_collect: config.mustCollect }),
      };
    }
    
    await updateCampaign(campaignId, dbUpdates);
    
    // Sync to provider if agent config changed
    if (config.systemPrompt || config.firstMessage || config.voicemailMessage) {
      console.log("[Campaign Config] Syncing to provider:", existingCampaign.provider);
      
      try {
        const providerInstance = getVoiceProvider(existingCampaign.provider as any);
        
        // Check if provider has updateAgent method
        if (existingCampaign.providerAssistantId) {
          await providerInstance.updateAgent(existingCampaign.providerAssistantId, {
            name: config.name,
            systemPrompt: config.systemPrompt,
            firstMessage: config.firstMessage,
            voicemailMessage: config.voicemailMessage,
          });
          
          console.log("[Campaign Config] Successfully synced to provider");
        }
      } catch (providerError) {
        console.error("[Campaign Config] Provider sync error:", providerError);
        // Don't fail the whole operation if provider sync fails
        // The database is updated, provider can be manually synced later
        return { 
          warning: "Campaign updated but provider sync failed. Changes may take effect after a few minutes.",
        };
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("[Campaign Config] Update error:", error);
    return { error: error.message || "Failed to update campaign configuration" };
  }
}

// ===== DUPLICATE CAMPAIGN =====

export async function duplicateCampaignAction(
  campaignId: string,
  options: {
    newName: string;
    provisionNewPhoneNumber?: boolean;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can duplicate campaigns" };
    }
    
    // Get original campaign
    const originalCampaign = await getCampaignById(campaignId);
    if (!originalCampaign) {
      return { error: "Campaign not found" };
    }
    
    console.log("[Campaign] Duplicating campaign:", campaignId);
    
    // Prepare new campaign data
    const newCampaignData: any = {
      projectId: originalCampaign.projectId,
      name: options.newName,
      description: originalCampaign.description,
      provider: originalCampaign.provider,
      campaignType: originalCampaign.campaignType,
      campaignGoal: originalCampaign.campaignGoal,
      systemPrompt: originalCampaign.systemPrompt,
      firstMessage: originalCampaign.firstMessage,
      voicemailMessage: originalCampaign.voicemailMessage,
      agentPersonality: originalCampaign.agentPersonality,
      setupAnswers: originalCampaign.setupAnswers,
      status: "draft", // Start as draft
      isActive: false,
    };
    
    // Handle phone number
    if (options.provisionNewPhoneNumber) {
      // Will provision new number
      newCampaignData.phoneNumber = "pending";
      newCampaignData.providerPhoneNumberId = null;
    } else {
      // Share existing number
      newCampaignData.phoneNumber = originalCampaign.phoneNumber;
      newCampaignData.providerPhoneNumberId = originalCampaign.providerPhoneNumberId;
    }
    
    // Create new webhook for the duplicated campaign
    const webhook = await createWebhook(
      originalCampaign.projectId,
      `${options.newName} Webhook`,
      `Webhook for duplicated campaign: ${options.newName}`
    );
    
    newCampaignData.webhookId = webhook.id;
    
    // Create agent on provider
    const providerInstance = getVoiceProvider(originalCampaign.provider as any);
    
    const agent = await providerInstance.createAgent({
      name: options.newName,
      systemPrompt: originalCampaign.systemPrompt,
      firstMessage: originalCampaign.firstMessage,
      model: originalCampaign.setupAnswers?.model || "gpt-4",
      voice: originalCampaign.setupAnswers?.voice_preference || "auto",
    });
    
    newCampaignData.providerAssistantId = agent.id;
    
    // Provision new phone number if requested
    if (options.provisionNewPhoneNumber) {
      try {
        const phoneNumber = await providerInstance.provisionPhoneNumber(agent.id);
        newCampaignData.phoneNumber = phoneNumber.number;
        newCampaignData.providerPhoneNumberId = phoneNumber.id;
      } catch (phoneError) {
        console.error("[Campaign] Phone provisioning error:", phoneError);
        // Continue with pending status
        newCampaignData.phoneNumber = "pending";
      }
    }
    
    // Create campaign in database
    const newCampaign = await createCampaign(newCampaignData);
    
    console.log("[Campaign] Successfully duplicated campaign:", newCampaign.id);
    
    return { campaign: newCampaign };
  } catch (error: any) {
    console.error("[Campaign] Duplication error:", error);
    return { error: error.message || "Failed to duplicate campaign" };
  }
}

// ===== BULK OPERATIONS =====

export async function bulkPauseCampaignsAction(campaignIds: string[]) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can perform bulk operations" };
    }
    
    console.log("[Campaign] Bulk pausing campaigns:", campaignIds.length);
    
    let successful = 0;
    let failed = 0;
    
    for (const campaignId of campaignIds) {
      try {
        await updateCampaign(campaignId, {
          status: "paused",
          isActive: false,
        });
        successful++;
      } catch (error) {
        console.error(`[Campaign] Failed to pause campaign ${campaignId}:`, error);
        failed++;
      }
    }
    
    return { successful, failed };
  } catch (error) {
    console.error("[Campaign] Bulk pause error:", error);
    return { error: "Failed to pause campaigns" };
  }
}

export async function bulkResumeCampaignsAction(campaignIds: string[]) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can perform bulk operations" };
    }
    
    console.log("[Campaign] Bulk resuming campaigns:", campaignIds.length);
    
    let successful = 0;
    let failed = 0;
    
    for (const campaignId of campaignIds) {
      try {
        await updateCampaign(campaignId, {
          status: "active",
          isActive: true,
        });
        successful++;
      } catch (error) {
        console.error(`[Campaign] Failed to resume campaign ${campaignId}:`, error);
        failed++;
      }
    }
    
    return { successful, failed };
  } catch (error) {
    console.error("[Campaign] Bulk resume error:", error);
    return { error: "Failed to resume campaigns" };
  }
}

export async function bulkDeleteCampaignsAction(campaignIds: string[]) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can perform bulk operations" };
    }
    
    console.log("[Campaign] Bulk deleting campaigns:", campaignIds.length);
    
    let successful = 0;
    let failed = 0;
    
    for (const campaignId of campaignIds) {
      try {
        const result = await deleteCampaignAction(campaignId);
        if (result.error) {
          failed++;
        } else {
          successful++;
        }
      } catch (error) {
        console.error(`[Campaign] Failed to delete campaign ${campaignId}:`, error);
        failed++;
      }
    }
    
    return { successful, failed };
  } catch (error) {
    console.error("[Campaign] Bulk delete error:", error);
    return { error: "Failed to delete campaigns" };
  }
}

// ===== DELETE CAMPAIGN =====

export async function deleteCampaignAction(campaignId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can delete campaigns" };
    }
    
    // Get campaign details before deletion
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return { error: "Campaign not found" };
    }
    
    // Clean up provider resources
    try {
      const providerInstance = getVoiceProvider(campaign.provider);
      
      // Release phone number
      if (campaign.providerPhoneNumberId) {
        console.log("[Campaign] Releasing phone number:", campaign.providerPhoneNumberId);
        await providerInstance.releasePhoneNumber(campaign.providerPhoneNumberId);
      }
      
      // Delete agent/assistant
      if (campaign.providerAssistantId) {
        console.log("[Campaign] Deleting agent:", campaign.providerAssistantId);
        await providerInstance.deleteAgent(campaign.providerAssistantId);
      }
    } catch (providerError) {
      console.error("[Campaign] Provider cleanup error:", providerError);
      // Continue with database deletion even if provider cleanup fails
    }
    
    // Permanently delete from database
    await deleteCampaign(campaignId);
    
    console.log("[Campaign] Deleted campaign:", campaignId);
    
    return { success: true };
  } catch (error) {
    console.error("[Campaign] Delete error:", error);
    return { error: "Failed to delete campaign" };
  }
}


// ===== CAMPAIGN STATS =====

export async function getCampaignAnalyticsAction(projectId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const analytics = await getCampaignAnalytics(projectId);
    return { analytics };
  } catch (error) {
    console.error("[Campaign] Analytics error:", error);
    return { error: "Failed to get campaign analytics" };
  }
}

export async function recordCampaignCallAction(
  campaignId: string,
  success: boolean = true
) {
  try {
    await incrementCampaignCallCount(campaignId, success);
    return { success: true };
  } catch (error) {
    console.error("[Campaign] Record call error:", error);
    return { error: "Failed to record call" };
  }
}

// ===== TEST CAMPAIGN =====

export async function testCampaignAction(
  campaignId: string,
  testPhoneNumber: string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can test campaigns" };
    }
    
    const campaign = await getCampaignById(campaignId);
    if (!campaign || !campaign.providerAssistantId) {
      return { error: "Campaign not found or not configured" };
    }
    
    const providerInstance = getVoiceProvider(campaign.provider);
    
    if (!providerInstance.initiateTestCall) {
      return { error: "Test calls not supported by this provider" };
    }
    
    const result = await providerInstance.initiateTestCall(
      campaign.providerAssistantId,
      testPhoneNumber
    );
    
    return { success: true, callId: result.callId, status: result.status };
  } catch (error: any) {
    console.error("[Campaign] Test call error:", error);
    return { error: error.message || "Failed to initiate test call" };
  }
}

// ===== VERIFY & FIX PHONE WEBHOOK =====

export async function verifyPhoneWebhookAction(campaignId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can verify webhooks" };
    }
    
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return { error: "Campaign not found" };
    }
    
    // Only works for Vapi + Twilio campaigns
    if (campaign.provider !== "vapi" || !campaign.phoneNumber?.startsWith("+")) {
      return { error: "This feature is only available for Vapi campaigns using Twilio numbers" };
    }
    
    const { getTwilioNumberSid, getTwilioNumberDetails, updateTwilioNumberWebhook } = await import("@/lib/twilio-client");
    
    // Get Twilio SID
    const twilioSid = await getTwilioNumberSid(campaign.phoneNumber);
    if (!twilioSid) {
      return { error: `Could not find Twilio number: ${campaign.phoneNumber}` };
    }
    
    // Get current webhook configuration
    const numberDetails = await getTwilioNumberDetails(twilioSid);
    if (!numberDetails) {
      return { error: "Could not retrieve Twilio number details" };
    }
    
    // Expected Vapi webhook URL - use generic Twilio endpoint
    // Vapi routes calls based on phone number to the correct assistant
    const expectedWebhookUrl = `https://api.vapi.ai/twilio/inbound_call`;
    
    // Check if webhook is correctly configured
    const isCorrect = numberDetails.voiceUrl === expectedWebhookUrl;
    
    if (isCorrect) {
      // Already configured correctly
      return {
        success: true,
        alreadyCorrect: true,
        message: "✅ Phone number is correctly configured!",
        details: {
          phoneNumber: campaign.phoneNumber,
          currentWebhook: numberDetails.voiceUrl,
          expectedWebhook: expectedWebhookUrl,
        }
      };
    } else {
      // Need to update
      console.log("[Webhook Verify] Updating webhook from:", numberDetails.voiceUrl, "to:", expectedWebhookUrl);
      
      await updateTwilioNumberWebhook(twilioSid, expectedWebhookUrl, 'POST');
      
      return {
        success: true,
        wasUpdated: true,
        message: "✅ Phone number webhook has been updated to point to Vapi!",
        details: {
          phoneNumber: campaign.phoneNumber,
          oldWebhook: numberDetails.voiceUrl || "(not set)",
          newWebhook: expectedWebhookUrl,
        }
      };
    }
  } catch (error: any) {
    console.error("[Webhook Verify] Error:", error);
    return { error: error.message || "Failed to verify phone webhook" };
  }
}

// ===== LAUNCH CAMPAIGN =====

/**
 * Launch a campaign (change status from pending to active)
 * Requires confirmation before launching
 */
export async function launchCampaignAction(campaignId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return { error: "Campaign not found" };
    }

    // Verify campaign is in pending status
    if (campaign.status !== "pending") {
      return {
        error: `Campaign is currently ${campaign.status}. Only pending campaigns can be launched.`
      };
    }

    // Update campaign status to active
    await updateCampaignStatus(campaignId, "active");
    
    // Set campaign as active
    await updateCampaign(campaignId, { isActive: true });

    console.log(`[Campaign] Launched campaign ${campaignId}`);

    return {
      success: true,
      message: "Campaign launched successfully!",
      campaign: await getCampaignById(campaignId)
    };
  } catch (error: any) {
    console.error("[Campaign Launch] Error:", error);
    return { error: error.message || "Failed to launch campaign" };
  }
}
