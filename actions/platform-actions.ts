"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { 
  getAllOrganizations, 
  getOrganizationById, 
  getPlatformStats,
  updateOrganizationStatus as updateOrgStatus,
  isPlatformAdmin,
} from "@/db/queries/platform-queries";
import { ActionResult } from "@/types";

/**
 * Check if current user has platform admin access
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
 * Get all organizations (platform admin only)
 */
export async function getAllOrganizationsAction(): Promise<ActionResult<any[]>> {
  try {
    await requirePlatformAdmin();
    
    const organizations = await getAllOrganizations();
    
    return {
      isSuccess: true,
      message: "Organizations fetched successfully",
      data: organizations,
    };
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to fetch organizations",
    };
  }
}

/**
 * Get organization by ID with details (platform admin only)
 */
export async function getOrganizationByIdAction(orgId: string): Promise<ActionResult<any>> {
  try {
    await requirePlatformAdmin();
    
    const organization = await getOrganizationById(orgId);
    
    if (!organization) {
      return {
        isSuccess: false,
        message: "Organization not found",
      };
    }
    
    return {
      isSuccess: true,
      message: "Organization fetched successfully",
      data: organization,
    };
  } catch (error) {
    console.error("Error fetching organization:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to fetch organization",
    };
  }
}

/**
 * Get platform-wide statistics (platform admin only)
 */
export async function getPlatformStatsAction(): Promise<ActionResult<any>> {
  try {
    await requirePlatformAdmin();
    
    const stats = await getPlatformStats();
    
    return {
      isSuccess: true,
      message: "Platform stats fetched successfully",
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to fetch platform stats",
    };
  }
}

/**
 * Update organization status (platform admin only)
 */
export async function updateOrganizationStatusAction(
  orgId: string,
  status: "active" | "trial" | "suspended" | "cancelled"
): Promise<ActionResult<any>> {
  try {
    await requirePlatformAdmin();
    
    const updatedOrg = await updateOrgStatus(orgId, status);
    
    revalidatePath("/platform/organizations");
    revalidatePath(`/platform/organizations/${orgId}`);
    
    return {
      isSuccess: true,
      message: `Organization status updated to ${status}`,
      data: updatedOrg,
    };
  } catch (error) {
    console.error("Error updating organization status:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to update organization status",
    };
  }
}

