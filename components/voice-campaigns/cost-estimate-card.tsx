"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { DollarSign, TrendingUp, Info, ExternalLink } from "lucide-react";
import {
  calculateEstimatedCost,
  estimateCallVolumeByGoal,
  estimateCallDurationByGoal,
  type CostEstimate,
} from "@/lib/pricing-calculator";

interface CostEstimateCardProps {
  provider: string;
  campaignGoal?: string;
  onCostCalculated?: (estimate: CostEstimate) => void;
}

export function CostEstimateCard({
  provider,
  campaignGoal = "custom",
  onCostCalculated,
}: CostEstimateCardProps) {
  const volumeEstimates = estimateCallVolumeByGoal(campaignGoal);
  const defaultDuration = estimateCallDurationByGoal(campaignGoal);

  const [callVolume, setCallVolume] = useState(volumeEstimates.midEstimate);
  const [avgDuration, setAvgDuration] = useState(defaultDuration);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);

  // Recalculate when inputs change
  useEffect(() => {
    try {
      const newEstimate = calculateEstimatedCost(provider, callVolume, avgDuration);
      setEstimate(newEstimate);
      onCostCalculated?.(newEstimate);
    } catch (error) {
      console.error("Cost calculation error:", error);
    }
  }, [provider, callVolume, avgDuration, onCostCalculated]);

  // Update estimates when goal changes
  useEffect(() => {
    const newVolumes = estimateCallVolumeByGoal(campaignGoal);
    const newDuration = estimateCallDurationByGoal(campaignGoal);
    setCallVolume(newVolumes.midEstimate);
    setAvgDuration(newDuration);
  }, [campaignGoal]);

  if (!estimate) {
    return null;
  }

  const isHighCost = estimate.monthlyTotal > 500;

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Estimated Monthly Cost
          </CardTitle>
          <Badge variant="outline" className="text-xs uppercase">
            {estimate.provider}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Cost Display */}
        <div className="text-center p-6 bg-white rounded-lg border-2 border-blue-200">
          <div className="text-4xl font-bold text-blue-600">
            ${estimate.monthlyTotal.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 mt-1">per month</div>
          {estimate.setup > 0 && (
            <div className="text-xs text-amber-600 mt-2">
              + ${estimate.setup.toFixed(2)} one-time setup fee
            </div>
          )}
        </div>

        {/* Call Volume Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Expected Monthly Calls
            </label>
            <span className="text-sm font-semibold text-blue-600">
              {callVolume} calls
            </span>
          </div>
          <Slider
            value={[callVolume]}
            onValueChange={([value]) => setCallVolume(value)}
            min={10}
            max={2000}
            step={10}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>10</span>
            <span>1,000</span>
            <span>2,000</span>
          </div>
        </div>

        {/* Average Duration Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Average Call Duration
            </label>
            <span className="text-sm font-semibold text-blue-600">
              {avgDuration} min
            </span>
          </div>
          <Slider
            value={[avgDuration]}
            onValueChange={([value]) => setAvgDuration(value)}
            min={1}
            max={30}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1 min</span>
            <span>15 min</span>
            <span>30 min</span>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-2 pt-4 border-t">
          <div className="text-sm font-semibold mb-3">Cost Breakdown</div>
          {estimate.breakdown.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-600">
                {item.label}
                {item.recurring && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Monthly
                  </Badge>
                )}
              </span>
              <span className="font-mono font-semibold">
                ${item.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Details */}
        <div className="space-y-1 text-xs text-gray-500 pt-2 border-t">
          <div className="flex justify-between">
            <span>Per-minute rate:</span>
            <span className="font-mono">${estimate.perMinuteRate}/min</span>
          </div>
          <div className="flex justify-between">
            <span>Total minutes:</span>
            <span className="font-mono">{estimate.estimatedCallMinutes.toFixed(0)} min</span>
          </div>
        </div>

        {/* High Cost Warning */}
        {isHighCost && (
          <Alert className="bg-amber-50 border-amber-200">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-900">
              <strong>High volume detected.</strong> Consider enterprise pricing or bulk discounts from your provider.
            </AlertDescription>
          </Alert>
        )}

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Estimate only.</strong> Actual costs may vary based on usage, peak times, and provider-specific factors.
            <a
              href="#"
              className="inline-flex items-center gap-1 ml-1 text-blue-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                window.open(`https://docs.${provider}.ai/pricing`, "_blank");
              }}
            >
              View official pricing
              <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
