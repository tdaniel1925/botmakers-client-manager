/**
 * Instant Search Dialog - Lightning-fast email search
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  Mail,
  Paperclip,
  Star,
  Clock,
  Filter,
  X,
} from 'lucide-react';
import {
  createEmailSearchIndex,
  searchEmails,
  getEmailName,
  getEmailAddress,
  highlightMatches,
  advancedSearch,
  type SearchFilters,
} from '@/lib/instant-search';
import type { SelectEmail } from '@/db/schema/email-schema';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InstantSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emails: SelectEmail[];
  onEmailSelect: (email: SelectEmail) => void;
}

export function InstantSearchDialog({
  open,
  onOpenChange,
  emails,
  onEmailSelect,
}: InstantSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: 'all',
  });

  // Helper function - defined first so it can be used in useMemo
  const hasActiveFilters = () => {
    return (
      filters.from ||
      filters.subject ||
      filters.hasAttachment ||
      filters.isUnread !== undefined ||
      filters.isStarred ||
      filters.heyView ||
      (filters.dateRange && filters.dateRange !== 'all')
    );
  };

  // Create search index (memoized)
  const searchIndex = useMemo(() => {
    return createEmailSearchIndex(emails);
  }, [emails]);

  // Search results (instant, client-side)
  const searchResults = useMemo(() => {
    if (!query.trim() && !hasActiveFilters()) {
      return emails.slice(0, 50); // Show recent 50 if no query
    }

    if (hasActiveFilters()) {
      return advancedSearch(emails, { ...filters, query });
    }

    return searchEmails(searchIndex, query, 50).map((r) => r.email);
  }, [query, filters, searchIndex, emails]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery('');
      setShowFilters(false);
      setFilters({ dateRange: 'all' });
    }
  }, [open]);

  // Keyboard shortcut to open (/)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !open) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const clearFilters = () => {
    setFilters({ dateRange: 'all' });
  };

  const handleEmailClick = (email: SelectEmail) => {
    onEmailSelect(email);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Instant Search
            <span className="text-sm font-normal text-muted-foreground ml-2">
              {searchResults.length} results
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search emails, senders, subjects..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 text-base"
              autoFocus
            />
            {query && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-muted' : ''}
            >
              <Filter className="h-3 w-3 mr-1" />
              Filters
              {hasActiveFilters() && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Active
                </Badge>
              )}
            </Button>

            {hasActiveFilters() && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                className="text-xs"
              >
                Clear filters
              </Button>
            )}

            {/* Active filter badges */}
            {filters.isUnread && (
              <Badge variant="secondary" className="text-xs">
                Unread
              </Badge>
            )}
            {filters.hasAttachment && (
              <Badge variant="secondary" className="text-xs">
                Has attachment
              </Badge>
            )}
            {filters.heyView && (
              <Badge variant="secondary" className="text-xs">
                {filters.heyView}
              </Badge>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">From</label>
                  <Input
                    type="text"
                    placeholder="sender@example.com"
                    value={filters.from || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, from: e.target.value })
                    }
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">
                    Subject contains
                  </label>
                  <Input
                    type="text"
                    placeholder="meeting"
                    value={filters.subject || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, subject: e.target.value })
                    }
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={filters.hasAttachment ? 'default' : 'outline'}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      hasAttachment: !filters.hasAttachment,
                    })
                  }
                >
                  <Paperclip className="h-3 w-3 mr-1" />
                  Has attachment
                </Button>
                <Button
                  size="sm"
                  variant={filters.isUnread ? 'default' : 'outline'}
                  onClick={() =>
                    setFilters({ ...filters, isUnread: !filters.isUnread })
                  }
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Unread
                </Button>
                <Button
                  size="sm"
                  variant={filters.isStarred ? 'default' : 'outline'}
                  onClick={() =>
                    setFilters({ ...filters, isStarred: !filters.isStarred })
                  }
                >
                  <Star className="h-3 w-3 mr-1" />
                  Starred
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <ScrollArea className="flex-1 px-6">
          {searchResults.length === 0 ? (
            <div className="flex items-center justify-center h-full py-12">
              <div className="text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {query || hasActiveFilters()
                    ? 'No emails found'
                    : 'Start typing to search'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 py-4">
              {searchResults.map((email) => (
                <button
                  key={email.id}
                  onClick={() => handleEmailClick(email)}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="font-medium truncate flex-1">
                      {getEmailName(email.fromAddress)}
                    </div>
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(email.receivedAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>

                  <div className="text-sm font-semibold mb-1 truncate">
                    {email.customSubject || email.subject}
                  </div>

                  <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {email.snippet || email.bodyText?.slice(0, 150)}
                  </div>

                  <div className="flex items-center gap-2">
                    {!email.isRead && (
                      <Badge variant="secondary" className="text-xs">
                        Unread
                      </Badge>
                    )}
                    {email.hasAttachments && (
                      <Badge variant="outline" className="text-xs">
                        <Paperclip className="h-3 w-3 mr-1" />
                        Attachment
                      </Badge>
                    )}
                    {email.isStarred && (
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    )}
                    {email.heyView && (
                      <Badge variant="outline" className="text-xs">
                        {email.heyView}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>
              Press <kbd className="px-2 py-1 bg-background rounded border">ESC</kbd> to
              close
            </span>
            <span>
              Press <kbd className="px-2 py-1 bg-background rounded border">/</kbd> to
              search anytime
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

