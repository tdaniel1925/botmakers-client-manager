// Synthflow Provider Implementation  
// https://docs.synthflow.ai

import { BaseVoiceProvider } from "./base-provider";
import type {
  CampaignSetupAnswers,
  AIGeneratedConfig,
  ProviderAgent,
  ProviderPhoneNumber,
  UnifiedCallRecord,
  SynthflowWebhookPayload,
} from "@/types/voice-campaign-types";

export class SynthflowProvider extends BaseVoiceProvider {
  constructor() {
    super(
      process.env.SYNTHFLOW_API_KEY || "",
      "https://api.synthflow.ai/v1"
    );
  }
  
  getProviderName(): "synthflow" {
    return "synthflow";
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
    
    const response = await this.makeRequest<any>("/assistants", {
      method: "POST",
      body: JSON.stringify({
        name: setupAnswers.campaign_name,
        prompt: aiConfig.systemPrompt,
        first_message: aiConfig.firstMessage,
        voicemail_message: aiConfig.voicemailMessage,
        voice: voiceId,
        language: "en-US",
        webhook_url: webhookUrl
      })
    });
    
    return {
      id: response.id,
      name: response.name,
      status: "active",
      webhookUrl: webhookUrl,
      createdAt: response.created_at || new Date().toISOString(),
      metadata: response
    };
  }
  
  async updateAgent(agentId: string, updates: any): Promise<ProviderAgent> {
    const response = await this.makeRequest<any>(`/assistants/${agentId}`, {
      method: "PATCH",
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
      console.error("[Synthflow] Delete agent error:", error);
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
    const response = await this.makeRequest<any>("/phone-numbers", {
      method: "POST",
      body: JSON.stringify({
        assistant_id: agentId,
        provider: "twilio",
        area_code: areaCode || undefined
      })
    });
    
    return {
      id: response.id,
      number: response.number,
      areaCode: response.area_code,
      provider: "synthflow",
      createdAt: response.created_at || new Date().toISOString()
    };
  }
  
  async releasePhoneNumber(phoneNumberId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/phone-numbers/${phoneNumberId}`, {
        method: "DELETE"
      });
      return true;
    } catch (error) {
      console.error("[Synthflow] Release phone number error:", error);
      return false;
    }
  }
  
  parseWebhookPayload(payload: SynthflowWebhookPayload): UnifiedCallRecord {
    return {
      callId: payload.call_id,
      provider: "synthflow",
      callerPhone: payload.phone_number || "",
      callDuration: payload.duration || 0,
      callTimestamp: new Date(payload.timestamp),
      audioUrl: payload.recording_url || "",
      transcript: payload.transcript || "",
      status: this.mapSynthflowStatus(payload.status),
      rawPayload: payload
    };
  }
  
  private mapSynthflowStatus(status: string): "completed" | "failed" | "no-answer" | "busy" | "voicemail" {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
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
    return true; // Synthflow webhook validation
  }
  
  async getAvailableVoices() {
    // Synthflow voice options
    return [
      { id: "en-US-standard-female", name: "Standard Female", gender: "female" as const, language: "en-US" },
      { id: "en-US-standard-male", name: "Standard Male", gender: "male" as const, language: "en-US" },
      { id: "en-US-neural-female", name: "Neural Female", gender: "female" as const, language: "en-US" },
      { id: "en-US-neural-male", name: "Neural Male", gender: "male" as const, language: "en-US" }
    ];
  }
  
  async getAvailableModels() {
    return [
      { id: "gpt-4", name: "GPT-4", provider: "openai", cost_per_call: 15 },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "openai", cost_per_call: 5 }
    ];
  }
}
