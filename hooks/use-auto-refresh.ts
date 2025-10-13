/**
 * Auto-Refresh Hook - Automatically check for new emails
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface UseAutoRefreshOptions {
  enabled: boolean;
  intervalMs?: number; // Default: 120000 (2 minutes)
  onRefresh: () => Promise<void>;
}

export function useAutoRefresh({ enabled, intervalMs = 120000, onRefresh }: UseAutoRefreshOptions) {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      // Clear interval if auto-refresh is disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start auto-refresh polling
    intervalRef.current = setInterval(async () => {
      if (isRefreshing) {
        console.log('⏭️  Skipping auto-refresh - already refreshing');
        return;
      }

      console.log('🔄 Auto-refreshing emails...');
      setIsRefreshing(true);
      
      try {
        await onRefresh();
        setLastRefresh(new Date());
      } catch (error) {
        console.error('❌ Auto-refresh error:', error);
      } finally {
        setIsRefreshing(false);
      }
    }, intervalMs);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMs, onRefresh, isRefreshing]);

  // Manual refresh function
  const manualRefresh = async () => {
    if (isRefreshing) {
      console.log('⏭️  Skipping manual refresh - already refreshing');
      return;
    }

    console.log('🔄 Manual refresh triggered');
    setIsRefreshing(true);
    
    try {
      await onRefresh();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('❌ Manual refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    lastRefresh,
    isRefreshing,
    manualRefresh,
  };
}


