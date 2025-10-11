/**
 * Folder Sidebar Component
 * Left panel with account switcher and folder navigation
 */

'use client';

import { Inbox, Send, FileText, Trash2, Archive, Star, Folder, Mail, Plus, MoreVertical, RefreshCw, Settings, Pause, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SelectEmailAccount } from '@/db/schema/email-schema';

interface FolderSidebarProps {
  selectedFolder: string;
  folders: any[];
  onFolderChange: (folder: string) => void;
  accounts: SelectEmailAccount[];
  selectedAccount: SelectEmailAccount | null;
  onAccountChange: (accountId: string) => void;
  onAddAccount: () => void;
}

// Folder type to icon mapping
const FOLDER_ICON_MAP: Record<string, any> = {
  inbox: Inbox,
  sent: Send,
  drafts: FileText,
  starred: Star,
  archive: Archive,
  trash: Trash2,
  spam: Trash2,
  custom: Folder,
};

// Account color palette
const ACCOUNT_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-rose-500',
];

export function FolderSidebar({
  selectedFolder,
  folders,
  onFolderChange,
  accounts,
  selectedAccount,
  onAccountChange,
  onAddAccount,
}: FolderSidebarProps) {
  // Get account color
  const getAccountColor = (index: number) => {
    return ACCOUNT_COLORS[index % ACCOUNT_COLORS.length];
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Calculate unread count for account
  const getAccountUnreadCount = (accountId: string) => {
    return folders
      .filter((f) => f.accountId === accountId)
      .reduce((sum, f) => sum + (f.unreadCount || 0), 0);
  };

  return (
    <div className="w-[280px] border-r bg-muted/5 flex flex-col h-full">
      {/* Account Switcher */}
      {accounts.length > 0 && (
        <div className="p-3 border-b bg-background/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-auto py-2.5 px-3 justify-start font-normal hover:bg-muted"
              >
                <div className="flex items-center gap-2 w-full">
                  {selectedAccount ? (
                    <>
                      <div
                        className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${getStatusColor(
                          selectedAccount.syncStatus || 'inactive'
                        )} ${
                          selectedAccount.syncStatus === 'active' ? 'animate-pulse' : ''
                        }`}
                      />
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm flex-1 text-left">
                        {selectedAccount.emailAddress}
                      </span>
                      {getAccountUnreadCount(selectedAccount.id) > 0 && (
                        <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                          {getAccountUnreadCount(selectedAccount.id)}
                        </Badge>
                      )}
                      <ChevronDown className="h-4 w-4 flex-shrink-0 ml-auto opacity-50" />
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">Select Account</span>
                      <ChevronDown className="h-4 w-4 ml-auto opacity-50" />
                    </>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[240px]" align="start">
              {accounts.map((account, index) => {
                const unreadCount = getAccountUnreadCount(account.id);
                return (
                  <DropdownMenuItem
                    key={account.id}
                    onClick={() => onAccountChange(account.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div
                        className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${getAccountColor(
                          index
                        )}`}
                      />
                      <div
                        className={`h-2 w-2 rounded-full flex-shrink-0 ${getStatusColor(
                          account.syncStatus || 'inactive'
                        )}`}
                      />
                      <span className="truncate flex-1">{account.emailAddress}</span>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs ml-auto flex-shrink-0">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onAddAccount} className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Account</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Folders List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
            Folders
          </div>
          
          {folders.length > 0 ? (
            folders.map((folder) => {
              const Icon = FOLDER_ICON_MAP[folder.folderType] || Folder;
              
              // For custom folders, use the folder name as identifier
              // For system folders, use the folder type in uppercase
              const folderId = folder.folderType === 'custom' 
                ? folder.name 
                : folder.folderType.toUpperCase();
              
              const isSelected = selectedFolder === folderId;

              return (
                <button
                  key={folder.id}
                  onClick={() => onFolderChange(folderId)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{folder.displayName || folder.name}</span>
                  </div>
                  {folder.unreadCount > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-primary-foreground/20'
                        : 'bg-muted-foreground/20'
                    }`}>
                      {folder.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No folders found
            </div>
          )}
        </div>
      </div>

      {/* Settings moved to header - this is now just folders */}
    </div>
  );
}
