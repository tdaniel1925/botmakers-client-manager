import { pgTable, text, timestamp, uuid, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { projectsTable } from "./projects-schema";

// Project webhooks table - stores webhook configurations for receiving call data
export const projectWebhooksTable = pgTable("project_webhooks", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  
  // Webhook config
  label: text("label").notNull(), // e.g., "Vapi Calls", "Bland AI", "Main Webhook"
  webhookToken: text("webhook_token").notNull().unique(), // Secure random token for URL
  isActive: boolean("is_active").default(true),
  
  // Security
  apiKey: text("api_key"), // Optional API key for X-API-Key header validation
  
  // Stats
  totalCallsReceived: integer("total_calls_received").default(0),
  lastCallReceivedAt: timestamp("last_call_received_at"),
  
  // Timestamps
  createdBy: text("created_by").notNull(), // Admin user ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  projectIdx: index("idx_project_webhooks_project").on(table.projectId),
  tokenIdx: index("idx_project_webhooks_token").on(table.webhookToken),
}));

// Call records table - stores all call data and AI analysis results
export const callRecordsTable = pgTable("call_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  webhookId: uuid("webhook_id").notNull().references(() => projectWebhooksTable.id, { onDelete: "cascade" }),
  
  // Raw call data from webhook payload
  rawPayload: jsonb("raw_payload").notNull(), // Full JSON payload received
  callExternalId: text("call_external_id"), // ID from voice agent platform
  
  // Call metadata
  callerPhone: text("caller_phone"),
  callerName: text("caller_name"),
  callDurationSeconds: integer("call_duration_seconds"),
  callTimestamp: timestamp("call_timestamp"),
  audioUrl: text("audio_url"),
  
  // Transcript
  transcript: text("transcript").notNull(),
  structuredData: jsonb("structured_data"), // Any structured data sent by voice agent
  
  // AI Analysis (populated after processing)
  aiAnalysisStatus: text("ai_analysis_status").default("pending"), // pending, processing, completed, failed
  aiAnalysisCompletedAt: timestamp("ai_analysis_completed_at"),
  
  callTopic: text("call_topic"), // AI-extracted main topic
  callSummary: text("call_summary"), // AI-generated summary
  questionsAsked: text("questions_asked").array(), // Array of questions client asked
  callSentiment: text("call_sentiment"), // positive, neutral, negative
  callQualityRating: integer("call_quality_rating"), // 1-10 rating
  
  followUpNeeded: boolean("follow_up_needed").default(false),
  followUpReason: text("follow_up_reason"),
  followUpUrgency: text("follow_up_urgency"), // low, medium, high, urgent
  
  workflowTriggers: text("workflow_triggers").array(), // Array of workflow IDs triggered
  
  // Additional AI insights
  aiInsights: jsonb("ai_insights"), // Flexible JSON for additional AI analysis
  
  // Timestamps
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
}, (table) => ({
  projectIdx: index("idx_call_records_project").on(table.projectId),
  webhookIdx: index("idx_call_records_webhook").on(table.webhookId),
  timestampIdx: index("idx_call_records_timestamp").on(table.callTimestamp),
  followUpIdx: index("idx_call_records_follow_up").on(table.followUpNeeded),
}));

// Call workflows table - admin-created automation workflows
export const callWorkflowsTable = pgTable("call_workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  
  // Workflow config
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  
  // Trigger conditions (JSON with conditional logic)
  triggerConditions: jsonb("trigger_conditions").notNull(),
  
  // Actions (JSON array of actions to execute)
  actions: jsonb("actions").notNull(),
  
  // Execution stats
  totalExecutions: integer("total_executions").default(0),
  lastExecutedAt: timestamp("last_executed_at"),
  
  // Timestamps
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  projectIdx: index("idx_call_workflows_project").on(table.projectId),
  activeIdx: index("idx_call_workflows_active").on(table.isActive),
}));

// Workflow email templates table
export const workflowEmailTemplatesTable = pgTable("workflow_email_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(), // Supports template variables like {{caller_name}}
  
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Workflow SMS templates table
export const workflowSmsTemplatesTable = pgTable("workflow_sms_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(),
  message: text("message").notNull(), // Max 160 chars, supports template variables
  
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Workflow execution logs table
export const workflowExecutionLogsTable = pgTable("workflow_execution_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workflowId: uuid("workflow_id").notNull().references(() => callWorkflowsTable.id, { onDelete: "cascade" }),
  callRecordId: uuid("call_record_id").notNull().references(() => callRecordsTable.id, { onDelete: "cascade" }),
  
  status: text("status").notNull(), // success, failed, partial
  actionsExecuted: jsonb("actions_executed"), // Details of what was executed
  errorMessage: text("error_message"),
  
  executedAt: timestamp("executed_at").defaultNow().notNull(),
});

// Type exports
export type InsertProjectWebhook = typeof projectWebhooksTable.$inferInsert;
export type SelectProjectWebhook = typeof projectWebhooksTable.$inferSelect;

export type InsertCallRecord = typeof callRecordsTable.$inferInsert;
export type SelectCallRecord = typeof callRecordsTable.$inferSelect;

export type InsertCallWorkflow = typeof callWorkflowsTable.$inferInsert;
export type SelectCallWorkflow = typeof callWorkflowsTable.$inferSelect;

export type InsertWorkflowEmailTemplate = typeof workflowEmailTemplatesTable.$inferInsert;
export type SelectWorkflowEmailTemplate = typeof workflowEmailTemplatesTable.$inferSelect;

export type InsertWorkflowSmsTemplate = typeof workflowSmsTemplatesTable.$inferInsert;
export type SelectWorkflowSmsTemplate = typeof workflowSmsTemplatesTable.$inferSelect;

export type InsertWorkflowExecutionLog = typeof workflowExecutionLogsTable.$inferInsert;
export type SelectWorkflowExecutionLog = typeof workflowExecutionLogsTable.$inferSelect;
