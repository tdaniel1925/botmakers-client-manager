import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { organizationsTable } from "./crm-schema";

export const organizationMessagingCredentialsTable = pgTable(
  "organization_messaging_credentials",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizationsTable.id, { onDelete: "cascade" })
      .unique()
      .notNull(),

    // Twilio SMS Configuration
    twilioAccountSid: text("twilio_account_sid"),
    twilioAuthToken: text("twilio_auth_token"), // encrypted
    twilioPhoneNumber: text("twilio_phone_number"),
    twilioEnabled: boolean("twilio_enabled").default(false).notNull(),
    twilioVerified: boolean("twilio_verified").default(false).notNull(),
    twilioLastTestedAt: timestamp("twilio_last_tested_at"),

    // Resend Email Configuration
    resendApiKey: text("resend_api_key"), // encrypted
    resendFromEmail: text("resend_from_email"),
    resendEnabled: boolean("resend_enabled").default(false).notNull(),
    resendVerified: boolean("resend_verified").default(false).notNull(),
    resendLastTestedAt: timestamp("resend_last_tested_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

export type OrganizationMessagingCredentials = typeof organizationMessagingCredentialsTable.$inferSelect;
export type InsertOrganizationMessagingCredentials = typeof organizationMessagingCredentialsTable.$inferInsert;

