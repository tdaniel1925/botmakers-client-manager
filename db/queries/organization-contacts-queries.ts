/**
 * Organization Contacts Database Queries
 * CRUD operations for organization contact management
 */

import { db } from "../db";
import {
  organizationContactsTable,
  SelectOrganizationContact,
  InsertOrganizationContact,
} from "../schema/organization-contacts-schema";
import { eq, and, or, ilike, desc, sql } from "drizzle-orm";

/**
 * Get all contacts for an organization
 */
export async function getOrganizationContacts(
  organizationId: string,
  options?: {
    search?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<{ contacts: SelectOrganizationContact[]; total: number }> {
  const { search, isActive, limit = 50, offset = 0 } = options || {};
  
  let query = db.select().from(organizationContactsTable);
  
  const conditions = [eq(organizationContactsTable.organizationId, organizationId)];
  
  if (search) {
    conditions.push(
      or(
        ilike(organizationContactsTable.firstName, `%${search}%`),
        ilike(organizationContactsTable.lastName, `%${search}%`),
        ilike(organizationContactsTable.email, `%${search}%`),
        ilike(organizationContactsTable.phone, `%${search}%`)
      )!
    );
  }
  
  if (isActive !== undefined) {
    conditions.push(eq(organizationContactsTable.isActive, isActive));
  }
  
  query = query.where(and(...conditions)) as typeof query;
  
  // Get total count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(organizationContactsTable)
    .where(and(...conditions));
  
  // Get paginated results
  const contacts = await query
    .orderBy(desc(organizationContactsTable.createdAt))
    .limit(limit)
    .offset(offset);
  
  return {
    contacts,
    total: countResult?.count || 0,
  };
}

/**
 * Get contact by ID
 */
export async function getContactById(
  contactId: string
): Promise<SelectOrganizationContact | null> {
  const [contact] = await db
    .select()
    .from(organizationContactsTable)
    .where(eq(organizationContactsTable.id, contactId))
    .limit(1);
  
  return contact || null;
}

/**
 * Get primary contact for organization
 */
export async function getPrimaryContact(
  organizationId: string
): Promise<SelectOrganizationContact | null> {
  const [contact] = await db
    .select()
    .from(organizationContactsTable)
    .where(
      and(
        eq(organizationContactsTable.organizationId, organizationId),
        eq(organizationContactsTable.isPrimary, true),
        eq(organizationContactsTable.isActive, true)
      )
    )
    .limit(1);
  
  return contact || null;
}

/**
 * Create new organization contact
 */
export async function createOrganizationContact(
  data: InsertOrganizationContact
): Promise<SelectOrganizationContact> {
  // If setting as primary, unset other primary contacts for this org
  if (data.isPrimary) {
    await db
      .update(organizationContactsTable)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(eq(organizationContactsTable.organizationId, data.organizationId));
  }
  
  const [contact] = await db
    .insert(organizationContactsTable)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  
  return contact;
}

/**
 * Update organization contact
 */
export async function updateOrganizationContact(
  contactId: string,
  data: Partial<InsertOrganizationContact>
): Promise<SelectOrganizationContact | null> {
  // If setting as primary, unset other primary contacts for this org
  if (data.isPrimary) {
    const contact = await getContactById(contactId);
    if (contact) {
      await db
        .update(organizationContactsTable)
        .set({ isPrimary: false, updatedAt: new Date() })
        .where(
          and(
            eq(organizationContactsTable.organizationId, contact.organizationId),
            sql`${organizationContactsTable.id} != ${contactId}`
          )
        );
    }
  }
  
  const [updated] = await db
    .update(organizationContactsTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(organizationContactsTable.id, contactId))
    .returning();
  
  return updated || null;
}

/**
 * Delete contact (soft delete by setting isActive = false)
 */
export async function deleteOrganizationContact(
  contactId: string,
  hardDelete: boolean = false
): Promise<boolean> {
  if (hardDelete) {
    await db
      .delete(organizationContactsTable)
      .where(eq(organizationContactsTable.id, contactId));
    
    return true;
  } else {
    // Soft delete
    await db
      .update(organizationContactsTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(organizationContactsTable.id, contactId));
    
    return true;
  }
}

/**
 * Get contact count for organization
 */
export async function getContactCount(organizationId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(organizationContactsTable)
    .where(
      and(
        eq(organizationContactsTable.organizationId, organizationId),
        eq(organizationContactsTable.isActive, true)
      )
    );
  
  return result?.count || 0;
}
