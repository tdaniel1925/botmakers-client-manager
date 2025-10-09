/**
 * Folder Sidebar Component
 * Left panel with account selector and folder navigation
 */

'use client';

import { useState } from 'react';
import { RefreshCw, Settings, Plus, Inbox, Send, FileText, Trash2, Archive, Star } from 'lucide-react';
import type { SelectEmailAccount } from '@/db/schema/email-schema';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddEmailAccountDialog } from './add-email-account-dialog';

interface FolderSidebarProps {
  accounts: SelectEmailAccount[];
  selectedAccount: SelectEmailAccount | null;
  selectedFolder: string;
  onAccountChange: (account: SelectEmailAccount) => void;
  onFolderChange: (folder: string) => void;
  onRefresh: () => void;
}

const SYSTEM_FOLDERS = [
  { id: 'INBOX', label: 'Inbox', icon: Inbox, count: 0 },
  { id: 'SENT', label: 'Sent', icon: Send, count: 0 },
  { id: 'DRAFTS', label: 'Drafts', icon: FileText, count: 0 },
  { id: 'STARRED', label: 'Starred', icon: Star, count: 0 },
  { id: 'ARCHIVE', label: 'Archive', icon: Archive, count: 0 },
  { id: 'TRASH', label: 'Trash', icon: Trash2, count: 0 },
];

export function FolderSidebar({
  accounts,
  selectedAccount,
  selectedFolder,
  onAccountChange,
  onFolderChange,
  onRefresh,
}: FolderSidebarProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAddSuccess = () => {
    onRefresh(); // Reload accounts after adding new one
  };

  return (
    <div className="w-[280px] border-r bg-muted/5 flex flex-col h-full">
      {/* Account Selector */}
      <div className="p-4 border-b">
        <Select
          value={selectedAccount?.id}
          onValueChange={(value) => {
            const account = accounts.find((acc) => acc.id === value);
            if (account) {
              onAccountChange(account);
            }
          }}
        >
          <SelectTrigger className="w-full">
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

        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* System Folders */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
            Folders
          </div>
          
          {SYSTEM_FOLDERS.map((folder) => {
            const Icon = folder.icon;
            const isSelected = selectedFolder === folder.id;

            return (
              <button
                key={folder.id}
                onClick={() => onFolderChange(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{folder.label}</span>
                </div>
                {folder.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-primary-foreground/20'
                      : 'bg-muted-foreground/20'
                  }`}>
                    {folder.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Labels (placeholder) */}
        <div className="p-2 space-y-1 mt-4">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
            <span>Labels</span>
            <button className="hover:text-foreground">
              <Plus className="h-3 w-3" />
            </button>
          </div>
          
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            No custom labels yet
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-3">
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
        
        {selectedAccount && (
          <div className="mt-2 px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Last synced: {selectedAccount.lastSyncAt 
                ? new Date(selectedAccount.lastSyncAt).toLocaleTimeString()
                : 'Never'
              }</span>
            </div>
          </div>
        )}
      </div>

      {/* Add Email Account Dialog */}
      {showAddDialog && (
        <AddEmailAccountDialog
          onClose={() => setShowAddDialog(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
}

