"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Mail, BarChart3, Settings as SettingsIcon } from "lucide-react";
import { TemplatesList } from "./templates-list";
import { TemplateEditorDialog } from "./template-editor-dialog";
import { CampaignMessagingConfig } from "./campaign-messaging-config";
import { MessageLogs } from "./message-logs";
import { toast } from "@/lib/toast";
import {
  createMessageTemplateAction,
  updateMessageTemplateAction,
  deleteMessageTemplateAction,
  getTemplatesForCampaignAction,
  updateMessagingConfigAction,
  getMessagingConfigAction,
  getMessageLogsAction,
} from "@/actions/campaign-messaging-actions";

interface CampaignMessagingManagerProps {
  campaignId: string;
  projectId: string;
}

export function CampaignMessagingManager({ campaignId, projectId }: CampaignMessagingManagerProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [messagingConfig, setMessagingConfig] = useState<any>({
    smsEnabled: false,
    emailEnabled: false,
    defaultSendTiming: "immediately",
    maxMessagesPerContact: 3,
    minTimeBetweenMessages: 24,
  });
  const [messageLogs, setMessageLogs] = useState<any[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data
  useEffect(() => {
    loadData();
  }, [campaignId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load templates
      const templatesResult = await getTemplatesForCampaignAction(campaignId);
      if (templatesResult.templates) {
        setTemplates(templatesResult.templates);
      }

      // Load messaging config
      const configResult = await getMessagingConfigAction(campaignId);
      if (configResult.config) {
        setMessagingConfig(configResult.config);
      }

      // Load message logs
      const logsResult = await getMessageLogsAction(campaignId);
      if (logsResult.logs) {
        setMessageLogs(logsResult.logs);
      }
    } catch (error) {
      console.error("Error loading messaging data:", error);
      toast.error("Failed to load messaging data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const result = await deleteMessageTemplateAction(templateId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Template deleted successfully");
        setTemplates(templates.filter((t) => t.id !== templateId));
      }
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const handleDuplicateTemplate = (template: any) => {
    setEditingTemplate({
      ...template,
      id: undefined,
      name: `${template.name} (Copy)`,
    });
    setIsEditorOpen(true);
  };

  const handleSaveTemplate = async (templateData: any) => {
    try {
      if (templateData.id) {
        // Update existing
        const result = await updateMessageTemplateAction(templateData.id, templateData);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Template updated successfully");
          setTemplates(templates.map((t) => (t.id === templateData.id ? result.template : t)));
        }
      } else {
        // Create new
        const result = await createMessageTemplateAction(templateData);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Template created successfully");
          setTemplates([result.template, ...templates]);
        }
      }
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  const handleSaveConfig = async (config: any) => {
    try {
      const result = await updateMessagingConfigAction(campaignId, config);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Messaging configuration saved");
        setMessagingConfig(result.config);
      }
    } catch (error) {
      toast.error("Failed to save configuration");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">
            <MessageSquare className="h-4 w-4 mr-2" />
            Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="config">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="logs">
            <BarChart3 className="h-4 w-4 mr-2" />
            Delivery Log ({messageLogs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <TemplatesList
            templates={templates}
            onCreateNew={handleCreateTemplate}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
            onDuplicate={handleDuplicateTemplate}
          />
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <CampaignMessagingConfig
            config={messagingConfig}
            templates={templates}
            onSave={handleSaveConfig}
          />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <MessageLogs
            logs={messageLogs}
            onViewDetails={(log) => {
              // TODO: Open modal with full message details
              console.log("View log details:", log);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Template Editor Dialog */}
      <TemplateEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        template={editingTemplate}
        campaignId={campaignId}
        projectId={projectId}
        onSave={handleSaveTemplate}
      />
    </div>
  );
}

