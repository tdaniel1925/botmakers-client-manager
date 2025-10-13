import { db } from "../db";
import { contactsTable, SelectContact, InsertContact } from "../schema";
import { eq, and, or, ilike, desc, asc, sql } from "drizzle-orm";

// Get all contacts for an organization
export async function getContacts(
  organizationId: string,
  options?: {
    search?: string;
    status?: string;
    ownerId?: string;
    limit?: number;
    offset?: number;
    sortBy?: "createdAt" | "updatedAt" | "firstName" | "company";
    sortOrder?: "asc" | "desc";
  }
): Promise<{ contacts: SelectContact[]; total: number }> {
  // Apply filters
  const conditions = [eq(contactsTable.organizationId, organizationId)];
  
  if (options?.search) {
    conditions.push(
      or(
        ilike(contactsTable.firstName, `%${options.search}%`),
        ilike(contactsTable.lastName, `%${options.search}%`),
        ilike(contactsTable.email, `%${options.search}%`),
        ilike(contactsTable.company, `%${options.search}%`)
      )!
    );
  }
  
  if (options?.status) {
    conditions.push(eq(contactsTable.status, options.status as any));
  }
  
  if (options?.ownerId) {
    conditions.push(eq(contactsTable.ownerId, options.ownerId));
  }
  
  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(contactsTable)
    .where(and(...conditions));
  
  const total = Number(countResult[0]?.count || 0);
  
  // Apply sorting
  const sortColumn = options?.sortBy || "createdAt";
  const sortOrder = options?.sortOrder || "desc";
  
  // Build query with sorting and pagination
  let query = db
    .select()
    .from(contactsTable)
    .where(and(...conditions))
    .orderBy(sortOrder === "asc" ? asc(contactsTable[sortColumn]) : desc(contactsTable[sortColumn]))
    .limit(options?.limit || 100)
    .$dynamic();
  
  // Apply offset if provided
  if (options?.offset) {
    query = query.offset(options.offset);
  }
  
  const contacts = await query;
  
  return { contacts, total };
}

// Get contact by ID
export async function getContactById(contactId: string, organizationId: string): Promise<SelectContact | null> {
  const result = await db
    .select()
    .from(contactsTable)
    .where(
      and(
        eq(contactsTable.id, contactId),
        eq(contactsTable.organizationId, organizationId)
      )
    )
    .limit(1);
  
  return result[0] || null;
}

// Create contact
export async function createContact(data: InsertContact): Promise<SelectContact> {
  const result = await db
    .insert(contactsTable)
    .values(data)
    .returning();
  
  return result[0];
}

// Update contact
export async function updateContact(
  contactId: string,
  organizationId: string,
  data: Partial<InsertContact>
): Promise<SelectContact | null> {
  const result = await db
    .update(contactsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(contactsTable.id, contactId),
        eq(contactsTable.organizationId, organizationId)
      )
    )
    .returning();
  
  return result[0] || null;
}

// Delete contact
export async function deleteContact(contactId: string, organizationId: string): Promise<boolean> {
  const result = await db
    .delete(contactsTable)
    .where(
      and(
        eq(contactsTable.id, contactId),
        eq(contactsTable.organizationId, organizationId)
      )
    )
    .returning();
  
  return result.length > 0;
}

// Bulk delete contacts
export async function bulkDeleteContacts(contactIds: string[], organizationId: string): Promise<number> {
  const result = await db
    .delete(contactsTable)
    .where(
      and(
        sql`${contactsTable.id} = ANY(${contactIds})`,
        eq(contactsTable.organizationId, organizationId)
      )
    )
    .returning();
  
  return result.length;
}

// Get contact count by status
export async function getContactCountByStatus(organizationId: string): Promise<Record<string, number>> {
  const result = await db
    .select({
      status: contactsTable.status,
      count: sql<number>`count(*)`,
    })
    .from(contactsTable)
    .where(eq(contactsTable.organizationId, organizationId))
    .groupBy(contactsTable.status);
  
  const counts: Record<string, number> = {};
  result.forEach((row) => {
    counts[row.status] = Number(row.count);
  });
  
  return counts;
}




