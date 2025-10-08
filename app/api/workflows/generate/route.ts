import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isPlatformAdmin } from "@/db/queries/platform-queries";
import { generateWorkflowFromPrompt } from "@/lib/ai-workflow-generator";

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // 2. Platform admin check
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only platform admins can create workflows" },
        { status: 403 }
      );
    }
    
    // 3. Parse request
    const { prompt, projectId } = await request.json();
    
    if (!prompt || !projectId) {
      return NextResponse.json(
        { error: "Prompt and projectId are required" },
        { status: 400 }
      );
    }
    
    // 4. Generate workflow using AI
    console.log("[Workflow API] Generating workflow from prompt:", prompt);
    const workflowResult = await generateWorkflowFromPrompt(
      prompt,
      projectId,
      userId
    );
    
    console.log("[Workflow API] Generated workflow:", workflowResult.workflowName);
    
    return NextResponse.json(workflowResult);
    
  } catch (error: any) {
    console.error("[Workflow API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate workflow" },
      { status: 500 }
    );
  }
}
