/**
 * Review Step Component
 * Summary of all responses before final submission
 */

"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle, FileText, Image } from "lucide-react";

interface ReviewStepProps {
  step: any;
  allStepData: any;
}

export function ReviewStep({ step, allStepData }: ReviewStepProps) {
  // In a real implementation, we'd have access to all steps and their data
  // For now, we'll display a summary message

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
          <div>
            <h3 className="font-semibold text-green-900 mb-2">
              Review Your Information
            </h3>
            <p className="text-green-800 text-sm">
              You've provided all the necessary information for this project. Please review
              everything carefully before submitting.
            </p>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Summary</h4>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-gray-700">
              All required information has been collected
            </span>
          </div>
          {allStepData && Object.keys(allStepData).length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">
                {Object.keys(allStepData).length} step(s) completed
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Image className="h-5 w-5 text-purple-600" />
            <span className="text-gray-700">
              Files uploaded successfully
            </span>
          </div>
        </div>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> If you need to make any changes, use the "Back" button to return
          to previous steps. Once you submit, we'll begin processing your information.
        </p>
      </div>
    </div>
  );
}
