import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { getAllProjectsAction, getPlatformProjectStatsAction } from "@/actions/projects-actions";
import Link from "next/link";

export default async function PlatformProjectsPage() {
  const [projectsResult, statsResult] = await Promise.all([
    getAllProjectsAction(),
    getPlatformProjectStatsAction(),
  ]);

  const projects = projectsResult.data || [];
  const stats = statsResult.data || { total: 0, byStatus: {}, byPriority: {} };

  const activeProjects = stats.byStatus?.active || 0;
  const completedProjects = stats.byStatus?.completed || 0;
  const planningProjects = stats.byStatus?.planning || 0;

  return (
    <main className="p-6 lg:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-gray-600">Manage projects across all organizations</p>
        </div>
        <Link href="/platform/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Projects</p>
                <p className="text-2xl font-bold">{stats.total}</p>
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
              <p className="text-gray-600 mb-4">No projects yet</p>
              <Link href="/platform/projects/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/platform/projects/${project.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FolderKanban className="h-4 w-4 text-gray-400" />
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {project.organizationName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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
    </main>
  );
}



