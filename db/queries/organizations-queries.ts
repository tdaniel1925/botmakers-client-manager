import { db } from "../db";
import { organizationsTable, userRolesTable, SelectOrganization, InsertOrganization } from "../schema/crm-schema";
import { eq, and, sql } from "drizzle-orm";

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
 * Get all organizations a user belongs to
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
      .where(eq(userRolesTable.userId, userId));
    
    return result;
  } catch (error) {
    console.error("Error getting user organizations:", error);
    return [];
  }
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(organizationId: string) {
  try {
    const result = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, organizationId))
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
