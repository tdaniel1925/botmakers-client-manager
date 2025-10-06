/**
 * Healing Event Card Component
 * Displays a self-healing event with AI analysis and healing results
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/date-utils";
import { CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";

type HealingEvent = {
  id: string;
  eventType: string;
  errorCategory: string;
  errorSource: string;
  errorMessage: string;
  severity: string;
  healingResult: string | null;
  healingStrategy: string | null;
  healingActions: any;
  aiAnalysis: any;
  aiConfidenceScore: string | null;
  healingDurationMs: number | null;
  createdAt: Date;
};

interface HealingEventCardProps {
  event: HealingEvent;
}

export function HealingEventCard({ event }: HealingEventCardProps) {
  const getBorderColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-600';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-400';
    }
  };
  
  const getStatusIcon = (result: string | null) => {
    switch (result) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };
  
  const getResultBadgeVariant = (result: string | null): "default" | "destructive" | "outline" | "secondary" => {
    switch (result) {
      case 'success':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'partial':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  return (
    <Card className={`border-l-4 ${getBorderColor(event.severity)} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(event.healingResult)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={getResultBadgeVariant(event.healingResult)}>
                  {event.healingResult || 'pending'}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {event.errorCategory.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline" className={
                  event.severity === 'critical' ? 'bg-red-50 text-red-700 border-red-300' :
                  event.severity === 'high' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                  event.severity === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                  'bg-green-50 text-green-700 border-green-300'
                }>
                  {event.severity}
                </Badge>
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatRelativeDate(event.createdAt)}
          </span>
        </div>
        
        {/* Error Details */}
        <div className="mb-3">
          <p className="font-medium text-gray-900 mb-1">{event.errorMessage}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Source:</span> {event.errorSource}
          </p>
        </div>
        
        {/* AI Analysis */}
        {event.aiAnalysis && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">AI Diagnosis</p>
                <p className="text-sm text-blue-800">{event.aiAnalysis.diagnosis}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-blue-700">
                  <span>
                    <span className="font-medium">Confidence:</span>{' '}
                    {event.aiConfidenceScore ? `${(parseFloat(event.aiConfidenceScore) * 100).toFixed(0)}%` : 'N/A'}
                  </span>
                  {event.healingStrategy && (
                    <span>
                      <span className="font-medium">Strategy:</span> {event.healingStrategy}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Healing Actions */}
        {event.healingActions && Array.isArray(event.healingActions) && event.healingActions.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Actions Taken:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {event.healingActions.map((action: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">→</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Duration */}
        {event.healingDurationMs !== null && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {event.healingResult === 'success' ? 'Healed' : 'Attempted'} in{' '}
              <span className="font-medium text-gray-700">{event.healingDurationMs}ms</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
