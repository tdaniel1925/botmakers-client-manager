import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getOnboardingSessionById } from '@/db/queries/onboarding-queries';
import { getTemplateById } from '@/db/queries/onboarding-templates-queries';
import { getProjectById } from '@/db/queries/projects-queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Users, GitMerge, CheckCircle2, Clock, Mail, FileText, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface OnboardingDetailPageProps {
  params: {
    id: string;
  };
}

export default async function OnboardingDetailPage({ params }: OnboardingDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const session = await getOnboardingSessionById(params.id);

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Session not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const template = session.templateLibraryId ? await getTemplateById(session.templateLibraryId) : null;
  const project = session.projectId ? await getProjectById(session.projectId) : null;

  const getCompletionModeIcon = (mode: string) => {
    switch (mode) {
      case 'manual':
        return <User className="h-5 w-5" />;
      case 'hybrid':
        return <GitMerge className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getCompletionModeName = (mode: string) => {
    switch (mode) {
      case 'manual':
        return 'Manual (Admin Filled)';
      case 'hybrid':
        return 'Hybrid (Admin + Client)';
      default:
        return 'Client';
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/platform/onboarding">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Sessions
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Onboarding Session Details</h1>
            <p className="text-muted-foreground mt-1">
              {session.clientName || 'Unknown Client'}
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            {session.status === 'completed' && (
              <Badge className="bg-green-600">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
            {session.status === 'in_progress' && (
              <Badge className="bg-blue-600">
                <Clock className="w-3 h-3 mr-1" />
                In Progress
              </Badge>
            )}
            {session.status === 'pending' && (
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            )}
            {session.status === 'pending_review' && (
              <Badge className="bg-orange-600">
                <Clock className="w-3 h-3 mr-1" />
                Pending Review
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Completion Mode Alert */}
      {session.completionMode !== 'client' && (
        <Alert className="mb-6 border-purple-200 bg-purple-50">
          <div className="flex items-center gap-2">
            {getCompletionModeIcon(session.completionMode || 'client')}
            <AlertTitle className="mb-0">
              {getCompletionModeName(session.completionMode || 'client')}
            </AlertTitle>
          </div>
          <AlertDescription className="mt-2">
            {session.completionMode === 'manual' && (
              <>
                This onboarding was completed by an admin on behalf of the client.
                {session.manuallyCompletedBy && ` Started by admin ${session.manuallyCompletedBy.slice(0, 8)}...`}
                {session.finalizedByAdmin && ' • Finalized without client review'}
              </>
            )}
            {session.completionMode === 'hybrid' && (
              <>
                This onboarding was completed collaboratively by admin and client.
                See completion breakdown below for section-by-section attribution.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Session Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
          <CardDescription>Basic details about this onboarding session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Client Name</p>
              <p className="font-medium">{session.clientName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Client Email</p>
              <p className="font-medium">{session.clientEmail || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Project</p>
              <p className="font-medium">{project?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Template</p>
              <p className="font-medium">{template?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created</p>
              <p className="font-medium">
                {session.createdAt ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true }) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
              <p className="font-medium">
                {session.updatedAt ? formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true }) : 'N/A'}
              </p>
            </div>
            {session.completedAt && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(session.completedAt), { addSuffix: true })}
                </p>
              </div>
            )}
            {session.expiresAt && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Expires</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(session.expiresAt), { addSuffix: true })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completion Breakdown for Hybrid Mode */}
      {session.completionMode === 'hybrid' && session.completedBySections && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Completion Breakdown</CardTitle>
            <CardDescription>Who completed each section of the onboarding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(session.completedBySections as Record<string, any>).map(([sectionId, data]) => (
                <div key={sectionId} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{sectionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    {data.completed_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(data.completed_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <Badge variant={data.completed_by?.startsWith('user_') ? 'secondary' : 'outline'}>
                    {data.completed_by?.startsWith('user_') ? (
                      <>
                        <User className="w-3 h-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      <>
                        <Users className="w-3 h-3 mr-1" />
                        Client
                      </>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Review Info */}
      {(session.clientReviewRequestedAt || session.clientReviewedAt) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Client Review Status</CardTitle>
            <CardDescription>Client feedback and review timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {session.clientReviewRequestedAt && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Review Requested</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(session.clientReviewRequestedAt), { addSuffix: true })}
                  </p>
                </div>
              )}
              {session.clientReviewedAt && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reviewed By Client</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(session.clientReviewedAt), { addSuffix: true })}
                  </p>
                </div>
              )}
              {session.clientReviewNotes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Client Notes</p>
                  <div className="p-3 bg-gray-50 rounded-md mt-2">
                    <p className="text-sm">{session.clientReviewNotes}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Responses Summary */}
      {session.responses && Object.keys(session.responses).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Responses</CardTitle>
            <CardDescription>
              {Object.keys(session.responses).length} field{Object.keys(session.responses).length !== 1 ? 's' : ''} completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(session.responses as Record<string, any>).slice(0, 5).map(([fieldId, value]) => (
                <div key={fieldId} className="border-b pb-3 last:border-b-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {fieldId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-sm">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              ))}
              {Object.keys(session.responses).length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  ... and {Object.keys(session.responses).length - 5} more responses
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-3 justify-end">
        {session.status !== 'completed' && session.completionMode !== 'client' && (
          <Link href={`/platform/onboarding/manual/${session.id}`}>
            <Button>
              <User className="w-4 h-4 mr-2" />
              Continue Manual Onboarding
            </Button>
          </Link>
        )}
        {project && (
          <Link href={`/platform/projects/${project.id}`}>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              View Project
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}