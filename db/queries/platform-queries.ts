import { db } from "../db";
import { platformAdminsTable, SelectPlatformAdmin, InsertPlatformAdmin } from "../schema/platform-schema";
import { organizationsTable, SelectOrganization } from "../schema/crm-schema";
import { userRolesTable } from "../schema/crm-schema";
import { eq, desc, count, sql } from "drizzle-orm";

/**
 * Check if a user is a platform admin
 */
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(platformAdminsTable)
      .where(eq(platformAdminsTable.userId, userId))
      .limit(1);
    
    return result.length > 0;
  } catch (error) {
    console.error("Error checking platform admin status:", error);
    return false;
  }
}

/**
 * Get platform admin by user ID
 */
export async function getPlatformAdmin(userId: string): Promise<SelectPlatformAdmin | null> {
  try {
    const result = await db
      .select()
      .from(platformAdminsTable)
      .where(eq(platformAdminsTable.userId, userId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error("Error getting platform admin:", error);
    return null;
  }
}

/**
 * Create a new platform admin
 */
export async function createPlatformAdmin(data: InsertPlatformAdmin): Promise<SelectPlatformAdmin> {
  const result = await db
    .insert(platformAdminsTable)
    .values(data)
    .returning();
  
  return result[0];
}

/**
 * Get all platform admins
 */
export async function getAllPlatformAdmins(): Promise<SelectPlatformAdmin[]> {
  return db
    .select()
    .from(platformAdminsTable)
    .orderBy(desc(platformAdminsTable.createdAt));
}

/**
 * Get all organizations with stats
 */
export async function getAllOrganizations(): Promise<(SelectOrganization & { userCount: number })[]> {
  // First get all organizations
  const orgs = await db
    .select()
    .from(organizationsTable)
    .orderBy(desc(organizationsTable.createdAt));
  
  // Then get user counts for each organization
  const orgsWithCounts = await Promise.all(
    orgs.map(async (org) => {
      const userCountResult = await db
        .select({ count: count() })
        .from(userRolesTable)
        .where(eq(userRolesTable.organizationId, org.id));
      
      const userCount = Number(userCountResult[0]?.count) || 0;
      
      return {
        ...org,
        userCount,
      };
    })
  );
  
  return orgsWithCounts;
}

/**
 * Get organization by ID with detailed stats
 */
export async function getOrganizationById(orgId: string) {
  const org = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, orgId))
    .limit(1);
  
  if (org.length === 0) return null;
  
  // Get user count
  const userCountResult = await db
    .select({ count: count() })
    .from(userRolesTable)
    .where(eq(userRolesTable.organizationId, orgId));
  
  return {
    ...org[0],
    userCount: Number(userCountResult[0]?.count) || 0,
  };
}

/**
 * Get platform-wide statistics
 */
export async function getPlatformStats() {
  // Total organizations by status
  const orgStats = await db
    .select({
      status: organizationsTable.status,
      count: count(),
    })
    .from(organizationsTable)
    .groupBy(organizationsTable.status);
  
  // Total users across all organizations
  const totalUsersResult = await db
    .select({ count: count() })
    .from(userRolesTable);
  
  // Total organizations
  const totalOrgsResult = await db
    .select({ count: count() })
    .from(organizationsTable);
  
  return {
    totalOrganizations: Number(totalOrgsResult[0]?.count) || 0,
    totalUsers: Number(totalUsersResult[0]?.count) || 0,
    organizationsByStatus: orgStats.reduce((acc, stat) => {
      acc[stat.status] = Number(stat.count);
      return acc;
    }, {} as Record<string, number>),
  };
}

/**
 * Update organization status
 */
export async function updateOrganizationStatus(
  orgId: string,
  status: "active" | "trial" | "suspended" | "cancelled"
) {
  const updates: any = { status };
  
  if (status === "suspended") {
    updates.suspendedAt = new Date();
  } else if (status === "cancelled") {
    updates.cancelledAt = new Date();
  }
  
  const result = await db
    .update(organizationsTable)
    .set(updates)
    .where(eq(organizationsTable.id, orgId))
    .returning();
  
  return result[0];
}

