/**
 * Email Sync Database Queries
 * Operations for tracking email sync operations and logs
 */

import { db } from "@/db";
import {
  emailSyncLogsTable,
  emailAISummariesTable,
  type InsertEmailSyncLog,
  type SelectEmailSyncLog,
  type InsertEmailAISummary,
  type SelectEmailAISummary,
} from "../schema/email-schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

// ============================================================================
// Sync Logs - Create
// ============================================================================

export async function createSyncLog(data: InsertEmailSyncLog): Promise<SelectEmailSyncLog> {
  const [log] = await db.insert(emailSyncLogsTable).values(data).returning();
  return log;
}

export async function startSyncLog(
  accountId: string,
  userId: string,
  syncType: "full" | "incremental" | "webhook" | "manual"
): Promise<SelectEmailSyncLog> {
  return await createSyncLog({
    accountId,
    userId,
    syncType,
    status: "in_progress",
    startedAt: new Date(),
    emailsFetched: 0,
    emailsProcessed: 0,
    emailsSkipped: 0,
    emailsFailed: 0,
  });
}

// ============================================================================
// Sync Logs - Read
// ============================================================================

export async function getSyncLogById(id: string): Promise<SelectEmailSyncLog | undefined> {
  const [log] = await db
    .select()
    .from(emailSyncLogsTable)
    .where(eq(emailSyncLogsTable.id, id))
    .limit(1);
  return log;
}

export async function getSyncLogsByAccountId(
  accountId: string,
  limit: number = 50
): Promise<SelectEmailSyncLog[]> {
  return await db
    .select()
    .from(emailSyncLogsTable)
    .where(eq(emailSyncLogsTable.accountId, accountId))
    .orderBy(desc(emailSyncLogsTable.startedAt))
    .limit(limit);
}

export async function getRecentSyncLogs(
  userId: string,
  hours: number = 24,
  limit: number = 100
): Promise<SelectEmailSyncLog[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return await db
    .select()
    .from(emailSyncLogsTable)
    .where(
      and(
        eq(emailSyncLogsTable.userId, userId),
        gte(emailSyncLogsTable.startedAt, since)
      )
    )
    .orderBy(desc(emailSyncLogsTable.startedAt))
    .limit(limit);
}

export async function getFailedSyncLogs(
  accountId: string,
  limit: number = 20
): Promise<SelectEmailSyncLog[]> {
  return await db
    .select()
    .from(emailSyncLogsTable)
    .where(
      and(
        eq(emailSyncLogsTable.accountId, accountId),
        eq(emailSyncLogsTable.status, "failed")
      )
    )
    .orderBy(desc(emailSyncLogsTable.startedAt))
    .limit(limit);
}

export async function getLastSuccessfulSync(
  accountId: string
): Promise<SelectEmailSyncLog | undefined> {
  const [log] = await db
    .select()
    .from(emailSyncLogsTable)
    .where(
      and(
        eq(emailSyncLogsTable.accountId, accountId),
        eq(emailSyncLogsTable.status, "completed")
      )
    )
    .orderBy(desc(emailSyncLogsTable.startedAt))
    .limit(1);
  return log;
}

// ============================================================================
// Sync Logs - Update
// ============================================================================

export async function updateSyncLog(
  id: string,
  data: Partial<InsertEmailSyncLog>
): Promise<SelectEmailSyncLog | undefined> {
  const [updated] = await db
    .update(emailSyncLogsTable)
    .set(data)
    .where(eq(emailSyncLogsTable.id, id))
    .returning();
  return updated;
}

export async function completeSyncLog(
  id: string,
  stats: {
    emailsFetched: number;
    emailsProcessed: number;
    emailsSkipped: number;
    emailsFailed: number;
  }
): Promise<void> {
  const log = await getSyncLogById(id);
  if (!log) return;

  const completedAt = new Date();
  const duration = completedAt.getTime() - log.startedAt.getTime();

  await db
    .update(emailSyncLogsTable)
    .set({
      status: "completed",
      completedAt,
      duration,
      ...stats,
    })
    .where(eq(emailSyncLogsTable.id, id));
}

export async function failSyncLog(
  id: string,
  errorMessage: string,
  errorStack?: string
): Promise<void> {
  const log = await getSyncLogById(id);
  if (!log) return;

  const completedAt = new Date();
  const duration = completedAt.getTime() - log.startedAt.getTime();

  await db
    .update(emailSyncLogsTable)
    .set({
      status: "failed",
      completedAt,
      duration,
      errorMessage,
      errorStack,
    })
    .where(eq(emailSyncLogsTable.id, id));
}

export async function incrementSyncStats(
  id: string,
  field: "emailsFetched" | "emailsProcessed" | "emailsSkipped" | "emailsFailed",
  amount: number = 1
): Promise<void> {
  const log = await getSyncLogById(id);
  if (!log) return;

  const currentValue = log[field] || 0;

  await db
    .update(emailSyncLogsTable)
    .set({ [field]: currentValue + amount })
    .where(eq(emailSyncLogsTable.id, id));
}

// ============================================================================
// Sync Logs - Delete
// ============================================================================

export async function deleteSyncLog(id: string): Promise<void> {
  await db.delete(emailSyncLogsTable).where(eq(emailSyncLogsTable.id, id));
}

export async function deleteOldSyncLogs(daysToKeep: number = 30): Promise<number> {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  
  const result = await db
    .delete(emailSyncLogsTable)
    .where(lte(emailSyncLogsTable.startedAt, cutoffDate));
  
  return result.rowCount || 0;
}

// ============================================================================
// AI Summaries - Create
// ============================================================================

export async function createAISummary(
  data: InsertEmailAISummary
): Promise<SelectEmailAISummary> {
  const [summary] = await db.insert(emailAISummariesTable).values(data).returning();
  return summary;
}

// ============================================================================
// AI Summaries - Read
// ============================================================================

export async function getAISummaryById(
  id: string
): Promise<SelectEmailAISummary | undefined> {
  const [summary] = await db
    .select()
    .from(emailAISummariesTable)
    .where(eq(emailAISummariesTable.id, id))
    .limit(1);
  return summary;
}

export async function getAISummaryByEmailId(
  emailId: string
): Promise<SelectEmailAISummary | undefined> {
  const now = new Date();
  
  const [summary] = await db
    .select()
    .from(emailAISummariesTable)
    .where(
      and(
        eq(emailAISummariesTable.emailId, emailId),
        gte(emailAISummariesTable.expiresAt, now) // Not expired
      )
    )
    .orderBy(desc(emailAISummariesTable.createdAt))
    .limit(1);
  return summary;
}

export async function getAISummaryByThreadId(
  threadId: string
): Promise<SelectEmailAISummary | undefined> {
  const now = new Date();
  
  const [summary] = await db
    .select()
    .from(emailAISummariesTable)
    .where(
      and(
        eq(emailAISummariesTable.threadId, threadId),
        gte(emailAISummariesTable.expiresAt, now) // Not expired
      )
    )
    .orderBy(desc(emailAISummariesTable.createdAt))
    .limit(1);
  return summary;
}

// ============================================================================
// AI Summaries - Update
// ============================================================================

export async function updateAISummary(
  id: string,
  data: Partial<InsertEmailAISummary>
): Promise<SelectEmailAISummary | undefined> {
  const [updated] = await db
    .update(emailAISummariesTable)
    .set(data)
    .where(eq(emailAISummariesTable.id, id))
    .returning();
  return updated;
}

// ============================================================================
// AI Summaries - Delete
// ============================================================================

export async function deleteAISummary(id: string): Promise<void> {
  await db.delete(emailAISummariesTable).where(eq(emailAISummariesTable.id, id));
}

export async function deleteExpiredAISummaries(): Promise<number> {
  const now = new Date();
  
  const result = await db
    .delete(emailAISummariesTable)
    .where(lte(emailAISummariesTable.expiresAt, now));
  
  return result.rowCount || 0;
}

// ============================================================================
// Statistics
// ============================================================================

export async function getSyncStatistics(accountId: string, days: number = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const logs = await db
    .select()
    .from(emailSyncLogsTable)
    .where(
      and(
        eq(emailSyncLogsTable.accountId, accountId),
        gte(emailSyncLogsTable.startedAt, since)
      )
    );

  const totalSyncs = logs.length;
  const successfulSyncs = logs.filter((log) => log.status === "completed").length;
  const failedSyncs = logs.filter((log) => log.status === "failed").length;
  const totalEmailsFetched = logs.reduce((sum, log) => sum + (log.emailsFetched || 0), 0);
  const totalEmailsProcessed = logs.reduce((sum, log) => sum + (log.emailsProcessed || 0), 0);
  const avgDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0) / totalSyncs || 0;

  return {
    totalSyncs,
    successfulSyncs,
    failedSyncs,
    successRate: totalSyncs > 0 ? (successfulSyncs / totalSyncs) * 100 : 0,
    totalEmailsFetched,
    totalEmailsProcessed,
    avgDuration: Math.round(avgDuration),
    period: `Last ${days} days`,
  };
}

export async function getAISummaryStats(userId: string, days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const summaries = await db
    .select()
    .from(emailAISummariesTable)
    .where(
      and(
        eq(emailAISummariesTable.userId, userId),
        gte(emailAISummariesTable.createdAt, since)
      )
    );

  const totalSummaries = summaries.length;
  const emailSummaries = summaries.filter((s) => s.emailId !== null).length;
  const threadSummaries = summaries.filter((s) => s.threadId !== null).length;
  const expired = summaries.filter((s) => s.expiresAt < new Date()).length;
  const active = totalSummaries - expired;

  return {
    totalSummaries,
    emailSummaries,
    threadSummaries,
    active,
    expired,
    period: `Last ${days} days`,
  };
}

