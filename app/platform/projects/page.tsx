import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { getAllProjectsAction, getPlatformProjectStatsAction } from "@/actions/projects-actions";
import { ProjectsListEnhanced } from "@/components/platform/projects-list-enhanced";
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
            <ProjectsListEnhanced 
              projects={projects} 
              basePath="/platform/projects"
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}



