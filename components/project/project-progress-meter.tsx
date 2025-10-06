/**
 * Project Progress Meter Component
 * Displays project progress with visual meter and task stats
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Loader2, Settings } from "lucide-react";

interface ProjectProgressMeterProps {
  projectId: string;
  displayProgress: number;
  autoCalculated: number;
  isManualOverride: boolean;
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
  };
  isPlatformAdmin?: boolean;
  onOverrideClick?: () => void;
}

export function ProjectProgressMeter({
  projectId,
  displayProgress,
  autoCalculated,
  isManualOverride,
  taskStats,
  isPlatformAdmin = false,
  onOverrideClick,
}: ProjectProgressMeterProps) {
  const getProgressColor = (percentage: number): string => {
    if (percentage === 0) return "bg-gray-400";
    if (percentage < 25) return "bg-red-500";
    if (percentage < 50) return "bg-orange-500";
    if (percentage < 75) return "bg-yellow-500";
    if (percentage < 100) return "bg-blue-500";
    return "bg-green-500";
  };

  const getProgressLabel = (percentage: number): string => {
    if (percentage === 0) return "Not Started";
    if (percentage < 25) return "Just Started";
    if (percentage < 50) return "In Progress";
    if (percentage < 75) return "Halfway There";
    if (percentage < 100) return "Almost Done";
    return "Completed";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Project Progress</CardTitle>
        {isPlatformAdmin && onOverrideClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOverrideClick}
          >
            <Settings className="h-4 w-4 mr-2" />
            Override Progress
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{displayProgress}%</span>
              <Badge variant={isManualOverride ? "default" : "secondary"}>
                {isManualOverride ? "Manual" : "Auto"}
              </Badge>
            </div>
            <span className="text-sm text-gray-600">
              {getProgressLabel(displayProgress)}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <Progress value={displayProgress} className="h-3" />
          </div>

          {/* Manual Override Info */}
          {isManualOverride && autoCalculated !== displayProgress && (
            <p className="text-xs text-gray-500">
              Auto-calculated: {autoCalculated}% (overridden by admin)
            </p>
          )}
        </div>

        {/* Task Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Task Breakdown</h4>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Completed Tasks */}
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">{taskStats.completed}</p>
                <p className="text-xs text-green-700">Completed</p>
              </div>
            </div>

            {/* In Progress Tasks */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Loader2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">{taskStats.inProgress}</p>
                <p className="text-xs text-blue-700">In Progress</p>
              </div>
            </div>

            {/* Todo Tasks */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Circle className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{taskStats.todo}</p>
                <p className="text-xs text-gray-700">To Do</p>
              </div>
            </div>

            {/* Total Tasks */}
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <div className="h-5 w-5 flex items-center justify-center text-purple-600 font-bold text-xs">
                Σ
              </div>
              <div>
                <p className="text-sm font-medium text-purple-900">{taskStats.total}</p>
                <p className="text-xs text-purple-700">Total</p>
              </div>
            </div>
          </div>

          {/* Completion Summary */}
          {taskStats.total > 0 && (
            <p className="text-sm text-gray-600 text-center pt-2">
              {taskStats.completed} of {taskStats.total} tasks completed
            </p>
          )}

          {taskStats.total === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No tasks added yet. Progress will update automatically as tasks are completed.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
