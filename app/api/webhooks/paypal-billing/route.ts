// PayPal Billing Webhook Handler
// Handles subscription events from PayPal

import { NextRequest, NextResponse } from "next/server";
import { PayPalPaymentProvider } from "@/lib/payment-providers/paypal-provider";
import { 
  updateSubscription, 
  getActiveSubscription 
} from "@/db/queries/billing-queries";
import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { organizationSubscriptionsTable } from "@/db/schema/billing-schema";

// Lazy-load provider to avoid module-level initialization issues during build
let paypalProvider: PayPalPaymentProvider | null = null;
function getPayPalProvider() {
  if (!paypalProvider) {
    paypalProvider = new PayPalPaymentProvider();
  }
  return paypalProvider;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("paypal-transmission-sig") || "";

    // Verify webhook signature
    const event = await getPayPalProvider().verifyWebhook(body, signature);

    if (!event) {
      console.error("[PayPal Webhook] Signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("[PayPal Webhook] Event received:", event.type);

    // Handle different event types
    switch (event.type) {
      case "BILLING.SUBSCRIPTION.CREATED":
        await handleSubscriptionCreated(event);
        break;

      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleSubscriptionActivated(event);
        break;

      case "BILLING.SUBSCRIPTION.UPDATED":
        await handleSubscriptionUpdated(event);
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
        await handleSubscriptionCanceled(event);
        break;

      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await handleSubscriptionSuspended(event);
        break;

      case "PAYMENT.SALE.COMPLETED":
        await handlePaymentCompleted(event);
        break;

      case "PAYMENT.SALE.DENIED":
        await handlePaymentFailed(event);
        break;

      default:
        console.log("[PayPal Webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[PayPal Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(event: any) {
  try {
    const subscription = event.data;
    console.log("[PayPal Webhook] Subscription created:", subscription.id);

    // Subscription created but not yet activated
    // Wait for ACTIVATED event
  } catch (error) {
    console.error("[PayPal Webhook] Handle subscription created error:", error);
  }
}

async function handleSubscriptionActivated(event: any) {
  try {
    const subscription = event.data;
    console.log("[PayPal Webhook] Subscription activated:", subscription.id);

    // Find subscription in our DB
    const existingSubscription = await db
      .select()
      .from(organizationSubscriptionsTable)
      .where(eq(organizationSubscriptionsTable.externalSubscriptionId, subscription.id))
      .limit(1);

    if (existingSubscription.length === 0) {
      console.warn("[PayPal Webhook] Subscription not found in DB:", subscription.id);
      return;
    }

    // Update subscription to active
    await updateSubscription(existingSubscription[0].id, {
      status: "active",
      updatedAt: new Date(),
    });

    console.log("[PayPal Webhook] Subscription marked as active");
  } catch (error) {
    console.error("[PayPal Webhook] Handle subscription activated error:", error);
  }
}

async function handleSubscriptionUpdated(event: any) {
  try {
    const subscription = event.data;
    console.log("[PayPal Webhook] Subscription updated:", subscription.id);

    // Find subscription in our DB
    const existingSubscription = await db
      .select()
      .from(organizationSubscriptionsTable)
      .where(eq(organizationSubscriptionsTable.externalSubscriptionId, subscription.id))
      .limit(1);

    if (existingSubscription.length === 0) {
      console.warn("[PayPal Webhook] Subscription not found in DB:", subscription.id);
      return;
    }

    // Map PayPal status to our status
    let status: any = "active";
    if (subscription.status === "ACTIVE") status = "active";
    else if (subscription.status === "CANCELLED") status = "canceled";
    else if (subscription.status === "SUSPENDED") status = "past_due";
    else if (subscription.status === "EXPIRED") status = "canceled";

    await updateSubscription(existingSubscription[0].id, {
      status,
      updatedAt: new Date(),
    });

    console.log("[PayPal Webhook] Updated subscription status:", status);
  } catch (error) {
    console.error("[PayPal Webhook] Handle subscription updated error:", error);
  }
}

async function handleSubscriptionCanceled(event: any) {
  try {
    const subscription = event.data;
    console.log("[PayPal Webhook] Subscription canceled:", subscription.id);

    // Find subscription in our DB
    const existingSubscription = await db
      .select()
      .from(organizationSubscriptionsTable)
      .where(eq(organizationSubscriptionsTable.externalSubscriptionId, subscription.id))
      .limit(1);

    if (existingSubscription.length === 0) {
      console.warn("[PayPal Webhook] Subscription not found in DB:", subscription.id);
      return;
    }

    // Update subscription to canceled
    await updateSubscription(existingSubscription[0].id, {
      status: "canceled",
      canceledAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("[PayPal Webhook] Subscription marked as canceled");
  } catch (error) {
    console.error("[PayPal Webhook] Handle subscription canceled error:", error);
  }
}

async function handleSubscriptionSuspended(event: any) {
  try {
    const subscription = event.data;
    console.log("[PayPal Webhook] Subscription suspended:", subscription.id);

    // Find subscription in our DB
    const existingSubscription = await db
      .select()
      .from(organizationSubscriptionsTable)
      .where(eq(organizationSubscriptionsTable.externalSubscriptionId, subscription.id))
      .limit(1);

    if (existingSubscription.length === 0) {
      console.warn("[PayPal Webhook] Subscription not found in DB:", subscription.id);
      return;
    }

    // Update subscription to past_due (suspended due to payment issues)
    await updateSubscription(existingSubscription[0].id, {
      status: "past_due",
      updatedAt: new Date(),
    });

    console.log("[PayPal Webhook] Subscription marked as past_due");
  } catch (error) {
    console.error("[PayPal Webhook] Handle subscription suspended error:", error);
  }
}

async function handlePaymentCompleted(event: any) {
  try {
    const sale = event.data;
    console.log("[PayPal Webhook] Payment completed:", sale.id);

    // Log successful payment
    // Could create invoice record here
  } catch (error) {
    console.error("[PayPal Webhook] Handle payment completed error:", error);
  }
}

async function handlePaymentFailed(event: any) {
  try {
    const sale = event.data;
    console.log("[PayPal Webhook] Payment failed:", sale.id);

    // Find subscription and mark as past_due
    // Send notification to user
  } catch (error) {
    console.error("[PayPal Webhook] Handle payment failed error:", error);
  }
}

