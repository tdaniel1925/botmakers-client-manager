// Stripe Payment Provider
// Handles subscription creation, metered billing, and webhooks for Stripe

import Stripe from "stripe";
import {
  BasePaymentProvider,
  type SubscriptionParams,
  type SubscriptionResult,
  type CancelSubscriptionResult,
  type UpdatePaymentMethodResult,
  type MeteredUsageParams,
  type WebhookEvent,
} from "./base-provider";
import { getPlanById } from "@/db/queries/billing-queries";

export class StripePaymentProvider extends BasePaymentProvider {
  private stripe: Stripe;
  
  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY!;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    super(apiKey, webhookSecret);
    
    this.stripe = new Stripe(apiKey, {
      apiVersion: "2024-11-20.acacia",
    });
  }
  
  getProviderName(): "stripe" {
    return "stripe";
  }
  
  async createCustomer(
    email: string,
    name: string,
    metadata?: Record<string, string>
  ): Promise<{ customerId: string }> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: metadata || {},
    });
    
    return { customerId: customer.id };
  }
  
  async createSubscription(params: SubscriptionParams): Promise<SubscriptionResult> {
    try {
      // Get plan details to find Stripe price IDs
      const plan = await getPlanById(params.planId);
      
      if (!plan || !plan.stripePriceId) {
        return {
          success: false,
          error: "Plan not found or Stripe price ID not configured",
        };
      }
      
      // Create or get customer
      let customerId = params.customerId;
      if (!customerId) {
        return {
          success: false,
          error: "Customer ID is required",
        };
      }
      
      // Create subscription with base price + metered usage item
      const subscriptionItems: Stripe.SubscriptionCreateParams.Item[] = [
        {
          price: plan.stripePriceId, // Base subscription price
        },
      ];
      
      // Add metered pricing for overage if configured
      if (plan.stripeMeteredPriceId) {
        subscriptionItems.push({
          price: plan.stripeMeteredPriceId,
        });
      }
      
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: subscriptionItems,
        payment_behavior: "default_incomplete",
        payment_settings: {
          payment_method_types: ["card"],
          save_default_payment_method: "on_subscription",
        },
        metadata: {
          organizationId: params.organizationId,
          planId: params.planId,
          ...(params.metadata || {}),
        },
        expand: ["latest_invoice.payment_intent"],
      });
      
      return {
        success: true,
        subscriptionId: subscription.id,
        customerId: customerId,
        status: subscription.status,
      };
    } catch (error) {
      console.error("[Stripe] Create subscription error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
  async reportMeteredUsage(params: MeteredUsageParams): Promise<{ success: boolean; error?: string }> {
    try {
      // Get subscription to find the metered item
      const subscription = await this.stripe.subscriptions.retrieve(params.subscriptionId);
      
      // Find the metered subscription item
      const meteredItem = subscription.items.data.find((item) => {
        return item.price.recurring?.usage_type === "metered";
      });
      
      if (!meteredItem) {
        return {
          success: false,
          error: "No metered subscription item found",
        };
      }
      
      // Report usage
      await this.stripe.subscriptionItems.createUsageRecord(
        meteredItem.id,
        {
          quantity: params.quantity,
          timestamp: params.timestamp ? Math.floor(params.timestamp.getTime() / 1000) : "now",
          action: "increment",
        },
        {
          idempotencyKey: params.idempotencyKey,
        }
      );
      
      console.log(`[Stripe] Reported ${params.quantity} minutes of usage for subscription ${params.subscriptionId}`);
      
      return { success: true };
    } catch (error) {
      console.error("[Stripe] Report metered usage error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
  async cancelSubscription(
    subscriptionId: string,
    immediate: boolean = false
  ): Promise<CancelSubscriptionResult> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediate,
      });
      
      if (immediate) {
        await this.stripe.subscriptions.cancel(subscriptionId);
      }
      
      return {
        success: true,
        canceledAt: immediate ? new Date() : new Date(subscription.current_period_end * 1000),
      };
    } catch (error) {
      console.error("[Stripe] Cancel subscription error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
  async updatePaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<UpdatePaymentMethodResult> {
    try {
      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      
      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      
      return { success: true };
    } catch (error) {
      console.error("[Stripe] Update payment method error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
  async verifyWebhook(payload: string, signature: string): Promise<WebhookEvent | null> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
      
      return {
        type: event.type,
        data: event.data.object,
        providerId: "stripe",
      };
    } catch (error) {
      console.error("[Stripe] Webhook verification error:", error);
      return null;
    }
  }
  
  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error("[Stripe] Get subscription error:", error);
      return null;
    }
  }
  
  /**
   * Create Stripe prices for a plan (one-time setup)
   */
  async createPricesForPlan(
    productId: string,
    monthlyPriceCents: number,
    overageRateCents: number
  ): Promise<{ basePriceId: string; meteredPriceId: string }> {
    // Create base subscription price
    const basePrice = await this.stripe.prices.create({
      product: productId,
      currency: "usd",
      recurring: {
        interval: "month",
        usage_type: "licensed",
      },
      unit_amount: monthlyPriceCents,
    });
    
    // Create metered price for overage
    const meteredPrice = await this.stripe.prices.create({
      product: productId,
      currency: "usd",
      recurring: {
        interval: "month",
        usage_type: "metered",
        aggregate_usage: "sum",
      },
      unit_amount: overageRateCents,
      billing_scheme: "per_unit",
    });
    
    return {
      basePriceId: basePrice.id,
      meteredPriceId: meteredPrice.id,
    };
  }
}
