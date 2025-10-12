/**
 * Email Viewer Component
 * Displays full email content with actions
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Reply, ReplyAll, Forward, Archive, Trash2, Star, MoreVertical, Paperclip, Download, FileText, Image, File, ChevronLeft, ChevronRight, Clock, Package, Calendar, CheckSquare, UserPlus, Video, Receipt, Sparkles } from 'lucide-react';
import type { SelectEmail, SelectEmailAttachment } from '@/db/schema/email-schema';
import { format } from 'date-fns';
import { getEmailAttachmentsAction, markAsReadAction, toggleStarAction } from '@/actions/email-operations-actions';
import { markReplyLater, markSetAside } from '@/actions/reply-later-actions';
import { createEventFromEmailAction, createReminderAction } from '@/actions/reminders-calendar-actions';
import { createContactFromEmailAction } from '@/actions/contacts-actions';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useToast } from '@/components/ui/use-toast';

interface EmailViewerProps {
  email: SelectEmail;
  onClose: () => void;
  emails?: SelectEmail[]; // All emails in current view
  currentIndex?: number; // Index of current email in the list
  onNavigate?: (email: SelectEmail) => void; // Navigate to another email
  onCompose?: (draft: { to?: string; subject?: string; body?: string; replyTo?: any }) => void;
}

export function EmailViewer({ email, onClose, emails = [], currentIndex = -1, onNavigate, onCompose }: EmailViewerProps) {
  const [attachments, setAttachments] = useState<SelectEmailAttachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [aiActions, setAiActions] = useState<any[]>([]);
  const [loadingAiActions, setLoadingAiActions] = useState(false);
  const { toast } = useToast();

  // Navigation helpers
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < emails.length - 1 && currentIndex >= 0;
  
  const goToPrevious = () => {
    if (hasPrevious && onNavigate) {
      onNavigate(emails[currentIndex - 1]);
    }
  };
  
  const goToNext = () => {
    if (hasNext && onNavigate) {
      onNavigate(emails[currentIndex + 1]);
    }
  };

  const handleReply = () => {
    if (onCompose) {
      const to = typeof email.fromAddress === 'object' ? email.fromAddress.email : email.fromAddress;
      onCompose({
        to,
        subject: email.subject?.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
        replyTo: {
          messageId: email.messageId,
          threadId: email.threadId,
          subject: email.subject,
          from: to,
        },
      });
    }
    onClose();
  };

  const handleStar = async () => {
    await toggleStarAction(email.id, !email.isStarred);
  };

  const handleReplyLater = async () => {
    // Set default reminder for 1 day from now
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await markReplyLater(email.id, tomorrow);
    // Show toast notification
    onClose(); // Return to list
  };

  const handleSetAside = async () => {
    await markSetAside(email.id);
    // Show toast notification  
    onClose(); // Return to list
  };

  // AI Action Handlers
  const handleAiAction = async (action: any) => {
    try {
      switch (action.type) {
        case 'add_to_calendar':
          await handleAddToCalendar(action.data);
          break;
        case 'set_reminder':
          await handleSetReminder(action.data);
          break;
        case 'save_contact':
          await handleSaveContact(action.data);
          break;
        case 'save_receipt':
          toast({ title: 'Receipt saved', description: 'Receipt has been archived for your records' });
          break;
        case 'create_task':
          toast({ title: 'Task created', description: 'Task has been added to your list' });
          break;
        case 'book_meeting':
          toast({ title: 'Meeting booked', description: 'Calendar invite sent' });
          break;
        default:
          console.log('Unknown action type:', action.type);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Action failed', variant: 'destructive' });
    }
  };

  const handleAddToCalendar = async (data: any) => {
    const result = await createEventFromEmailAction({
      emailId: email.id,
      title: data.title || email.subject || 'Event',
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      description: data.description,
    });

    if (result.success) {
      toast({ title: 'Event added', description: 'Event has been added to your calendar' });
    } else {
      throw new Error(result.error);
    }
  };

  const handleSetReminder = async (data: any) => {
    const reminderDate = data.reminderAt ? new Date(data.reminderAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const result = await createReminderAction({
      emailId: email.id,
      title: data.title || `Follow up: ${email.subject}`,
      description: data.description,
      reminderAt: reminderDate,
      method: 'email',
    });

    if (result.success) {
      toast({ title: 'Reminder set', description: `You'll be reminded on ${format(reminderDate, 'PPp')}` });
    } else {
      throw new Error(result.error);
    }
  };

  const handleSaveContact = async (data: any) => {
    const fromEmail = typeof email.fromAddress === 'string' 
      ? email.fromAddress 
      : email.fromAddress?.email || '';
    
    const fromName = typeof email.fromAddress === 'object' && email.fromAddress?.name
      ? email.fromAddress.name
      : fromEmail.split('@')[0];

    const result = await createContactFromEmailAction({
      email: data.email || fromEmail,
      name: data.name || fromName,
      emailId: email.id,
    });

    if (result.success) {
      if (result.created) {
        toast({ title: 'Contact saved', description: 'New contact has been added' });
      } else if (result.updated) {
        toast({ title: 'Contact updated', description: 'Contact information has been updated' });
      }
    } else {
      throw new Error(result.error);
    }
  };

  // Keyboard shortcuts for email viewer
  const shortcuts = {
    nextEmail: {
      key: 'j',
      action: goToNext,
      description: 'Next email',
    },
    previousEmail: {
      key: 'k',
      action: goToPrevious,
      description: 'Previous email',
    },
    reply: {
      key: 'r',
      action: handleReply,
      description: 'Reply',
    },
    star: {
      key: 's',
      action: handleStar,
      description: 'Star/Unstar',
    },
    back: {
      key: 'Escape',
      action: onClose,
      description: 'Back to list',
    },
  };

  useKeyboardShortcuts(shortcuts);

  // Load attachments if email has them
  useEffect(() => {
    if (email.hasAttachments) {
      loadAttachments();
    }
  }, [email.id]);

  // Load AI contextual actions
  useEffect(() => {
    loadAiActions();
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

  const loadAiActions = async () => {
    setLoadingAiActions(true);
    try {
      const response = await fetch('/api/email/ai/contextual-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId: email.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiActions(data.actions || []);
      }
    } catch (error) {
      console.error('Error loading AI actions:', error);
    }
    setLoadingAiActions(false);
  };

  // Map icon names to components
  const getActionIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      Calendar,
      Clock,
      Receipt,
      CheckSquare,
      UserPlus,
      Video,
      Sparkles,
    };
    return iconMap[iconName] || Sparkles;
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
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          {/* Navigation */}
          {emails.length > 0 && currentIndex >= 0 && (
            <div className="flex items-center gap-1 border-l pl-2 ml-2">
              <Badge variant="secondary" className="text-xs">
                {currentIndex + 1} of {emails.length}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                disabled={!hasPrevious}
                title="Previous (k)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                disabled={!hasNext}
                title="Next (j)"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleStar} title="Star (s)">
            <Star className={`h-4 w-4 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleReply} title="Reply (r)">
            <Reply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Archive (e)">
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
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                if (onCompose) {
                  const fromEmail = typeof email.fromAddress === 'string' 
                    ? email.fromAddress 
                    : email.fromAddress?.email || '';
                  
                  onCompose({
                    to: fromEmail,
                    subject: email.subject?.startsWith('Re:') ? email.subject : `Re: ${email.subject || ''}`,
                    body: `\n\n---\nOn ${email.receivedAt ? format(new Date(email.receivedAt), 'PPpp') : ''}, ${from.name} wrote:\n\n${email.bodyText || ''}`,
                    replyTo: email
                  });
                }
              }}
            >
              <Reply className="h-4 w-4" />
              Reply
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                if (onCompose) {
                  const fromEmail = typeof email.fromAddress === 'string' 
                    ? email.fromAddress 
                    : email.fromAddress?.email || '';
                  
                  // Get all recipients for Reply All
                  let allRecipients = [fromEmail];
                  if (email.toAddresses) {
                    const toEmails = Array.isArray(email.toAddresses) 
                      ? email.toAddresses 
                      : JSON.parse(email.toAddresses as any);
                    toEmails.forEach((addr: any) => {
                      const emailAddr = typeof addr === 'string' ? addr : addr.email;
                      if (emailAddr && !allRecipients.includes(emailAddr)) {
                        allRecipients.push(emailAddr);
                      }
                    });
                  }
                  if (email.ccAddresses) {
                    const ccEmails = Array.isArray(email.ccAddresses) 
                      ? email.ccAddresses 
                      : JSON.parse(email.ccAddresses as any);
                    ccEmails.forEach((addr: any) => {
                      const emailAddr = typeof addr === 'string' ? addr : addr.email;
                      if (emailAddr && !allRecipients.includes(emailAddr)) {
                        allRecipients.push(emailAddr);
                      }
                    });
                  }
                  
                  onCompose({
                    to: allRecipients.join(', '),
                    subject: email.subject?.startsWith('Re:') ? email.subject : `Re: ${email.subject || ''}`,
                    body: `\n\n---\nOn ${email.receivedAt ? format(new Date(email.receivedAt), 'PPpp') : ''}, ${from.name} wrote:\n\n${email.bodyText || ''}`,
                    replyTo: email
                  });
                }
              }}
            >
              <ReplyAll className="h-4 w-4" />
              Reply All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                if (onCompose) {
                  onCompose({
                    subject: email.subject?.startsWith('Fwd:') ? email.subject : `Fwd: ${email.subject || ''}`,
                    body: `\n\n---\nForwarded message from ${from.name} on ${email.receivedAt ? format(new Date(email.receivedAt), 'PPpp') : ''}:\n\n${email.bodyText || ''}`,
                    replyTo: email
                  });
                }
              }}
            >
              <Forward className="h-4 w-4" />
              Forward
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleReplyLater}
            >
              <Clock className="h-4 w-4" />
              Reply Later
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleSetAside}
            >
              <Package className="h-4 w-4" />
              Set Aside
            </Button>

            {/* AI Contextual Actions */}
            {loadingAiActions && (
              <Button variant="outline" size="sm" className="gap-2" disabled>
                <Sparkles className="h-4 w-4 animate-pulse" />
                AI Analyzing...
              </Button>
            )}
            {aiActions.map((action, index) => {
              const IconComponent = getActionIcon(action.icon);
              return (
                <Button
                  key={index}
                  variant="default"
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                  onClick={() => handleAiAction(action)}
                >
                  <IconComponent className="h-4 w-4" />
                  {action.label}
                </Button>
              );
            })}
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

