// Base Provider Interface - Abstract interface all voice providers must implement

import type {
  CampaignSetupAnswers,
  AIGeneratedConfig,
  ProviderAgent,
  ProviderPhoneNumber,
  UnifiedCallRecord,
  WebhookPayload,
} from "@/types/voice-campaign-types";

/**
 * Abstract base class for all voice agent providers
 * Each provider (Vapi, Autocalls, Synthflow, Retell) must implement these methods
 */
export abstract class BaseVoiceProvider {
  protected apiKey: string;
  protected baseUrl: string;
  
  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }
  
  /**
   * Get the provider name
   */
  abstract getProviderName(): "vapi" | "autocalls" | "synthflow" | "retell";
  
  /**
   * Create a voice agent/assistant
   * @param setupAnswers - Admin's answers to setup questions
   * @param aiConfig - AI-generated configuration
   * @param webhookUrl - Webhook URL for receiving call events
   * @returns Provider-specific agent object
   */
  abstract createAgent(
    setupAnswers: CampaignSetupAnswers,
    aiConfig: AIGeneratedConfig,
    webhookUrl: string
  ): Promise<ProviderAgent>;
  
  /**
   * Update an existing agent
   * @param agentId - Provider's agent ID
   * @param updates - Partial configuration updates
   * @returns Updated agent object
   */
  abstract updateAgent(
    agentId: string,
    updates: Partial<{
      name: string;
      systemPrompt: string;
      firstMessage: string;
      voicemailMessage: string;
      isActive: boolean;
    }>
  ): Promise<ProviderAgent>;
  
  /**
   * Delete an agent
   * @param agentId - Provider's agent ID
   * @returns Success boolean
   */
  abstract deleteAgent(agentId: string): Promise<boolean>;
  
  /**
   * Get agent details
   * @param agentId - Provider's agent ID
   * @returns Agent object or null if not found
   */
  abstract getAgent(agentId: string): Promise<ProviderAgent | null>;
  
  /**
   * Provision a phone number for the agent
   * @param agentId - Provider's agent ID
   * @param areaCode - Optional area code preference
   * @returns Phone number object
   */
  abstract provisionPhoneNumber(
    agentId: string,
    areaCode?: string
  ): Promise<ProviderPhoneNumber>;
  
  /**
   * Release/delete a phone number
   * @param phoneNumberId - Provider's phone number ID
   * @returns Success boolean
   */
  abstract releasePhoneNumber(phoneNumberId: string): Promise<boolean>;
  
  /**
   * Parse webhook payload into unified format
   * @param payload - Raw webhook payload from provider
   * @returns Unified call record
   */
  abstract parseWebhookPayload(payload: WebhookPayload): UnifiedCallRecord;
  
  /**
   * Validate webhook signature (if provider supports it)
   * @param payload - Raw webhook payload
   * @param signature - Webhook signature from headers
   * @returns Whether signature is valid
   */
  abstract validateWebhookSignature(
    payload: string | Record<string, any>,
    signature?: string
  ): boolean;
  
  /**
   * Get available voices for this provider
   * @returns List of voice options
   */
  abstract getAvailableVoices(): Promise<Array<{
    id: string;
    name: string;
    gender: "male" | "female" | "neutral";
    language: string;
    preview_url?: string;
  }>>;
  
  /**
   * Get available LLM models for this provider
   * @returns List of model options
   */
  abstract getAvailableModels(): Promise<Array<{
    id: string;
    name: string;
    provider: string;
    cost_per_call?: number;
  }>>;
  
  /**
   * Test the agent with a test call (if supported)
   * @param agentId - Provider's agent ID
   * @param testPhoneNumber - Phone number to call for testing
   * @returns Test call result
   */
  abstract initiateTestCall?(
    agentId: string,
    testPhoneNumber: string
  ): Promise<{
    callId: string;
    status: string;
  }>;
  
  /**
   * Get agent analytics/stats (if supported)
   * @param agentId - Provider's agent ID
   * @param startDate - Start date for analytics
   * @param endDate - End date for analytics
   * @returns Analytics data
   */
  abstract getAgentAnalytics?(
    agentId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalCalls: number;
    averageDuration: number;
    successRate: number;
    totalCost: number;
  }>;
  
  /**
   * Helper method to make API requests
   */
  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `[${this.getProviderName()}] API Error (${response.status}): ${error}`
      );
    }
    
    return response.json() as Promise<T>;
  }
  
  /**
   * Helper to select appropriate voice based on preferences
   */
  protected selectVoice(
    voicePreference: "male" | "female" | "auto",
    personality: string,
    availableVoices: Array<{ id: string; gender: string; name: string }>
  ): string {
    // If auto, choose based on personality
    if (voicePreference === "auto") {
      voicePreference = personality === "empathetic" ? "female" : "male";
    }
    
    // Filter by gender
    const matchingVoices = availableVoices.filter(
      v => v.gender === voicePreference || v.gender === "neutral"
    );
    
    // Return first match or fallback to first available
    return matchingVoices[0]?.id || availableVoices[0]?.id || "";
  }
}
