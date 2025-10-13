/**
 * Feed View - Newsletters & bulk reading mode
 */

// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { useState } from 'react';
import { EmailCard } from './email-card';
import { EmailViewer } from './email-viewer';
import { EmailSearchBar } from './email-search-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Newspaper, CheckCheck, RefreshCw, Loader2 } from 'lucide-react';
import type { SelectEmail } from '@/db/schema/email-schema';
import { markAsReadAction } from '@/actions/email-operations-actions';

interface FeedViewProps {
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

export function FeedView({
  emails,
  selectedEmail,
  onEmailClick,
  onRefresh,
  activePopupEmailId,
  onPopupOpen,
  onPopupClose,
  onComposeWithDraft,
  registerForPrefetch,
}: FeedViewProps) {
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter to Feed emails only
  let feedEmails = emails.filter(email => email.heyView === 'feed');
  
  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    feedEmails = feedEmails.filter(email => {
      const subject = email.subject?.toLowerCase() || '';
      const from = typeof email.fromAddress === 'string' 
        ? email.fromAddress.toLowerCase()
        : email.fromAddress?.email?.toLowerCase() || '';
      const bodyText = email.bodyText?.toLowerCase() || '';
      
      return subject.includes(query) || from.includes(query) || bodyText.includes(query);
    });
  }
  
  const unreadCount = feedEmails.filter(e => !e.isRead).length;

  const handleMarkAllRead = async () => {
    setMarkingAllRead(true);
    const unreadEmailIds = feedEmails.filter(e => !e.isRead).map(e => e.id);
    
    // Mark all as read
    await Promise.all(
      unreadEmailIds.map(id => markAsReadAction(id, true))
    );
    
    setMarkingAllRead(false);
    onRefresh?.();
  };

  // Show EmailViewer if an email is selected
  if (selectedEmail) {
    const currentIndex = feedEmails.findIndex(e => e.id === selectedEmail.id);
    return (
      <div className="h-full flex flex-col">
        {/* Email Viewer */}
        <div className="flex-1 overflow-auto">
          <EmailViewer
            email={selectedEmail}
            onClose={() => onEmailClick(null as any)}
            emails={feedEmails}
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
      {/* Actions & Search Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md">
            <EmailSearchBar
              onSearchChange={setSearchQuery}
              placeholder="Search..."
            />
          </div>
          
          {/* Right: Mark All Read */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkAllRead}
                disabled={markingAllRead}
                className="text-xs h-7"
              >
                {markingAllRead ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3 mr-1" />
                )}
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {feedEmails.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mx-auto mb-4">
                <Newspaper className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Your Feed is empty</h3>
              <p className="text-muted-foreground">
                Newsletters and updates will appear here
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {feedEmails.map((email) => (
              <div 
                key={email.id}
                className="border rounded-lg hover:shadow-md transition-shadow overflow-hidden"
              >
                <EmailCard
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

