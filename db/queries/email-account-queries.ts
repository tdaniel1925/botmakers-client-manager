/**
 * Email Account Database Queries
 * CRUD operations for email accounts
 */

import { db } from "../index";
import { emailAccountsTable, type InsertEmailAccount, type SelectEmailAccount } from "../schema/email-schema";
import { eq, and, desc } from "drizzle-orm";

// ============================================================================
// Create
// ============================================================================

export async function createEmailAccount(data: InsertEmailAccount): Promise<SelectEmailAccount> {
  const [account] = await db.insert(emailAccountsTable).values(data).returning();
  return account;
}

// ============================================================================
// Read
// ============================================================================

export async function getEmailAccountById(id: string): Promise<SelectEmailAccount | undefined> {
  const [account] = await db
    .select()
    .from(emailAccountsTable)
    .where(eq(emailAccountsTable.id, id))
    .limit(1);
  return account;
}

export async function getEmailAccountsByUserId(userId: string): Promise<SelectEmailAccount[]> {
  return await db
    .select()
    .from(emailAccountsTable)
    .where(eq(emailAccountsTable.userId, userId))
    .orderBy(desc(emailAccountsTable.createdAt));
}

export async function getActiveEmailAccountsByUserId(userId: string): Promise<SelectEmailAccount[]> {
  return await db
    .select()
    .from(emailAccountsTable)
    .where(
      and(
        eq(emailAccountsTable.userId, userId),
        eq(emailAccountsTable.status, "active")
      )
    )
    .orderBy(desc(emailAccountsTable.createdAt));
}

export async function getEmailAccountByEmail(
  userId: string,
  emailAddress: string
): Promise<SelectEmailAccount | undefined> {
  const [account] = await db
    .select()
    .from(emailAccountsTable)
    .where(
      and(
        eq(emailAccountsTable.userId, userId),
        eq(emailAccountsTable.emailAddress, emailAddress)
      )
    )
    .limit(1);
  return account;
}

export async function getDefaultEmailAccount(userId: string): Promise<SelectEmailAccount | undefined> {
  const [account] = await db
    .select()
    .from(emailAccountsTable)
    .where(
      and(
        eq(emailAccountsTable.userId, userId),
        eq(emailAccountsTable.isDefault, true)
      )
    )
    .limit(1);
  return account;
}

// ============================================================================
// Update
// ============================================================================

export async function updateEmailAccount(
  id: string,
  data: Partial<InsertEmailAccount>
): Promise<SelectEmailAccount | undefined> {
  const [updated] = await db
    .update(emailAccountsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(emailAccountsTable.id, id))
    .returning();
  return updated;
}

export async function updateEmailAccountStatus(
  id: string,
  status: "active" | "inactive" | "error" | "syncing"
): Promise<void> {
  await db
    .update(emailAccountsTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(emailAccountsTable.id, id));
}

export async function updateEmailAccountSyncState(
  id: string,
  lastSyncAt: Date,
  lastUid?: number,
  lastSyncError?: string
): Promise<void> {
  await db
    .update(emailAccountsTable)
    .set({
      lastSyncAt,
      lastUid,
      lastSyncError,
      status: lastSyncError ? "error" : "active",
      updatedAt: new Date(),
    })
    .where(eq(emailAccountsTable.id, id));
}

export async function updateOAuthTokens(
  id: string,
  accessToken: string,
  refreshToken: string,
  tokenExpiresAt: Date
): Promise<void> {
  await db
    .update(emailAccountsTable)
    .set({
      accessToken,
      refreshToken,
      tokenExpiresAt,
      updatedAt: new Date(),
    })
    .where(eq(emailAccountsTable.id, id));
}

export async function updateWebhookSubscription(
  id: string,
  webhookSubscriptionId: string,
  webhookExpiresAt: Date
): Promise<void> {
  await db
    .update(emailAccountsTable)
    .set({
      webhookSubscriptionId,
      webhookExpiresAt,
      updatedAt: new Date(),
    })
    .where(eq(emailAccountsTable.id, id));
}

export async function setDefaultEmailAccount(
  userId: string,
  accountId: string
): Promise<void> {
  // First, unset all default flags for this user
  await db
    .update(emailAccountsTable)
    .set({ isDefault: false })
    .where(eq(emailAccountsTable.userId, userId));

  // Then set the specified account as default
  await db
    .update(emailAccountsTable)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(eq(emailAccountsTable.id, accountId));
}

// ============================================================================
// Delete
// ============================================================================

export async function deleteEmailAccount(id: string): Promise<void> {
  await db.delete(emailAccountsTable).where(eq(emailAccountsTable.id, id));
}

// ============================================================================
// Batch Operations
// ============================================================================

export async function getAccountsNeedingSync(limit: number = 50): Promise<SelectEmailAccount[]> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  return await db
    .select()
    .from(emailAccountsTable)
    .where(
      and(
        eq(emailAccountsTable.status, "active"),
        // Account hasn't been synced in the last 5 minutes (or never synced)
      )
    )
    .orderBy(emailAccountsTable.lastSyncAt) // Oldest sync first
    .limit(limit);
}

export async function getAccountsWithExpiredWebhooks(): Promise<SelectEmailAccount[]> {
  const now = new Date();
  
  return await db
    .select()
    .from(emailAccountsTable)
    .where(
      and(
        eq(emailAccountsTable.status, "active"),
        // Webhook expires soon (less than 24 hours)
      )
    );
}

// ============================================================================
// Statistics
// ============================================================================

export async function getEmailAccountStats(accountId: string) {
  const account = await getEmailAccountById(accountId);
  
  if (!account) {
    return null;
  }

  // TODO: Add actual email counts when emails table queries are implemented
  return {
    accountId,
    emailAddress: account.emailAddress,
    status: account.status,
    lastSyncAt: account.lastSyncAt,
    totalEmails: 0,
    unreadCount: 0,
    inboxCount: 0,
  };
}

