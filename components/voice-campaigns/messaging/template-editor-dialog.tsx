"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Mail, Info, Sparkles } from "lucide-react";

interface TemplateEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: any;
  campaignId: string;
  projectId: string;
  onSave: (template: any) => Promise<void>;
}

const TRIGGER_OPTIONS = [
  { value: "after_call", label: "After Call Completes", description: "Triggers when any call ends" },
  { value: "after_voicemail", label: "After Voicemail", description: "When voicemail is detected" },
  { value: "after_no_answer", label: "After No Answer", description: "When contact doesn't pick up" },
  { value: "positive_sentiment", label: "Positive Sentiment", description: "When call sentiment is positive" },
  { value: "negative_sentiment", label: "Negative Sentiment", description: "When call sentiment is negative" },
  { value: "follow_up_needed", label: "Follow-up Needed", description: "When AI flags for follow-up" },
];

const TIMING_OPTIONS = [
  { value: "immediately", label: "Immediately" },
  { value: "after_5_min", label: "After 5 minutes" },
  { value: "after_1_hour", label: "After 1 hour" },
  { value: "after_24_hours", label: "After 24 hours" },
];

const VARIABLES = [
  { tag: "{{contact_name}}", description: "Contact's full name" },
  { tag: "{{first_name}}", description: "Contact's first name" },
  { tag: "{{last_name}}", description: "Contact's last name" },
  { tag: "{{company}}", description: "Company name" },
  { tag: "{{agent_name}}", description: "AI agent's name" },
  { tag: "{{call_duration}}", description: "Call length" },
  { tag: "{{call_summary}}", description: "AI-generated summary" },
  { tag: "{{call_sentiment}}", description: "Call sentiment" },
];

export function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
  campaignId,
  projectId,
  onSave,
}: TemplateEditorDialogProps) {
  const [type, setType] = useState<"sms" | "email">("sms");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("after_call");
  const [timing, setTiming] = useState("immediately");
  const [smsMessage, setSmsMessage] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setType(template.type);
      setName(template.name);
      setDescription(template.description || "");
      setTrigger(template.triggerConditions?.when || "after_call");
      setTiming(template.triggerConditions?.timing || "immediately");
      setSmsMessage(template.smsMessage || "");
      setEmailSubject(template.emailSubject || "");
      setEmailBody(template.emailBody || "");
      setIsActive(template.isActive);
    } else {
      // Reset for new template
      setType("sms");
      setName("");
      setDescription("");
      setTrigger("after_call");
      setTiming("immediately");
      setSmsMessage("");
      setEmailSubject("");
      setEmailBody("");
      setIsActive(true);
    }
  }, [template, open]);

  const handleInsertVariable = (variable: string, field: "sms" | "subject" | "body") => {
    if (field === "sms") {
      setSmsMessage(prev => prev + " " + variable);
    } else if (field === "subject") {
      setEmailSubject(prev => prev + " " + variable);
    } else {
      setEmailBody(prev => prev + " " + variable);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const templateData = {
        id: template?.id,
        campaignId,
        projectId,
        type,
        name,
        description,
        smsMessage: type === "sms" ? smsMessage : null,
        emailSubject: type === "email" ? emailSubject : null,
        emailBody: type === "email" ? emailBody : null,
        triggerConditions: {
          when: trigger,
          timing,
        },
        isActive,
        availableVariables: VARIABLES.map(v => v.tag),
      };

      await onSave(templateData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const smsCharCount = smsMessage.length;
  const smsOver160 = smsCharCount > 160;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Template" : "Create New Template"}
          </DialogTitle>
          <DialogDescription>
            Create automated messages that send after calls based on triggers and outcomes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Thank You SMS"
                />
              </div>

              <div className="space-y-2">
                <Label>Message Type *</Label>
                <Select value={type} onValueChange={(v: "sms" | "email") => setType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        SMS
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of when this template is used"
              />
            </div>
          </div>

          {/* Triggers */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Trigger Conditions
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Send When</Label>
                <Select value={trigger} onValueChange={setTrigger}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timing</Label>
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
            </div>
          </div>

          {/* Message Content */}
          <Tabs defaultValue="content">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Message Content</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              {type === "sms" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>SMS Message *</Label>
                    <span className={`text-xs ${smsOver160 ? "text-red-600" : "text-gray-500"}`}>
                      {smsCharCount} / 160 chars
                    </span>
                  </div>
                  <Textarea
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="Hi {{first_name}}, thanks for calling! We'll follow up soon."
                    rows={4}
                    className={smsOver160 ? "border-red-300" : ""}
                  />
                  {smsOver160 && (
                    <p className="text-xs text-red-600">
                      SMS messages over 160 characters may be split into multiple messages.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Email Subject *</Label>
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Thanks for speaking with us, {{first_name}}!"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Body *</Label>
                    <Textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Hi {{contact_name}},&#10;&#10;Thank you for speaking with {{agent_name}} today...&#10;&#10;Call Summary:&#10;{{call_summary}}"
                      rows={10}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="variables" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Click a variable to insert it into your message. Variables will be automatically replaced with actual data when the message is sent.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-2">
                {VARIABLES.map((variable) => (
                  <Button
                    key={variable.tag}
                    variant="outline"
                    size="sm"
                    onClick={() => handleInsertVariable(
                      variable.tag,
                      type === "sms" ? "sms" : "body"
                    )}
                    className="justify-start"
                  >
                    <Badge variant="secondary" className="mr-2 font-mono text-xs">
                      {variable.tag}
                    </Badge>
                    <span className="text-xs">{variable.description}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-base">Template Active</Label>
              <p className="text-sm text-gray-500">
                Inactive templates won't send messages even if triggered
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !name || (type === "sms" ? !smsMessage : !emailSubject || !emailBody)}>
            {isSaving ? "Saving..." : template ? "Save Changes" : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

