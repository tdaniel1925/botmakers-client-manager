"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Play, Pause, AlertCircle, CheckCircle2, FileText, XCircle, Rocket } from "lucide-react";

type CampaignStatus = "active" | "paused" | "draft" | "pending" | "completed" | "failed";

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
  isActive?: boolean;
  animated?: boolean;
  className?: string;
}

export function CampaignStatusBadge({
  status,
  isActive = false,
  animated = true,
  className,
}: CampaignStatusBadgeProps) {
  const statusConfig = {
    active: {
      label: "Active",
      icon: Play,
      variant: "default" as const,
      className: "bg-green-100 text-green-700 border-green-300 hover:bg-green-100",
      iconColor: "text-green-600",
      pulseColor: "bg-green-500",
    },
    paused: {
      label: "Paused",
      icon: Pause,
      variant: "secondary" as const,
      className: "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-100",
      iconColor: "text-amber-600",
      pulseColor: "bg-amber-500",
    },
    draft: {
      label: "Draft",
      icon: FileText,
      variant: "outline" as const,
      className: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-100",
      iconColor: "text-gray-600",
      pulseColor: "bg-gray-500",
    },
    pending: {
      label: "Pending Launch",
      icon: Rocket,
      variant: "secondary" as const,
      className: "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-100",
      iconColor: "text-yellow-600",
      pulseColor: "bg-yellow-500",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      variant: "outline" as const,
      className: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100",
      iconColor: "text-blue-600",
      pulseColor: "bg-blue-500",
    },
    failed: {
      label: "Failed",
      icon: XCircle,
      variant: "destructive" as const,
      className: "bg-red-100 text-red-700 border-red-300 hover:bg-red-100",
      iconColor: "text-red-600",
      pulseColor: "bg-red-500",
    },
  };

  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  // Only show pulse animation if active AND animated flag is true
  const showPulse = status === "active" && isActive && animated;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "flex items-center gap-1.5 transition-all duration-200",
        config.className,
        className
      )}
    >
      <div className="relative flex items-center">
        <Icon className={cn("h-3 w-3", config.iconColor)} />
        {showPulse && (
          <span className="absolute flex h-3 w-3">
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                config.pulseColor
              )}
            />
          </span>
        )}
      </div>
      <span className="font-medium">{config.label}</span>
    </Badge>
  );
}

/**
 * Provider Badge - White-labeled to show "AI Agent"
 */
interface ProviderBadgeProps {
  provider: string;
  className?: string;
}

export function ProviderBadge({ provider, className }: ProviderBadgeProps) {
  // White-label: Always show "AI Agent" regardless of actual provider
  return (
    <Badge
      variant="outline"
      className={cn(
        "uppercase text-xs font-semibold",
        "bg-blue-100 text-blue-700 border-blue-300",
        className
      )}
    >
      AI Agent
    </Badge>
  );
}
