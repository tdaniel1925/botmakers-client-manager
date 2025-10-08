// Subscription Management Actions
// Server actions for managing organization subscriptions

"use server";

import { auth } from "@clerk/nextjs/server";
import { isPlatformAdmin } from "@/db/queries/platform-queries";
import {
  getAllPlans,
  getActiveSubscription,
  createSubscription,
  getPlanById,
  updateSubscription,
} from "@/db/queries/billing-queries";
import { getOrganizationUsageStats } from "@/db/queries/billing-queries";
import { getPaymentProvider } from "@/lib/payment-providers/provider-factory";

/**
 * Get all available subscription plans
 */
export async function getAvailablePlansAction() {
  try {
    const plans = await getAllPlans();
    return { plans };
  } catch (error) {
    console.error("[Subscriptions] Error getting plans:", error);
    return { error: "Failed to load subscription plans" };
  }
}

/**
 * Get organization's current subscription and usage
 */
export async function getOrganizationSubscriptionAction(organizationId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const subscription = await getActiveSubscription(organizationId);
    if (!subscription) {
      return { subscription: null, usage: null };
    }
    
    const plan = await getPlanById(subscription.planId);
    const usage = await getOrganizationUsageStats(organizationId);
    
    return {
      subscription,
      plan,
      usage,
    };
  } catch (error) {
    console.error("[Subscriptions] Error getting subscription:", error);
    return { error: "Failed to load subscription details" };
  }
}

/**
 * Create a new subscription for an organization
 */
export async function createSubscriptionAction(
  organizationId: string,
  planSlug: string,
  paymentProvider: "stripe" | "square" | "paypal",
  paymentData: {
    customerId?: string;
    paymentMethodId?: string;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can manage subscriptions" };
    }
    
    // Get plan by slug
    const plans = await getAllPlans();
    const plan = plans.find((p) => p.slug === planSlug);
    
    if (!plan) {
      return { error: "Invalid plan selected" };
    }
    
    // Create subscription with payment provider
    const provider = getPaymentProvider(paymentProvider);
    
    const providerResult = await provider.createSubscription({
      organizationId,
      planId: plan.id,
      customerId: paymentData.customerId,
      paymentMethodId: paymentData.paymentMethodId,
      metadata: {
        planSlug,
        organizationId,
      },
    });
    
    if (!providerResult.success) {
      return { error: providerResult.error || "Failed to create subscription with payment provider" };
    }
    
    // Create subscription record in database
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);
    
    const subscription = await createSubscription({
      organizationId,
      planId: plan.id,
      paymentProvider,
      externalSubscriptionId: providerResult.subscriptionId,
      externalCustomerId: providerResult.customerId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      minutesUsedThisCycle: 0,
      minutesIncludedThisCycle: plan.includedMinutes,
      overageMinutesThisCycle: 0,
      overageCostThisCycle: 0,
      status: "active",
    });
    
    console.log(`[Subscriptions] Created subscription for org ${organizationId}: ${plan.name}`);
    
    return {
      success: true,
      subscription,
    };
  } catch (error) {
    console.error("[Subscriptions] Error creating subscription:", error);
    return { error: "Failed to create subscription" };
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscriptionAction(
  organizationId: string,
  immediate: boolean = false
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can manage subscriptions" };
    }
    
    const subscription = await getActiveSubscription(organizationId);
    if (!subscription) {
      return { error: "No active subscription found" };
    }
    
    // Cancel with payment provider
    if (subscription.externalSubscriptionId) {
      const provider = getPaymentProvider(subscription.paymentProvider as any);
      await provider.cancelSubscription(subscription.externalSubscriptionId, immediate);
    }
    
    // Update subscription status
    await updateSubscription(subscription.id, {
      cancelAtPeriodEnd: !immediate,
      status: immediate ? "canceled" : "active",
      canceledAt: immediate ? new Date() : undefined,
    });
    
    console.log(`[Subscriptions] Canceled subscription for org ${organizationId}`);
    
    return { success: true };
  } catch (error) {
    console.error("[Subscriptions] Error canceling subscription:", error);
    return { error: "Failed to cancel subscription" };
  }
}
