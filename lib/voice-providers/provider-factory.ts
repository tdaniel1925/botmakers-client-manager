// Provider Factory - Returns the appropriate provider instance

import { BaseVoiceProvider } from "./base-provider";
import { VapiProvider } from "./vapi-provider";
import { AutocallsProvider } from "./autocalls-provider";
import { SynthflowProvider } from "./synthflow-provider";
import { RetellProvider } from "./retell-provider";

/**
 * Get a voice provider instance based on provider name
 * @param provider - Provider name
 * @returns Provider instance
 */
export function getVoiceProvider(
  provider: "vapi" | "autocalls" | "synthflow" | "retell"
): BaseVoiceProvider {
  switch (provider) {
    case "vapi":
      return new VapiProvider();
    
    case "autocalls":
      return new AutocallsProvider();
    
    case "synthflow":
      return new SynthflowProvider();
    
    case "retell":
      return new RetellProvider();
    
    default:
      throw new Error(`[ProviderFactory] Unknown provider: ${provider}`);
  }
}

/**
 * Get all available providers
 * @returns List of provider names
 */
export function getAvailableProviders(): Array<{
  value: "vapi" | "autocalls" | "synthflow" | "retell";
  label: string;
  description: string;
  features: string[];
  pricing: string;
  status: "available" | "coming_soon" | "beta";
}> {
  return [
    {
      value: "vapi",
      label: "Vapi",
      description: "Advanced conversational AI with real-time features and high-quality voices",
      features: [
        "GPT-4 Turbo & Claude 3",
        "11labs Premium Voices",
        "Deepgram Transcription",
        "Live Call Monitoring",
        "Built-in Analytics"
      ],
      pricing: "Pay per minute ($0.10-0.15/min)",
      status: "available"
    },
    {
      value: "autocalls",
      label: "Autocalls",
      description: "Automated calling with lead management and campaign tracking",
      features: [
        "Campaign Management",
        "Lead Tracking",
        "SMS Integration",
        "Outbound Dialing",
        "CRM Integration"
      ],
      pricing: "Per call pricing ($0.50-1.00/call)",
      status: "available"
    },
    {
      value: "synthflow",
      label: "Synthflow",
      description: "No-code voice AI with multi-language support and easy workflows",
      features: [
        "30+ Languages",
        "Visual Workflow Builder",
        "Zapier Integration",
        "No-Code Setup",
        "Quick Deployment"
      ],
      pricing: "Monthly subscription ($99-299/mo)",
      status: "available"
    },
    {
      value: "retell",
      label: "Retell AI",
      description: "Low-latency voice AI with powerful SDKs for developers",
      features: [
        "Ultra-low Latency",
        "Node.js & Python SDKs",
        "WebSocket Support",
        "Custom LLM Integration",
        "Advanced Voice Controls"
      ],
      pricing: "Pay as you go ($0.08-0.12/min)",
      status: "available"
    }
  ];
}

/**
 * Validate that a provider is properly configured
 * @param provider - Provider name
 * @returns Whether provider is configured
 */
export function isProviderConfigured(
  provider: "vapi" | "autocalls" | "synthflow" | "retell"
): boolean {
  const apiKeyMap = {
    vapi: process.env.VAPI_API_KEY,
    autocalls: process.env.AUTOCALLS_API_KEY,
    synthflow: process.env.SYNTHFLOW_API_KEY,
    retell: process.env.RETELL_API_KEY,
  };
  
  return !!apiKeyMap[provider];
}

/**
 * Get list of configured providers only
 * @returns List of providers that have API keys configured
 */
export function getConfiguredProviders() {
  return getAvailableProviders().filter(p => 
    isProviderConfigured(p.value)
  );
}
