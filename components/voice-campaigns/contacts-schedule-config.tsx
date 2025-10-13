"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, Calendar, MessageSquare, Mail, Save, Info, Clock } from "lucide-react";
import { ContactListUpload } from "./contact-list-upload";
import { ScheduleConfigForm, type ScheduleConfig } from "./schedule-config-form";

export interface SMSSettings {
  followUps: {
    enabled: boolean;
    template: string;
  };
  notifications: {
    enabled: boolean;
    template: string;
    triggers: Array<'all_calls' | 'qualified_leads' | 'failed_calls'>;
  };
}

export interface EmailSettings {
  followUps: {
    enabled: boolean;
    subject: string;
    body: string;
  };
  notifications: {
    enabled: boolean;
    frequency: 'realtime' | 'daily' | 'weekly';
  };
}

export interface ContactsScheduleConfig {
  contacts: any[];
  scheduleConfig?: ScheduleConfig;
  smsSettings: SMSSettings;
  emailSettings: EmailSettings;
}

interface ContactsScheduleConfigProps {
  campaignType?: 'inbound' | 'outbound';
  value: ContactsScheduleConfig;
  onChange: (config: ContactsScheduleConfig) => void;
  onSaveDraft?: () => void;
}

export function ContactsScheduleConfigComponent({
  campaignType,
  value,
  onChange,
  onSaveDraft,
}: ContactsScheduleConfigProps) {
  const [showSchedule, setShowSchedule] = useState(campaignType === 'outbound');

  const updateConfig = (updates: Partial<ContactsScheduleConfig>) => {
    onChange({ ...value, ...updates });
  };

  const updateSMSSettings = (updates: Partial<SMSSettings>) => {
    updateConfig({
      smsSettings: { ...value.smsSettings, ...updates }
    });
  };

  const updateEmailSettings = (updates: Partial<EmailSettings>) => {
    updateConfig({
      emailSettings: { ...value.emailSettings, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Contact Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Contact Management
          </CardTitle>
          <CardDescription>
            Upload your contact list for the campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactListUpload
            campaignId="draft"
            onUploadComplete={(stats) => updateConfig({ contacts: stats?.imported || [] })}
          />
          
          {value.contacts && value.contacts.length > 0 && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                <strong>{value.contacts.length} contacts</strong> uploaded and ready
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Outbound Schedule (Only for Outbound Campaigns) */}
      {campaignType === 'outbound' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Outbound Call Schedule
            </CardTitle>
            <CardDescription>
              Configure when your campaign makes outbound calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleConfigForm
              value={value.scheduleConfig || {
                callDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                callWindows: [
                  { start: "09:00", end: "12:00", label: "Morning" },
                  { start: "13:00", end: "17:00", label: "Afternoon" },
                ],
                respectTimezones: true,
                maxAttemptsPerContact: 3,
                timeBetweenAttempts: 24,
                maxConcurrentCalls: 10,
              }}
              onChange={(scheduleConfig) => updateConfig({ scheduleConfig })}
              campaignType="outbound"
            />
          </CardContent>
        </Card>
      )}

      {/* Section 3: SMS Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            SMS Automation
            <Badge variant="secondary" className="ml-2">Optional</Badge>
          </CardTitle>
          <CardDescription>
            Send automated SMS messages to contacts and receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SMS Follow-ups to Contacts */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sms-followups"
                checked={value.smsSettings.followUps.enabled}
                onCheckedChange={(checked) =>
                  updateSMSSettings({
                    followUps: { ...value.smsSettings.followUps, enabled: !!checked }
                  })
                }
              />
              <Label htmlFor="sms-followups" className="font-semibold cursor-pointer">
                Send SMS follow-ups to contacts after calls
              </Label>
            </div>

            {value.smsSettings.followUps.enabled && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="sms-followup-template">SMS Template</Label>
                <Textarea
                  id="sms-followup-template"
                  value={value.smsSettings.followUps.template}
                  onChange={(e) =>
                    updateSMSSettings({
                      followUps: { ...value.smsSettings.followUps, template: e.target.value }
                    })
                  }
                  placeholder="Hi {contact_name}, thanks for speaking with {agent_name} today. {call_summary}"
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500">
                  Available variables: {'{contact_name}'}, {'{agent_name}'}, {'{call_summary}'}, {'{company_name}'}
                </p>
              </div>
            )}
          </div>

          <div className="border-t pt-4"></div>

          {/* SMS Notifications to Owner */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sms-notifications"
                checked={value.smsSettings.notifications.enabled}
                onCheckedChange={(checked) =>
                  updateSMSSettings({
                    notifications: { ...value.smsSettings.notifications, enabled: !!checked }
                  })
                }
              />
              <Label htmlFor="sms-notifications" className="font-semibold cursor-pointer">
                Send SMS notifications to me about calls
              </Label>
            </div>

            {value.smsSettings.notifications.enabled && (
              <div className="ml-6 space-y-4">
                <div>
                  <Label htmlFor="sms-notification-template">Notification Template</Label>
                  <Textarea
                    id="sms-notification-template"
                    value={value.smsSettings.notifications.template}
                    onChange={(e) =>
                      updateSMSSettings({
                        notifications: { ...value.smsSettings.notifications, template: e.target.value }
                      })
                    }
                    placeholder="New call from {contact_name}: {call_outcome}"
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Send notifications for:</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trigger-all"
                        checked={value.smsSettings.notifications.triggers.includes('all_calls')}
                        onCheckedChange={(checked) => {
                          const triggers = checked
                            ? [...value.smsSettings.notifications.triggers, 'all_calls']
                            : value.smsSettings.notifications.triggers.filter(t => t !== 'all_calls');
                          updateSMSSettings({
                            notifications: { ...value.smsSettings.notifications, triggers: triggers as any }
                          });
                        }}
                      />
                      <Label htmlFor="trigger-all" className="cursor-pointer">All calls</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trigger-qualified"
                        checked={value.smsSettings.notifications.triggers.includes('qualified_leads')}
                        onCheckedChange={(checked) => {
                          const triggers = checked
                            ? [...value.smsSettings.notifications.triggers, 'qualified_leads']
                            : value.smsSettings.notifications.triggers.filter(t => t !== 'qualified_leads');
                          updateSMSSettings({
                            notifications: { ...value.smsSettings.notifications, triggers: triggers as any }
                          });
                        }}
                      />
                      <Label htmlFor="trigger-qualified" className="cursor-pointer">Qualified leads only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trigger-failed"
                        checked={value.smsSettings.notifications.triggers.includes('failed_calls')}
                        onCheckedChange={(checked) => {
                          const triggers = checked
                            ? [...value.smsSettings.notifications.triggers, 'failed_calls']
                            : value.smsSettings.notifications.triggers.filter(t => t !== 'failed_calls');
                          updateSMSSettings({
                            notifications: { ...value.smsSettings.notifications, triggers: triggers as any }
                          });
                        }}
                      />
                      <Label htmlFor="trigger-failed" className="cursor-pointer">Failed calls</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Email Automation
            <Badge variant="secondary" className="ml-2">Optional</Badge>
          </CardTitle>
          <CardDescription>
            Send automated emails to contacts and receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Follow-ups to Contacts */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email-followups"
                checked={value.emailSettings.followUps.enabled}
                onCheckedChange={(checked) =>
                  updateEmailSettings({
                    followUps: { ...value.emailSettings.followUps, enabled: !!checked }
                  })
                }
              />
              <Label htmlFor="email-followups" className="font-semibold cursor-pointer">
                Send email follow-ups to contacts after calls
              </Label>
            </div>

            {value.emailSettings.followUps.enabled && (
              <div className="ml-6 space-y-4">
                <div>
                  <Label htmlFor="email-subject">Email Subject</Label>
                  <Input
                    id="email-subject"
                    value={value.emailSettings.followUps.subject}
                    onChange={(e) =>
                      updateEmailSettings({
                        followUps: { ...value.emailSettings.followUps, subject: e.target.value }
                      })
                    }
                    placeholder="Thanks for speaking with us today, {contact_name}"
                  />
                </div>

                <div>
                  <Label htmlFor="email-body">Email Body</Label>
                  <Textarea
                    id="email-body"
                    value={value.emailSettings.followUps.body}
                    onChange={(e) =>
                      updateEmailSettings({
                        followUps: { ...value.emailSettings.followUps, body: e.target.value }
                      })
                    }
                    placeholder="Hi {contact_name},&#10;&#10;Thank you for speaking with {agent_name} today. Here's a summary of our conversation:&#10;&#10;{call_summary}&#10;&#10;Best regards,&#10;{company_name}"
                    className="min-h-[150px]"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Available variables: {'{contact_name}'}, {'{agent_name}'}, {'{call_summary}'}, {'{company_name}'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4"></div>

          {/* Email Notifications to Owner */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email-notifications"
                checked={value.emailSettings.notifications.enabled}
                onCheckedChange={(checked) =>
                  updateEmailSettings({
                    notifications: { ...value.emailSettings.notifications, enabled: !!checked }
                  })
                }
              />
              <Label htmlFor="email-notifications" className="font-semibold cursor-pointer">
                Send email notifications to me about campaign performance
              </Label>
            </div>

            {value.emailSettings.notifications.enabled && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="email-frequency">Notification Frequency</Label>
                <Select
                  value={value.emailSettings.notifications.frequency}
                  onValueChange={(frequency: 'realtime' | 'daily' | 'weekly') =>
                    updateEmailSettings({
                      notifications: { ...value.emailSettings.notifications, frequency }
                    })
                  }
                >
                  <SelectTrigger id="email-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time (after each call)</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Options */}
      {onSaveDraft && (
        <div className="flex justify-between items-center pt-4">
          <Button variant="outline" onClick={onSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft & Continue Later
          </Button>
          
          <Alert className="flex-1 mx-4">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Your progress is automatically saved as you go
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}






