/**
 * Email Card List Component
 * Middle panel displaying email cards in 2-line format with hover AI summaries
 */

'use client';

import { useState } from 'react';
import { EmailCard } from './email-card';
import { Search, Filter, CheckSquare } from 'lucide-react';
import type { SelectEmail } from '@/db/schema/email-schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EmailCardListProps {
  emails: SelectEmail[];
  selectedEmail: SelectEmail | null;
  onEmailSelect: (email: SelectEmail) => void;
  loading: boolean;
  folder: string;
}

export function EmailCardList({
  emails,
  selectedEmail,
  onEmailSelect,
  loading,
  folder,
}: EmailCardListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  const filteredEmails = emails.filter((email) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const subject = email.subject?.toLowerCase() || '';
    const from = typeof email.fromAddress === 'object' 
      ? email.fromAddress.email?.toLowerCase() || ''
      : email.fromAddress?.toLowerCase() || '';

    return subject.includes(query) || from.includes(query);
  });

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
    <div className="flex-1 flex flex-col bg-background">
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
          <div className="divide-y">
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
                bulkMode={bulkMode}
                onSelect={() => onEmailSelect(email)}
                onBulkSelect={() => handleSelectEmail(email.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

