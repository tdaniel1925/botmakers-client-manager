import { NextResponse } from "next/server";
import {
  getWebhookByToken,
  createCallRecord,
  updateWebhookStats,
} from "@/db/queries/calls-queries";
import { getCampaignByWebhookId } from "@/db/queries/voice-campaigns-queries";
import { getProjectById } from "@/db/queries/projects-queries";
import { recordCallUsage } from "@/lib/billing/usage-tracker";
import { queueCallAnalysis } from "@/lib/call-analysis-queue";

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    
    // 1. Validate webhook token
    const webhook = await getWebhookByToken(token);
    if (!webhook || !webhook.isActive) {
      return NextResponse.json(
        { error: "Invalid or inactive webhook" },
        { status: 401 }
      );
    }
    
    // 2. Optional API key validation
    if (webhook.apiKey) {
      const apiKey = request.headers.get("X-API-Key");
      if (apiKey !== webhook.apiKey) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid API key" },
          { status: 401 }
        );
      }
    }
    
    // 3. Parse payload
    const payload = await request.json();
    
    // 4. Extract call data (flexible schema to support various voice agent platforms)
    const callData = {
      transcript: payload.transcript || payload.text || payload.call_transcript || "",
      callerPhone: payload.caller?.phone || payload.phone || payload.from || "",
      callerName: payload.caller?.name || payload.name || payload.caller_name || "",
      callDurationSeconds: payload.duration || payload.call_duration || payload.duration_seconds || 0,
      callTimestamp: payload.timestamp 
        ? new Date(payload.timestamp) 
        : (payload.call_timestamp ? new Date(payload.call_timestamp) : new Date()),
      audioUrl: payload.audio_url || payload.recording_url || payload.recording || "",
      structuredData: payload.structured_data || payload.metadata || payload.data || {},
      callExternalId: payload.call_id || payload.id || payload.external_id || null,
    };
    
    // Validate required field
    if (!callData.transcript) {
      return NextResponse.json(
        { error: "Missing required field: transcript" },
        { status: 400 }
      );
    }
    
    // 5. Store call record
    const callRecord = await createCallRecord({
      projectId: webhook.projectId,
      webhookId: webhook.id,
      rawPayload: payload,
      transcript: callData.transcript,
      callerPhone: callData.callerPhone || null,
      callerName: callData.callerName || null,
      callDurationSeconds: callData.callDurationSeconds,
      callTimestamp: callData.callTimestamp,
      audioUrl: callData.audioUrl || null,
      structuredData: callData.structuredData,
      callExternalId: callData.callExternalId,
      aiAnalysisStatus: "pending",
    });
    
    // 6. Record usage for billing (if call is associated with a campaign)
    try {
      const campaign = await getCampaignByWebhookId(webhook.id);
      if (campaign) {
        const project = await getProjectById(webhook.projectId);
        if (project && project.organizationId) {
          const usageResult = await recordCallUsage(
            project.organizationId,
            campaign.id,
            callRecord.id,
            callData.callDurationSeconds
          );
          
          if (usageResult.success) {
            console.log(
              `[Usage] Recorded ${usageResult.minutesUsed} minutes for org ${project.organizationId}` +
              ` (${usageResult.remainingMinutes} remaining, overage: ${usageResult.wasOverage})`
            );
          } else {
            console.error(`[Usage] Failed to record usage:`, usageResult.error);
          }
        }
      }
    } catch (usageError) {
      // Don't fail the webhook if usage recording fails
      console.error("[Usage] Error recording call usage:", usageError);
    }
    
    // 7. Queue AI analysis (async)
    await queueCallAnalysis(callRecord.id);
    
    // 8. Update webhook stats
    await updateWebhookStats(webhook.id);
    
    return NextResponse.json({
      success: true,
      call_id: callRecord.id,
      message: "Call received and queued for analysis",
    });
    
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to verify webhook is active
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const webhook = await getWebhookByToken(token);
    
    if (!webhook) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      active: webhook.isActive,
      project_id: webhook.projectId,
      label: webhook.label,
      total_calls_received: webhook.totalCallsReceived,
      last_call_received_at: webhook.lastCallReceivedAt,
    });
  } catch (error) {
    console.error("Webhook GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
