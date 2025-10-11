/**
 * Sync Status API - Returns real-time sync progress
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Global sync status store (in-memory)
// In production, use Redis or similar
const syncStatusStore = new Map<string, {
  currentPage: number;
  totalFetched: number;
  synced: number;
  skipped: number;
  errors: number;
  currentFolder?: string;
  estimatedTotal: number;
  isComplete: boolean;
  lastUpdated: Date;
}>();

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ Sync status GET: No userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = syncStatusStore.get(userId) || {
      currentPage: 0,
      totalFetched: 0,
      synced: 0,
      skipped: 0,
      errors: 0,
      estimatedTotal: 1000,
      isComplete: false,
      lastUpdated: new Date(),
    };

    console.log(`📊 Sync status GET for user ${userId.substring(0, 10)}...:`, {
      hasStatus: syncStatusStore.has(userId),
      status: status,
      storeSize: syncStatusStore.size
    });

    return NextResponse.json(status);
  } catch (error) {
    console.error('❌ Error getting sync status:', error);
    return NextResponse.json({ error: 'Failed to get sync status' }, { status: 500 });
  }
}

// Export utility functions to update status
export function updateSyncStatus(userId: string, status: Partial<{
  currentPage: number;
  totalFetched: number;
  synced: number;
  skipped: number;
  errors: number;
  currentFolder: string;
  estimatedTotal: number;
  isComplete: boolean;
}>) {
  const current = syncStatusStore.get(userId) || {
    currentPage: 0,
    totalFetched: 0,
    synced: 0,
    skipped: 0,
    errors: 0,
    estimatedTotal: 1000,
    isComplete: false,
    lastUpdated: new Date(),
  };

  const updated = {
    ...current,
    ...status,
    lastUpdated: new Date(),
  };

  syncStatusStore.set(userId, updated);

  console.log(`💾 Sync status UPDATED for user ${userId.substring(0, 10)}...:`, {
    page: updated.currentPage,
    fetched: updated.totalFetched,
    synced: updated.synced,
    skipped: updated.skipped,
    isComplete: updated.isComplete
  });
}

export function clearSyncStatus(userId: string) {
  syncStatusStore.delete(userId);
}

