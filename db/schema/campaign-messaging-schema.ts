/**
 * Campaign Messaging Database Schema
 * Manages SMS and Email templates for voice campaigns
 */

import { pgTable, text, timestamp, boolean, jsonb, uuid, index, integer } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { voiceCampaignsTable } from "./voice-campaigns-schema";
import { projectsTable } from "./projects-schema";

// Campaign message templates
export const campaignMessageTemplatesTable = pgTable("campaign_message_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").references(() => voiceCampaignsTable.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  
  type: text("type").notNull(), // 'sms' or 'email'
  name: text("name").notNull(),
  description: text("description"),
  
  // SMS fields
  smsMessage: text("sms_message"),
  
  // Email fields
  emailSubject: text("email_subject"),
  emailBody: text("email_body"),
  
  // Trigger conditions
  triggerConditions: jsonb("trigger_conditions"),
  /* Example structure:
  {
    when: "after_call", // after_call, after_voicemail, after_no_answer, scheduled
    conditions: [
      { field: "call_sentiment", operator: "equals", value: "positive" },
      { field: "follow_up_needed", operator: "equals", value: true },
      { field: "call_duration", operator: "greater_than", value: 60 }
    ],
    timing: "immediately" // immediately, after_5_min, after_1_hour, after_24_hours
  }
  */
  
  // Template variables for personalization
  availableVariables: text("available_variables").array(),
  // Example: ["contact_name", "company_name", "agent_name", "call_summary"]
  
  isActive: boolean("is_active").notNull().default(true),
  
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  campaignIdIdx: index("idx_campaign_templates_campaign_id").on(table.campaignId),
  projectIdIdx: index("idx_campaign_templates_project_id").on(table.projectId),
  typeIdx: index("idx_campaign_templates_type").on(table.type),
}));

// Campaign messaging configuration
export const campaignMessagingConfigTable = pgTable("campaign_messaging_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").notNull().references(() => voiceCampaignsTable.id, { onDelete: "cascade" }).unique(),
  
  // Enable/Disable
  smsEnabled: boolean("sms_enabled").notNull().default(false),
  emailEnabled: boolean("email_enabled").notNull().default(false),
  
  // Template selection
  smsTemplateId: uuid("sms_template_id").references(() => campaignMessageTemplatesTable.id, { onDelete: "set null" }),
  emailTemplateId: uuid("email_template_id").references(() => campaignMessageTemplatesTable.id, { onDelete: "set null" }),
  
  // Multiple templates for different scenarios
  templates: jsonb("templates"),
  /* Example structure:
  {
    positive_call: { sms: "template_id_1", email: "template_id_2" },
    voicemail: { sms: "template_id_3", email: "template_id_4" },
    no_answer: { sms: "template_id_5", email: null },
    follow_up: { sms: "template_id_6", email: "template_id_7" }
  }
  */
  
  // Default send timing
  defaultSendTiming: text("default_send_timing").default("immediately"), // immediately, after_5_min, after_1_hour, after_24_hours
  
  // Rate limiting
  maxMessagesPerContact: integer("max_messages_per_contact").default(3),
  minTimeBetweenMessages: integer("min_time_between_messages").default(24), // hours
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  campaignIdIdx: index("idx_campaign_messaging_campaign_id").on(table.campaignId),
}));

// Message send log
export const campaignMessageLogTable = pgTable("campaign_message_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").notNull().references(() => voiceCampaignsTable.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id"), // Reference to campaign_contacts
  templateId: uuid("template_id").references(() => campaignMessageTemplatesTable.id, { onDelete: "set null" }),
  
  messageType: text("message_type").notNull(), // sms or email
  recipient: text("recipient").notNull(), // phone number or email
  
  // Message content (what was actually sent)
  subject: text("subject"), // for email
  body: text("body").notNull(),
  
  // Status
  status: text("status").notNull().default("pending"), // pending, sent, failed, bounced
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  errorMessage: text("error_message"),
  
  // Provider info
  providerId: text("provider_id"), // External ID from Twilio/email service
  providerResponse: jsonb("provider_response"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  campaignIdIdx: index("idx_campaign_message_log_campaign_id").on(table.campaignId),
  contactIdIdx: index("idx_campaign_message_log_contact_id").on(table.contactId),
  statusIdx: index("idx_campaign_message_log_status").on(table.status),
}));

// TypeScript types
export type SelectCampaignMessageTemplate = InferSelectModel<typeof campaignMessageTemplatesTable>;
export type InsertCampaignMessageTemplate = InferInsertModel<typeof campaignMessageTemplatesTable>;
export type SelectCampaignMessagingConfig = InferSelectModel<typeof campaignMessagingConfigTable>;
export type InsertCampaignMessagingConfig = InferInsertModel<typeof campaignMessagingConfigTable>;
export type SelectCampaignMessageLog = InferSelectModel<typeof campaignMessageLogTable>;
export type InsertCampaignMessageLog = InferInsertModel<typeof campaignMessageLogTable>;
