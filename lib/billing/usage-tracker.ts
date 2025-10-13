// Usage Tracker - Real-time tracking of voice campaign minute usage
// Handles recording, metering, and overage calculation for organization subscriptions

import {
  getActiveSubscription,
  getPlanById,
  createUsageRecord,
  incrementUsage,
} from "@/db/queries/billing-queries";
import { updateOrganization } from "@/db/queries/organizations-queries";
import { getCampaignById } from "@/db/queries/voice-campaigns-queries";

export interface UsageResult {
  success: boolean;
  minutesUsed: number;
  costInCents: number;
  wasOverage: boolean;
  remainingMinutes: number;
  error?: string;
}

export interface UsageStatus {
  canMakeCalls: boolean;
  minutesRemaining: number;
  minutesUsed: number;
  minutesIncluded: number;
  isInOverage: boolean;
  overageMinutes: number;
  percentageUsed: number;
  subscription: any;
}

/**
 * Record usage for a completed call
 * This is called when a voice call completes
 */
export async function recordCallUsage(
  organizationId: string,
  campaignId: string,
  callRecordId: string,
  durationInSeconds: number
): Promise<UsageResult> {
  try {
    // 0. Check if campaign is admin-free (skip billing)
    const campaign = await getCampaignById(campaignId);
    
    if (campaign && campaign.billingType === "admin_free") {
      console.log(`[Usage Tracker] Skipping usage tracking for admin-free campaign ${campaignId}`);
      return {
        success: true,
        minutesUsed: 0,
        costInCents: 0,
        wasOverage: false,
        remainingMinutes: 0,
        error: "Admin-free campaign - no billing",
      };
    }
    
    // 1. Get organization's active subscription
    const subscription = await getActiveSubscription(organizationId);
    
    if (!subscription) {
      return {
        success: false,
        minutesUsed: 0,
        costInCents: 0,
        wasOverage: false,
        remainingMinutes: 0,
        error: "No active subscription found for organization",
      };
    }
    
    // 2. Get plan details to check overage rate
    const plan = await getPlanById(subscription.planId);
    
    if (!plan) {
      return {
        success: false,
        minutesUsed: 0,
        costInCents: 0,
        wasOverage: false,
        remainingMinutes: 0,
        error: "Subscription plan not found",
      };
    }
    
    // 3. Calculate minutes used (round up)
    const minutesUsed = Math.ceil(durationInSeconds / 60);
    
    // 4. Check if within included minutes or overage
    const currentUsage = subscription.minutesUsedThisCycle || 0;
    const includedMinutes = subscription.minutesIncludedThisCycle || 0;
    const remainingIncludedMinutes = Math.max(0, includedMinutes - currentUsage);

    // Determine if this usage is overage
    const isOverage = currentUsage >= includedMinutes;
    const overageMinutes = isOverage ? minutesUsed : Math.max(0, currentUsage + minutesUsed - includedMinutes);
    
    // Calculate cost
    let costInCents = 0;
    let ratePerMinute = 0;
    
    if (isOverage) {
      // All minutes are overage
      costInCents = minutesUsed * plan.overageRatePerMinute;
      ratePerMinute = plan.overageRatePerMinute;
    } else if (overageMinutes > 0) {
      // Some minutes are included, some are overage
      const includedPortionMinutes = minutesUsed - overageMinutes;
      costInCents = overageMinutes * plan.overageRatePerMinute;
      ratePerMinute = plan.overageRatePerMinute;
    } else {
      // All within included minutes - no cost
      costInCents = 0;
      ratePerMinute = 0;
    }
    
    // 5. Record usage in usage_records table
    await createUsageRecord({
      organizationId,
      subscriptionId: subscription.id,
      campaignId,
      callRecordId,
      durationInSeconds,
      minutesUsed,
      costInCents,
      wasOverage: isOverage,
      ratePerMinute,
      billingPeriodStart: subscription.currentPeriodStart,
      billingPeriodEnd: subscription.currentPeriodEnd,
      reportedToProvider: false,
    });
    
    // 6. Update subscription's usage counters
    await incrementUsage(subscription.id, minutesUsed, costInCents);
    
    // 7. Return usage status
    return {
      success: true,
      minutesUsed,
      costInCents,
      wasOverage: isOverage,
      remainingMinutes: Math.max(0, includedMinutes - (currentUsage + minutesUsed)),
    };
  } catch (error) {
    console.error("[Usage Tracker] Error recording usage:", error);
    return {
      success: false,
      minutesUsed: 0,
      costInCents: 0,
      wasOverage: false,
      remainingMinutes: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check current usage status for an organization
 * Used to determine if they can make calls or need to upgrade
 */
export async function checkUsageLimit(organizationId: string): Promise<UsageStatus | null> {
  try {
    const subscription = await getActiveSubscription(organizationId);
    
    if (!subscription) {
      return null;
    }
    
    const minutesUsed = subscription.minutesUsedThisCycle || 0;
    const minutesIncluded = subscription.minutesIncludedThisCycle || 1; // Prevent division by zero
    const minutesRemaining = Math.max(0, minutesIncluded - minutesUsed);
    const overageMinutes = Math.max(0, minutesUsed - minutesIncluded);
    const isInOverage = minutesUsed > minutesIncluded;
    const percentageUsed = Math.min(100, Math.round((minutesUsed / minutesIncluded) * 100));
    
    // Organizations can always make calls (overage is auto-charged)
    // Only block if subscription is not active
    const canMakeCalls = subscription.status === "active";
    
    return {
      canMakeCalls,
      minutesRemaining,
      minutesUsed,
      minutesIncluded,
      isInOverage,
      overageMinutes,
      percentageUsed,
      subscription,
    };
  } catch (error) {
    console.error("[Usage Tracker] Error checking usage limit:", error);
    return null;
  }
}

/**
 * Get usage threshold status for notifications
 * Returns thresholds: 50%, 75%, 90%, 100%
 */
export function getUsageThreshold(percentageUsed: number): {
  threshold: number;
  status: "safe" | "warning" | "critical" | "exceeded";
  color: string;
  message: string;
} {
  if (percentageUsed < 50) {
    return {
      threshold: 50,
      status: "safe",
      color: "green",
      message: "You're well within your included minutes",
    };
  } else if (percentageUsed < 75) {
    return {
      threshold: 75,
      status: "safe",
      color: "green",
      message: "You've used about half your included minutes",
    };
  } else if (percentageUsed < 90) {
    return {
      threshold: 90,
      status: "warning",
      color: "yellow",
      message: "You're approaching your included minute limit",
    };
  } else if (percentageUsed < 100) {
    return {
      threshold: 100,
      status: "critical",
      color: "orange",
      message: "You're close to exceeding your included minutes",
    };
  } else {
    return {
      threshold: 100,
      status: "exceeded",
      color: "red",
      message: "You're now using overage minutes - additional charges apply",
    };
  }
}

/**
 * Calculate estimated overage cost for upcoming call
 */
export async function estimateCallCost(
  organizationId: string,
  estimatedDurationSeconds: number
): Promise<{ estimatedCostCents: number; willBeOverage: boolean } | null> {
  try {
    const subscription = await getActiveSubscription(organizationId);
    if (!subscription) return null;
    
    const plan = await getPlanById(subscription.planId);
    if (!plan) return null;
    
    const estimatedMinutes = Math.ceil(estimatedDurationSeconds / 60);
    const currentUsage = subscription.minutesUsedThisCycle || 0;
    const includedMinutes = subscription.minutesIncludedThisCycle || 0;
    const remainingIncluded = Math.max(0, includedMinutes - currentUsage);
    
    const willBeOverage = remainingIncluded < estimatedMinutes;
    const overageMinutes = Math.max(0, estimatedMinutes - remainingIncluded);
    const estimatedCostCents = overageMinutes * plan.overageRatePerMinute;
    
    return {
      estimatedCostCents,
      willBeOverage,
    };
  } catch (error) {
    console.error("[Usage Tracker] Error estimating call cost:", error);
    return null;
  }
}
