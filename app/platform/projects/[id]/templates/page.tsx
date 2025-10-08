import { TemplateManager } from "@/components/calls/template-manager";
import { getProjectByIdAction } from "@/actions/projects-actions";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProjectTemplatesPage({
  params,
}: {
  params: { id: string };
}) {
  const projectResult = await getProjectByIdAction(params.id);

  if (!projectResult.isSuccess || !projectResult.data) {
    notFound();
  }

  const project = projectResult.data;

  return (
    <main className="p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/platform/projects/${params.id}`}
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Project
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-1">Message Templates</h1>
          <p className="text-gray-600">
            Manage email and SMS templates for {project.name}
          </p>
        </div>
      </div>

      {/* Template Manager */}
      <TemplateManager projectId={params.id} viewType="admin" />
    </main>
  );
}