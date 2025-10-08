"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Mail, Settings as SettingsIcon, Save, Info, AlertTriangle } from "lucide-react";

interface MessagingConfig {
  smsEnabled: boolean;
  emailEnabled: boolean;
  smsTemplateId?: string;
  emailTemplateId?: string;
  defaultSendTiming: string;
  maxMessagesPerContact: number;
  minTimeBetweenMessages: number;
}

interface Template {
  id: string;
  name: string;
  type: "sms" | "email";
  isActive: boolean;
}

interface CampaignMessagingConfigProps {
  config: MessagingConfig;
  templates: Template[];
  onSave: (config: MessagingConfig) => Promise<void>;
}

const TIMING_OPTIONS = [
  { value: "immediately", label: "Send Immediately" },
  { value: "after_5_min", label: "After 5 Minutes" },
  { value: "after_1_hour", label: "After 1 Hour" },
  { value: "after_24_hours", label: "After 24 Hours" },
];

export function CampaignMessagingConfig({
  config: initialConfig,
  templates,
  onSave,
}: CampaignMessagingConfigProps) {
  const [config, setConfig] = useState<MessagingConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const smsTemplates = templates.filter((t) => t.type === "sms" && t.isActive);
  const emailTemplates = templates.filter((t) => t.type === "email" && t.isActive);

  const updateConfig = (updates: Partial<MessagingConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(config);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving config:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = !config.smsEnabled || (config.smsEnabled && config.smsTemplateId);
  const emailValid = !config.emailEnabled || (config.emailEnabled && config.emailTemplateId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Messaging Configuration
          </h3>
          <p className="text-sm text-gray-500">
            Configure automated follow-up messages for this campaign
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving || !isValid || !emailValid}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* SMS Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>SMS Messages</CardTitle>
                <CardDescription>
                  Send automated text messages after calls
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={config.smsEnabled}
              onCheckedChange={(checked) => updateConfig({ smsEnabled: checked })}
            />
          </div>
        </CardHeader>

        {config.smsEnabled && (
          <CardContent className="space-y-4">
            {smsTemplates.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No active SMS templates available. Create an SMS template first to enable SMS messaging.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <Label>SMS Template</Label>
                <Select
                  value={config.smsTemplateId}
                  onValueChange={(value) => updateConfig({ smsTemplateId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {smsTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          {template.name}
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  This template will be used when SMS is triggered
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Email Messages</CardTitle>
                <CardDescription>
                  Send automated emails after calls
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={config.emailEnabled}
              onCheckedChange={(checked) => updateConfig({ emailEnabled: checked })}
            />
          </div>
        </CardHeader>

        {config.emailEnabled && (
          <CardContent className="space-y-4">
            {emailTemplates.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No active email templates available. Create an email template first to enable email messaging.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <Label>Email Template</Label>
                <Select
                  value={config.emailTemplateId}
                  onValueChange={(value) => updateConfig({ emailTemplateId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          {template.name}
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  This template will be used when email is triggered
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
          <CardDescription>
            Apply to both SMS and email messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Send Timing</Label>
            <Select
              value={config.defaultSendTiming}
              onValueChange={(value) => updateConfig({ defaultSendTiming: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMING_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              When messages should be sent relative to the trigger
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Messages Per Contact</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={config.maxMessagesPerContact}
                onChange={(e) =>
                  updateConfig({ maxMessagesPerContact: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-gray-500">
                Prevent spam by limiting total messages
              </p>
            </div>

            <div className="space-y-2">
              <Label>Min Hours Between Messages</Label>
              <Input
                type="number"
                min={1}
                max={168}
                value={config.minTimeBetweenMessages}
                onChange={(e) =>
                  updateConfig({ minTimeBetweenMessages: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-gray-500">
                Minimum time between consecutive messages
              </p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Rate limiting helps maintain deliverability and prevents your contacts from being overwhelmed with messages.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

