/**
 * Onboarding Database Queries
 * CRUD operations for onboarding sessions, templates, and responses
 */

import { db } from '../db';
import {
  clientOnboardingSessionsTable,
  onboardingTemplatesTable,
  onboardingResponsesTable,
  type NewClientOnboardingSession,
  type ClientOnboardingSession,
  type OnboardingTemplate,
  type NewOnboardingResponse,
} from '../schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';

// ============================================================================
// Onboarding Sessions
// ============================================================================

/**
 * Create a new onboarding session
 */
export async function createOnboardingSession(data: NewClientOnboardingSession) {
  const [session] = await db
    .insert(clientOnboardingSessionsTable)
    .values(data)
    .returning();
  return session;
}

/**
 * Get onboarding session by access token (for public access)
 */
export async function getOnboardingSessionByToken(token: string) {
  const sessions = await db
    .select()
    .from(clientOnboardingSessionsTable)
    .where(eq(clientOnboardingSessionsTable.accessToken, token))
    .limit(1);

  return sessions[0] || null;
}

/**
 * Get onboarding session by ID
 */
export async function getOnboardingSessionById(id: string) {
  const sessions = await db
    .select()
    .from(clientOnboardingSessionsTable)
    .where(eq(clientOnboardingSessionsTable.id, id))
    .limit(1);

  return sessions[0] || null;
}

/**
 * Get onboarding session by project ID
 */
export async function getOnboardingSessionByProjectId(projectId: string) {
  const sessions = await db
    .select()
    .from(clientOnboardingSessionsTable)
    .where(eq(clientOnboardingSessionsTable.projectId, projectId))
    .orderBy(desc(clientOnboardingSessionsTable.createdAt))
    .limit(1);

  return sessions[0] || null;
}

/**
 * Update onboarding session
 */
export async function updateOnboardingSession(
  id: string,
  data: Partial<ClientOnboardingSession>
) {
  const [updated] = await db
    .update(clientOnboardingSessionsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(clientOnboardingSessionsTable.id, id))
    .returning();

  return updated;
}

/**
 * Update session progress
 */
export async function updateSessionProgress(
  id: string,
  currentStep: number,
  completionPercentage: number
) {
  const [updated] = await db
    .update(clientOnboardingSessionsTable)
    .set({
      currentStep,
      completionPercentage,
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(clientOnboardingSessionsTable.id, id))
    .returning();

  return updated;
}

/**
 * Update session responses
 */
export async function updateSessionResponses(id: string, responses: Record<string, any>) {
  const [updated] = await db
    .update(clientOnboardingSessionsTable)
    .set({
      responses: responses as any, // JSONB
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(clientOnboardingSessionsTable.id, id))
    .returning();

  return updated;
}

/**
 * Mark session as started
 */
export async function markSessionStarted(id: string) {
  const [updated] = await db
    .update(clientOnboardingSessionsTable)
    .set({
      status: 'in_progress',
      startedAt: new Date(),
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(clientOnboardingSessionsTable.id, id))
    .returning();

  return updated;
}

/**
 * Mark session as completed
 */
export async function markSessionCompleted(id: string) {
  const [updated] = await db
    .update(clientOnboardingSessionsTable)
    .set({
      status: 'completed',
      completedAt: new Date(),
      completionPercentage: 100,
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(clientOnboardingSessionsTable.id, id))
    .returning();

  return updated;
}

/**
 * Get all sessions for an organization
 */
export async function getSessionsByOrganization(organizationId: string) {
  const sessions = await db
    .select()
    .from(clientOnboardingSessionsTable)
    .where(eq(clientOnboardingSessionsTable.organizationId, organizationId))
    .orderBy(desc(clientOnboardingSessionsTable.createdAt));

  return sessions;
}

/**
 * Get all sessions (for platform admin)
 */
export async function getAllSessions() {
  const sessions = await db
    .select()
    .from(clientOnboardingSessionsTable)
    .orderBy(desc(clientOnboardingSessionsTable.createdAt));

  return sessions;
}

/**
 * Get sessions by status
 */
export async function getSessionsByStatus(
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned'
) {
  const sessions = await db
    .select()
    .from(clientOnboardingSessionsTable)
    .where(eq(clientOnboardingSessionsTable.status, status))
    .orderBy(desc(clientOnboardingSessionsTable.createdAt));

  return sessions;
}

/**
 * Delete onboarding session
 */
export async function deleteOnboardingSession(id: string) {
  await db
    .delete(clientOnboardingSessionsTable)
    .where(eq(clientOnboardingSessionsTable.id, id));
}

/**
 * Regenerate access token for a session
 */
export async function regenerateSessionToken(id: string) {
  const newToken = crypto.randomUUID();

  const [updated] = await db
    .update(clientOnboardingSessionsTable)
    .set({
      accessToken: newToken,
      updatedAt: new Date(),
    })
    .where(eq(clientOnboardingSessionsTable.id, id))
    .returning();

  return updated;
}

// ============================================================================
// Onboarding Templates
// ============================================================================

/**
 * Get all active templates
 */
export async function getActiveTemplates() {
  const templates = await db
    .select()
    .from(onboardingTemplatesTable)
    .where(eq(onboardingTemplatesTable.isActive, true))
    .orderBy(onboardingTemplatesTable.name);

  return templates;
}

/**
 * Get template by ID
 */
export async function getTemplateById(id: string) {
  const templates = await db
    .select()
    .from(onboardingTemplatesTable)
    .where(eq(onboardingTemplatesTable.id, id))
    .limit(1);

  return templates[0] || null;
}

/**
 * Get template by project type
 */
export async function getTemplateByProjectType(
  projectType: 'web_design' | 'voice_ai' | 'software_dev' | 'marketing' | 'custom' | 'other'
) {
  const templates = await db
    .select()
    .from(onboardingTemplatesTable)
    .where(
      and(
        eq(onboardingTemplatesTable.projectType, projectType),
        eq(onboardingTemplatesTable.isActive, true)
      )
    )
    .limit(1);

  return templates[0] || null;
}

/**
 * Create template
 */
export async function createTemplate(data: any) {
  const [template] = await db
    .insert(onboardingTemplatesTable)
    .values(data)
    .returning();

  return template;
}

/**
 * Update template
 */
export async function updateTemplate(id: string, data: Partial<OnboardingTemplate>) {
  const [updated] = await db
    .update(onboardingTemplatesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(onboardingTemplatesTable.id, id))
    .returning();

  return updated;
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsage(id: string) {
  await db
    .update(onboardingTemplatesTable)
    .set({
      usageCount: sql`${onboardingTemplatesTable.usageCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(onboardingTemplatesTable.id, id));
}

/**
 * Delete template
 */
export async function deleteTemplate(id: string) {
  await db
    .delete(onboardingTemplatesTable)
    .where(eq(onboardingTemplatesTable.id, id));
}

// ============================================================================
// Onboarding Responses (Analytics)
// ============================================================================

/**
 * Save a step response (for analytics)
 */
export async function saveStepResponse(data: NewOnboardingResponse) {
  const [response] = await db
    .insert(onboardingResponsesTable)
    .values(data)
    .returning();

  return response;
}

/**
 * Get all responses for a session
 */
export async function getSessionResponses(sessionId: string) {
  const responses = await db
    .select()
    .from(onboardingResponsesTable)
    .where(eq(onboardingResponsesTable.sessionId, sessionId))
    .orderBy(onboardingResponsesTable.stepIndex);

  return responses;
}

/**
 * Get average completion time by template
 */
export async function getAverageCompletionTimeByTemplate(templateId: string) {
  const result = await db
    .select({
      avgTime: sql<number>`EXTRACT(EPOCH FROM AVG(${clientOnboardingSessionsTable.completedAt} - ${clientOnboardingSessionsTable.startedAt})) / 60`,
    })
    .from(clientOnboardingSessionsTable)
    .where(
      and(
        eq(clientOnboardingSessionsTable.templateId, templateId),
        eq(clientOnboardingSessionsTable.status, 'completed')
      )
    );

  return result[0]?.avgTime || 0;
}

/**
 * Get completion rate statistics
 */
export async function getCompletionRateStats() {
  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(clientOnboardingSessionsTable);

  const completed = await db
    .select({ count: sql<number>`count(*)` })
    .from(clientOnboardingSessionsTable)
    .where(eq(clientOnboardingSessionsTable.status, 'completed'));

  const totalCount = Number(total[0]?.count || 0);
  const completedCount = Number(completed[0]?.count || 0);

  return {
    total: totalCount,
    completed: completedCount,
    rate: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
  };
}
