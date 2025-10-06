import { pgTable, text, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { organizationsTable } from "./crm-schema";

// Audit logs table - tracks all important actions across the platform
export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizationsTable.id, { onDelete: "cascade" }), // Null for platform-level actions
  userId: text("user_id").notNull(), // Clerk user ID of who performed the action
  
  action: text("action").notNull(), // e.g., "create", "update", "delete", "suspend", etc.
  entityType: text("entity_type").notNull(), // e.g., "contact", "deal", "organization", "user"
  entityId: uuid("entity_id"), // ID of the entity that was acted upon
  
  changes: jsonb("changes"), // JSON object showing what changed (before/after)
  ipAddress: text("ip_address"), // IP address of the user
  userAgent: text("user_agent"), // Browser/client info
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type InsertAuditLog = typeof auditLogsTable.$inferInsert;
export type SelectAuditLog = typeof auditLogsTable.$inferSelect;

