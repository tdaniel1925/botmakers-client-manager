"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GradientCard } from "@/components/ui/gradient-card";
import { Button } from "@/components/ui/button";
import { FolderKanban, TrendingUp, Clock, CheckCircle2, AlertCircle, Download, Loader2 } from "lucide-react";
import { getOrganizationProjectsAction } from "@/actions/projects-actions";
import { ProjectsListPaginated } from "@/components/platform/projects-list-paginated";
import { useOrganization } from "@/lib/organization-context";
import { SelectProject } from "@/db/schema";
import { toast } from "sonner";
import { SkeletonStats, SkeletonTable } from "@/components/ui/skeleton-card";
import { EmptyState } from "@/components/ui/empty-state";

export default function OrganizationProjectsPage() {
  const { organizationId } = useOrganization();
  const [projects, setProjects] = useState<SelectProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organizationId) {
      loadProjects();
    }
  }, [organizationId]);

  const loadProjects = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const projectsResult = await getOrganizationProjectsAction(organizationId);
      setProjects(projectsResult.data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Prepare CSV data
    const headers = ['Title', 'Status', 'Description', 'Organization', 'Created Date', 'Updated Date'];
    const csvContent = [
      headers.join(','),
      ...projects.map(project => [
        `"${project.name}"`,
        project.status || 'N/A',
        `"${project.description || 'N/A'}"`,
        project.organizationId,
        new Date(project.createdAt).toLocaleDateString(),
        new Date(project.updatedAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${projects.length} projects to CSV`);
  };
  if (!organizationId) {
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

  // Calculate stats
  const activeProjects = projects.filter(p => p.status === "active").length;
  const planningProjects = projects.filter(p => p.status === "planning").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const onHoldProjects = projects.filter(p => p.status === "on_hold").length;

  return (
    <main className="p-8 max-w-[1400px] mx-auto space-y-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Projects</h1>
          <p className="text-neutral-600">View and manage your organization's projects</p>
        </div>
        {projects.length > 0 && (
          <Button variant="outline" onClick={handleExportCSV} className="rounded-full">
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        )}
      </div>

      {/* Stats */}
      {loading ? (
        <SkeletonStats />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <GradientCard variant="none" className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <FolderKanban className="w-5 h-5 text-neutral-600" />
            <span className="text-3xl font-semibold">{projects.length}</span>
          </div>
          <span className="text-sm text-neutral-600">Total Projects</span>
        </GradientCard>

        <GradientCard variant="teal" className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <span className="text-3xl font-semibold text-teal-600">{activeProjects}</span>
          </div>
          <span className="text-sm text-neutral-600">Active</span>
        </GradientCard>

        <GradientCard variant="amber" className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-3xl font-semibold text-amber-600">{planningProjects}</span>
          </div>
          <span className="text-sm text-neutral-600">Planning</span>
        </GradientCard>

        <GradientCard variant="indigo" className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <span className="text-3xl font-semibold text-indigo-600">{completedProjects}</span>
          </div>
          <span className="text-sm text-neutral-600">Completed</span>
        </GradientCard>
      </div>
      )}

      {/* Projects List */}
      <GradientCard variant="none">
        <CardContent className="p-6">
          {loading ? (
            <SkeletonTable />
          ) : projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Your platform administrator will create projects for your organization. Once created, you'll be able to view project details, track progress, and manage assigned tasks."
            />
          ) : (
            <ProjectsListPaginated 
              projects={projects} 
              basePath="/dashboard/projects"
            />
          )}
        </CardContent>
      </GradientCard>

      {/* Info Card */}
      {projects.length > 0 && (
        <GradientCard variant="indigo" className="mt-6">
          <div className="flex items-start gap-3">
            <FolderKanban className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-indigo-900 mb-1">About Projects</h4>
              <p className="text-sm text-indigo-700">
                Projects are created by your platform administrator. You can view project details, 
                track progress, and manage tasks assigned to you. Contact your admin if you need 
                a new project created for your organization.
              </p>
            </div>
          </div>
        </GradientCard>
      )}
    </main>
  );
}

