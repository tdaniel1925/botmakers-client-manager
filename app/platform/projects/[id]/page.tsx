import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FolderKanban, Calendar, DollarSign, User, Building2, Phone, Workflow, Webhook, FileText, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { getProjectByIdAction, getProjectProgressAction } from "@/actions/projects-actions";
import { getOnboardingSessionByProjectId } from "@/db/queries/onboarding-queries";
import { getProjectNotes } from "@/db/queries/project-notes-queries";
import { ProjectOnboardingSection } from "@/components/platform/project-onboarding-section";
import { ProjectProgressAndNotesSection } from "@/components/project/project-progress-and-notes-section";
import { ProjectTasksSection } from "@/components/project/project-tasks-section";
import { CallsAnalyticsWidget } from "@/components/calls/calls-analytics-widget";
import { CampaignDashboardWidgetWrapper } from "@/components/voice-campaigns/campaign-dashboard-widget-wrapper";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProjectHeaderActions } from "@/components/platform/project-header-actions";

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
                <span className="text-sm text-gray-500 truncate">
                  {project.organizationName}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Responsive */}
          <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:justify-end">
            <Link href={`/platform/projects/${params.id}/calls`} className="flex-1 lg:flex-none">
              <Button variant="outline" size="sm" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Calls
              </Button>
            </Link>
            <Link href={`/platform/projects/${params.id}/campaigns`} className="flex-1 lg:flex-none">
              <Button variant="outline" size="sm" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Campaigns
              </Button>
            </Link>
            
            {/* More Actions Dropdown */}
            <ProjectHeaderActions 
              projectId={params.id}
              projectName={project.name}
            />
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
          </AccordionContent>
        </AccordionItem>

        {/* Client Onboarding Section */}
        <AccordionItem value="onboarding" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="text-lg font-semibold">Client Onboarding</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <ProjectOnboardingSection
                projectId={project.id}
                onboardingSession={onboardingSession}
              />
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
                  isPlatformAdmin={true}
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
              <CallsAnalyticsWidget projectId={project.id} viewType="admin" />
              <CampaignDashboardWidgetWrapper projectId={project.id} viewType="admin" />
            </div>
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
                isPlatformAdmin={true}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
}
