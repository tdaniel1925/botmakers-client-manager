/**
 * Self-Healing System Server Actions
 * Actions for the admin dashboard to view healing events and health status
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { isPlatformAdmin } from "@/db/queries/platform-queries";
import {
  getHealingEvents,
  getHealthChecks,
  getHealingStats,
  getLatestHealthChecks,
  getTopHealingPatterns,
} from "@/db/queries/healing-queries";
import { ActionResult } from "@/types";

/**
 * Get healing events for dashboard
 */
export async function getHealingEventsAction(options: {
  limit?: number;
  offset?: number;
  category?: string;
  severity?: string;
  result?: string;
}): Promise<ActionResult<any[]>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    
    if (!isAdmin) {
      return { isSuccess: false, message: "Platform admin access required" };
    }
    
    const events = await getHealingEvents(options);
    
    return {
      isSuccess: true,
      message: "Healing events fetched successfully",
      data: events,
    };
  } catch (error: any) {
    console.error("Error fetching healing events:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch healing events",
    };
  }
}

/**
 * Get health checks for dashboard
 */
export async function getHealthChecksAction(options: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<ActionResult<any[]>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    
    if (!isAdmin) {
      return { isSuccess: false, message: "Platform admin access required" };
    }
    
    const checks = await getHealthChecks(options);
    
    return {
      isSuccess: true,
      message: "Health checks fetched successfully",
      data: checks,
    };
  } catch (error: any) {
    console.error("Error fetching health checks:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch health checks",
    };
  }
}

/**
 * Get latest health checks (one per service)
 */
export async function getLatestHealthChecksAction(): Promise<ActionResult<any[]>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    
    if (!isAdmin) {
      return { isSuccess: false, message: "Platform admin access required" };
    }
    
    const checks = await getLatestHealthChecks();
    
    return {
      isSuccess: true,
      message: "Latest health checks fetched successfully",
      data: checks,
    };
  } catch (error: any) {
    console.error("Error fetching latest health checks:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch latest health checks",
    };
  }
}

/**
 * Get healing statistics for dashboard
 */
export async function getHealingStatsAction(): Promise<ActionResult<any>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    
    if (!isAdmin) {
      return { isSuccess: false, message: "Platform admin access required" };
    }
    
    const stats = await getHealingStats();
    
    return {
      isSuccess: true,
      message: "Statistics fetched successfully",
      data: stats,
    };
  } catch (error: any) {
    console.error("Error fetching healing stats:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch statistics",
    };
  }
}

/**
 * Get top healing patterns (most successful)
 */
export async function getTopHealingPatternsAction(limit: number = 10): Promise<ActionResult<any[]>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    
    if (!isAdmin) {
      return { isSuccess: false, message: "Platform admin access required" };
    }
    
    const patterns = await getTopHealingPatterns(limit);
    
    return {
      isSuccess: true,
      message: "Top healing patterns fetched successfully",
      data: patterns,
    };
  } catch (error: any) {
    console.error("Error fetching healing patterns:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch healing patterns",
    };
  }
}
