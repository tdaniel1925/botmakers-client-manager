/**
 * Email Template Selector Component
 * Choose from saved email templates
 */

'use client';

import { useState, useEffect } from 'react';
import { FileText, Star, Search, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getEmailTemplatesAction,
  toggleTemplateFavoriteAction,
  deleteEmailTemplateAction,
  incrementTemplateUsageAction,
  applyTemplateVariables,
} from '@/actions/email-template-actions';
import type { SelectEmailTemplate } from '@/db/schema/email-templates-schema';

interface EmailTemplateSelectorProps {
  onSelectTemplate: (subject: string, body: string) => void;
  onClose: () => void;
}

export function EmailTemplateSelector({
  onSelectTemplate,
  onClose,
}: EmailTemplateSelectorProps) {
  const [templates, setTemplates] = useState<SelectEmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<SelectEmailTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const result = await getEmailTemplatesAction();
      if (result.success && result.data?.templates) {
        setTemplates(result.data.templates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTemplates = templates.filter((template) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query) ||
      template.category?.toLowerCase().includes(query)
    );
  });

  const handleSelectTemplate = async (template: SelectEmailTemplate) => {
    if (template.variables && template.variables.length > 0) {
      setSelectedTemplate(template);
      // Initialize variables with default values
      const initialVars: Record<string, string> = {};
      template.variables.forEach((v) => {
        initialVars[v.name] = v.defaultValue || '';
      });
      setVariables(initialVars);
    } else {
      await applyTemplate(template);
    }
  };

  const applyTemplate = async (template: SelectEmailTemplate) => {
    // Apply variables if any
    let subject = template.subject || '';
    let body = template.body;

    if (template.variables && template.variables.length > 0) {
      subject = applyTemplateVariables(subject, variables);
      body = applyTemplateVariables(body, variables);
    }

    // Increment usage count
    await incrementTemplateUsageAction(template.id);

    onSelectTemplate(subject, body);
    onClose();
  };

  const handleToggleFavorite = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleTemplateFavoriteAction(templateId);
    loadTemplates();
  };

  const handleDelete = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this template?')) {
      await deleteEmailTemplateAction(templateId);
      loadTemplates();
    }
  };

  if (selectedTemplate) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-background border shadow-2xl rounded-lg w-full max-w-2xl">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">{selectedTemplate.name}</h2>
            <p className="text-sm text-muted-foreground">Fill in template variables</p>
          </div>

          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedTemplate.variables?.map((variable) => (
              <div key={variable.name} className="space-y-2">
                <label className="text-sm font-medium">
                  {variable.description}
                  {variable.required && <span className="text-destructive ml-1">*</span>}
                </label>
                <Input
                  value={variables[variable.name] || ''}
                  onChange={(e) =>
                    setVariables((prev) => ({ ...prev, [variable.name]: e.target.value }))
                  }
                  placeholder={variable.defaultValue || `Enter ${variable.name}`}
                  required={variable.required}
                />
              </div>
            ))}
          </div>

          <div className="border-t px-6 py-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Back
            </Button>
            <Button onClick={() => applyTemplate(selectedTemplate)}>
              Apply Template
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border shadow-2xl rounded-lg w-full max-w-3xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Email Templates</h2>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                <p className="text-muted-foreground">Loading templates...</p>
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="font-medium">No templates found</p>
                <p className="text-sm text-muted-foreground">
                  Create your first template to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        {template.description && (
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleToggleFavorite(template.id, e)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            template.isFavorite
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                      <button
                        onClick={(e) => handleDelete(template.id, e)}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {template.category && (
                      <span className="px-2 py-1 bg-muted rounded">{template.category}</span>
                    )}
                    <span>Used {template.usageCount || 0} times</span>
                    {template.variables && template.variables.length > 0 && (
                      <span>{template.variables.length} variables</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

