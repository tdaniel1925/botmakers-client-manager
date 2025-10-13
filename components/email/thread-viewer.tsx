/**
 * Thread Viewer Component
 * Displays full email thread with AI summary
 */

// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Star, Sparkles, Reply, Forward, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { analyzeThread } from '@/lib/ai-thread-analyzer';
import type { SelectEmail } from '@/db/schema/email-schema';

interface ThreadViewerProps {
  emails: SelectEmail[];
  onReply?: (email: SelectEmail) => void;
  onForward?: (email: SelectEmail) => void;
}

export function ThreadViewer({ emails, onReply, onForward }: ThreadViewerProps) {
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set([emails[0]?.id]));
  const [threadSummary, setThreadSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    loadThreadSummary();
  }, [emails]);

  async function loadThreadSummary() {
    if (emails.length <= 1) return;

    setLoadingSummary(true);
    try {
      const summary = await analyzeThread(emails);
      setThreadSummary(summary.summary);
    } catch (error) {
      console.error('Error loading thread summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  }

  const toggleEmail = (emailId: string) => {
    const newExpanded = new Set(expandedEmails);
    if (newExpanded.has(emailId)) {
      newExpanded.delete(emailId);
    } else {
      newExpanded.add(emailId);
    }
    setExpandedEmails(newExpanded);
  };

  const expandAll = () => {
    setExpandedEmails(new Set(emails.map((e) => e.id)));
  };

  const collapseAll = () => {
    setExpandedEmails(new Set([emails[0]?.id]));
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Thread Header */}
      <div className="border-b px-6 py-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-1">{emails[0]?.subject}</h2>
            <p className="text-sm text-muted-foreground">
              {emails.length} message{emails.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>

        {/* AI Thread Summary */}
        {emails.length > 1 && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Thread Summary
            </div>
            
            {loadingSummary ? (
              <div className="space-y-2">
                <div className="h-3 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded w-5/6" />
              </div>
            ) : threadSummary ? (
              <p className="text-sm text-foreground leading-relaxed">{threadSummary}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No summary available</p>
            )}
          </div>
        )}
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {emails.map((email, index) => {
          const isExpanded = expandedEmails.has(email.id);
          const from = typeof email.fromAddress === 'object'
            ? {
                name: email.fromAddress.name || email.fromAddress.email,
                email: email.fromAddress.email,
              }
            : {
                name: email.fromAddress || 'Unknown',
                email: email.fromAddress || '',
              };

          return (
            <div
              key={email.id}
              className={`border-b ${isExpanded ? 'bg-background' : 'bg-muted/20'}`}
            >
              {/* Email Header */}
              <button
                onClick={() => toggleEmail(email.id)}
                className="w-full px-6 py-4 flex items-start gap-3 hover:bg-muted/30 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold truncate">{from.name}</span>
                      {email.isStarred && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {email.receivedAt
                        ? formatDistanceToNow(new Date(email.receivedAt), { addSuffix: true })
                        : ''}
                    </span>
                  </div>

                  {!isExpanded && (
                    <p className="text-sm text-muted-foreground truncate">
                      {email.snippet || email.body?.substring(0, 100)}
                    </p>
                  )}
                </div>
              </button>

              {/* Email Body (when expanded) */}
              {isExpanded && (
                <div className="px-6 pb-6 space-y-4">
                  {/* Recipients */}
                  <div className="text-sm space-y-1">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-16">From:</span>
                      <span>{from.name} &lt;{from.email}&gt;</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-16">To:</span>
                      <span>
                        {typeof email.toAddresses === 'object' && Array.isArray(email.toAddresses)
                          ? email.toAddresses.map((addr: any) => addr.email || addr).join(', ')
                          : email.toAddresses || 'Unknown'}
                      </span>
                    </div>
                    {email.ccAddresses && (
                      <div className="flex gap-2">
                        <span className="text-muted-foreground w-16">Cc:</span>
                        <span>
                          {typeof email.ccAddresses === 'object' && Array.isArray(email.ccAddresses)
                            ? email.ccAddresses.map((addr: any) => addr.email || addr).join(', ')
                            : email.ccAddresses}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="prose prose-sm max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: email.body || email.snippet || 'No content',
                      }}
                    />
                  </div>

                  {/* Attachments */}
                  {email.hasAttachments && (
                    <div className="border rounded-lg p-3 space-y-2">
                      <span className="text-sm font-semibold">Attachments</span>
                      <div className="text-sm text-muted-foreground">
                        {email.attachmentCount || 0} file(s)
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReply?.(email)}
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onForward?.(email)}
                    >
                      <Forward className="h-4 w-4 mr-2" />
                      Forward
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}






