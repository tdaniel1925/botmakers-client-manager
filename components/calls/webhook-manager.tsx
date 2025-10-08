"use client";

import { useState, useEffect } from "react";
import { type SelectProjectWebhook } from "@/db/schema";
import {
  getProjectWebhooksAction,
  createWebhookAction,
  updateWebhookAction,
  deleteWebhookAction,
  regenerateApiKeyAction,
} from "@/actions/calls-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Eye, EyeOff, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface WebhookManagerProps {
  projectId: string;
}

export function WebhookManager({ projectId }: WebhookManagerProps) {
  const [webhooks, setWebhooks] = useState<SelectProjectWebhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    loadWebhooks();
  }, [projectId]);
  
  async function loadWebhooks() {
    setLoading(true);
    const result = await getProjectWebhooksAction(projectId);
    if (result.webhooks) {
      setWebhooks(result.webhooks);
    }
    setLoading(false);
  }
  
  async function handleCreateWebhook(label: string, requireApiKey: boolean) {
    try {
      console.log('Creating webhook:', { projectId, label, requireApiKey });
      const result = await createWebhookAction(projectId, label, requireApiKey);
      console.log('Webhook creation result:', result);
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.webhook) {
        toast.success("Webhook created successfully");
        setShowCreateDialog(false);
        await loadWebhooks();
      } else {
        toast.error("Failed to create webhook - no data returned");
      }
    } catch (error: any) {
      console.error('Error creating webhook:', error);
      toast.error(error.message || "Failed to create webhook");
    }
  }
  
  async function handleToggleActive(webhookId: string, isActive: boolean) {
    const result = await updateWebhookAction(webhookId, { isActive });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Webhook ${isActive ? "activated" : "deactivated"}`);
      loadWebhooks();
    }
  }
  
  async function handleDelete(webhookId: string) {
    if (!confirm("Are you sure you want to delete this webhook? This cannot be undone.")) {
      return;
    }
    
    const result = await deleteWebhookAction(webhookId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Webhook deleted");
      loadWebhooks();
    }
  }
  
  async function handleRegenerateApiKey(webhookId: string) {
    if (!confirm("Are you sure? This will invalidate the current API key.")) {
      return;
    }
    
    const result = await regenerateApiKeyAction(webhookId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("API key regenerated");
      loadWebhooks();
    }
  }
  
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }
  
  function getWebhookUrl(token: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    return `${baseUrl}/api/webhooks/calls/${token}`;
  }
  
  if (loading) {
    return <div>Loading webhooks...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Webhooks</CardTitle>
        <CardDescription>
          Generate webhook URLs for your AI voice agent platforms to send call data.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h4 className="font-medium">{webhook.label}</h4>
                <Badge variant={webhook.isActive ? "default" : "secondary"}>
                  {webhook.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Switch
                checked={webhook.isActive || false}
                onCheckedChange={(checked) => handleToggleActive(webhook.id, checked)}
              />
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <Label className="text-xs text-gray-500">Webhook URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-gray-100 px-3 py-1.5 rounded flex-1 text-xs font-mono overflow-x-auto">
                    {getWebhookUrl(webhook.webhookToken)}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(getWebhookUrl(webhook.webhookToken))}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {webhook.apiKey && (
                <div>
                  <Label className="text-xs text-gray-500">API Key (X-API-Key header)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-gray-100 px-3 py-1.5 rounded flex-1 text-xs font-mono">
                      {showApiKey[webhook.id] ? webhook.apiKey : "••••••••••••••••"}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowApiKey(prev => ({ ...prev, [webhook.id]: !prev[webhook.id] }))}
                    >
                      {showApiKey[webhook.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(webhook.apiKey || "")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRegenerateApiKey(webhook.id)}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                {webhook.totalCallsReceived || 0} calls received
                {webhook.lastCallReceivedAt && ` • Last: ${format(new Date(webhook.lastCallReceivedAt), "PPp")}`}
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(webhook.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        ))}
        
        {webhooks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No webhooks configured. Create one to get started.
          </div>
        )}
        
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Webhook
        </Button>
      </CardContent>
      
      <CreateWebhookDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreateWebhook}
      />
    </Card>
  );
}

function CreateWebhookDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (label: string, requireApiKey: boolean) => Promise<void>;
}) {
  const [label, setLabel] = useState("");
  const [requireApiKey, setRequireApiKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onCreate(label, requireApiKey);
      // Only reset if successful (onCreate will close dialog on success)
      setLabel("");
      setRequireApiKey(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Webhook</DialogTitle>
          <DialogDescription>
            Generate a webhook URL for your AI voice agent platform.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Vapi Calls, Bland AI"
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="require-api-key"
              checked={requireApiKey}
              onCheckedChange={setRequireApiKey}
            />
            <Label htmlFor="require-api-key" className="text-sm">
              Require API key authentication
            </Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Webhook"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
