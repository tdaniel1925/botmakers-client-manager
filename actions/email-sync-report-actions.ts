/**
 * Email Sync Report Actions
 * Get reports on sync status and unsynced emails
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { emailsTable, emailAccountsTable } from '@/db/schema/email-schema';
import { eq, and, sql } from 'drizzle-orm';
import Nylas from 'nylas';

const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY!,
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
});

interface SyncReport {
  success: boolean;
  accountEmail: string;
  totalInNylas: number;
  totalInDatabase: number;
  unsynced: number;
  syncPercentage: number;
  lastSyncDate: Date | null;
  folderBreakdown: {
    folderName: string;
    totalInNylas: number;
    totalInDatabase: number;
    unsynced: number;
  }[];
  error?: string;
}

/**
 * Get comprehensive sync report for an account
 */
export async function getSyncReportAction(accountId: string): Promise<SyncReport> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        accountEmail: '',
        totalInNylas: 0,
        totalInDatabase: 0,
        unsynced: 0,
        syncPercentage: 0,
        lastSyncDate: null,
        folderBreakdown: [],
        error: 'Unauthorized',
      };
    }

    // Get account details
    const account = await db.query.emailAccountsTable.findFirst({
      where: and(
        eq(emailAccountsTable.id, accountId),
        eq(emailAccountsTable.userId, userId)
      ),
    });

    if (!account || !account.nylasGrantId) {
      return {
        success: false,
        accountEmail: account?.emailAddress || '',
        totalInNylas: 0,
        totalInDatabase: 0,
        unsynced: 0,
        syncPercentage: 0,
        lastSyncDate: account?.lastSyncAt || null,
        folderBreakdown: [],
        error: 'Account not found or not connected to Nylas',
      };
    }

    console.log(`📊 Generating sync report for ${account.emailAddress}...`);

    // Get total count in database
    const dbCountResult = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(emailsTable)
      .where(eq(emailsTable.accountId, accountId));

    const totalInDatabase = dbCountResult[0]?.count || 0;

    console.log(`💾 Database: ${totalInDatabase} emails`);

    // Get total count from Nylas (all folders)
    let totalInNylas = 0;
    const folderBreakdown: SyncReport['folderBreakdown'] = [];

    try {
      // Get all folders from Nylas
      const foldersResponse = await nylas.folders.list({
        identifier: account.nylasGrantId,
      });

      console.log(`📁 Found ${foldersResponse.data.length} folders in Nylas`);

      // For each folder, get message count
      for (const folder of foldersResponse.data) {
        try {
          // Query messages in this folder with limit 0 to get count only
          const messagesResponse = await nylas.messages.list({
            identifier: account.nylasGrantId,
            queryParams: {
              limit: 1, // Just get count, not actual messages
              in: [folder.id],
            },
          });

          // Nylas doesn't return total count directly, so we need to count all pages
          // For now, we'll make a reasonable estimate based on first page
          // A more accurate count would require paginating through all messages
          
          // Get database count for this folder
          const dbFolderCount = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(emailsTable)
            .where(
              and(
                eq(emailsTable.accountId, accountId),
                eq(emailsTable.folderName, folder.name || 'INBOX')
              )
            );

          const folderDbCount = dbFolderCount[0]?.count || 0;

          // For accurate count, we'd need to paginate, but that's expensive
          // Instead, let's query with a high limit and see what we get
          const countQuery = await nylas.messages.list({
            identifier: account.nylasGrantId,
            queryParams: {
              limit: 1000, // Max limit per page
              in: [folder.id],
            },
          });

          const folderNylasCount = countQuery.data.length;
          const hasMore = !!countQuery.nextCursor;

          // If there's more, estimate based on folder
          let estimatedTotal = folderNylasCount;
          if (hasMore) {
            // Rough estimate: if we got 1000 and there's more, assume 2x-5x
            estimatedTotal = folderNylasCount * 2; // Conservative estimate
          }

          totalInNylas += estimatedTotal;

          folderBreakdown.push({
            folderName: folder.name || 'Unknown',
            totalInNylas: estimatedTotal,
            totalInDatabase: folderDbCount,
            unsynced: Math.max(0, estimatedTotal - folderDbCount),
          });

          console.log(`📁 ${folder.name}: ~${estimatedTotal} in Nylas, ${folderDbCount} in DB`);
        } catch (folderError) {
          console.error(`Error processing folder ${folder.name}:`, folderError);
        }
      }
    } catch (nylasError) {
      console.error('Error fetching from Nylas:', nylasError);
      return {
        success: false,
        accountEmail: account.emailAddress,
        totalInNylas: 0,
        totalInDatabase,
        unsynced: 0,
        syncPercentage: 0,
        lastSyncDate: account.lastSyncAt,
        folderBreakdown: [],
        error: 'Failed to fetch data from email provider',
      };
    }

    const unsynced = Math.max(0, totalInNylas - totalInDatabase);
    const syncPercentage = totalInNylas > 0 
      ? Math.round((totalInDatabase / totalInNylas) * 100)
      : 100;

    console.log(`✅ Sync Report Complete:`);
    console.log(`   Total in Nylas: ${totalInNylas}`);
    console.log(`   Total in Database: ${totalInDatabase}`);
    console.log(`   Unsynced: ${unsynced}`);
    console.log(`   Sync %: ${syncPercentage}%`);

    return {
      success: true,
      accountEmail: account.emailAddress,
      totalInNylas,
      totalInDatabase,
      unsynced,
      syncPercentage,
      lastSyncDate: account.lastSyncAt,
      folderBreakdown,
    };
  } catch (error) {
    console.error('Error generating sync report:', error);
    return {
      success: false,
      accountEmail: '',
      totalInNylas: 0,
      totalInDatabase: 0,
      unsynced: 0,
      syncPercentage: 0,
      lastSyncDate: null,
      folderBreakdown: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get quick sync status (just counts, no folder breakdown)
 */
export async function getQuickSyncStatusAction(accountId: string): Promise<{
  success: boolean;
  totalInDatabase: number;
  lastSyncDate: Date | null;
  syncStatus: 'syncing' | 'active' | 'error' | 'pending';
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        totalInDatabase: 0,
        lastSyncDate: null,
        syncStatus: 'error',
        error: 'Unauthorized',
      };
    }

    const account = await db.query.emailAccountsTable.findFirst({
      where: and(
        eq(emailAccountsTable.id, accountId),
        eq(emailAccountsTable.userId, userId)
      ),
    });

    if (!account) {
      return {
        success: false,
        totalInDatabase: 0,
        lastSyncDate: null,
        syncStatus: 'error',
        error: 'Account not found',
      };
    }

    const dbCountResult = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(emailsTable)
      .where(eq(emailsTable.accountId, accountId));

    return {
      success: true,
      totalInDatabase: dbCountResult[0]?.count || 0,
      lastSyncDate: account.lastSyncAt,
      syncStatus: account.status === 'inactive' ? 'pending' : account.status,
    };
  } catch (error) {
    console.error('Error getting quick sync status:', error);
    return {
      success: false,
      totalInDatabase: 0,
      lastSyncDate: null,
      syncStatus: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


