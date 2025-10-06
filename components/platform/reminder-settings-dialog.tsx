/**
 * Reminder Settings Dialog
 * Configure reminder schedules and send manual reminders
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Bell, Send, Settings, Info } from "lucide-react";
import { toast } from "sonner";
import {
  scheduleRemindersAction,
  sendManualReminderAction,
  cancelRemindersAction,
  updateReminderScheduleAction,
} from "@/actions/reminder-actions";

interface ReminderSettingsDialogProps {
  sessionId: string;
  currentSchedule?: string;
  remindersEnabled?: boolean;
  onUpdate?: () => void;
  trigger?: React.ReactNode;
}

export function ReminderSettingsDialog({
  sessionId,
  currentSchedule = "standard",
  remindersEnabled = true,
  onUpdate,
  trigger,
}: ReminderSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(remindersEnabled);
  const [schedule, setSchedule] = useState(currentSchedule);
  const [customSubject, setCustomSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const scheduleInfo = {
    standard: {
      name: "Standard",
      description: "Balanced approach for most projects",
      timeline: "Day 2, Day 5, Day 7",
    },
    aggressive: {
      name: "Aggressive",
      description: "Fast-paced for urgent projects",
      timeline: "Day 1, Day 3, Day 5",
    },
    gentle: {
      name: "Gentle",
      description: "Relaxed pace for less urgent work",
      timeline: "Day 3, Day 7, Day 10",
    },
  };

  const handleSaveSettings = async () => {
    setSaving(true);

    try {
      if (!enabled) {
        // Cancel all pending reminders
        const result = await cancelRemindersAction(sessionId);
        if (result.success) {
          toast.success("Reminders disabled and cancelled");
        } else {
          toast.error(result.error || "Failed to cancel reminders");
        }
      } else if (schedule !== currentSchedule) {
        // Update schedule
        const result = await updateReminderScheduleAction(sessionId, schedule as any);
        if (result.success) {
          toast.success("Reminder schedule updated");
        } else {
          toast.error(result.error || "Failed to update schedule");
        }
      } else {
        // Schedule new reminders if none exist
        const result = await scheduleRemindersAction(sessionId, schedule as any);
        if (result.success) {
          toast.success(
            `Scheduled ${result.data?.remindersScheduled || 0} reminders`
          );
        } else {
          toast.error(result.error || "Failed to schedule reminders");
        }
      }

      onUpdate?.();
      setOpen(false);
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleSendManual = async () => {
    if (customSubject && !customMessage) {
      toast.error("Please provide a message with your custom subject");
      return;
    }

    setSending(true);

    const result = await sendManualReminderAction(
      sessionId,
      customSubject || undefined,
      customMessage || undefined
    );

    if (result.success) {
      toast.success("Reminder sent successfully!");
      setCustomSubject("");
      setCustomMessage("");
      onUpdate?.();
    } else {
      toast.error(result.error || "Failed to send reminder");
    }

    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Manage Reminders
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Reminder Settings
          </DialogTitle>
          <DialogDescription>
            Configure automated reminder emails to encourage onboarding completion
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="schedule" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule">
              <Settings className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </TabsTrigger>
          </TabsList>

          {/* Schedule Settings Tab */}
          <TabsContent value="schedule" className="space-y-4 mt-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="enable-reminders" className="font-medium">
                  Enable Automated Reminders
                </Label>
                <p className="text-sm text-gray-600">
                  Send timed reminder emails to clients
                </p>
              </div>
              <Switch
                id="enable-reminders"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>

            {/* Schedule Selection */}
            {enabled && (
              <div className="space-y-3">
                <Label>Reminder Schedule</Label>
                <div className="space-y-2">
                  {(Object.keys(scheduleInfo) as Array<keyof typeof scheduleInfo>).map(
                    (key) => (
                      <Card
                        key={key}
                        className={`p-4 cursor-pointer transition-all ${
                          schedule === key
                            ? "border-purple-600 bg-purple-50"
                            : "hover:border-gray-400"
                        }`}
                        onClick={() => setSchedule(key)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {scheduleInfo[key].name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {scheduleInfo[key].description}
                            </div>
                            <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              {scheduleInfo[key].timeline}
                            </div>
                          </div>
                          <div
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                              schedule === key
                                ? "border-purple-600 bg-purple-600"
                                : "border-gray-300"
                            }`}
                          >
                            {schedule === key && (
                              <div className="h-2 w-2 bg-white rounded-full" />
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  )}
                </div>

                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <div className="font-medium mb-1">How it works:</div>
                  <ul className="space-y-1 text-xs">
                    <li>• Reminders are sent automatically based on your schedule</li>
                    <li>• No reminders sent if client is actively working</li>
                    <li>• No reminders sent after onboarding is completed</li>
                    <li>• Email tracking provides open and click rates</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </TabsContent>

          {/* Manual Send Tab */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="manual-subject" className="text-sm">
                  Custom Subject (optional)
                </Label>
                <Input
                  id="manual-subject"
                  placeholder="Leave empty to use default gentle reminder"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If left empty, we'll use a default gentle reminder email
                </p>
              </div>

              <div>
                <Label htmlFor="manual-message" className="text-sm">
                  Custom Message (optional)
                </Label>
                <Textarea
                  id="manual-message"
                  placeholder="Enter your custom message..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={6}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Personalize your reminder with a custom message
                </p>
              </div>

              {/* Preview */}
              {(customSubject || customMessage) && (
                <Card className="p-4 bg-gray-50">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Preview:
                  </div>
                  {customSubject && (
                    <div className="text-sm mb-2">
                      <span className="font-medium">Subject:</span> {customSubject}
                    </div>
                  )}
                  {customMessage && (
                    <div className="text-sm whitespace-pre-wrap text-gray-600">
                      {customMessage}
                    </div>
                  )}
                </Card>
              )}

              {/* Send Button */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendManual} disabled={sending}>
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? "Sending..." : "Send Now"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
