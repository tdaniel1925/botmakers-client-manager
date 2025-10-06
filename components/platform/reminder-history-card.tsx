/**
 * Reminder History Card
 * Displays reminder history and performance metrics for an onboarding session
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  MailOpen,
  MousePointerClick,
  Clock,
  CheckCircle,
  XCircle,
  BanIcon,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { getSessionRemindersAction, sendManualReminderAction } from "@/actions/reminder-actions";
import { formatDistanceToNow } from "date-fns";

interface ReminderHistoryCardProps {
  sessionId: string;
}

export function ReminderHistoryCard({ sessionId }: ReminderHistoryCardProps) {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadReminders();
  }, [sessionId]);

  const loadReminders = async () => {
    setLoading(true);
    const result = await getSessionRemindersAction(sessionId);
    if (result.success && result.data) {
      setReminders(result.data);
    }
    setLoading(false);
  };

  const handleResend = async (reminderId: string) => {
    setSending(true);
    const result = await sendManualReminderAction(sessionId);
    if (result.success) {
      toast.success("Reminder sent successfully!");
      loadReminders();
    } else {
      toast.error(result.error || "Failed to send reminder");
    }
    setSending(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "cancelled":
        return <BanIcon className="h-4 w-4 text-gray-400" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Mail className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "cancelled":
        return "bg-gray-100 text-gray-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getReminderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      initial: "Initial",
      gentle: "Gentle Reminder",
      encouragement: "Encouragement",
      final: "Final Reminder",
      custom: "Custom",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (reminders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            No reminders scheduled yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = {
    total: reminders.length,
    sent: reminders.filter((r) => r.status === "sent").length,
    opened: reminders.filter((r) => r.openedAt).length,
    clicked: reminders.filter((r) => r.clickedAt).length,
  };

  const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : "0";
  const clickRate = stats.sent > 0 ? ((stats.clicked / stats.sent) * 100).toFixed(1) : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Reminders ({stats.total})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-2xl font-bold text-gray-900">{stats.sent}</div>
            <div className="text-xs text-gray-600">Sent</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-2">
            <div className="text-2xl font-bold text-blue-600">{openRate}%</div>
            <div className="text-xs text-gray-600">Open Rate</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2">
            <div className="text-2xl font-bold text-purple-600">{clickRate}%</div>
            <div className="text-xs text-gray-600">Click Rate</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {reminders.map((reminder, index) => (
            <div
              key={reminder.id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg relative"
            >
              {/* Timeline connector */}
              {index < reminders.length - 1 && (
                <div className="absolute left-[19px] top-[40px] w-0.5 h-[calc(100%+4px)] bg-gray-200" />
              )}

              {/* Status icon */}
              <div className="flex-shrink-0 mt-0.5">{getStatusIcon(reminder.status)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <div className="font-medium text-sm text-gray-900">
                      {getReminderTypeLabel(reminder.reminderType)}
                    </div>
                    <div className="text-xs text-gray-600">{reminder.emailSubject}</div>
                  </div>
                  <Badge variant="secondary" className={getStatusColor(reminder.status)}>
                    {reminder.status}
                  </Badge>
                </div>

                {/* Timing */}
                <div className="text-xs text-gray-500 space-y-0.5">
                  {reminder.status === "pending" && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Scheduled: {new Date(reminder.scheduledAt).toLocaleDateString()}
                    </div>
                  )}
                  {reminder.sentAt && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Sent {formatDistanceToNow(new Date(reminder.sentAt), { addSuffix: true })}
                    </div>
                  )}
                  {reminder.openedAt && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <MailOpen className="h-3 w-3" />
                      Opened{" "}
                      {formatDistanceToNow(new Date(reminder.openedAt), { addSuffix: true })}
                    </div>
                  )}
                  {reminder.clickedAt && (
                    <div className="flex items-center gap-1 text-purple-600">
                      <MousePointerClick className="h-3 w-3" />
                      Clicked{" "}
                      {formatDistanceToNow(new Date(reminder.clickedAt), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="pt-2 border-t">
          <Button
            onClick={() => handleResend("")}
            disabled={sending}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${sending ? "animate-spin" : ""}`} />
            Send Another Reminder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
