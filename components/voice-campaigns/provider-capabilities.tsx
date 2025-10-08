"use client";

import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Info } from "lucide-react";

export interface ProviderCapabilities {
  name: string;
  displayName: string;
  features: {
    autoNumberProvisioning: boolean;
    twilioIntegration: boolean;
    customVoices: boolean;
    realTimeTranscription: boolean;
    voicemail: boolean;
    dataCollection: boolean;
  };
  pricing: {
    perMinute: number;
    phoneNumber: number;
    setup?: number;
  };
  limits?: {
    maxConcurrentCalls?: number;
    maxCallDuration?: number;
  };
}

export const PROVIDER_CAPABILITIES: Record<string, ProviderCapabilities> = {
  vapi: {
    name: "vapi",
    displayName: "Vapi",
    features: {
      autoNumberProvisioning: true,
      twilioIntegration: true,
      customVoices: true,
      realTimeTranscription: true,
      voicemail: true,
      dataCollection: true,
    },
    pricing: {
      perMinute: 0.09,
      phoneNumber: 2.0,
    },
    limits: {
      maxConcurrentCalls: 10,
      maxCallDuration: 3600,
    },
  },
  autocalls: {
    name: "autocalls",
    displayName: "Autocalls.ai",
    features: {
      autoNumberProvisioning: true,
      twilioIntegration: false,
      customVoices: true,
      realTimeTranscription: true,
      voicemail: true,
      dataCollection: true,
    },
    pricing: {
      perMinute: 0.08,
      phoneNumber: 1.5,
    },
  },
  synthflow: {
    name: "synthflow",
    displayName: "Synthflow",
    features: {
      autoNumberProvisioning: true,
      twilioIntegration: false,
      customVoices: true,
      realTimeTranscription: true,
      voicemail: false,
      dataCollection: true,
    },
    pricing: {
      perMinute: 0.10,
      phoneNumber: 2.5,
    },
  },
  retell: {
    name: "retell",
    displayName: "Retell AI",
    features: {
      autoNumberProvisioning: true,
      twilioIntegration: false,
      customVoices: true,
      realTimeTranscription: true,
      voicemail: true,
      dataCollection: true,
    },
    pricing: {
      perMinute: 0.07,
      phoneNumber: 1.0,
    },
  },
};

interface ProviderCapabilitiesDisplayProps {
  provider: string;
  compact?: boolean;
}

export function ProviderCapabilitiesDisplay({
  provider,
  compact = false,
}: ProviderCapabilitiesDisplayProps) {
  const capabilities = PROVIDER_CAPABILITIES[provider];

  if (!capabilities) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Provider capabilities information not available
        </AlertDescription>
      </Alert>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {capabilities.features.twilioIntegration && (
          <Badge variant="outline" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
            Twilio Support
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">
          ${capabilities.pricing.perMinute}/min
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Features */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Features</h4>
        <div className="grid grid-cols-2 gap-2">
          <FeatureRow
            label="Auto Number Provisioning"
            enabled={capabilities.features.autoNumberProvisioning}
          />
          <FeatureRow
            label="Twilio Integration"
            enabled={capabilities.features.twilioIntegration}
          />
          <FeatureRow
            label="Custom Voices"
            enabled={capabilities.features.customVoices}
          />
          <FeatureRow
            label="Real-time Transcription"
            enabled={capabilities.features.realTimeTranscription}
          />
          <FeatureRow
            label="Voicemail"
            enabled={capabilities.features.voicemail}
          />
          <FeatureRow
            label="Data Collection"
            enabled={capabilities.features.dataCollection}
          />
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Pricing (Approximate)</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Per Minute:</span>
            <span className="font-mono font-semibold">
              ${capabilities.pricing.perMinute.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone Number:</span>
            <span className="font-mono font-semibold">
              ${capabilities.pricing.phoneNumber.toFixed(2)}/month
            </span>
          </div>
          {capabilities.pricing.setup && (
            <div className="flex justify-between">
              <span className="text-gray-600">Setup Fee:</span>
              <span className="font-mono font-semibold">
                ${capabilities.pricing.setup.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Limits */}
      {capabilities.limits && (
        <div>
          <h4 className="text-sm font-semibold mb-3">Limits</h4>
          <div className="space-y-2 text-sm">
            {capabilities.limits.maxConcurrentCalls && (
              <div className="flex justify-between">
                <span className="text-gray-600">Max Concurrent Calls:</span>
                <span className="font-semibold">
                  {capabilities.limits.maxConcurrentCalls}
                </span>
              </div>
            )}
            {capabilities.limits.maxCallDuration && (
              <div className="flex justify-between">
                <span className="text-gray-600">Max Call Duration:</span>
                <span className="font-semibold">
                  {Math.floor(capabilities.limits.maxCallDuration / 60)} min
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Twilio Notice */}
      {!capabilities.features.twilioIntegration && (
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-900">
            <strong>Note:</strong> This provider does not support Twilio phone
            numbers. You'll use the provider's built-in phone number provisioning.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function FeatureRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {enabled ? (
        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-300 flex-shrink-0" />
      )}
      <span className={enabled ? "text-gray-900" : "text-gray-400"}>
        {label}
      </span>
    </div>
  );
}

export function getProviderCapabilities(provider: string): ProviderCapabilities | null {
  return PROVIDER_CAPABILITIES[provider] || null;
}

export function checkFeatureSupport(provider: string, feature: keyof ProviderCapabilities["features"]): boolean {
  const capabilities = PROVIDER_CAPABILITIES[provider];
  return capabilities?.features[feature] || false;
}
