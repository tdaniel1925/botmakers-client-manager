/**
 * Email Card List Component
 * Middle panel displaying email cards in 2-line format with hover AI summaries
 */

'use client';

import { useState, useEffect } from 'react';
import { EmailCard } from './email-card';
import { Search, Filter, CheckSquare } from 'lucide-react';
import type { SelectEmail } from '@/db/schema/email-schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getThreadCountsAction } from '@/actions/email-operations-actions';
import { useEmailPrefetch } from '@/hooks/use-email-prefetch';

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
}

export function EmailCardList({
  emails,
  selectedEmail,
  onEmailSelect,
  loading,
  folder,
  accountId,
  onComposeWithDraft,
}: EmailCardListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [threadCounts, setThreadCounts] = useState<Record<string, number>>({});
  const [activePopupEmailId, setActivePopupEmailId] = useState<string | null>(null);

  // Initialize prefetch hook for instant AI data loading
  const { registerEmailCard, prefetchEmail } = useEmailPrefetch(emails, true);

  // Filter emails by folder AND search query (client-side - instant!)
  const filterStartTime = performance.now();
  const filteredEmails = emails.filter((email) => {
    // First filter by folder
    let matchesFolder = true;
    
    // Email folderName is stored in DB (may be case-sensitive based on provider)
    const emailFolderName = email.folderName || '';
    
    // System folders are identified by uppercase constants
    if (folder === 'INBOX') {
      // Inbox: check folderName case-insensitively OR boolean flags
      matchesFolder = emailFolderName.toUpperCase() === 'INBOX' || 
        (!emailFolderName && !email.isArchived && !email.isTrash && !email.isSent && !email.isDraft);
    } else if (folder === 'SENT') {
      matchesFolder = emailFolderName.toUpperCase() === 'SENT' || email.isSent === true;
    } else if (folder === 'DRAFTS') {
      matchesFolder = emailFolderName.toUpperCase() === 'DRAFTS' || email.isDraft === true;
    } else if (folder === 'STARRED') {
      matchesFolder = email.isStarred === true;
    } else if (folder === 'ARCHIVE') {
      matchesFolder = emailFolderName.toUpperCase() === 'ARCHIVE' || email.isArchived === true;
    } else if (folder === 'TRASH') {
      matchesFolder = emailFolderName.toUpperCase() === 'TRASH' || email.isTrash === true;
    } else if (folder === 'SPAM') {
      matchesFolder = emailFolderName.toUpperCase() === 'SPAM' || email.isSpam === true;
    } else {
      // For custom folders, match by exact folder name (case-sensitive)
      // The folder parameter will be the actual folder name (e.g., "Calendar", "Contacts")
      matchesFolder = emailFolderName === folder;
    }
    
    if (!matchesFolder) return false;
    
    // Then filter by search query
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const subject = email.subject?.toLowerCase() || '';
    const from = typeof email.fromAddress === 'object' 
      ? email.fromAddress.email?.toLowerCase() || ''
      : email.fromAddress?.toLowerCase() || '';

    return subject.includes(query) || from.includes(query);
  });
  
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

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Bulk Actions Bar */}
        {bulkMode && selectedEmails.size > 0 && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <span className="text-sm font-medium">{selectedEmails.size} selected</span>
            <Button variant="ghost" size="sm">
              Mark Read
            </Button>
            <Button variant="ghost" size="sm">
              Archive
            </Button>
            <Button variant="ghost" size="sm">
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Email Cards */}
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
          </div>
        )}
      </div>
    </div>
  );
}




