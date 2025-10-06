"use server";

import {
  getOrganizationById,
  getUserOrganizations,
  getUserRole,
  createOrganization,
  addUserToOrganization,
  updateUserRole,
  removeUserFromOrganization,
  getOrganizationMembers,
  updateOrganization,
} from "@/db/queries/organizations-queries";
import { initializeDefaultStages } from "@/db/queries/deals-queries";
import { InsertOrganization, SelectOrganization, SelectUserRole } from "@/db/schema";
import { ActionResult } from "@/types/actions/actions-types";
import { revalidatePath } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getUserOrganizationsAction(): Promise<ActionResult<(SelectOrganization & { role: string })[]>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const organizations = await getUserOrganizations(userId);
    return { isSuccess: true, message: "Organizations retrieved successfully", data: organizations };
  } catch (error) {
    console.error("Error getting user organizations:", error);
    return { isSuccess: false, message: "Failed to get organizations" };
  }
}

export async function getOrganizationByIdAction(organizationId: string): Promise<ActionResult<SelectOrganization | null>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    const organization = await getOrganizationById(organizationId);
    return { isSuccess: true, message: "Organization retrieved successfully", data: organization };
  } catch (error) {
    console.error("Error getting organization:", error);
    return { isSuccess: false, message: "Failed to get organization" };
  }
}

export async function createOrganizationAction(
  data: InsertOrganization
): Promise<ActionResult<SelectOrganization>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    // Create the organization
    const newOrganization = await createOrganization(data);
    
    // Add the current user as admin
    await addUserToOrganization(userId, newOrganization.id, "admin");
    
    // Initialize default deal stages
    await initializeDefaultStages(newOrganization.id);
    
    revalidatePath("/dashboard");
    return { isSuccess: true, message: "Organization created successfully", data: newOrganization };
  } catch (error) {
    console.error("Error creating organization:", error);
    return { isSuccess: false, message: "Failed to create organization" };
  }
}

export async function updateOrganizationAction(
  organizationId: string,
  data: Partial<InsertOrganization>
): Promise<ActionResult<SelectOrganization>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole || userRole.role !== "admin") {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    const updatedOrganization = await updateOrganization(organizationId, data);
    
    if (!updatedOrganization) {
      return { isSuccess: false, message: "Failed to update organization" };
    }
    
    revalidatePath("/dashboard/settings");
    return { isSuccess: true, message: "Organization updated successfully", data: updatedOrganization };
  } catch (error) {
    console.error("Error updating organization:", error);
    return { isSuccess: false, message: "Failed to update organization" };
  }
}

export async function inviteUserToOrganizationAction(
  email: string,
  organizationId: string,
  role: "admin" | "manager" | "sales_rep"
): Promise<ActionResult<string>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole || userRole.role !== "admin") {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    // In a real app, you would send an invitation email here
    // For now, we'll just return a success message
    revalidatePath("/dashboard/settings");
    return { isSuccess: true, message: `Invitation sent to ${email}`, data: email };
  } catch (error) {
    console.error("Error inviting user:", error);
    return { isSuccess: false, message: "Failed to invite user" };
  }
}

export async function updateUserRoleAction(
  targetUserId: string,
  organizationId: string,
  role: "admin" | "manager" | "sales_rep"
): Promise<ActionResult<SelectUserRole>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole || userRole.role !== "admin") {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    // Don't allow changing own role
    if (userId === targetUserId) {
      return { isSuccess: false, message: "Cannot change your own role" };
    }
    
    const updatedRole = await updateUserRole(targetUserId, organizationId, role);
    
    if (!updatedRole) {
      return { isSuccess: false, message: "Failed to update user role" };
    }
    
    revalidatePath("/dashboard/settings");
    return { isSuccess: true, message: "User role updated successfully", data: updatedRole };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { isSuccess: false, message: "Failed to update user role" };
  }
}

export async function removeUserFromOrganizationAction(
  targetUserId: string,
  organizationId: string
): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole || userRole.role !== "admin") {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    // Don't allow removing self
    if (userId === targetUserId) {
      return { isSuccess: false, message: "Cannot remove yourself from the organization" };
    }
    
    const success = await removeUserFromOrganization(targetUserId, organizationId);
    
    if (!success) {
      return { isSuccess: false, message: "Failed to remove user" };
    }
    
    revalidatePath("/dashboard/settings");
    return { isSuccess: true, message: "User removed successfully" };
  } catch (error) {
    console.error("Error removing user:", error);
    return { isSuccess: false, message: "Failed to remove user" };
  }
}

export async function getOrganizationMembersAction(
  organizationId: string
): Promise<ActionResult<(SelectUserRole & { userName?: string; userEmail?: string })[]>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    const members = await getOrganizationMembers(organizationId);
    
    // Enrich with Clerk user data
    const client = await clerkClient();
    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        try {
          const user = await client.users.getUser(member.userId);
          return {
            ...member,
            userName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || "Unknown",
            userEmail: user.emailAddresses[0]?.emailAddress || "No email",
          };
        } catch {
          return {
            ...member,
            userName: "Unknown User",
            userEmail: "No email",
          };
        }
      })
    );
    
    return { isSuccess: true, message: "Members retrieved successfully", data: enrichedMembers };
  } catch (error) {
    console.error("Error getting organization members:", error);
    return { isSuccess: false, message: "Failed to get organization members" };
  }
}

export async function getUserRoleAction(organizationId: string): Promise<ActionResult<SelectUserRole | null>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    return { isSuccess: true, message: "User role retrieved successfully", data: userRole };
  } catch (error) {
    console.error("Error getting user role:", error);
    return { isSuccess: false, message: "Failed to get user role" };
  }
}




