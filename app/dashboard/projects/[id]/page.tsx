import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FolderKanban, Calendar, DollarSign, User, AlertCircle, Info, Phone, FileText } from "lucide-react";
import { getProjectByIdAction, getProjectProgressAction } from "@/actions/projects-actions";
import { getProjectNotes } from "@/db/queries/project-notes-queries";
import { ProjectProgressAndNotesSection } from "@/components/project/project-progress-and-notes-section";
import { ProjectTasksSection } from "@/components/project/project-tasks-section";
import { CallsAnalyticsWidget } from "@/components/calls/calls-analytics-widget";
import { CampaignDashboardWidgetWrapper } from "@/components/voice-campaigns/campaign-dashboard-widget-wrapper";
import { getOrganizationContext } from "@/lib/server-organization-context";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function OrganizationProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Get current organization
  const orgContext = await getOrganizationContext();
  
  if (!orgContext) {
    redirect("/dashboard");
  }

  const projectResult = await getProjectByIdAction(params.id);

  if (!projectResult.isSuccess || !projectResult.data) {
    notFound();
  }

  const project = projectResult.data;
  
  // Fetch progress data
  const progressResult = await getProjectProgressAction(params.id);
  const progressData = progressResult.isSuccess ? progressResult.data : null;
  
  // Fetch project notes
  const notes = await getProjectNotes(params.id);

  // Verify the project belongs to the current organization
  if (project.organizationId !== orgContext.organizationId) {
    return (
      <main className="p-6 lg:p-10">
        <div className="text-center py-10">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">This project belongs to another organization</p>
          <Link href="/dashboard/projects" className="text-blue-600 hover:underline">
            ← Back to Projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/projects"
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Projects
        </Link>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-lg flex-shrink-0">
              <FolderKanban className="h-8 w-8 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold mb-1 truncate">{project.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={
                  project.status === "active" ? "default" :
                  project.status === "completed" ? "secondary" :
                  project.status === "planning" ? "outline" :
                  "destructive"
                }>
                  {project.status.replace("_", " ")}
                </Badge>
                <Badge variant={
                  project.priority === "critical" ? "destructive" :
                  project.priority === "high" ? "destructive" :
                  project.priority === "medium" ? "default" :
                  "secondary"
                }>
                  {project.priority} priority
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Responsive */}
          <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:justify-end">
            <Link href={`/dashboard/projects/${params.id}/calls`} className="flex-1 lg:flex-none">
              <Button variant="outline" size="sm" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Calls
              </Button>
            </Link>
            <Link href={`/dashboard/projects/${params.id}/campaigns`} className="flex-1 lg:flex-none">
              <Button variant="outline" size="sm" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Campaigns
              </Button>
            </Link>
            <Link href={`/dashboard/projects/${params.id}/templates`} className="flex-1 lg:flex-none">
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <Accordion type="multiple" defaultValue={["overview", "analytics"]} className="space-y-4">
        {/* Overview Stats */}
        <AccordionItem value="overview" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="text-lg font-semibold">Project Overview</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold capitalize">
                    {project.status.replace("_", " ")}
                  </div>
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
          </AccordionContent>
        </AccordionItem>

        {/* Project Details */}
        <AccordionItem value="details" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="text-lg font-semibold">Project Details</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
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
                    <label className="text-sm font-medium text-gray-500">Priority</label>
                    <p className="text-sm mt-1 capitalize">{project.priority}</p>
                  </div>
                  {project.endDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Target End Date</label>
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
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-sm mt-1">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Progress and Notes Section */}
        {progressData && (
          <AccordionItem value="progress" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="text-lg font-semibold">Progress & Notes</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4">
                <ProjectProgressAndNotesSection
                  projectId={project.id}
                  progressData={progressData}
                  notes={notes}
                  isPlatformAdmin={false}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Call Analytics & Voice Campaigns */}
        <AccordionItem value="analytics" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="text-lg font-semibold">Call Analytics & Voice Campaigns</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              <CallsAnalyticsWidget projectId={project.id} viewType="org" />
              <CampaignDashboardWidgetWrapper projectId={project.id} viewType="org" />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Info Banner */}
        <AccordionItem value="info" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="text-lg font-semibold">About Project Progress</span>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="mt-4 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">About Project Progress</h4>
                    <p className="text-sm text-blue-700">
                      Progress updates and notes are managed by your platform administrator. 
                      The progress meter automatically updates as tasks are completed. If you have questions 
                      or need updates, please contact your platform administrator.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Tasks Section */}
        <AccordionItem value="tasks" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="text-lg font-semibold">Tasks</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <ProjectTasksSection
                projectId={project.id}
                isPlatformAdmin={false}
                organizationId={orgContext.organizationId}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
}
