"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Eye, Code, Loader2, Info } from "lucide-react";
import { toast } from "sonner";

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  helpText?: string;
  maxLength?: number;
  minLength?: number;
  showAIRegenerate?: boolean;
  onAIRegenerate?: () => Promise<string>;
  disabled?: boolean;
}

export function PromptEditor({
  value,
  onChange,
  label = "System Prompt",
  placeholder = "Enter your prompt...",
  helpText,
  maxLength = 4000,
  minLength,
  showAIRegenerate = false,
  onAIRegenerate,
  disabled = false,
}: PromptEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!onAIRegenerate) return;

    setIsRegenerating(true);
    try {
      const newPrompt = await onAIRegenerate();
      onChange(newPrompt);
      toast.success("Prompt regenerated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to regenerate prompt");
    } finally {
      setIsRegenerating(false);
    }
  };

  const charCount = value.length;
  const isOverLimit = maxLength && charCount > maxLength;
  const isUnderLimit = minLength && charCount < minLength;

  // Simple markdown to HTML converter (basic)
  const renderMarkdown = (text: string) => {
    return text
      .split("\n")
      .map((line) => {
        // Headers
        if (line.startsWith("### ")) {
          return `<h3 class="text-lg font-semibold mt-4 mb-2">${line.slice(4)}</h3>`;
        }
        if (line.startsWith("## ")) {
          return `<h2 class="text-xl font-semibold mt-4 mb-2">${line.slice(3)}</h2>`;
        }
        if (line.startsWith("# ")) {
          return `<h1 class="text-2xl font-bold mt-4 mb-2">${line.slice(2)}</h1>`;
        }
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
        // Italic
        line = line.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        // Bullet points
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return `<li class="ml-4">${line.slice(2)}</li>`;
        }
        // Numbered lists
        if (/^\d+\.\s/.test(line)) {
          return `<li class="ml-4">${line.replace(/^\d+\.\s/, "")}</li>`;
        }
        // Empty lines
        if (line.trim() === "") {
          return "<br />";
        }
        // Regular paragraphs
        return `<p class="mb-2">${line}</p>`;
      })
      .join("");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium">{label}</h3>
          {helpText && (
            <Alert className="mt-2 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm text-blue-900">
                {helpText}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {showAIRegenerate && onAIRegenerate && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={disabled || isRegenerating}
          >
            {isRegenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Regenerate
              </>
            )}
          </Button>
        )}
      </div>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">
            <Code className="h-4 w-4 mr-2" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Edit Tab */}
        <TabsContent value="edit" className="space-y-2">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={15}
            className={`font-mono text-sm ${
              isOverLimit ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
          />

          {/* Character Count */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Badge
                variant={isOverLimit ? "destructive" : isUnderLimit ? "secondary" : "outline"}
              >
                {charCount} / {maxLength || "∞"} characters
              </Badge>

              {isUnderLimit && (
                <span className="text-amber-600 text-xs">
                  Minimum {minLength} characters required
                </span>
              )}
            </div>

            <div className="text-gray-500">
              Supports <strong>Markdown</strong> formatting
            </div>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardContent className="pt-6">
              {value ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
                />
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No content to preview</p>
                  <p className="text-sm">Start typing in the Edit tab to see a preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Markdown Help */}
      <details className="text-sm text-gray-600">
        <summary className="cursor-pointer hover:text-gray-900 font-medium">
          Markdown Formatting Guide
        </summary>
        <div className="mt-2 space-y-1 pl-4 text-xs">
          <p><code># Heading 1</code> - Large heading</p>
          <p><code>## Heading 2</code> - Medium heading</p>
          <p><code>### Heading 3</code> - Small heading</p>
          <p><code>**bold text**</code> - Bold text</p>
          <p><code>*italic text*</code> - Italic text</p>
          <p><code>- Item</code> - Bullet point</p>
          <p><code>1. Item</code> - Numbered list</p>
        </div>
      </details>
    </div>
  );
}
