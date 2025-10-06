/**
 * Platform Admin - Onboarding Session Details
 * View detailed information about a specific onboarding session
 */

import { redirect, notFound } from "next/navigation";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { getOnboardingSessionDetailsAction } from "@/actions/onboarding-actions";
import { OnboardingSessionOverview } from "@/components/platform/onboarding-session-overview";
import { OnboardingResponsesViewer } from "@/components/platform/onboarding-responses-viewer";
import { ReminderHistoryCard } from "@/components/platform/reminder-history-card";
import { ReminderSettingsDialog } from "@/components/platform/reminder-settings-dialog";
import { TaskGenerationPreview } from "@/components/platform/task-generation-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Sparkles } from "lucide-react";
import Link from "next/link";

interface OnboardingDetailPageProps {
  params: {
    id: string;
  };
}

export default async function OnboardingDetailPage({ params }: OnboardingDetailPageProps) {
  const isAdmin = await isPlatformAdmin();
  if (!isAdmin) {
    redirect("/dashboard");
  }

  const result = await getOnboardingSessionDetailsAction(params.id);

  if (!result.isSuccess || !result.data) {
    notFound();
  }

  const { session, project, responses } = result.data;

  const canGenerateTasks = session.status === "completed" && session.projectId;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/platform/onboarding">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sessions
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Onboarding Session</h1>
            <p className="text-gray-600 mt-2">
              {project?.name || "Project Details"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ReminderSettingsDialog
              sessionId={session.id}
              currentSchedule={session.reminderSchedule || "standard"}
              remindersEnabled={session.reminderEnabled ?? true}
              trigger={
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Reminders
                </Button>
              }
            />
            {canGenerateTasks && project && (
              <TaskGenerationPreview
                sessionId={session.id}
                projectId={project.id}
                projectName={project.name}
                trigger={
                  <Button variant="default" size="sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Tasks
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OnboardingSessionOverview
            session={session}
            project={project}
          />
        </TabsContent>

        <TabsContent value="responses">
          <Card>
            <CardContent className="pt-6">
              <OnboardingResponsesViewer
                session={session}
                responses={responses}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders">
          <div className="grid grid-cols-1 gap-6">
            <ReminderHistoryCard sessionId={session.id} />
            {session.tasksGenerated && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Tasks Generated</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {session.taskCount || 0} tasks were automatically generated from this onboarding on{" "}
                        {session.tasksGeneratedAt
                          ? new Date(session.tasksGeneratedAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                      {project && (
                        <Link href={`/platform/projects/${project.id}`}>
                          <Button variant="link" size="sm" className="px-0 mt-2">
                            View Tasks in Project →
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Session Created</p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {session.startedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Client Started Onboarding</p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.startedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {session.lastActivityAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Last Activity</p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.lastActivityAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {session.completedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Onboarding Completed</p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.completedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
