import { pgEnum, pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { organizationsTable } from "./crm-schema";
import { platformAdminsTable } from "./platform-schema";

// Support ticket enums
export const ticketCategoryEnum = pgEnum("ticket_category", [
  "billing",
  "technical",
  "feature_request",
  "bug_report",
  "account",
  "other"
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "low",
  "medium",
  "high",
  "critical"
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "waiting_response",
  "resolved",
  "closed"
]);

export const senderTypeEnum = pgEnum("sender_type", [
  "user",
  "platform_admin"
]);

// Support tickets table
export const supportTicketsTable = pgTable("support_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  createdBy: text("created_by").notNull(), // Clerk user ID of the person who created the ticket
  assignedTo: uuid("assigned_to").references(() => platformAdminsTable.id, { onDelete: "set null" }), // Platform admin assigned to ticket
  
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  category: ticketCategoryEnum("category").notNull().default("other"),
  priority: ticketPriorityEnum("priority").notNull().default("medium"),
  status: ticketStatusEnum("status").notNull().default("open"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
});

// Support messages table - for ticket conversation thread
export const supportMessagesTable = pgTable("support_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketId: uuid("ticket_id").notNull().references(() => supportTicketsTable.id, { onDelete: "cascade" }),
  senderId: text("sender_id").notNull(), // Clerk user ID or platform admin ID
  senderType: senderTypeEnum("sender_type").notNull(),
  
  message: text("message").notNull(),
  isInternalNote: boolean("is_internal_note").notNull().default(false), // Only visible to platform admins
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type InsertSupportTicket = typeof supportTicketsTable.$inferInsert;
export type SelectSupportTicket = typeof supportTicketsTable.$inferSelect;

export type InsertSupportMessage = typeof supportMessagesTable.$inferInsert;
export type SelectSupportMessage = typeof supportMessagesTable.$inferSelect;

