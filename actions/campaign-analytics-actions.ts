/**
 * Campaign Analytics Actions
 * Server actions for fetching campaign analytics and call history
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { isPlatformAdmin } from "@/db/queries/platform-queries";
import { getCampaignById } from "@/db/queries/voice-campaigns-queries";
import { db } from "@/db/db";
import { callRecordsTable } from "@/db/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

/**
 * Get campaign analytics with stats
 */
export async function getCampaignAnalyticsAction(campaignId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return { error: "Campaign not found" };
    }

    // Get call records for this campaign (via webhook)
    // If campaign has no webhook, return empty analytics
    const callRecords = campaign.webhookId
      ? await db
          .select()
          .from(callRecordsTable)
          .where(eq(callRecordsTable.webhookId, campaign.webhookId!))
          .orderBy(desc(callRecordsTable.callTimestamp))
      : [];

    // Calculate analytics
    const totalCalls = callRecords.length;
    // Note: status field doesn't exist in schema, using AI analysis status instead
    const completedCalls = callRecords.filter((c) => c.aiAnalysisStatus === "completed").length;
    const failedCalls = callRecords.filter((c) => c.aiAnalysisStatus === "failed").length;
    const avgDuration = callRecords.length > 0
      ? callRecords.reduce((sum, c) => sum + (c.callDurationSeconds || 0), 0) / callRecords.length
      : 0;
    // Note: cost field doesn't exist in schema
    const totalCost = 0;
    const successRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0;

    // Get today's calls
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCalls = callRecords.filter((c) => c.callTimestamp && new Date(c.callTimestamp) >= today).length;

    // Get this week's calls
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCalls = callRecords.filter((c) => c.callTimestamp && new Date(c.callTimestamp) >= weekAgo).length;

    return {
      success: true,
      analytics: {
        totalCalls,
        completedCalls,
        failedCalls,
        todayCalls,
        weekCalls,
        averageDuration: Math.round(avgDuration),
        totalCost,
        successRate: Math.round(successRate),
        callRecords: callRecords.slice(0, 10), // Return first 10 for preview
      },
    };
  } catch (error) {
    console.error("[Analytics] Error:", error);
    return { error: "Failed to fetch analytics" };
  }
}

/**
 * Get paginated call history for a campaign
 */
export async function getCampaignCallHistoryAction(
  campaignId: string,
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return { error: "Campaign not found" };
    }

    // Build query conditions
    const conditions = [eq(callRecordsTable.webhookId, campaign.webhookId!)];

    // Note: status filter removed as status field doesn't exist in schema
    // Using aiAnalysisStatus instead if needed
    if (filters?.status) {
      conditions.push(eq(callRecordsTable.aiAnalysisStatus, filters.status as any));
    }

    if (filters?.startDate) {
      conditions.push(gte(callRecordsTable.callTimestamp, new Date(filters.startDate)));
    }

    if (filters?.endDate) {
      conditions.push(lte(callRecordsTable.callTimestamp, new Date(filters.endDate)));
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(callRecordsTable)
      .where(and(...conditions));

    const totalCount = Number(countResult[0]?.count || 0);

    // Get paginated results
    const offset = (page - 1) * pageSize;
    const callRecords = await db
      .select()
      .from(callRecordsTable)
      .where(and(...conditions))
      .orderBy(desc(callRecordsTable.callTimestamp))
      .limit(pageSize)
      .offset(offset);

    return {
      success: true,
      callRecords,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error("[Call History] Error:", error);
    return { error: "Failed to fetch call history" };
  }
}

/**
 * Get call record details by ID
 */
export async function getCallRecordDetailsAction(callRecordId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const callRecord = await db
      .select()
      .from(callRecordsTable)
      .where(eq(callRecordsTable.id, callRecordId))
      .limit(1);

    if (!callRecord[0]) {
      return { error: "Call record not found" };
    }

    return {
      success: true,
      callRecord: callRecord[0],
    };
  } catch (error) {
    console.error("[Call Details] Error:", error);
    return { error: "Failed to fetch call details" };
  }
}

/**
 * Get daily call stats for charting
 */
export async function getCampaignDailyStatsAction(
  campaignId: string,
  days: number = 30
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return { error: "Campaign not found" };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const callRecords = await db
      .select()
      .from(callRecordsTable)
      .where(
        and(
          eq(callRecordsTable.webhookId, campaign.webhookId!),
          gte(callRecordsTable.callTimestamp, startDate)
        )
      );

    // Group by day
    const dailyStats = new Map<string, { calls: number; cost: number; duration: number }>();

    callRecords.forEach((record) => {
      if (!record.callTimestamp) return;
      const dateKey = new Date(record.callTimestamp).toISOString().split("T")[0];
      const existing = dailyStats.get(dateKey) || { calls: 0, cost: 0, duration: 0 };

      dailyStats.set(dateKey, {
        calls: existing.calls + 1,
        cost: existing.cost + 0, // cost field doesn't exist in schema
        duration: existing.duration + (record.callDurationSeconds || 0),
      });
    });

    // Convert to array and fill gaps
    const statsArray = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      const stats = dailyStats.get(dateKey) || { calls: 0, cost: 0, duration: 0 };

      statsArray.unshift({
        date: dateKey,
        ...stats,
      });
    }

    return {
      success: true,
      dailyStats: statsArray,
    };
  } catch (error) {
    console.error("[Daily Stats] Error:", error);
    return { error: "Failed to fetch daily stats" };
  }
}
