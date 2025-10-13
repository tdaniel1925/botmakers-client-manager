/**
 * Imbox View - Important mail only
 */

// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { useState, useEffect } from 'react';
import { EmailCard } from './email-card';
import { EmailViewer } from './email-viewer';
import { EmailSearchBar } from './email-search-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Inbox, RefreshCw, Sparkles } from 'lucide-react';
import type { SelectEmail } from '@/db/schema/email-schema';

interface ImboxViewProps {
  emails: SelectEmail[];
  selectedEmail: SelectEmail | null;
  onEmailClick: (email: SelectEmail) => void;
  onRefresh?: () => void;
  activePopupEmailId?: string | null;
  onPopupOpen?: (emailId: string) => void;
  onPopupClose?: () => void;
  onComposeWithDraft?: (draft: any) => void;
  registerForPrefetch?: (emailId: string, element: Element | null) => void;
}

export function ImboxView({
  emails,
  selectedEmail,
  onEmailClick,
  onRefresh,
  activePopupEmailId,
  onPopupOpen,
  onPopupClose,
  onComposeWithDraft,
  registerForPrefetch,
}: ImboxViewProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter to Imbox emails only
  const imboxEmails = emails.filter(email => {
    const isImbox = email.heyView === 'imbox';
    if (isImbox) {
      console.log('✅ Email in Imbox:', {
        subject: email.subject,
        from: email.fromAddress,
        heyView: email.heyView,
        screeningStatus: email.screeningStatus
      });
    }
    return isImbox;
  });

  console.log(`📥 Imbox View: Showing ${imboxEmails.length} of ${emails.length} total emails`);

  // Apply unread filter
  let filteredEmails = filter === 'unread' 
    ? imboxEmails.filter(e => !e.isRead)
    : imboxEmails;

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredEmails = filteredEmails.filter(email => {
      const subject = email.subject?.toLowerCase() || '';
      const from = typeof email.fromAddress === 'string' 
        ? email.fromAddress.toLowerCase()
        : email.fromAddress?.email?.toLowerCase() || '';
      const bodyText = email.bodyText?.toLowerCase() || '';
      
      return subject.includes(query) || from.includes(query) || bodyText.includes(query);
    });
  }

  const unreadCount = imboxEmails.filter(e => !e.isRead).length;

  // Show EmailViewer if an email is selected
  if (selectedEmail) {
    const currentIndex = imboxEmails.findIndex(e => e.id === selectedEmail.id);
    return (
      <div className="h-full flex flex-col">
        {/* Email Viewer */}
        <div className="flex-1 overflow-auto">
          <EmailViewer
            email={selectedEmail}
            onClose={() => onEmailClick(null as any)}
            emails={imboxEmails}
            currentIndex={currentIndex}
            onNavigate={onEmailClick}
            onCompose={onComposeWithDraft}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter Tabs & Search - Compact */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          {/* Left: Filter Tabs */}
          <div className="flex gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'ghost'}
              onClick={() => setFilter('all')}
              className="rounded-full text-xs h-7"
            >
              All ({imboxEmails.length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'unread' ? 'default' : 'ghost'}
              onClick={() => setFilter('unread')}
              className="rounded-full text-xs h-7"
            >
              Unread ({unreadCount})
            </Button>
          </div>
          
          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md">
            <EmailSearchBar
              onSearchChange={setSearchQuery}
              placeholder="Search..."
            />
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {filter === 'unread' ? 'All caught up!' : 'Your Imbox is empty'}
              </h3>
              <p className="text-muted-foreground">
                {filter === 'unread' 
                  ? 'No unread messages. Great work!' 
                  : 'Important emails will appear here'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredEmails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                isSelected={selectedEmail?.id === email.id}
                isBulkSelected={false}
                bulkMode={false}
                onSelect={() => onEmailClick(email)}
                onBulkSelect={() => {}}
                isPopupActive={activePopupEmailId === email.id}
                onPopupOpen={() => onPopupOpen?.(email.id)}
                onPopupClose={onPopupClose}
                onComposeWithDraft={onComposeWithDraft}
                registerForPrefetch={registerForPrefetch}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

