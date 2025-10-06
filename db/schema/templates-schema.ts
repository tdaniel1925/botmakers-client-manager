import { pgTable, text, timestamp, boolean, integer, uuid, jsonb } from "drizzle-orm/pg-core";

// Notification templates table
export const notificationTemplatesTable = pgTable("notification_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'email' or 'sms'
  category: text("category").notNull(),
  subject: text("subject"), // For emails only
  bodyText: text("body_text").notNull(), // Plain text for SMS, text version for email
  bodyHtml: text("body_html"), // For emails only
  variables: jsonb("variables").default([]), // Available variables
  isActive: boolean("is_active").default(true),
  isSystem: boolean("is_system").default(true), // System templates can't be deleted
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Type exports
export type InsertNotificationTemplate = typeof notificationTemplatesTable.$inferInsert;
export type SelectNotificationTemplate = typeof notificationTemplatesTable.$inferSelect;

// Template variable type
export interface TemplateVariable {
  key: string;
  label: string;
  example: string;
}
