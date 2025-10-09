'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TemplateEditor } from '@/components/platform/template-editor';
import {
  getTemplatesAction,
  updateTemplateAction,
  createTemplateAction,
  duplicateTemplateAction,
  deleteTemplateAction,
  sendTestEmailAction,
  sendTestSMSAction,
} from '@/actions/template-actions';
import { seedTemplatesAction, clearTemplatesAction } from '@/actions/seed-templates-action';
import {
  Mail,
  MessageSquare,
  Search,
  Plus,
  Edit,
  Copy,
  Trash2,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';

export default function TemplatesPage() {
  const { confirm, ConfirmDialog } = useConfirm();
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<'email' | 'sms' | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, []);

  // Filter templates
  useEffect(() => {
    let filtered = templates;

    if (activeType !== 'all') {
      filtered = filtered.filter((t) => t.type === activeType);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, activeType, searchQuery]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const result = await getTemplatesAction();
      if (result.success) {
        // Auto-seed if no templates found
        if (result.templates.length === 0) {
          const seedResult = await seedTemplatesAction();
          if (seedResult.success) {
            toast.success(seedResult.message);
            // Reload templates after seeding
            const reloadResult = await getTemplatesAction();
            if (reloadResult.success) {
              setTemplates(reloadResult.templates);
            }
          }
        } else {
          setTemplates(result.templates);
        }
      }
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReseedTemplates = async () => {
    const confirmed = await confirm({
      title: "Reseed All Templates?",
      description: "This will permanently delete all existing templates and reseed with the default templates. This action cannot be undone.",
      confirmText: "Reseed Templates",
      variant: "danger",
      requireTyping: true,
      typingConfirmText: "RESEED",
    });
    
    if (!confirmed) return;

    try {
      setIsLoading(true);
      await clearTemplatesAction();
      const seedResult = await seedTemplatesAction(true);
      if (seedResult.success) {
        toast.success(seedResult.message);
        await loadTemplates();
      } else {
        toast.error(seedResult.message);
      }
    } catch (error) {
      toast.error('Failed to reseed templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handleSave = async (updates: any) => {
    if (!selectedTemplate) return;

    try {
      setIsSaving(true);
      const result = await updateTemplateAction(selectedTemplate.id, updates);

      if (result.success) {
        toast.success('Template saved successfully');
        await loadTemplates();
        setIsEditorOpen(false);
      } else {
        toast.error(result.error || 'Failed to save template');
      }
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async (sampleData: Record<string, string>) => {
    if (!selectedTemplate) return;

    try {
      setIsTesting(true);

      if (selectedTemplate.type === 'email') {
        const testEmail = prompt('Enter test email address:');
        if (!testEmail) return;

        const result = await sendTestEmailAction(
          selectedTemplate.id,
          testEmail,
          sampleData
        );

        if (result.isSuccess) {
          toast.success(`Test email sent to ${testEmail}`);
        } else {
          toast.error(result.message || 'Failed to send test email');
        }
      } else {
        const testPhone = prompt('Enter test phone number (with country code):');
        if (!testPhone) return;

        const result = await sendTestSMSAction(
          selectedTemplate.id,
          testPhone,
          sampleData
        );

        if (result.isSuccess) {
          toast.success(`Test SMS sent to ${testPhone}`);
        } else {
          toast.error(result.message || 'Failed to send test SMS');
        }
      }
    } catch (error) {
      toast.error('Failed to send test');
    } finally {
      setIsTesting(false);
    }
  };

  const handleDuplicate = async (template: any) => {
    try {
      const result = await duplicateTemplateAction(template.id);
      if (result.success) {
        toast.success('Template duplicated successfully');
        await loadTemplates();
      } else {
        toast.error(result.error || 'Failed to duplicate template');
      }
    } catch (error) {
      toast.error('Failed to duplicate template');
    }
  };

  const handleDelete = async (template: any) => {
    if (template.isSystem) {
      toast.error('Cannot delete system templates');
      return;
    }

    const confirmed = await confirm({
      title: "Delete Template?",
      description: `Are you sure you want to delete "${template.name}"? This will affect any workflows using this template.`,
      confirmText: "Delete Template",
      variant: "danger",
    });
    
    if (!confirmed) return;

    try {
      const result = await deleteTemplateAction(template.id);
      if (result.success) {
        toast.success('Template deleted successfully');
        await loadTemplates();
      } else {
        toast.error(result.error || 'Failed to delete template');
      }
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const emailTemplates = templates.filter((t) => t.type === 'email');
  const smsTemplates = templates.filter((t) => t.type === 'sms');

  return (
    <main className="p-6 lg:p-10">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notification Templates</h1>
            <p className="text-gray-600 mt-1">
              Manage email and SMS templates for automated notifications
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleReseedTemplates}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Reseed Templates
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Templates</p>
                  <p className="text-2xl font-bold">{templates.length}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Email Templates</p>
                  <p className="text-2xl font-bold">{emailTemplates.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">SMS Templates</p>
                  <p className="text-2xl font-bold">{smsTemplates.length}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={activeType} onValueChange={(v) => setActiveType(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading templates...</div>
        ) : filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No templates found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {template.category}
                      </CardDescription>
                    </div>
                    {template.type === 'email' ? (
                      <Mail className="h-5 w-5 text-blue-600" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {template.type}
                    </Badge>
                    {template.isSystem && (
                      <Badge variant="default" className="text-xs">
                        System
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {!template.isSystem && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {template.usageCount > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Used {template.usageCount} times
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Editor Dialog */}
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Make changes to your notification template
              </DialogDescription>
            </DialogHeader>
            {selectedTemplate && (
              <TemplateEditor
                template={selectedTemplate}
                onSave={handleSave}
                onTest={handleTest}
                isSaving={isSaving}
                isTesting={isTesting}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
      <ConfirmDialog />
    </main>
  );
}
