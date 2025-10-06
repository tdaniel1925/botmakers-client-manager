import { db } from "../db";
import { activitiesTable, contactsTable, dealsTable, SelectActivity, InsertActivity } from "../schema";
import { eq, and, or, gte, lte, desc, asc, sql } from "drizzle-orm";

// Get all activities for an organization
export async function getActivities(
  organizationId: string,
  options?: {
    userId?: string;
    contactId?: string;
    dealId?: string;
    type?: string;
    completed?: boolean;
    dueDateFrom?: Date;
    dueDateTo?: Date;
    limit?: number;
    offset?: number;
    sortBy?: "createdAt" | "updatedAt" | "dueDate";
    sortOrder?: "asc" | "desc";
  }
): Promise<{ activities: (SelectActivity & { contactName?: string; dealTitle?: string })[]; total: number }> {
  const conditions = [eq(activitiesTable.organizationId, organizationId)];
  
  // Apply filters
  if (options?.userId) {
    conditions.push(eq(activitiesTable.userId, options.userId));
  }
  
  if (options?.contactId) {
    conditions.push(eq(activitiesTable.contactId, options.contactId));
  }
  
  if (options?.dealId) {
    conditions.push(eq(activitiesTable.dealId, options.dealId));
  }
  
  if (options?.type) {
    conditions.push(eq(activitiesTable.type, options.type as any));
  }
  
  if (options?.completed !== undefined) {
    conditions.push(eq(activitiesTable.completed, options.completed));
  }
  
  if (options?.dueDateFrom) {
    conditions.push(gte(activitiesTable.dueDate, options.dueDateFrom));
  }
  
  if (options?.dueDateTo) {
    conditions.push(lte(activitiesTable.dueDate, options.dueDateTo));
  }
  
  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(activitiesTable)
    .where(and(...conditions));
  
  const total = Number(countResult[0]?.count || 0);
  
  // Build query with related data
  let query = db
    .select({
      id: activitiesTable.id,
      type: activitiesTable.type,
      subject: activitiesTable.subject,
      description: activitiesTable.description,
      dueDate: activitiesTable.dueDate,
      completed: activitiesTable.completed,
      completedAt: activitiesTable.completedAt,
      contactId: activitiesTable.contactId,
      dealId: activitiesTable.dealId,
      userId: activitiesTable.userId,
      organizationId: activitiesTable.organizationId,
      createdBy: activitiesTable.createdBy,
      createdAt: activitiesTable.createdAt,
      updatedAt: activitiesTable.updatedAt,
      contactName: sql<string>`CONCAT(${contactsTable.firstName}, ' ', ${contactsTable.lastName})`,
      dealTitle: dealsTable.title,
    })
    .from(activitiesTable)
    .leftJoin(contactsTable, eq(activitiesTable.contactId, contactsTable.id))
    .leftJoin(dealsTable, eq(activitiesTable.dealId, dealsTable.id))
    .where(and(...conditions));
  
  // Apply sorting
  const sortColumn = options?.sortBy || "dueDate";
  const sortOrder = options?.sortOrder || "asc";
  
  if (sortOrder === "asc") {
    query = query.orderBy(asc(activitiesTable[sortColumn]));
  } else {
    query = query.orderBy(desc(activitiesTable[sortColumn]));
  }
  
  // Apply pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  
  if (options?.offset) {
    query = query.offset(options.offset);
  }
  
  const activities = await query;
  
  return { activities, total };
}

// Get activity by ID
export async function getActivityById(activityId: string, organizationId: string): Promise<SelectActivity | null> {
  const result = await db
    .select()
    .from(activitiesTable)
    .where(
      and(
        eq(activitiesTable.id, activityId),
        eq(activitiesTable.organizationId, organizationId)
      )
    )
    .limit(1);
  
  return result[0] || null;
}

// Create activity
export async function createActivity(data: InsertActivity): Promise<SelectActivity> {
  const result = await db
    .insert(activitiesTable)
    .values(data)
    .returning();
  
  return result[0];
}

// Update activity
export async function updateActivity(
  activityId: string,
  organizationId: string,
  data: Partial<InsertActivity>
): Promise<SelectActivity | null> {
  const result = await db
    .update(activitiesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(activitiesTable.id, activityId),
        eq(activitiesTable.organizationId, organizationId)
      )
    )
    .returning();
  
  return result[0] || null;
}

// Mark activity as complete
export async function markActivityComplete(
  activityId: string,
  organizationId: string
): Promise<SelectActivity | null> {
  const result = await db
    .update(activitiesTable)
    .set({ 
      completed: true, 
      completedAt: new Date(),
      updatedAt: new Date() 
    })
    .where(
      and(
        eq(activitiesTable.id, activityId),
        eq(activitiesTable.organizationId, organizationId)
      )
    )
    .returning();
  
  return result[0] || null;
}

// Delete activity
export async function deleteActivity(activityId: string, organizationId: string): Promise<boolean> {
  const result = await db
    .delete(activitiesTable)
    .where(
      and(
        eq(activitiesTable.id, activityId),
        eq(activitiesTable.organizationId, organizationId)
      )
    )
    .returning();
  
  return result.length > 0;
}

// Get overdue activities
export async function getOverdueActivities(organizationId: string, userId?: string): Promise<SelectActivity[]> {
  const conditions = [
    eq(activitiesTable.organizationId, organizationId),
    eq(activitiesTable.completed, false),
    lte(activitiesTable.dueDate, new Date()),
  ];
  
  if (userId) {
    conditions.push(eq(activitiesTable.userId, userId));
  }
  
  const result = await db
    .select()
    .from(activitiesTable)
    .where(and(...conditions))
    .orderBy(asc(activitiesTable.dueDate));
  
  return result;
}

// Get today's activities
export async function getTodaysActivities(organizationId: string, userId?: string): Promise<SelectActivity[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const conditions = [
    eq(activitiesTable.organizationId, organizationId),
    gte(activitiesTable.dueDate, today),
    lte(activitiesTable.dueDate, tomorrow),
  ];
  
  if (userId) {
    conditions.push(eq(activitiesTable.userId, userId));
  }
  
  const result = await db
    .select()
    .from(activitiesTable)
    .where(and(...conditions))
    .orderBy(asc(activitiesTable.dueDate));
  
  return result;
}

// Get activity count by type
export async function getActivityCountByType(organizationId: string): Promise<Record<string, number>> {
  const result = await db
    .select({
      type: activitiesTable.type,
      count: sql<number>`count(*)`,
    })
    .from(activitiesTable)
    .where(eq(activitiesTable.organizationId, organizationId))
    .groupBy(activitiesTable.type);
  
  const counts: Record<string, number> = {};
  result.forEach((row) => {
    counts[row.type] = Number(row.count);
  });
  
  return counts;
}




