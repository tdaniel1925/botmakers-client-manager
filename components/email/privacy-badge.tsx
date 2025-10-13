/**
 * Privacy Badge - Shows blocked trackers
 */

// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { Shield, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PrivacyBadgeProps {
  trackersBlocked: number;
  variant?: 'inline' | 'standalone';
  showLabel?: boolean;
}

export function PrivacyBadge({
  trackersBlocked,
  variant = 'inline',
  showLabel = true,
}: PrivacyBadgeProps) {
  if (trackersBlocked === 0) {
    return null;
  }

  const content = (
    <div className="flex items-center gap-1.5">
      <Shield className="h-3.5 w-3.5" />
      {showLabel && (
        <span className="text-xs font-medium">
          {trackersBlocked} {trackersBlocked === 1 ? 'tracker' : 'trackers'} blocked
        </span>
      )}
    </div>
  );

  if (variant === 'standalone') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 cursor-help"
            >
              {content}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">Privacy Protection Active</p>
              <p className="text-xs">
                Blocked {trackersBlocked} tracking pixel{trackersBlocked !== 1 ? 's' : ''} and read receipts
              </p>
              <div className="pt-2 border-t text-xs text-muted-foreground">
                Your activity is private
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="bg-green-100 text-green-700 border-green-200 text-xs"
    >
      {content}
    </Badge>
  );
}

/**
 * Privacy Score Indicator
 */
interface PrivacyScoreProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
}

export function PrivacyScore({ score, size = 'md' }: PrivacyScoreProps) {
  const getColor = () => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getLabel = () => {
    if (score >= 80) return 'High Privacy';
    if (score >= 50) return 'Medium Privacy';
    return 'Low Privacy';
  };

  const Icon = score >= 80 ? EyeOff : Eye;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${getColor()} cursor-help`}>
            <Icon className="mr-1 h-3 w-3" />
            {getLabel()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p className="font-semibold mb-1">Privacy Score: {score}/100</p>
            <p className="text-muted-foreground">
              {score >= 80 && 'Excellent protection. No tracking detected.'}
              {score >= 50 && score < 80 && 'Some trackers found but blocked.'}
              {score < 50 && 'Multiple trackers detected and blocked.'}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}


