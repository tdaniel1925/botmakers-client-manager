/**
 * Pricing Calculator
 * Estimates costs for voice campaigns based on provider and usage
 */

import { PROVIDER_CAPABILITIES } from "@/components/voice-campaigns/provider-capabilities";

export interface CostEstimate {
  provider: string;
  setup: number;
  phoneNumber: number;
  estimatedCallMinutes: number;
  perMinuteRate: number;
  callCost: number;
  monthlyTotal: number;
  breakdown: {
    label: string;
    amount: number;
    recurring: boolean;
  }[];
}

/**
 * Calculate estimated monthly cost
 */
export function calculateEstimatedCost(
  provider: string,
  estimatedCallVolume: number, // calls per month
  avgCallDuration: number // minutes per call
): CostEstimate {
  const capabilities = PROVIDER_CAPABILITIES[provider];

  if (!capabilities) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const estimatedCallMinutes = estimatedCallVolume * avgCallDuration;
  const callCost = estimatedCallMinutes * capabilities.pricing.perMinute;
  const setupCost = capabilities.pricing.setup || 0;
  const phoneNumberCost = capabilities.pricing.phoneNumber;

  const monthlyTotal = callCost + phoneNumberCost;

  return {
    provider: capabilities.displayName,
    setup: setupCost,
    phoneNumber: phoneNumberCost,
    estimatedCallMinutes,
    perMinuteRate: capabilities.pricing.perMinute,
    callCost,
    monthlyTotal,
    breakdown: [
      {
        label: "Phone Number",
        amount: phoneNumberCost,
        recurring: true,
      },
      {
        label: `Call Time (${estimatedCallMinutes.toFixed(0)} min)`,
        amount: callCost,
        recurring: true,
      },
      ...(setupCost > 0
        ? [
            {
              label: "Setup Fee (One-time)",
              amount: setupCost,
              recurring: false,
            },
          ]
        : []),
    ],
  };
}

/**
 * Get provider pricing info
 */
export function getProviderPricing(provider: string) {
  const capabilities = PROVIDER_CAPABILITIES[provider];
  if (!capabilities) return null;

  return {
    displayName: capabilities.displayName,
    perMinute: capabilities.pricing.perMinute,
    phoneNumber: capabilities.pricing.phoneNumber,
    setup: capabilities.pricing.setup,
  };
}

/**
 * Compare pricing across all providers
 */
export function compareProviderPricing(
  estimatedCallVolume: number,
  avgCallDuration: number
): CostEstimate[] {
  const providers = Object.keys(PROVIDER_CAPABILITIES);

  return providers.map((provider) =>
    calculateEstimatedCost(provider, estimatedCallVolume, avgCallDuration)
  );
}

/**
 * Estimate call volume based on campaign goal
 */
export function estimateCallVolumeByGoal(goal: string): {
  lowEstimate: number;
  midEstimate: number;
  highEstimate: number;
} {
  const estimates: Record<string, { low: number; mid: number; high: number }> = {
    lead_qualification: { low: 50, mid: 200, high: 500 },
    appointment_booking: { low: 30, mid: 100, high: 300 },
    customer_support: { low: 100, mid: 400, high: 1000 },
    sales_followup: { low: 40, mid: 150, high: 400 },
    survey: { low: 100, mid: 500, high: 1500 },
    custom: { low: 50, mid: 200, high: 500 },
  };

  const goalEstimates = estimates[goal] || estimates.custom;

  return {
    lowEstimate: goalEstimates.low,
    midEstimate: goalEstimates.mid,
    highEstimate: goalEstimates.high,
  };
}

/**
 * Estimate average call duration based on goal
 */
export function estimateCallDurationByGoal(goal: string): number {
  const durations: Record<string, number> = {
    lead_qualification: 3,
    appointment_booking: 5,
    customer_support: 7,
    sales_followup: 4,
    survey: 2,
    custom: 5,
  };

  return durations[goal] || 5;
}
