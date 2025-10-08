"use client";

import { useState } from "react";
import { type SelectCallRecord } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CallDetailModal } from "./call-detail-modal";
import { formatDistanceToNow } from "date-fns";
import { Phone, Clock, User, AlertTriangle } from "lucide-react";

interface CallsListProps {
  calls: SelectCallRecord[];
}

export function CallsList({ calls }: CallsListProps) {
  const [selectedCall, setSelectedCall] = useState<SelectCallRecord | null>(null);
  
  if (calls.length === 0) {
    return (
      <div className="text-center py-12">
        <Phone className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No calls yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Calls will appear here once your webhook receives data from AI voice agents.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-3">
        {calls.map((call) => (
          <div
            key={call.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedCall(call)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-lg">
                    {call.callerName || "Unknown Caller"}
                  </h4>
                  {call.callTopic && (
                    <Badge variant="outline">{call.callTopic}</Badge>
                  )}
                  {getSentimentBadge(call.callSentiment)}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  {call.callerPhone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {call.callerPhone}
                    </div>
                  )}
                  {call.callDurationSeconds && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.round(call.callDurationSeconds / 60)}m
                    </div>
                  )}
                  {call.callTimestamp && (
                    <span className="text-gray-500">
                      {formatDistanceToNow(new Date(call.callTimestamp), { addSuffix: true })}
                    </span>
                  )}
                </div>
                
                {call.callSummary && (
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    {call.callSummary}
                  </p>
                )}
                
                {call.followUpNeeded && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">
                      Follow-up needed {call.followUpUrgency && `(${call.followUpUrgency})`}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {call.callQualityRating && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{call.callQualityRating}/10</span>
                  </div>
                )}
                <Badge variant={call.aiAnalysisStatus === "completed" ? "default" : "secondary"}>
                  {call.aiAnalysisStatus}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedCall && (
        <CallDetailModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </>
  );
}

function getSentimentBadge(sentiment: string | null) {
  if (!sentiment) return null;
  
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    positive: "default",
    neutral: "secondary",
    negative: "destructive",
  };
  
  return (
    <Badge variant={variants[sentiment] || "secondary"}>
      {sentiment}
    </Badge>
  );
}
