/**
 * Onboarding To-Dos Queries
 * Database queries for managing onboarding to-do items
 */

import { db } from "../db";
import { onboardingTodosTable, clientOnboardingSessionsTable } from "../schema/onboarding-schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import type { NewOnboardingTodo, OnboardingTodo } from "../schema/onboarding-schema";

/**
 * Get all todos for a session by type
 */
export async function getTodosBySession(sessionId: string, type?: 'admin' | 'client') {
  const conditions = [eq(onboardingTodosTable.sessionId, sessionId)];
  
  if (type) {
    conditions.push(eq(onboardingTodosTable.type, type));
  }
  
  const todos = await db
    .select()
    .from(onboardingTodosTable)
    .where(and(...conditions))
    .orderBy(asc(onboardingTodosTable.orderIndex));
  
  return todos;
}

/**
 * Get admin todos for a session
 */
export async function getAdminTodos(sessionId: string) {
  const todos = await db
    .select()
    .from(onboardingTodosTable)
    .where(and(
      eq(onboardingTodosTable.sessionId, sessionId),
      eq(onboardingTodosTable.type, 'admin')
    ))
    .orderBy(
      desc(sql`CASE ${onboardingTodosTable.priority} WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`),
      asc(onboardingTodosTable.orderIndex)
    );
  
  return todos;
}

/**
 * Get client todos for a session
 */
export async function getClientTodos(sessionId: string) {
  const todos = await db
    .select()
    .from(onboardingTodosTable)
    .where(and(
      eq(onboardingTodosTable.sessionId, sessionId),
      eq(onboardingTodosTable.type, 'client')
    ))
    .orderBy(
      desc(sql`CASE ${onboardingTodosTable.priority} WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`),
      asc(onboardingTodosTable.orderIndex)
    );
  
  return todos;
}

/**
 * Create a new todo
 */
export async function createTodo(data: NewOnboardingTodo) {
  const [todo] = await db
    .insert(onboardingTodosTable)
    .values(data)
    .returning();
  
  return todo;
}

/**
 * Create multiple todos
 */
export async function createTodos(todos: NewOnboardingTodo[]) {
  if (todos.length === 0) return [];
  
  const created = await db
    .insert(onboardingTodosTable)
    .values(todos)
    .returning();
  
  return created;
}

/**
 * Update a todo
 */
export async function updateTodo(id: string, data: Partial<OnboardingTodo>) {
  const [updated] = await db
    .update(onboardingTodosTable)
    .set(data)
    .where(eq(onboardingTodosTable.id, id))
    .returning();
  
  return updated;
}

/**
 * Delete a todo
 */
export async function deleteTodo(id: string) {
  const [deleted] = await db
    .delete(onboardingTodosTable)
    .where(eq(onboardingTodosTable.id, id))
    .returning();
  
  return deleted;
}

/**
 * Mark todo as complete/incomplete
 */
export async function markTodoComplete(id: string, userId: string, isCompleted: boolean = true) {
  const [updated] = await db
    .update(onboardingTodosTable)
    .set({
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
      completedBy: isCompleted ? userId : null,
    })
    .where(eq(onboardingTodosTable.id, id))
    .returning();
  
  return updated;
}

/**
 * Assign todo to user (admin tasks)
 */
export async function assignTodo(id: string, userId: string) {
  const [updated] = await db
    .update(onboardingTodosTable)
    .set({ assignedTo: userId })
    .where(eq(onboardingTodosTable.id, id))
    .returning();
  
  return updated;
}

/**
 * Approve todos (marks session as todos approved)
 */
export async function approveTodos(sessionId: string, adminId: string) {
  const [session] = await db
    .update(clientOnboardingSessionsTable)
    .set({
      todosApprovedAt: new Date(),
      todosApprovedBy: adminId,
    })
    .where(eq(clientOnboardingSessionsTable.id, sessionId))
    .returning();
  
  return session;
}

/**
 * Get todo completion statistics for a session
 */
export async function getTodoCompletionStats(sessionId: string) {
  const result = await db
    .select({
      type: onboardingTodosTable.type,
      total: sql<number>`COUNT(*)`,
      completed: sql<number>`COUNT(CASE WHEN ${onboardingTodosTable.isCompleted} THEN 1 END)`,
      pending: sql<number>`COUNT(CASE WHEN NOT ${onboardingTodosTable.isCompleted} THEN 1 END)`,
    })
    .from(onboardingTodosTable)
    .where(eq(onboardingTodosTable.sessionId, sessionId))
    .groupBy(onboardingTodosTable.type);
  
  return result;
}

/**
 * Get all incomplete todos for a user (admin tasks assigned to them)
 */
export async function getIncompleteAdminTodos(userId: string) {
  const todos = await db
    .select({
      todo: onboardingTodosTable,
      session: clientOnboardingSessionsTable,
    })
    .from(onboardingTodosTable)
    .innerJoin(
      clientOnboardingSessionsTable,
      eq(onboardingTodosTable.sessionId, clientOnboardingSessionsTable.id)
    )
    .where(and(
      eq(onboardingTodosTable.assignedTo, userId),
      eq(onboardingTodosTable.isCompleted, false)
    ))
    .orderBy(
      desc(sql`CASE ${onboardingTodosTable.priority} WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`)
    );
  
  return todos;
}

/**
 * Delete all todos for a session
 */
export async function deleteSessionTodos(sessionId: string) {
  await db
    .delete(onboardingTodosTable)
    .where(eq(onboardingTodosTable.sessionId, sessionId));
}

/**
 * Bulk update todo order
 */
export async function updateTodosOrder(updates: { id: string; orderIndex: number }[]) {
  const promises = updates.map(({ id, orderIndex }) =>
    db
      .update(onboardingTodosTable)
      .set({ orderIndex })
      .where(eq(onboardingTodosTable.id, id))
  );
  
  await Promise.all(promises);
}
