/**
 * Imbox View - Important mail only
 */

'use client';

import { useState, useEffect } from 'react';
import { EmailCard } from './email-card';
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
  
  // Filter to Imbox emails only
  const imboxEmails = emails.filter(email => 
    email.heyView === 'imbox' || (!email.heyView && !email.screeningStatus)
  );

  const filteredEmails = filter === 'unread' 
    ? imboxEmails.filter(e => !e.isRead)
    : imboxEmails;

  const unreadCount = imboxEmails.filter(e => !e.isRead).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Imbox</h2>
              <p className="text-xs text-muted-foreground">
                Important mail from people you care about
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="secondary" className="font-semibold">
                {unreadCount} unread
              </Badge>
            )}
            {onRefresh && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 px-4 pb-3">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'ghost'}
            onClick={() => setFilter('all')}
            className="rounded-full"
          >
            All ({imboxEmails.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'unread' ? 'default' : 'ghost'}
            onClick={() => setFilter('unread')}
            className="rounded-full"
          >
            Unread ({unreadCount})
          </Button>
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

