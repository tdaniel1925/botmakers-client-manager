/**
 * Email Card Component
 * 2-line card format with hover AI summary popup
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Star, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { EmailSummaryPopup } from './email-summary-popup';
import type { SelectEmail } from '@/db/schema/email-schema';

interface EmailCardProps {
  email: SelectEmail;
  isSelected: boolean;
  isBulkSelected: boolean;
  bulkMode: boolean;
  onSelect: () => void;
  onBulkSelect: () => void;
}

export function EmailCard({
  email,
  isSelected,
  isBulkSelected,
  bulkMode,
  onSelect,
  onBulkSelect,
}: EmailCardProps) {
  const [showSummary, setShowSummary] = useState(false);
  const [summaryPosition, setSummaryPosition] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Get sender info
  const from = typeof email.fromAddress === 'object'
    ? {
        name: email.fromAddress.name || email.fromAddress.email,
        email: email.fromAddress.email,
      }
    : {
        name: email.fromAddress || 'Unknown',
        email: email.fromAddress || '',
      };

  // Format date
  const formattedDate = email.receivedAt
    ? formatDistanceToNow(new Date(email.receivedAt), { addSuffix: true })
    : '';

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (bulkMode) return;

    // Delay showing summary by 800ms
    hoverTimeoutRef.current = setTimeout(() => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) {
        setSummaryPosition({
          x: rect.right + 10,
          y: rect.top,
        });
        setShowSummary(true);
      }
    }, 800);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowSummary(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
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
        className={`px-4 py-3 cursor-pointer transition-colors relative ${
          isSelected
            ? 'bg-accent'
            : email.isRead
            ? 'bg-background hover:bg-muted/50'
            : 'bg-blue-50/30 hover:bg-blue-50/50'
        }`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-start gap-3">
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
            {/* Line 1: Sender + Time */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className={`truncate ${
                  email.isRead ? 'font-normal' : 'font-semibold'
                }`}>
                  {from.name}
                </span>
                
                {email.isStarred && (
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                )}
                
                {email.hasAttachments && (
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                )}

                {email.priority === 'urgent' && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">
                    URGENT
                  </span>
                )}
              </div>

              <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                {formattedDate}
              </span>
            </div>

            {/* Line 2: Subject */}
            <div className="flex items-start gap-2">
              <p className={`text-sm truncate ${
                email.isRead ? 'text-muted-foreground' : 'text-foreground'
              }`}>
                {email.subject || '(No Subject)'}
              </p>
            </div>

            {/* Snippet (optional, when enough space) */}
            {email.snippet && (
              <p className="text-xs text-muted-foreground truncate mt-1">
                {email.snippet}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* AI Summary Popup */}
      {showSummary && !bulkMode && (
        <EmailSummaryPopup
          email={email}
          position={summaryPosition}
          onClose={() => setShowSummary(false)}
        />
      )}
    </>
  );
}

