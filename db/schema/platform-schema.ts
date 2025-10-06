import { pgEnum, pgTable, text, timestamp, jsonb, uuid, boolean } from "drizzle-orm/pg-core";

// Platform admin role enum
export const platformAdminRoleEnum = pgEnum("platform_admin_role", [
  "super_admin",
  "support_staff",
  "billing_admin"
]);

// Platform admins table - users who can manage the entire platform
export const platformAdminsTable = pgTable("platform_admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique(), // Clerk user ID
  role: platformAdminRoleEnum("role").notNull().default("super_admin"),
  permissions: jsonb("permissions").default({}), // Additional custom permissions
  phoneNumber: text("phone_number"),
  smsNotificationsEnabled: boolean("sms_notifications_enabled").default(false),
  notificationPreferences: jsonb("notification_preferences").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Type exports
export type InsertPlatformAdmin = typeof platformAdminsTable.$inferInsert;
export type SelectPlatformAdmin = typeof platformAdminsTable.$inferSelect;

