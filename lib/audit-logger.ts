import { db } from "@/db/db";
import { auditLogsTable } from "@/db/schema/audit-schema";
import { auth } from "@clerk/nextjs/server";

interface AuditLogData {
  organizationId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function logAudit(data: AuditLogData) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.warn("Cannot log audit: No user ID");
      return null;
    }

    const auditLog = await db.insert(auditLogsTable).values({
      organizationId: data.organizationId || null,
      userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId || null,
      changes: data.changes || null,  // jsonb field accepts objects directly
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
    }).returning();

    return auditLog[0];
  } catch (error) {
    console.error("Error logging audit:", error);
    return null;
  }
}

/**
 * Helper to log organization changes
 */
export async function logOrganizationChange(
  action: "create" | "update" | "suspend" | "activate" | "delete",
  organizationId: string,
  changes?: any
) {
  return await logAudit({
    organizationId,
    action,
    entityType: "organization",
    entityId: organizationId,
    changes,
  });
}

/**
 * Helper to log user changes within an organization
 */
export async function logUserChange(
  action: "create" | "update" | "delete" | "role_change",
  organizationId: string,
  targetUserId: string,
  changes?: any
) {
  return await logAudit({
    organizationId,
    action,
    entityType: "user",
    entityId: targetUserId,
    changes,
  });
}

/**
 * Helper to log platform-level actions
 */
export async function logPlatformAction(
  action: string,
  entityType: string,
  entityId?: string,
  changes?: any
) {
  return await logAudit({
    action,
    entityType,
    entityId,
    changes,
  });
}

