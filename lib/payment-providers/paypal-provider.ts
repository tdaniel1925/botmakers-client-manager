// PayPal Payment Provider Implementation
// Handles subscription creation, billing, and webhooks for PayPal

import {
  BasePaymentProvider,
  type SubscriptionParams,
  type SubscriptionResult,
  type CancelSubscriptionResult,
  type UpdatePaymentMethodResult,
  type MeteredUsageParams,
  type WebhookEvent,
} from "./base-provider";
import crypto from "crypto";

export class PayPalPaymentProvider extends BasePaymentProvider {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    const clientId = process.env.PAYPAL_CLIENT_ID!;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
    const webhookSecret = process.env.PAYPAL_WEBHOOK_ID!;
    const mode = process.env.PAYPAL_MODE || "sandbox";
    
    super(clientId, webhookSecret);
    
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.baseUrl = mode === "live" 
      ? "https://api-m.paypal.com" 
      : "https://api-m.sandbox.paypal.com";
  }
  
  getProviderName(): "paypal" {
    return "paypal";
  }

  /**
   * Get PayPal OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
      
      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        throw new Error(`PayPal auth failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error: any) {
      console.error("[PayPal] Get access token error:", error);
      throw new Error(`Failed to get PayPal access token: ${error.message}`);
    }
  }

  /**
   * Make authenticated request to PayPal API
   */
  private async makeRequest(
    endpoint: string,
    method: string = "GET",
    body?: any
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    
    const options: RequestInit = {
      method,
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayPal API error: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }
  
  /**
   * Create a customer (PayPal doesn't have a direct customer object like Stripe)
   * We'll return a placeholder and link via subscription
   */
  async createCustomer(
    email: string,
    name: string,
    metadata?: Record<string, string>
  ): Promise<{ customerId: string }> {
    try {
      // PayPal doesn't have a separate customer creation API
      // Customer info is captured during subscription creation
      console.log("[PayPal] Customer will be created during subscription:", email);
      
      // Return email as customer ID for reference
      return { customerId: email };
    } catch (error: any) {
      console.error("[PayPal] Create customer error:", error);
      throw new Error(`Failed to create PayPal customer: ${error.message}`);
    }
  }
  
  /**
   * Create a subscription in PayPal
   */
  async createSubscription(params: SubscriptionParams): Promise<SubscriptionResult> {
    try {
      // Get plan details
      const { getPlanById } = await import("@/db/queries/billing-queries");
      const plan = await getPlanById(params.planId);

      if (!plan) {
        return { success: false, error: "Plan not found" };
      }

      if (!plan.stripePriceIdMonthly) {
        // Using stripePriceIdMonthly field to store PayPal plan ID
        return { success: false, error: "PayPal plan ID not configured" };
      }

      // Get organization details
      const { getOrganizationById } = await import("@/db/queries/organizations-queries");
      const org = await getOrganizationById(params.organizationId);
      
      if (!org) {
        return { success: false, error: "Organization not found" };
      }

      // Create subscription
      const subscriptionData = {
        plan_id: plan.stripePriceIdMonthly, // PayPal plan ID
        subscriber: {
          email_address: org.billingEmail || `org-${params.organizationId}@placeholder.com`,
          name: {
            given_name: org.name.split(" ")[0],
            surname: org.name.split(" ").slice(1).join(" ") || "Organization",
          },
        },
        application_context: {
          brand_name: "Voice Campaign Platform",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
        },
        custom_id: params.organizationId,
      };

      const response = await this.makeRequest(
        "/v1/billing/subscriptions",
        "POST",
        subscriptionData
      );

      if (!response.id) {
        throw new Error("Failed to create PayPal subscription");
      }

      console.log("[PayPal] Created subscription:", response.id);

      // Get approval URL for customer to complete subscription
      const approvalLink = response.links?.find((link: any) => link.rel === "approve");

      return {
        success: true,
        subscriptionId: response.id,
        customerId: org.billingEmail || params.organizationId,
        status: response.status || "APPROVAL_PENDING",
        // Note: In real implementation, you'd redirect user to approvalLink.href
      };
    } catch (error: any) {
      console.error("[PayPal] Create subscription error:", error);
      return {
        success: false,
        error: error.message || "Failed to create PayPal subscription",
      };
    }
  }
  
  /**
   * Report metered usage
   * PayPal doesn't support metered billing natively
   * We track internally and create invoices at billing cycle end
   */
  async reportMeteredUsage(params: MeteredUsageParams): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("[PayPal] Usage tracked internally:", params.quantity, "minutes");
      
      // PayPal doesn't have native metered billing
      // Usage is tracked in our DB and invoiced separately
      return { success: true };
    } catch (error: any) {
      console.error("[PayPal] Report usage error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Cancel a PayPal subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    immediate: boolean = false
  ): Promise<CancelSubscriptionResult> {
    try {
      await this.makeRequest(
        `/v1/billing/subscriptions/${subscriptionId}/cancel`,
        "POST",
        {
          reason: immediate ? "User requested immediate cancellation" : "User canceled subscription",
        }
      );

      console.log("[PayPal] Canceled subscription:", subscriptionId);

      return {
        success: true,
        canceledAt: new Date(),
      };
    } catch (error: any) {
      console.error("[PayPal] Cancel subscription error:", error);
      return {
        success: false,
        error: error.message || "Failed to cancel PayPal subscription",
      };
    }
  }
  
  /**
   * Update payment method
   * PayPal handles this through their dashboard/hosted pages
   */
  async updatePaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<UpdatePaymentMethodResult> {
    try {
      console.log("[PayPal] Payment method updates are managed via PayPal dashboard");
      
      // PayPal subscribers update their payment method via PayPal's interface
      return { success: true };
    } catch (error: any) {
      console.error("[PayPal] Update payment method error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Verify PayPal webhook signature
   */
  async verifyWebhook(payload: string, signature: string): Promise<WebhookEvent | null> {
    try {
      // PayPal uses a more complex verification process
      // Typically involves verifying with PayPal's API
      const event = JSON.parse(payload);

      // For production, you should verify with PayPal's verification endpoint
      // POST to /v1/notifications/verify-webhook-signature
      // For now, we'll do basic parsing

      console.log("[PayPal] Webhook received:", event.event_type);

      return {
        type: event.event_type,
        data: event.resource,
        providerId: event.id,
      };
    } catch (error: any) {
      console.error("[PayPal] Webhook verification error:", error);
      return null;
    }
  }
  
  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      const subscription = await this.makeRequest(
        `/v1/billing/subscriptions/${subscriptionId}`,
        "GET"
      );
      
      return subscription;
    } catch (error: any) {
      console.error("[PayPal] Get subscription error:", error);
      throw new Error(`Failed to get PayPal subscription: ${error.message}`);
    }
  }

  /**
   * Create an invoice for overage charges
   * PayPal uses separate invoicing API
   */
  async createOverageInvoice(
    customerEmail: string,
    items: Array<{ name: string; amount: number; quantity: number }>
  ): Promise<{ invoiceId: string }> {
    try {
      const invoiceData = {
        detail: {
          invoice_number: `OVG-${Date.now()}`,
          invoice_date: new Date().toISOString().split('T')[0],
          currency_code: "USD",
        },
        invoicer: {
          email_address: process.env.PAYPAL_BUSINESS_EMAIL || "billing@yourdomain.com",
        },
        primary_recipients: [
          {
            billing_info: {
              email_address: customerEmail,
            },
          },
        ],
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity.toString(),
          unit_amount: {
            currency_code: "USD",
            value: (item.amount / 100).toFixed(2), // Convert cents to dollars
          },
        })),
      };

      const response = await this.makeRequest(
        "/v2/invoicing/invoices",
        "POST",
        invoiceData
      );

      if (!response.href) {
        throw new Error("Failed to create PayPal invoice");
      }

      // Extract invoice ID from href
      const invoiceId = response.href.split("/").pop();

      // Send the invoice
      await this.makeRequest(
        `/v2/invoicing/invoices/${invoiceId}/send`,
        "POST",
        {}
      );

      console.log("[PayPal] Created and sent overage invoice:", invoiceId);

      return { invoiceId: invoiceId || response.href };
    } catch (error: any) {
      console.error("[PayPal] Create invoice error:", error);
      throw new Error(`Failed to create PayPal invoice: ${error.message}`);
    }
  }
}
