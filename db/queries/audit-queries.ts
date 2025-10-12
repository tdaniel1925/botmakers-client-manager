import { db } from "../db";
import { auditLogsTable, SelectAuditLog, InsertAuditLog } from "../schema/audit-schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

/**
 * Get audit logs for an organization
 */
export async function getOrganizationAuditLogs(
  organizationId: string,
  limit: number = 50
): Promise<SelectAuditLog[]> {
  try {
    const logs = await db
      .select()
      .from(auditLogsTable)
      .where(eq(auditLogsTable.organizationId, organizationId))
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limit);
    
    return logs;
  } catch (error) {
    console.error("Error fetching organization audit logs:", error);
    return [];
  }
}

/**
 * Get all platform audit logs
 */
export async function getPlatformAuditLogs(limit: number = 100): Promise<SelectAuditLog[]> {
  try {
    const logs = await db
      .select()
      .from(auditLogsTable)
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limit);
    
    return logs;
  } catch (error) {
    console.error("Error fetching platform audit logs:", error);
    return [];
  }
}

/**
 * Get audit logs by user
 */
export async function getUserAuditLogs(
  userId: string,
  organizationId?: string,
  limit: number = 50
): Promise<SelectAuditLog[]> {
  try {
    const query = organizationId
      ? db
          .select()
          .from(auditLogsTable)
          .where(
            and(
              eq(auditLogsTable.userId, userId),
              eq(auditLogsTable.organizationId, organizationId)
            )
          )
      : db
          .select()
          .from(auditLogsTable)
          .where(eq(auditLogsTable.userId, userId));

    const logs = await query
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limit);
    
    return logs;
  } catch (error) {
    console.error("Error fetching user audit logs:", error);
    return [];
  }
}

/**
 * Get audit logs by entity
 */
export async function getEntityAuditLogs(
  entityType: string,
  entityId: string,
  limit: number = 50
): Promise<SelectAuditLog[]> {
  try {
    const logs = await db
      .select()
      .from(auditLogsTable)
      .where(
        and(
          eq(auditLogsTable.entityType, entityType),
          eq(auditLogsTable.entityId, entityId)
        )
      )
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limit);
    
    return logs;
  } catch (error) {
    console.error("Error fetching entity audit logs:", error);
    return [];
  }
}

/**
 * Get audit logs within a date range
 */
export async function getAuditLogsByDateRange(
  startDate: Date,
  endDate: Date,
  organizationId?: string,
  limit: number = 100
): Promise<SelectAuditLog[]> {
  try {
    const query = organizationId
      ? db
          .select()
          .from(auditLogsTable)
          .where(
            and(
              eq(auditLogsTable.organizationId, organizationId),
              gte(auditLogsTable.createdAt, startDate),
              lte(auditLogsTable.createdAt, endDate)
            )
          )
      : db
          .select()
          .from(auditLogsTable)
          .where(
            and(
              gte(auditLogsTable.createdAt, startDate),
              lte(auditLogsTable.createdAt, endDate)
            )
          );

    const logs = await query
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limit);
    
    return logs;
  } catch (error) {
    console.error("Error fetching audit logs by date range:", error);
    return [];
  }
}

/**
 * Create an audit log entry
 */
export async function logAuditEvent(data: InsertAuditLog): Promise<SelectAuditLog> {
  try {
    const result = await db
      .insert(auditLogsTable)
      .values(data)
      .returning();
    
    return result[0];
  } catch (error) {
    console.error("Error logging audit event:", error);
    throw error;
  }
}

