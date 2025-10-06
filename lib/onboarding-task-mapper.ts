/**
 * Onboarding Task Mapper
 * Converts onboarding responses into actionable project tasks
 */

import { addDays } from "date-fns";

export interface TaskGenerationRule {
  id: string;
  name: string;
  description: string;
  responseKey: string | string[]; // Response field(s) to check
  condition: (responses: Record<string, any>) => boolean;
  generateTasks: (responses: Record<string, any>, context: TaskGenerationContext) => GeneratedTask[];
  priority?: number; // Higher number = higher priority
}

export interface TaskGenerationContext {
  projectId: string;
  projectName: string;
  projectType: string;
  organizationId: string;
  completionDate: Date;
  sessionId: string;
}

export interface GeneratedTask {
  title: string;
  description: string;
  status?: "todo" | "in_progress" | "done";
  assignedTo?: string;
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
  sourceType: "onboarding_response";
  sourceId: string; // Session ID
  sourceMetadata: string; // JSON string of response data
}

/**
 * Apply a single rule to generate tasks
 */
export function applyRule(
  rule: TaskGenerationRule,
  responses: Record<string, any>,
  context: TaskGenerationContext
): GeneratedTask[] {
  try {
    // Check if condition is met
    if (!rule.condition(responses)) {
      return [];
    }

    // Generate tasks
    const tasks = rule.generateTasks(responses, context);

    // Add source metadata
    return tasks.map((task) => ({
      ...task,
      sourceType: "onboarding_response" as const,
      sourceId: context.sessionId,
      sourceMetadata: JSON.stringify({
        ruleId: rule.id,
        ruleName: rule.name,
        responseKeys: Array.isArray(rule.responseKey) ? rule.responseKey : [rule.responseKey],
        timestamp: new Date().toISOString(),
      }),
    }));
  } catch (error) {
    console.error(`Error applying rule ${rule.id}:`, error);
    return [];
  }
}

/**
 * Apply all rules and generate tasks
 */
export function generateTasksFromResponses(
  responses: Record<string, any>,
  rules: TaskGenerationRule[],
  context: TaskGenerationContext
): GeneratedTask[] {
  const allTasks: GeneratedTask[] = [];

  // Sort rules by priority (higher first)
  const sortedRules = [...rules].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  for (const rule of sortedRules) {
    const tasks = applyRule(rule, responses, context);
    allTasks.push(...tasks);
  }

  return allTasks;
}

/**
 * Calculate due date based on days from completion
 */
export function calculateDueDate(completionDate: Date, daysFromCompletion: number): Date {
  return addDays(completionDate, daysFromCompletion);
}

/**
 * Get response value safely
 */
export function getResponseValue<T = any>(
  responses: Record<string, any>,
  key: string,
  defaultValue?: T
): T {
  const value = responses[key];
  return value !== undefined ? value : (defaultValue as T);
}

/**
 * Check if response has files
 */
export function hasFileUploads(responses: Record<string, any>, key: string): boolean {
  const value = responses[key];
  if (!value) return false;
  if (Array.isArray(value) && value.length > 0) {
    return value.some((item) => item && (item.url || item.name || item.file));
  }
  return false;
}

/**
 * Get file count from response
 */
export function getFileCount(responses: Record<string, any>, key: string): number {
  const value = responses[key];
  if (!value) return 0;
  if (Array.isArray(value)) {
    return value.filter((item) => item && (item.url || item.name || item.file)).length;
  }
  return 0;
}

/**
 * Check if response contains text
 */
export function hasTextResponse(responses: Record<string, any>, key: string): boolean {
  const value = responses[key];
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Check if array response contains value
 */
export function arrayIncludes(
  responses: Record<string, any>,
  key: string,
  searchValue: string
): boolean {
  const value = responses[key];
  if (!Array.isArray(value)) return false;
  return value.includes(searchValue);
}

/**
 * Validate generated tasks
 */
export function validateTasks(tasks: GeneratedTask[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  tasks.forEach((task, index) => {
    if (!task.title || task.title.trim().length === 0) {
      errors.push(`Task ${index + 1}: Title is required`);
    }

    if (task.title && task.title.length > 200) {
      errors.push(`Task ${index + 1}: Title too long (max 200 characters)`);
    }

    if (task.dueDate && task.dueDate < new Date()) {
      errors.push(`Task ${index + 1}: Due date cannot be in the past`);
    }

    if (task.status && !["todo", "in_progress", "done"].includes(task.status)) {
      errors.push(`Task ${index + 1}: Invalid status`);
    }

    if (task.priority && !["low", "medium", "high"].includes(task.priority)) {
      errors.push(`Task ${index + 1}: Invalid priority`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Deduplicate tasks by title
 */
export function deduplicateTasks(tasks: GeneratedTask[]): GeneratedTask[] {
  const seen = new Set<string>();
  return tasks.filter((task) => {
    const key = task.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Group tasks by category
 */
export function groupTasksByCategory(tasks: GeneratedTask[]): Record<string, GeneratedTask[]> {
  const groups: Record<string, GeneratedTask[]> = {
    design: [],
    development: [],
    content: [],
    marketing: [],
    other: [],
  };

  tasks.forEach((task) => {
    const title = task.title.toLowerCase();

    if (
      title.includes("design") ||
      title.includes("logo") ||
      title.includes("brand") ||
      title.includes("ui") ||
      title.includes("ux")
    ) {
      groups.design.push(task);
    } else if (
      title.includes("develop") ||
      title.includes("code") ||
      title.includes("implement") ||
      title.includes("integrate") ||
      title.includes("api")
    ) {
      groups.development.push(task);
    } else if (
      title.includes("content") ||
      title.includes("copy") ||
      title.includes("write") ||
      title.includes("text")
    ) {
      groups.content.push(task);
    } else if (
      title.includes("market") ||
      title.includes("seo") ||
      title.includes("analytics") ||
      title.includes("campaign")
    ) {
      groups.marketing.push(task);
    } else {
      groups.other.push(task);
    }
  });

  return groups;
}

/**
 * Get task summary statistics
 */
export function getTaskStats(tasks: GeneratedTask[]): {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  withDueDate: number;
  withAssignee: number;
} {
  return {
    total: tasks.length,
    byStatus: {
      todo: tasks.filter((t) => t.status === "todo").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    },
    byPriority: {
      high: tasks.filter((t) => t.priority === "high").length,
      medium: tasks.filter((t) => t.priority === "medium").length,
      low: tasks.filter((t) => t.priority === "low").length,
    },
    withDueDate: tasks.filter((t) => t.dueDate).length,
    withAssignee: tasks.filter((t) => t.assignedTo).length,
  };
}
