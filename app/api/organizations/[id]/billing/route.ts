// Billing API Route
// Returns billing data for an organization

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getActiveSubscription, getPlanById } from "@/db/queries/billing-queries";
import { getOrganizationById } from "@/db/queries/organizations-queries";
import { getActiveCampaignsByProject } from "@/db/queries/voice-campaigns-queries";
import { db } from "@/db/db";
import { usageRecordsTable, invoicesTable } from "@/db/schema/billing-schema";
import { projectsTable } from "@/db/schema";
import { eq, and, desc, between } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = params.id;

    // Get organization
    const organization = await getOrganizationById(organizationId);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Get active subscription
    const subscription = await getActiveSubscription(organizationId);
    if (!subscription) {
      return NextResponse.json({ error: "No active subscription" }, { status: 404 });
    }

    // Get plan details
    const plan = await getPlanById(subscription.planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Calculate usage for current billing period
    const usageRecords = await db
      .select()
      .from(usageRecordsTable)
      .where(
        and(
          eq(usageRecordsTable.organizationId, organizationId),
          eq(usageRecordsTable.subscriptionId, subscription.id),
          between(
            usageRecordsTable.createdAt,
            subscription.currentPeriodStart,
            subscription.currentPeriodEnd
          )
        )
      );

    // Calculate total minutes used
    const totalMinutesUsed = usageRecords.reduce((sum, record) => {
      return sum + parseFloat(record.minutesUsed.toString());
    }, 0);

    const minutesRemaining = Math.max(0, plan.includedMinutes - totalMinutesUsed);
    const overageMinutes = Math.max(0, totalMinutesUsed - plan.includedMinutes);
    const overageCost = overageMinutes * plan.overageRatePerMinute;

    // Get active campaigns count
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.organizationId, organizationId));

    let activeCampaignsCount = 0;
    for (const project of projects) {
      const campaigns = await getActiveCampaignsByProject(project.id);
      activeCampaignsCount += campaigns.length;
    }

    // Get recent invoices
    const invoices = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.organizationId, organizationId))
      .orderBy(desc(invoicesTable.createdAt))
      .limit(10);

    // Build response
    const billingData = {
      plan: {
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        priceMonthly: plan.monthlyPrice,
        freeMinutes: plan.includedMinutes,
        perMinuteOverageRate: plan.overageRatePerMinute,
        maxActiveCampaigns: plan.maxActiveCampaigns,
        features: plan.features || [],
      },
      subscription: {
        id: subscription.id,
        status: subscription.status,
        provider: subscription.paymentProvider,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
      usage: {
        minutesUsed: Math.round(totalMinutesUsed),
        minutesRemaining: Math.round(minutesRemaining),
        overageMinutes: Math.round(overageMinutes),
        overageCost: overageCost,
        activeCampaigns: activeCampaignsCount,
      },
      invoices: invoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amountDue: invoice.totalAmount,
        status: invoice.status,
        periodStart: invoice.periodStart,
        periodEnd: invoice.periodEnd,
        paidAt: invoice.paidAt,
      })),
    };

    return NextResponse.json(billingData);
  } catch (error: any) {
    console.error("[Billing API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load billing data" },
      { status: 500 }
    );
  }
}

