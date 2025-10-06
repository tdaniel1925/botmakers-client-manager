/**
 * Onboarding To-Dos Actions
 * Server actions for managing onboarding to-do items
 */

'use server';

import { revalidatePath } from 'next/cache';
import {
  getTodosBySession,
  getAdminTodos,
  getClientTodos,
  createTodo,
  createTodos,
  updateTodo,
  deleteTodo,
  markTodoComplete,
  assignTodo,
  approveTodos,
  getTodoCompletionStats,
  deleteSessionTodos,
  updateTodosOrder,
} from '../db/queries/onboarding-todos-queries';
import { generateTodosFromOnboarding } from '../lib/ai-todo-generator';
import { analyzeCompletedOnboarding } from '../lib/ai-onboarding-completion-analyzer';
import type { ActionResult } from '../types/actions';
import type { OnboardingTodo, NewOnboardingTodo } from '../db/schema/onboarding-schema';
import { db } from '../db/db';
import { clientOnboardingSessionsTable } from '../db/schema/onboarding-schema';
import { eq } from 'drizzle-orm';

/**
 * Generate to-dos from completed onboarding
 */
export async function generateTodosAction(
  sessionId: string,
  projectType: string,
  responses: any
): Promise<ActionResult<{ adminTodos: OnboardingTodo[]; clientTodos: OnboardingTodo[] }>> {
  try {
    // Generate todos using AI
    const result = await generateTodosFromOnboarding(sessionId, projectType, responses);
    
    // Analyze onboarding for additional insights
    const analysis = await analyzeCompletedOnboarding(projectType, responses);
    
    // Save todos to database
    const [createdAdminTodos, createdClientTodos] = await Promise.all([
      result.adminTodos.length > 0 ? createTodos(result.adminTodos) : Promise.resolve([]),
      result.clientTodos.length > 0 ? createTodos(result.clientTodos) : Promise.resolve([]),
    ]);
    
    // Update session with AI analysis and todos generated timestamp
    await db
      .update(clientOnboardingSessionsTable)
      .set({
        aiAnalysis: { ...analysis, ...result.analysis } as any,
        todosGeneratedAt: new Date(),
      })
      .where(eq(clientOnboardingSessionsTable.id, sessionId));
    
    revalidatePath(`/platform/onboarding/sessions/${sessionId}`);
    
    return {
      isSuccess: true,
      message: 'To-dos generated successfully',
      data: {
        adminTodos: createdAdminTodos,
        clientTodos: createdClientTodos,
      },
    };
  } catch (error) {
    console.error('Error generating todos:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to generate to-dos',
    };
  }
}

/**
 * Get all todos for a session
 */
export async function getSessionTodosAction(
  sessionId: string,
  type?: 'admin' | 'client'
): Promise<ActionResult<OnboardingTodo[]>> {
  try {
    let todos;
    if (type === 'admin') {
      todos = await getAdminTodos(sessionId);
    } else if (type === 'client') {
      todos = await getClientTodos(sessionId);
    } else {
      todos = await getTodosBySession(sessionId);
    }
    
    return {
      isSuccess: true,
      message: 'To-dos retrieved successfully',
      data: todos,
    };
  } catch (error) {
    console.error('Error getting session todos:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to get to-dos',
    };
  }
}

/**
 * Get admin todos for a session
 */
export async function getAdminTodosAction(sessionId: string): Promise<ActionResult<OnboardingTodo[]>> {
  try {
    const todos = await getAdminTodos(sessionId);
    
    return {
      isSuccess: true,
      message: 'Admin to-dos retrieved successfully',
      data: todos,
    };
  } catch (error) {
    console.error('Error getting admin todos:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to get admin to-dos',
    };
  }
}

/**
 * Get client todos for a session
 */
export async function getClientTodosAction(sessionId: string): Promise<ActionResult<OnboardingTodo[]>> {
  try {
    const todos = await getClientTodos(sessionId);
    
    return {
      isSuccess: true,
      message: 'Client to-dos retrieved successfully',
      data: todos,
    };
  } catch (error) {
    console.error('Error getting client todos:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to get client to-dos',
    };
  }
}

/**
 * Add custom todo (admin manually adds)
 */
export async function addCustomTodoAction(
  sessionId: string,
  todoData: Omit<NewOnboardingTodo, 'sessionId' | 'aiGenerated'>
): Promise<ActionResult<OnboardingTodo>> {
  try {
    const todo = await createTodo({
      ...todoData,
      sessionId,
      aiGenerated: false, // Manually created
    });
    
    revalidatePath(`/platform/onboarding/sessions/${sessionId}`);
    
    return {
      isSuccess: true,
      message: 'To-do added successfully',
      data: todo,
    };
  } catch (error) {
    console.error('Error adding custom todo:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to add to-do',
    };
  }
}

/**
 * Update todo
 */
export async function updateTodoAction(
  todoId: string,
  changes: Partial<OnboardingTodo>
): Promise<ActionResult<OnboardingTodo>> {
  try {
    const updated = await updateTodo(todoId, changes);
    
    if (!updated) {
      return {
        isSuccess: false,
        message: 'To-do not found',
      };
    }
    
    // Get session ID to revalidate path
    const sessionId = updated.sessionId;
    revalidatePath(`/platform/onboarding/sessions/${sessionId}`);
    
    return {
      isSuccess: true,
      message: 'To-do updated successfully',
      data: updated,
    };
  } catch (error) {
    console.error('Error updating todo:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to update to-do',
    };
  }
}

/**
 * Delete todo
 */
export async function deleteTodoAction(todoId: string): Promise<ActionResult<void>> {
  try {
    const deleted = await deleteTodo(todoId);
    
    if (!deleted) {
      return {
        isSuccess: false,
        message: 'To-do not found',
      };
    }
    
    const sessionId = deleted.sessionId;
    revalidatePath(`/platform/onboarding/sessions/${sessionId}`);
    
    return {
      isSuccess: true,
      message: 'To-do deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting todo:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to delete to-do',
    };
  }
}

/**
 * Toggle todo completion
 */
export async function toggleTodoCompleteAction(
  todoId: string,
  userId: string,
  isCompleted: boolean = true
): Promise<ActionResult<OnboardingTodo>> {
  try {
    const updated = await markTodoComplete(todoId, userId, isCompleted);
    
    if (!updated) {
      return {
        isSuccess: false,
        message: 'To-do not found',
      };
    }
    
    const sessionId = updated.sessionId;
    revalidatePath(`/platform/onboarding/sessions/${sessionId}`);
    
    return {
      isSuccess: true,
      message: isCompleted ? 'To-do marked as complete' : 'To-do marked as incomplete',
      data: updated,
    };
  } catch (error) {
    console.error('Error toggling todo completion:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to update to-do',
    };
  }
}

/**
 * Assign todo to user (admin tasks)
 */
export async function assignTodoAction(
  todoId: string,
  userId: string
): Promise<ActionResult<OnboardingTodo>> {
  try {
    const updated = await assignTodo(todoId, userId);
    
    if (!updated) {
      return {
        isSuccess: false,
        message: 'To-do not found',
      };
    }
    
    const sessionId = updated.sessionId;
    revalidatePath(`/platform/onboarding/sessions/${sessionId}`);
    
    return {
      isSuccess: true,
      message: 'To-do assigned successfully',
      data: updated,
    };
  } catch (error) {
    console.error('Error assigning todo:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to assign to-do',
    };
  }
}

/**
 * Approve todos (makes them visible to client)
 */
export async function approveTodosAction(
  sessionId: string,
  adminId: string
): Promise<ActionResult<void>> {
  try {
    await approveTodos(sessionId, adminId);
    
    revalidatePath(`/platform/onboarding/sessions/${sessionId}`);
    revalidatePath(`/onboarding/${sessionId}/todos`); // Client view
    
    // TODO: Send email notification to client about approved todos
    
    return {
      isSuccess: true,
      message: 'To-dos approved and sent to client',
    };
  } catch (error) {
    console.error('Error approving todos:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to approve to-dos',
    };
  }
}

/**
 * Get todo completion statistics
 */
export async function getTodoCompletionStatsAction(
  sessionId: string
): Promise<ActionResult<any[]>> {
  try {
    const stats = await getTodoCompletionStats(sessionId);
    
    return {
      isSuccess: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  } catch (error) {
    console.error('Error getting todo completion stats:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to get statistics',
    };
  }
}

/**
 * Regenerate todos (delete existing and generate new ones)
 */
export async function regenerateTodosAction(
  sessionId: string,
  projectType: string,
  responses: any
): Promise<ActionResult<{ adminTodos: OnboardingTodo[]; clientTodos: OnboardingTodo[] }>> {
  try {
    // Delete existing todos
    await deleteSessionTodos(sessionId);
    
    // Generate new todos
    return await generateTodosAction(sessionId, projectType, responses);
  } catch (error) {
    console.error('Error regenerating todos:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to regenerate to-dos',
    };
  }
}

/**
 * Reorder todos
 */
export async function reorderTodosAction(
  updates: { id: string; orderIndex: number }[]
): Promise<ActionResult<void>> {
  try {
    await updateTodosOrder(updates);
    
    // Revalidate - get session ID from first todo
    if (updates.length > 0) {
      const [firstTodo] = await getTodosBySession(updates[0].id);
      if (firstTodo) {
        revalidatePath(`/platform/onboarding/sessions/${firstTodo.sessionId}`);
      }
    }
    
    return {
      isSuccess: true,
      message: 'To-dos reordered successfully',
    };
  } catch (error) {
    console.error('Error reordering todos:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to reorder to-dos',
    };
  }
}
