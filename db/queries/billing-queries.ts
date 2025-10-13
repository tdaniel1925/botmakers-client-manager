// Billing Queries - Database operations for subscription management

import { db } from "../db";
import {
  subscriptionPlansTable,
  organizationSubscriptionsTable,
  usageRecordsTable,
  invoicesTable,
  type SelectSubscriptionPlan,
  type InsertSubscriptionPlan,
  type SelectOrganizationSubscription,
  type InsertOrganizationSubscription,
  type SelectUsageRecord,
  type InsertUsageRecord,
  type SelectInvoice,
  type InsertInvoice,
} from "../schema/billing-schema";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";

// ===== SUBSCRIPTION PLANS =====

export async function getAllPlans(): Promise<SelectSubscriptionPlan[]> {
  return await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.isActive, true))
    .orderBy(subscriptionPlansTable.displayOrder);
}

export async function getPlanById(planId: string): Promise<SelectSubscriptionPlan | null> {
  const results = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.id, planId))
    .limit(1);
  
  return results[0] || null;
}

export async function getPlanBySlug(slug: string): Promise<SelectSubscriptionPlan | null> {
  const results = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.slug, slug))
    .limit(1);
  
  return results[0] || null;
}

export async function createPlan(plan: InsertSubscriptionPlan): Promise<SelectSubscriptionPlan> {
  const results = await db
    .insert(subscriptionPlansTable)
    .values(plan)
    .returning();
  
  return results[0];
}

export async function updatePlan(
  planId: string,
  updates: Partial<InsertSubscriptionPlan>
): Promise<SelectSubscriptionPlan | null> {
  const results = await db
    .update(subscriptionPlansTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(subscriptionPlansTable.id, planId))
    .returning();
  
  return results[0] || null;
}

// ===== ORGANIZATION SUBSCRIPTIONS =====

export async function getActiveSubscription(
  organizationId: string
): Promise<SelectOrganizationSubscription | null> {
  const results = await db
    .select()
    .from(organizationSubscriptionsTable)
    .where(
      and(
        eq(organizationSubscriptionsTable.organizationId, organizationId),
        eq(organizationSubscriptionsTable.status, "active")
      )
    )
    .orderBy(desc(organizationSubscriptionsTable.createdAt))
    .limit(1);
  
  return results[0] || null;
}

export async function getSubscriptionById(
  subscriptionId: string
): Promise<SelectOrganizationSubscription | null> {
  const results = await db
    .select()
    .from(organizationSubscriptionsTable)
    .where(eq(organizationSubscriptionsTable.id, subscriptionId))
    .limit(1);
  
  return results[0] || null;
}

export async function createSubscription(
  subscription: InsertOrganizationSubscription
): Promise<SelectOrganizationSubscription> {
  const results = await db
    .insert(organizationSubscriptionsTable)
    .values(subscription)
    .returning();
  
  return results[0];
}

export async function updateSubscription(
  subscriptionId: string,
  updates: Partial<InsertOrganizationSubscription>
): Promise<SelectOrganizationSubscription | null> {
  const results = await db
    .update(organizationSubscriptionsTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(organizationSubscriptionsTable.id, subscriptionId))
    .returning();
  
  return results[0] || null;
}

export async function incrementUsage(
  subscriptionId: string,
  minutesUsed: number,
  overageCost: number = 0
): Promise<SelectOrganizationSubscription | null> {
  const results = await db
    .update(organizationSubscriptionsTable)
    .set({
      minutesUsedThisCycle: sql`${organizationSubscriptionsTable.minutesUsedThisCycle} + ${minutesUsed}`,
      overageMinutesThisCycle: sql`GREATEST(0, ${organizationSubscriptionsTable.minutesUsedThisCycle} + ${minutesUsed} - ${organizationSubscriptionsTable.minutesIncludedThisCycle})`,
      overageCostThisCycle: sql`${organizationSubscriptionsTable.overageCostThisCycle} + ${overageCost}`,
      updatedAt: new Date(),
    })
    .where(eq(organizationSubscriptionsTable.id, subscriptionId))
    .returning();
  
  return results[0] || null;
}

export async function resetUsageCycle(
  subscriptionId: string,
  newPeriodStart: Date,
  newPeriodEnd: Date
): Promise<SelectOrganizationSubscription | null> {
  const results = await db
    .update(organizationSubscriptionsTable)
    .set({
      currentPeriodStart: newPeriodStart,
      currentPeriodEnd: newPeriodEnd,
      minutesUsedThisCycle: 0,
      overageMinutesThisCycle: 0,
      overageCostThisCycle: 0,
      updatedAt: new Date(),
    })
    .where(eq(organizationSubscriptionsTable.id, subscriptionId))
    .returning();
  
  return results[0] || null;
}

// Get subscriptions that need billing cycle reset
export async function getSubscriptionsDueForReset(): Promise<SelectOrganizationSubscription[]> {
  return await db
    .select()
    .from(organizationSubscriptionsTable)
    .where(
      and(
        eq(organizationSubscriptionsTable.status, "active"),
        sql`${organizationSubscriptionsTable.currentPeriodEnd} <= NOW()`
      )
    );
}

// ===== USAGE RECORDS =====

export async function createUsageRecord(
  usage: InsertUsageRecord
): Promise<SelectUsageRecord> {
  const results = await db
    .insert(usageRecordsTable)
    .values(usage)
    .returning();
  
  return results[0];
}

export async function getUsageForPeriod(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<SelectUsageRecord[]> {
  return await db
    .select()
    .from(usageRecordsTable)
    .where(
      and(
        eq(usageRecordsTable.organizationId, organizationId),
        gte(usageRecordsTable.createdAt, periodStart),
        lte(usageRecordsTable.createdAt, periodEnd)
      )
    )
    .orderBy(desc(usageRecordsTable.createdAt));
}

export async function getUsageForSubscription(
  subscriptionId: string
): Promise<SelectUsageRecord[]> {
  return await db
    .select()
    .from(usageRecordsTable)
    .where(eq(usageRecordsTable.subscriptionId, subscriptionId))
    .orderBy(desc(usageRecordsTable.createdAt));
}

export async function markUsageAsReported(
  usageRecordId: string,
  externalId: string
): Promise<SelectUsageRecord | null> {
  const results = await db
    .update(usageRecordsTable)
    .set({
      reportedToProvider: true,
      externalUsageRecordId: externalId,
    })
    .where(eq(usageRecordsTable.id, usageRecordId))
    .returning();
  
  return results[0] || null;
}

// ===== INVOICES =====

export async function createInvoice(
  invoice: InsertInvoice
): Promise<SelectInvoice> {
  const results = await db
    .insert(invoicesTable)
    .values(invoice)
    .returning();
  
  return results[0];
}

export async function getInvoiceById(invoiceId: string): Promise<SelectInvoice | null> {
  const results = await db
    .select()
    .from(invoicesTable)
    .where(eq(invoicesTable.id, invoiceId))
    .limit(1);
  
  return results[0] || null;
}

export async function getInvoicesByOrganization(
  organizationId: string
): Promise<SelectInvoice[]> {
  return await db
    .select()
    .from(invoicesTable)
    .where(eq(invoicesTable.organizationId, organizationId))
    .orderBy(desc(invoicesTable.createdAt));
}

export async function updateInvoice(
  invoiceId: string,
  updates: Partial<InsertInvoice>
): Promise<SelectInvoice | null> {
  const results = await db
    .update(invoicesTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(invoicesTable.id, invoiceId))
    .returning();
  
  return results[0] || null;
}

export async function markInvoiceAsPaid(
  invoiceId: string,
  paidAt: Date = new Date()
): Promise<SelectInvoice | null> {
  const results = await db
    .update(invoicesTable)
    .set({
      status: "paid",
      paidAt,
      updatedAt: new Date(),
    })
    .where(eq(invoicesTable.id, invoiceId))
    .returning();
  
  return results[0] || null;
}

// ===== ANALYTICS =====

export async function getOrganizationUsageStats(organizationId: string) {
  const activeSubscription = await getActiveSubscription(organizationId);
  
  if (!activeSubscription) {
    return null;
  }
  
  const usageRecords = await getUsageForPeriod(
    organizationId,
    activeSubscription.currentPeriodStart,
    activeSubscription.currentPeriodEnd
  );
  
  const totalMinutes = usageRecords.reduce((sum, record) => sum + record.minutesUsed, 0);
  const totalCost = usageRecords.reduce((sum, record) => sum + record.costInCents, 0);
  
  return {
    subscription: activeSubscription,
    currentPeriod: {
      start: activeSubscription.currentPeriodStart,
      end: activeSubscription.currentPeriodEnd,
    },
    usage: {
      minutesIncluded: activeSubscription.minutesIncludedThisCycle,
      minutesUsed: activeSubscription.minutesUsedThisCycle,
      minutesRemaining: Math.max(
        0,
        (activeSubscription.minutesIncludedThisCycle || 0) - (activeSubscription.minutesUsedThisCycle || 0)
      ),
      overageMinutes: activeSubscription.overageMinutesThisCycle,
      overageCost: activeSubscription.overageCostThisCycle,
      totalCost,
      percentageUsed: Math.round(
        ((activeSubscription.minutesUsedThisCycle || 0) / (activeSubscription.minutesIncludedThisCycle || 1)) * 100
      ),
    },
    callCount: usageRecords.length,
  };
}
