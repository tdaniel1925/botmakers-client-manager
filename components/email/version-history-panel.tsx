"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, RotateCcw, Sparkles } from "lucide-react";
import { getDraftVersions, restoreDraftVersion } from "@/actions/email-composer-actions";
import { formatDistanceToNow } from "date-fns";

interface Version {
  id: string;
  versionNumber: number;
  subject: string;
  bodyText: string | null;
  changeType: string | null;
  aiPrompt: string | null;
  createdAt: Date;
}

interface VersionHistoryPanelProps {
  draftId: string;
  onRestore?: () => void;
}

export function VersionHistoryPanel({ draftId, onRestore }: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [draftId]);

  const loadVersions = async () => {
    setLoading(true);
    const result = await getDraftVersions(draftId);
    if (result.success && result.versions) {
      setVersions(result.versions);
    }
    setLoading(false);
  };

  const handleRestore = async (versionId: string) => {
    const result = await restoreDraftVersion(draftId, versionId);
    if (result.success) {
      await loadVersions();
      onRestore?.();
    }
  };

  const getChangeTypeLabel = (changeType: string | null) => {
    switch (changeType) {
      case "ai_remix":
        return "AI Remix";
      case "ai_write":
        return "AI Write";
      case "restore":
        return "Restored";
      case "auto_save":
        return "Auto-saved";
      default:
        return "Manual edit";
    }
  };

  const getChangeTypeIcon = (changeType: string | null) => {
    if (changeType === "ai_remix" || changeType === "ai_write") {
      return <Sparkles className="h-3 w-3 text-purple-500" />;
    }
    if (changeType === "restore") {
      return <RotateCcw className="h-3 w-3 text-blue-500" />;
    }
    return <Clock className="h-3 w-3 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading versions...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Version History</h3>
        <p className="text-xs text-muted-foreground">
          {versions.length} version{versions.length !== 1 ? "s" : ""}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getChangeTypeIcon(version.changeType)}
                    <span className="text-xs font-medium">
                      {getChangeTypeLabel(version.changeType)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      v{version.versionNumber}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(version.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                {index !== 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestore(version.id)}
                    className="h-7 px-2 text-xs"
                  >
                    Restore
                  </Button>
                )}
              </div>
              
              {version.aiPrompt && (
                <div className="mt-2 rounded bg-purple-50 dark:bg-purple-950/20 px-2 py-1 text-xs text-purple-700 dark:text-purple-300">
                  Prompt: {version.aiPrompt}
                </div>
              )}

              <div className="mt-2 space-y-1">
                <div className="text-xs font-medium text-muted-foreground">
                  {version.subject}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {version.bodyText}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

