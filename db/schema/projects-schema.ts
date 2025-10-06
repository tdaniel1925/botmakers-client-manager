import { pgEnum, pgTable, text, timestamp, decimal, uuid, boolean, integer } from "drizzle-orm/pg-core";
import { organizationsTable } from "./crm-schema";
import { contactsTable, dealsTable } from "./crm-schema";

// Project enums
export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "active",
  "on_hold",
  "completed",
  "cancelled"
]);

export const projectPriorityEnum = pgEnum("project_priority", [
  "low",
  "medium",
  "high",
  "critical"
]);

export const projectTaskStatusEnum = pgEnum("project_task_status", [
  "todo",
  "in_progress",
  "done"
]);

// Task source type enum (for onboarding integration)
export const taskSourceTypeEnum = pgEnum("task_source_type", [
  "manual",
  "ai_generated",
  "onboarding_response"
]);

// Projects table
export const projectsTable = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  
  // Project details
  name: text("name").notNull(),
  description: text("description").notNull(), // Rich description for AI processing
  status: projectStatusEnum("status").notNull().default("planning"),
  priority: projectPriorityEnum("priority").notNull().default("medium"),
  
  // Financial
  budget: decimal("budget", { precision: 12, scale: 2 }), // Optional budget
  
  // Dates
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Assignment
  createdBy: text("created_by").notNull(), // Platform admin user ID
  assignedTo: text("assigned_to"), // Organization user ID responsible for project
  
  // Optional relationships
  contactId: uuid("contact_id").references(() => contactsTable.id, { onDelete: "set null" }),
  dealId: uuid("deal_id").references(() => dealsTable.id, { onDelete: "set null" }),
  
  // AI metadata
  metadata: text("metadata").default('{}'), // JSON string for AI-generated data, tags, insights
  
  // Progress tracking
  progressPercentage: integer("progress_percentage"), // Manual override by admin (0-100)
  autoCalculatedProgress: integer("auto_calculated_progress").default(0), // Auto from tasks (0-100)
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Project tasks table
export const projectTasksTable = pgTable("project_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  
  // Task details
  title: text("title").notNull(),
  description: text("description"),
  status: projectTaskStatusEnum("status").notNull().default("todo"),
  
  // Assignment
  assignedTo: text("assigned_to"), // User ID
  
  // Dates
  dueDate: timestamp("due_date"),
  
  // AI tracking
  aiGenerated: boolean("ai_generated").notNull().default(false),
  
  // Source tracking (for onboarding integration)
  sourceType: taskSourceTypeEnum("source_type").default("manual"),
  sourceId: uuid("source_id"), // Links to onboarding_responses.id or other sources
  sourceMetadata: text("source_metadata"), // Stores original response data as JSON string
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Project notes table
export const projectNotesTable = pgTable("project_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(), // Platform admin who added note
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type InsertProject = typeof projectsTable.$inferInsert;
export type SelectProject = typeof projectsTable.$inferSelect;

export type InsertProjectTask = typeof projectTasksTable.$inferInsert;
export type SelectProjectTask = typeof projectTasksTable.$inferSelect;

export type InsertProjectNote = typeof projectNotesTable.$inferInsert;
export type SelectProjectNote = typeof projectNotesTable.$inferSelect;



