// Square Billing Webhook Handler
// Handles subscription events from Square

import { NextRequest, NextResponse } from "next/server";
import { SquarePaymentProvider } from "@/lib/payment-providers/square-provider";
import { 
  updateSubscription, 
  getActiveSubscription 
} from "@/db/queries/billing-queries";
import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { organizationSubscriptionsTable } from "@/db/schema/billing-schema";

// Lazy-load provider to avoid module-level initialization issues during build
let squareProvider: SquarePaymentProvider | null = null;
function getSquareProvider() {
  if (!squareProvider) {
    squareProvider = new SquarePaymentProvider();
  }
  return squareProvider;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-square-signature") || "";

    // Verify webhook signature
    const event = await getSquareProvider().verifyWebhook(body, signature);

    if (!event) {
      console.error("[Square Webhook] Signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("[Square Webhook] Event received:", event.type);

    // Handle different event types
    switch (event.type) {
      case "subscription.created":
        await handleSubscriptionCreated(event);
        break;

      case "subscription.updated":
        await handleSubscriptionUpdated(event);
        break;

      case "subscription.canceled":
        await handleSubscriptionCanceled(event);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event);
        break;

      default:
        console.log("[Square Webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Square Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(event: any) {
  try {
    const subscription = event.data;
    console.log("[Square Webhook] Subscription created:", subscription.id);

    // Subscription should already be in DB from createSubscription
    // Just log for confirmation
  } catch (error) {
    console.error("[Square Webhook] Handle subscription created error:", error);
  }
}

async function handleSubscriptionUpdated(event: any) {
  try {
    const subscription = event.data;
    console.log("[Square Webhook] Subscription updated:", subscription.id);

    // Find subscription in our DB
    const existingSubscription = await db
      .select()
      .from(organizationSubscriptionsTable)
      .where(eq(organizationSubscriptionsTable.externalSubscriptionId, subscription.id))
      .limit(1);

    if (existingSubscription.length === 0) {
      console.warn("[Square Webhook] Subscription not found in DB:", subscription.id);
      return;
    }

    // Update subscription status
    let status: any = "active";
    if (subscription.status === "ACTIVE") status = "active";
    else if (subscription.status === "CANCELED") status = "canceled";
    else if (subscription.status === "PAUSED") status = "paused";

    await updateSubscription(existingSubscription[0].id, {
      status,
      updatedAt: new Date(),
    });

    console.log("[Square Webhook] Updated subscription status:", status);
  } catch (error) {
    console.error("[Square Webhook] Handle subscription updated error:", error);
  }
}

async function handleSubscriptionCanceled(event: any) {
  try {
    const subscription = event.data;
    console.log("[Square Webhook] Subscription canceled:", subscription.id);

    // Find subscription in our DB
    const existingSubscription = await db
      .select()
      .from(organizationSubscriptionsTable)
      .where(eq(organizationSubscriptionsTable.externalSubscriptionId, subscription.id))
      .limit(1);

    if (existingSubscription.length === 0) {
      console.warn("[Square Webhook] Subscription not found in DB:", subscription.id);
      return;
    }

    // Update subscription to canceled
    await updateSubscription(existingSubscription[0].id, {
      status: "canceled",
      canceledAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("[Square Webhook] Subscription marked as canceled");
  } catch (error) {
    console.error("[Square Webhook] Handle subscription canceled error:", error);
  }
}

async function handlePaymentSucceeded(event: any) {
  try {
    const payment = event.data;
    console.log("[Square Webhook] Payment succeeded:", payment.id);

    // Log successful payment
    // Could create invoice record here
  } catch (error) {
    console.error("[Square Webhook] Handle payment succeeded error:", error);
  }
}

async function handlePaymentFailed(event: any) {
  try {
    const payment = event.data;
    console.log("[Square Webhook] Payment failed:", payment.id);

    // Find subscription and mark as past_due
    // Send notification to user
  } catch (error) {
    console.error("[Square Webhook] Handle payment failed error:", error);
  }
}

