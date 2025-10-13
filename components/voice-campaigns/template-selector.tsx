"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Eye, Sparkles } from "lucide-react";
import { getAllTemplates, getTemplateCategories, getTemplatesByCategory, type CampaignTemplate } from "@/lib/campaign-templates";

interface TemplateSelectorProps {
  onSelectTemplate: (template: CampaignTemplate) => void;
  onSkip: () => void;
}

export function TemplateSelector({ onSelectTemplate, onSkip }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = getTemplateCategories();
  const templates = activeCategory === "all" 
    ? getAllTemplates() 
    : getTemplatesByCategory(activeCategory);

  const handlePreview = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Sparkles className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Choose a Template</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get started quickly with a pre-configured campaign template, or start from scratch
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200"
                onClick={() => handlePreview(template)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{template.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-3">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Recommended: <span className="font-medium uppercase">{template.recommendedProvider}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(template);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Skip Button */}
      <div className="text-center pt-4">
        <Button variant="outline" onClick={onSkip}>
          Skip - Start from Scratch
        </Button>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="text-4xl">{selectedTemplate?.icon}</div>
              <div>
                <DialogTitle className="text-2xl">{selectedTemplate?.name}</DialogTitle>
                <p className="text-gray-500 mt-1">{selectedTemplate?.description}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* System Prompt Preview */}
            <div>
              <h3 className="text-sm font-semibold mb-2">System Prompt</h3>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <pre className="text-xs whitespace-pre-wrap text-gray-700">
                  {selectedTemplate?.systemPromptTemplate}
                </pre>
              </div>
            </div>

            {/* First Message Preview */}
            <div>
              <h3 className="text-sm font-semibold mb-2">First Message</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm italic">"{selectedTemplate?.firstMessageTemplate}"</p>
              </div>
            </div>

            {/* Voicemail Message Preview */}
            {selectedTemplate?.voicemailMessageTemplate && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Voicemail Message</h3>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <p className="text-sm italic">"{selectedTemplate.voicemailMessageTemplate}"</p>
                </div>
              </div>
            )}

            {/* Configuration */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Pre-configured Settings</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500">Campaign Goal</div>
                  <div className="font-medium capitalize">
                    {selectedTemplate?.setupAnswers.campaign_goal?.replace('_', ' ')}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500">Agent Personality</div>
                  <div className="font-medium capitalize">
                    {selectedTemplate?.setupAnswers.agent_personality}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500">Target Duration</div>
                  <div className="font-medium">
                    {(selectedTemplate?.setupAnswers as any)?.call_duration_target} minutes
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500">Recommended Provider</div>
                  <div className="font-medium uppercase">{selectedTemplate?.recommendedProvider}</div>
                </div>
              </div>
            </div>

            {/* Data Collection */}
            {selectedTemplate?.setupAnswers.must_collect && selectedTemplate.setupAnswers.must_collect.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Data to Collect</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.setupAnswers.must_collect.map((field) => (
                    <Badge key={field} variant="outline">
                      {field.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Back to Templates
            </Button>
            <Button onClick={handleUseTemplate}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Use This Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
