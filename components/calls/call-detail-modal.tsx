"use client";

import { type SelectCallRecord } from "@/db/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Phone, Clock, Calendar, Star } from "lucide-react";
import { format } from "date-fns";

interface CallDetailModalProps {
  call: SelectCallRecord;
  onClose: () => void;
}

export function CallDetailModal({ call, onClose }: CallDetailModalProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Call Details
            <Badge variant={call.aiAnalysisStatus === "completed" ? "default" : "secondary"}>
              {call.aiAnalysisStatus}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Call Metadata */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Call Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">Caller</p>
                  <p className="font-medium">
                    {call.callerName || "Unknown"}
                    {call.callerPhone && ` (${call.callerPhone})`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-medium">
                    {call.callDurationSeconds 
                      ? `${Math.round(call.callDurationSeconds / 60)} minutes`
                      : "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">Timestamp</p>
                  <p className="font-medium">
                    {call.callTimestamp 
                      ? format(new Date(call.callTimestamp), "PPpp")
                      : "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">Quality Rating</p>
                  <p className="font-medium">
                    {call.callQualityRating ? `${call.callQualityRating}/10` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            
            {call.audioUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Recording</p>
                <audio controls className="w-full">
                  <source src={call.audioUrl} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </section>
          
          {/* AI Analysis */}
          {call.aiAnalysisStatus === "completed" && (
            <section>
              <h3 className="text-lg font-semibold mb-3">AI Analysis</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {call.callTopic && (
                    <Badge variant="outline">{call.callTopic}</Badge>
                  )}
                  {call.callSentiment && getSentimentBadge(call.callSentiment)}
                </div>
                
                {call.callSummary && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Summary</p>
                    <p className="text-sm text-gray-600 mt-1">{call.callSummary}</p>
                  </div>
                )}
                
                {call.questionsAsked && call.questionsAsked.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Questions Asked</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
                      {call.questionsAsked.map((question, i) => (
                        <li key={i}>{question}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {call.followUpNeeded && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>
                      Follow-up Required
                      {call.followUpUrgency && ` (${call.followUpUrgency} priority)`}
                    </AlertTitle>
                    {call.followUpReason && (
                      <AlertDescription>{call.followUpReason}</AlertDescription>
                    )}
                  </Alert>
                )}
              </div>
            </section>
          )}
          
          {/* Transcript */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Full Transcript</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {call.transcript}
              </pre>
            </div>
          </section>
          
          {/* Workflow Triggers */}
          {call.workflowTriggers && call.workflowTriggers.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-3">Workflows Triggered</h3>
              <div className="flex flex-wrap gap-2">
                {call.workflowTriggers.map((workflowId, i) => (
                  <Badge key={i} variant="secondary">
                    Workflow {i + 1}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getSentimentBadge(sentiment: string) {
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    positive: "default",
    neutral: "secondary",
    negative: "destructive",
  };
  
  const colors: Record<string, string> = {
    positive: "bg-green-100 text-green-800",
    neutral: "bg-gray-100 text-gray-800",
    negative: "bg-red-100 text-red-800",
  };
  
  return (
    <Badge variant={variants[sentiment] || "secondary"}>
      {sentiment}
    </Badge>
  );
}
