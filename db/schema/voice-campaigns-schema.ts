// Voice Campaigns Schema - AI-Powered Voice Agent System
// Defines database tables for managing voice campaigns across multiple providers

import { pgEnum, pgTable, text, timestamp, integer, jsonb, uuid, boolean } from "drizzle-orm/pg-core";
import { projectsTable } from "./projects-schema";
import { projectWebhooksTable } from "./calls-schema";
import { relations } from "drizzle-orm";

// Enums
export const voiceProviderEnum = pgEnum("voice_provider", [
  "vapi",
  "autocalls",
  "synthflow",
  "retell"
]);

export const campaignTypeEnum = pgEnum("campaign_type", [
  "inbound",    // Receive calls
  "outbound",   // Make calls
  "both"        // Both inbound and outbound
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",      // Being created
  "pending",    // Awaiting launch confirmation
  "active",     // Running
  "paused",     // Temporarily stopped
  "completed",  // Finished
  "failed"      // Error state
]);

// Main voice campaigns table
export const voiceCampaignsTable = pgTable("voice_campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  webhookId: uuid("webhook_id").references(() => projectWebhooksTable.id, { onDelete: "set null" }),
  
  // Campaign Basic Info
  name: text("name").notNull(),
  description: text("description"),
  campaignType: campaignTypeEnum("campaign_type").notNull().default("inbound"),
  status: campaignStatusEnum("status").notNull().default("draft"),
  billingType: text("billing_type").notNull().default("billable"), // "admin_free" or "billable"
  
  // Provider Configuration
  provider: voiceProviderEnum("provider").notNull(),
  providerAssistantId: text("provider_assistant_id"), // ID from provider (Vapi, Autocalls, etc.)
  providerPhoneNumberId: text("provider_phone_number_id"), // Phone number ID from provider
  phoneNumber: text("phone_number"), // Actual phone number (+1-555-123-4567)
  
  // Setup Answers (stored as JSON)
  setupAnswers: jsonb("setup_answers").notNull(), // Admin's answers to setup questions
  
  // Generated AI Configuration
  aiGeneratedConfig: jsonb("ai_generated_config"), // AI-generated prompt, messages, etc.
  providerConfig: jsonb("provider_config"), // Full provider-specific config sent to API
  
  // Schedule Configuration (for outbound campaigns)
  scheduleConfig: jsonb("schedule_config"),
  /* Example structure:
  {
    callDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    callWindows: [
      { start: "09:00", end: "12:00", label: "Morning" },
      { start: "13:00", end: "17:00", label: "Afternoon" }
    ],
    respectTimezones: true,
    maxAttemptsPerContact: 3,
    timeBetweenAttempts: 24, // hours
    maxConcurrentCalls: 10
  }
  */
  
  // Campaign Goals & Personality
  campaignGoal: text("campaign_goal"), // lead_qualification, appointment_booking, etc.
  agentPersonality: text("agent_personality"), // professional, friendly, etc.
  systemPrompt: text("system_prompt"), // Generated system prompt
  firstMessage: text("first_message"), // What agent says first
  voicemailMessage: text("voicemail_message"), // Message if voicemail detected
  
  // Statistics
  totalCalls: integer("total_calls").default(0),
  completedCalls: integer("completed_calls").default(0),
  failedCalls: integer("failed_calls").default(0),
  averageCallDuration: integer("average_call_duration"), // seconds
  averageCallQuality: integer("average_call_quality"), // 1-10 rating
  totalCost: integer("total_cost").default(0), // cents
  
  // Metadata
  isActive: boolean("is_active").default(true),
  lastCallAt: timestamp("last_call_at"),
  
  // Audit
  createdBy: text("created_by").notNull(), // User ID who created
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Campaign provider-specific metadata (flexible storage for provider differences)
export const campaignProviderMetadataTable = pgTable("campaign_provider_metadata", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").notNull().references(() => voiceCampaignsTable.id, { onDelete: "cascade" }),
  
  provider: voiceProviderEnum("provider").notNull(),
  
  // Provider-specific IDs and data
  metadata: jsonb("metadata").notNull(), // Flexible JSON for provider-specific data
  
  // Examples of what might be stored:
  // Vapi: { assistantId, phoneNumberId, serverUrl, voiceConfig, transcriber, model }
  // Autocalls: { assistantId, phoneNumber, campaignId, leadListId }
  // Synthflow: { assistantId, flowId, phoneNumber, webhookUrl }
  // Retell: { agentId, phoneNumberSid, llmWebsocketUrl }
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Relations
export const voiceCampaignsRelations = relations(voiceCampaignsTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [voiceCampaignsTable.projectId],
    references: [projectsTable.id],
  }),
  webhook: one(projectWebhooksTable, {
    fields: [voiceCampaignsTable.webhookId],
    references: [projectWebhooksTable.id],
  }),
  providerMetadata: one(campaignProviderMetadataTable, {
    fields: [voiceCampaignsTable.id],
    references: [campaignProviderMetadataTable.campaignId],
  }),
}));

// Type exports
export type InsertVoiceCampaign = typeof voiceCampaignsTable.$inferInsert;
export type SelectVoiceCampaign = typeof voiceCampaignsTable.$inferSelect;

export type InsertCampaignProviderMetadata = typeof campaignProviderMetadataTable.$inferInsert;
export type SelectCampaignProviderMetadata = typeof campaignProviderMetadataTable.$inferSelect;
