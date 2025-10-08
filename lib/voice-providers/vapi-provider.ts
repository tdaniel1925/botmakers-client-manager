// Vapi Provider Implementation
// https://docs.vapi.ai

import { BaseVoiceProvider } from "./base-provider";
import type {
  CampaignSetupAnswers,
  AIGeneratedConfig,
  ProviderAgent,
  ProviderPhoneNumber,
  UnifiedCallRecord,
  VapiWebhookPayload,
} from "@/types/voice-campaign-types";

export class VapiProvider extends BaseVoiceProvider {
  constructor() {
    super(
      process.env.VAPI_API_KEY || "",
      "https://api.vapi.ai"
    );
  }
  
  getProviderName(): "vapi" {
    return "vapi";
  }
  
  async createAgent(
    setupAnswers: CampaignSetupAnswers,
    aiConfig: AIGeneratedConfig,
    webhookUrl: string
  ): Promise<ProviderAgent> {
    const voices = await this.getAvailableVoices();
    const voiceId = this.selectVoice(
      setupAnswers.voice_preference,
      setupAnswers.agent_personality,
      voices
    );
    
    const response = await this.makeRequest<any>("/assistant", {
      method: "POST",
      body: JSON.stringify({
        name: setupAnswers.campaign_name,
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: aiConfig.systemPrompt
            }
          ]
        },
        voice: {
          provider: "11labs",
          voiceId: voiceId
        },
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en"
        },
        firstMessage: aiConfig.firstMessage,
        voicemailMessage: aiConfig.voicemailMessage,
        endCallPhrases: aiConfig.endCallPhrases,
        server: {
          url: webhookUrl,
          secret: process.env.WEBHOOK_SECRET
        },
        serverMessages: [
          "end-of-call-report",
          "transcript",
          "hang",
          "status-update"
        ],
        analysisPlan: {
          summaryPrompt: "Provide a concise summary of this call",
          structuredDataPrompt: `Extract: ${setupAnswers.must_collect?.join(", ")}`,
          successEvaluationPrompt: `Did the agent achieve the goal: ${setupAnswers.campaign_goal}?`,
          successEvaluationRubric: "NumericScale"
        }
      })
    });
    
    return {
      id: response.id,
      name: response.name,
      status: "active",
      createdAt: response.createdAt,
      metadata: response
    };
  }
  
  async updateAgent(agentId: string, updates: any): Promise<ProviderAgent> {
    // Transform flat updates to VAPI's API structure
    const vapiUpdates: any = {};
    
    // Handle name update
    if (updates.name) {
      vapiUpdates.name = updates.name;
    }
    
    // Handle model/prompt updates - VAPI requires nested structure
    if (updates.systemPrompt) {
      vapiUpdates.model = {
        provider: "openai",
        model: "gpt-4o",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: updates.systemPrompt
          }
        ]
      };
    }
    
    // Handle message updates
    if (updates.firstMessage) {
      vapiUpdates.firstMessage = updates.firstMessage;
    }
    
    if (updates.voicemailMessage) {
      vapiUpdates.voicemailMessage = updates.voicemailMessage;
    }
    
    console.log("[Vapi] Updating assistant:", agentId, "with:", Object.keys(vapiUpdates));
    
    const response = await this.makeRequest<any>(`/assistant/${agentId}`, {
      method: "PATCH",
      body: JSON.stringify(vapiUpdates)
    });
    
    return {
      id: response.id,
      name: response.name,
      status: response.status || "active",
      createdAt: response.createdAt,
      metadata: response
    };
  }
  
  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/assistant/${agentId}`, {
        method: "DELETE"
      });
      return true;
    } catch (error) {
      console.error("[Vapi] Delete agent error:", error);
      return false;
    }
  }
  
  async getAgent(agentId: string): Promise<ProviderAgent | null> {
    try {
      const response = await this.makeRequest<any>(`/assistant/${agentId}`);
      return {
        id: response.id,
        name: response.name,
        status: response.status || "active",
        createdAt: response.createdAt,
        metadata: response
      };
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Register an existing Twilio phone number with Vapi
   */
  async registerTwilioNumber(
    agentId: string,
    twilioPhoneNumber: string,
    twilioAccountSid: string,
    twilioAuthToken: string,
    campaignName?: string
  ): Promise<ProviderPhoneNumber> {
    console.log("[Vapi] Registering Twilio number:", twilioPhoneNumber);
    
    const requestBody = {
      provider: "twilio",
      number: twilioPhoneNumber,
      twilioAccountSid: twilioAccountSid,
      twilioAuthToken: twilioAuthToken,
      assistantId: agentId,
      name: campaignName || "Campaign Phone Number"
    };
    
    console.log("[Vapi] Twilio registration request:", JSON.stringify({ ...requestBody, twilioAuthToken: "***" }));
    
    const response = await this.makeRequest<any>("/phone-number", {
      method: "POST",
      body: JSON.stringify(requestBody)
    });
    
    console.log("[Vapi] Twilio number registered! Response:", JSON.stringify(response, null, 2));
    
    // IMPORTANT: Explicitly update Twilio webhook to point to Vapi's generic Twilio endpoint
    // For Twilio-imported numbers, we must use the generic inbound_call endpoint
    // Vapi will route based on the phone number to the correct assistant (mapped during registration)
    try {
      const { getTwilioNumberSid, updateTwilioNumberWebhook } = await import("@/lib/twilio-client");
      
      // Get the Twilio phone number SID
      const twilioSid = await getTwilioNumberSid(twilioPhoneNumber);
      
      if (twilioSid) {
        // Use Vapi's generic Twilio webhook endpoint (not phone-specific)
        // Vapi routes calls based on the incoming phone number to the correct assistant
        const vapiWebhookUrl = `https://api.vapi.ai/twilio/inbound_call`;
        
        console.log("[Vapi] Updating Twilio webhook to:", vapiWebhookUrl);
        
        // Update the Twilio number's voice webhook
        await updateTwilioNumberWebhook(twilioSid, vapiWebhookUrl, 'POST');
        
        console.log("[Vapi] ✅ Twilio webhook successfully updated! Calls will now route to Vapi.");
      } else {
        console.warn("[Vapi] ⚠️ Could not find Twilio SID for number:", twilioPhoneNumber);
        console.warn("[Vapi] You may need to manually update the webhook in Twilio console");
      }
    } catch (webhookError) {
      console.error("[Vapi] ❌ Failed to update Twilio webhook:", webhookError);
      console.error("[Vapi] Please manually update the webhook in Twilio console to: https://api.vapi.ai/twilio/inbound_call");
    }
    
    return {
      id: response.id,
      number: twilioPhoneNumber, // We know the number immediately with Twilio
      countryCode: "US",
      provider: "twilio",
      createdAt: response.createdAt || new Date().toISOString()
    };
  }

  async provisionPhoneNumber(
    agentId: string,
    areaCode?: string,
    campaignName?: string
  ): Promise<ProviderPhoneNumber> {
    console.log("[Vapi] Provision phone - raw areaCode:", JSON.stringify(areaCode), typeof areaCode);
    
    // Vapi phone number API - correct endpoint: POST /phone-number
    // Using VapiPhoneNumber type (Vapi's managed phone numbers)
    const requestBody: any = {
      provider: "vapi",  // Specifies we want a Vapi-managed number
      assistantId: agentId,
      name: campaignName || "Campaign Phone Number"  // Add a name to identify the number
    };
    
    // Only include area code if it's a valid 3-digit number string
    if (areaCode && areaCode.trim().length === 3 && /^\d{3}$/.test(areaCode.trim())) {
      console.log("[Vapi] Adding valid area code:", areaCode.trim());
      requestBody.areaCode = areaCode.trim();
    } else {
      console.log("[Vapi] No area code specified - Vapi will assign random number");
    }
    
    console.log("[Vapi] Request body:", JSON.stringify(requestBody));
    
    const response = await this.makeRequest<any>("/phone-number", {
      method: "POST",
      body: JSON.stringify(requestBody)
    });
    
    console.log("[Vapi] Phone number provisioned! Response:", JSON.stringify(response, null, 2));
    
    // Vapi doesn't return the phone number in the create response, we need to fetch it
    if (!response.number && response.id) {
      console.log("[Vapi] Fetching phone number details...");
      try {
        const phoneDetails = await this.makeRequest<any>(`/phone-number/${response.id}`);
        console.log("[Vapi] Phone number details:", JSON.stringify(phoneDetails, null, 2));
        
        return {
          id: phoneDetails.id || response.id,
          number: phoneDetails.number || phoneDetails.phoneNumber || "pending",
          countryCode: phoneDetails.countryCode || "US",
          areaCode: phoneDetails.areaCode,
          provider: "vapi",
          createdAt: phoneDetails.createdAt || response.createdAt || new Date().toISOString()
        };
      } catch (fetchError) {
        console.error("[Vapi] Failed to fetch phone number details:", fetchError);
        // Return with pending status if fetch fails
        return {
          id: response.id,
          number: "pending",
          countryCode: "US",
          provider: "vapi",
          createdAt: response.createdAt || new Date().toISOString()
        };
      }
    }
    
    return {
      id: response.id,
      number: response.number || "pending",
      countryCode: response.countryCode || "US",
      areaCode: response.areaCode,
      provider: "vapi",
      createdAt: response.createdAt || new Date().toISOString()
    };
  }
  
  async releasePhoneNumber(phoneNumberId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/phone-number/${phoneNumberId}`, {
        method: "DELETE"
      });
      return true;
    } catch (error) {
      console.error("[Vapi] Release phone number error:", error);
      return false;
    }
  }
  
  parseWebhookPayload(payload: VapiWebhookPayload): UnifiedCallRecord {
    const call = payload.call || {};
    const message = payload.message || {};
    
    return {
      callId: call.id || "",
      provider: "vapi",
      callerPhone: call.customer?.number || "",
      callerName: call.customer?.name || "",
      callDuration: call.endedAt && call.startedAt
        ? Math.floor((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
        : 0,
      callTimestamp: call.startedAt ? new Date(call.startedAt) : new Date(),
      audioUrl: call.recordingUrl || "",
      transcript: call.transcript || "",
      status: this.mapVapiStatus(call.status),
      endReason: call.endedReason,
      analysis: call.analysis ? {
        summary: call.analysis.summary,
        sentiment: call.analysis.sentiment,
        followUpNeeded: call.analysis.successEvaluation < 7,
        extractedData: call.analysis.structuredData
      } : undefined,
      cost: call.costs?.total ? Math.round(call.costs.total * 100) : undefined,
      rawPayload: payload
    };
  }
  
  private mapVapiStatus(status?: string): "completed" | "failed" | "no-answer" | "busy" | "voicemail" {
    switch (status?.toLowerCase()) {
      case "ended":
      case "completed":
        return "completed";
      case "no-answer":
        return "no-answer";
      case "busy":
        return "busy";
      case "voicemail":
        return "voicemail";
      default:
        return "failed";
    }
  }
  
  validateWebhookSignature(payload: any, signature?: string): boolean {
    // Vapi uses server.secret for validation
    // This would be implemented based on Vapi's signature scheme
    return true; // For now, we trust the webhook token validation
  }
  
  async getAvailableVoices() {
    // Vapi supports multiple voice providers
    // This is a subset of popular 11labs voices
    return [
      { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", gender: "female" as const, language: "en" },
      { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", gender: "male" as const, language: "en" },
      { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", gender: "female" as const, language: "en" },
      { id: "VR6AewLTigWG4xSOukaG", name: "Arnold", gender: "male" as const, language: "en" },
    ];
  }
  
  async getAvailableModels() {
    return [
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "openai", cost_per_call: 15 },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "openai", cost_per_call: 5 },
      { id: "claude-3-opus", name: "Claude 3 Opus", provider: "anthropic", cost_per_call: 20 },
    ];
  }
  
  async initiateTestCall(agentId: string, testPhoneNumber: string) {
    // Vapi expects customer to be an object with { number, name? }
    // Ensuring the phone number is in E.164 format (should start with +)
    const formattedPhone = testPhoneNumber.startsWith('+') ? testPhoneNumber : `+1${testPhoneNumber.replace(/\D/g, '')}`;
    
    const response = await this.makeRequest<any>("/call", {
      method: "POST",
      body: JSON.stringify({
        assistantId: agentId,
        customer: {
          number: formattedPhone  // Pass as object with 'number' field
        }
      })
    });
    
    return {
      callId: response.id,
      status: response.status
    };
  }
}
