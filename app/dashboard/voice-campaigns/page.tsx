// Organization Dashboard - All Voice Campaigns Page

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Phone, FolderKanban, Plus, ArrowRight } from "lucide-react";
import { getProjectsByOrganizationId } from "@/db/queries/projects-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function VoiceCampaignsPage() {
  const { userId, orgId } = await auth();
  
  if (!userId || !orgId) {
    redirect("/sign-in");
  }
  
  // Get all projects for this organization
  const projects = await getProjectsByOrganizationId(orgId);
  
  return (
    <div className="container mx-auto py-8 space-y-6 max-w-5xl">
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
          Manage AI-powered voice campaigns for your projects. Each campaign is associated with a specific project.
        </p>
      </div>
      
      {/* Projects with Voice Campaigns */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Create a project first to manage voice campaigns
            </p>
            <Link href="/dashboard/projects">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Projects</h2>
            <Link href="/dashboard/projects">
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
                      <CardTitle className="text-xl">{project.name}</CardTitle>
                      {project.description && (
                        <CardDescription className="mt-1">
                          {project.description}
                        </CardDescription>
                      )}
                    </div>
                    <Link href={`/dashboard/projects/${project.id}/campaigns`}>
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

