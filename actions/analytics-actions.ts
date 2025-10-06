"use server";

import { db } from "@/db/db";
import { contactsTable, dealsTable, activitiesTable } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { ActionResult } from "@/types/actions/actions-types";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/db/queries/organizations-queries";

interface SalesMetrics {
  totalDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalValue: number;
  wonValue: number;
  averageDealSize: number;
  winRate: number;
  conversionRate: number;
}

interface ActivityMetrics {
  totalActivities: number;
  completedActivities: number;
  overdueActivities: number;
  completionRate: number;
  activitiesByType: Record<string, number>;
}

interface PipelineMetrics {
  stageDistribution: { stage: string; count: number; value: number }[];
  dealsCreatedOverTime: { date: string; count: number }[];
  avgDealVelocity: number;
}

export async function getSalesMetricsAction(
  organizationId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ActionResult<SalesMetrics>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }

    const userRole = await getUserRole(userId, organizationId);
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }

    const conditions = [eq(dealsTable.organizationId, organizationId)];
    if (startDate) {
      conditions.push(gte(dealsTable.createdAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(dealsTable.createdAt, endDate));
    }

    // If sales rep, only show their deals
    if (userRole.role === "sales_rep") {
      conditions.push(eq(dealsTable.ownerId, userId));
    }

    const deals = await db.select().from(dealsTable).where(and(...conditions));

    const totalDeals = deals.length;
    const wonDeals = deals.filter(d => d.stage === "Won").length;
    const lostDeals = deals.filter(d => d.stage === "Lost").length;
    const totalValue = deals.reduce((sum, d) => sum + parseFloat(d.value.toString()), 0);
    const wonValue = deals.filter(d => d.stage === "Won").reduce((sum, d) => sum + parseFloat(d.value.toString()), 0);
    const averageDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
    const winRate = (wonDeals + lostDeals) > 0 ? (wonDeals / (wonDeals + lostDeals)) * 100 : 0;
    
    // Get total contacts for conversion rate
    const contactsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(contactsTable)
      .where(eq(contactsTable.organizationId, organizationId));
    const totalContacts = Number(contactsCount[0]?.count || 0);
    const conversionRate = totalContacts > 0 ? (totalDeals / totalContacts) * 100 : 0;

    return {
      isSuccess: true,
      message: "Sales metrics retrieved successfully",
      data: {
        totalDeals,
        wonDeals,
        lostDeals,
        totalValue,
        wonValue,
        averageDealSize,
        winRate,
        conversionRate,
      },
    };
  } catch (error) {
    console.error("Error getting sales metrics:", error);
    return { isSuccess: false, message: "Failed to get sales metrics" };
  }
}

export async function getActivityMetricsAction(
  organizationId: string
): Promise<ActionResult<ActivityMetrics>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }

    const userRole = await getUserRole(userId, organizationId);
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }

    const conditions = [eq(activitiesTable.organizationId, organizationId)];
    if (userRole.role === "sales_rep") {
      conditions.push(eq(activitiesTable.userId, userId));
    }

    const activities = await db.select().from(activitiesTable).where(and(...conditions));

    const totalActivities = activities.length;
    const completedActivities = activities.filter(a => a.completed).length;
    const overdueActivities = activities.filter(
      a => !a.completed && a.dueDate && new Date(a.dueDate) < new Date()
    ).length;
    const completionRate = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

    const activitiesByType: Record<string, number> = {};
    activities.forEach(a => {
      activitiesByType[a.type] = (activitiesByType[a.type] || 0) + 1;
    });

    return {
      isSuccess: true,
      message: "Activity metrics retrieved successfully",
      data: {
        totalActivities,
        completedActivities,
        overdueActivities,
        completionRate,
        activitiesByType,
      },
    };
  } catch (error) {
    console.error("Error getting activity metrics:", error);
    return { isSuccess: false, message: "Failed to get activity metrics" };
  }
}

export async function getPipelineMetricsAction(
  organizationId: string
): Promise<ActionResult<PipelineMetrics>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }

    const userRole = await getUserRole(userId, organizationId);
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }

    const conditions = [eq(dealsTable.organizationId, organizationId)];
    if (userRole.role === "sales_rep") {
      conditions.push(eq(dealsTable.ownerId, userId));
    }

    const deals = await db.select().from(dealsTable).where(and(...conditions));

    // Stage distribution
    const stageMap = new Map<string, { count: number; value: number }>();
    deals.forEach(deal => {
      const current = stageMap.get(deal.stage) || { count: 0, value: 0 };
      stageMap.set(deal.stage, {
        count: current.count + 1,
        value: current.value + parseFloat(deal.value.toString()),
      });
    });

    const stageDistribution = Array.from(stageMap.entries()).map(([stage, data]) => ({
      stage,
      count: data.count,
      value: data.value,
    }));

    // Deals created over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentDeals = deals.filter(d => new Date(d.createdAt) >= thirtyDaysAgo);
    const dealsByDate = new Map<string, number>();
    
    recentDeals.forEach(deal => {
      const date = new Date(deal.createdAt).toISOString().split('T')[0];
      dealsByDate.set(date, (dealsByDate.get(date) || 0) + 1);
    });

    const dealsCreatedOverTime = Array.from(dealsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Average deal velocity (days from creation to close)
    const closedDeals = deals.filter(d => d.actualCloseDate);
    const avgDealVelocity = closedDeals.length > 0
      ? closedDeals.reduce((sum, d) => {
          const days = Math.floor(
            (new Date(d.actualCloseDate!).getTime() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + days;
        }, 0) / closedDeals.length
      : 0;

    return {
      isSuccess: true,
      message: "Pipeline metrics retrieved successfully",
      data: {
        stageDistribution,
        dealsCreatedOverTime,
        avgDealVelocity,
      },
    };
  } catch (error) {
    console.error("Error getting pipeline metrics:", error);
    return { isSuccess: false, message: "Failed to get pipeline metrics" };
  }
}



