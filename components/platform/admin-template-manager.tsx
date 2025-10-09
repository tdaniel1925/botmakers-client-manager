'use client';

/**
 * Admin Template Manager
 * Interface for managing onboarding template library
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Edit,
  Copy,
  Archive,
  Eye,
  Clock,
  Users,
  TrendingUp,
  Search,
  Sparkles,
} from 'lucide-react';
import type { OnboardingTemplateLibrary } from '@/db/schema/onboarding-schema';
import { useConfirm } from '@/hooks/use-confirm';

interface AdminTemplateManagerProps {
  templates: OnboardingTemplateLibrary[];
  builtInTemplates?: any[];
  onCreateCustom?: () => void;
  onEdit?: (templateId: string) => void;
  onPreview?: (templateId: string) => void;
}

export function AdminTemplateManager({
  templates,
  builtInTemplates = [],
  onCreateCustom,
  onEdit,
  onPreview,
}: AdminTemplateManagerProps) {
  const { confirm, ConfirmDialog } = useConfirm();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter templates
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.projectType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TemplateCard = ({ template }: { template: OnboardingTemplateLibrary }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {template.name}
              {template.isAiGenerated && (
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Generated
                </Badge>
              )}
              {template.isCustom && (
                <Badge variant="outline" className="text-xs">
                  Custom
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {template.description || 'No description'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {template.timesUsed}
              </div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <Users className="h-3 w-3" />
                Times Used
              </div>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {template.avgCompletionTime || '-'}
                {template.avgCompletionTime && <span className="text-sm">m</span>}
              </div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Avg Time
              </div>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-purple-600">
                {template.completionRate ? `${template.completionRate}%` : '-'}
              </div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Complete
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreview?.(template.id)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(template.id)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success('Template duplicated');
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const confirmed = await confirm({
                  title: "Archive Template?",
                  description: "Are you sure you want to archive this template? It will be hidden from the active list but can be restored later.",
                  confirmText: "Archive Template",
                  variant: "warning",
                });
                
                if (confirmed) {
                  toast.success('Template archived');
                }
              }}
            >
              <Archive className="h-4 w-4" />
            </Button>
          </div>

          {/* Metadata */}
          <div className="pt-2 border-t text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
              <span className="capitalize">{template.projectType.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const BuiltInTemplateCard = ({ template }: { template: any }) => (
    <Card className="hover:shadow-lg transition-shadow border-dashed">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {template.name}
          <Badge variant="secondary" className="text-xs">
            Built-in
          </Badge>
        </CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4" />
              <span>{template.steps?.length || 0} steps</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>~{template.estimatedTime} minutes</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              toast.success('Template saved to library');
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Save to Library
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Onboarding Templates</h1>
          <p className="text-gray-600 mt-1">
            Manage and create onboarding questionnaire templates
          </p>
        </div>

        <Button onClick={onCreateCustom} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Custom Template
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{templates.length}</div>
            <div className="text-sm text-gray-600">Total Templates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {templates.reduce((sum, t) => sum + t.timesUsed, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Uses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {templates.filter(t => t.isCustom).length}
            </div>
            <div className="text-sm text-gray-600">Custom Templates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {templates.filter(t => t.isAiGenerated).length}
            </div>
            <div className="text-sm text-gray-600">AI Generated</div>
          </CardContent>
        </Card>
      </div>

      {/* Built-in Templates */}
      {builtInTemplates.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Built-in Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {builtInTemplates.map((template) => (
              <BuiltInTemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}

      {/* Custom Templates */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Your Templates ({filteredTemplates.length})
        </h2>
        
        {filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No templates found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Get started by creating your first template'}
              </p>
              {!searchQuery && (
                <Button onClick={onCreateCustom}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
}
