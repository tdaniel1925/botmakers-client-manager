import { Card, CardContent } from "@/components/ui/card";
import { FolderKanban, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { getOrganizationProjectsAction } from "@/actions/projects-actions";
import { ProjectsListPaginated } from "@/components/platform/projects-list-paginated";
import { getOrganizationContext } from "@/lib/server-organization-context";

export default async function OrganizationProjectsPage() {
  // Get current organization
  const orgContext = await getOrganizationContext();
  
  if (!orgContext) {
    return (
      <main className="p-6 lg:p-10">
        <div className="text-center py-10">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No organization found</p>
          <p className="text-sm text-gray-500">Please contact your administrator</p>
        </div>
      </main>
    );
  }

  const projectsResult = await getOrganizationProjectsAction(orgContext.organizationId);
  const projects = projectsResult.data || [];

  // Calculate stats
  const activeProjects = projects.filter(p => p.status === "active").length;
  const planningProjects = projects.filter(p => p.status === "planning").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const onHoldProjects = projects.filter(p => p.status === "on_hold").length;

  return (
    <main className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Projects</h1>
        <p className="text-gray-600">View and manage your organization's projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold">{activeProjects}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Planning</p>
                <p className="text-2xl font-bold">{planningProjects}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{completedProjects}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <CardContent className="p-6">
          {projects.length === 0 ? (
            <div className="text-center py-10">
              <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No projects yet</p>
              <p className="text-sm text-gray-500">
                Your platform administrator will create projects for your organization
              </p>
            </div>
          ) : (
            <ProjectsListPaginated 
              projects={projects} 
              basePath="/dashboard/projects"
            />
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      {projects.length > 0 && (
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <FolderKanban className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">About Projects</h4>
                <p className="text-sm text-blue-700">
                  Projects are created by your platform administrator. You can view project details, 
                  track progress, and manage tasks assigned to you. Contact your admin if you need 
                  a new project created for your organization.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

