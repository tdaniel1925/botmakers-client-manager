/**
 * Self-Healing System Database Schema
 * Defines tables for error tracking, healing events, health checks, and learned patterns
 */

import { pgTable, text, timestamp, integer, jsonb, boolean, decimal, index } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Healing events table
export const healingEventsTable = pgTable("healing_events", {
  id: text("id").primaryKey(),
  
  // Event classification
  eventType: text("event_type").notNull(), // 'error_caught', 'health_check_failed', 'healing_attempted', 'healing_success', 'healing_failed'
  errorCategory: text("error_category").notNull(), // 'api_failure', 'database_error', 'runtime_error', 'performance_issue'
  errorSource: text("error_source").notNull(),
  errorMessage: text("error_message").notNull(),
  errorStack: text("error_stack"),
  errorContext: jsonb("error_context"),
  
  // AI Analysis
  aiAnalysis: jsonb("ai_analysis"),
  aiConfidenceScore: decimal("ai_confidence_score", { precision: 3, scale: 2 }),
  
  // Healing Actions
  healingStrategy: text("healing_strategy"),
  healingActions: jsonb("healing_actions"),
  healingResult: text("healing_result"),
  healingDurationMs: integer("healing_duration_ms"),
  
  // Impact tracking
  affectedUsers: text("affected_users").array(),
  affectedOrganizations: text("affected_organizations").array(),
  severity: text("severity").notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  
  // Notification tracking
  adminsNotified: text("admins_notified").array(),
  notificationSentAt: timestamp("notification_sent_at"),
}, (table) => ({
  createdIdx: index("idx_healing_events_created").on(table.createdAt),
  categoryIdx: index("idx_healing_events_category").on(table.errorCategory),
  severityIdx: index("idx_healing_events_severity").on(table.severity),
  resultIdx: index("idx_healing_events_result").on(table.healingResult),
  sourceIdx: index("idx_healing_events_source").on(table.errorSource),
}));

// System health checks table
export const systemHealthChecksTable = pgTable("system_health_checks", {
  id: text("id").primaryKey(),
  checkType: text("check_type").notNull(),
  checkName: text("check_name").notNull(),
  status: text("status").notNull(),
  metrics: jsonb("metrics"),
  thresholdBreached: boolean("threshold_breached").default(false),
  autoHealed: boolean("auto_healed").default(false),
  healingEventId: text("healing_event_id").references(() => healingEventsTable.id),
  checkedAt: timestamp("checked_at").defaultNow(),
}, (table) => ({
  statusIdx: index("idx_health_checks_status").on(table.status),
  checkedIdx: index("idx_health_checks_checked").on(table.checkedAt),
  typeIdx: index("idx_health_checks_type").on(table.checkType),
}));

// Healing patterns table - learns successful strategies
export const healingPatternsTable = pgTable("healing_patterns", {
  id: text("id").primaryKey(),
  errorSignature: text("error_signature").notNull().unique(),
  errorPattern: text("error_pattern").notNull(),
  successfulHealingStrategy: text("successful_healing_strategy").notNull(),
  successCount: integer("success_count").default(1),
  failureCount: integer("failure_count").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  signatureIdx: index("idx_healing_patterns_signature").on(table.errorSignature),
  successRateIdx: index("idx_healing_patterns_success_rate").on(table.successRate),
}));

// TypeScript types
export type SelectHealingEvent = InferSelectModel<typeof healingEventsTable>;
export type InsertHealingEvent = InferInsertModel<typeof healingEventsTable>;

export type SelectHealthCheck = InferSelectModel<typeof systemHealthChecksTable>;
export type InsertHealthCheck = InferInsertModel<typeof systemHealthChecksTable>;

export type SelectHealingPattern = InferSelectModel<typeof healingPatternsTable>;
export type InsertHealingPattern = InferInsertModel<typeof healingPatternsTable>;

// Enums for type safety
export const ERROR_CATEGORIES = ['api_failure', 'database_error', 'runtime_error', 'performance_issue'] as const;
export const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export const HEALING_RESULTS = ['success', 'partial', 'failed', 'skipped'] as const;
export const HEALTH_STATUSES = ['healthy', 'degraded', 'unhealthy'] as const;
