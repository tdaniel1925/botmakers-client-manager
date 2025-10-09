/**
 * Email Composer Component
 * Full-featured email composition with AI assistance
 */

'use client';

import { useState } from 'react';
import { X, Send, Paperclip, Sparkles, Clock, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { draftReply, draftNewEmail, type DraftTone } from '@/lib/ai-email-drafter';
import type { SelectEmail, SelectEmailAccount } from '@/db/schema/email-schema';

interface EmailComposerProps {
  account: SelectEmailAccount;
  replyTo?: SelectEmail;
  onClose: () => void;
  onSent?: () => void;
}

export function EmailComposer({ account, replyTo, onClose, onSent }: EmailComposerProps) {
  const [to, setTo] = useState(replyTo ? getReplyToAddress(replyTo) : '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);

  const handleAIDraft = async (tone: DraftTone = 'professional') => {
    setAiSuggesting(true);
    try {
      if (replyTo) {
        const draft = await draftReply(replyTo, body || 'Write a helpful reply', {
          tone,
          signature: account.signature || undefined,
        });
        setSubject(draft.subject);
        setBody(draft.body);
      } else {
        const draft = await draftNewEmail(body || 'Write a professional email', {
          tone,
          signature: account.signature || undefined,
        });
        setSubject(draft.subject);
        setBody(draft.body);
      }
    } catch (error) {
      console.error('Error generating AI draft:', error);
    } finally {
      setAiSuggesting(false);
    }
  };

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      // TODO: Implement actual email sending via SMTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      onSent?.();
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border shadow-2xl rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {replyTo ? 'Reply to Email' : 'Compose Email'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* From */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">From</Label>
            <div className="text-sm font-medium">{account.emailAddress}</div>
          </div>

          {/* To */}
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>

          {/* Cc/Bcc toggle */}
          <div className="flex gap-2">
            {!showCc && (
              <button
                onClick={() => setShowCc(true)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                + Cc
              </button>
            )}
            {!showBcc && (
              <button
                onClick={() => setShowBcc(true)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                + Bcc
              </button>
            )}
          </div>

          {/* Cc */}
          {showCc && (
            <div className="space-y-2">
              <Label htmlFor="cc">Cc</Label>
              <Input
                id="cc"
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="cc@example.com"
              />
            </div>
          )}

          {/* Bcc */}
          {showBcc && (
            <div className="space-y-2">
              <Label htmlFor="bcc">Bcc</Label>
              <Input
                id="bcc"
                type="email"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="bcc@example.com"
              />
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              className="min-h-[300px] resize-none"
            />
          </div>

          {/* AI Suggestions */}
          {(body.length > 0 || replyTo) && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI Assist:
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAIDraft('professional')}
                disabled={aiSuggesting}
              >
                Professional
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAIDraft('casual')}
                disabled={aiSuggesting}
              >
                Casual
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAIDraft('brief')}
                disabled={aiSuggesting}
              >
                Brief
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Paperclip className="h-4 w-4 mr-2" />
              Attach
            </Button>
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm">
              <Smile className="h-4 w-4 mr-2" />
              Emoji
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending || !to.trim() || !subject.trim()}>
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getReplyToAddress(email: SelectEmail): string {
  if (typeof email.fromAddress === 'object') {
    return email.fromAddress.email;
  }
  return email.fromAddress;
}

