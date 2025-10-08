"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Plus } from "lucide-react";

interface MessageTemplateFormProps {
  campaignId?: string;
  projectId: string;
  onSave?: (template: any) => void;
}

const TRIGGER_OPTIONS = [
  { value: "after_call", label: "After Call Completes" },
  { value: "after_voicemail", label: "After Voicemail Detected" },
  { value: "after_no_answer", label: "After No Answer" },
  { value: "positive_sentiment", label: "When Sentiment is Positive" },
  { value: "follow_up_needed", label: "When Follow-up Needed" },
];

const TIMING_OPTIONS = [
  { value: "immediately", label: "Immediately" },
  { value: "after_5_min", label: "After 5 minutes" },
  { value: "after_1_hour", label: "After 1 hour" },
  { value: "after_24_hours", label: "After 24 hours" },
];

const AVAILABLE_VARIABLES = [
  "{{contact_name}}",
  "{{first_name}}",
  "{{last_name}}",
  "{{company}}",
  "{{agent_name}}",
  "{{call_duration}}",
  "{{call_summary}}",
];

export function MessageTemplateForm({ campaignId, projectId, onSave }: MessageTemplateFormProps) {
  const [type, setType] = useState<"sms" | "email">("sms");
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("after_call");
  const [timing, setTiming] = useState("immediately");
  const [smsMessage, setSmsMessage] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const handleInsertVariable = (variable: string) => {
    if (type === "sms") {
      setSmsMessage((prev) => prev + " " + variable);
    } else {
      setEmailBody((prev) => prev + " " + variable);
    }
  };

  const handleSave = () => {
    const template = {
      campaignId,
      projectId,
      type,
      name,
      smsMessage: type === "sms" ? smsMessage : null,
      emailSubject: type === "email" ? emailSubject : null,
      emailBody: type === "email" ? emailBody : null,
      triggerConditions: {
        when: trigger,
        timing,
      },
      availableVariables: AVAILABLE_VARIABLES,
      isActive: true,
    };

    if (onSave) {
      onSave(template);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === "sms" ? <MessageSquare className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
          Create Message Template
        </CardTitle>
        <CardDescription>
          Send automated messages based on call outcomes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Type */}
        <div className="space-y-2">
          <Label>Message Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as "sms" | "email")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sms">SMS Message</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Template Name */}
        <div className="space-y-2">
          <Label>Template Name</Label>
          <Input
            placeholder="e.g., Positive Call Follow-up"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Trigger Condition */}
        <div className="space-y-2">
          <Label>When to Send</Label>
          <Select value={trigger} onValueChange={setTrigger}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRIGGER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Send Timing */}
        <div className="space-y-2">
          <Label>Send Timing</Label>
          <Select value={timing} onValueChange={setTiming}>
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
        </div>

        {/* Available Variables */}
        <div className="space-y-2">
          <Label>Available Variables</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_VARIABLES.map((variable) => (
              <Badge
                key={variable}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleInsertVariable(variable)}
              >
                {variable}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Click to insert into message</p>
        </div>

        {/* SMS Message */}
        {type === "sms" && (
          <div className="space-y-2">
            <Label>SMS Message</Label>
            <Textarea
              placeholder="Hi {{contact_name}}, thanks for taking our call! ..."
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              rows={4}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {smsMessage.length}/160 characters
            </p>
          </div>
        )}

        {/* Email Subject & Body */}
        {type === "email" && (
          <>
            <div className="space-y-2">
              <Label>Email Subject</Label>
              <Input
                placeholder="Thanks for your time, {{contact_name}}!"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea
                placeholder="Hi {{contact_name}},&#10;&#10;Thank you for speaking with us today..."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={8}
              />
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
