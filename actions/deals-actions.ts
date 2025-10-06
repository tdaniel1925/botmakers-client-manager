"use server";

import {
  getDeals,
  getDealsByStage,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealStages,
  createDealStage,
  initializeDefaultStages,
  getDealValueByStage,
  getTotalDealValue,
} from "@/db/queries/deals-queries";
import { InsertDeal, SelectDeal, InsertDealStage, SelectDealStage } from "@/db/schema";
import { ActionResult } from "@/types/actions/actions-types";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/db/queries/organizations-queries";
import { canAccessResource, canEditResource, canDeleteResource } from "@/lib/rbac";

export async function getDealsAction(
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
): Promise<ActionResult<{ deals: (SelectDeal & { contactName?: string })[]; total: number }>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // If user is sales_rep, only show their own deals
    let queryOptions = { ...options };
    if (userRole.role === "sales_rep") {
      queryOptions.ownerId = userId;
    }
    
    const result = await getDeals(organizationId, queryOptions);
    return { isSuccess: true, message: "Deals retrieved successfully", data: result };
  } catch (error) {
    console.error("Error getting deals:", error);
    return { isSuccess: false, message: "Failed to get deals" };
  }
}

export async function getDealsByStageAction(
  organizationId: string
): Promise<ActionResult<Record<string, SelectDeal[]>>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    let deals = await getDealsByStage(organizationId);
    
    // If user is sales_rep, filter to only their deals
    if (userRole.role === "sales_rep") {
      const filteredDeals: Record<string, SelectDeal[]> = {};
      for (const [stage, stageDeals] of Object.entries(deals)) {
        filteredDeals[stage] = stageDeals.filter(deal => deal.ownerId === userId);
      }
      deals = filteredDeals;
    }
    
    return { isSuccess: true, message: "Deals retrieved successfully", data: deals };
  } catch (error) {
    console.error("Error getting deals by stage:", error);
    return { isSuccess: false, message: "Failed to get deals" };
  }
}

export async function getDealByIdAction(
  dealId: string,
  organizationId: string
): Promise<ActionResult<SelectDeal | null>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const deal = await getDealById(dealId, organizationId);
    
    if (!deal) {
      return { isSuccess: false, message: "Deal not found" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // Check if user has permission to view this deal
    if (!canAccessResource(userRole.role as any, deal.ownerId, userId)) {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    return { isSuccess: true, message: "Deal retrieved successfully", data: deal };
  } catch (error) {
    console.error("Error getting deal:", error);
    return { isSuccess: false, message: "Failed to get deal" };
  }
}

export async function createDealAction(
  data: InsertDeal
): Promise<ActionResult<SelectDeal>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(userId, data.organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    const dealData = {
      ...data,
      ownerId: data.ownerId || userId,
      createdBy: userId,
    };
    
    const newDeal = await createDeal(dealData);
    revalidatePath("/dashboard/deals");
    return { isSuccess: true, message: "Deal created successfully", data: newDeal };
  } catch (error) {
    console.error("Error creating deal:", error);
    return { isSuccess: false, message: "Failed to create deal" };
  }
}

export async function updateDealAction(
  dealId: string,
  organizationId: string,
  data: Partial<InsertDeal>
): Promise<ActionResult<SelectDeal>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const deal = await getDealById(dealId, organizationId);
    
    if (!deal) {
      return { isSuccess: false, message: "Deal not found" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // Check if user has permission to edit this deal
    if (!canEditResource(userRole.role as any, deal.ownerId, userId)) {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    const updatedDeal = await updateDeal(dealId, organizationId, data);
    
    if (!updatedDeal) {
      return { isSuccess: false, message: "Failed to update deal" };
    }
    
    revalidatePath("/dashboard/deals");
    revalidatePath(`/dashboard/deals/${dealId}`);
    return { isSuccess: true, message: "Deal updated successfully", data: updatedDeal };
  } catch (error) {
    console.error("Error updating deal:", error);
    return { isSuccess: false, message: "Failed to update deal" };
  }
}

export async function deleteDealAction(
  dealId: string,
  organizationId: string
): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const deal = await getDealById(dealId, organizationId);
    
    if (!deal) {
      return { isSuccess: false, message: "Deal not found" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // Check if user has permission to delete this deal
    if (!canDeleteResource(userRole.role as any, deal.ownerId, userId)) {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    const success = await deleteDeal(dealId, organizationId);
    
    if (!success) {
      return { isSuccess: false, message: "Failed to delete deal" };
    }
    
    revalidatePath("/dashboard/deals");
    return { isSuccess: true, message: "Deal deleted successfully" };
  } catch (error) {
    console.error("Error deleting deal:", error);
    return { isSuccess: false, message: "Failed to delete deal" };
  }
}

export async function getDealStagesAction(
  organizationId: string
): Promise<ActionResult<SelectDealStage[]>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const stages = await getDealStages(organizationId);
    return { isSuccess: true, message: "Deal stages retrieved successfully", data: stages };
  } catch (error) {
    console.error("Error getting deal stages:", error);
    return { isSuccess: false, message: "Failed to get deal stages" };
  }
}

export async function createDealStageAction(
  data: InsertDealStage
): Promise<ActionResult<SelectDealStage>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(userId, data.organizationId);
    
    if (!userRole || userRole.role !== "admin") {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    const newStage = await createDealStage(data);
    revalidatePath("/dashboard/deals");
    revalidatePath("/dashboard/settings");
    return { isSuccess: true, message: "Deal stage created successfully", data: newStage };
  } catch (error) {
    console.error("Error creating deal stage:", error);
    return { isSuccess: false, message: "Failed to create deal stage" };
  }
}

export async function initializeDefaultStagesAction(
  organizationId: string
): Promise<ActionResult<SelectDealStage[]>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const stages = await initializeDefaultStages(organizationId);
    return { isSuccess: true, message: "Default stages initialized successfully", data: stages };
  } catch (error) {
    console.error("Error initializing default stages:", error);
    return { isSuccess: false, message: "Failed to initialize default stages" };
  }
}

export async function getDealValueByStageAction(
  organizationId: string
): Promise<ActionResult<Record<string, number>>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const values = await getDealValueByStage(organizationId);
    return { isSuccess: true, message: "Deal values retrieved successfully", data: values };
  } catch (error) {
    console.error("Error getting deal values:", error);
    return { isSuccess: false, message: "Failed to get deal values" };
  }
}

export async function getTotalDealValueAction(
  organizationId: string
): Promise<ActionResult<number>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const total = await getTotalDealValue(organizationId);
    return { isSuccess: true, message: "Total deal value retrieved successfully", data: total };
  } catch (error) {
    console.error("Error getting total deal value:", error);
    return { isSuccess: false, message: "Failed to get total deal value" };
  }
}




