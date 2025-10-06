"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, User, FileEdit } from "lucide-react";
import { useState, useEffect } from "react";

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: any;
  createdAt: Date;
}

interface AuditLogViewerProps {
  logs: AuditLog[];
  title?: string;
}

export function AuditLogViewer({ logs, title = "Activity Log" }: AuditLogViewerProps) {
  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "default";
      case "update":
        return "secondary";
      case "delete":
        return "destructive";
      case "suspend":
        return "destructive";
      case "activate":
        return "default";
      default:
        return "outline";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionDescription = (log: AuditLog) => {
    const action = log.action.charAt(0).toUpperCase() + log.action.slice(1);
    return `${action} ${log.entityType}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No activity yet</p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border-l-2 border-gray-200 pl-4 pb-4 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileEdit className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-sm">
                        {getActionDescription(log)}
                      </span>
                      <Badge variant={getActionBadgeColor(log.action)} className="text-xs">
                        {log.action}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <User className="h-3 w-3" />
                    <span>User ID: {log.userId.slice(0, 12)}...</span>
                  </div>

                  {log.changes && typeof log.changes === "object" && (
                    <div className="bg-gray-50 rounded p-2 mt-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Changes:</p>
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

