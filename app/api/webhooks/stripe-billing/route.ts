// Stripe Billing Webhooks
// Handle subscription lifecycle events from Stripe

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getPaymentProvider } from "@/lib/payment-providers/provider-factory";
import {
  getActiveSubscription,
  updateSubscription,
  createInvoice,
  markInvoiceAsPaid,
} from "@/db/queries/billing-queries";
import { updateOrganization } from "@/db/queries/organizations-queries";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");
    
    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }
    
    // Verify webhook signature
    const provider = getPaymentProvider("stripe");
    const event = await provider.verifyWebhook(body, signature);
    
    if (!event) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }
    
    console.log(`[Stripe Webhook] Received event: ${event.type}`);
    
    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data);
        break;
        
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data);
        break;
        
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data);
        break;
        
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data);
        break;
        
      case "customer.subscription.trial_will_end":
        // TODO: Send notification to organization
        console.log("[Stripe] Trial ending soon for subscription:", event.data.id);
        break;
        
      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionUpdate(subscription: any) {
  try {
    const organizationId = subscription.metadata?.organizationId;
    
    if (!organizationId) {
      console.error("[Stripe] No organizationId in subscription metadata");
      return;
    }
    
    // Get existing subscription record
    const existingSubscription = await getActiveSubscription(organizationId);
    
    if (!existingSubscription) {
      console.error("[Stripe] No existing subscription found for organization:", organizationId);
      return;
    }
    
    // Update subscription status
    const periodStart = new Date(subscription.current_period_start * 1000);
    const periodEnd = new Date(subscription.current_period_end * 1000);
    
    await updateSubscription(existingSubscription.id, {
      status: subscription.status,
      externalSubscriptionId: subscription.id,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
    
    // Update organization status if subscription is canceled
    if (subscription.status === "canceled" || subscription.status === "unpaid") {
      await updateOrganization(organizationId, {
        status: "suspended",
      });
    } else if (subscription.status === "active") {
      await updateOrganization(organizationId, {
        status: "active",
      });
    }
    
    console.log(`[Stripe] Updated subscription for org ${organizationId}: ${subscription.status}`);
  } catch (error) {
    console.error("[Stripe] handleSubscriptionUpdate error:", error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const organizationId = subscription.metadata?.organizationId;
    
    if (!organizationId) {
      return;
    }
    
    const existingSubscription = await getActiveSubscription(organizationId);
    
    if (existingSubscription) {
      await updateSubscription(existingSubscription.id, {
        status: "canceled",
        canceledAt: new Date(),
      });
      
      await updateOrganization(organizationId, {
        status: "cancelled",
      });
    }
    
    console.log(`[Stripe] Subscription deleted for org ${organizationId}`);
  } catch (error) {
    console.error("[Stripe] handleSubscriptionDeleted error:", error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    const organizationId = invoice.subscription_metadata?.organizationId;
    
    if (!organizationId) {
      return;
    }
    
    const subscription = await getActiveSubscription(organizationId);
    
    if (!subscription) {
      return;
    }
    
    // Create or update invoice record
    const invoiceNumber = `INV-${invoice.number || invoice.id}`;
    
    await createInvoice({
      organizationId,
      subscriptionId: subscription.id,
      invoiceNumber,
      subscriptionAmount: invoice.amount_due || 0,
      usageAmount: 0, // Calculate from line items if needed
      subtotal: invoice.subtotal || 0,
      taxAmount: invoice.tax || 0,
      totalAmount: invoice.total || 0,
      minutesIncluded: subscription.minutesIncludedThisCycle,
      minutesUsed: subscription.minutesUsedThisCycle,
      overageMinutes: subscription.overageMinutesThisCycle,
      paymentProvider: "stripe",
      externalInvoiceId: invoice.id,
      status: "paid",
      periodStart: subscription.currentPeriodStart,
      periodEnd: subscription.currentPeriodEnd,
      paidAt: new Date(invoice.status_transitions?.paid_at * 1000 || Date.now()),
    });
    
    console.log(`[Stripe] Invoice paid for org ${organizationId}: ${invoiceNumber}`);
  } catch (error) {
    console.error("[Stripe] handleInvoicePaymentSucceeded error:", error);
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  try {
    const organizationId = invoice.subscription_metadata?.organizationId;
    
    if (!organizationId) {
      return;
    }
    
    // Update subscription status
    const subscription = await getActiveSubscription(organizationId);
    
    if (subscription) {
      await updateSubscription(subscription.id, {
        status: "past_due",
      });
      
      await updateOrganization(organizationId, {
        status: "suspended",
      });
    }
    
    // TODO: Send notification to organization about failed payment
    
    console.log(`[Stripe] Invoice payment failed for org ${organizationId}`);
  } catch (error) {
    console.error("[Stripe] handleInvoicePaymentFailed error:", error);
  }
}
