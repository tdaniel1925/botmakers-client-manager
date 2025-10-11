/**
 * Email Rules Actions
 * Server actions for managing email rules/filters
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { emailRulesTable, emailAccountsTable } from '@/db/schema/email-schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { executeRulesForEmail, testRule } from '@/lib/email/rule-executor';
import type { InsertEmailRule, SelectEmailRule } from '@/db/schema/email-schema';

/**
 * Get all rules for an account
 */
export async function getRulesAction(accountId: string): Promise<{
  success: boolean;
  rules?: SelectEmailRule[];
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify account ownership
    const account = await db.query.emailAccountsTable.findFirst({
      where: and(
        eq(emailAccountsTable.id, accountId),
        eq(emailAccountsTable.userId, userId)
      ),
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Get rules ordered by priority
    const rules = await db.query.emailRulesTable.findMany({
      where: eq(emailRulesTable.accountId, accountId),
      orderBy: (rules, { asc }) => [asc(rules.priority)],
    });

    return { success: true, rules };
  } catch (error: any) {
    console.error('Error getting rules:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a new rule
 */
export async function createRuleAction(rule: InsertEmailRule): Promise<{
  success: boolean;
  rule?: SelectEmailRule;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify account ownership
    const account = await db.query.emailAccountsTable.findFirst({
      where: and(
        eq(emailAccountsTable.id, rule.accountId),
        eq(emailAccountsTable.userId, userId)
      ),
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Set userId
    rule.userId = userId;

    // Create rule
    const [newRule] = await db
      .insert(emailRulesTable)
      .values(rule)
      .returning();

    revalidatePath('/platform/emails/settings');
    revalidatePath('/dashboard/emails/settings');

    return { success: true, rule: newRule };
  } catch (error: any) {
    console.error('Error creating rule:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a rule
 */
export async function updateRuleAction(
  ruleId: string,
  updates: Partial<InsertEmailRule>
): Promise<{
  success: boolean;
  rule?: SelectEmailRule;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get rule and verify ownership
    const rule = await db.query.emailRulesTable.findFirst({
      where: and(
        eq(emailRulesTable.id, ruleId),
        eq(emailRulesTable.userId, userId)
      ),
    });

    if (!rule) {
      return { success: false, error: 'Rule not found' };
    }

    // Update rule
    const [updatedRule] = await db
      .update(emailRulesTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(emailRulesTable.id, ruleId))
      .returning();

    revalidatePath('/platform/emails/settings');
    revalidatePath('/dashboard/emails/settings');

    return { success: true, rule: updatedRule };
  } catch (error: any) {
    console.error('Error updating rule:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a rule
 */
export async function deleteRuleAction(ruleId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get rule and verify ownership
    const rule = await db.query.emailRulesTable.findFirst({
      where: and(
        eq(emailRulesTable.id, ruleId),
        eq(emailRulesTable.userId, userId)
      ),
    });

    if (!rule) {
      return { success: false, error: 'Rule not found' };
    }

    // Delete rule
    await db
      .delete(emailRulesTable)
      .where(eq(emailRulesTable.id, ruleId));

    revalidatePath('/platform/emails/settings');
    revalidatePath('/dashboard/emails/settings');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting rule:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle rule enabled/disabled
 */
export async function toggleRuleAction(ruleId: string, enabled: boolean): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get rule and verify ownership
    const rule = await db.query.emailRulesTable.findFirst({
      where: and(
        eq(emailRulesTable.id, ruleId),
        eq(emailRulesTable.userId, userId)
      ),
    });

    if (!rule) {
      return { success: false, error: 'Rule not found' };
    }

    // Toggle enabled
    await db
      .update(emailRulesTable)
      .set({
        enabled,
        updatedAt: new Date(),
      })
      .where(eq(emailRulesTable.id, ruleId));

    revalidatePath('/platform/emails/settings');
    revalidatePath('/dashboard/emails/settings');

    return { success: true };
  } catch (error: any) {
    console.error('Error toggling rule:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reorder rules (update priorities)
 */
export async function reorderRulesAction(ruleIds: string[]): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update priority for each rule
    for (let i = 0; i < ruleIds.length; i++) {
      const ruleId = ruleIds[i];
      
      // Verify ownership
      const rule = await db.query.emailRulesTable.findFirst({
        where: and(
          eq(emailRulesTable.id, ruleId),
          eq(emailRulesTable.userId, userId)
        ),
      });

      if (rule) {
        await db
          .update(emailRulesTable)
          .set({
            priority: i,
            updatedAt: new Date(),
          })
          .where(eq(emailRulesTable.id, ruleId));
      }
    }

    revalidatePath('/platform/emails/settings');
    revalidatePath('/dashboard/emails/settings');

    return { success: true };
  } catch (error: any) {
    console.error('Error reordering rules:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Execute rules for a specific email
 */
export async function executeRulesAction(emailId: string): Promise<{
  success: boolean;
  executedRules?: number;
  matchedRules?: number;
  actionsExecuted?: number;
  error?: string;
}> {
  try {
    const result = await executeRulesForEmail(emailId);
    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error('Error executing rules:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test a rule against an email (without executing actions)
 */
export async function testRuleAction(ruleId: string, testEmailId: string): Promise<{
  success: boolean;
  matched?: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify rule ownership
    const rule = await db.query.emailRulesTable.findFirst({
      where: and(
        eq(emailRulesTable.id, ruleId),
        eq(emailRulesTable.userId, userId)
      ),
    });

    if (!rule) {
      return { success: false, error: 'Rule not found' };
    }

    const result = await testRule(ruleId, testEmailId);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      matched: result.matched,
    };
  } catch (error: any) {
    console.error('Error testing rule:', error);
    return { success: false, error: error.message };
  }
}


