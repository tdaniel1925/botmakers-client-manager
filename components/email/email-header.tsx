/**
 * Email Header Component
 * Consolidates all email controls in the top header
 */

// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ArrowLeft, 
  RefreshCw, 
  PenSquare,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SelectEmailAccount } from '@/db/schema/email-schema';
import { syncNylasEmailsAction } from '@/actions/email-nylas-actions';

interface EmailHeaderProps {
  accounts: SelectEmailAccount[];
  selectedAccount: SelectEmailAccount | null;
  onAccountChange: (account: SelectEmailAccount) => void;
  onRefresh: () => void;
  onCompose?: () => void;
}

export function EmailHeader({
  accounts,
  selectedAccount,
  onAccountChange,
  onRefresh,
  onCompose,
}: EmailHeaderProps) {
  const pathname = usePathname();
  const isPlatform = pathname?.startsWith('/platform');
  const dashboardPath = isPlatform ? '/platform/dashboard' : '/dashboard';
  const calendarPath = isPlatform ? '/platform/calendar' : '/dashboard/calendar';
  const helpPath = isPlatform ? '/platform/emails/help' : '/dashboard/emails/help';

  const [refreshing, setRefreshing] = useState(false);

  // Toast notification utility
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const bgColors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    };
    
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 ${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-300`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('animate-out', 'slide-out-to-top-2', 'fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const handleRefresh = async () => {
    if (!selectedAccount) return;
    
    setRefreshing(true);
    try {
      const result = await syncNylasEmailsAction(selectedAccount.id);
      if (result.success) {
        showToast(`✅ Synced ${result.syncedCount} new emails`, 'success');
        await onRefresh();
      } else {
        showToast(`❌ Sync failed: ${result.error}`, 'error');
      }
    } catch (error) {
      showToast('❌ Sync error occurred', 'error');
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  return (
    <>
      <div className="border-b bg-background px-4 py-2.5">
        <div className="flex items-center gap-3">
          {/* Left: Navigation */}
          <Link href={dashboardPath}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden lg:inline">Dashboard</span>
            </Button>
          </Link>

          {/* Divider */}
          <div className="h-6 w-px bg-border" />

          {/* Title */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">Email Client</h1>
          </div>

          {/* Center: Quick Actions (now has space for search box) */}
          <div className="flex-1 flex items-center gap-2 justify-center max-w-3xl mx-auto">
            <Button
              variant="default"
              size="sm"
              onClick={onCompose}
              disabled={!selectedAccount}
              className="gap-2 bg-primary"
            >
              <PenSquare className="h-4 w-4" />
              <span className="hidden md:inline">Compose</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || !selectedAccount}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Sync</span>
            </Button>

            {/* Space reserved for future search box */}
          </div>

          {/* Right: Help Only */}
          <div className="flex items-center gap-2">
            <Link href={helpPath}>
              <Button variant="outline" size="sm" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden lg:inline">Help</span>
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </>
  );
}


