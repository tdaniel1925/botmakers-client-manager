// Billing Schema - Subscription plans, organization subscriptions, usage tracking, and invoices
// This schema supports multi-payment provider (Stripe, Square, PayPal) SaaS billing

import { pgTable, text, timestamp, integer, boolean, uuid, jsonb } from "drizzle-orm/pg-core";
import { organizationsTable } from "./crm-schema";
import { voiceCampaignsTable } from "./voice-campaigns-schema";
import { callRecordsTable } from "./calls-schema";

// ===== SUBSCRIPTION PLANS =====

export const subscriptionPlansTable = pgTable("subscription_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(), // "Free", "Starter", "Professional", "Enterprise"
  slug: text("slug").notNull().unique(),
  description: text("description"),
  
  // Pricing
  monthlyPrice: integer("monthly_price").notNull(), // in cents
  includedMinutes: integer("included_minutes").notNull(),
  overageRatePerMinute: integer("overage_rate_per_minute").notNull(), // in cents
  
  // Limits
  maxActiveCampaigns: integer("max_active_campaigns").default(-1), // -1 = unlimited
  maxUsers: integer("max_users").default(5),
  
  // Features
  features: jsonb("features").default([]),
  
  // Display & Status
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  
  // Provider-specific product IDs
  stripeProductId: text("stripe_product_id"),
  stripePriceId: text("stripe_price_id"),
  stripeMeteredPriceId: text("stripe_metered_price_id"), // For usage-based billing
  squareProductId: text("square_product_id"),
  squarePlanId: text("square_plan_id"),
  paypalPlanId: text("paypal_plan_id"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ===== ORGANIZATION SUBSCRIPTIONS =====

export const organizationSubscriptionsTable = pgTable("organization_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizationsTable.id, { onDelete: "cascade" })
    .notNull(),
  planId: uuid("plan_id")
    .references(() => subscriptionPlansTable.id)
    .notNull(),
  
  // Payment provider details
  paymentProvider: text("payment_provider").notNull(), // "stripe", "square", "paypal"
  externalSubscriptionId: text("external_subscription_id"), // Provider's subscription ID
  externalCustomerId: text("external_customer_id"),
  
  // Billing cycle (30-day rolling from subscription date)
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  
  // Usage tracking for current cycle
  minutesUsedThisCycle: integer("minutes_used_this_cycle").default(0),
  minutesIncludedThisCycle: integer("minutes_included_this_cycle").notNull(),
  overageMinutesThisCycle: integer("overage_minutes_this_cycle").default(0),
  overageCostThisCycle: integer("overage_cost_this_cycle").default(0), // in cents
  
  // Status
  status: text("status").notNull().default("active"), // active, past_due, canceled, trialing, paused
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  trialEndsAt: timestamp("trial_ends_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  canceledAt: timestamp("canceled_at"),
});

// ===== USAGE RECORDS =====

export const usageRecordsTable = pgTable("usage_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizationsTable.id, { onDelete: "cascade" })
    .notNull(),
  subscriptionId: uuid("subscription_id")
    .references(() => organizationSubscriptionsTable.id),
  campaignId: uuid("campaign_id")
    .references(() => voiceCampaignsTable.id),
  callRecordId: uuid("call_record_id")
    .references(() => callRecordsTable.id),
  
  // Usage details
  durationInSeconds: integer("duration_in_seconds").notNull(),
  minutesUsed: integer("minutes_used").notNull(), // Rounded up
  costInCents: integer("cost_in_cents").notNull(),
  wasOverage: boolean("was_overage").default(false),
  ratePerMinute: integer("rate_per_minute").notNull(), // Rate at time of usage
  
  // Billing period this usage belongs to
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  billingPeriodEnd: timestamp("billing_period_end").notNull(),
  
  // External tracking (for metered billing providers)
  reportedToProvider: boolean("reported_to_provider").default(false),
  externalUsageRecordId: text("external_usage_record_id"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== INVOICES =====

export const invoicesTable = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizationsTable.id, { onDelete: "cascade" })
    .notNull(),
  subscriptionId: uuid("subscription_id")
    .references(() => organizationSubscriptionsTable.id),
  
  // Invoice details
  invoiceNumber: text("invoice_number").notNull().unique(),
  
  // Amounts (all in cents)
  subscriptionAmount: integer("subscription_amount").notNull(), // base plan cost
  usageAmount: integer("usage_amount").default(0), // overage charges
  subtotal: integer("subtotal").notNull(),
  taxAmount: integer("tax_amount").default(0),
  totalAmount: integer("total_amount").notNull(),
  
  // Usage summary
  minutesIncluded: integer("minutes_included").notNull(),
  minutesUsed: integer("minutes_used").notNull(),
  overageMinutes: integer("overage_minutes").default(0),
  
  // Payment details
  paymentProvider: text("payment_provider").notNull(),
  externalInvoiceId: text("external_invoice_id"),
  status: text("status").notNull(), // draft, open, paid, void, uncollectible
  
  // Period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Dates
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ===== TYPES =====

export type SelectSubscriptionPlan = typeof subscriptionPlansTable.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlansTable.$inferInsert;

export type SelectOrganizationSubscription = typeof organizationSubscriptionsTable.$inferSelect;
export type InsertOrganizationSubscription = typeof organizationSubscriptionsTable.$inferInsert;

export type SelectUsageRecord = typeof usageRecordsTable.$inferSelect;
export type InsertUsageRecord = typeof usageRecordsTable.$inferInsert;

export type SelectInvoice = typeof invoicesTable.$inferSelect;
export type InsertInvoice = typeof invoicesTable.$inferInsert;
