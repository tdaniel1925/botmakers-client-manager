/**
 * Campaign Contacts Database Schema
 * Manages contact lists for outbound voice campaigns with timezone tracking
 */

import { pgTable, text, timestamp, boolean, integer, jsonb, uuid, index, pgEnum } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { voiceCampaignsTable } from "./voice-campaigns-schema";
import { callRecordsTable } from "./calls-schema";

// Call status enum for contacts
export const contactCallStatusEnum = pgEnum("contact_call_status", [
  "pending",      // Not yet called
  "queued",       // Scheduled for calling
  "calling",      // Call in progress
  "completed",    // Call finished successfully
  "failed",       // Call failed
  "no_answer",    // No one answered
  "voicemail",    // Went to voicemail
  "busy",         // Line was busy
  "invalid"       // Invalid phone number
]);

// Main campaign contacts table
export const campaignContactsTable = pgTable("campaign_contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").notNull().references(() => voiceCampaignsTable.id, { onDelete: "cascade" }),
  
  // Contact Info (mapped from uploaded file)
  phoneNumber: text("phone_number").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  fullName: text("full_name"),
  email: text("email"),
  company: text("company"),
  
  // Timezone Detection (auto-populated from area code)
  areaCode: text("area_code"),
  timezone: text("timezone"), // ET, CT, MT, PT, AKT, HAT
  timezoneOffset: text("timezone_offset"), // UTC-5, UTC-6, etc.
  
  // Custom fields (JSONB for flexible mapping)
  customFields: jsonb("custom_fields"),
  
  // Call Status
  callStatus: contactCallStatusEnum("call_status").notNull().default("pending"),
  callAttempts: integer("call_attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(3),
  lastAttemptAt: timestamp("last_attempt_at"),
  nextAttemptAt: timestamp("next_attempt_at"),
  
  // Scheduling
  scheduledFor: timestamp("scheduled_for"),
  bestCallTime: text("best_call_time"), // Morning, Afternoon, Evening
  
  // Results
  callRecordId: uuid("call_record_id").references(() => callRecordsTable.id),
  callOutcome: text("call_outcome"), // interested, not_interested, callback_requested, etc.
  notes: text("notes"),
  
  // Metadata
  uploadBatchId: text("upload_batch_id"), // Group by upload session
  rowNumber: integer("row_number"), // Original row in uploaded file
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  campaignIdIdx: index("idx_campaign_contacts_campaign_id").on(table.campaignId),
  callStatusIdx: index("idx_campaign_contacts_call_status").on(table.campaignId, table.callStatus),
  timezoneIdx: index("idx_campaign_contacts_timezone").on(table.timezone),
  scheduledIdx: index("idx_campaign_contacts_scheduled").on(table.scheduledFor),
  phoneIdx: index("idx_campaign_contacts_phone").on(table.phoneNumber),
  uploadBatchIdx: index("idx_campaign_contacts_upload_batch").on(table.uploadBatchId),
}));

// Campaign contact uploads tracking table
export const campaignContactUploadsTable = pgTable("campaign_contact_uploads", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").notNull().references(() => voiceCampaignsTable.id, { onDelete: "cascade" }),
  
  // File Info
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  fileType: text("file_type"), // csv, xlsx, xls
  
  // Processing Stats
  totalRows: integer("total_rows").notNull().default(0),
  validRows: integer("valid_rows").notNull().default(0),
  invalidRows: integer("invalid_rows").notNull().default(0),
  duplicateRows: integer("duplicate_rows").notNull().default(0),
  
  // Column Mapping (store user's mapping choices)
  columnMapping: jsonb("column_mapping").notNull(),
  /* Example structure:
  {
    phone: "Phone Number",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    company: "Company Name"
  }
  */
  
  // Timezone Summary
  timezoneSummary: jsonb("timezone_summary"),
  /* Example structure:
  {
    ET: 150,
    CT: 200,
    MT: 50,
    PT: 100,
    AKT: 10,
    HAT: 5,
    unknown: 15
  }
  */
  
  // Processing Status
  processingStatus: text("processing_status").notNull().default("pending"), // pending, processing, completed, failed
  processingError: text("processing_error"),
  
  // Batch ID for grouping contacts
  batchId: text("batch_id").notNull(),
  
  uploadedBy: text("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
}, (table) => ({
  campaignIdIdx: index("idx_campaign_uploads_campaign_id").on(table.campaignId),
  batchIdIdx: index("idx_campaign_uploads_batch_id").on(table.batchId),
}));

// TypeScript types
export type SelectCampaignContact = InferSelectModel<typeof campaignContactsTable>;
export type InsertCampaignContact = InferInsertModel<typeof campaignContactsTable>;
export type SelectCampaignContactUpload = InferSelectModel<typeof campaignContactUploadsTable>;
export type InsertCampaignContactUpload = InferInsertModel<typeof campaignContactUploadsTable>;
