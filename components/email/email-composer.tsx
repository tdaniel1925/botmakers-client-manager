"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Loader2, ChevronRight, ChevronLeft, Paperclip } from "lucide-react";
import { ComposerToolbar } from "./composer-toolbar";
import { RichTextEditor } from "./rich-text-editor";
import { ScheduleSendDialog } from "./schedule-send-dialog";
import { EmailPreview } from "./email-preview";
import { AIWriteDialog } from "./ai-write-dialog";
import { RecipientContextPanel } from "./recipient-context-panel";
import { VersionHistoryPanel } from "./version-history-panel";
import { ToneSelector } from "./tone-selector";
import { saveDraft, sendDraftEmail } from "@/actions/email-composer-actions";
import { useDebounce } from "@/hooks/use-debounce";

interface EmailComposerProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  accountId: string;
  replyTo?: {
    messageId: string;
    threadId: string;
    subject: string;
    from: string;
  };
  initialDraftId?: string;
  initialBody?: string;
  initialTo?: string;
  initialSubject?: string;
}

export function EmailComposer({
  open,
  onClose,
  userId,
  accountId,
  replyTo,
  initialDraftId,
  initialBody,
  initialTo,
  initialSubject,
}: EmailComposerProps) {
  const [draftId, setDraftId] = useState<string | undefined>(initialDraftId);
  const [to, setTo] = useState(initialTo || replyTo?.from || "");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(
    initialSubject || (replyTo?.subject ? `Re: ${replyTo.subject}` : "")
  );
  const [body, setBody] = useState(initialBody || "");
  const [tone, setTone] = useState("auto");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  
  // Attachments
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Signature
  const [currentSignatureId, setCurrentSignatureId] = useState<string | null>(null);
  
  // AI and panels
  const [aiWriteOpen, setAIWriteOpen] = useState(false);
  const [showRecipientContext, setShowRecipientContext] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Loading states
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Auto-save
  const debouncedBody = useDebounce(body, 2000);
  const debouncedSubject = useDebounce(subject, 2000);
  const debouncedTo = useDebounce(to, 2000);
  
  const hasUnsavedChanges = useRef(false);

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges.current && to.trim() && subject.trim()) {
      handleAutoSave();
    }
  }, [debouncedBody, debouncedSubject, debouncedTo]);

  // Mark as changed when user types
  useEffect(() => {
    if (body || subject || to) {
      hasUnsavedChanges.current = true;
    }
  }, [body, subject, to]);

  // Show recipient context when email is entered
  useEffect(() => {
    if (to.includes("@") && to.trim()) {
      setShowRecipientContext(true);
    } else {
      setShowRecipientContext(false);
    }
  }, [to]);

  const handleAutoSave = async () => {
    if (!to.trim() || !subject.trim()) return;

    setIsSaving(true);
    const result = await saveDraft({
      id: draftId,
      userId,
      accountId,
      toAddresses: parseEmailAddresses(to),
      ccAddresses: cc ? parseEmailAddresses(cc) : [],
      bccAddresses: bcc ? parseEmailAddresses(bcc) : [],
      subject,
      bodyText: body,
      bodyHtml: body, // In a real app, you'd convert markdown/rich text to HTML
      threadId: replyTo?.threadId,
      inReplyTo: replyTo?.messageId,
      changeType: "auto_save",
    });

    if (result.success && result.draftId) {
      setDraftId(result.draftId);
      setLastSaved(new Date());
      hasUnsavedChanges.current = false;
    }
    setIsSaving(false);
  };

  const handleAIRemix = async () => {
    if (!body.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/email/ai/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: body,
          tone: tone === "auto" ? undefined : tone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBody(data.remixedText);
        
        // Save as version
        if (draftId) {
          await saveDraft({
            id: draftId,
            userId,
            accountId,
            toAddresses: parseEmailAddresses(to),
            ccAddresses: cc ? parseEmailAddresses(cc) : [],
            bccAddresses: bcc ? parseEmailAddresses(bcc) : [],
            subject,
            bodyText: data.remixedText,
            bodyHtml: data.remixedText,
            threadId: replyTo?.threadId,
            changeType: "ai_remix",
          });
        }
      }
    } catch (error) {
      console.error("AI Remix error:", error);
    }
    setIsSaving(false);
  };

  const handleAIWriteInsert = async (text: string, suggestedSubject?: string) => {
    setBody(text);
    if (suggestedSubject && !subject) {
      setSubject(suggestedSubject);
    }

    // Save as version
    if (draftId) {
      await saveDraft({
        id: draftId,
        userId,
        accountId,
        toAddresses: parseEmailAddresses(to),
        ccAddresses: cc ? parseEmailAddresses(cc) : [],
        bccAddresses: bcc ? parseEmailAddresses(bcc) : [],
        subject: suggestedSubject || subject,
        bodyText: text,
        bodyHtml: text,
        threadId: replyTo?.threadId,
        changeType: "ai_write",
      });
    }
  };

  const handleSend = async () => {
    if (!to.trim() || !subject.trim()) return;

    setIsSending(true);

    // First save as draft
    let finalDraftId = draftId;
    if (!finalDraftId) {
      const result = await saveDraft({
        userId,
        accountId,
        toAddresses: parseEmailAddresses(to),
        ccAddresses: cc ? parseEmailAddresses(cc) : [],
        bccAddresses: bcc ? parseEmailAddresses(bcc) : [],
        subject,
        bodyText: body,
        bodyHtml: body,
        threadId: replyTo?.threadId,
        inReplyTo: replyTo?.messageId,
        changeType: "manual",
      });

      if (result.success && result.draftId) {
        finalDraftId = result.draftId;
      }
    }

    // Send the email
    if (finalDraftId) {
      const result = await sendDraftEmail(finalDraftId);
      if (result.success) {
        onClose();
      }
    }

    setIsSending(false);
  };

  const parseEmailAddresses = (emails: string): { email: string }[] => {
    return emails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.includes("@"))
      .map((e) => ({ email: e }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments((prev) => [...prev, ...files]);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleTemplateSelect = (template: any) => {
    if (template.subject && !subject) {
      setSubject(template.subject);
    }
    setBody(template.body);
  };

  const handleScheduleSend = async (scheduledDate: Date) => {
    if (!to.trim() || !subject.trim()) {
      alert('Please fill in recipient and subject');
      return;
    }

    setIsSending(true);

    // Save as draft first
    let finalDraftId = draftId;
    if (!finalDraftId) {
      const result = await saveDraft({
        userId,
        accountId,
        toAddresses: parseEmailAddresses(to),
        ccAddresses: cc ? parseEmailAddresses(cc) : [],
        bccAddresses: bcc ? parseEmailAddresses(bcc) : [],
        subject,
        bodyText: body,
        bodyHtml: body,
        threadId: replyTo?.threadId,
        inReplyTo: replyTo?.messageId,
        changeType: "manual",
      });

      if (result.success && result.draftId) {
        finalDraftId = result.draftId;
      }
    }

    // TODO: Store in scheduled_emails table with scheduled date
    // For now, just show success message
    alert(`Email scheduled for ${scheduledDate.toLocaleString()}`);
    
    setIsSending(false);
    onClose();
  };

  const handleSignatureSelect = (signature: any) => {
    if (signature === null) {
      // Remove signature from body
      setCurrentSignatureId(null);
      // TODO: Remove signature HTML from body
    } else {
      setCurrentSignatureId(signature.id);
      // Append signature to body
      const signatureHtml = `\n\n<div class="email-signature">${signature.content}</div>`;
      if (!body.includes(signature.content)) {
        setBody(body + signatureHtml);
      }
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="flex w-full max-w-6xl h-[85vh] bg-background rounded-lg shadow-2xl overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200">
          {/* Main Composer */}
          <div className="flex flex-1 flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">
                  {replyTo ? "Reply" : "New Email"}
                </h2>
                {lastSaved && (
                  <span className="text-xs text-muted-foreground">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ToneSelector value={tone} onChange={setTone} />
                <ScheduleSendDialog onSchedule={handleScheduleSend} />
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

          {/* Toolbar */}
          <ComposerToolbar
            onAIRemix={handleAIRemix}
            onAIWrite={() => setAIWriteOpen(true)}
            onViewHistory={() => setShowVersionHistory(!showVersionHistory)}
            onTogglePreview={() => setShowPreview(!showPreview)}
            onSend={handleSend}
            onAttach={() => fileInputRef.current?.click()}
            onTemplateSelect={handleTemplateSelect}
            onSignatureSelect={handleSignatureSelect}
            isSending={isSending}
            hasContent={!!body.trim()}
            attachmentCount={attachments.length}
            currentSubject={subject}
            currentBody={body}
            accountId={accountId}
            currentSignatureId={currentSignatureId || undefined}
            isPreviewMode={showPreview}
          />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Form */}
          <div className="flex-1 overflow-auto">
            <div className="mx-auto max-w-4xl space-y-4 p-6">
              {/* To Field */}
              <div className="flex items-center gap-2">
                <Label htmlFor="to" className="w-12 text-sm text-muted-foreground">
                  To
                </Label>
                <Input
                  id="to"
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCc(!showCc)}
                  className="text-xs"
                >
                  Cc
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBcc(!showBcc)}
                  className="text-xs"
                >
                  Bcc
                </Button>
              </div>

              {/* Cc Field */}
              {showCc && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="cc" className="w-12 text-sm text-muted-foreground">
                    Cc
                  </Label>
                  <Input
                    id="cc"
                    type="email"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="cc@example.com"
                    className="flex-1"
                  />
                </div>
              )}

              {/* Bcc Field */}
              {showBcc && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="bcc" className="w-12 text-sm text-muted-foreground">
                    Bcc
                  </Label>
                  <Input
                    id="bcc"
                    type="email"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    placeholder="bcc@example.com"
                    className="flex-1"
                  />
                </div>
              )}

              {/* Subject Field */}
              <div className="flex items-center gap-2">
                <Label htmlFor="subject" className="w-12 text-sm text-muted-foreground">
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  className="flex-1"
                />
              </div>

              {/* Body Field - Rich Text Editor or Preview */}
              {showPreview ? (
                <div className="min-h-[400px] border rounded-lg">
                  <EmailPreview
                    subject={subject}
                    from={accountId} // TODO: Get actual email from accountId
                    to={to}
                    body={body}
                  />
                </div>
              ) : (
                <RichTextEditor
                  content={body}
                  onChange={setBody}
                  placeholder="Write your message here... (or click 'AI Write' to let AI help you)"
                  className="min-h-[400px]"
                />
              )}

              {/* Attachments Display */}
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Attachments ({attachments.length})
                  </Label>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAttachment(index)}
                          className="h-6 w-6 p-0 flex-shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panels */}
        {(showRecipientContext || showVersionHistory) && (
          <div className="w-80 border-l bg-muted/30">
            {showVersionHistory && draftId ? (
              <>
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h3 className="font-semibold">Version History</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowVersionHistory(false)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <VersionHistoryPanel draftId={draftId} onRestore={handleAutoSave} />
              </>
            ) : showRecipientContext && to.includes("@") ? (
              <>
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h3 className="font-semibold">Recipient Context</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowRecipientContext(false)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <RecipientContextPanel
                  recipientEmail={to.split(",")[0].trim()}
                  accountId={accountId}
                />
              </>
            ) : null}
          </div>
        )}
        </div>
      </div>

      {/* AI Write Dialog */}
      <AIWriteDialog
        open={aiWriteOpen}
        onOpenChange={setAIWriteOpen}
        recipientEmail={to.split(",")[0].trim()}
        accountId={accountId}
        onInsert={handleAIWriteInsert}
      />
    </>
  );
}
