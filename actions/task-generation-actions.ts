"use server";

/**
 * Task Generation Actions
 * Server actions for generating tasks from onboarding responses
 */

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db/db";
import { projectTasksTable, clientOnboardingSessionsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isPlatformAdmin } from "@/lib/platform-admin";
import {
  generateTasksFromResponses,
  validateTasks,
  deduplicateTasks,
  GeneratedTask,
  TaskGenerationContext,
} from "@/lib/onboarding-task-mapper";
import { getRulesForProjectType } from "@/lib/task-generation-rules";
import { getOnboardingSessionById } from "@/db/queries/onboarding-queries";
import { getProjectById } from "@/db/queries/projects-queries";

/**
 * Generate tasks from onboarding responses
 */
export async function generateTasksFromOnboardingAction(sessionId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify platform admin
    if (!(await isPlatformAdmin())) {
      return { success: false, error: "Not authorized" };
    }

    // Get session with responses
    const session = await getOnboardingSessionById(sessionId);
    if (!session) {
      return { success: false, error: "Session not found" };
    }

    if (!session.projectId) {
      return { success: false, error: "Session not linked to a project" };
    }

    // Get project details
    const project = await getProjectById(session.projectId);
    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Parse responses
    const responses = typeof session.responses === "string"
      ? JSON.parse(session.responses)
      : session.responses || {};

    // Flatten nested responses (step-based structure)
    const flatResponses: Record<string, any> = {};
    Object.values(responses).forEach((stepResponse: any) => {
      if (typeof stepResponse === "object" && stepResponse !== null) {
        Object.assign(flatResponses, stepResponse);
      }
    });

    // Get task generation rules for project type
    const projectType = session.projectType || project.description || "Generic";
    const rules = getRulesForProjectType(projectType);

    // Create generation context
    const context: TaskGenerationContext = {
      projectId: project.id,
      projectName: project.name,
      projectType,
      organizationId: project.organizationId,
      completionDate: session.completedAt ? new Date(session.completedAt) : new Date(),
      sessionId: session.id,
    };

    // Generate tasks
    let generatedTasks = generateTasksFromResponses(flatResponses, rules, context);

    // Deduplicate
    generatedTasks = deduplicateTasks(generatedTasks);

    // Validate
    const validation = validateTasks(generatedTasks);
    if (!validation.valid) {
      return {
        success: false,
        error: `Task validation failed: ${validation.errors.join(", ")}`,
      };
    }

    return {
      success: true,
      data: {
        tasks: generatedTasks,
        totalTasks: generatedTasks.length,
        rulesApplied: rules.length,
      },
    };
  } catch (error) {
    console.error("Error generating tasks:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate tasks",
    };
  }
}

/**
 * Create tasks in database from generated tasks
 */
export async function createGeneratedTasksAction(
  sessionId: string,
  tasks: GeneratedTask[]
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify platform admin
    if (!(await isPlatformAdmin())) {
      return { success: false, error: "Not authorized" };
    }

    // Get session
    const session = await getOnboardingSessionById(sessionId);
    if (!session || !session.projectId) {
      return { success: false, error: "Invalid session" };
    }

    // Validate tasks
    const validation = validateTasks(tasks);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(", ")}`,
      };
    }

    // ✅ FIX BUG-001: Wrap in transaction to prevent partial data writes
    const createdTasks = await db.transaction(async (tx) => {
      const tasks_created = [];
      
      // Insert all tasks within transaction
      for (const task of tasks) {
        const [created] = await tx
          .insert(projectTasksTable)
          .values({
            projectId: session.projectId,
            title: task.title,
            description: task.description,
            status: task.status || "todo",
            assignedTo: task.assignedTo || null,
            dueDate: task.dueDate || null,
            priority: task.priority || "medium",
            sourceType: "onboarding_response",
            sourceId: sessionId,
            sourceMetadata: task.sourceMetadata,
          })
          .returning();

        tasks_created.push(created);
      }

      // Update session to mark tasks as generated (within same transaction)
      await tx
        .update(clientOnboardingSessionsTable)
        .set({
          tasksGenerated: true,
          tasksGeneratedAt: new Date(),
          taskCount: tasks_created.length,
        })
        .where(eq(clientOnboardingSessionsTable.id, sessionId));
      
      return tasks_created;
    });

    revalidatePath(`/platform/projects/${session.projectId}`);
    revalidatePath(`/platform/onboarding/${sessionId}`);
    revalidatePath("/platform/onboarding");

    return {
      success: true,
      data: {
        createdTasks,
        totalCreated: createdTasks.length,
      },
    };
  } catch (error) {
    console.error("Error creating tasks:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create tasks",
    };
  }
}

/**
 * Preview tasks before creating (combines generation + validation)
 */
export async function previewGeneratedTasksAction(sessionId: string) {
  try {
    const result = await generateTasksFromOnboardingAction(sessionId);

    if (!result.success || !result.data) {
      return result;
    }

    // Add additional preview metadata
    const tasks = result.data.tasks;
    const grouped = tasks.reduce((acc, task) => {
      const priority = task.priority || "medium";
      if (!acc[priority]) acc[priority] = [];
      acc[priority].push(task);
      return acc;
    }, {} as Record<string, GeneratedTask[]>);

    return {
      success: true,
      data: {
        ...result.data,
        groupedByPriority: grouped,
        summary: {
          highPriority: grouped.high?.length || 0,
          mediumPriority: grouped.medium?.length || 0,
          lowPriority: grouped.low?.length || 0,
          withDueDate: tasks.filter((t) => t.dueDate).length,
          withAssignee: tasks.filter((t) => t.assignedTo).length,
        },
      },
    };
  } catch (error) {
    console.error("Error previewing tasks:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to preview tasks",
    };
  }
}

/**
 * Regenerate tasks (delete old onboarding-generated tasks and create new ones)
 */
export async function regenerateTasksAction(sessionId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify platform admin
    if (!(await isPlatformAdmin())) {
      return { success: false, error: "Not authorized" };
    }

    // Get session
    const session = await getOnboardingSessionById(sessionId);
    if (!session || !session.projectId) {
      return { success: false, error: "Invalid session" };
    }

    // Generate new tasks first (outside transaction)
    const generateResult = await generateTasksFromOnboardingAction(sessionId);
    if (!generateResult.success || !generateResult.data) {
      return generateResult;
    }

    // ✅ FIX BUG-001: Wrap delete + create in transaction for atomicity
    const result = await db.transaction(async (tx) => {
      // Delete existing onboarding-generated tasks for this session
      await tx
        .delete(projectTasksTable)
        .where(eq(projectTasksTable.sourceId, sessionId));

      // Create new tasks within same transaction
      const createdTasks = [];
      for (const task of generateResult.data.tasks) {
        const [created] = await tx
          .insert(projectTasksTable)
          .values({
            projectId: session.projectId,
            title: task.title,
            description: task.description,
            status: task.status || "todo",
            assignedTo: task.assignedTo || null,
            dueDate: task.dueDate || null,
            priority: task.priority || "medium",
            sourceType: "onboarding_response",
            sourceId: sessionId,
            sourceMetadata: task.sourceMetadata,
          })
          .returning();
        createdTasks.push(created);
      }

      // Update session
      await tx
        .update(clientOnboardingSessionsTable)
        .set({
          tasksGenerated: true,
          tasksGeneratedAt: new Date(),
          taskCount: createdTasks.length,
        })
        .where(eq(clientOnboardingSessionsTable.id, sessionId));

      return { success: true, data: { createdTasks, totalCreated: createdTasks.length } };
    });

    revalidatePath(`/platform/projects/${session.projectId}`);
    revalidatePath(`/platform/onboarding/${sessionId}`);
    revalidatePath("/platform/onboarding");

    return result;
  } catch (error) {
    console.error("Error regenerating tasks:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to regenerate tasks",
    };
  }
}
