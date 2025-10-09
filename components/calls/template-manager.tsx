"use client";

import { useState, useEffect } from "react";
import { type SelectWorkflowEmailTemplate, type SelectWorkflowSmsTemplate } from "@/db/schema";
import {
  getEmailTemplatesAction,
  getSmsTemplatesAction,
  createEmailTemplateAction,
  updateEmailTemplateAction,
  deleteEmailTemplateAction,
  createSmsTemplateAction,
  updateSmsTemplateAction,
  deleteSmsTemplateAction,
} from "@/actions/calls-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";

interface TemplateManagerProps {
  projectId: string;
  viewType: "admin" | "org"; // Platform admins vs organization users
}

export function TemplateManager({ projectId, viewType }: TemplateManagerProps) {
  const { confirm, ConfirmDialog } = useConfirm();
  const [emailTemplates, setEmailTemplates] = useState<SelectWorkflowEmailTemplate[]>([]);
  const [smsTemplates, setSmsTemplates] = useState<SelectWorkflowSmsTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEmailTemplate, setEditingEmailTemplate] = useState<SelectWorkflowEmailTemplate | null>(null);
  const [editingSmsTemplate, setEditingSmsTemplate] = useState<SelectWorkflowSmsTemplate | null>(null);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [showSmsEditor, setShowSmsEditor] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [projectId]);

  async function loadTemplates() {
    setLoading(true);
    const [emailResult, smsResult] = await Promise.all([
      getEmailTemplatesAction(projectId),
      getSmsTemplatesAction(projectId),
    ]);

    if (emailResult.templates) setEmailTemplates(emailResult.templates);
    if (smsResult.templates) setSmsTemplates(smsResult.templates);
    setLoading(false);
  }

  async function handleDeleteEmail(id: string) {
    const confirmed = await confirm({
      title: "Delete Email Template?",
      description: "This will permanently delete this email template. Workflows using this template will no longer function correctly.",
      confirmText: "Delete Template",
      variant: "danger",
    });
    
    if (!confirmed) return;

    const result = await deleteEmailTemplateAction(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Email template deleted");
      loadTemplates();
    }
  }

  async function handleDeleteSms(id: string) {
    const confirmed = await confirm({
      title: "Delete SMS Template?",
      description: "This will permanently delete this SMS template. Workflows using this template will no longer function correctly.",
      confirmText: "Delete Template",
      variant: "danger",
    });
    
    if (!confirmed) return;

    const result = await deleteSmsTemplateAction(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("SMS template deleted");
      loadTemplates();
    }
  }

  if (loading) {
    return <div>Loading templates...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Templates</CardTitle>
        <CardDescription>
          Create and edit email and SMS templates for workflow automation
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="email">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email Templates
            </TabsTrigger>
            <TabsTrigger value="sms">
              <MessageSquare className="h-4 w-4 mr-2" />
              SMS Templates
            </TabsTrigger>
          </TabsList>

          {/* Email Templates */}
          <TabsContent value="email" className="space-y-4">
            {emailTemplates.length > 0 ? (
              emailTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">Subject: {template.subject}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingEmailTemplate(template);
                          setShowEmailEditor(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteEmail(template.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{template.body}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No email templates yet. Create one to get started.
              </div>
            )}

            <Button
              onClick={() => {
                setEditingEmailTemplate(null);
                setShowEmailEditor(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Email Template
            </Button>
          </TabsContent>

          {/* SMS Templates */}
          <TabsContent value="sms" className="space-y-4">
            {smsTemplates.length > 0 ? (
              smsTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="outline" className="mt-1">
                        {template.message.length} characters
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSmsTemplate(template);
                          setShowSmsEditor(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSms(template.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{template.message}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No SMS templates yet. Create one to get started.
              </div>
            )}

            <Button
              onClick={() => {
                setEditingSmsTemplate(null);
                setShowSmsEditor(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create SMS Template
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Email Editor Dialog */}
      {showEmailEditor && (
        <EmailTemplateEditor
          projectId={projectId}
          template={editingEmailTemplate}
          onClose={() => {
            setShowEmailEditor(false);
            setEditingEmailTemplate(null);
          }}
          onSave={() => {
            setShowEmailEditor(false);
            setEditingEmailTemplate(null);
            loadTemplates();
          }}
        />
      )}

      {/* SMS Editor Dialog */}
      {showSmsEditor && (
        <SmsTemplateEditor
          projectId={projectId}
          template={editingSmsTemplate}
          onClose={() => {
            setShowSmsEditor(false);
            setEditingSmsTemplate(null);
          }}
          onSave={() => {
            setShowSmsEditor(false);
            setEditingSmsTemplate(null);
            loadTemplates();
          }}
        />
      )}
      <ConfirmDialog />
    </Card>
  );
}

// Email Template Editor with Live Preview
function EmailTemplateEditor({
  projectId,
  template,
  onClose,
  onSave,
}: {
  projectId: string;
  template: SelectWorkflowEmailTemplate | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEditMode = !!template;
  const [name, setName] = useState(template?.name || "");
  const [subject, setSubject] = useState(template?.subject || "");
  const [body, setBody] = useState(template?.body || "");
  const [isSaving, setIsSaving] = useState(false);

  // Sample data for preview
  const sampleData = {
    caller_name: "John Doe",
    caller_phone: "+1-555-123-4567",
    caller_email: "john.doe@example.com",
    call_topic: "Product Inquiry",
    call_summary: "Customer inquired about premium features and pricing options.",
    call_rating: "8",
    follow_up_reason: "Customer wants detailed pricing breakdown",
  };

  function interpolate(text: string) {
    return text
      .replace(/\{\{caller_name\}\}/g, sampleData.caller_name)
      .replace(/\{\{caller_phone\}\}/g, sampleData.caller_phone)
      .replace(/\{\{caller_email\}\}/g, sampleData.caller_email)
      .replace(/\{\{call_topic\}\}/g, sampleData.call_topic)
      .replace(/\{\{call_summary\}\}/g, sampleData.call_summary)
      .replace(/\{\{call_rating\}\}/g, sampleData.call_rating)
      .replace(/\{\{follow_up_reason\}\}/g, sampleData.follow_up_reason);
  }

  function insertVariable(variable: string) {
    setBody((prev) => prev + `{{${variable}}}`);
  }

  async function handleSave() {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      toast.error("All fields are required");
      return;
    }

    setIsSaving(true);
    const result = isEditMode
      ? await updateEmailTemplateAction(template.id, { name, subject, body })
      : await createEmailTemplateAction(projectId, name, subject, body);

    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isEditMode ? "Email template updated" : "Email template created");
      onSave();
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Email Template" : "Create Email Template"}</DialogTitle>
          <DialogDescription>
            Design your email with live preview. Use template variables to personalize messages.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
          {/* Editor Side */}
          <div className="space-y-4 overflow-y-auto pr-2">
            <div>
              <Label htmlFor="email-name">Template Name</Label>
              <Input
                id="email-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Follow-up Email"
              />
            </div>

            <div>
              <Label htmlFor="email-subject">Email Subject</Label>
              <Input
                id="email-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Thank you for calling about {{call_topic}}"
              />
            </div>

            <div>
              <Label htmlFor="email-body">Email Body</Label>
              <Textarea
                id="email-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email message here..."
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            {/* Variable Picker */}
            <div>
              <Label className="mb-2 block">Insert Variables</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  "caller_name",
                  "caller_phone",
                  "caller_email",
                  "call_topic",
                  "call_summary",
                  "call_rating",
                  "follow_up_reason",
                ].map((variable) => (
                  <Button
                    key={variable}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(variable)}
                  >
                    {variable}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Side */}
          <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="bg-gray-100 px-4 py-2 border-b flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="font-medium text-sm">Live Preview</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {/* Email Preview */}
              <div className="border rounded-lg overflow-hidden shadow-sm">
                {/* Email Header */}
                <div className="bg-gray-50 border-b px-4 py-3">
                  <div className="text-xs text-gray-500 mb-1">From: your-company@example.com</div>
                  <div className="text-xs text-gray-500 mb-1">To: {sampleData.caller_email}</div>
                  <div className="font-semibold text-sm mt-2">
                    {subject ? interpolate(subject) : <span className="text-gray-400">Subject will appear here</span>}
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-6 bg-white">
                  {body ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{interpolate(body)}</div>
                  ) : (
                    <p className="text-gray-400 text-sm">Email body will appear here as you type...</p>
                  )}
                </div>

                {/* Email Footer */}
                <div className="bg-gray-50 border-t px-4 py-3 text-xs text-gray-500">
                  This is a preview with sample data
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : isEditMode ? "Update Template" : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// SMS Template Editor with Live Preview
function SmsTemplateEditor({
  projectId,
  template,
  onClose,
  onSave,
}: {
  projectId: string;
  template: SelectWorkflowSmsTemplate | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEditMode = !!template;
  const [name, setName] = useState(template?.name || "");
  const [message, setMessage] = useState(template?.message || "");
  const [isSaving, setIsSaving] = useState(false);

  // Sample data for preview
  const sampleData = {
    caller_name: "John Doe",
    caller_phone: "+1-555-123-4567",
    call_topic: "Product Inquiry",
    call_summary: "Customer inquired about premium features.",
    call_rating: "8",
    follow_up_reason: "Customer wants pricing details",
  };

  function interpolate(text: string) {
    return text
      .replace(/\{\{caller_name\}\}/g, sampleData.caller_name)
      .replace(/\{\{caller_phone\}\}/g, sampleData.caller_phone)
      .replace(/\{\{call_topic\}\}/g, sampleData.call_topic)
      .replace(/\{\{call_summary\}\}/g, sampleData.call_summary)
      .replace(/\{\{call_rating\}\}/g, sampleData.call_rating)
      .replace(/\{\{follow_up_reason\}\}/g, sampleData.follow_up_reason);
  }

  function insertVariable(variable: string) {
    setMessage((prev) => prev + `{{${variable}}}`);
  }

  const previewMessage = interpolate(message);
  const characterCount = previewMessage.length;
  const smsCount = Math.ceil(characterCount / 160);
  const isOverLimit = characterCount > 320; // Warning at 2 SMS

  async function handleSave() {
    if (!name.trim() || !message.trim()) {
      toast.error("All fields are required");
      return;
    }

    setIsSaving(true);
    const result = isEditMode
      ? await updateSmsTemplateAction(template.id, { name, message })
      : await createSmsTemplateAction(projectId, name, message);

    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isEditMode ? "SMS template updated" : "SMS template created");
      onSave();
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit SMS Template" : "Create SMS Template"}</DialogTitle>
          <DialogDescription>
            Design your SMS with live preview. Keep it concise - SMS messages work best under 160 characters.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
          {/* Editor Side */}
          <div className="space-y-4 overflow-y-auto pr-2">
            <div>
              <Label htmlFor="sms-name">Template Name</Label>
              <Input
                id="sms-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Follow-up SMS"
              />
            </div>

            <div>
              <Label htmlFor="sms-message">SMS Message</Label>
              <Textarea
                id="sms-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi {{caller_name}}, thanks for calling about {{call_topic}}..."
                className="min-h-[200px] font-mono text-sm"
              />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className={characterCount > 320 ? "text-red-600 font-semibold" : "text-gray-500"}>
                  {characterCount} characters
                </span>
                <Badge variant={isOverLimit ? "destructive" : "outline"}>
                  {smsCount} SMS {smsCount > 1 ? "messages" : "message"}
                </Badge>
              </div>
              {isOverLimit && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Long messages may be split into multiple SMS and cost more
                </p>
              )}
            </div>

            {/* Variable Picker */}
            <div>
              <Label className="mb-2 block">Insert Variables</Label>
              <div className="flex flex-wrap gap-2">
                {["caller_name", "caller_phone", "call_topic", "call_summary", "call_rating", "follow_up_reason"].map(
                  (variable) => (
                    <Button
                      key={variable}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(variable)}
                    >
                      {variable}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Preview Side */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-gray-100 px-4 py-2 rounded-t-lg border border-b-0 flex items-center gap-2 w-full max-w-sm">
              <Eye className="h-4 w-4" />
              <span className="font-medium text-sm">Live Preview</span>
            </div>

            {/* Phone Mockup */}
            <div className="w-full max-w-sm border-x border-b rounded-b-lg bg-white shadow-lg">
              {/* Phone Screen */}
              <div className="p-4 min-h-[300px]">
                {/* SMS Bubble */}
                <div className="flex justify-start mb-4">
                  <div className="max-w-[80%]">
                    <div className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      {message ? (
                        <p className="text-sm leading-relaxed">{previewMessage}</p>
                      ) : (
                        <p className="text-gray-400 text-sm">Your SMS message will appear here...</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-2">From: Your Company</p>
                  </div>
                </div>
              </div>

              {/* Phone Footer */}
              <div className="bg-gray-50 border-t px-4 py-3 text-xs text-gray-500 text-center">
                Preview with sample data • To: {sampleData.caller_phone}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : isEditMode ? "Update Template" : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}