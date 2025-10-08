import { TemplateManager } from "@/components/calls/template-manager";
import { getProjectByIdAction } from "@/actions/projects-actions";
import { getOrganizationContext } from "@/lib/server-organization-context";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default async function OrganizationProjectTemplatesPage({
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
          href={`/dashboard/projects/${params.id}`}
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Project
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-1">Message Templates</h1>
          <p className="text-gray-600">
            Customize email and SMS templates for {project.name}
          </p>
        </div>
      </div>

      {/* Template Manager */}
      <TemplateManager projectId={params.id} viewType="org" />
    </main>
  );
}