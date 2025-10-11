/**
 * Email Viewer Component
 * Displays full email content with actions
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Reply, ReplyAll, Forward, Archive, Trash2, Star, MoreVertical, Paperclip, Download, FileText, Image, File } from 'lucide-react';
import type { SelectEmail, SelectEmailAttachment } from '@/db/schema/email-schema';
import { format } from 'date-fns';
import { getEmailAttachmentsAction } from '@/actions/email-operations-actions';

interface EmailViewerProps {
  email: SelectEmail;
  onClose: () => void;
}

export function EmailViewer({ email, onClose }: EmailViewerProps) {
  const [attachments, setAttachments] = useState<SelectEmailAttachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  // Load attachments if email has them
  useEffect(() => {
    if (email.hasAttachments) {
      loadAttachments();
    }
  }, [email.id]);

  const loadAttachments = async () => {
    setLoadingAttachments(true);
    try {
      const result = await getEmailAttachmentsAction(email.id);
      if (result.success && result.data) {
        setAttachments(result.data.attachments);
      }
    } catch (error) {
      console.error('Error loading attachments:', error);
    }
    setLoadingAttachments(false);
  };

  // Format from address
  const from = typeof email.fromAddress === 'object'
    ? {
        name: email.fromAddress.name || email.fromAddress.email,
        email: email.fromAddress.email,
      }
    : {
        name: email.fromAddress || 'Unknown',
        email: email.fromAddress || '',
      };

  // Format addresses helper
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

  return (
    <div className="h-full flex flex-col bg-background flex-1 overflow-hidden">
      {/* Header with actions */}
      <div className="border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inbox
        </Button>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="Star">
            <Star className={`h-4 w-4 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" title="Archive">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="More">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-6 py-6">
          {/* Subject */}
          <h1 className="text-2xl font-bold mb-4">
            {email.subject || '(No Subject)'}
          </h1>

          {/* Email header info */}
          <div className="mb-6 space-y-3">
            {/* From */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {from.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{from.name}</div>
                    <div className="text-sm text-muted-foreground">{from.email}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {email.receivedAt && format(new Date(email.receivedAt), 'PPpp')}
                  </div>
                </div>

                {/* To */}
                {email.toAddresses && (
                  <div className="text-sm text-muted-foreground mt-2">
                    <span className="font-medium">To:</span> {formatAddresses(email.toAddresses)}
                  </div>
                )}

                {/* Cc */}
                {email.ccAddresses && formatAddresses(email.ccAddresses) && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Cc:</span> {formatAddresses(email.ccAddresses)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mb-6 pb-6 border-b">
            <Button variant="outline" size="sm" className="gap-2">
              <Reply className="h-4 w-4" />
              Reply
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <ReplyAll className="h-4 w-4" />
              Reply All
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Forward className="h-4 w-4" />
              Forward
            </Button>
          </div>

          {/* Email body */}
          <div className="prose prose-sm max-w-none">
            {email.bodyHtml ? (
              <div
                className="email-body-content"
                dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
              />
            ) : email.bodyText ? (
              <div className="whitespace-pre-wrap">
                {email.bodyText}
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                No content available
              </p>
            )}
          </div>

          {/* Attachments */}
          {email.hasAttachments && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 font-semibold mb-3">
                <Paperclip className="h-4 w-4" />
                <span>Attachments ({attachments.length})</span>
              </div>
              {loadingAttachments ? (
                <div className="text-sm text-muted-foreground">Loading attachments...</div>
              ) : attachments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {attachments.map((attachment) => {
                    const isImage = attachment.mimeType?.startsWith('image/');
                    const isPdf = attachment.mimeType === 'application/pdf';
                    const sizeInKB = Math.round((attachment.size || 0) / 1024);
                    const sizeInMB = sizeInKB > 1024 ? (sizeInKB / 1024).toFixed(1) + ' MB' : sizeInKB + ' KB';

                    return (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-accent transition-colors"
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          {isImage ? (
                            attachment.storageUrl ? (
                              <div className="h-12 w-12 rounded overflow-hidden border">
                                <img
                                  src={attachment.storageUrl}
                                  alt={attachment.filename}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-12 w-12 rounded border flex items-center justify-center bg-muted">
                                <Image className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )
                          ) : isPdf ? (
                            <div className="h-12 w-12 rounded border flex items-center justify-center bg-red-50">
                              <FileText className="h-6 w-6 text-red-500" />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded border flex items-center justify-center bg-muted">
                              <File className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {attachment.filename}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sizeInMB}
                          </div>
                        </div>

                        {/* Download button */}
                        {attachment.storageUrl && (
                          <a
                            href={attachment.storageUrl}
                            download={attachment.filename}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0"
                          >
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No attachments found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

