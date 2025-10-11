"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Wand2, History, Send, Paperclip, Eye } from "lucide-react";
import { TemplateSelector } from "./template-selector";
import { SignatureSelector } from "./signature-selector";
import type { SelectEmailTemplate } from "@/db/schema/email-templates-schema";
import type { SelectEmailSignature } from "@/db/schema/email-signatures-schema";

interface ComposerToolbarProps {
  onAIRemix: () => void;
  onAIWrite: () => void;
  onViewHistory: () => void;
  onTogglePreview?: () => void;
  onSend: () => void;
  onAttach: () => void;
  onTemplateSelect?: (template: SelectEmailTemplate) => void;
  onSignatureSelect?: (signature: SelectEmailSignature | null) => void;
  isSending?: boolean;
  hasContent?: boolean;
  attachmentCount?: number;
  currentSubject?: string;
  currentBody?: string;
  accountId?: string;
  currentSignatureId?: string;
  isPreviewMode?: boolean;
}

export function ComposerToolbar({
  onAIRemix,
  onAIWrite,
  onViewHistory,
  onTogglePreview,
  onSend,
  onAttach,
  onTemplateSelect,
  onSignatureSelect,
  isSending = false,
  hasContent = false,
  attachmentCount = 0,
  currentSubject,
  currentBody,
  accountId,
  currentSignatureId,
  isPreviewMode = false,
}: ComposerToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b bg-background px-4 py-2">
      <div className="flex items-center gap-2">
        {/* Template Selector */}
        {onTemplateSelect && (
          <TemplateSelector
            onSelect={onTemplateSelect}
            currentSubject={currentSubject}
            currentBody={currentBody}
          />
        )}
        
        {/* Signature Selector */}
        {onSignatureSelect && (
          <SignatureSelector
            accountId={accountId}
            onSelect={onSignatureSelect}
            currentSignatureId={currentSignatureId}
          />
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onAIWrite}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4 text-purple-500" />
          AI Write
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onAIRemix}
          disabled={!hasContent}
          className="gap-2"
        >
          <Wand2 className="h-4 w-4 text-blue-500" />
          AI Remix
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onAttach}
          className="gap-2 relative"
        >
          <Paperclip className="h-4 w-4" />
          Attach
          {attachmentCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-semibold">
              {attachmentCount}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onViewHistory}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          History
        </Button>
        
        {onTogglePreview && (
          <Button
            variant={isPreviewMode ? "default" : "ghost"}
            size="sm"
            onClick={onTogglePreview}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {isPreviewMode ? 'Edit' : 'Preview'}
          </Button>
        )}
      </div>

      <Button
        onClick={onSend}
        disabled={isSending || !hasContent}
        className="gap-2"
      >
        {isSending ? (
          "Sending..."
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send
          </>
        )}
      </Button>
    </div>
  );
}

