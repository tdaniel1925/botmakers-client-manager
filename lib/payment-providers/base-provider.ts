// Base Payment Provider Interface
// All payment providers (Stripe, Square, PayPal) must implement this interface

export interface SubscriptionParams {
  organizationId: string;
  planId: string;
  customerId?: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  customerId?: string;
  status?: string;
  error?: string;
}

export interface CancelSubscriptionResult {
  success: boolean;
  canceledAt?: Date;
  error?: string;
}

export interface UpdatePaymentMethodResult {
  success: boolean;
  error?: string;
}

export interface MeteredUsageParams {
  subscriptionId: string;
  quantity: number; // minutes used
  timestamp?: Date;
  idempotencyKey?: string;
}

export interface WebhookEvent {
  type: string;
  data: any;
  providerId: string;
}

export abstract class BasePaymentProvider {
  protected apiKey: string;
  protected webhookSecret: string;
  
  constructor(apiKey: string, webhookSecret: string) {
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
  }
  
  /**
   * Get the provider name
   */
  abstract getProviderName(): "stripe" | "square" | "paypal";
  
  /**
   * Create a new subscription for an organization
   */
  abstract createSubscription(params: SubscriptionParams): Promise<SubscriptionResult>;
  
  /**
   * Report metered usage (for overage billing)
   */
  abstract reportMeteredUsage(params: MeteredUsageParams): Promise<{ success: boolean; error?: string }>;
  
  /**
   * Cancel a subscription
   */
  abstract cancelSubscription(subscriptionId: string, immediate?: boolean): Promise<CancelSubscriptionResult>;
  
  /**
   * Update payment method for a customer
   */
  abstract updatePaymentMethod(customerId: string, paymentMethodId: string): Promise<UpdatePaymentMethodResult>;
  
  /**
   * Verify and parse webhook signature
   */
  abstract verifyWebhook(payload: string, signature: string): Promise<WebhookEvent | null>;
  
  /**
   * Create a customer in the payment provider
   */
  abstract createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<{ customerId: string }>;
  
  /**
   * Get subscription details
   */
  abstract getSubscription(subscriptionId: string): Promise<any>;
}
