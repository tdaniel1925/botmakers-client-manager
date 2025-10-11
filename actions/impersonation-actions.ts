"use server";

/**
 * Impersonation Actions
 * Allow platform admins to impersonate organizations for support/testing
 */

import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { getOrganizationById } from "@/db/queries/organizations-queries";
import {
  createImpersonationSession,
  endImpersonationSession,
  getActiveImpersonationSession,
  logImpersonationAction,
} from "@/db/queries/impersonation-queries";

const IMPERSONATION_COOKIE = "impersonation_session_id";
const IMPERSONATION_ORG_COOKIE = "impersonation_org_id";

export interface ImpersonationStatus {
  isImpersonating: boolean;
  sessionId?: string;
  organizationId?: string;
  organizationName?: string;
  startedAt?: Date;
}

/**
 * Start impersonating an organization (platform admin only)
 */
export async function startImpersonationAction(
  organizationId: string,
  reason?: string
): Promise<{ success: boolean; error?: string; sessionId?: string }> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify platform admin
    const isAdmin = await isPlatformAdmin();
    if (!isAdmin) {
      return { success: false, error: "Unauthorized: Platform admin access required" };
    }

    // Check if already impersonating
    const existingSession = await getActiveImpersonationSession(userId);
    if (existingSession) {
      return { 
        success: false, 
        error: "Already impersonating another organization. Please exit current session first." 
      };
    }

    // Verify organization exists
    const organization = await getOrganizationById(organizationId);
    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    // Get admin user details
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const adminEmail = user.emailAddresses[0]?.emailAddress || "unknown";

    // Create impersonation session
    const session = await createImpersonationSession({
      adminUserId: userId,
      adminEmail,
      organizationId: organization.id,
      organizationName: organization.name,
      reason: reason || "Support/Testing",
      isActive: true,
    });

    // Set cookies to maintain session
    const cookieStore = await cookies();
    cookieStore.set(IMPERSONATION_COOKIE, session.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours max
    });

    cookieStore.set(IMPERSONATION_ORG_COOKIE, organizationId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
    });

    console.log(`[Impersonation] Admin ${adminEmail} started impersonating ${organization.name}`);

    return { success: true, sessionId: session.id };
  } catch (error) {
    console.error("[Impersonation] Start error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to start impersonation" 
    };
  }
}

/**
 * End impersonation session
 */
export async function endImpersonationAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Get active session
    const session = await getActiveImpersonationSession(userId);
    if (!session) {
      return { success: false, error: "No active impersonation session" };
    }

    // End session
    await endImpersonationSession(session.id);

    // Clear cookies
    const cookieStore = await cookies();
    cookieStore.delete(IMPERSONATION_COOKIE);
    cookieStore.delete(IMPERSONATION_ORG_COOKIE);

    console.log(`[Impersonation] Session ${session.id} ended by admin ${session.adminEmail}`);

    return { success: true };
  } catch (error) {
    console.error("[Impersonation] End error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to end impersonation" 
    };
  }
}

/**
 * Get current impersonation status
 * 
 * TEMPORARILY DISABLED: Impersonation table needs to be created via migration
 */
export async function getImpersonationStatusAction(): Promise<ImpersonationStatus> {
  // TEMPORARY: Return false until impersonation table is created
  return { isImpersonating: false };
  
  /* ORIGINAL CODE - restore after running db:push
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isImpersonating: false };
    }

    const session = await getActiveImpersonationSession(userId);
    
    if (!session) {
      return { isImpersonating: false };
    }

    return {
      isImpersonating: true,
      sessionId: session.id,
      organizationId: session.organizationId,
      organizationName: session.organizationName,
      startedAt: session.startedAt,
    };
  } catch (error) {
    console.error("[Impersonation] Status error:", error);
    return { isImpersonating: false };
  }
  */
}

/**
 * Log an action during impersonation (for audit trail)
 */
export async function logImpersonationActionAction(action: string): Promise<void> {
  try {
    const { userId } = await auth();
    if (!userId) return;

    const session = await getActiveImpersonationSession(userId);
    if (!session) return;

    await logImpersonationAction(session.id, action);
  } catch (error) {
    console.error("[Impersonation] Log action error:", error);
  }
}

/**
 * Get the effective organization ID (impersonated org or actual org)
 */
export async function getEffectiveOrganizationId(): Promise<string | null> {
  try {
    const status = await getImpersonationStatusAction();
    
    if (status.isImpersonating && status.organizationId) {
      return status.organizationId;
    }

    return null;
  } catch (error) {
    console.error("[Impersonation] Get effective org error:", error);
    return null;
  }
}
