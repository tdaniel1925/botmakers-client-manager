/**
 * Override Progress Dialog Component
 * Dialog for platform admins to manually override project progress
 */

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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { updateProjectProgressAction } from "@/actions/projects-actions";

interface OverrideProgressDialogProps {
  projectId: string;
  currentProgress: number;
  autoCalculatedProgress: number;
  isManualOverride: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProgressUpdated?: () => void;
}

export function OverrideProgressDialog({
  projectId,
  currentProgress,
  autoCalculatedProgress,
  isManualOverride,
  open,
  onOpenChange,
  onProgressUpdated,
}: OverrideProgressDialogProps) {
  const [percentage, setPercentage] = useState(currentProgress);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (percentage < 0 || percentage > 100) {
      toast.error("Progress must be between 0 and 100");
      return;
    }

    setIsSubmitting(true);
    const result = await updateProjectProgressAction(projectId, percentage);
    setIsSubmitting(false);

    if (result.isSuccess) {
      toast.success("Progress updated successfully");
      onOpenChange(false);
      if (onProgressUpdated) {
        onProgressUpdated();
      }
    } else {
      toast.error(result.message || "Failed to update progress");
    }
  };

  const handleResetToAuto = async () => {
    setIsSubmitting(true);
    const result = await updateProjectProgressAction(projectId, null);
    setIsSubmitting(false);

    if (result.isSuccess) {
      toast.success("Progress reset to automatic calculation");
      onOpenChange(false);
      if (onProgressUpdated) {
        onProgressUpdated();
      }
    } else {
      toast.error(result.message || "Failed to reset progress");
    }
  };

  const handleSliderChange = (value: number[]) => {
    setPercentage(value[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Override Project Progress</DialogTitle>
          <DialogDescription>
            Manually set the project progress percentage. This will override the automatic calculation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Current Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">Current Status</p>
                <p className="text-sm text-blue-800">
                  Auto-calculated: <strong>{autoCalculatedProgress}%</strong>
                  {isManualOverride && (
                    <>
                      {" • "}Current override: <strong>{currentProgress}%</strong>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Progress Percentage</Label>
              <Badge variant="outline">{percentage}%</Badge>
            </div>
            
            <Slider
              value={[percentage]}
              onValueChange={handleSliderChange}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />

            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Number Input */}
          <div className="space-y-2">
            <Label htmlFor="percentage-input">Or enter a value</Label>
            <Input
              id="percentage-input"
              type="number"
              min={0}
              max={100}
              value={percentage}
              onChange={(e) => setPercentage(parseInt(e.target.value) || 0)}
              disabled={isSubmitting}
            />
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> This will override automatic progress calculation. 
              The progress will not update automatically when tasks are completed unless you reset to auto.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isManualOverride && (
            <Button
              variant="outline"
              onClick={handleResetToAuto}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Auto
            </Button>
          )}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              {isSubmitting ? "Updating..." : "Update Progress"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
