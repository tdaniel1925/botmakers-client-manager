import { NextResponse } from "next/server";
import { getVoiceCampaignById } from "@/db/queries/voice-campaigns-queries";
import { makeOutboundCall } from "@/lib/voice-providers/vapi-provider";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campaignId, userPhone } = body;

    if (!campaignId || !userPhone) {
      return NextResponse.json(
        { error: "Campaign ID and phone number are required" },
        { status: 400 }
      );
    }

    console.log("Placing test call to:", userPhone, "for campaign:", campaignId);

    // Get campaign details
    const campaign = await getVoiceCampaignById(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Place outbound call using Vapi
    const callResult = await makeOutboundCall({
      assistantId: campaign.providerAssistantId,
      customerPhoneNumber: userPhone,
      customerName: "Test User",
    });

    if (!callResult.success) {
      throw new Error("Failed to place outbound call");
    }

    return NextResponse.json({
      success: true,
      callId: callResult.callId,
      message: "Test call initiated successfully",
    });
  } catch (error) {
    console.error("Error placing test call:", error);
    return NextResponse.json(
      { error: "Failed to place test call", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

