/**
 * Task Source Badge
 * Visual indicator showing task source (AI-generated, onboarding-generated, manual)
 */

"use client";

import { Sparkles, FileCheck2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

interface TaskSourceBadgeProps {
  sourceType?: string | null;
  sourceId?: string | null;
  sourceMetadata?: string | null;
  size?: "sm" | "md";
}

export function TaskSourceBadge({
  sourceType,
  sourceId,
  sourceMetadata,
  size = "sm",
}: TaskSourceBadgeProps) {
  // If no source type, it's a manual task - don't show badge
  if (!sourceType) {
    return null;
  }

  const isOnboarding = sourceType === "onboarding_response";
  const isAI = sourceType === "ai_generated";

  if (!isOnboarding && !isAI) {
    return null;
  }

  // Parse metadata for additional info
  let metadata: any = {};
  try {
    metadata = sourceMetadata ? JSON.parse(sourceMetadata) : {};
  } catch {
    metadata = {};
  }

  const icon = isOnboarding ? (
    <FileCheck2 className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
  ) : (
    <Sparkles className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
  );

  const label = isOnboarding ? "From Onboarding" : "AI Generated";
  const badgeClass = isOnboarding
    ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
    : "bg-blue-100 text-blue-700 hover:bg-blue-200";

  const tooltipContent = isOnboarding ? (
    <div className="text-xs space-y-1">
      <p className="font-semibold">Generated from Client Onboarding</p>
      {metadata.ruleName && <p>Rule: {metadata.ruleName}</p>}
      {metadata.timestamp && (
        <p>Created: {new Date(metadata.timestamp).toLocaleDateString()}</p>
      )}
      {sourceId && <p className="text-gray-400 text-[10px]">Session: {sourceId.slice(0, 8)}...</p>}
    </div>
  ) : (
    <div className="text-xs space-y-1">
      <p className="font-semibold">AI-Generated Task</p>
      <p>Created by OpenAI GPT-4</p>
    </div>
  );

  const badge = (
    <Badge
      variant="secondary"
      className={`${badgeClass} ${size === "sm" ? "text-xs" : "text-sm"} flex items-center gap-1 cursor-help`}
    >
      {icon}
      <span>{label}</span>
    </Badge>
  );

  // If it's from onboarding and we have a sourceId, make it a link
  if (isOnboarding && sourceId) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/platform/onboarding/${sourceId}`}>
              {badge}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            {tooltipContent}
            <p className="mt-1 text-[10px] text-gray-400">Click to view onboarding session</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Otherwise just show with tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
