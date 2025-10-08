"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, AlertTriangle } from "lucide-react";

interface UsageMeterProps {
  minutesUsed: number;
  minutesIncluded: number;
  overageMinutes: number;
  overageCost: number;
  percentageUsed: number;
}

export function UsageMeter({
  minutesUsed,
  minutesIncluded,
  overageMinutes,
  overageCost,
  percentageUsed,
}: UsageMeterProps) {
  const minutesRemaining = Math.max(0, minutesIncluded - minutesUsed);
  const isInOverage = overageMinutes > 0;
  const isNearLimit = percentageUsed >= 75 && !isInOverage;
  
  // Determine color based on usage
  let progressColor = "bg-green-500";
  let statusColor = "text-green-600";
  
  if (isInOverage) {
    progressColor = "bg-red-500";
    statusColor = "text-red-600";
  } else if (percentageUsed >= 90) {
    progressColor = "bg-orange-500";
    statusColor = "text-orange-600";
  } else if (percentageUsed >= 75) {
    progressColor = "bg-yellow-500";
    statusColor = "text-yellow-600";
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Voice Minutes Usage</CardTitle>
          {isInOverage && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Overage
            </Badge>
          )}
          {isNearLimit && !isInOverage && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
              <TrendingUp className="h-3 w-3" />
              Near Limit
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {minutesUsed.toLocaleString()} / {minutesIncluded.toLocaleString()} minutes
            </span>
            <span className={`font-semibold ${statusColor}`}>
              {Math.min(100, percentageUsed)}%
            </span>
          </div>
          <Progress value={Math.min(100, percentageUsed)} className="h-3" />
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Clock className="h-3 w-3" />
              <span>Remaining</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {minutesRemaining.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">minutes left</div>
          </div>
          
          {isInOverage ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-500 text-xs">
                <AlertTriangle className="h-3 w-3" />
                <span>Overage</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {overageMinutes.toLocaleString()}
              </div>
              <div className="text-xs text-red-500">
                ${(overageCost / 100).toFixed(2)} additional
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <TrendingUp className="h-3 w-3" />
                <span>Used</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {minutesUsed.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">minutes</div>
            </div>
          )}
        </div>
        
        {/* Warning Messages */}
        {isInOverage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            <strong>Overage charges apply:</strong> You've exceeded your included minutes.
            Additional usage is being charged at your plan's overage rate.
          </div>
        )}
        
        {isNearLimit && !isInOverage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            <strong>Approaching limit:</strong> You've used {percentageUsed}% of your included minutes.
            Consider upgrading your plan to avoid overage charges.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
