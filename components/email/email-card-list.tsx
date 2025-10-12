/**
 * Email Card List Component
 * Middle panel displaying email cards in 2-line format with hover AI summaries
 */

'use client';

import { useState, useEffect } from 'react';
import { EmailCard } from './email-card';
import { Search, Filter, CheckSquare, Star, Paperclip, Calendar } from 'lucide-react';
import type { SelectEmail } from '@/db/schema/email-schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getThreadCountsAction } from '@/actions/email-operations-actions';
import { useEmailPrefetch } from '@/hooks/use-email-prefetch';
import { searchEmails, parseSearchQuery, highlightSearchTerm, type SearchFilters } from '@/lib/email-search';
import { 
  bulkMarkAsReadAction, 
  bulkStarAction, 
  bulkArchiveAction, 
  bulkTrashAction, 
  bulkDeleteAction 
} from '@/actions/bulk-email-actions';
import { useToast } from '@/components/ui/use-toast';

interface EmailCardListProps {
  emails: SelectEmail[];
  selectedEmail: SelectEmail | null;
  onEmailSelect: (email: SelectEmail) => void;
  loading: boolean;
  folder: string;
  accountId?: string;
  onComposeWithDraft?: (draft: {
    to?: string;
    subject?: string;
    body?: string;
    replyTo?: any;
  }) => void;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  hasMore?: boolean;
}

export function EmailCardList({
  emails,
  selectedEmail,
  onEmailSelect,
  loading,
  folder,
  accountId,
  onComposeWithDraft,
  onLoadMore,
  loadingMore = false,
  hasMore = false,
}: EmailCardListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [threadCounts, setThreadCounts] = useState<Record<string, number>>({});
  const [activePopupEmailId, setActivePopupEmailId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  const { toast } = useToast();

  // Initialize prefetch hook for instant AI data loading
  const { registerEmailCard, prefetchEmail } = useEmailPrefetch(emails, true);

  // Filter emails by folder AND search query with advanced filters (client-side - instant!)
  const filterStartTime = performance.now();
  
  // First filter by folder
  let folderFiltered = emails.filter((email) => {
    const emailFolderName = email.folderName || '';
    
    // System folders are identified by uppercase constants
    if (folder === 'INBOX') {
      return emailFolderName.toUpperCase() === 'INBOX' || 
        (!emailFolderName && !email.isArchived && !email.isTrash && !email.isSent && !email.isDraft);
    } else if (folder === 'SENT') {
      return emailFolderName.toUpperCase() === 'SENT' || email.isSent === true;
    } else if (folder === 'DRAFTS') {
      return emailFolderName.toUpperCase() === 'DRAFTS' || email.isDraft === true;
    } else if (folder === 'STARRED') {
      return email.isStarred === true;
    } else if (folder === 'ARCHIVE') {
      return emailFolderName.toUpperCase() === 'ARCHIVE' || email.isArchived === true;
    } else if (folder === 'TRASH') {
      return emailFolderName.toUpperCase() === 'TRASH' || email.isTrash === true;
    } else if (folder === 'SPAM') {
      return emailFolderName.toUpperCase() === 'SPAM' || email.isSpam === true;
    } else {
      return emailFolderName === folder;
    }
  });

  // Then apply search with advanced filters
  let filteredEmails = folderFiltered;
  if (searchQuery || Object.keys(searchFilters).length > 0) {
    const { text, filters: parsedFilters } = parseSearchQuery(searchQuery);
    const combinedFilters = { ...searchFilters, ...parsedFilters };
    
    filteredEmails = searchEmails(folderFiltered, {
      query: text,
      filters: combinedFilters,
      includeBody: true, // Full-text search including body
      caseSensitive: false,
    });
  }
  
  const filterTime = performance.now() - filterStartTime;
  console.log(`⚡ Filtered ${emails.length} emails to ${filteredEmails.length} for folder "${folder}" in ${filterTime.toFixed(2)}ms`);
  
  // Debug: Show sample of filtered emails
  if (filteredEmails.length > 0 && filteredEmails.length <= 3) {
    console.log('Filtered emails:', filteredEmails.map(e => ({
      subject: e.subject,
      folderName: e.folderName,
      isSent: e.isSent,
      isDraft: e.isDraft
    })));
  }

  // Load thread counts for emails with threadId
  useEffect(() => {
    if (!accountId || filteredEmails.length === 0) return;

    const threadsToCount = filteredEmails
      .filter(e => e.threadId)
      .map(e => e.threadId!)
      .filter((id, index, arr) => arr.indexOf(id) === index); // unique

    if (threadsToCount.length === 0) return;

    getThreadCountsAction(accountId, threadsToCount)
      .then(result => {
        if (result.success && result.data) {
          setThreadCounts(result.data);
        }
      })
      .catch(error => {
        console.error('Error loading thread counts:', error);
      });
  }, [accountId, filteredEmails.length]);

  // Infinite scroll: Load more emails when scrolling near bottom
  useEffect(() => {
    if (!onLoadMore || !hasMore || loadingMore) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const scrollHeight = target.scrollHeight;
      const scrollTop = target.scrollTop;
      const clientHeight = target.clientHeight;

      // Trigger load when within 300px of bottom
      if (scrollHeight - scrollTop - clientHeight < 300) {
        onLoadMore();
      }
    };

    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [onLoadMore, hasMore, loadingMore]);

  const handleSelectEmail = (emailId: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(emailId)) {
      newSelected.delete(emailId);
    } else {
      newSelected.add(emailId);
    }
    setSelectedEmails(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEmails.size === filteredEmails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(filteredEmails.map((e) => e.id)));
    }
  };

  const handleBulkMarkRead = async () => {
    setBulkActionLoading(true);
    const emailIds = Array.from(selectedEmails);
    const result = await bulkMarkAsReadAction(emailIds, true);
    
    if (result.success) {
      toast({
        title: 'Marked as Read',
        description: `${result.updatedCount} email${result.updatedCount > 1 ? 's' : ''} marked as read`,
      });
      setSelectedEmails(new Set());
      window.location.reload(); // Refresh to show changes
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to mark emails as read',
        variant: 'destructive',
      });
    }
    setBulkActionLoading(false);
  };

  const handleBulkMarkUnread = async () => {
    setBulkActionLoading(true);
    const emailIds = Array.from(selectedEmails);
    const result = await bulkMarkAsReadAction(emailIds, false);
    
    if (result.success) {
      toast({
        title: 'Marked as Unread',
        description: `${result.updatedCount} email${result.updatedCount > 1 ? 's' : ''} marked as unread`,
      });
      setSelectedEmails(new Set());
      window.location.reload();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to mark emails as unread',
        variant: 'destructive',
      });
    }
    setBulkActionLoading(false);
  };

  const handleBulkStar = async () => {
    setBulkActionLoading(true);
    const emailIds = Array.from(selectedEmails);
    const result = await bulkStarAction(emailIds, true);
    
    if (result.success) {
      toast({
        title: 'Starred',
        description: `${result.updatedCount} email${result.updatedCount > 1 ? 's' : ''} starred`,
      });
      setSelectedEmails(new Set());
      window.location.reload();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to star emails',
        variant: 'destructive',
      });
    }
    setBulkActionLoading(false);
  };

  const handleBulkArchive = async () => {
    setBulkActionLoading(true);
    const emailIds = Array.from(selectedEmails);
    const result = await bulkArchiveAction(emailIds);
    
    if (result.success) {
      toast({
        title: 'Archived',
        description: `${result.updatedCount} email${result.updatedCount > 1 ? 's' : ''} archived`,
      });
      setSelectedEmails(new Set());
      window.location.reload();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to archive emails',
        variant: 'destructive',
      });
    }
    setBulkActionLoading(false);
  };

  const handleBulkTrash = async () => {
    if (!confirm(`Move ${selectedEmails.size} email${selectedEmails.size > 1 ? 's' : ''} to trash?`)) {
      return;
    }

    setBulkActionLoading(true);
    const emailIds = Array.from(selectedEmails);
    const result = await bulkTrashAction(emailIds);
    
    if (result.success) {
      toast({
        title: 'Moved to Trash',
        description: `${result.updatedCount} email${result.updatedCount > 1 ? 's' : ''} moved to trash`,
      });
      setSelectedEmails(new Set());
      window.location.reload();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to move emails to trash',
        variant: 'destructive',
      });
    }
    setBulkActionLoading(false);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Permanently delete ${selectedEmails.size} email${selectedEmails.size > 1 ? 's' : ''}? This cannot be undone.`)) {
      return;
    }

    setBulkActionLoading(true);
    const emailIds = Array.from(selectedEmails);
    const result = await bulkDeleteAction(emailIds);
    
    if (result.success) {
      toast({
        title: 'Deleted',
        description: `${result.updatedCount} email${result.updatedCount > 1 ? 's' : ''} permanently deleted`,
      });
      setSelectedEmails(new Set());
      window.location.reload();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete emails',
        variant: 'destructive',
      });
    }
    setBulkActionLoading(false);
  };

  const getFolderTitle = () => {
    const titles: Record<string, string> = {
      INBOX: 'Inbox',
      SENT: 'Sent',
      DRAFTS: 'Drafts',
      STARRED: 'Starred',
      ARCHIVE: 'Archive',
      TRASH: 'Trash',
    };
    return titles[folder] || folder;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0 overflow-hidden">
      {/* Header */}
      <div className="border-b px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {getFolderTitle()} ({filteredEmails.length})
          </h2>

          <div className="flex items-center gap-2">
            <Button
              variant={bulkMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setBulkMode(!bulkMode);
                setSelectedEmails(new Set());
              }}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Select
            </Button>

            <Button 
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {Object.keys(searchFilters).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(searchFilters).length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search emails (supports: from:, to:, has:attachments, is:starred)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Chips */}
        {showFilters && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={searchFilters.hasAttachments ? 'default' : 'outline'}
              onClick={() => setSearchFilters(prev => ({
                ...prev,
                hasAttachments: !prev.hasAttachments ? true : undefined
              }))}
              className="gap-1"
            >
              <Paperclip className="h-3 w-3" />
              Has Attachments
            </Button>
            
            <Button
              size="sm"
              variant={searchFilters.isStarred ? 'default' : 'outline'}
              onClick={() => setSearchFilters(prev => ({
                ...prev,
                isStarred: !prev.isStarred ? true : undefined
              }))}
              className="gap-1"
            >
              <Star className="h-3 w-3" />
              Starred
            </Button>
            
            <Button
              size="sm"
              variant={searchFilters.isUnread ? 'default' : 'outline'}
              onClick={() => setSearchFilters(prev => ({
                ...prev,
                isUnread: !prev.isUnread ? true : undefined
              }))}
              className="gap-1"
            >
              Unread
            </Button>

            {Object.keys(searchFilters).length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSearchFilters({})}
                className="text-muted-foreground"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Bulk Actions Bar */}
        {bulkMode && selectedEmails.size > 0 && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md flex-wrap">
            <span className="text-sm font-medium">{selectedEmails.size} selected</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBulkMarkRead}
              disabled={bulkActionLoading}
            >
              Mark Read
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBulkMarkUnread}
              disabled={bulkActionLoading}
            >
              Mark Unread
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBulkStar}
              disabled={bulkActionLoading}
            >
              Star
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBulkArchive}
              disabled={bulkActionLoading}
            >
              Archive
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBulkTrash}
              disabled={bulkActionLoading}
              className="text-orange-600"
            >
              Trash
            </Button>
            {folder === 'TRASH' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="text-red-600"
              >
                Delete Forever
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Email Cards - Use virtual scrolling for large lists (>200 emails) */}
      <div className="flex-1 overflow-y-auto">
        {filteredEmails.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg font-medium">No emails found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery 
                  ? 'Try a different search query'
                  : 'Your inbox is empty'
                }
              </p>
            </div>
          </div>
        ) : (
          // Email list with infinite scroll (Gmail-style pagination)
          <div className="divide-y min-w-0">
            {bulkMode && (
              <div className="sticky top-0 bg-background border-b px-4 py-2 flex items-center gap-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedEmails.size === filteredEmails.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-muted-foreground">Select all</span>
              </div>
            )}

            {filteredEmails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                isSelected={selectedEmail?.id === email.id}
                isBulkSelected={selectedEmails.has(email.id)}
                threadCount={email.threadId ? threadCounts[email.threadId] : undefined}
                bulkMode={bulkMode}
                onSelect={() => onEmailSelect(email)}
                onBulkSelect={() => handleSelectEmail(email.id)}
                isPopupActive={activePopupEmailId === email.id}
                onPopupOpen={() => {
                  setActivePopupEmailId(email.id);
                  // Prefetch immediately when popup opens
                  prefetchEmail(email);
                }}
                onPopupClose={() => setActivePopupEmailId(null)}
                onEmailSelect={(emailId) => {
                  const targetEmail = emails.find(e => e.id === emailId);
                  if (targetEmail) {
                    onEmailSelect(targetEmail);
                    setActivePopupEmailId(null); // Close popup after selecting
                  }
                }}
                onComposeWithDraft={onComposeWithDraft}
                registerForPrefetch={registerEmailCard}
              />
            ))}
            
            {/* Infinite scroll loading indicator */}
            {loadingMore && (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading more emails...</p>
              </div>
            )}
            
            {/* Load More button (backup if scroll doesn't trigger) */}
            {hasMore && !loadingMore && filteredEmails.length > 0 && (
              <div className="p-4 text-center border-t">
                <Button
                  onClick={onLoadMore}
                  variant="outline"
                  className="w-full"
                >
                  Load More Emails
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Showing {filteredEmails.length} emails
                </p>
              </div>
            )}
            
            {/* No more emails indicator */}
            {!hasMore && filteredEmails.length > 0 && (
              <div className="p-4 text-center border-t">
                <p className="text-sm text-muted-foreground">
                  ✓ All emails loaded ({filteredEmails.length} total)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}




