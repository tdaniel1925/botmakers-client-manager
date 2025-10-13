/**
 * Command Palette - Global command menu (Cmd+K)
 */

// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { useState, useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Mail,
  Send,
  Archive,
  Trash2,
  Star,
  Clock,
  Package,
  Filter,
  Inbox,
  Newspaper,
  Receipt,
  Search,
  Settings,
  User,
  Calendar,
  Sparkles,
  Reply,
  Forward,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (view: string) => void;
  onAction?: (action: string) => void;
  onSearch?: (query: string) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
  onAction,
  onSearch,
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleSelect = (callback: () => void) => {
    callback();
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation */}
        <CommandGroup heading="Views">
          <CommandItem onSelect={() => handleSelect(() => onNavigate?.('imbox'))}>
            <Inbox className="mr-2 h-4 w-4" />
            <span>Imbox</span>
            <span className="ml-auto text-xs text-muted-foreground">1</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onNavigate?.('feed'))}>
            <Newspaper className="mr-2 h-4 w-4" />
            <span>The Feed</span>
            <span className="ml-auto text-xs text-muted-foreground">2</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onNavigate?.('paper_trail'))}>
            <Receipt className="mr-2 h-4 w-4" />
            <span>Paper Trail</span>
            <span className="ml-auto text-xs text-muted-foreground">3</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onNavigate?.('screener'))}>
            <Filter className="mr-2 h-4 w-4" />
            <span>Screener</span>
            <span className="ml-auto text-xs text-muted-foreground">4</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Actions */}
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => handleSelect(() => onAction?.('compose'))}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Compose Email</span>
            <span className="ml-auto text-xs text-muted-foreground">C</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onAction?.('reply'))}>
            <Reply className="mr-2 h-4 w-4" />
            <span>Reply</span>
            <span className="ml-auto text-xs text-muted-foreground">R</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onAction?.('forward'))}>
            <Forward className="mr-2 h-4 w-4" />
            <span>Forward</span>
            <span className="ml-auto text-xs text-muted-foreground">F</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onAction?.('reply_later'))}>
            <Clock className="mr-2 h-4 w-4" />
            <span>Reply Later</span>
            <span className="ml-auto text-xs text-muted-foreground">L</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onAction?.('set_aside'))}>
            <Package className="mr-2 h-4 w-4" />
            <span>Set Aside</span>
            <span className="ml-auto text-xs text-muted-foreground">S</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onAction?.('star'))}>
            <Star className="mr-2 h-4 w-4" />
            <span>Toggle Star</span>
            <span className="ml-auto text-xs text-muted-foreground">*</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onAction?.('archive'))}>
            <Archive className="mr-2 h-4 w-4" />
            <span>Archive</span>
            <span className="ml-auto text-xs text-muted-foreground">E</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onAction?.('delete'))}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
            <span className="ml-auto text-xs text-muted-foreground">#</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Tools */}
        <CommandGroup heading="Tools">
          <CommandItem onSelect={() => handleSelect(() => onAction?.('search'))}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search Emails</span>
            <span className="ml-auto text-xs text-muted-foreground">/</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onNavigate?.('calendar'))}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onNavigate?.('contacts'))}>
            <User className="mr-2 h-4 w-4" />
            <span>Contacts</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onNavigate?.('settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>

        {/* Search Results (if query is present) */}
        {searchQuery && searchQuery.length > 2 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Search Results">
              <CommandItem onSelect={() => handleSelect(() => onSearch?.(searchQuery))}>
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Search for "{searchQuery}"</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}


