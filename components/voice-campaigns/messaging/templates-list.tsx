"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Clock,
  Zap,
  CheckCircle2
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Template {
  id: string;
  type: "sms" | "email";
  name: string;
  description?: string;
  smsMessage?: string;
  emailSubject?: string;
  emailBody?: string;
  triggerConditions: {
    when: string;
    timing: string;
    conditions?: any[];
  };
  isActive: boolean;
  createdAt: Date;
}

interface TemplatesListProps {
  templates: Template[];
  onCreateNew: () => void;
  onEdit: (template: Template) => void;
  onDelete: (templateId: string) => void;
  onDuplicate: (template: Template) => void;
}

const TRIGGER_LABELS: Record<string, string> = {
  after_call: "After Call",
  after_voicemail: "After Voicemail",
  after_no_answer: "After No Answer",
  positive_sentiment: "Positive Sentiment",
  negative_sentiment: "Negative Sentiment",
  follow_up_needed: "Follow-up Needed",
};

const TIMING_ICONS: Record<string, any> = {
  immediately: Zap,
  after_5_min: Clock,
  after_1_hour: Clock,
  after_24_hours: Clock,
};

export function TemplatesList({ 
  templates, 
  onCreateNew, 
  onEdit, 
  onDelete,
  onDuplicate 
}: TemplatesListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const smsTemplates = templates.filter(t => t.type === "sms");
  const emailTemplates = templates.filter(t => t.type === "email");

  const renderTemplate = (template: Template) => {
    const TimingIcon = TIMING_ICONS[template.triggerConditions.timing] || Clock;
    
    return (
      <Card key={template.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {template.type === "sms" ? (
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
              )}
              <div>
                <CardTitle className="text-base">{template.name}</CardTitle>
                {template.description && (
                  <CardDescription className="text-xs mt-1">
                    {template.description}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {template.isActive ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            {template.type === "sms" ? (
              <p className="text-gray-700 line-clamp-2">{template.smsMessage}</p>
            ) : (
              <div>
                <p className="font-medium text-gray-900 mb-1">{template.emailSubject}</p>
                <p className="text-gray-600 line-clamp-2">{template.emailBody}</p>
              </div>
            )}
          </div>

          {/* Triggers */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {TRIGGER_LABELS[template.triggerConditions.when] || template.triggerConditions.when}
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <TimingIcon className="h-3 w-3" />
              {template.triggerConditions.timing.replace(/_/g, " ")}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(template)}
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDuplicate(template)}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setDeleteId(template.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Message Templates</h3>
          <p className="text-sm text-gray-500">
            Create automated follow-ups based on call outcomes
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
            <p className="text-sm text-gray-500 text-center max-w-md mb-4">
              Create message templates to automatically send SMS or emails after calls based on outcomes, sentiment, and other triggers.
            </p>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* SMS Templates */}
          {smsTemplates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <h4 className="font-medium">SMS Templates ({smsTemplates.length})</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {smsTemplates.map(renderTemplate)}
              </div>
            </div>
          )}

          {/* Email Templates */}
          {emailTemplates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium">Email Templates ({emailTemplates.length})</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {emailTemplates.map(renderTemplate)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Template?"
        description="This will permanently delete this message template. Any campaigns using this template will need to be reconfigured."
        confirmText="Delete Template"
        variant="danger"
        onConfirm={() => {
          if (deleteId) {
            onDelete(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}

