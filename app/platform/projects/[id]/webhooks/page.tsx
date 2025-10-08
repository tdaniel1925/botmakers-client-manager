import { WebhookManager } from "@/components/calls/webhook-manager";
import Link from "next/link";

export default async function ProjectWebhooksPage({ params }: { params: { id: string } }) {
  const { id: projectId } = params;
  
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Webhooks</h1>
          <p className="text-gray-500 mt-1">Configure webhooks for AI voice agent integrations</p>
        </div>
        <Link
          href={`/platform/projects/${projectId}`}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Project
        </Link>
      </div>
      
      {/* Webhook Manager */}
      <WebhookManager projectId={projectId} />
      
      {/* Documentation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How to use webhooks</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Create a webhook above and copy the webhook URL</li>
          <li>In your AI voice agent platform (Vapi, Bland AI, etc.), configure the webhook URL in the settings</li>
          <li>If you enabled API key authentication, add the API key as the `X-API-Key` header</li>
          <li>
            Send call data in JSON format with at minimum a `transcript` field. 
            Additional fields supported:
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>`caller.name` or `name` - Caller's name</li>
              <li>`caller.phone` or `phone` - Caller's phone number</li>
              <li>`duration` or `call_duration` - Call duration in seconds</li>
              <li>`timestamp` or `call_timestamp` - Call timestamp</li>
              <li>`audio_url` or `recording_url` - Recording URL</li>
            </ul>
          </li>
          <li>The system will automatically analyze calls using AI and trigger configured workflows</li>
        </ol>
      </div>
    </div>
  );
}
