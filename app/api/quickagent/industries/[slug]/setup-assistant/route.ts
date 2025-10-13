import { NextResponse } from "next/server";
import { getIndustryBySlug } from "@/db/queries/quickagent-industries-queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.trim(); // Remove trailing/leading spaces
    
    console.log("🔍 API: Fetching industry data for:", slug);
    
    // 🚀 DEVELOPMENT MODE: Return mock data if VAPI_ASSISTANT_ID is set
    const mockVapiId = process.env.VAPI_ASSISTANT_ID || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (mockVapiId && slug === "insurance-agents") {
      console.log("✅ Using mock Maya configuration for development");
      return NextResponse.json({
        success: true,
        industryName: "Insurance Agents",
        industrySlug: "insurance-agents",
        tagline: "Build Your Lead Qualification Agent in 5 Minutes",
        description: "AI-powered lead qualification for insurance agents",
        assistantId: "mock-campaign-id",
        vapiAssistantId: mockVapiId,
        systemPrompt: "You are Maya, helping insurance agents set up their lead qualification AI.",
        firstMessage: "Hi! I'm Maya, and I'm excited to help you build your lead qualification agent. Let's start - what's your name?",
        config: {},
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    
    const industry = await getIndustryBySlug(slug);
    
    console.log("📊 Industry found:", industry ? "YES" : "NO");
    if (industry) {
      console.log("   - Name:", industry.name);
      console.log("   - Setup Assistant ID:", industry.setupAssistantCampaignId);
      console.log("   - Campaign loaded:", industry.setupAssistantCampaignId ? "YES" : "NO");
    }
    
    if (!industry) {
      return NextResponse.json(
        { error: "Industry not found" },
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }
    
    if (!industry.isActive) {
      return NextResponse.json(
        { error: "Industry is not active" },
        { 
          status: 403,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }
    
    // Return setup assistant details
    const response = {
      success: true,
      industryName: industry.name,
      industrySlug: industry.slug,
      tagline: industry.tagline,
      description: industry.description,
      assistantId: industry.setupAssistantCampaignId,
      vapiAssistantId: (industry as any).setupAssistantCampaign?.providerAssistantId || null,
      systemPrompt: (industry as any).setupAssistantCampaign?.systemPrompt || null,
      firstMessage: (industry as any).setupAssistantCampaign?.firstMessage || null,
      config: industry.config,
    };
    
    console.log("✅ API: Returning response with Vapi ID:", response.vapiAssistantId);
    
    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    console.error("Full error:", error);
    return NextResponse.json(
      { error: "Failed to fetch setup assistant", details: error instanceof Error ? error.message : "Unknown error" },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

