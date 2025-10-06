import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, Calendar, DollarSign, User, Building2 } from "lucide-react";
import { getProjectByIdAction, getProjectProgressAction } from "@/actions/projects-actions";
import { getOnboardingSessionByProjectId } from "@/db/queries/onboarding-queries";
import { getProjectNotes } from "@/db/queries/project-notes-queries";
import { ProjectOnboardingSection } from "@/components/platform/project-onboarding-section";
import { ProjectProgressAndNotesSection } from "@/components/project/project-progress-and-notes-section";
import { ProjectTasksSection } from "@/components/project/project-tasks-section";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const projectResult = await getProjectByIdAction(params.id);

  if (!projectResult.isSuccess || !projectResult.data) {
    notFound();
  }

  const project = projectResult.data;
  
  // Fetch onboarding session for this project
  const onboardingSession = await getOnboardingSessionByProjectId(params.id);
  
  // Fetch progress data
  const progressResult = await getProjectProgressAction(params.id);
  const progressData = progressResult.isSuccess ? progressResult.data : null;
  
  // Fetch project notes
  const notes = await getProjectNotes(params.id);

  return (
    <main className="p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/platform/projects"
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Projects
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <FolderKanban className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{project.name}</h1>
              <div className="flex items-center gap-3">
                <Badge variant={
                  project.status === "active" ? "default" :
                  project.status === "completed" ? "secondary" :
                  project.status === "planning" ? "outline" :
                  "destructive"
                }>
                  {project.status}
                </Badge>
                <Badge variant={
                  project.priority === "critical" ? "destructive" :
                  project.priority === "high" ? "destructive" :
                  project.priority === "medium" ? "default" :
                  "secondary"
                }>
                  {project.priority} priority
                </Badge>
                <span className="text-sm text-gray-500">
                  {project.organizationName}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>Edit</Button>
            <Button variant="destructive" disabled>Delete</Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{project.organizationName}</div>
          </CardContent>
        </Card>

        {project.budget && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                ${Number(project.budget).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}

        {project.startDate && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Start Date</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {new Date(project.startDate).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.floor((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Project ID</label>
              <p className="text-sm font-mono mt-1">{project.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-sm mt-1 capitalize">{project.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Priority</label>
              <p className="text-sm mt-1 capitalize">{project.priority}</p>
            </div>
            {project.endDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">End Date</label>
                <p className="text-sm mt-1">
                  {new Date(project.endDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {project.assignedTo && (
              <div>
                <label className="text-sm font-medium text-gray-500">Assigned To</label>
                <p className="text-sm mt-1">{project.assignedTo}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client Onboarding Section */}
      <div className="mb-6">
        <ProjectOnboardingSection
          projectId={project.id}
          onboardingSession={onboardingSession}
        />
      </div>

      {/* Progress and Notes Section */}
      {progressData && (
        <div className="mb-6">
          <ProjectProgressAndNotesSection
            projectId={project.id}
            progressData={progressData}
            notes={notes}
            isPlatformAdmin={true}
          />
        </div>
      )}

      {/* Tasks Section */}
      <div className="mt-6">
        <ProjectTasksSection
          projectId={project.id}
          isPlatformAdmin={true}
        />
      </div>
    </main>
  );
}



