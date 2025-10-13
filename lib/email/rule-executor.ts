/**
 * Rule Executor
 * Main orchestration for email rule execution
 */

import { db } from '@/db/db';
import { emailsTable, emailRulesTable } from '@/db/schema/email-schema';
import { eq, and } from 'drizzle-orm';
import { evaluateConditionGroup, type ConditionGroup } from './rule-conditions';
import { executeActions, type RuleAction } from './rule-actions';
import type { SelectEmail, SelectEmailRule } from '@/db/schema/email-schema';

/**
 * Execute all enabled rules for a specific email
 */
export async function executeRulesForEmail(emailId: string): Promise<{
  executedRules: number;
  matchedRules: number;
  actionsExecuted: number;
}> {
  try {
    // Get the email
    const email = await db.query.emailsTable.findFirst({
      where: eq(emailsTable.id, emailId),
    });

    if (!email) {
      console.error(`Email not found: ${emailId}`);
      return { executedRules: 0, matchedRules: 0, actionsExecuted: 0 };
    }

    // Get all enabled rules for this account, ordered by priority
    const rules = await db.query.emailRulesTable.findMany({
      where: and(
        eq(emailRulesTable.accountId, email.accountId),
        eq(emailRulesTable.enabled, true)
      ),
      orderBy: (rules, { asc }) => [asc(rules.priority)],
    });

    if (rules.length === 0) {
      return { executedRules: 0, matchedRules: 0, actionsExecuted: 0 };
    }

    let matchedRules = 0;
    let actionsExecuted = 0;

    // Execute each rule
    for (const rule of rules) {
      const matched = await executeRule(email, rule);
      if (matched.matched) {
        matchedRules++;
        actionsExecuted += matched.actionsExecuted;
      }
    }

    return {
      executedRules: rules.length,
      matchedRules,
      actionsExecuted,
    };
  } catch (error) {
    console.error('Error executing rules for email:', error);
    return { executedRules: 0, matchedRules: 0, actionsExecuted: 0 };
  }
}

/**
 * Execute a single rule against an email
 */
export async function executeRule(email: SelectEmail, rule: SelectEmailRule): Promise<{
  matched: boolean;
  actionsExecuted: number;
}> {
  try {
    // Evaluate conditions
    const conditionGroup = rule.conditions as ConditionGroup;
    const matched = evaluateConditionGroup(email, conditionGroup);

    if (!matched) {
      return { matched: false, actionsExecuted: 0 };
    }

    console.log(`✅ Rule "${rule.name}" matched for email ${email.id}`);

    // Execute actions
    const actions = rule.actions as RuleAction[];
    const result = await executeActions(email.id, actions);

    // Update rule statistics
    await db
      .update(emailRulesTable)
      .set({
        matchCount: (rule.matchCount || 0) + 1,
        lastTriggeredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(emailRulesTable.id, rule.id));

    return {
      matched: true,
      actionsExecuted: result.successful,
    };
  } catch (error) {
    console.error(`Error executing rule ${rule.id}:`, error);
    return { matched: false, actionsExecuted: 0 };
  }
}

/**
 * Test if a rule would match an email (without executing actions)
 */
export async function testRule(ruleId: string, emailId: string): Promise<{
  matched: boolean;
  error?: string;
}> {
  try {
    const email = await db.query.emailsTable.findFirst({
      where: eq(emailsTable.id, emailId),
    });

    if (!email) {
      return { matched: false, error: 'Email not found' };
    }

    const rule = await db.query.emailRulesTable.findFirst({
      where: eq(emailRulesTable.id, ruleId),
    });

    if (!rule) {
      return { matched: false, error: 'Rule not found' };
    }

    const conditionGroup = rule.conditions as ConditionGroup;
    const matched = evaluateConditionGroup(email, conditionGroup);

    return { matched };
  } catch (error: any) {
    console.error('Error testing rule:', error);
    return { matched: false, error: error.message };
  }
}



