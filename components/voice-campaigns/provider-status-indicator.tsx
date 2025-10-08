"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalLink } from "lucide-react";
import {
  checkProviderHealth,
  getStatusColor,
  getStatusLabel,
  type ProviderHealth,
} from "@/lib/provider-health-check";

interface ProviderStatusIndicatorProps {
  provider: string;
  showLabel?: boolean;
  className?: string;
}

export function ProviderStatusIndicator({
  provider,
  showLabel = false,
  className = "",
}: ProviderStatusIndicatorProps) {
  const [health, setHealth] = useState<ProviderHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkHealth = async () => {
      try {
        const result = await checkProviderHealth(provider);
        if (mounted) {
          setHealth(result);
        }
      } catch (error) {
        console.error("Health check error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkHealth();

    // Refresh every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [provider]);

  if (loading || !health) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
        {showLabel && <span className="text-xs text-gray-400">Checking...</span>}
      </div>
    );
  }

  const statusColor = getStatusColor(health.status);
  const statusLabel = getStatusLabel(health.status);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 cursor-help ${className}`}>
            <div className={`w-2 h-2 rounded-full ${statusColor.replace('text-', 'bg-')}`} />
            {showLabel && (
              <span className={`text-xs font-medium ${statusColor}`}>
                {statusLabel}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">
              {provider.toUpperCase()} Status
            </div>
            <div className={`text-sm ${statusColor}`}>
              {statusLabel}
            </div>
            {health.message && (
              <div className="text-xs text-gray-500">{health.message}</div>
            )}
            <div className="text-xs text-gray-400">
              Last checked: {health.lastChecked.toLocaleTimeString()}
            </div>
            <a
              href={health.statusPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View Status Page
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ProviderStatusBadge({ provider }: { provider: string }) {
  const [health, setHealth] = useState<ProviderHealth | null>(null);

  useEffect(() => {
    checkProviderHealth(provider).then(setHealth);
  }, [provider]);

  if (!health) return null;

  const variant =
    health.status === "operational"
      ? "default"
      : health.status === "degraded"
      ? "secondary"
      : "destructive";

  return (
    <Badge variant={variant} className="text-xs">
      {health.status === "operational" ? "✓" : "!"} {health.status}
    </Badge>
  );
}
