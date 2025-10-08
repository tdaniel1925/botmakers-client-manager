"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Clock, DollarSign, Calendar, MessageSquare, Database } from "lucide-react";
import type { SelectCallRecord } from "@/db/schema";

interface CallTranscriptDialogProps {
  callRecord: SelectCallRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CallTranscriptDialog({
  callRecord,
  open,
  onOpenChange,
}: CallTranscriptDialogProps) {
  if (!callRecord) return null;

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCost = (cents: number | null) => {
    if (!cents) return "$0.00";
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-300";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "failed":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Call Details</DialogTitle>
            <Badge
              variant="outline"
              className={getStatusColor(callRecord.status || "unknown")}
            >
              {callRecord.status || "unknown"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Call Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div className="text-sm">
              <div className="text-gray-500">Date</div>
              <div className="font-medium">
                {new Date(callRecord.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <div className="text-sm">
              <div className="text-gray-500">Phone</div>
              <div className="font-mono font-medium">
                {callRecord.callerNumber || callRecord.recipientNumber || "Unknown"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <div className="text-sm">
              <div className="text-gray-500">Duration</div>
              <div className="font-medium">{formatDuration(callRecord.duration)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <div className="text-sm">
              <div className="text-gray-500">Cost</div>
              <div className="font-medium">{formatCost(callRecord.cost)}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transcript" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transcript">
              <MessageSquare className="h-4 w-4 mr-2" />
              Transcript
            </TabsTrigger>
            <TabsTrigger value="structured">
              <Database className="h-4 w-4 mr-2" />
              Structured Data
            </TabsTrigger>
            <TabsTrigger value="raw">
              Raw Data
            </TabsTrigger>
          </TabsList>

          {/* Transcript Tab */}
          <TabsContent value="transcript" className="space-y-4">
            {callRecord.transcript ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">
                      {callRecord.transcript}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No transcript available for this call</p>
              </div>
            )}
          </TabsContent>

          {/* Structured Data Tab */}
          <TabsContent value="structured" className="space-y-4">
            {callRecord.structuredData ? (
              <Card>
                <CardContent className="pt-6">
                  <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(callRecord.structuredData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No structured data available for this call</p>
              </div>
            )}
          </TabsContent>

          {/* Raw Data Tab */}
          <TabsContent value="raw" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(callRecord.rawPayload, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
