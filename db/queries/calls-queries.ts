import { db } from "../db";
import {
  projectWebhooksTable,
  callRecordsTable,
  callWorkflowsTable,
  workflowEmailTemplatesTable,
  workflowSmsTemplatesTable,
  workflowExecutionLogsTable,
  type SelectProjectWebhook,
  type InsertProjectWebhook,
  type SelectCallRecord,
  type InsertCallRecord,
  type SelectCallWorkflow,
  type InsertCallWorkflow,
  type SelectWorkflowEmailTemplate,
  type InsertWorkflowEmailTemplate,
  type SelectWorkflowSmsTemplate,
  type InsertWorkflowSmsTemplate,
  type InsertWorkflowExecutionLog,
} from "../schema";
import { eq, and, desc, sql } from "drizzle-orm";

// ===== WEBHOOK QUERIES =====

export async function getWebhookByToken(token: string): Promise<SelectProjectWebhook | null> {
  const results = await db
    .select()
    .from(projectWebhooksTable)
    .where(eq(projectWebhooksTable.webhookToken, token))
    .limit(1);
  
  return results[0] || null;
}

export async function getProjectWebhooks(projectId: string): Promise<SelectProjectWebhook[]> {
  return await db
    .select()
    .from(projectWebhooksTable)
    .where(eq(projectWebhooksTable.projectId, projectId))
    .orderBy(desc(projectWebhooksTable.createdAt));
}

export async function createWebhook(data: InsertProjectWebhook): Promise<SelectProjectWebhook> {
  const results = await db
    .insert(projectWebhooksTable)
    .values(data)
    .returning();
  
  return results[0];
}

export async function updateWebhook(
  id: string,
  data: Partial<InsertProjectWebhook>
): Promise<SelectProjectWebhook | null> {
  const results = await db
    .update(projectWebhooksTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projectWebhooksTable.id, id))
    .returning();
  
  return results[0] || null;
}

export async function updateWebhookStats(id: string): Promise<void> {
  await db
    .update(projectWebhooksTable)
    .set({
      totalCallsReceived: sql`${projectWebhooksTable.totalCallsReceived} + 1`,
      lastCallReceivedAt: new Date(),
    })
    .where(eq(projectWebhooksTable.id, id));
}

export async function deleteWebhook(id: string): Promise<void> {
  await db
    .delete(projectWebhooksTable)
    .where(eq(projectWebhooksTable.id, id));
}

// ===== CALL RECORD QUERIES =====

export async function getCallRecordById(id: string): Promise<SelectCallRecord | null> {
  const results = await db
    .select()
    .from(callRecordsTable)
    .where(eq(callRecordsTable.id, id))
    .limit(1);
  
  return results[0] || null;
}

export async function getCallsForProject(projectId: string): Promise<SelectCallRecord[]> {
  return await db
    .select()
    .from(callRecordsTable)
    .where(eq(callRecordsTable.projectId, projectId))
    .orderBy(desc(callRecordsTable.callTimestamp));
}

export async function getCallsForWebhook(webhookId: string): Promise<SelectCallRecord[]> {
  return await db
    .select()
    .from(callRecordsTable)
    .where(eq(callRecordsTable.webhookId, webhookId))
    .orderBy(desc(callRecordsTable.callTimestamp));
}

export async function getCallsNeedingFollowUp(projectId: string): Promise<SelectCallRecord[]> {
  return await db
    .select()
    .from(callRecordsTable)
    .where(
      and(
        eq(callRecordsTable.projectId, projectId),
        eq(callRecordsTable.followUpNeeded, true)
      )
    )
    .orderBy(desc(callRecordsTable.callTimestamp));
}

export async function createCallRecord(data: InsertCallRecord): Promise<SelectCallRecord> {
  const results = await db
    .insert(callRecordsTable)
    .values(data)
    .returning();
  
  return results[0];
}

export async function updateCallRecord(
  id: string,
  data: Partial<InsertCallRecord>
): Promise<SelectCallRecord | null> {
  const results = await db
    .update(callRecordsTable)
    .set(data)
    .where(eq(callRecordsTable.id, id))
    .returning();
  
  return results[0] || null;
}

export async function updateCallAnalysisStatus(
  id: string,
  status: string
): Promise<void> {
  await db
    .update(callRecordsTable)
    .set({ aiAnalysisStatus: status })
    .where(eq(callRecordsTable.id, id));
}

export async function updateCallAnalysis(
  id: string,
  data: {
    aiAnalysisStatus: string;
    aiAnalysisCompletedAt: Date;
    callTopic: string;
    callSummary: string;
    questionsAsked: string[];
    callSentiment: string;
    callQualityRating: number;
    followUpNeeded: boolean;
    followUpReason?: string | null;
    followUpUrgency?: string | null;
    aiInsights?: any;
  }
): Promise<void> {
  await db
    .update(callRecordsTable)
    .set({
      ...data,
      processedAt: new Date(),
    })
    .where(eq(callRecordsTable.id, id));
}

export async function getPendingAnalysisCalls(limit: number = 10): Promise<SelectCallRecord[]> {
  return await db
    .select()
    .from(callRecordsTable)
    .where(eq(callRecordsTable.aiAnalysisStatus, "pending"))
    .orderBy(callRecordsTable.receivedAt)
    .limit(limit);
}

// ===== WORKFLOW QUERIES =====

export async function getWorkflowById(id: string): Promise<SelectCallWorkflow | null> {
  const results = await db
    .select()
    .from(callWorkflowsTable)
    .where(eq(callWorkflowsTable.id, id))
    .limit(1);
  
  return results[0] || null;
}

export async function getActiveWorkflowsForProject(projectId: string): Promise<SelectCallWorkflow[]> {
  return await db
    .select()
    .from(callWorkflowsTable)
    .where(
      and(
        eq(callWorkflowsTable.projectId, projectId),
        eq(callWorkflowsTable.isActive, true)
      )
    )
    .orderBy(desc(callWorkflowsTable.createdAt));
}

export async function getAllWorkflowsForProject(projectId: string): Promise<SelectCallWorkflow[]> {
  return await db
    .select()
    .from(callWorkflowsTable)
    .where(eq(callWorkflowsTable.projectId, projectId))
    .orderBy(desc(callWorkflowsTable.createdAt));
}

export async function createWorkflow(data: InsertCallWorkflow): Promise<SelectCallWorkflow> {
  const results = await db
    .insert(callWorkflowsTable)
    .values(data)
    .returning();
  
  return results[0];
}

export async function updateWorkflow(
  id: string,
  data: Partial<InsertCallWorkflow>
): Promise<SelectCallWorkflow | null> {
  const results = await db
    .update(callWorkflowsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(callWorkflowsTable.id, id))
    .returning();
  
  return results[0] || null;
}

export async function incrementWorkflowExecutions(id: string): Promise<void> {
  await db
    .update(callWorkflowsTable)
    .set({
      totalExecutions: sql`${callWorkflowsTable.totalExecutions} + 1`,
      lastExecutedAt: new Date(),
    })
    .where(eq(callWorkflowsTable.id, id));
}

export async function deleteWorkflow(id: string): Promise<void> {
  await db
    .delete(callWorkflowsTable)
    .where(eq(callWorkflowsTable.id, id));
}

// ===== EMAIL TEMPLATE QUERIES =====

export async function getEmailTemplate(id: string): Promise<SelectWorkflowEmailTemplate | null> {
  const results = await db
    .select()
    .from(workflowEmailTemplatesTable)
    .where(eq(workflowEmailTemplatesTable.id, id))
    .limit(1);
  
  return results[0] || null;
}

export async function getEmailTemplatesForProject(projectId: string): Promise<SelectWorkflowEmailTemplate[]> {
  return await db
    .select()
    .from(workflowEmailTemplatesTable)
    .where(eq(workflowEmailTemplatesTable.projectId, projectId))
    .orderBy(desc(workflowEmailTemplatesTable.createdAt));
}

export async function createEmailTemplate(data: InsertWorkflowEmailTemplate): Promise<SelectWorkflowEmailTemplate> {
  const results = await db
    .insert(workflowEmailTemplatesTable)
    .values(data)
    .returning();
  
  return results[0];
}

export async function updateEmailTemplate(
  id: string,
  data: Partial<InsertWorkflowEmailTemplate>
): Promise<SelectWorkflowEmailTemplate | null> {
  const results = await db
    .update(workflowEmailTemplatesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(workflowEmailTemplatesTable.id, id))
    .returning();
  
  return results[0] || null;
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  await db
    .delete(workflowEmailTemplatesTable)
    .where(eq(workflowEmailTemplatesTable.id, id));
}

// ===== SMS TEMPLATE QUERIES =====

export async function getSmsTemplate(id: string): Promise<SelectWorkflowSmsTemplate | null> {
  const results = await db
    .select()
    .from(workflowSmsTemplatesTable)
    .where(eq(workflowSmsTemplatesTable.id, id))
    .limit(1);
  
  return results[0] || null;
}

export async function getSmsTemplatesForProject(projectId: string): Promise<SelectWorkflowSmsTemplate[]> {
  return await db
    .select()
    .from(workflowSmsTemplatesTable)
    .where(eq(workflowSmsTemplatesTable.projectId, projectId))
    .orderBy(desc(workflowSmsTemplatesTable.createdAt));
}

export async function createSmsTemplate(data: InsertWorkflowSmsTemplate): Promise<SelectWorkflowSmsTemplate> {
  const results = await db
    .insert(workflowSmsTemplatesTable)
    .values(data)
    .returning();
  
  return results[0];
}

export async function updateSmsTemplate(
  id: string,
  data: Partial<InsertWorkflowSmsTemplate>
): Promise<SelectWorkflowSmsTemplate | null> {
  const results = await db
    .update(workflowSmsTemplatesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(workflowSmsTemplatesTable.id, id))
    .returning();
  
  return results[0] || null;
}

export async function deleteSmsTemplate(id: string): Promise<void> {
  await db
    .delete(workflowSmsTemplatesTable)
    .where(eq(workflowSmsTemplatesTable.id, id));
}

// ===== WORKFLOW EXECUTION LOG QUERIES =====

export async function createWorkflowExecutionLog(data: InsertWorkflowExecutionLog): Promise<void> {
  await db
    .insert(workflowExecutionLogsTable)
    .values(data);
}

export async function getWorkflowExecutionLogs(workflowId: string, limit: number = 50) {
  return await db
    .select()
    .from(workflowExecutionLogsTable)
    .where(eq(workflowExecutionLogsTable.workflowId, workflowId))
    .orderBy(desc(workflowExecutionLogsTable.executedAt))
    .limit(limit);
}

export async function getCallExecutionLogs(callRecordId: string) {
  return await db
    .select()
    .from(workflowExecutionLogsTable)
    .where(eq(workflowExecutionLogsTable.callRecordId, callRecordId))
    .orderBy(desc(workflowExecutionLogsTable.executedAt));
}

// ===== ANALYTICS QUERIES =====

export async function getCallStats(projectId: string) {
  const calls = await getCallsForProject(projectId);
  
  const total = calls.length;
  const avgDuration = calls.reduce((sum, call) => sum + (call.callDurationSeconds || 0), 0) / total || 0;
  const avgRating = calls.reduce((sum, call) => sum + (call.callQualityRating || 0), 0) / total || 0;
  const followUpCount = calls.filter(c => c.followUpNeeded).length;
  
  const sentimentDistribution = {
    positive: calls.filter(c => c.callSentiment === 'positive').length,
    neutral: calls.filter(c => c.callSentiment === 'neutral').length,
    negative: calls.filter(c => c.callSentiment === 'negative').length,
  };
  
  return {
    total,
    avgDuration: Math.round(avgDuration / 60), // Convert to minutes
    avgRating: Number(avgRating.toFixed(1)),
    followUpCount,
    sentimentDistribution,
  };
}
