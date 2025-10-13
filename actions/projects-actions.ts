"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { 
  createProject,
  getProjectsByOrganization,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectTasks,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
  getProjectStats,
  getPlatformProjectStats,
  getProjectTaskStats,
  calculateTaskProgress,
  updateAutoCalculatedProgress,
} from "@/db/queries/projects-queries";
import { isPlatformAdmin } from "@/db/queries/platform-queries";
import { ActionResult } from "@/types";
import { logAudit } from "@/lib/audit-logger";
import { getProgressData, validateProgressPercentage } from "@/lib/project-progress-calculator";

/**
 * Require platform admin access
 */
async function requirePlatformAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  const isAdmin = await isPlatformAdmin(userId);
  if (!isAdmin) {
    throw new Error("Platform admin access required");
  }
  
  return userId;
}

/**
 * Create project (platform admin only)
 */
export async function createProjectAction(data: {
  organizationId: string;
  name: string;
  description: string;
  status?: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "critical";
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  assignedTo?: string;
  contactId?: string;
  dealId?: string;
}): Promise<ActionResult<any>> {
  try {
    const userId = await requirePlatformAdmin();

    const project = await createProject({
      organizationId: data.organizationId,
      name: data.name,
      description: data.description,
      status: data.status || "planning",
      priority: data.priority || "medium",
      budget: data.budget?.toString(),
      startDate: data.startDate,
      endDate: data.endDate,
      createdBy: userId,
      assignedTo: data.assignedTo,
      contactId: data.contactId,
      dealId: data.dealId,
    });

    // Log audit
    await logAudit({
      organizationId: data.organizationId,
      action: "create",
      entityType: "project",
      entityId: project.id,
      changes: { name: data.name, description: data.description.substring(0, 100) + "..." },
    });

    revalidatePath("/platform/projects");
    revalidatePath(`/platform/organizations/${data.organizationId}`);

    return {
      isSuccess: true,
      message: "Project created successfully",
      data: project,
    };
  } catch (error) {
    console.error("Error creating project:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to create project",
    };
  }
}

/**
 * Get all projects (platform admin only)
 */
export async function getAllProjectsAction(): Promise<ActionResult<any[]>> {
  try {
    await requirePlatformAdmin();

    const projects = await getAllProjects();

    return {
      isSuccess: true,
      message: "Projects fetched successfully",
      data: projects,
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to fetch projects",
    };
  }
}

/**
 * Get projects for an organization (platform admin or org users)
 */
export async function getOrganizationProjectsAction(
  organizationId: string
): Promise<ActionResult<any[]>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const projects = await getProjectsByOrganization(organizationId);

    return {
      isSuccess: true,
      message: "Projects fetched successfully",
      data: projects,
    };
  } catch (error) {
    console.error("Error fetching organization projects:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch projects",
    };
  }
}

/**
 * Get project by ID
 */
export async function getProjectByIdAction(projectId: string): Promise<ActionResult<any>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const project = await getProjectById(projectId);

    if (!project) {
      return {
        isSuccess: false,
        message: "Project not found",
      };
    }

    return {
      isSuccess: true,
      message: "Project fetched successfully",
      data: project,
    };
  } catch (error) {
    console.error("Error fetching project:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch project",
    };
  }
}

/**
 * Update project (platform admin only)
 */
export async function updateProjectAction(
  projectId: string,
  data: {
    name?: string;
    description?: string;
    status?: "planning" | "active" | "on_hold" | "completed" | "cancelled";
    priority?: "low" | "medium" | "high" | "critical";
    budget?: number;
    startDate?: Date;
    endDate?: Date;
    assignedTo?: string;
  }
): Promise<ActionResult<any>> {
  try {
    await requirePlatformAdmin();

    const updateData: any = { ...data };
    if (data.budget !== undefined) {
      updateData.budget = data.budget.toString();
    }

    const updatedProject = await updateProject(projectId, updateData);

    // Log audit
    await logAudit({
      organizationId: updatedProject.organizationId,
      action: "update",
      entityType: "project",
      entityId: projectId,
      changes: data,
    });

    revalidatePath("/platform/projects");
    revalidatePath(`/platform/projects/${projectId}`);

    return {
      isSuccess: true,
      message: "Project updated successfully",
      data: updatedProject,
    };
  } catch (error) {
    console.error("Error updating project:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to update project",
    };
  }
}

/**
 * Delete project (platform admin only)
 */
export async function deleteProjectAction(projectId: string): Promise<ActionResult<void>> {
  try {
    await requirePlatformAdmin();

    const project = await getProjectById(projectId);
    if (!project) {
      return {
        isSuccess: false,
        message: "Project not found",
      };
    }

    await deleteProject(projectId);

    // Log audit
    await logAudit({
      organizationId: project.organizationId,
      action: "delete",
      entityType: "project",
      entityId: projectId,
      changes: { name: project.name },
    });

    revalidatePath("/platform/projects");

    return {
      isSuccess: true,
      message: "Project deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting project:", error);
    return {
      isSuccess: false,
      message: "Failed to delete project",
    };
  }
}

/**
 * Bulk delete projects (platform admin only)
 */
export async function bulkDeleteProjectsAction(projectIds: string[]): Promise<ActionResult<void>> {
  try {
    await requirePlatformAdmin();

    if (!projectIds || projectIds.length === 0) {
      return {
        isSuccess: false,
        message: "No projects selected",
      };
    }

    // Delete all projects
    let successCount = 0;
    let failedCount = 0;

    for (const projectId of projectIds) {
      try {
        const project = await getProjectById(projectId);
        if (project) {
          await deleteProject(projectId);
          
          // Log audit
          await logAudit({
            organizationId: project.organizationId,
            action: "delete",
            entityType: "project",
            entityId: projectId,
            changes: { name: project.name },
          });
          
          successCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        console.error(`Error deleting project ${projectId}:`, error);
        failedCount++;
      }
    }

    revalidatePath("/platform/projects");

    if (failedCount === 0) {
      return {
        isSuccess: true,
        message: `Successfully deleted ${successCount} project(s)`,
      };
    } else if (successCount > 0) {
      return {
        isSuccess: true,
        message: `Deleted ${successCount} project(s), ${failedCount} failed`,
      };
    } else {
      return {
        isSuccess: false,
        message: "Failed to delete projects",
      };
    }
  } catch (error) {
    console.error("Error bulk deleting projects:", error);
    return {
      isSuccess: false,
      message: "Failed to delete projects",
    };
  }
}

/**
 * Get project tasks
 */
export async function getProjectTasksAction(projectId: string): Promise<ActionResult<any[]>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const tasks = await getProjectTasks(projectId);

    return {
      isSuccess: true,
      message: "Tasks fetched successfully",
      data: tasks,
    };
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch tasks",
    };
  }
}

/**
 * Create project task
 */
export async function createProjectTaskAction(data: {
  projectId: string;
  title: string;
  description?: string;
  status?: "todo" | "in_progress" | "done";
  assignedTo?: string;
  dueDate?: Date;
  aiGenerated?: boolean;
}): Promise<ActionResult<any>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const task = await createProjectTask(data);

    revalidatePath(`/platform/projects/${data.projectId}`);
    revalidatePath(`/dashboard/projects/${data.projectId}`);

    return {
      isSuccess: true,
      message: "Task created successfully",
      data: task,
    };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      isSuccess: false,
      message: "Failed to create task",
    };
  }
}

/**
 * Update project task
 */
export async function updateProjectTaskAction(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    status?: "todo" | "in_progress" | "done";
    assignedTo?: string;
    dueDate?: Date;
  }
): Promise<ActionResult<any>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const updatedTask = await updateProjectTask(taskId, data);

    // Update auto-calculated progress if status changed
    if (data.status) {
      await updateAutoCalculatedProgress(updatedTask.projectId);
    }

    revalidatePath(`/platform/projects/${updatedTask.projectId}`);
    revalidatePath(`/dashboard/projects/${updatedTask.projectId}`);

    return {
      isSuccess: true,
      message: "Task updated successfully",
      data: updatedTask,
    };
  } catch (error) {
    console.error("Error updating task:", error);
    return {
      isSuccess: false,
      message: "Failed to update task",
    };
  }
}

/**
 * Delete project task
 */
export async function deleteProjectTaskAction(taskId: string): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    // Get task to find project ID before deleting
    const tasks = await getProjectTasks("");
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      return {
        isSuccess: false,
        message: "Task not found",
      };
    }

    const projectId = task.projectId;

    await deleteProjectTask(taskId);

    // Update auto-calculated progress
    await updateAutoCalculatedProgress(projectId);

    revalidatePath(`/platform/projects/${projectId}`);
    revalidatePath(`/dashboard/projects/${projectId}`);

    return {
      isSuccess: true,
      message: "Task deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting task:", error);
    return {
      isSuccess: false,
      message: "Failed to delete task",
    };
  }
}

/**
 * Bulk update task status
 */
export async function bulkUpdateTaskStatusAction(
  taskIds: string[],
  status: "todo" | "in_progress" | "done"
): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    if (taskIds.length === 0) {
      return {
        isSuccess: false,
        message: "No tasks selected",
      };
    }

    let projectId: string | null = null;

    // Update all tasks
    for (const taskId of taskIds) {
      const updatedTask = await updateProjectTask(taskId, { status });
      if (!projectId) {
        projectId = updatedTask.projectId;
      }
    }

    // Update auto-calculated progress
    if (projectId) {
      await updateAutoCalculatedProgress(projectId);
      revalidatePath(`/platform/projects/${projectId}`);
      revalidatePath(`/dashboard/projects/${projectId}`);
    }

    return {
      isSuccess: true,
      message: `${taskIds.length} task(s) updated successfully`,
    };
  } catch (error) {
    console.error("Error bulk updating tasks:", error);
    return {
      isSuccess: false,
      message: "Failed to update tasks",
    };
  }
}

/**
 * Get platform project statistics
 */
export async function getPlatformProjectStatsAction(): Promise<ActionResult<any>> {
  try {
    await requirePlatformAdmin();

    const stats = await getPlatformProjectStats();

    return {
      isSuccess: true,
      message: "Stats fetched successfully",
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching project stats:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch stats",
    };
  }
}

/**
 * Get project progress data (anyone with project access)
 */
export async function getProjectProgressAction(projectId: string): Promise<ActionResult<any>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }

    // Get project
    const project = await getProjectById(projectId);
    if (!project) {
      return { isSuccess: false, message: "Project not found" };
    }

    // Get task stats
    const taskStats = await getProjectTaskStats(projectId);

    // Get progress data
    const progressData = getProgressData(project, taskStats);

    return {
      isSuccess: true,
      message: "Project progress retrieved successfully.",
      data: progressData,
    };
  } catch (error) {
    console.error("Error fetching project progress:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch project progress",
    };
  }
}

/**
 * Update project progress percentage (Platform Admin only - manual override)
 */
export async function updateProjectProgressAction(
  projectId: string,
  percentage: number | null
): Promise<ActionResult<void>> {
  try {
    const userId = await requirePlatformAdmin();

    // Validate percentage if provided
    if (percentage !== null && !validateProgressPercentage(percentage)) {
      return {
        isSuccess: false,
        message: "Progress percentage must be a whole number between 0 and 100",
      };
    }

    // Get project
    const project = await getProjectById(projectId);
    if (!project) {
      return { isSuccess: false, message: "Project not found" };
    }

    // Update progress (null removes manual override)
    await updateProject(projectId, {
      progressPercentage: percentage,
    });

    // Log audit
    await logAudit({
      organizationId: project.organizationId,
      action: "update",
      entityType: "project",
      entityId: projectId,
      changes: { 
        progressPercentage: percentage,
        action: percentage === null ? "reset_to_auto" : "manual_override"
      },
    });

    revalidatePath(`/platform/projects/${projectId}`);
    revalidatePath(`/dashboard/projects/${projectId}`);

    return {
      isSuccess: true,
      message: percentage === null 
        ? "Progress reset to automatic calculation" 
        : "Progress updated successfully",
    };
  } catch (error) {
    console.error("Error updating project progress:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to update progress",
    };
  }
}



