import { db } from "../db";
import { organizationsTable, userRolesTable, SelectOrganization, InsertOrganization } from "../schema/crm-schema";
import { eq, and, sql, isNull, isNotNull } from "drizzle-orm"; // ✅ FIX BUG-014: Added isNull, isNotNull for soft delete

/**
 * Get user's role in a specific organization
 */
export async function getUserRole(userId: string, organizationId: string) {
  try {
    const result = await db
      .select()
      .from(userRolesTable)
      .where(
        and(
          eq(userRolesTable.userId, userId),
          eq(userRolesTable.organizationId, organizationId)
        )
      )
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

/**
 * Get all organizations a user belongs to (excludes soft-deleted)
 * ✅ FIX BUG-014: Filter out soft-deleted organizations
 */
export async function getUserOrganizations(userId: string) {
  try {
    const result = await db
      .select({
        id: organizationsTable.id,
        name: organizationsTable.name,
        slug: organizationsTable.slug,
        plan: organizationsTable.plan,
        status: organizationsTable.status,
        maxUsers: organizationsTable.maxUsers,
        createdAt: organizationsTable.createdAt,
        updatedAt: organizationsTable.updatedAt,
        role: userRolesTable.role,
      })
      .from(userRolesTable)
      .innerJoin(organizationsTable, eq(userRolesTable.organizationId, organizationsTable.id))
      .where(
        and(
          eq(userRolesTable.userId, userId),
          isNull(organizationsTable.deletedAt) // ✅ Exclude soft-deleted orgs
        )
      );
    
    // Remove duplicates if user has multiple roles in same org
    const uniqueOrgs = result.reduce((acc, org) => {
      if (!acc.find(o => o.id === org.id)) {
        acc.push(org);
      }
      return acc;
    }, [] as typeof result);
    
    return uniqueOrgs;
  } catch (error) {
    console.error("Error getting user organizations:", error);
    return [];
  }
}

/**
 * Get organization by ID (excludes soft-deleted unless includeDeleted=true)
 * ✅ FIX BUG-014: Filter out soft-deleted organizations by default
 */
export async function getOrganizationById(organizationId: string, includeDeleted = false) {
  try {
    const conditions = [eq(organizationsTable.id, organizationId)];
    
    // By default, exclude soft-deleted organizations
    if (!includeDeleted) {
      conditions.push(isNull(organizationsTable.deletedAt));
    }
    
    const result = await db
      .select()
      .from(organizationsTable)
      .where(and(...conditions))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error("Error getting organization:", error);
    return null;
  }
}

/**
 * Create a new organization
 */
export async function createOrganization(data: InsertOrganization): Promise<SelectOrganization> {
  const result = await db
    .insert(organizationsTable)
    .values(data)
    .returning();
  
  return result[0];
}

/**
 * Update an organization
 */
export async function updateOrganization(
  organizationId: string,
  data: Partial<InsertOrganization>
): Promise<SelectOrganization> {
  const result = await db
    .update(organizationsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(organizationsTable.id, organizationId))
    .returning();
  
  return result[0];
}

/**
 * Add user to organization with role
 */
export async function addUserToOrganization(
  userId: string,
  organizationId: string,
  role: "admin" | "manager" | "sales_rep" = "sales_rep"
) {
  const result = await db
    .insert(userRolesTable)
    .values({
      userId,
      organizationId,
      role,
    })
    .returning();
  
  return result[0];
}

/**
 * Get all members of an organization
 */
export async function getOrganizationMembers(organizationId: string) {
  try {
    const result = await db
      .select()
      .from(userRolesTable)
      .where(eq(userRolesTable.organizationId, organizationId));
    
    return result;
  } catch (error) {
    console.error("Error getting organization members:", error);
    return [];
  }
}

/**
 * Update user role in organization
 */
export async function updateUserRole(
  userId: string,
  organizationId: string,
  newRole: "admin" | "manager" | "sales_rep"
) {
  try {
    const result = await db
      .update(userRolesTable)
      .set({ role: newRole, updatedAt: new Date() })
      .where(
        and(
          eq(userRolesTable.userId, userId),
          eq(userRolesTable.organizationId, organizationId)
        )
      )
      .returning();
    
    return result[0] || null;
  } catch (error) {
    console.error("Error updating user role:", error);
    return null;
  }
}

/**
 * Remove user from organization
 */
export async function removeUserFromOrganization(
  userId: string,
  organizationId: string
) {
  try {
    const result = await db
      .delete(userRolesTable)
      .where(
        and(
          eq(userRolesTable.userId, userId),
          eq(userRolesTable.organizationId, organizationId)
        )
      )
      .returning();
    
    return result[0] || null;
  } catch (error) {
    console.error("Error removing user from organization:", error);
    return null;
  }
}

/**
 * Check if slug is available
 */
export async function isSlugAvailable(slug: string, excludeOrgId?: string): Promise<boolean> {
  try {
    const query = excludeOrgId
      ? db
          .select()
          .from(organizationsTable)
          .where(
            and(
              eq(organizationsTable.slug, slug),
              sql`${organizationsTable.id} != ${excludeOrgId}`
            )
          )
      : db
          .select()
          .from(organizationsTable)
          .where(eq(organizationsTable.slug, slug));

    const result = await query.limit(1);
    return result.length === 0;
  } catch (error) {
    console.error("Error checking slug availability:", error);
    return false;
  }
}

/**
 * Soft delete an organization (mark as deleted instead of removing from DB)
 * ✅ FIX BUG-014: Implement soft delete for organization recovery
 */
export async function softDeleteOrganization(
  organizationId: string,
  deletedByUserId: string
): Promise<SelectOrganization | null> {
  try {
    const result = await db
      .update(organizationsTable)
      .set({
        deletedAt: new Date(),
        deletedBy: deletedByUserId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(organizationsTable.id, organizationId),
          isNull(organizationsTable.deletedAt) // Only delete if not already deleted
        )
      )
      .returning();
    
    return result[0] || null;
  } catch (error) {
    console.error("Error soft deleting organization:", error);
    return null;
  }
}

/**
 * Restore a soft-deleted organization
 * ✅ FIX BUG-014: Allow recovery of accidentally deleted organizations
 */
export async function restoreOrganization(organizationId: string): Promise<SelectOrganization | null> {
  try {
    const result = await db
      .update(organizationsTable)
      .set({
        deletedAt: null,
        deletedBy: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(organizationsTable.id, organizationId),
          isNotNull(organizationsTable.deletedAt) // Only restore if actually deleted
        )
      )
      .returning();
    
    return result[0] || null;
  } catch (error) {
    console.error("Error restoring organization:", error);
    return null;
  }
}

/**
 * Get all soft-deleted organizations (for admin recovery UI)
 * ✅ FIX BUG-014: Admin interface to recover deleted organizations
 */
export async function getDeletedOrganizations(): Promise<SelectOrganization[]> {
  try {
    const result = await db
      .select()
      .from(organizationsTable)
      .where(isNotNull(organizationsTable.deletedAt))
      .orderBy(sql`${organizationsTable.deletedAt} DESC`);
    
    return result;
  } catch (error) {
    console.error("Error getting deleted organizations:", error);
    return [];
  }
}

/**
 * Permanently delete an organization (hard delete - use with caution!)
 * ✅ FIX BUG-014: Only for admin cleanup after confirmation
 */
export async function permanentlyDeleteOrganization(organizationId: string): Promise<boolean> {
  try {
    const result = await db
      .delete(organizationsTable)
      .where(
        and(
          eq(organizationsTable.id, organizationId),
          isNotNull(organizationsTable.deletedAt) // Only hard delete if already soft-deleted
        )
      )
      .returning();
    
    return result.length > 0;
  } catch (error) {
    console.error("Error permanently deleting organization:", error);
    return false;
  }
}
