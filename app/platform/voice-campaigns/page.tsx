// Platform Admin - All Voice Campaigns Page

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isPlatformAdmin } from "@/db/queries/platform-queries";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Phone, FolderKanban, ArrowRight, Building2 } from "lucide-react";
import { getAllProjects } from "@/db/queries/projects-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function PlatformVoiceCampaignsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  const isAdmin = await isPlatformAdmin(userId);
  if (!isAdmin) {
    redirect("/dashboard");
  }
  
  // Get all projects platform-wide
  const projects = await getAllProjects();
  
  return (
    <div className="container mx-auto py-8 space-y-6 max-w-6xl">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Voice Campaigns", icon: <Phone className="h-3.5 w-3.5" /> }
        ]}
        className="mb-6"
      />
      
      <div>
        <h1 className="text-3xl font-bold mb-2">Voice Campaigns</h1>
        <p className="text-gray-600">
          Manage AI-powered voice campaigns across all organizations and projects.
        </p>
      </div>
      
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-</div>
            <p className="text-xs text-gray-500 mt-1">View in project details</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">-</div>
            <p className="text-xs text-gray-500 mt-1">View in project details</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Projects with Voice Campaigns */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Projects will appear here once organizations create them
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Projects</h2>
            <Link href="/platform/projects">
              <Button variant="outline" size="sm">
                View All Projects
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-xl">{project.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          {project.organizationId}
                        </Badge>
                      </div>
                      {project.description && (
                        <CardDescription className="mt-1">
                          {project.description}
                        </CardDescription>
                      )}
                    </div>
                    <Link href={`/platform/projects/${project.id}/campaigns`}>
                      <Button>
                        <Phone className="h-4 w-4 mr-2" />
                        Manage Campaigns
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

