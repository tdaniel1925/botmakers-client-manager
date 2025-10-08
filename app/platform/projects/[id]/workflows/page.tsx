import { WorkflowManager } from "@/components/calls/workflow-manager";
import Link from "next/link";

export default async function ProjectWorkflowsPage({ params }: { params: { id: string } }) {
  const { id: projectId } = params;
  
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Call Workflows</h1>
          <p className="text-gray-500 mt-1">Automate actions based on call analysis results</p>
        </div>
        <Link
          href={`/platform/projects/${projectId}`}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Project
        </Link>
      </div>
      
      {/* Workflow Manager */}
      <WorkflowManager projectId={projectId} />
      
      {/* Documentation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How workflows work</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>After each call is analyzed by AI, the system checks all active workflows</li>
          <li>If a workflow's conditions are met (e.g., follow-up needed, low rating), it triggers automatically</li>
          <li>The workflow executes its configured actions (send email, create task, send SMS)</li>
          <li>
            Available template variables:
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>`{"{{caller_name}}"}`- Caller's name</li>
              <li>`{"{{caller_phone}}"}`- Caller's phone number</li>
              <li>`{"{{call_topic}}"}`- AI-extracted call topic</li>
              <li>`{"{{call_summary}}"}`- AI-generated summary</li>
              <li>`{"{{call_rating}}"}`- Quality rating (1-10)</li>
              <li>`{"{{call_sentiment}}"}`- Sentiment (positive/neutral/negative)</li>
              <li>`{"{{follow_up_reason}}"}`- Why follow-up is needed</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
}
