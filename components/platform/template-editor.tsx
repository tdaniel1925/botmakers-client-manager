'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CodeEditor } from './code-editor';
import { RichTextEditor } from './rich-text-editor';
import { EmailPreview } from './email-preview';
import { PhoneMockup } from './phone-mockup';
import { Eye, Code, Type, Save, Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { previewTemplate } from '@/lib/template-utils';
import type { TemplateVariable } from '@/db/schema/templates-schema';

interface TemplateEditorProps {
  template: {
    id?: string;
    name: string;
    type: 'email' | 'sms';
    category: string;
    subject?: string;
    bodyText: string;
    bodyHtml?: string;
    variables?: TemplateVariable[];
    isSystem?: boolean;
  };
  onSave: (template: any) => Promise<void>;
  onTest?: (sampleData: Record<string, string>) => Promise<void>;
  isSaving?: boolean;
  isTesting?: boolean;
}

export function TemplateEditor({
  template,
  onSave,
  onTest,
  isSaving = false,
  isTesting = false,
}: TemplateEditorProps) {
  const [name, setName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject || '');
  const [bodyText, setBodyText] = useState(template.bodyText);
  const [bodyHtml, setBodyHtml] = useState(template.bodyHtml || '');
  const [editMode, setEditMode] = useState<'visual' | 'code'>('visual');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  
  // Sample data for preview
  const [sampleData, setSampleData] = useState<Record<string, string>>(() => {
    const data: Record<string, string> = {};
    template.variables?.forEach((v) => {
      data[v.key] = v.example;
    });
    return data;
  });

  // Generate preview
  const previewSubject = subject ? previewTemplate(subject, sampleData) : '';
  const previewBodyText = previewTemplate(bodyText, sampleData);
  const previewBodyHtml = bodyHtml ? previewTemplate(bodyHtml, sampleData) : '';

  const handleSave = async () => {
    await onSave({
      name,
      subject: template.type === 'email' ? subject : undefined,
      bodyText,
      bodyHtml: template.type === 'email' ? bodyHtml : undefined,
    });
  };

  const handleTest = async () => {
    if (onTest) {
      await onTest(sampleData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{template.type.toUpperCase()}</Badge>
            <Badge variant="secondary">{template.category}</Badge>
            {template.isSystem && <Badge variant="default">System</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          {onTest && (
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={isTesting}
            >
              <Send className="mr-2 h-4 w-4" />
              {isTesting ? 'Sending...' : 'Send Test'}
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">
            <Code className="mr-2 h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Edit Tab */}
        <TabsContent value="edit" className="space-y-6">
          {/* Template Name */}
          <div>
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name"
              className="mt-1.5"
            />
          </div>

          {/* Email Subject */}
          {template.type === 'email' && (
            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="mt-1.5"
              />
            </div>
          )}

          {/* Body Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Message Body</Label>
              {template.type === 'email' && (
                <div className="flex gap-1">
                  <Button
                    variant={editMode === 'visual' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setEditMode('visual')}
                  >
                    <Type className="mr-1 h-3 w-3" />
                    Visual
                  </Button>
                  <Button
                    variant={editMode === 'code' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setEditMode('code')}
                  >
                    <Code className="mr-1 h-3 w-3" />
                    Code
                  </Button>
                </div>
              )}
            </div>

            {template.type === 'sms' ? (
              <CodeEditor
                value={bodyText}
                onChange={setBodyText}
                language="plaintext"
                height="300px"
                availableVariables={template.variables}
              />
            ) : (
              <>
                {editMode === 'visual' ? (
                  <RichTextEditor
                    content={bodyHtml || bodyText}
                    onChange={(html) => {
                      setBodyHtml(html);
                      setBodyText(html.replace(/<[^>]*>/g, ''));
                    }}
                    placeholder="Enter your email content..."
                  />
                ) : (
                  <CodeEditor
                    value={bodyHtml || bodyText}
                    onChange={(value) => {
                      setBodyHtml(value);
                      setBodyText(value.replace(/<[^>]*>/g, ''));
                    }}
                    language="html"
                    height="400px"
                    availableVariables={template.variables}
                  />
                )}
              </>
            )}
          </div>

          {/* Variables Reference */}
          {template.variables && template.variables.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="text-sm">
                  <strong>Available Variables:</strong>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {template.variables.map((v) => (
                      <div key={v.key} className="font-mono text-xs">
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          {`{{${v.key}}}`}
                        </code>
                        <span className="ml-2 text-gray-600">{v.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sample Data Input */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Sample Data</CardTitle>
                  <CardDescription>
                    Enter values to preview with real data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {template.variables?.map((v) => (
                    <div key={v.key}>
                      <Label htmlFor={`sample-${v.key}`} className="text-xs">
                        {v.label}
                      </Label>
                      <Input
                        id={`sample-${v.key}`}
                        value={sampleData[v.key] || ''}
                        onChange={(e) =>
                          setSampleData((prev) => ({
                            ...prev,
                            [v.key]: e.target.value,
                          }))
                        }
                        placeholder={v.example}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Preview Render */}
            <div>
              {template.type === 'sms' ? (
                <PhoneMockup message={previewBodyText} />
              ) : (
                <Card className="h-full">
                  <CardContent className="p-0">
                    <EmailPreview
                      html={previewBodyHtml || previewBodyText}
                      subject={previewSubject}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
