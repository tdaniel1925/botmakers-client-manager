import { db } from "../db";
import { dealsTable, dealStagesTable, contactsTable, SelectDeal, InsertDeal, SelectDealStage, InsertDealStage } from "../schema";
import { eq, and, or, ilike, desc, asc, sql } from "drizzle-orm";

// Get all deals for an organization
export async function getDeals(
  organizationId: string,
  options?: {
    search?: string;
    stage?: string;
    ownerId?: string;
    limit?: number;
    offset?: number;
    sortBy?: "createdAt" | "updatedAt" | "value" | "expectedCloseDate";
    sortOrder?: "asc" | "desc";
  }
): Promise<{ deals: (SelectDeal & { contactName?: string })[]; total: number }> {
  const conditions = [eq(dealsTable.organizationId, organizationId)];
  
  // Apply filters
  if (options?.search) {
    conditions.push(
      or(
        ilike(dealsTable.title, `%${options.search}%`)
      )!
    );
  }
  
  if (options?.stage) {
    conditions.push(eq(dealsTable.stage, options.stage));
  }
  
  if (options?.ownerId) {
    conditions.push(eq(dealsTable.ownerId, options.ownerId));
  }
  
  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(dealsTable)
    .where(and(...conditions));
  
  const total = Number(countResult[0]?.count || 0);
  
  // Build query with contact name
  let query = db
    .select({
      id: dealsTable.id,
      title: dealsTable.title,
      value: dealsTable.value,
      stage: dealsTable.stage,
      probability: dealsTable.probability,
      contactId: dealsTable.contactId,
      expectedCloseDate: dealsTable.expectedCloseDate,
      actualCloseDate: dealsTable.actualCloseDate,
      notes: dealsTable.notes,
      ownerId: dealsTable.ownerId,
      organizationId: dealsTable.organizationId,
      createdBy: dealsTable.createdBy,
      createdAt: dealsTable.createdAt,
      updatedAt: dealsTable.updatedAt,
      contactName: sql<string>`CONCAT(${contactsTable.firstName}, ' ', ${contactsTable.lastName})`,
    })
    .from(dealsTable)
    .leftJoin(contactsTable, eq(dealsTable.contactId, contactsTable.id))
    .where(and(...conditions));
  
  // Apply sorting
  const sortColumn = options?.sortBy || "createdAt";
  const sortOrder = options?.sortOrder || "desc";
  
  if (sortOrder === "asc") {
    query = query.orderBy(asc(dealsTable[sortColumn]));
  } else {
    query = query.orderBy(desc(dealsTable[sortColumn]));
  }
  
  // Apply pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  
  if (options?.offset) {
    query = query.offset(options.offset);
  }
  
  const deals = await query;
  
  return { deals, total };
}

// Get deals by stage (for Kanban board)
export async function getDealsByStage(organizationId: string): Promise<Record<string, SelectDeal[]>> {
  const deals = await db
    .select()
    .from(dealsTable)
    .where(eq(dealsTable.organizationId, organizationId))
    .orderBy(desc(dealsTable.createdAt));
  
  const dealsByStage: Record<string, SelectDeal[]> = {};
  
  deals.forEach((deal) => {
    if (!dealsByStage[deal.stage]) {
      dealsByStage[deal.stage] = [];
    }
    dealsByStage[deal.stage].push(deal);
  });
  
  return dealsByStage;
}

// Get deal by ID
export async function getDealById(dealId: string, organizationId: string): Promise<SelectDeal | null> {
  const result = await db
    .select()
    .from(dealsTable)
    .where(
      and(
        eq(dealsTable.id, dealId),
        eq(dealsTable.organizationId, organizationId)
      )
    )
    .limit(1);
  
  return result[0] || null;
}

// Create deal
export async function createDeal(data: InsertDeal): Promise<SelectDeal> {
  const result = await db
    .insert(dealsTable)
    .values(data)
    .returning();
  
  return result[0];
}

// Update deal
export async function updateDeal(
  dealId: string,
  organizationId: string,
  data: Partial<InsertDeal>
): Promise<SelectDeal | null> {
  const result = await db
    .update(dealsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(dealsTable.id, dealId),
        eq(dealsTable.organizationId, organizationId)
      )
    )
    .returning();
  
  return result[0] || null;
}

// Delete deal
export async function deleteDeal(dealId: string, organizationId: string): Promise<boolean> {
  const result = await db
    .delete(dealsTable)
    .where(
      and(
        eq(dealsTable.id, dealId),
        eq(dealsTable.organizationId, organizationId)
      )
    )
    .returning();
  
  return result.length > 0;
}

// Get deal stages for organization
export async function getDealStages(organizationId: string): Promise<SelectDealStage[]> {
  const result = await db
    .select()
    .from(dealStagesTable)
    .where(eq(dealStagesTable.organizationId, organizationId))
    .orderBy(asc(dealStagesTable.order));
  
  return result;
}

// Create deal stage
export async function createDealStage(data: InsertDealStage): Promise<SelectDealStage> {
  const result = await db
    .insert(dealStagesTable)
    .values(data)
    .returning();
  
  return result[0];
}

// Initialize default deal stages for new organization
export async function initializeDefaultStages(organizationId: string): Promise<SelectDealStage[]> {
  const defaultStages = [
    { name: "Lead", order: 1, color: "#6b7280" },
    { name: "Qualified", order: 2, color: "#3b82f6" },
    { name: "Proposal", order: 3, color: "#8b5cf6" },
    { name: "Negotiation", order: 4, color: "#f59e0b" },
    { name: "Won", order: 5, color: "#10b981" },
    { name: "Lost", order: 6, color: "#ef4444" },
  ];
  
  const stages = await db
    .insert(dealStagesTable)
    .values(
      defaultStages.map((stage) => ({
        ...stage,
        organizationId,
      }))
    )
    .returning();
  
  return stages;
}

// Get deal value by stage
export async function getDealValueByStage(organizationId: string): Promise<Record<string, number>> {
  const result = await db
    .select({
      stage: dealsTable.stage,
      totalValue: sql<number>`SUM(CAST(${dealsTable.value} AS NUMERIC))`,
    })
    .from(dealsTable)
    .where(eq(dealsTable.organizationId, organizationId))
    .groupBy(dealsTable.stage);
  
  const values: Record<string, number> = {};
  result.forEach((row) => {
    values[row.stage] = Number(row.totalValue || 0);
  });
  
  return values;
}

// Get total deal value
export async function getTotalDealValue(organizationId: string): Promise<number> {
  const result = await db
    .select({
      totalValue: sql<number>`SUM(CAST(${dealsTable.value} AS NUMERIC))`,
    })
    .from(dealsTable)
    .where(eq(dealsTable.organizationId, organizationId));
  
  return Number(result[0]?.totalValue || 0);
}




