'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  Settings,
  Zap,
  BarChart3,
  Download,
  Folder,
  Loader2,
  ChevronUp,
  Users,
} from 'lucide-react';
import type { SelectEmailAccount } from '@/db/schema/email-schema';

interface SidebarStickyFooterProps {
  selectedAccount: SelectEmailAccount | null;
  onSyncReport: () => void;
  onDownloadAll: () => void;
  onSyncFolders: () => void;
  onSettings: () => void;
  calendarPath: string;
  contactsPath: string;
  folderSyncing: boolean;
}

export function SidebarStickyFooter({
  selectedAccount,
  onSyncReport,
  onDownloadAll,
  onSyncFolders,
  onSettings,
  calendarPath,
  contactsPath,
  folderSyncing,
}: SidebarStickyFooterProps) {
  const [syncMenuOpen, setSyncMenuOpen] = useState(false);

  return (
    <div className="sticky bottom-0 border-t bg-background shadow-lg">
      <div className="grid grid-cols-4 gap-2 p-3">
        {/* Calendar Button */}
        <Link href={calendarPath || '#'} className="block">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-auto flex flex-col items-center gap-1 py-2"
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs font-medium">Calendar</span>
          </Button>
        </Link>

        {/* Contacts Button */}
        <Link href={contactsPath || '#'} className="block">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-auto flex flex-col items-center gap-1 py-2"
          >
            <Users className="h-5 w-5" />
            <span className="text-xs font-medium">Contacts</span>
          </Button>
        </Link>

        {/* Sync Dropdown */}
        <DropdownMenu open={syncMenuOpen} onOpenChange={setSyncMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={!selectedAccount}
              className="w-full h-auto flex flex-col items-center gap-1 py-2 relative"
            >
              <div className="flex items-center gap-1">
                <Zap className="h-5 w-5" />
                <ChevronUp className="h-3 w-3" />
              </div>
              <span className="text-xs font-medium">Sync</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="center" className="w-48">
            <DropdownMenuItem onClick={onSyncReport} className="cursor-pointer">
              <BarChart3 className="h-4 w-4 mr-2" />
              Sync Report
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownloadAll} className="cursor-pointer">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onSyncFolders}
              disabled={folderSyncing}
              className="cursor-pointer"
            >
              {folderSyncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Folder className="h-4 w-4 mr-2" />
              )}
              Sync Folders
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSettings}
          disabled={!selectedAccount}
          className="w-full h-auto flex flex-col items-center gap-1 py-2"
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs font-medium">Settings</span>
        </Button>
      </div>
    </div>
  );
}

