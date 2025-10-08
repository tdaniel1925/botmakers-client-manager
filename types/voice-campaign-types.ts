// Voice Campaign Types - TypeScript definitions for voice agent system

// ===== SETUP ANSWERS =====

export interface CampaignSetupAnswers {
  campaign_name: string;
  agent_name: string;
  company_name: string;
  campaign_type: "inbound" | "outbound" | "both";
  business_context: string;
  campaign_goal: "lead_qualification" | "appointment_booking" | "customer_support" | "sales_followup" | "survey" | "custom";
  custom_goal?: string;
  agent_personality: "professional" | "friendly" | "enthusiastic" | "empathetic";
  voice_preference: "male" | "female" | "auto";
  key_information: string;
  must_collect: string[];
  follow_up_triggers: string[];
  working_hours: "24_7" | "business_hours" | "custom";
  custom_hours_start?: string;
  custom_hours_end?: string;
  area_code?: string;
  billing_type?: "admin_free" | "billable"; // Optional, defaults to "billable"
}

// ===== AI GENERATED CONFIG =====

export interface AIGeneratedConfig {
  systemPrompt: string;
  firstMessage: string;
  conversationGuidelines: string[];
  dataToCollect: string[];
  successCriteria: string;
  voicemailMessage: string;
  endCallPhrases: string[];
  estimatedCallDuration: number;
  voiceId?: string;
}

// ===== PROVIDER CONFIGS =====

// Base provider config interface
export interface BaseProviderConfig {
  name: string;
  systemPrompt: string;
  firstMessage: string;
  voicemailMessage: string;
  endCallPhrases: string[];
}

// Vapi specific config
export interface VapiConfig extends BaseProviderConfig {
  model: {
    provider: "openai" | "anthropic";
    model: string;
    temperature?: number;
    messages?: Array<{
      role: "system" | "assistant" | "user";
      content: string;
    }>;
  };
  voice: {
    provider: "11labs" | "playht" | "rime-ai" | "neets" | "openai";
    voiceId: string;
  };
  transcriber: {
    provider: "deepgram" | "assembly-ai";
    model?: string;
    language?: string;
  };
  serverMessages?: string[];
}

// Autocalls specific config
export interface AutocallsConfig extends BaseProviderConfig {
  prompt: string;
  language: string;
  voice: string;
  llm_model: string;
  phone_number?: string;
}

// Synthflow specific config
export interface SynthflowConfig extends BaseProviderConfig {
  prompt: string;
  voice: string;
  language: string;
  webhookUrl?: string;
}

// Retell specific config
export interface RetellConfig extends BaseProviderConfig {
  agent_name: string;
  llm_websocket_url?: string;
  voice_id: string;
  voice_temperature?: number;
  voice_speed?: number;
  responsiveness?: number;
}

// Union type for all provider configs
export type ProviderConfig = VapiConfig | AutocallsConfig | SynthflowConfig | RetellConfig;

// ===== PROVIDER RESPONSE TYPES =====

export interface ProviderAgent {
  id: string;
  name: string;
  status: string;
  phoneNumber?: string;
  phoneNumberId?: string;
  webhookUrl?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ProviderPhoneNumber {
  id: string;
  number: string;
  countryCode?: string;
  areaCode?: string;
  provider: string;
  createdAt: string;
}

// ===== WEBHOOK PAYLOAD TYPES =====

// Unified call record from any provider
export interface UnifiedCallRecord {
  callId: string;
  campaignId?: string;
  provider: "vapi" | "autocalls" | "synthflow" | "retell";
  
  // Call details
  callerPhone?: string;
  callerName?: string;
  callDuration: number; // seconds
  callTimestamp: Date;
  audioUrl?: string;
  
  // Conversation
  transcript: string;
  
  // Status
  status: "completed" | "failed" | "no-answer" | "busy" | "voicemail";
  endReason?: string;
  
  // Analysis (if available from provider)
  analysis?: {
    summary?: string;
    sentiment?: string;
    intent?: string;
    qualityRating?: number;
    followUpNeeded?: boolean;
    extractedData?: Record<string, any>;
  };
  
  // Cost
  cost?: number; // in cents
  
  // Provider-specific raw data
  rawPayload: Record<string, any>;
}

// Vapi webhook payload
export interface VapiWebhookPayload {
  message: {
    type: string;
    [key: string]: any;
  };
  call?: {
    id: string;
    status: string;
    startedAt: string;
    endedAt?: string;
    transcript?: string;
    recordingUrl?: string;
    customer?: {
      number?: string;
      name?: string;
    };
    analysis?: any;
    costs?: any;
    endedReason?: string;
  };
}

// Autocalls webhook payload
export interface AutocallsWebhookPayload {
  call_id: string;
  assistant_id: string;
  status: string;
  transcript: string;
  duration: number;
  timestamp: string;
  caller_phone?: string;
  caller_name?: string;
  recording_url?: string;
  lead_id?: string;
  campaign_id?: string;
}

// Synthflow webhook payload
export interface SynthflowWebhookPayload {
  call_id: string;
  assistant_id: string;
  flow_id: string;
  status: string;
  transcript: string;
  duration: number;
  timestamp: string;
  phone_number?: string;
  recording_url?: string;
}

// Retell webhook payload
export interface RetellWebhookPayload {
  call_id: string;
  agent_id: string;
  call_status: string;
  transcript: string;
  call_duration: number;
  start_timestamp: string;
  end_timestamp?: string;
  from_number?: string;
  to_number?: string;
  recording_url?: string;
}

// Union type for all webhook payloads
export type WebhookPayload = 
  | VapiWebhookPayload 
  | AutocallsWebhookPayload 
  | SynthflowWebhookPayload 
  | RetellWebhookPayload;

// ===== CAMPAIGN STATS =====

export interface CampaignStats {
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  successRate: number;
  averageCallDuration: number; // seconds
  averageCallQuality: number; // 1-10
  totalCost: number; // cents
  lastCallAt?: Date;
}

// ===== UI TYPES =====

export interface ProviderOption {
  value: "vapi" | "autocalls" | "synthflow" | "retell";
  label: string;
  description: string;
  features: string[];
  pricing: string;
  logo?: string;
  status: "available" | "coming_soon" | "beta";
}

export interface CampaignWizardStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "current" | "completed";
}

export interface CampaignCreationProgress {
  step: "selecting" | "answering" | "generating" | "deploying" | "testing" | "complete";
  provider?: string;
  answers?: CampaignSetupAnswers;
  aiConfig?: AIGeneratedConfig;
  providerConfig?: ProviderConfig;
  campaign?: any;
  error?: string;
}
