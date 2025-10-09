/**
 * Virtualized Email List Component
 * High-performance list for 1000+ emails using react-window
 */

'use client';

import { useRef, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { EmailCard } from './email-card';
import type { SelectEmail } from '@/db/schema/email-schema';

interface VirtualizedEmailListProps {
  emails: SelectEmail[];
  selectedEmail: SelectEmail | null;
  onEmailSelect: (email: SelectEmail) => void;
  bulkMode: boolean;
  selectedEmails: Set<string>;
  onBulkSelect: (emailId: string) => void;
  height: number;
}

const ITEM_HEIGHT = 80; // Height of each email card in pixels

export function VirtualizedEmailList({
  emails,
  selectedEmail,
  onEmailSelect,
  bulkMode,
  selectedEmails,
  onBulkSelect,
  height,
}: VirtualizedEmailListProps) {
  const listRef = useRef<List>(null);

  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const email = emails[index];
      
      if (!email) return null;

      return (
        <div style={style}>
          <EmailCard
            email={email}
            isSelected={selectedEmail?.id === email.id}
            isBulkSelected={selectedEmails.has(email.id)}
            bulkMode={bulkMode}
            onSelect={() => onEmailSelect(email)}
            onBulkSelect={() => onBulkSelect(email.id)}
          />
        </div>
      );
    },
    [emails, selectedEmail, selectedEmails, bulkMode, onEmailSelect, onBulkSelect]
  );

  // Scroll to specific email
  const scrollToEmail = useCallback((emailId: string) => {
    const index = emails.findIndex((e) => e.id === emailId);
    if (index !== -1 && listRef.current) {
      listRef.current.scrollToItem(index, 'smart');
    }
  }, [emails]);

  return (
    <List
      ref={listRef}
      height={height}
      itemCount={emails.length}
      itemSize={ITEM_HEIGHT}
      width="100%"
      overscanCount={5} // Render 5 extra items above/below viewport
      className="email-list"
    >
      {Row}
    </List>
  );
}

