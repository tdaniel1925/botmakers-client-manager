/**
 * Email Card Component
 * Expandable card with thread indicators and AI summary popup on hover
 */

// @ts-nocheck - Temporary: TypeScript has issues with JSX conditional type inference
// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { useState, useRef, useEffect } from 'react';
import { Star, Paperclip, MessageSquare, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { EmailSummaryPopup } from './email-summary-popup';
import type { SelectEmail } from '@/db/schema/email-schema';

interface EmailCardProps {
  email: SelectEmail;
  isSelected: boolean;
  isBulkSelected: boolean;
  threadCount?: number;
  bulkMode: boolean;
  onSelect: () => void;
  onBulkSelect: () => void;
  isPopupActive?: boolean;
  onPopupOpen?: () => void;
  onPopupClose?: () => void;
  onEmailSelect?: (emailId: string) => void;
  onComposeWithDraft?: (draft: {
    to?: string;
    subject?: string;
    body?: string;
    replyTo?: any;
  }) => void;
  registerForPrefetch?: (emailId: string, element: Element | null) => void;
}

export function EmailCard({
  email,
  isSelected,
  isBulkSelected,
  threadCount,
  bulkMode,
  onSelect,
  onBulkSelect,
  isPopupActive = false,
  onPopupOpen,
  onPopupClose,
  onEmailSelect,
  onComposeWithDraft,
  registerForPrefetch,
}: EmailCardProps) {
  const [summaryPosition, setSummaryPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const aiButtonRef = useRef<HTMLButtonElement>(null);
  
  // Use controlled popup state from parent
  const showSummary = isPopupActive;

  // Register for prefetching when card mounts
  useEffect(() => {
    if (registerForPrefetch && cardRef.current) {
      cardRef.current.setAttribute('data-email-id', email.id as string);
      registerForPrefetch(email.id as string, cardRef.current);
    }
  }, [email.id, registerForPrefetch]);

  // Get sender info
  const from = typeof email.fromAddress === 'object' && email.fromAddress
    ? {
        name: (email.fromAddress as any).name || (email.fromAddress as any).email,
        email: (email.fromAddress as any).email,
      }
    : {
        name: (email.fromAddress as string) || 'Unknown',
        email: (email.fromAddress as string) || '',
      };

  // Format To addresses
  const formatAddresses = (addresses: any): string => {
    if (!addresses) return '';
    
    if (typeof addresses === 'string') return addresses;
    
    if (Array.isArray(addresses)) {
      return addresses
        .map(addr => {
          if (typeof addr === 'string') return addr;
          if (typeof addr === 'object' && addr.email) {
            return addr.name ? `${addr.name} <${addr.email}>` : addr.email;
          }
          return '';
        })
        .filter(Boolean)
        .join(', ');
    }
    
    if (typeof addresses === 'object' && addresses.email) {
      return addresses.name ? `${addresses.name} <${addresses.email}>` : addresses.email;
    }
    
    return '';
  };

  // Format date
  const formattedDate = email.receivedAt
    ? formatDistanceToNow(new Date(email.receivedAt as any), { addSuffix: true })
    : '';

  // Thread indicator
  const threadIndicator = (threadCount && threadCount > 1) ? (
    <div className="flex items-center gap-1 text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded flex-shrink-0">
      <MessageSquare className="h-3 w-3" />
      <span>{String(threadCount)}</span>
    </div>
  ) : null;

  // Sender name
  const senderName = <span className="truncate">{String(from.name)}</span>;

  const handleAIButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent email selection
    
    if (bulkMode) return;
    
    const buttonRect = aiButtonRef.current?.getBoundingClientRect();
    if (buttonRect) {
      const popupWidth = window.innerWidth < 768 ? 360 : 450;
      const popupHeight = 550;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const VIEWPORT_PADDING = 20;
      
      // Center popup horizontally on screen
      let x = (viewportWidth - popupWidth) / 2;
      
      // Position vertically - try below button first
      let y = buttonRect.bottom + 10;
      
      // Check if popup would go off screen below
      if (y + popupHeight + VIEWPORT_PADDING > viewportHeight) {
        // Position above button instead
        y = buttonRect.top - popupHeight - 10;
        
        // If still off screen, center vertically
        if (y < VIEWPORT_PADDING) {
          y = (viewportHeight - popupHeight) / 2;
        }
      }
      
      // Final safety check - ensure within bounds
      x = Math.max(VIEWPORT_PADDING, Math.min(x, viewportWidth - popupWidth - VIEWPORT_PADDING));
      y = Math.max(VIEWPORT_PADDING, Math.min(y, viewportHeight - popupHeight - VIEWPORT_PADDING));
      
      setSummaryPosition({ x, y });
      onPopupOpen?.();
    }
  };

  // AI Summary button (defined after handleAIButtonClick)
  const aiButton = !bulkMode ? (
    <button
      ref={aiButtonRef as any}
      onClick={handleAIButtonClick}
      className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-semibold bg-transparent border border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
      title="AI Summary"
    >
      <Sparkles className="h-2.5 w-2.5" />
      <span>AI</span>
    </button>
  ) : null;

  // Star icon
  const starIcon = email.isStarred ? (
    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
  ) : null;

  // Attachment icon
  const attachmentIcon = email.hasAttachments ? (
    <Paperclip className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
  ) : null;

  // Urgent badge
  const urgentBadge = email.priority === 'urgent' ? (
    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">
      URGENT
    </span>
  ) : null;

  const handleCardClick = () => {
    if (bulkMode) {
      onBulkSelect();
    } else {
      onSelect();
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`border-b transition-colors relative ${
          isSelected
            ? 'bg-accent'
            : email.isRead
            ? 'bg-background hover:bg-muted/50'
            : 'bg-blue-50/30 hover:bg-blue-50/50'
        }`}
      >
        <div
          className="px-4 py-3 cursor-pointer"
          onClick={handleCardClick}
        >
          <div className="flex items-start gap-3 min-w-0">
            {/* Checkbox (bulk mode) */}
            {bulkMode && (
              <input
                type="checkbox"
                checked={isBulkSelected}
                onChange={onBulkSelect}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
            )}

            {/* Unread indicator */}
            {!email.isRead && (
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
            )}

            {/* Email content */}
            <div className="flex-1 min-w-0">
              {/* Line 1: Sender + Time + Thread Badge */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {threadIndicator}
                  {senderName}
                  {aiButton}
                  {starIcon}
                  {attachmentIcon}
                  {urgentBadge}
                </div>

                <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                  {formattedDate}
                </span>
              </div>

              {/* Line 2: Subject */}
              <div className="flex items-start gap-2 min-w-0">
                <p className={`text-sm truncate flex-1 ${
                  email.isRead ? 'text-muted-foreground' : 'text-foreground font-medium'
                }`}>
                  {email.subject || '(No Subject)'}
                </p>
              </div>

              {/* Snippet */}
              {email.snippet && (
                <p className="text-xs text-muted-foreground truncate mt-1 max-w-full overflow-hidden">
                  {email.snippet}
                </p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* AI Summary Popup */}
      {showSummary && !bulkMode && (
        <EmailSummaryPopup
          email={email}
          position={summaryPosition}
          onClose={() => onPopupClose?.()}
          onEmailSelect={onEmailSelect}
          onComposeWithDraft={onComposeWithDraft}
        />
      )}
    </>
  );
}
