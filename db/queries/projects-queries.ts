import { db } from "../db";
import { 
  projectsTable, 
  projectTasksTable,
  SelectProject,
  InsertProject,
  SelectProjectTask,
  InsertProjectTask,
} from "../schema/projects-schema";
import { organizationsTable } from "../schema/crm-schema";
import { eq, desc, and, count } from "drizzle-orm";

/**
 * Create a new project
 */
export async function createProject(data: InsertProject): Promise<SelectProject> {
  const result = await db
    .insert(projectsTable)
    .values(data)
    .returning();
  
  return result[0];
}

/**
 * Get all projects for an organization
 */
export async function getProjectsByOrganization(organizationId: string): Promise<SelectProject[]> {
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.organizationId, organizationId))
      .orderBy(desc(projectsTable.createdAt));
    
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

/**
 * Get all projects across all organizations (platform admin)
 */
export async function getAllProjects(): Promise<(SelectProject & { organizationName: string })[]> {
  try {
    const projects = await db
      .select({
        ...projectsTable,
        organizationName: organizationsTable.name,
      })
      .from(projectsTable)
      .leftJoin(organizationsTable, eq(projectsTable.organizationId, organizationsTable.id))
      .orderBy(desc(projectsTable.createdAt));
    
    return projects.map(p => ({
      ...p,
      organizationName: p.organizationName || "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching all projects:", error);
    return [];
  }
}

/**
 * Get project by ID with organization info
 */
export async function getProjectById(projectId: string) {
  try {
    const result = await db
      .select({
        ...projectsTable,
        organizationName: organizationsTable.name,
      })
      .from(projectsTable)
      .leftJoin(organizationsTable, eq(projectsTable.organizationId, organizationsTable.id))
      .where(eq(projectsTable.id, projectId))
      .limit(1);
    
    if (result.length === 0) return null;
    
    return {
      ...result[0],
      organizationName: result[0].organizationName || "Unknown",
    };
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

/**
 * Update project
 */
export async function updateProject(
  projectId: string,
  data: Partial<InsertProject>
): Promise<SelectProject> {
  const result = await db
    .update(projectsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projectsTable.id, projectId))
    .returning();
  
  return result[0];
}

/**
 * Delete project
 */
export async function deleteProject(projectId: string): Promise<void> {
  await db
    .delete(projectsTable)
    .where(eq(projectsTable.id, projectId));
}

/**
 * Get project tasks
 */
export async function getProjectTasks(projectId: string): Promise<SelectProjectTask[]> {
  try {
    const tasks = await db
      .select()
      .from(projectTasksTable)
      .where(eq(projectTasksTable.projectId, projectId))
      .orderBy(projectTasksTable.createdAt);
    
    return tasks;
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    return [];
  }
}

/**
 * Create project task
 */
export async function createProjectTask(data: InsertProjectTask): Promise<SelectProjectTask> {
  const result = await db
    .insert(projectTasksTable)
    .values(data)
    .returning();
  
  return result[0];
}

/**
 * Update project task
 */
export async function updateProjectTask(
  taskId: string,
  data: Partial<InsertProjectTask>
): Promise<SelectProjectTask> {
  const result = await db
    .update(projectTasksTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projectTasksTable.id, taskId))
    .returning();
  
  return result[0];
}

/**
 * Delete project task
 */
export async function deleteProjectTask(taskId: string): Promise<void> {
  await db
    .delete(projectTasksTable)
    .where(eq(projectTasksTable.id, taskId));
}

/**
 * Get project statistics for an organization
 */
export async function getProjectStats(organizationId: string) {
  try {
    const stats = await db
      .select({
        status: projectsTable.status,
        count: count(),
      })
      .from(projectsTable)
      .where(eq(projectsTable.organizationId, organizationId))
      .groupBy(projectsTable.status);
    
    return stats.reduce((acc, stat) => {
      acc[stat.status] = Number(stat.count);
      return acc;
    }, {} as Record<string, number>);
  } catch (error) {
    console.error("Error fetching project stats:", error);
    return {};
  }
}

/**
 * Get platform-wide project statistics
 */
export async function getPlatformProjectStats() {
  try {
    const totalProjects = await db
      .select({ count: count() })
      .from(projectsTable);
    
    const statusStats = await db
      .select({
        status: projectsTable.status,
        count: count(),
      })
      .from(projectsTable)
      .groupBy(projectsTable.status);
    
    const priorityStats = await db
      .select({
        priority: projectsTable.priority,
        count: count(),
      })
      .from(projectsTable)
      .groupBy(projectsTable.priority);
    
    return {
      total: Number(totalProjects[0]?.count) || 0,
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat.status] = Number(stat.count);
        return acc;
      }, {} as Record<string, number>),
      byPriority: priorityStats.reduce((acc, stat) => {
        acc[stat.priority] = Number(stat.count);
        return acc;
      }, {} as Record<string, number>),
    };
  } catch (error) {
    console.error("Error fetching platform project stats:", error);
    return { total: 0, byStatus: {}, byPriority: {} };
  }
}

/**
 * Get task statistics for a project
 */
export async function getProjectTaskStats(projectId: string) {
  try {
    const tasks = await db
      .select()
      .from(projectTasksTable)
      .where(eq(projectTasksTable.projectId, projectId));
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    
    return {
      total,
      completed,
      inProgress,
      todo,
    };
  } catch (error) {
    console.error("Error fetching project task stats:", error);
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
    };
  }
}

/**
 * Calculate task-based progress percentage for a project
 */
export async function calculateTaskProgress(projectId: string): Promise<number> {
  try {
    const stats = await getProjectTaskStats(projectId);
    
    if (stats.total === 0) {
      return 0;
    }
    
    return Math.round((stats.completed / stats.total) * 100);
  } catch (error) {
    console.error("Error calculating task progress:", error);
    return 0;
  }
}

/**
 * Update project's auto-calculated progress based on tasks
 */
export async function updateAutoCalculatedProgress(projectId: string): Promise<void> {
  try {
    const progress = await calculateTaskProgress(projectId);
    
    await db
      .update(projectsTable)
      .set({ 
        autoCalculatedProgress: progress,
        updatedAt: new Date(),
      })
      .where(eq(projectsTable.id, projectId));
  } catch (error) {
    console.error("Error updating auto-calculated progress:", error);
  }
}



