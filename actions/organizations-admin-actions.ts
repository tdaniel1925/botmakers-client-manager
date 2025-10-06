"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { 
  createOrganization,
  updateOrganization,
  addUserToOrganization,
  isSlugAvailable,
} from "@/db/queries/organizations-queries";
import { 
  isPlatformAdmin,
  updateOrganizationStatus as updateOrgStatus,
} from "@/db/queries/platform-queries";
import { ActionResult } from "@/types";
import { clerkClient } from "@clerk/nextjs/server";
import { logOrganizationChange, logPlatformAction } from "@/lib/audit-logger";

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
 * Create a new organization (platform admin only)
 */
export async function createOrganizationAction(data: {
  name: string;
  slug: string;
  plan?: "free" | "pro" | "enterprise";
  adminEmail: string;
  adminName: string;
}): Promise<ActionResult<any>> {
  try {
    await requirePlatformAdmin();

    // Validate slug
    const slugAvailable = await isSlugAvailable(data.slug);
    if (!slugAvailable) {
      return {
        isSuccess: false,
        message: "Slug is already taken. Please choose a different one.",
      };
    }

    // Create organization
    const organization = await createOrganization({
      name: data.name,
      slug: data.slug,
      plan: data.plan || "free",
      status: "active",
      maxUsers: data.plan === "pro" ? 25 : data.plan === "enterprise" ? 999 : 5,
      maxStorageGb: data.plan === "pro" ? 100 : data.plan === "enterprise" ? 500 : 10,
    });

    // Log audit
    await logOrganizationChange("create", organization.id, {
      name: data.name,
      slug: data.slug,
      plan: data.plan || "free",
      adminEmail: data.adminEmail,
    });

    // Invite admin user via Clerk
    try {
      const client = await clerkClient();
      const invitation = await client.invitations.createInvitation({
        emailAddress: data.adminEmail,
        publicMetadata: {
          organizationId: organization.id,
          role: "admin",
        },
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
      });

      console.log(`Invitation sent to ${data.adminEmail} for organization ${organization.name}`);
    } catch (inviteError) {
      console.error("Error sending invitation:", inviteError);
      // Continue anyway - organization was created
    }

    revalidatePath("/platform/organizations");
    revalidatePath("/platform/dashboard");

    return {
      isSuccess: true,
      message: `Organization "${data.name}" created successfully`,
      data: organization,
    };
  } catch (error) {
    console.error("Error creating organization:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to create organization",
    };
  }
}

/**
 * Update organization details (platform admin only)
 */
export async function updateOrganizationAction(
  orgId: string,
  data: {
    name?: string;
    slug?: string;
    plan?: "free" | "pro" | "enterprise";
    maxUsers?: number;
    maxStorageGb?: number;
  }
): Promise<ActionResult<any>> {
  try {
    await requirePlatformAdmin();

    // If slug is being changed, check availability
    if (data.slug) {
      const slugAvailable = await isSlugAvailable(data.slug, orgId);
      if (!slugAvailable) {
        return {
          isSuccess: false,
          message: "Slug is already taken. Please choose a different one.",
        };
      }
    }

    const updatedOrg = await updateOrganization(orgId, data);

    // Log audit
    await logOrganizationChange("update", orgId, data);

    revalidatePath("/platform/organizations");
    revalidatePath(`/platform/organizations/${orgId}`);

    return {
      isSuccess: true,
      message: "Organization updated successfully",
      data: updatedOrg,
    };
  } catch (error) {
    console.error("Error updating organization:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to update organization",
    };
  }
}

/**
 * Suspend organization (platform admin only)
 */
export async function suspendOrganizationAction(orgId: string): Promise<ActionResult<any>> {
  try {
    await requirePlatformAdmin();

    const updatedOrg = await updateOrgStatus(orgId, "suspended");

    // Log audit
    await logOrganizationChange("suspend", orgId, { status: "suspended" });

    revalidatePath("/platform/organizations");
    revalidatePath(`/platform/organizations/${orgId}`);

    return {
      isSuccess: true,
      message: "Organization suspended successfully",
      data: updatedOrg,
    };
  } catch (error) {
    console.error("Error suspending organization:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to suspend organization",
    };
  }
}

/**
 * Activate organization (platform admin only)
 */
export async function activateOrganizationAction(orgId: string): Promise<ActionResult<any>> {
  try {
    await requirePlatformAdmin();

    const updatedOrg = await updateOrgStatus(orgId, "active");

    // Log audit
    await logOrganizationChange("activate", orgId, { status: "active" });

    revalidatePath("/platform/organizations");
    revalidatePath(`/platform/organizations/${orgId}`);

    return {
      isSuccess: true,
      message: "Organization activated successfully",
      data: updatedOrg,
    };
  } catch (error) {
    console.error("Error activating organization:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to activate organization",
    };
  }
}

/**
 * Check if slug is available
 */
export async function checkSlugAvailabilityAction(slug: string, excludeOrgId?: string): Promise<ActionResult<boolean>> {
  try {
    const available = await isSlugAvailable(slug, excludeOrgId);

    return {
      isSuccess: true,
      message: available ? "Slug is available" : "Slug is already taken",
      data: available,
    };
  } catch (error) {
    console.error("Error checking slug:", error);
    return {
      isSuccess: false,
      message: "Failed to check slug availability",
      data: false,
    };
  }
}

