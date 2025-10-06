"use server";

import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  markActivityComplete,
  deleteActivity,
  getOverdueActivities,
  getTodaysActivities,
  getActivityCountByType,
} from "@/db/queries/activities-queries";
import { InsertActivity, SelectActivity } from "@/db/schema";
import { ActionResult } from "@/types/actions/actions-types";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/db/queries/organizations-queries";
import { canAccessResource, canEditResource, canDeleteResource } from "@/lib/rbac";

export async function getActivitiesAction(
  organizationId: string,
  options?: {
    userId?: string;
    contactId?: string;
    dealId?: string;
    type?: string;
    completed?: boolean;
    dueDateFrom?: Date;
    dueDateTo?: Date;
    limit?: number;
    offset?: number;
    sortBy?: "createdAt" | "updatedAt" | "dueDate";
    sortOrder?: "asc" | "desc";
  }
): Promise<ActionResult<{ activities: (SelectActivity & { contactName?: string; dealTitle?: string })[]; total: number }>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // If user is sales_rep, only show their own activities
    let queryOptions = { ...options };
    if (userRole.role === "sales_rep") {
      queryOptions.userId = userId;
    }
    
    const result = await getActivities(organizationId, queryOptions);
    return { isSuccess: true, message: "Activities retrieved successfully", data: result };
  } catch (error) {
    console.error("Error getting activities:", error);
    return { isSuccess: false, message: "Failed to get activities" };
  }
}

export async function getActivityByIdAction(
  activityId: string,
  organizationId: string
): Promise<ActionResult<SelectActivity | null>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const activity = await getActivityById(activityId, organizationId);
    
    if (!activity) {
      return { isSuccess: false, message: "Activity not found" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // Check if user has permission to view this activity
    if (!canAccessResource(userRole.role as any, activity.userId, userId)) {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    return { isSuccess: true, message: "Activity retrieved successfully", data: activity };
  } catch (error) {
    console.error("Error getting activity:", error);
    return { isSuccess: false, message: "Failed to get activity" };
  }
}

export async function createActivityAction(
  data: InsertActivity
): Promise<ActionResult<SelectActivity>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(userId, data.organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    const activityData = {
      ...data,
      userId: data.userId || userId,
      createdBy: userId,
    };
    
    const newActivity = await createActivity(activityData);
    revalidatePath("/dashboard/activities");
    if (data.contactId) {
      revalidatePath(`/dashboard/contacts/${data.contactId}`);
    }
    if (data.dealId) {
      revalidatePath(`/dashboard/deals/${data.dealId}`);
    }
    return { isSuccess: true, message: "Activity created successfully", data: newActivity };
  } catch (error) {
    console.error("Error creating activity:", error);
    return { isSuccess: false, message: "Failed to create activity" };
  }
}

export async function updateActivityAction(
  activityId: string,
  organizationId: string,
  data: Partial<InsertActivity>
): Promise<ActionResult<SelectActivity>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const activity = await getActivityById(activityId, organizationId);
    
    if (!activity) {
      return { isSuccess: false, message: "Activity not found" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // Check if user has permission to edit this activity
    if (!canEditResource(userRole.role as any, activity.userId, userId)) {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    const updatedActivity = await updateActivity(activityId, organizationId, data);
    
    if (!updatedActivity) {
      return { isSuccess: false, message: "Failed to update activity" };
    }
    
    revalidatePath("/dashboard/activities");
    if (activity.contactId) {
      revalidatePath(`/dashboard/contacts/${activity.contactId}`);
    }
    if (activity.dealId) {
      revalidatePath(`/dashboard/deals/${activity.dealId}`);
    }
    return { isSuccess: true, message: "Activity updated successfully", data: updatedActivity };
  } catch (error) {
    console.error("Error updating activity:", error);
    return { isSuccess: false, message: "Failed to update activity" };
  }
}

export async function markActivityCompleteAction(
  activityId: string,
  organizationId: string
): Promise<ActionResult<SelectActivity>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const activity = await getActivityById(activityId, organizationId);
    
    if (!activity) {
      return { isSuccess: false, message: "Activity not found" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // Check if user has permission to edit this activity
    if (!canEditResource(userRole.role as any, activity.userId, userId)) {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    const updatedActivity = await markActivityComplete(activityId, organizationId);
    
    if (!updatedActivity) {
      return { isSuccess: false, message: "Failed to mark activity as complete" };
    }
    
    revalidatePath("/dashboard/activities");
    return { isSuccess: true, message: "Activity marked as complete", data: updatedActivity };
  } catch (error) {
    console.error("Error marking activity complete:", error);
    return { isSuccess: false, message: "Failed to mark activity complete" };
  }
}

export async function deleteActivityAction(
  activityId: string,
  organizationId: string
): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const activity = await getActivityById(activityId, organizationId);
    
    if (!activity) {
      return { isSuccess: false, message: "Activity not found" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // Check if user has permission to delete this activity
    if (!canDeleteResource(userRole.role as any, activity.userId, userId)) {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    const success = await deleteActivity(activityId, organizationId);
    
    if (!success) {
      return { isSuccess: false, message: "Failed to delete activity" };
    }
    
    revalidatePath("/dashboard/activities");
    return { isSuccess: true, message: "Activity deleted successfully" };
  } catch (error) {
    console.error("Error deleting activity:", error);
    return { isSuccess: false, message: "Failed to delete activity" };
  }
}

export async function getOverdueActivitiesAction(
  organizationId: string,
  userId?: string
): Promise<ActionResult<SelectActivity[]>> {
  try {
    const { userId: currentUserId } = await auth();
    
    if (!currentUserId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(currentUserId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // If user is sales_rep, only show their own overdue activities
    const queryUserId = userRole.role === "sales_rep" ? currentUserId : userId;
    
    const activities = await getOverdueActivities(organizationId, queryUserId);
    return { isSuccess: true, message: "Overdue activities retrieved successfully", data: activities };
  } catch (error) {
    console.error("Error getting overdue activities:", error);
    return { isSuccess: false, message: "Failed to get overdue activities" };
  }
}

export async function getTodaysActivitiesAction(
  organizationId: string,
  userId?: string
): Promise<ActionResult<SelectActivity[]>> {
  try {
    const { userId: currentUserId } = await auth();
    
    if (!currentUserId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(currentUserId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // If user is sales_rep, only show their own today's activities
    const queryUserId = userRole.role === "sales_rep" ? currentUserId : userId;
    
    const activities = await getTodaysActivities(organizationId, queryUserId);
    return { isSuccess: true, message: "Today's activities retrieved successfully", data: activities };
  } catch (error) {
    console.error("Error getting today's activities:", error);
    return { isSuccess: false, message: "Failed to get today's activities" };
  }
}

export async function getActivityCountByTypeAction(
  organizationId: string
): Promise<ActionResult<Record<string, number>>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const counts = await getActivityCountByType(organizationId);
    return { isSuccess: true, message: "Activity counts retrieved successfully", data: counts };
  } catch (error) {
    console.error("Error getting activity counts:", error);
    return { isSuccess: false, message: "Failed to get activity counts" };
  }
}




