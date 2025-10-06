'use client';

/**
 * Client Review Page
 * Allows clients to review and edit admin-filled onboarding information
 */

import { use, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CheckCircle2, Edit3, Info, Lock, Send } from 'lucide-react';
import { submitClientReviewAction } from '@/actions/manual-onboarding-actions';

interface ClientReviewPageProps {
  params: Promise<{ token: string }>;
}

export default function ClientReviewPage({ params }: ClientReviewPageProps) {
  const resolvedParams = use(params);
  const [session, setSession] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSession();
  }, [resolvedParams.token]);

  const loadSession = async () => {
    try {
      // Fetch session data
      const response = await fetch(`/api/onboarding/session/${resolvedParams.token}`);
      if (!response.ok) {
        throw new Error('Session not found');
      }

      const data = await response.json();
      setSession(data.session);
      setTemplate(data.template);
      setResponses(data.session.responses || {});
    } catch (error: any) {
      console.error('Error loading session:', error);
      toast.error(error.message || 'Failed to load onboarding session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseChange = (fieldId: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
    setEditedFields(prev => new Set([...prev, fieldId]));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Prepare updated responses (only edited fields)
      const updatedResponses: Record<string, any> = {};
      editedFields.forEach(fieldId => {
        updatedResponses[fieldId] = responses[fieldId];
      });

      const result = await submitClientReviewAction(
        resolvedParams.token,
        reviewNotes,
        Object.keys(updatedResponses).length > 0 ? updatedResponses : undefined
      );

      if (result.success) {
        toast.success('Thank you! Your onboarding is now complete.');
        
        // Show success message
        setTimeout(() => {
          window.location.href = `/onboarding/${resolvedParams.token}/complete`;
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session || !template) {
    return (
      <div className="container mx-auto py-12 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Session not found or expired</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sections = Array.isArray(template.questions) ? template.questions : [];
  const completedBySections = (session.completedBySections || {}) as Record<string, any>;

  return (
    <div className="container mx-auto py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Review Your Onboarding Information</h1>
        <p className="text-lg text-muted-foreground">
          We've filled out some information to help speed things along. Please review and make any necessary changes.
        </p>
      </div>

      {/* Instructions Alert */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>What you need to do</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Review all information we've entered</li>
            <li>Make changes to any fields that need correction</li>
            <li>Complete any sections marked as pending</li>
            <li>Add any notes or feedback you have</li>
            <li>Click "Approve & Finalize" when ready</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Sections */}
      <div className="space-y-6 mb-8">
        {sections.map((section: any, index: number) => {
          const sectionId = section.id || section.title || `section-${index}`;
          const sectionCompletion = completedBySections[sectionId];
          const isAdminFilled = sectionCompletion && sectionCompletion.completed_by;
          const isDelegated = !isAdminFilled;

          return (
            <Card key={sectionId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {section.title}
                    {isAdminFilled && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Pre-filled
                      </Badge>
                    )}
                    {isDelegated && (
                      <Badge variant="default" className="text-xs">
                        <Edit3 className="w-3 h-3 mr-1" />
                        Your Input Needed
                      </Badge>
                    )}
                  </CardTitle>
                </div>
                {section.description && (
                  <CardDescription>{section.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {section.fields?.map((field: any) => {
                  const value = responses[field.id] || '';
                  const isEdited = editedFields.has(field.id);

                  return (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="flex items-center gap-2">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                        {isEdited && (
                          <Badge variant="outline" className="text-xs">
                            Edited
                          </Badge>
                        )}
                      </Label>
                      
                      {field.description && (
                        <p className="text-sm text-muted-foreground">{field.description}</p>
                      )}
                      
                      {field.type === 'textarea' ? (
                        <Textarea
                          id={field.id}
                          value={value}
                          onChange={(e) => handleResponseChange(field.id, e.target.value)}
                          placeholder={field.placeholder || 'Enter your response...'}
                          rows={field.rows || 4}
                          required={field.required}
                        />
                      ) : (
                        <Input
                          id={field.id}
                          type={field.type || 'text'}
                          value={value}
                          onChange={(e) => handleResponseChange(field.id, e.target.value)}
                          placeholder={field.placeholder || 'Enter your response...'}
                          required={field.required}
                        />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Review Notes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Additional Notes or Feedback (Optional)</CardTitle>
          <CardDescription>
            Let us know if there's anything else we should know or any questions you have
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Add any notes, questions, or concerns here..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {editedFields.size > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You've edited {editedFields.size} field{editedFields.size !== 1 ? 's' : ''}. These changes will be saved when you approve.
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve & Finalize
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
