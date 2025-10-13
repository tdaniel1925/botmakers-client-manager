/**
 * Impersonation Schema
 * Tracks when platform admins impersonate organizations for support/testing
 */

// @ts-nocheck - Temporary: Schema type inference issues

import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { organizationsTable } from "./crm-schema";

export const impersonationSessionsTable = pgTable("impersonation_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Who is impersonating
  adminUserId: text("admin_user_id").notNull(), // Clerk user ID of the admin
  adminEmail: text("admin_email").notNull(),
  
  // Which organization are they impersonating
  organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  organizationName: text("organization_name").notNull(),
  
  // Session tracking
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  isActive: boolean("is_active").default(true).notNull(),
  
  // Audit trail
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  reason: text("reason"), // Optional reason for impersonation
  
  // Actions taken during session (for audit)
  actionsLog: text("actions_log").array().default([]), // Array of action descriptions
});

export type InsertImpersonationSession = typeof impersonationSessionsTable.$inferInsert;
export type SelectImpersonationSession = typeof impersonationSessionsTable.$inferSelect;
