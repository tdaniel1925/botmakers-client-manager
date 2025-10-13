import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getOnboardingSessionById } from '@/db/queries/onboarding-queries';
import { getTemplateById } from '@/db/queries/onboarding-templates-queries';
import { ManualOnboardingForm } from '@/components/platform/manual-onboarding-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, User2 } from 'lucide-react';
import Link from 'next/link';

interface ManualOnboardingPageProps {
  params: {
    sessionId: string;
  };
}

export default async function ManualOnboardingPage({ params }: ManualOnboardingPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const session = await getOnboardingSessionById(params.sessionId);

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

  if (!session.templateLibraryId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No template associated with this session</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const template = await getTemplateById(session.templateLibraryId);

  if (!template) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Template not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/platform/onboarding">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Onboarding Sessions
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manual Onboarding</h1>
            <p className="text-muted-foreground mt-1">
              Complete onboarding questionnaire on behalf of client
            </p>
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            <Badge variant={session.completionMode === 'manual' ? 'default' : 'secondary'} className="text-sm">
              {session.completionMode === 'manual' && 'Full Manual'}
              {session.completionMode === 'hybrid' && 'Hybrid Mode'}
              {session.completionMode === 'client' && 'Converting to Manual'}
            </Badge>
            
            {session.manuallyCompletedBy && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User2 className="w-3 h-3" />
                <span>Started by admin</span>
              </div>
            )}
            
            {session.manuallyCompletedAt && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{new Date(session.manuallyCompletedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Project ID</p>
              <p className="font-medium">{session.projectId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Template</p>
              <p className="font-medium">{template.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant="outline">{session.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Onboarding Form */}
      <ManualOnboardingForm
        session={session}
        template={template}
        onComplete={() => {
          window.location.href = '/platform/onboarding';
        }}
      />
    </div>
  );
}
