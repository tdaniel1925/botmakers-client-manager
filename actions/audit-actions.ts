"use server";

import { auth } from "@clerk/nextjs/server";
import { 
  getOrganizationAuditLogs,
  getPlatformAuditLogs,
  getUserAuditLogs,
} from "@/db/queries/audit-queries";
import { isPlatformAdmin } from "@/db/queries/platform-queries";
import { ActionResult } from "@/types";

/**
 * Get audit logs for an organization (platform admin only)
 */
export async function getOrganizationAuditLogsAction(
  organizationId: string,
  limit: number = 50
): Promise<ActionResult<any[]>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return {
        isSuccess: false,
        message: "Platform admin access required",
      };
    }

    const logs = await getOrganizationAuditLogs(organizationId, limit);

    return {
      isSuccess: true,
      message: "Audit logs fetched successfully",
      data: logs,
    };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch audit logs",
    };
  }
}

/**
 * Get all platform audit logs (platform admin only)
 */
export async function getPlatformAuditLogsAction(
  limit: number = 100
): Promise<ActionResult<any[]>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return {
        isSuccess: false,
        message: "Platform admin access required",
      };
    }

    const logs = await getPlatformAuditLogs(limit);

    return {
      isSuccess: true,
      message: "Platform audit logs fetched successfully",
      data: logs,
    };
  } catch (error) {
    console.error("Error fetching platform audit logs:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch platform audit logs",
    };
  }
}

