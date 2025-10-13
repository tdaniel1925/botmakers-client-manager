"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { 
  getOrganizationMembers, 
  updateUserRole, 
  removeUserFromOrganization,
  addUserToOrganization 
} from "@/db/queries/organizations-queries";
import { ActionResult } from "@/types";
import { logAudit } from "@/lib/audit-logger";
import { sendNotification } from "@/lib/notification-service";
import crypto from "crypto";

/**
 * Generate a secure random password
 */
function generateSecurePassword(length: number = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
}

/**
 * Get all team members for current organization
 */
export async function getTeamMembersAction(organizationId: string): Promise<ActionResult<any[]>> {
  const { userId } = await auth();
  
  if (!userId) {
    return { isSuccess: false, message: "Unauthorized" };
  }

  try {
    const members = await getOrganizationMembers(organizationId);
    
    // Enrich with Clerk user data
    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        try {
          const user = await (await clerkClient()).users.getUser(member.userId);
          return {
            ...member,
            email: user.emailAddresses[0]?.emailAddress || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.emailAddresses[0]?.emailAddress || "Unknown",
            imageUrl: user.imageUrl,
          };
        } catch (error) {
          console.error(`Error fetching user ${member.userId}:`, error);
          return {
            ...member,
            email: "Unknown",
            fullName: "Unknown User",
          };
        }
      })
    );

    return { isSuccess: true, message: "Team members fetched successfully", data: enrichedMembers };
  } catch (error: any) {
    console.error("Error getting team members:", error);
    return { isSuccess: false, message: "Failed to get team members" };
  }
}

/**
 * Invite a new team member to the organization
 */
export async function inviteTeamMemberAction(
  organizationId: string,
  email: string,
  role: "owner" | "admin" | "member" = "member"
): Promise<ActionResult<any>> {
  const { userId } = await auth();
  
  if (!userId) {
    return { isSuccess: false, message: "Unauthorized" };
  }

  try {
    // Generate a secure password
    const tempPassword = generateSecurePassword();

    // Create user in Clerk
    const clerk = await clerkClient();
    const newUser = await clerk.users.createUser({
      emailAddress: [email],
      password: tempPassword,
      skipPasswordRequirement: false,
    });

    // Add user to organization in database
    // Map roles to allowed types: owner->admin, member->manager
    const dbRole: "admin" | "manager" | "sales_rep" = 
      role === "owner" ? "admin" : 
      role === "member" ? "manager" : 
      role as "admin" | "manager" | "sales_rep";
    await addUserToOrganization(organizationId, newUser.id, dbRole);

    // TODO: Send notification with credentials
    // The notification service needs proper email template configuration
    console.log(`📧 Would send team invitation to ${email}:`, {
      subject: "Welcome to the team! Your login credentials",
      email,
      tempPassword,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
      note: "Notification service needs to be properly configured",
    });

    // Log audit
    await logAudit({
      action: "team_member_invited",
      entityType: "user_role",
      entityId: newUser.id,
      changes: { organizationId, email, role },
    });

    return { 
      isSuccess: true, 
      message: "Team member invited successfully", 
      data: { email, tempPassword } 
    };
  } catch (error: any) {
    console.error("Error inviting team member:", error);
    
    if (error.message?.includes("already exists")) {
      return { isSuccess: false, message: "A user with this email already exists" };
    }
    
    return { isSuccess: false, message: "Failed to invite team member" };
  }
}

/**
 * Update a team member's role
 */
export async function updateTeamMemberRoleAction(
  organizationId: string,
  targetUserId: string,
  newRole: "owner" | "admin" | "member"
): Promise<ActionResult<void>> {
  const { userId } = await auth();
  
  if (!userId) {
    return { isSuccess: false, message: "Unauthorized" };
  }

  try {
    // Map roles to allowed types: owner->admin, member->manager
    const dbRole: "admin" | "manager" | "sales_rep" = 
      newRole === "owner" ? "admin" : 
      newRole === "member" ? "manager" : 
      newRole as "admin" | "manager" | "sales_rep";
    await updateUserRole(organizationId, targetUserId, dbRole);

    // Log audit
    await logAudit({
      action: "team_member_role_updated",
      entityType: "user_role",
      entityId: targetUserId,
      changes: { organizationId, newRole },
    });

    return { isSuccess: true, message: "Role updated successfully" };
  } catch (error: any) {
    console.error("Error updating team member role:", error);
    return { isSuccess: false, message: error.message || "Failed to update role" };
  }
}

/**
 * Remove a team member from the organization
 */
export async function removeTeamMemberAction(
  organizationId: string,
  targetUserId: string
): Promise<ActionResult<void>> {
  const { userId } = await auth();
  
  if (!userId) {
    return { isSuccess: false, message: "Unauthorized" };
  }

  try {
    await removeUserFromOrganization(organizationId, targetUserId);

    // Log audit
    await logAudit({
      action: "team_member_removed",
      entityType: "user_role",
      entityId: targetUserId,
      changes: { organizationId },
    });

    return { isSuccess: true, message: "Team member removed successfully" };
  } catch (error: any) {
    console.error("Error removing team member:", error);
    return { isSuccess: false, message: error.message || "Failed to remove team member" };
  }
}
