import { pgEnum, pgTable, text, timestamp, integer, boolean, decimal, uuid, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enums
export const contactStatusEnum = pgEnum("contact_status", ["lead", "active", "inactive", "archived"]);
export const dealStageEnum = pgEnum("deal_stage", ["lead", "qualified", "proposal", "negotiation", "won", "lost"]);
export const activityTypeEnum = pgEnum("activity_type", ["call", "email", "meeting", "task", "note"]);
export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "sales_rep"]);
export const organizationPlanEnum = pgEnum("organization_plan", ["free", "pro", "enterprise"]);
export const organizationStatusEnum = pgEnum("organization_status", ["active", "trial", "suspended", "cancelled"]);

// Organizations table
export const organizationsTable = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // For URL routing (e.g., acme-corp)
  
  // Plan & Status
  plan: organizationPlanEnum("plan").notNull().default("free"),
  status: organizationStatusEnum("status").notNull().default("active"),
  trialEndsAt: timestamp("trial_ends_at"),
  
  // Billing (moved from profiles - org-level billing)
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  
  // Limits & Settings
  maxUsers: integer("max_users").default(5),
  maxStorageGb: integer("max_storage_gb").default(10),
  settings: text("settings").default('{}'), // JSONB stored as text
  featureFlags: text("feature_flags").default('{}'), // JSONB stored as text
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  suspendedAt: timestamp("suspended_at"),
  cancelledAt: timestamp("cancelled_at"),
});

// User roles table (maps Clerk users to organizations with roles)
export const userRolesTable = pgTable("user_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(), // Clerk user ID
  organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").notNull().default("sales_rep"),
  phoneNumber: text("phone_number"),
  smsNotificationsEnabled: boolean("sms_notifications_enabled").default(false),
  notificationPreferences: jsonb("notification_preferences").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Contacts table
export const contactsTable = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  jobTitle: text("job_title"),
  status: contactStatusEnum("status").notNull().default("lead"),
  tags: text("tags").array(), // Array of tags
  notes: text("notes"),
  ownerId: text("owner_id").notNull(), // Clerk user ID
  organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  createdBy: text("created_by").notNull(), // Clerk user ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Deal stages table (customizable per organization)
export const dealStagesTable = pgTable("deal_stages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  color: text("color").notNull().default("#3b82f6"), // Hex color code
  organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Deals table
export const dealsTable = pgTable("deals", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).notNull().default("0"),
  stage: text("stage").notNull().default("lead"), // References deal_stages.name
  probability: integer("probability").notNull().default(0), // 0-100
  contactId: uuid("contact_id").references(() => contactsTable.id, { onDelete: "set null" }),
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  notes: text("notes"),
  ownerId: text("owner_id").notNull(), // Clerk user ID
  organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  createdBy: text("created_by").notNull(), // Clerk user ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Activities table
export const activitiesTable = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: activityTypeEnum("type").notNull(),
  subject: text("subject").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  contactId: uuid("contact_id").references(() => contactsTable.id, { onDelete: "cascade" }),
  dealId: uuid("deal_id").references(() => dealsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(), // Clerk user ID - who the activity is assigned to
  organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  createdBy: text("created_by").notNull(), // Clerk user ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Type exports
export type InsertOrganization = typeof organizationsTable.$inferInsert;
export type SelectOrganization = typeof organizationsTable.$inferSelect;

export type InsertUserRole = typeof userRolesTable.$inferInsert;
export type SelectUserRole = typeof userRolesTable.$inferSelect;

export type InsertContact = typeof contactsTable.$inferInsert;
export type SelectContact = typeof contactsTable.$inferSelect;

export type InsertDealStage = typeof dealStagesTable.$inferInsert;
export type SelectDealStage = typeof dealStagesTable.$inferSelect;

export type InsertDeal = typeof dealsTable.$inferInsert;
export type SelectDeal = typeof dealsTable.$inferSelect;

export type InsertActivity = typeof activitiesTable.$inferInsert;
export type SelectActivity = typeof activitiesTable.$inferSelect;

