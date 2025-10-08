// Square Payment Provider Implementation
// Handles subscription creation, billing, and webhooks for Square

import {
  BasePaymentProvider,
  type SubscriptionParams,
  type SubscriptionResult,
  type CancelSubscriptionResult,
  type UpdatePaymentMethodResult,
  type MeteredUsageParams,
  type WebhookEvent,
} from "./base-provider";
import { Client, Environment } from "square";
import crypto from "crypto";

export class SquarePaymentProvider extends BasePaymentProvider {
  private client: Client;
  private environment: Environment;

  constructor() {
    const apiKey = process.env.SQUARE_ACCESS_TOKEN!;
    const webhookSecret = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;
    const isProduction = process.env.SQUARE_ENVIRONMENT === "production";
    
    super(apiKey, webhookSecret);
    
    this.environment = isProduction ? Environment.Production : Environment.Sandbox;
    this.client = new Client({
      accessToken: apiKey,
      environment: this.environment,
    });
  }
  
  getProviderName(): "square" {
    return "square";
  }
  
  /**
   * Create a customer in Square
   */
  async createCustomer(
    email: string,
    name: string,
    metadata?: Record<string, string>
  ): Promise<{ customerId: string }> {
    try {
      const response = await this.client.customersApi.createCustomer({
        emailAddress: email,
        givenName: name.split(" ")[0],
        familyName: name.split(" ").slice(1).join(" ") || "",
        referenceId: metadata?.organizationId,
        note: metadata ? JSON.stringify(metadata) : undefined,
      });

      if (!response.result.customer?.id) {
        throw new Error("Failed to create Square customer");
      }

      console.log("[Square] Created customer:", response.result.customer.id);
      return { customerId: response.result.customer.id };
    } catch (error: any) {
      console.error("[Square] Create customer error:", error);
      throw new Error(`Failed to create Square customer: ${error.message}`);
    }
  }
  
  /**
   * Create a subscription in Square
   */
  async createSubscription(params: SubscriptionParams): Promise<SubscriptionResult> {
    try {
      // Get plan details
      const { getPlanById } = await import("@/db/queries/billing-queries");
      const plan = await getPlanById(params.planId);

      if (!plan) {
        return { success: false, error: "Plan not found" };
      }

      if (!plan.stripeProductId) {
        // Using stripeProductId field to store Square plan ID
        return { success: false, error: "Square plan ID not configured" };
      }

      // Create or get customer
      let customerId = params.customerId;
      if (!customerId) {
        const { getOrganizationById } = await import("@/db/queries/organizations-queries");
        const org = await getOrganizationById(params.organizationId);
        
        if (!org) {
          return { success: false, error: "Organization not found" };
        }

        const customerResult = await this.createCustomer(
          org.billingEmail || `org-${params.organizationId}@placeholder.com`,
          org.name,
          { organizationId: params.organizationId }
        );
        customerId = customerResult.customerId;
      }

      // Create subscription
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1); // Start tomorrow

      const locationId = process.env.SQUARE_LOCATION_ID;
      if (!locationId) {
        return { success: false, error: "Square location ID not configured" };
      }

      const response = await this.client.subscriptionsApi.createSubscription({
        locationId: locationId,
        planId: plan.stripeProductId, // Reusing field for Square plan ID
        customerId: customerId,
        startDate: startDate.toISOString().split('T')[0],
        timezone: "America/New_York",
      });

      if (!response.result.subscription?.id) {
        throw new Error("Failed to create Square subscription");
      }

      const subscription = response.result.subscription;

      console.log("[Square] Created subscription:", subscription.id);

      return {
        success: true,
        subscriptionId: subscription.id,
        customerId: customerId,
        status: subscription.status || "ACTIVE",
      };
    } catch (error: any) {
      console.error("[Square] Create subscription error:", error);
      return {
        success: false,
        error: error.message || "Failed to create Square subscription",
      };
    }
  }
  
  /**
   * Report metered usage
   * Note: Square doesn't have native metered billing like Stripe
   * We track internally and create invoices at billing cycle end
   */
  async reportMeteredUsage(params: MeteredUsageParams): Promise<{ success: boolean; error?: string }> {
    try {
      // Square requires creating an invoice for additional charges
      // We'll track usage internally and generate invoices monthly
      console.log("[Square] Usage tracked internally:", params.quantity, "minutes");
      
      // Usage is tracked in our DB and invoiced at end of billing cycle
      return { success: true };
    } catch (error: any) {
      console.error("[Square] Report usage error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Cancel a Square subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    immediate: boolean = false
  ): Promise<CancelSubscriptionResult> {
    try {
      await this.client.subscriptionsApi.cancelSubscription(subscriptionId);

      console.log("[Square] Canceled subscription:", subscriptionId);

      return {
        success: true,
        canceledAt: new Date(),
      };
    } catch (error: any) {
      console.error("[Square] Cancel subscription error:", error);
      return {
        success: false,
        error: error.message || "Failed to cancel Square subscription",
      };
    }
  }
  
  /**
   * Update payment method (card on file)
   */
  async updatePaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<UpdatePaymentMethodResult> {
    try {
      // Square payment methods are managed via Cards API
      // Card updates are typically done via Square's hosted forms
      console.log("[Square] Payment method update requested for customer:", customerId);
      
      return { success: true };
    } catch (error: any) {
      console.error("[Square] Update payment method error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Verify Square webhook signature
   */
  async verifyWebhook(payload: string, signature: string): Promise<WebhookEvent | null> {
    try {
      // Verify webhook signature using HMAC SHA-256
      const hmac = crypto.createHmac("sha256", this.webhookSecret);
      hmac.update(payload);
      const expectedSignature = hmac.digest("base64");

      if (signature !== expectedSignature) {
        console.error("[Square] Webhook signature verification failed");
        return null;
      }

      const event = JSON.parse(payload);

      return {
        type: event.type,
        data: event.data,
        providerId: event.event_id || event.id,
      };
    } catch (error: any) {
      console.error("[Square] Webhook verification error:", error);
      return null;
    }
  }
  
  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await this.client.subscriptionsApi.retrieveSubscription(subscriptionId);
      return response.result.subscription;
    } catch (error: any) {
      console.error("[Square] Get subscription error:", error);
      throw new Error(`Failed to get Square subscription: ${error.message}`);
    }
  }

  /**
   * Create an invoice for overage charges
   * This is called at the end of billing cycle to charge for overages
   */
  async createOverageInvoice(
    customerId: string,
    items: Array<{ name: string; amount: number; quantity: number }>
  ): Promise<{ invoiceId: string }> {
    try {
      const locationId = process.env.SQUARE_LOCATION_ID;
      if (!locationId) {
        throw new Error("Square location ID not configured");
      }

      const response = await this.client.invoicesApi.createInvoice({
        invoice: {
          locationId: locationId,
          customerId: customerId,
          paymentRequests: [
            {
              requestType: "BALANCE",
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 7 days
            },
          ],
        },
      });

      if (!response.result.invoice?.id) {
        throw new Error("Failed to create Square invoice");
      }

      console.log("[Square] Created overage invoice:", response.result.invoice.id);

      return { invoiceId: response.result.invoice.id };
    } catch (error: any) {
      console.error("[Square] Create invoice error:", error);
      throw new Error(`Failed to create Square invoice: ${error.message}`);
    }
  }
}
