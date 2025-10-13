"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { ToneSelector } from "./tone-selector";

interface AIWriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientEmail: string;
  accountId: string;
  onInsert: (text: string, subject?: string) => void;
}

export function AIWriteDialog({
  open,
  onOpenChange,
  recipientEmail,
  accountId,
  onInsert,
}: AIWriteDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("auto");
  const [generatedText, setGeneratedText] = useState("");
  const [suggestedSubject, setSuggestedSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextUsed, setContextUsed] = useState(0);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/email/ai/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail,
          prompt,
          accountId,
          tone: tone === "auto" ? undefined : tone,
          contextLimit: 20,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedText(data.generatedText);
        setSuggestedSubject(data.suggestedSubject);
        setContextUsed(data.contextUsed);
      } else {
        console.error("Failed to generate email");
      }
    } catch (error) {
      console.error("Error generating email:", error);
    }
    setLoading(false);
  };

  const handleInsert = () => {
    onInsert(generatedText, suggestedSubject);
    onOpenChange(false);
    // Reset state
    setPrompt("");
    setGeneratedText("");
    setSuggestedSubject("");
    setContextUsed(0);
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset state
    setPrompt("");
    setGeneratedText("");
    setSuggestedSubject("");
    setContextUsed(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Write Email
          </DialogTitle>
          <DialogDescription>
            Describe what you want to write, and AI will craft the email based on your
            history with {recipientEmail}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-auto">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">What would you like to write about?</Label>
            <Textarea
              id="prompt"
              placeholder="E.g., Follow up on the project proposal we discussed last week..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Tone Selector */}
          <div className="flex items-center justify-between">
            <Label>Tone</Label>
            <ToneSelector value={tone} onChange={setTone} />
          </div>

          {/* Generate Button */}
          {!generatedText && (
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Email
                </>
              )}
            </Button>
          )}

          {/* Generated Content */}
          {generatedText && (
            <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Generated Email</div>
                <div className="text-xs text-muted-foreground">
                  Based on {contextUsed} previous email{contextUsed !== 1 ? "s" : ""}
                </div>
              </div>

              {suggestedSubject && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Suggested Subject</Label>
                  <div className="rounded bg-background p-2 text-sm font-medium">
                    {suggestedSubject}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Email Body</Label>
                <div className="rounded bg-background p-3 text-sm whitespace-pre-wrap">
                  {generatedText}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerate} variant="outline" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    "Regenerate"
                  )}
                </Button>
                <Button onClick={handleInsert} className="flex-1">
                  Insert into Email
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


