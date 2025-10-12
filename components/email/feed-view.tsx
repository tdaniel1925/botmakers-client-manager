/**
 * Feed View - Newsletters & bulk reading mode
 */

'use client';

import { useState } from 'react';
import { EmailCard } from './email-card';
import { EmailViewer } from './email-viewer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Newspaper, CheckCheck, RefreshCw } from 'lucide-react';
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

  // Filter to Feed emails only
  const feedEmails = emails.filter(email => email.heyView === 'feed');
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
    return (
      <div className="h-full flex flex-col">
        {/* Back button header */}
        <div className="border-b bg-background p-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEmailClick(null as any)}
            className="gap-2"
          >
            ← Back to The Feed
          </Button>
        </div>
        
        {/* Email Viewer */}
        <div className="flex-1 overflow-auto">
          <EmailViewer
            email={selectedEmail}
            onClose={() => onEmailClick(null as any)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
              <Newspaper className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">The Feed</h2>
              <p className="text-xs text-muted-foreground">
                Newsletters, updates, and bulk mail
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <>
                <Badge variant="secondary" className="font-semibold">
                  {unreadCount} unread
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAllRead}
                  disabled={markingAllRead}
                  className="font-semibold"
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark All Read
                </Button>
              </>
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
      </div>

      {/* Email List - Larger cards for Feed */}
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

