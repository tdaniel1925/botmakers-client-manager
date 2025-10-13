"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Trash2, Search } from 'lucide-react';
import { 
  getEmailTemplatesAction,
  createEmailTemplateAction,
  deleteEmailTemplateAction,
  incrementTemplateUsageAction
} from '@/actions/email-templates-actions';
import type { SelectEmailTemplate } from '@/db/schema/email-templates-schema';

interface TemplateSelectorProps {
  onSelect: (template: SelectEmailTemplate) => void;
  currentSubject?: string;
  currentBody?: string;
}

export function TemplateSelector({ onSelect, currentSubject, currentBody }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<SelectEmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('general');

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  async function loadTemplates() {
    setLoading(true);
    const result = await getEmailTemplatesAction();
    if (result.success) {
      setTemplates(result.data || []);
    }
    setLoading(false);
  }

  async function handleSelectTemplate(template: SelectEmailTemplate) {
    // Increment usage count
    await incrementTemplateUsageAction(template.id);
    
    // Apply template
    onSelect(template);
    setOpen(false);
  }

  async function handleSaveAsTemplate() {
    if (!templateName.trim() || !currentBody) return;

    const result = await createEmailTemplateAction({
      name: templateName,
      category: templateCategory,
      subject: currentSubject,
      body: currentBody,
    });

    if (result.success) {
      setShowSaveDialog(false);
      setTemplateName('');
      loadTemplates();
    }
  }

  async function handleDeleteTemplate(id: string) {
    if (!confirm('Delete this template?')) return;
    
    const result = await deleteEmailTemplateAction(id);
    if (result.success) {
      loadTemplates();
    }
  }

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(templates.map(t => t.category || 'general')));

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Email Templates</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and Save */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {currentBody && (
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Save Current
                </Button>
              )}
            </div>

            {/* Templates List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading templates...</div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No templates found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Save your current email as a template to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {categories.map(category => {
                  const categoryTemplates = filteredTemplates.filter(t => t.category === category);
                  if (categoryTemplates.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
                        {category}
                      </h3>
                      {categoryTemplates.map(template => (
                        <div
                          key={template.id}
                          className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => handleSelectTemplate(template)}
                          >
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium truncate">{template.name}</h4>
                              {template.usageCount && parseInt(template.usageCount) > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ({template.usageCount} uses)
                                </span>
                              )}
                            </div>
                            {template.subject && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                Subject: {template.subject}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {template.body.replace(/<[^>]*>/g, '').substring(0, 150)}...
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g., Meeting Follow-up"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="template-category">Category</Label>
              <Input
                id="template-category"
                placeholder="e.g., Business, Personal, Support"
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAsTemplate} disabled={!templateName.trim()}>
                Save Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


