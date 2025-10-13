/**
 * Profiles Schema
 * User profile and subscription management
 */

// @ts-nocheck - Temporary: Schema type inference issues

import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

// ============================================================================
// Enums
// ============================================================================

export const membershipEnum = pgEnum("membership", ["free", "pro"]);
export const paymentProviderEnum = pgEnum("payment_provider", ["stripe", "whop"]);

// ============================================================================
// Profiles Table
// ============================================================================

export const profilesTable = pgTable("profiles", {
  userId: text("user_id").primaryKey().notNull(),
  
  // Membership
  membership: membershipEnum("membership").default("free").notNull(),
  
  // Stripe integration
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  
  // Payment provider
  paymentProvider: paymentProviderEnum("payment_provider").default("whop"),
  
  // Whop integration
  whopUserId: text("whop_user_id"),
  whopMembershipId: text("whop_membership_id"),
  
  // User info
  email: text("email"),
  
  // Billing cycle
  billingCycleStart: timestamp("billing_cycle_start"),
  billingCycleEnd: timestamp("billing_cycle_end"),
  nextCreditRenewal: timestamp("next_credit_renewal"),
  
  // Usage tracking
  usageCredits: integer("usage_credits").default(0),
  usedCredits: integer("used_credits").default(0),
  
  // Status
  status: text("status").default("active"),
  
  // Plan duration (changed from enum to text)
  planDuration: text("plan_duration"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ============================================================================
// Type Exports
// ============================================================================

export type InsertProfile = typeof profilesTable.$inferInsert;
export type SelectProfile = typeof profilesTable.$inferSelect;
