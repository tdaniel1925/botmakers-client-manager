/**
 * Email Header Component
 * Consolidates all email controls in the top header
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  RefreshCw, 
  Plus, 
  Download, 
  Folder, 
  Loader2,
  Settings,
  PenSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SelectEmailAccount } from '@/db/schema/email-schema';
import { AddEmailAccountDialog } from './add-email-account-dialog';
import { SettingsSlideOver } from './settings/settings-slide-over';
import { syncNylasEmailsAction, syncNylasFoldersAction } from '@/actions/email-nylas-actions';

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

  const [refreshing, setRefreshing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSettingsSlideOver, setShowSettingsSlideOver] = useState(false);
  const [folderSyncing, setFolderSyncing] = useState(false);

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

  const handleFullSync = async () => {
    if (!selectedAccount) return;
    
    // Call parent's refresh function which opens progress modal and syncs
    await onRefresh();
  };

  const handleSyncFolders = async () => {
    if (!selectedAccount) return;
    
    setFolderSyncing(true);
    try {
      const result = await syncNylasFoldersAction(selectedAccount.id);
      if (result.success) {
        showToast(`✅ Synced ${result.syncedCount} folders!`, 'success');
        await onRefresh();
      } else {
        showToast(`❌ Folder sync failed: ${result.error}`, 'error');
      }
    } catch (error) {
      showToast('❌ An error occurred during folder sync', 'error');
    } finally {
      setFolderSyncing(false);
    }
  };

  const handleAddSuccess = () => {
    onRefresh();
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

          {/* Center: Account & Controls */}
          <div className="flex-1 flex items-center gap-2 justify-center max-w-3xl mx-auto">
            {/* Account Selector */}
            <Select
              value={selectedAccount?.id}
              onValueChange={(value) => {
                const account = accounts.find((acc) => acc.id === value);
                if (account) {
                  onAccountChange(account);
                }
              }}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        account.status === 'active' ? 'bg-green-500' :
                        account.status === 'syncing' ? 'bg-blue-500' :
                        account.status === 'error' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`} />
                      <span className="truncate">{account.emailAddress}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action Buttons */}
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">Add</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleFullSync}
              disabled={!selectedAccount}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden lg:inline">Download All</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncFolders}
              disabled={folderSyncing || !selectedAccount}
              className="gap-2"
            >
              {folderSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Folder className="h-4 w-4" />
              )}
              <span className="hidden lg:inline">Sync Folders</span>
            </Button>
          </div>

          {/* Right: Settings & Calendar */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsSlideOver(true)}
              disabled={!selectedAccount}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden lg:inline">Settings</span>
            </Button>

            <Link href={calendarPath}>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden lg:inline">Calendar</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Indicator */}
        {folderSyncing && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Syncing folders...</span>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddEmailAccountDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddSuccess}
      />

      {selectedAccount && (
        <SettingsSlideOver
          open={showSettingsSlideOver}
          onOpenChange={setShowSettingsSlideOver}
          accountId={selectedAccount.id}
        />
      )}
    </>
  );
}


