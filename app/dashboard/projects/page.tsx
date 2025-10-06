import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { getOrganizationProjectsAction } from "@/actions/projects-actions";
import Link from "next/link";
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
            <div className="space-y-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FolderKanban className="h-4 w-4 text-gray-400" />
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        project.status === "active" ? "default" :
                        project.status === "completed" ? "secondary" :
                        project.status === "planning" ? "outline" :
                        project.status === "on_hold" ? "destructive" :
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
                        {project.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                    {project.startDate && (
                      <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                    )}
                    {project.endDate && (
                      <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
                    )}
                    {project.budget && (
                      <span>Budget: ${Number(project.budget).toLocaleString()}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
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

