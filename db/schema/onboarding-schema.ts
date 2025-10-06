/**
 * Onboarding Schema
 * AI-powered client onboarding system for collecting project information
 * Includes: Templates library, to-do system, and dynamic questionnaires
 */

import { pgTable, uuid, text, timestamp, integer, jsonb, boolean, pgEnum, decimal } from "drizzle-orm/pg-core";
import { organizationsTable } from "./crm-schema";
import { projectsTable } from "./projects-schema";

// Reminder schedule enum
export const reminderScheduleEnum = pgEnum("reminder_schedule", [
  "standard",
  "aggressive",
  "gentle",
  "custom"
]);

// Enums
export const onboardingStatusEnum = pgEnum("onboarding_status", [
  "pending",
  "in_progress",
  "completed",
  "abandoned"
]);

export const onboardingStepTypeEnum = pgEnum("onboarding_step_type", [
  "welcome",
  "form",
  "upload",
  "choice",
  "approval",
  "review",
  "complete"
]);

export const projectTypeEnum = pgEnum("project_type", [
  "web_design",
  "voice_ai",
  "software_dev",
  "marketing",
  "custom",
  "other"
]);

// Onboarding Templates Table
export const onboardingTemplatesTable = pgTable("onboarding_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  projectType: projectTypeEnum("project_type").notNull(),
  description: text("description"),
  
  // Template configuration
  steps: jsonb("steps").notNull(), // Template structure with all steps
  
  // Metadata
  isActive: boolean("is_active").default(true).notNull(),
  isAiGenerated: boolean("is_ai_generated").default(false).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  averageCompletionTime: integer("average_completion_time"), // in minutes
  
  // Audit
  createdBy: text("created_by"), // Platform admin user ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Onboarding Templates Library Table (reusable templates) - Define before clientOnboardingSessionsTable
export const onboardingTemplatesLibraryTable = pgTable("onboarding_templates_library", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  projectType: text("project_type").notNull(),
  description: text("description"),
  
  // Template structure
  questions: jsonb("questions").notNull(), // Structured question tree with steps
  conditionalRules: jsonb("conditional_rules"), // Logic for show/hide questions
  industryTriggers: jsonb("industry_triggers"), // Industry-specific questions mapping
  
  // Metadata
  isAiGenerated: boolean("is_ai_generated").default(false).notNull(),
  isCustom: boolean("is_custom").default(false).notNull(),
  timesUsed: integer("times_used").default(0).notNull(),
  avgCompletionTime: integer("avg_completion_time"), // minutes
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }),
  
  // Audit
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  archivedAt: timestamp("archived_at"),
});

// Client Onboarding Sessions Table
export const clientOnboardingSessionsTable = pgTable("client_onboarding_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  templateId: uuid("template_id").references(() => onboardingTemplatesTable.id, { onDelete: "set null" }),
  templateLibraryId: uuid("template_library_id").references(() => onboardingTemplatesLibraryTable.id, { onDelete: "set null" }),
  
  // Access control
  accessToken: uuid("access_token").defaultRandom().notNull().unique(), // For public access
  
  // Onboarding configuration
  onboardingType: projectTypeEnum("onboarding_type").notNull(),
  status: onboardingStatusEnum("status").notNull().default("pending"),
  
  // Dynamic steps and responses
  steps: jsonb("steps").notNull(), // Array of step configurations
  responses: jsonb("responses").default({}), // Client responses by step index
  
  // Progress tracking
  currentStep: integer("current_step").default(0).notNull(),
  completionPercentage: integer("completion_percentage").default(0).notNull(),
  
  // Reminder settings
  reminderSchedule: reminderScheduleEnum("reminder_schedule").default("standard"),
  lastReminderSentAt: timestamp("last_reminder_sent_at"),
  reminderCount: integer("reminder_count").default(0).notNull(),
  reminderEnabled: boolean("reminder_enabled").default(true).notNull(),
  
  // Task generation tracking
  tasksGenerated: boolean("tasks_generated").default(false).notNull(),
  tasksGeneratedAt: timestamp("tasks_generated_at"),
  taskCount: integer("task_count").default(0).notNull(),
  
  // Conditional logic tracking
  visibleSteps: jsonb("visible_steps"), // Array of step indices currently visible
  skippedSteps: jsonb("skipped_steps"), // Array of step indices skipped due to conditions
  
  // AI analysis and to-dos
  aiAnalysis: jsonb("ai_analysis"), // AI insights from completed onboarding
  todosGeneratedAt: timestamp("todos_generated_at"),
  todosApprovedAt: timestamp("todos_approved_at"),
  todosApprovedBy: text("todos_approved_by"),
  
  // Manual onboarding tracking
  completionMode: text("completion_mode").default("client"), // 'client', 'manual', 'hybrid'
  completedBySections: jsonb("completed_by_sections"), // Track who completed each section
  manuallyCompletedBy: text("manually_completed_by"), // Admin user ID who manually completed
  manuallyCompletedAt: timestamp("manually_completed_at"),
  finalizedByAdmin: boolean("finalized_by_admin").default(false),
  clientReviewRequestedAt: timestamp("client_review_requested_at"),
  clientReviewedAt: timestamp("client_reviewed_at"),
  clientReviewNotes: text("client_review_notes"),
  
  // Timestamps
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  lastActivityAt: timestamp("last_activity_at"),
  expiresAt: timestamp("expires_at"), // Token expiration (30 days default)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Onboarding Responses Table (for analytics)
export const onboardingResponsesTable = pgTable("onboarding_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => clientOnboardingSessionsTable.id, { onDelete: "cascade" }),
  
  // Step information
  stepIndex: integer("step_index").notNull(),
  stepType: onboardingStepTypeEnum("step_type").notNull(),
  
  // Response data
  responseData: jsonb("response_data").notNull(), // The actual client response
  timeSpent: integer("time_spent"), // seconds spent on this step
  
  // Timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Onboarding To-Dos Table
export const onboardingTodosTable = pgTable("onboarding_todos", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => clientOnboardingSessionsTable.id, { onDelete: "cascade" }),
  
  // To-do type and content
  type: text("type").notNull(), // 'admin' or 'client'
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"), // 'setup', 'compliance', 'content', 'integration', 'review', etc.
  priority: text("priority").default("medium").notNull(), // 'high', 'medium', 'low'
  
  // Assignment and completion
  estimatedMinutes: integer("estimated_minutes"),
  assignedTo: uuid("assigned_to"), // user_id for admin tasks
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  completedBy: text("completed_by"),
  
  // Organization and dependencies
  orderIndex: integer("order_index").default(0).notNull(),
  dependencies: jsonb("dependencies").default([]), // Array of todo IDs this depends on
  
  // Metadata
  aiGenerated: boolean("ai_generated").default(true).notNull(),
  metadata: jsonb("metadata").default({}), // Additional data like file upload requirements
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Project Types Registry Table
export const projectTypesRegistryTable = pgTable("project_types_registry", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  templateId: uuid("template_id").references(() => onboardingTemplatesLibraryTable.id, { onDelete: "set null" }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Type exports
export type ClientOnboardingSession = typeof clientOnboardingSessionsTable.$inferSelect;
export type NewClientOnboardingSession = typeof clientOnboardingSessionsTable.$inferInsert;
export type OnboardingTemplate = typeof onboardingTemplatesTable.$inferSelect;
export type NewOnboardingTemplate = typeof onboardingTemplatesTable.$inferInsert;
export type OnboardingResponse = typeof onboardingResponsesTable.$inferSelect;
export type NewOnboardingResponse = typeof onboardingResponsesTable.$inferInsert;
export type OnboardingTemplateLibrary = typeof onboardingTemplatesLibraryTable.$inferSelect;
export type NewOnboardingTemplateLibrary = typeof onboardingTemplatesLibraryTable.$inferInsert;
export type OnboardingTodo = typeof onboardingTodosTable.$inferSelect;
export type NewOnboardingTodo = typeof onboardingTodosTable.$inferInsert;
export type ProjectTypeRegistry = typeof projectTypesRegistryTable.$inferSelect;
export type NewProjectTypeRegistry = typeof projectTypesRegistryTable.$inferInsert;
