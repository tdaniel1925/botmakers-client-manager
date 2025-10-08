/**
 * Server-Side Organization Context Helper
 * Gets the current user's organization information in server components
 */

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { userRolesTable, organizationsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface OrganizationContext {
  organizationId: string;
  organizationName: string;
  role: "admin" | "manager" | "member";
  userId: string;
}

/**
 * Get the current user's organization context (server-side)
 * Returns the first organization the user belongs to
 */
export async function getOrganizationContext(): Promise<OrganizationContext | null> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    // Get user's organization membership
    const userRole = await db
      .select({
        organizationId: userRolesTable.organizationId,
        role: userRolesTable.role,
        organizationName: organizationsTable.name,
      })
      .from(userRolesTable)
      .leftJoin(organizationsTable, eq(userRolesTable.organizationId, organizationsTable.id))
      .where(eq(userRolesTable.userId, userId))
      .limit(1);

    if (userRole.length === 0 || !userRole[0].organizationName) {
      return null;
    }

    return {
      organizationId: userRole[0].organizationId,
      organizationName: userRole[0].organizationName,
      role: userRole[0].role,
      userId,
    };
  } catch (error) {
    console.error("Error getting organization context:", error);
    return null;
  }
}

/**
 * Require organization context (throw error if not found)
 */
export async function requireOrganizationContext(): Promise<OrganizationContext> {
  const context = await getOrganizationContext();
  
  if (!context) {
    throw new Error("No organization found for user");
  }
  
  return context;
}

/**
 * Get just the organization ID (convenience function)
 */
export async function getServerOrganizationId(): Promise<string | null> {
  const context = await getOrganizationContext();
  return context?.organizationId || null;
}

/**
 * Check if user has access to a specific organization
 */
export async function hasOrganizationAccess(organizationId: string): Promise<boolean> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return false;
    }

    // Platform admins have access to all organizations
    const { isPlatformAdmin } = await import('./platform-admin');
    if (await isPlatformAdmin()) {
      return true;
    }

    const userRole = await db
      .select()
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, userId))
      .where(eq(userRolesTable.organizationId, organizationId))
      .limit(1);

    return userRole.length > 0;
  } catch (error) {
    console.error("Error checking organization access:", error);
    return false;
  }
}



