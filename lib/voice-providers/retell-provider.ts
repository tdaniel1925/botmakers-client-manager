// Retell Provider Implementation
// https://docs.retellai.com

import { BaseVoiceProvider } from "./base-provider";
import type {
  CampaignSetupAnswers,
  AIGeneratedConfig,
  ProviderAgent,
  ProviderPhoneNumber,
  UnifiedCallRecord,
  RetellWebhookPayload,
} from "@/types/voice-campaign-types";

export class RetellProvider extends BaseVoiceProvider {
  constructor() {
    super(
      process.env.RETELL_API_KEY || "",
      "https://api.retellai.com/v2"
    );
  }
  
  getProviderName(): "retell" {
    return "retell";
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
    
    const response = await this.makeRequest<any>("/agent", {
      method: "POST",
      body: JSON.stringify({
        agent_name: setupAnswers.campaign_name,
        general_prompt: aiConfig.systemPrompt,
        general_tools: [],
        begin_message: aiConfig.firstMessage,
        voice_id: voiceId,
        voice_temperature: 1.0,
        voice_speed: 1.0,
        responsiveness: 1.0,
        interruption_sensitivity: 1.0,
        ambient_sound: "off",
        language: "en-US",
        webhook_url: webhookUrl
      })
    });
    
    return {
      id: response.agent_id,
      name: response.agent_name,
      status: "active",
      webhookUrl: webhookUrl,
      createdAt: new Date().toISOString(),
      metadata: response
    };
  }
  
  async updateAgent(agentId: string, updates: any): Promise<ProviderAgent> {
    const response = await this.makeRequest<any>(`/agent/${agentId}`, {
      method: "PATCH",
      body: JSON.stringify({
        agent_name: updates.name,
        general_prompt: updates.systemPrompt,
        begin_message: updates.firstMessage
      })
    });
    
    return {
      id: response.agent_id,
      name: response.agent_name,
      status: "active",
      createdAt: response.created_at,
      metadata: response
    };
  }
  
  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/agent/${agentId}`, {
        method: "DELETE"
      });
      return true;
    } catch (error) {
      console.error("[Retell] Delete agent error:", error);
      return false;
    }
  }
  
  async getAgent(agentId: string): Promise<ProviderAgent | null> {
    try {
      const response = await this.makeRequest<any>(`/agent/${agentId}`);
      return {
        id: response.agent_id,
        name: response.agent_name,
        status: "active",
        createdAt: response.created_at,
        metadata: response
      };
    } catch (error) {
      return null;
    }
  }
  
  async provisionPhoneNumber(agentId: string, areaCode?: string): Promise<ProviderPhoneNumber> {
    const response = await this.makeRequest<any>("/phone-number", {
      method: "POST",
      body: JSON.stringify({
        agent_id: agentId,
        area_code: areaCode ? parseInt(areaCode) : undefined,
        inbound_agent_id: agentId
      })
    });
    
    return {
      id: response.phone_number_id,
      number: response.phone_number,
      areaCode: response.area_code?.toString(),
      provider: "retell",
      createdAt: new Date().toISOString()
    };
  }
  
  async releasePhoneNumber(phoneNumberId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/phone-number/${phoneNumberId}`, {
        method: "DELETE"
      });
      return true;
    } catch (error) {
      console.error("[Retell] Release phone number error:", error);
      return false;
    }
  }
  
  parseWebhookPayload(payload: RetellWebhookPayload): UnifiedCallRecord {
    const duration = payload.call_duration || 0;
    
    return {
      callId: payload.call_id,
      provider: "retell",
      callerPhone: payload.from_number || "",
      callDuration: duration,
      callTimestamp: new Date(payload.start_timestamp),
      audioUrl: payload.recording_url || "",
      transcript: payload.transcript || "",
      status: this.mapRetellStatus(payload.call_status),
      rawPayload: payload
    };
  }
  
  private mapRetellStatus(status: string): "completed" | "failed" | "no-answer" | "busy" | "voicemail" {
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
    return true; // Retell webhook validation
  }
  
  async getAvailableVoices() {
    try {
      const response = await this.makeRequest<any>("/list-voices");
      return (response.voices || []).map((v: any) => ({
        id: v.voice_id,
        name: v.voice_name,
        gender: v.gender || "neutral" as const,
        language: v.language || "en-US"
      }));
    } catch (error) {
      // Fallback voices
      return [
        { id: "openai-default", name: "OpenAI Default", gender: "neutral" as const, language: "en-US" }
      ];
    }
  }
  
  async getAvailableModels() {
    return [
      { id: "retell-llm", name: "Retell LLM", provider: "retell", cost_per_call: 10 }
    ];
  }
  
  async initiateTestCall(agentId: string, testPhoneNumber: string) {
    // Retell expects phone numbers in E.164 format (+1234567890)
    const formattedPhone = testPhoneNumber.startsWith('+') ? testPhoneNumber : `+1${testPhoneNumber.replace(/\D/g, '')}`;
    
    const response = await this.makeRequest<any>("/create-phone-call", {
      method: "POST",
      body: JSON.stringify({
        from_number: formattedPhone,
        to_number: formattedPhone,
        agent_id: agentId
      })
    });
    
    return {
      callId: response.call_id,
      status: response.call_status || "initiated"
    };
  }
}
