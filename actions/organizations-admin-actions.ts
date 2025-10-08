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
import { generateTempUsername, generateTempPassword, generateCredentialsExpiration } from "@/lib/credentials-generator";
import { sendNotification } from "@/lib/notification-service";

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

    // Generate temporary password for owner
    const tempPassword = generateTempPassword();
    const credentialsExpiresAt = generateCredentialsExpiration();

    // Create organization
    const organization = await createOrganization({
      name: data.name,
      slug: data.slug,
      plan: data.plan || "free",
      status: "active",
      maxUsers: data.plan === "pro" ? 25 : data.plan === "enterprise" ? 999 : 5,
      maxStorageGb: data.plan === "pro" ? 100 : data.plan === "enterprise" ? 500 : 10,
      tempUsername: data.adminEmail, // Use email as username
      tempPassword,
      credentialsExpiresAt,
      credentialsSentAt: new Date(),
    });

    // ✨ CREATE CLERK USER ACCOUNT FOR ORGANIZATION OWNER
    let ownerUserId: string | undefined;
    try {
      const clerk = await clerkClient();
      
      // Split name for Clerk
      const nameParts = (data.adminName || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const newUser = await clerk.users.createUser({
        emailAddress: [data.adminEmail],
        password: tempPassword,
        skipPasswordRequirement: false,
        firstName,
        lastName,
      });
      
      ownerUserId = newUser.id;
      
      // ✨ ADD OWNER TO USER_ROLES TABLE
      await addUserToOrganization(organization.id, ownerUserId, "owner");
      
      console.log(`✅ Organization owner account created and linked: ${data.adminEmail} → ${organization.name}`);
    } catch (userError: any) {
      console.error("Error creating owner user account:", userError);
      
      // If user already exists, try to find them and add to org
      if (userError.message?.includes("already exists") || 
          userError.errors?.[0]?.code === "form_identifier_exists") {
        try {
          const clerk = await clerkClient();
          const users = await clerk.users.getUserList({ emailAddress: [data.adminEmail] });
          
          if (users.data.length > 0) {
            ownerUserId = users.data[0].id;
            await addUserToOrganization(organization.id, ownerUserId, "owner");
            console.log(`✅ Existing user ${data.adminEmail} added as owner to ${organization.name}`);
          }
        } catch (findError) {
          console.error("Error finding/adding existing user:", findError);
          // Continue anyway - organization was created
        }
      }
    }

    // Log audit
    await logOrganizationChange("create", organization.id, {
      name: data.name,
      slug: data.slug,
      plan: data.plan || "free",
      adminEmail: data.adminEmail,
      ownerUserId,
    });

    // Send temporary credentials email
    try {
      await sendNotification({
        recipientEmail: data.adminEmail,
        channel: 'email',
        templateCategory: 'org_credentials',
        variables: {
          organizationName: data.name,
          tempUsername: data.adminEmail, // Email IS the username
          tempPassword,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sign-in`,
          expiresAt: credentialsExpiresAt.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
        },
      });

      console.log(`📧 Credentials email sent to ${data.adminEmail} for ${organization.name}`);
    } catch (emailError) {
      console.error("Error sending credentials email:", emailError);
      // Continue anyway - organization was created and user account exists
    }

    revalidatePath("/platform/organizations");
    revalidatePath("/platform/dashboard");

    return {
      isSuccess: true,
      message: `Organization "${data.name}" created successfully. Credentials email sent to ${data.adminEmail}.`,
      data: { 
        organization,
        credentialsSent: true,
        credentialsEmail: data.adminEmail,
        ownerUserId,
      },
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