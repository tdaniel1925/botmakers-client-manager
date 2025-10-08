/**
 * Impersonation Queries
 * Database operations for impersonation sessions
 */

import { db } from "@/db/db";
import { impersonationSessionsTable } from "@/db/schema/impersonation-schema";
import type { InsertImpersonationSession, SelectImpersonationSession } from "@/db/schema/impersonation-schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Create a new impersonation session
 */
export async function createImpersonationSession(
  data: InsertImpersonationSession
): Promise<SelectImpersonationSession> {
  const [session] = await db
    .insert(impersonationSessionsTable)
    .values(data)
    .returning();
  
  return session;
}

/**
 * End an impersonation session
 */
export async function endImpersonationSession(sessionId: string): Promise<void> {
  await db
    .update(impersonationSessionsTable)
    .set({
      endedAt: new Date(),
      isActive: false,
    })
    .where(eq(impersonationSessionsTable.id, sessionId));
}

/**
 * Get active impersonation session for admin
 */
export async function getActiveImpersonationSession(
  adminUserId: string
): Promise<SelectImpersonationSession | null> {
  const [session] = await db
    .select()
    .from(impersonationSessionsTable)
    .where(
      and(
        eq(impersonationSessionsTable.adminUserId, adminUserId),
        eq(impersonationSessionsTable.isActive, true)
      )
    )
    .orderBy(desc(impersonationSessionsTable.startedAt))
    .limit(1);
  
  return session || null;
}

/**
 * Get all impersonation sessions for an organization
 */
export async function getImpersonationSessionsByOrganization(
  organizationId: string
): Promise<SelectImpersonationSession[]> {
  return await db
    .select()
    .from(impersonationSessionsTable)
    .where(eq(impersonationSessionsTable.organizationId, organizationId))
    .orderBy(desc(impersonationSessionsTable.startedAt));
}

/**
 * Get all impersonation sessions by admin
 */
export async function getImpersonationSessionsByAdmin(
  adminUserId: string
): Promise<SelectImpersonationSession[]> {
  return await db
    .select()
    .from(impersonationSessionsTable)
    .where(eq(impersonationSessionsTable.adminUserId, adminUserId))
    .orderBy(desc(impersonationSessionsTable.startedAt));
}

/**
 * Log an action during impersonation
 */
export async function logImpersonationAction(
  sessionId: string,
  action: string
): Promise<void> {
  const [session] = await db
    .select()
    .from(impersonationSessionsTable)
    .where(eq(impersonationSessionsTable.id, sessionId))
    .limit(1);
  
  if (!session) return;
  
  const currentActions = session.actionsLog || [];
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${action}`;
  
  await db
    .update(impersonationSessionsTable)
    .set({
      actionsLog: [...currentActions, logEntry],
    })
    .where(eq(impersonationSessionsTable.id, sessionId));
}
