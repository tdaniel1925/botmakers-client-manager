"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, MessageSquare, Clock, TrendingUp, Tag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecipientContextData {
  recipientEmail: string;
  stats: {
    totalEmails: number;
    sentToRecipient: number;
    receivedFromRecipient: number;
    uniqueThreads: number;
    hasAttachments: boolean;
  };
  commonTopics: string[];
  tone: string;
  responseTimeHours: string;
  recentEmails: Array<{
    id: string;
    subject: string | null;
    preview: string;
    date: Date;
    isFromRecipient: boolean;
  }>;
  lastContactDate: Date | null;
}

interface RecipientContextPanelProps {
  recipientEmail: string;
  accountId: string;
}

export function RecipientContextPanel({
  recipientEmail,
  accountId,
}: RecipientContextPanelProps) {
  const [context, setContext] = useState<RecipientContextData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContext();
  }, [recipientEmail, accountId]);

  const loadContext = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/email/ai/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail, accountId }),
      });

      if (response.ok) {
        const data = await response.json();
        setContext(data);
      }
    } catch (error) {
      console.error("Error loading recipient context:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading context...</div>
      </div>
    );
  }

  if (!context || context.stats.totalEmails === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center">
        <div>
          <Mail className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <p className="mt-2 text-sm text-muted-foreground">
            No previous emails with this recipient
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Recipient Context</h3>
        <p className="text-xs text-muted-foreground truncate">{recipientEmail}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>Total Emails</span>
              </div>
              <div className="mt-1 text-2xl font-bold">{context.stats.totalEmails}</div>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>Threads</span>
              </div>
              <div className="mt-1 text-2xl font-bold">{context.stats.uniqueThreads}</div>
            </div>
          </div>

          {/* Communication Pattern */}
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 text-xs font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>Communication Pattern</span>
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sent to them:</span>
                <span className="font-medium">{context.stats.sentToRecipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Received from them:</span>
                <span className="font-medium">{context.stats.receivedFromRecipient}</span>
              </div>
            </div>
          </div>

          {/* Tone */}
          <div className="rounded-lg border bg-card p-3">
            <div className="text-xs font-medium">Typical Tone</div>
            <div className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {context.tone}
            </div>
          </div>

          {/* Response Time */}
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Clock className="h-3 w-3" />
              <span>Response Time</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {context.responseTimeHours}
            </div>
          </div>

          {/* Common Topics */}
          {context.commonTopics.length > 0 && (
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Tag className="h-3 w-3" />
                <span>Common Topics</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {context.commonTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-secondary px-2 py-1 text-xs"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Emails */}
          <div className="rounded-lg border bg-card p-3">
            <div className="text-xs font-medium">Recent Emails</div>
            <div className="mt-2 space-y-2">
              {context.recentEmails.map((email) => (
                <div
                  key={email.id}
                  className="rounded border-l-2 border-primary/50 bg-muted/50 p-2"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className={email.isFromRecipient ? "text-blue-500" : "text-green-500"}>
                      {email.isFromRecipient ? "←" : "→"}
                    </span>
                    <span className="font-medium line-clamp-1">{email.subject}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {email.preview}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(email.date), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}


