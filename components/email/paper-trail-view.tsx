/**
 * Paper Trail View - Receipts, confirmations, searchable archive
 */

'use client';

import { useState } from 'react';
import { EmailCard } from './email-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Receipt, Search, RefreshCw, FileText } from 'lucide-react';
import type { SelectEmail } from '@/db/schema/email-schema';

interface PaperTrailViewProps {
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

export function PaperTrailView({
  emails,
  selectedEmail,
  onEmailClick,
  onRefresh,
  activePopupEmailId,
  onPopupOpen,
  onPopupClose,
  onComposeWithDraft,
  registerForPrefetch,
}: PaperTrailViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'receipt' | 'confirmation'>('all');

  // Filter to Paper Trail emails only
  const paperTrailEmails = emails.filter(email => email.heyView === 'paper_trail');

  // Apply search and category filters
  const filteredEmails = paperTrailEmails.filter(email => {
    const matchesSearch = !searchQuery || 
      email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.bodyText?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
      email.heyCategory === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const receiptCount = paperTrailEmails.filter(e => e.heyCategory === 'receipt').length;
  const confirmationCount = paperTrailEmails.filter(e => e.heyCategory === 'confirmation').length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Paper Trail</h2>
              <p className="text-xs text-muted-foreground">
                Receipts, confirmations, and transactions
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-semibold">
              {paperTrailEmails.length} total
            </Badge>
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

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search receipts, invoices, confirmations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-1 px-4 pb-3">
          <Button
            size="sm"
            variant={categoryFilter === 'all' ? 'default' : 'ghost'}
            onClick={() => setCategoryFilter('all')}
            className="rounded-full"
          >
            All ({paperTrailEmails.length})
          </Button>
          <Button
            size="sm"
            variant={categoryFilter === 'receipt' ? 'default' : 'ghost'}
            onClick={() => setCategoryFilter('receipt')}
            className="rounded-full"
          >
            <Receipt className="mr-1 h-3 w-3" />
            Receipts ({receiptCount})
          </Button>
          <Button
            size="sm"
            variant={categoryFilter === 'confirmation' ? 'default' : 'ghost'}
            onClick={() => setCategoryFilter('confirmation')}
            className="rounded-full"
          >
            <FileText className="mr-1 h-3 w-3" />
            Confirmations ({confirmationCount})
          </Button>
        </div>
      </div>

      {/* Email List - Compact for scanning */}
      <div className="flex-1 overflow-y-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                {searchQuery ? (
                  <Search className="h-8 w-8 text-gray-600" />
                ) : (
                  <Receipt className="h-8 w-8 text-gray-600" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No results found' : 'Your Paper Trail is empty'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No matches for "${searchQuery}"`
                  : 'Receipts and confirmations will appear here'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-4"
                >
                  Clear search
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredEmails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                isSelected={selectedEmail?.id === email.id}
                onClick={() => onEmailClick(email)}
                showPopup={activePopupEmailId === email.id}
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

