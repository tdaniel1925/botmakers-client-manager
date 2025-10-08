"use server";

import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { getUserOrganizations } from "@/db/queries/organizations-queries";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { getActiveImpersonationSession } from "@/db/queries/impersonation-queries";

const VIEW_COOKIE_NAME = "app_current_view";
const VIEW_ORG_COOKIE_NAME = "app_current_view_org_id";

export interface CurrentView {
  type: "platform" | "organization";
  organizationId?: string;
  organizationName?: string;
  organizationSlug?: string;
}

/**
 * Set the current view (persisted via cookie)
 */
export async function setCurrentViewAction(
  type: "platform" | "organization",
  organizationId?: string
) {
  const cookieStore = await cookies();

  cookieStore.set(VIEW_COOKIE_NAME, type, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: "lax",
  });

  if (type === "organization" && organizationId) {
    cookieStore.set(VIEW_ORG_COOKIE_NAME, organizationId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax",
    });
  } else {
    // Clear organization ID if switching to platform view
    cookieStore.delete(VIEW_ORG_COOKIE_NAME);
  }

  return { success: true };
}

/**
 * Get the current view from cookies and enrich with organization data
 * IMPORTANT: This now checks for impersonation sessions first
 */
export async function getCurrentViewAction(): Promise<CurrentView> {
  const { userId } = await auth();
  
  if (!userId) {
    return { type: "platform" };
  }

  // Check if admin is impersonating an organization
  const impersonationSession = await getActiveImpersonationSession(userId);
  if (impersonationSession) {
    return {
      type: "organization",
      organizationId: impersonationSession.organizationId,
      organizationName: impersonationSession.organizationName,
      organizationSlug: "", // Slug not stored in impersonation session
    };
  }

  const cookieStore = await cookies();
  const viewType = cookieStore.get(VIEW_COOKIE_NAME)?.value;
  const viewOrgId = cookieStore.get(VIEW_ORG_COOKIE_NAME)?.value;

  // Default to platform view
  if (!viewType || viewType === "platform") {
    return { type: "platform" };
  }

  // If organization view is set, validate and enrich with org data
  if (viewType === "organization" && viewOrgId) {
    const userOrgs = await getUserOrganizations(userId);
    const org = userOrgs.find((o) => o.id === viewOrgId);

    if (org) {
      return {
        type: "organization",
        organizationId: org.id,
        organizationName: org.name,
        organizationSlug: org.slug,
      };
    }
  }

  // Fallback to platform view if organization not found
  return { type: "platform" };
}

/**
 * Get all organizations the current user can view (for view switcher dropdown)
 */
export async function getAvailableOrganizationsAction() {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  // Get user's organizations
  const userOrgs = await getUserOrganizations(userId);

  return userOrgs.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    plan: org.plan,
  }));
}

/**
 * Get data needed for view switcher component
 */
export async function getViewSwitcherDataAction() {
  const { userId } = await auth();
  
  if (!userId) {
    return {
      currentView: { type: "platform" as const },
      availableOrganizations: [],
      isPlatformAdmin: false,
    };
  }

  const [currentView, availableOrganizations, isAdmin] = await Promise.all([
    getCurrentViewAction(),
    getAvailableOrganizationsAction(),
    isPlatformAdmin(),
  ]);

  return {
    currentView,
    availableOrganizations,
    isPlatformAdmin: isAdmin,
  };
}
