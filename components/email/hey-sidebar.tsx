/**
 * Hey-Enabled Sidebar - Supports both Traditional and Hey modes
 */

'use client';

import { Inbox, Send, FileText, Trash2, Archive, Star, Folder, Mail, Plus, ChevronDown, Filter, Newspaper, Receipt, Clock, Package, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarStickyFooter } from './sidebar-sticky-footer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SelectEmailAccount } from '@/db/schema/email-schema';

type EmailMode = 'traditional' | 'hey' | 'hybrid';
type HeyView = 'screener' | 'imbox' | 'feed' | 'paper_trail' | 'reply_later' | 'set_aside';

interface HeySidebarProps {
  selectedView: string; // Can be folder name or Hey view
  folders: any[];
  onViewChange: (view: string) => void;
  accounts: SelectEmailAccount[];
  selectedAccount: SelectEmailAccount | null;
  onAccountChange: (accountId: string) => void;
  onAddAccount: () => void;
  emailMode: EmailMode;
  unscreenedCount?: number;
  replyLaterCount?: number;
  setAsideCount?: number;
  onSyncReport: () => void;
  onDownloadAll: () => void;
  onSyncFolders: () => void;
  onSettings: () => void;
  calendarPath: string;
  contactsPath: string;
  folderSyncing: boolean;
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

// Hey views configuration
const HEY_VIEWS = [
  {
    id: 'screener',
    label: 'Screener',
    icon: Filter,
    color: 'from-red-400 to-pink-400',
    description: 'Screen new senders',
    showBadge: true,
  },
  {
    id: 'imbox',
    label: 'Imbox',
    icon: Inbox,
    color: 'from-yellow-400 to-orange-400',
    description: 'Important people',
  },
  {
    id: 'feed',
    label: 'The Feed',
    icon: Newspaper,
    color: 'from-blue-400 to-cyan-400',
    description: 'Newsletters',
  },
  {
    id: 'paper_trail',
    label: 'Paper Trail',
    icon: Receipt,
    color: 'from-gray-400 to-gray-500',
    description: 'Receipts',
  },
];

const HEY_SECONDARY_VIEWS = [
  {
    id: 'reply_later',
    label: 'Reply Later',
    icon: Clock,
    showBadge: true,
  },
  {
    id: 'set_aside',
    label: 'Set Aside',
    icon: Package,
    showBadge: true,
  },
];

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

export function HeySidebar({
  selectedView,
  folders,
  onViewChange,
  accounts,
  selectedAccount,
  onAccountChange,
  onAddAccount,
  emailMode,
  unscreenedCount = 0,
  replyLaterCount = 0,
  setAsideCount = 0,
  onSyncReport,
  onDownloadAll,
  onSyncFolders,
  onSettings,
  calendarPath,
  contactsPath,
  folderSyncing,
}: HeySidebarProps) {
  const isHeyMode = emailMode === 'hey' || emailMode === 'hybrid';

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

  // Get badge count for Hey views
  const getBadgeCount = (viewId: string) => {
    switch (viewId) {
      case 'screener':
        return unscreenedCount;
      case 'reply_later':
        return replyLaterCount;
      case 'set_aside':
        return setAsideCount;
      default:
        return 0;
    }
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

      {/* Navigation - Hey Mode or Traditional */}
      <div className="flex-1 overflow-y-auto">
        {isHeyMode ? (
          <>
            {/* Hey Main Views */}
            <div className="p-2 space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Hey Workflow
              </div>
              
              {HEY_VIEWS.map((view) => {
                const Icon = view.icon;
                const isSelected = selectedView === view.id;
                const badgeCount = view.showBadge ? getBadgeCount(view.id) : 0;

                return (
                  <button
                    key={view.id}
                    onClick={() => onViewChange(view.id)}
                    className={`w-full group relative overflow-hidden rounded-lg transition-all ${
                      isSelected
                        ? 'shadow-md scale-[1.02]'
                        : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${view.color} ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-10'
                      } transition-opacity`}
                    />
                    <div className={`relative flex items-center justify-between px-3 py-2.5 ${
                      isSelected ? 'text-white' : 'text-foreground'
                    }`}>
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <div className="text-left">
                          <div className="text-sm font-medium">{view.label}</div>
                          {!isSelected && (
                            <div className="text-xs text-muted-foreground">
                              {view.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {badgeCount > 0 && (
                        <Badge 
                          variant={isSelected ? 'secondary' : 'default'}
                          className="text-xs font-bold"
                        >
                          {badgeCount}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Hey Secondary Views */}
            <div className="p-2 space-y-1 mt-4 border-t">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                Tools
              </div>
              
              {HEY_SECONDARY_VIEWS.map((view) => {
                const Icon = view.icon;
                const isSelected = selectedView === view.id;
                const badgeCount = view.showBadge ? getBadgeCount(view.id) : 0;

                return (
                  <button
                    key={view.id}
                    onClick={() => onViewChange(view.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{view.label}</span>
                    </div>
                    {badgeCount > 0 && (
                      <Badge variant={isSelected ? 'secondary' : 'outline'} className="text-xs">
                        {badgeCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Traditional Folders (Always shown with Hey views) */}
            {folders.length > 0 && (
              <div className="p-2 space-y-1 mt-4 border-t">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                  Traditional Folders
                </div>
                {folders.map((folder) => {
                  const Icon = FOLDER_ICON_MAP[folder.folderType] || Folder;
                  const folderId = folder.folderType === 'custom' 
                    ? folder.name 
                    : folder.folderType.toUpperCase();
                  const isSelected = selectedView === folderId;

                  return (
                    <button
                      key={folder.id}
                      onClick={() => onViewChange(folderId)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{folder.displayName || folder.name}</span>
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
                })}
              </div>
            )}
          </>
        ) : (
          /* Traditional Folders Mode */
          <div className="p-2 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
              Folders
            </div>
            
            {folders.length > 0 ? (
              folders.map((folder) => {
                const Icon = FOLDER_ICON_MAP[folder.folderType] || Folder;
                const folderId = folder.folderType === 'custom' 
                  ? folder.name 
                  : folder.folderType.toUpperCase();
                const isSelected = selectedView === folderId;

                return (
                  <button
                    key={folder.id}
                    onClick={() => onViewChange(folderId)}
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
        )}
      </div>

      {/* Sticky App Controls Footer */}
      <SidebarStickyFooter
        selectedAccount={selectedAccount}
        onSyncReport={onSyncReport}
        onDownloadAll={onDownloadAll}
        onSyncFolders={onSyncFolders}
        onSettings={onSettings}
        calendarPath={calendarPath}
        contactsPath={contactsPath}
        folderSyncing={folderSyncing}
      />
    </div>
  );
}

