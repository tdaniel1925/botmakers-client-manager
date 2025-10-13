/**
 * Self-Healing System Database Queries
 * CRUD operations for healing events, health checks, and learned patterns
 */

import { db } from "../db";
import {
  healingEventsTable,
  systemHealthChecksTable,
  healingPatternsTable,
  InsertHealingEvent,
  InsertHealthCheck,
  InsertHealingPattern,
  SelectHealingEvent,
  SelectHealthCheck,
  SelectHealingPattern,
} from "../schema/healing-schema";
import { eq, desc, and, gte, lte, sql, or } from "drizzle-orm";

// ============================================================================
// HEALING EVENTS
// ============================================================================

/**
 * Create a new healing event
 */
export async function createHealingEvent(data: Partial<InsertHealingEvent>): Promise<SelectHealingEvent> {
  const [event] = await db
    .insert(healingEventsTable)
    .values({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
    } as InsertHealingEvent)
    .returning();
  
  return event;
}

/**
 * Get healing events with filtering and pagination
 */
export async function getHealingEvents(options: {
  limit?: number;
  offset?: number;
  category?: string;
  severity?: string;
  result?: string;
  source?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<SelectHealingEvent[]> {
  const { limit = 50, offset = 0, category, severity, result, source, startDate, endDate } = options;
  
  let query = db.select().from(healingEventsTable);
  
  const conditions = [];
  
  if (category) conditions.push(eq(healingEventsTable.errorCategory, category));
  if (severity) conditions.push(eq(healingEventsTable.severity, severity));
  if (result) conditions.push(eq(healingEventsTable.healingResult, result));
  if (source) conditions.push(eq(healingEventsTable.errorSource, source));
  if (startDate) conditions.push(gte(healingEventsTable.createdAt, startDate));
  if (endDate) conditions.push(lte(healingEventsTable.createdAt, endDate));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  const events = await query
    .orderBy(desc(healingEventsTable.createdAt))
    .limit(limit)
    .offset(offset);
  
  return events;
}

/**
 * Get healing event by ID
 */
export async function getHealingEventById(id: string): Promise<SelectHealingEvent | null> {
  const [event] = await db
    .select()
    .from(healingEventsTable)
    .where(eq(healingEventsTable.id, id))
    .limit(1);
  
  return event || null;
}

/**
 * Get recent healing events (last N minutes)
 */
export async function getRecentHealingEvents(minutesAgo: number): Promise<SelectHealingEvent[]> {
  const startTime = new Date(Date.now() - minutesAgo * 60 * 1000);
  
  return await db
    .select()
    .from(healingEventsTable)
    .where(gte(healingEventsTable.createdAt, startTime))
    .orderBy(desc(healingEventsTable.createdAt));
}

/**
 * Get healing statistics
 */
export async function getHealingStats(): Promise<{
  total_events: number;
  healed_today: number;
  healing_success_rate: number;
  active_issues: number;
  avg_healing_time_ms: number;
  uptime_percentage: number;
  overall_health: string;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Total events
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(healingEventsTable);
  
  // Healed today
  const [healedTodayResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(healingEventsTable)
    .where(and(
      gte(healingEventsTable.createdAt, today),
      eq(healingEventsTable.healingResult, 'success')
    ));
  
  // Success rate
  const [successRateResult] = await db
    .select({
      total: sql<number>`count(*)::int`,
      successful: sql<number>`count(*) FILTER (WHERE healing_result = 'success')::int`,
    })
    .from(healingEventsTable);
  
  const successRate = successRateResult.total > 0
    ? (successRateResult.successful / successRateResult.total) * 100
    : 100;
  
  // Active issues (unresolved critical/high severity)
  const [activeIssuesResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(healingEventsTable)
    .where(and(
      or(
        eq(healingEventsTable.severity, 'critical'),
        eq(healingEventsTable.severity, 'high')
      ),
      eq(healingEventsTable.healingResult, 'failed')
    ));
  
  // Average healing time
  const [avgTimeResult] = await db
    .select({ avg: sql<number>`avg(healing_duration_ms)::int` })
    .from(healingEventsTable)
    .where(eq(healingEventsTable.healingResult, 'success'));
  
  // Overall health based on recent error rate and success rate
  let overall_health = 'healthy';
  if (successRate < 80 || activeIssuesResult.count > 5) {
    overall_health = 'unhealthy';
  } else if (successRate < 90 || activeIssuesResult.count > 2) {
    overall_health = 'degraded';
  }
  
  return {
    total_events: totalResult.count,
    healed_today: healedTodayResult.count,
    healing_success_rate: Math.round(successRate),
    active_issues: activeIssuesResult.count,
    avg_healing_time_ms: avgTimeResult.avg || 0,
    uptime_percentage: Math.round(successRate),
    overall_health,
  };
}

// ============================================================================
// HEALTH CHECKS
// ============================================================================

/**
 * Create a new health check record
 */
export async function createHealthCheck(data: Partial<InsertHealthCheck>): Promise<SelectHealthCheck> {
  const [check] = await db
    .insert(systemHealthChecksTable)
    .values({
      id: crypto.randomUUID(),
      ...data,
      checkedAt: new Date(),
    } as InsertHealthCheck)
    .returning();
  
  return check;
}

/**
 * Get health checks with filtering
 */
export async function getHealthChecks(options: {
  limit?: number;
  offset?: number;
  status?: string;
  checkType?: string;
}): Promise<SelectHealthCheck[]> {
  const { limit = 20, offset = 0, status, checkType } = options;
  
  let query = db.select().from(systemHealthChecksTable);
  
  const conditions = [];
  
  if (status) conditions.push(eq(systemHealthChecksTable.status, status));
  if (checkType) conditions.push(eq(systemHealthChecksTable.checkType, checkType));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  const checks = await query
    .orderBy(desc(systemHealthChecksTable.checkedAt))
    .limit(limit)
    .offset(offset);
  
  return checks;
}

/**
 * Get latest health check for each check type
 */
export async function getLatestHealthChecks(): Promise<SelectHealthCheck[]> {
  const checks = await db
    .select()
    .from(systemHealthChecksTable)
    .orderBy(desc(systemHealthChecksTable.checkedAt))
    .limit(100);
  
  // Group by check_name and get latest for each
  const latestByName = new Map<string, SelectHealthCheck>();
  
  for (const check of checks) {
    if (!latestByName.has(check.checkName)) {
      latestByName.set(check.checkName, check);
    }
  }
  
  return Array.from(latestByName.values());
}

// ============================================================================
// HEALING PATTERNS
// ============================================================================

/**
 * Get healing pattern by error signature
 */
export async function getHealingPattern(errorSignature: string): Promise<SelectHealingPattern | null> {
  const [pattern] = await db
    .select()
    .from(healingPatternsTable)
    .where(eq(healingPatternsTable.errorSignature, errorSignature))
    .limit(1);
  
  return pattern || null;
}

/**
 * Create or update healing pattern
 */
export async function upsertHealingPattern(
  errorSignature: string,
  errorPattern: string,
  strategy: string,
  success: boolean
): Promise<SelectHealingPattern> {
  const existing = await getHealingPattern(errorSignature);
  
  if (existing) {
    // Update existing pattern
    const newSuccessCount = success ? (existing.successCount || 0) + 1 : (existing.successCount || 0);
    const newFailureCount = success ? (existing.failureCount || 0) : (existing.failureCount || 0) + 1;
    const totalAttempts = newSuccessCount + newFailureCount;
    const newSuccessRate = (newSuccessCount / totalAttempts) * 100;
    
    const [updated] = await db
      .update(healingPatternsTable)
      .set({
        successCount: newSuccessCount,
        failureCount: newFailureCount,
        successRate: newSuccessRate.toFixed(2),
        lastUsedAt: new Date(),
      })
      .where(eq(healingPatternsTable.id, existing.id))
      .returning();
    
    return updated;
  } else {
    // Create new pattern
    const [created] = await db
      .insert(healingPatternsTable)
      .values({
        id: crypto.randomUUID(),
        errorSignature,
        errorPattern,
        successfulHealingStrategy: strategy,
        successCount: success ? 1 : 0,
        failureCount: success ? 0 : 1,
        successRate: success ? '100.00' : '0.00',
        lastUsedAt: new Date(),
        createdAt: new Date(),
      })
      .returning();
    
    return created;
  }
}

/**
 * Get top healing patterns by success rate
 */
export async function getTopHealingPatterns(limit: number = 10): Promise<SelectHealingPattern[]> {
  return await db
    .select()
    .from(healingPatternsTable)
    .orderBy(desc(healingPatternsTable.successRate))
    .limit(limit);
}
