"use server";

import { auth } from "@clerk/nextjs/server";
import { isPlatformAdmin } from "@/db/queries/platform-queries";
import { getOrganizationById, updateOrganization } from "@/db/queries/organizations-queries";
import { sendNotification } from "@/lib/notification-service";
import { ActionResult } from "@/types";
import { logOrganizationChange } from "@/lib/audit-logger";

/**
 * Resend temporary credentials email to organization contact
 */
export async function resendCredentialsAction(
  orgId: string,
  recipientEmail: string
): Promise<ActionResult<{ emailSent: boolean }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }

    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { isSuccess: false, message: "Platform admin access required" };
    }

    // Get organization
    const org = await getOrganizationById(orgId);
    if (!org) {
      return { isSuccess: false, message: "Organization not found" };
    }

    // Check if credentials exist
    if (!org.tempUsername || !org.tempPassword) {
      return { 
        isSuccess: false, 
        message: "No temporary credentials found for this organization" 
      };
    }

    // Check if credentials are expired
    if (org.credentialsExpiresAt && new Date(org.credentialsExpiresAt) < new Date()) {
      return { 
        isSuccess: false, 
        message: "Credentials have expired. Please generate new credentials." 
      };
    }

    // Check if credentials were already used
    if (org.credentialsUsedAt) {
      return { 
        isSuccess: false, 
        message: "Credentials have already been used. Contact support to reset access." 
      };
    }

    // Send credentials email
    await sendNotification({
      recipientEmail,
      channel: 'email',
      templateCategory: 'org_credentials',
      variables: {
        organizationName: org.name,
        tempUsername: org.tempUsername,
        tempPassword: org.tempPassword,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
        expiresAt: org.credentialsExpiresAt 
          ? new Date(org.credentialsExpiresAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          : 'in 7 days',
      },
    });

    // Update sent timestamp
    await updateOrganization(orgId, {
      credentialsSentAt: new Date(),
    });

    // Log audit
    await logOrganizationChange("credentials_resent", orgId, {
      sentTo: recipientEmail,
      sentBy: userId,
    });

    return {
      isSuccess: true,
      message: `Credentials email sent successfully to ${recipientEmail}`,
      data: { emailSent: true },
    };
  } catch (error) {
    console.error("Error resending credentials:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to resend credentials",
    };
  }
}
