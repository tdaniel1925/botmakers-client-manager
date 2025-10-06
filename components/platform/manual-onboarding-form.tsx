'use client';

/**
 * Manual Onboarding Form Component
 * Admin-optimized single-page form for completing onboarding on behalf of clients
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Save, Send, CheckCircle2, Clock, User } from 'lucide-react';
import { saveManualSectionAction, submitManualOnboardingAction } from '@/actions/manual-onboarding-actions';

interface ManualOnboardingFormProps {
  session: any;
  template: any;
  onComplete?: () => void;
}

interface SectionProgress {
  completed: boolean;
  completedBy?: 'admin' | 'client';
  delegatedToClient: boolean;
}

export function ManualOnboardingForm({ session, template, onComplete }: ManualOnboardingFormProps) {
  const [responses, setResponses] = useState<Record<string, any>>(session.responses || {});
  const [delegatedSections, setDelegatedSections] = useState<string[]>([]);
  const [finalizeNow, setFinalizeNow] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sectionProgress, setSectionProgress] = useState<Record<string, SectionProgress>>({});

  // Parse template questions into sections
  const sections = Array.isArray(template.questions) ? template.questions : [];

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      handleSave();
    }, 30000); // 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, responses]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Calculate completion percentage
  const calculateProgress = () => {
    if (sections.length === 0) return 0;
    
    let totalFields = 0;
    let completedFields = 0;

    sections.forEach((section: any) => {
      const fields = section.fields || [];
      totalFields += fields.length;
      
      fields.forEach((field: any) => {
        if (responses[field.id] !== undefined && responses[field.id] !== '') {
          completedFields++;
        }
      });
    });

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };

  const handleResponseChange = (fieldId: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
    setHasUnsavedChanges(true);
  };

  const toggleDelegateSection = (sectionId: string) => {
    setDelegatedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      }
      return [...prev, sectionId];
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save all sections
      for (const section of sections) {
        const sectionId = section.id || section.title;
        const isDelegated = delegatedSections.includes(sectionId);
        
        // Get responses for this section
        const sectionResponses: Record<string, any> = {};
        section.fields?.forEach((field: any) => {
          if (responses[field.id] !== undefined) {
            sectionResponses[field.id] = responses[field.id];
          }
        });

        if (Object.keys(sectionResponses).length > 0) {
          const result = await saveManualSectionAction(
            session.id,
            sectionId,
            sectionResponses,
            isDelegated
          );

          if (!result.success) {
            throw new Error(result.error || 'Failed to save section');
          }
        }
      }

      setHasUnsavedChanges(false);
      toast.success('Progress saved successfully');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save progress');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (hasUnsavedChanges) {
      await handleSave();
    }

    setIsSubmitting(true);

    try {
      const result = await submitManualOnboardingAction(session.id, finalizeNow);

      if (result.success) {
        toast.success(
          finalizeNow
            ? 'Onboarding finalized successfully!'
            : 'Sent to client for review!'
        );
        
        if (onComplete) {
          onComplete();
        }
      } else {
        throw new Error(result.error || 'Failed to submit');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to submit onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [responses, delegatedSections, finalizeNow]);

  const renderField = (field: any, sectionDelegated: boolean) => {
    const value = responses[field.id] || '';
    const disabled = sectionDelegated;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'phone':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <Input
              id={field.id}
              type={field.type}
              value={value}
              onChange={(e) => handleResponseChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
              required={field.required}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleResponseChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
              required={field.required}
              rows={field.rows || 4}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <Select
              value={value}
              onValueChange={(val) => handleResponseChange(field.id, val)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <RadioGroup
              value={value}
              onValueChange={(val) => handleResponseChange(field.id, val)}
              disabled={disabled}
            >
              {field.options?.map((option: any) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value === true}
              onCheckedChange={(checked) => handleResponseChange(field.id, checked)}
              disabled={disabled}
            />
            <Label htmlFor={field.id} className="text-sm font-normal">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <Input
              id={field.id}
              type="number"
              value={value}
              onChange={(e) => handleResponseChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
              required={field.required}
              min={field.min}
              max={field.max}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const progress = calculateProgress();

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b pb-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Badge variant={session.completionMode === 'manual' ? 'default' : 'secondary'}>
              {session.completionMode === 'manual' ? 'Manual Mode' : 'Hybrid Mode'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {sections.length} sections
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600">
                <Clock className="w-3 h-3 mr-1" />
                Unsaved changes
              </Badge>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section: any, index: number) => {
          const sectionId = section.id || section.title || `section-${index}`;
          const isDelegated = delegatedSections.includes(sectionId);

          return (
            <Card key={sectionId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {section.title}
                      {isDelegated && (
                        <Badge variant="secondary" className="text-xs">
                          <User className="w-3 h-3 mr-1" />
                          Client Pending
                        </Badge>
                      )}
                    </CardTitle>
                    {section.description && (
                      <CardDescription>{section.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`delegate-${sectionId}`}
                      checked={isDelegated}
                      onCheckedChange={() => toggleDelegateSection(sectionId)}
                    />
                    <Label
                      htmlFor={`delegate-${sectionId}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      Delegate to client
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isDelegated && (
                  <Alert>
                    <AlertDescription>
                      This section will be completed by the client. Fields are disabled.
                    </AlertDescription>
                  </Alert>
                )}
                {section.fields?.map((field: any) => renderField(field, isDelegated))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="finalize-now"
                    checked={finalizeNow}
                    onCheckedChange={setFinalizeNow}
                  />
                  <Label htmlFor="finalize-now" className="cursor-pointer">
                    Finalize and skip client review
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  {finalizeNow
                    ? 'Onboarding will be completed immediately and AI analysis will run'
                    : 'Client will receive an email to review and approve the information'}
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || isSaving}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : finalizeNow ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Finalize Onboarding
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send for Client Review
                  </>
                )}
              </Button>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              💡 Tip: Use <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+S</kbd> to save,{' '}
              <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+Enter</kbd> to submit
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
