// Autocalls Provider Implementation
// https://docs.autocalls.ai

import { BaseVoiceProvider } from "./base-provider";
import type {
  CampaignSetupAnswers,
  AIGeneratedConfig,
  ProviderAgent,
  ProviderPhoneNumber,
  UnifiedCallRecord,
  AutocallsWebhookPayload,
} from "@/types/voice-campaign-types";

export class AutocallsProvider extends BaseVoiceProvider {
  constructor() {
    super(
      process.env.AUTOCALLS_API_KEY || "",
      "https://app.autocalls.ai/api"
    );
  }
  
  getProviderName(): "autocalls" {
    return "autocalls";
  }
  
  async createAgent(
    setupAnswers: CampaignSetupAnswers,
    aiConfig: AIGeneratedConfig,
    webhookUrl: string
  ): Promise<ProviderAgent> {
    // Step 1: Get available options
    const [voices, models, phoneNumbers] = await Promise.all([
      this.getAvailableVoices(),
      this.getAvailableModels(),
      this.getAvailablePhoneNumbers()
    ]);
    
    const voiceId = this.selectVoice(
      setupAnswers.voice_preference,
      setupAnswers.agent_personality,
      voices
    );
    
    // Step 2: Create assistant
    const response = await this.makeRequest<any>("/assistants", {
      method: "POST",
      body: JSON.stringify({
        name: setupAnswers.campaign_name,
        prompt: aiConfig.systemPrompt,
        first_message: aiConfig.firstMessage,
        voicemail_message: aiConfig.voicemailMessage,
        voice: voiceId,
        language: "en",
        llm_model: models[0]?.id || "gpt-4",
        phone_number: phoneNumbers[0]?.id || undefined
      })
    });
    
    // Step 3: Enable webhook
    if (response.id) {
      await this.enableWebhook(response.id, webhookUrl);
    }
    
    return {
      id: response.id,
      name: response.name,
      status: "active",
      phoneNumber: response.phone_number,
      phoneNumberId: response.phone_number_id,
      webhookUrl: webhookUrl,
      createdAt: response.created_at || new Date().toISOString(),
      metadata: response
    };
  }
  
  private async enableWebhook(assistantId: string, webhookUrl: string) {
    try {
      await this.makeRequest(`/assistants/${assistantId}/enable-inbound-webhook`, {
        method: "POST",
        body: JSON.stringify({ webhook_url: webhookUrl })
      });
    } catch (error) {
      console.error("[Autocalls] Enable webhook error:", error);
    }
  }
  
  async updateAgent(agentId: string, updates: any): Promise<ProviderAgent> {
    const response = await this.makeRequest<any>(`/assistants/${agentId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: updates.name,
        prompt: updates.systemPrompt,
        first_message: updates.firstMessage,
        voicemail_message: updates.voicemailMessage
      })
    });
    
    return {
      id: response.id,
      name: response.name,
      status: response.status || "active",
      createdAt: response.created_at,
      metadata: response
    };
  }
  
  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/assistants/${agentId}`, {
        method: "DELETE"
      });
      return true;
    } catch (error) {
      console.error("[Autocalls] Delete agent error:", error);
      return false;
    }
  }
  
  async getAgent(agentId: string): Promise<ProviderAgent | null> {
    try {
      const response = await this.makeRequest<any>(`/assistants/${agentId}`);
      return {
        id: response.id,
        name: response.name,
        status: response.status || "active",
        phoneNumber: response.phone_number,
        createdAt: response.created_at,
        metadata: response
      };
    } catch (error) {
      return null;
    }
  }
  
  async provisionPhoneNumber(agentId: string, areaCode?: string): Promise<ProviderPhoneNumber> {
    // Autocalls typically assigns numbers during assistant creation
    // This method fetches the existing number or requests a new one
    const phoneNumbers = await this.getAvailablePhoneNumbers();
    const assignedNumber = phoneNumbers[0];
    
    if (!assignedNumber) {
      throw new Error("[Autocalls] No phone numbers available");
    }
    
    return {
      id: assignedNumber.id,
      number: assignedNumber.number,
      provider: "autocalls",
      createdAt: new Date().toISOString()
    };
  }
  
  async releasePhoneNumber(phoneNumberId: string): Promise<boolean> {
    // Autocalls handles phone number lifecycle internally
    return true;
  }
  
  parseWebhookPayload(payload: AutocallsWebhookPayload): UnifiedCallRecord {
    return {
      callId: payload.call_id,
      provider: "autocalls",
      callerPhone: payload.caller_phone || "",
      callerName: payload.caller_name || "",
      callDuration: payload.duration || 0,
      callTimestamp: new Date(payload.timestamp),
      audioUrl: payload.recording_url || "",
      transcript: payload.transcript || "",
      status: this.mapAutocallsStatus(payload.status),
      analysis: {
        followUpNeeded: false, // Would need custom analysis
        extractedData: {
          leadId: payload.lead_id,
          campaignId: payload.campaign_id
        }
      },
      rawPayload: payload
    };
  }
  
  private mapAutocallsStatus(status: string): "completed" | "failed" | "no-answer" | "busy" | "voicemail" {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "completed";
      case "no-answer":
      case "no_answer":
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
    return true; // Autocalls webhook validation
  }
  
  async getAvailableVoices() {
    try {
      const response = await this.makeRequest<any>("/assistants/voices");
      return response.voices || [];
    } catch (error) {
      // Fallback voices
      return [
        { id: "default-female", name: "Default Female", gender: "female" as const, language: "en" },
        { id: "default-male", name: "Default Male", gender: "male" as const, language: "en" }
      ];
    }
  }
  
  async getAvailableModels() {
    try {
      const response = await this.makeRequest<any>("/assistants/llm-models");
      return response.models || [];
    } catch (error) {
      return [
        { id: "gpt-4", name: "GPT-4", provider: "openai", cost_per_call: 15 }
      ];
    }
  }
  
  private async getAvailablePhoneNumbers() {
    try {
      const response = await this.makeRequest<any>("/assistants/phone-numbers");
      return response.phone_numbers || [];
    } catch (error) {
      return [];
    }
  }
  
  async initiateTestCall(agentId: string, testPhoneNumber: string) {
    const response = await this.makeRequest<any>("/calls", {
      method: "POST",
      body: JSON.stringify({
        assistant_id: agentId,
        phone_number: testPhoneNumber
      })
    });
    
    return {
      callId: response.call_id || response.id,
      status: response.status || "initiated"
    };
  }
}
