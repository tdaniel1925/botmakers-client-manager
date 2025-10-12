/**
 * Email Sync Status Utilities
 * Manages in-memory sync status (use Redis in production)
 */

// Global sync status store (in-memory)
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

export function getSyncStatus(userId: string) {
  return syncStatusStore.get(userId) || {
    currentPage: 0,
    totalFetched: 0,
    synced: 0,
    skipped: 0,
    errors: 0,
    estimatedTotal: 1000,
    isComplete: false,
    lastUpdated: new Date(),
  };
}

export function clearSyncStatus(userId: string) {
  syncStatusStore.delete(userId);
}

export function hasSyncStatus(userId: string) {
  return syncStatusStore.has(userId);
}

export function getSyncStoreSize() {
  return syncStatusStore.size;
}

