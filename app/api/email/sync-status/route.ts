/**
 * Sync Status API - Returns real-time sync progress
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSyncStatus, hasSyncStatus, getSyncStoreSize } from '@/lib/email-sync-status';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ Sync status GET: No userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = getSyncStatus(userId);

    console.log(`📊 Sync status GET for user ${userId.substring(0, 10)}...:`, {
      hasStatus: hasSyncStatus(userId),
      status: status,
      storeSize: getSyncStoreSize()
    });

    return NextResponse.json(status);
  } catch (error) {
    console.error('❌ Error getting sync status:', error);
    return NextResponse.json({ error: 'Failed to get sync status' }, { status: 500 });
  }
}

