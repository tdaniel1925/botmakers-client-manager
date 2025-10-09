/**
 * Script to auto-create Maya (setup assistant) for each industry in ClientFlow
 * Run this once to set up the QuickAgent industries and their setup assistants
 * 
 * Usage: npx tsx scripts/setup-quickagent-maya.ts
 */

import { db } from "../db";
import { createProject } from "../db/queries/projects-queries";
import { getOrganizationByName, createOrganization } from "../db/queries/organizations-queries";
import { createVoiceCampaignAction } from "../actions/voice-campaign-actions";
import { createIndustry } from "../db/queries/quickagent-industries-queries";
import { insuranceConfig, generateInsuranceMayaPrompt } from "../../quickagent/lib/industries/insurance";

async function setupMayaForIndustry(industryConfig: typeof insuranceConfig) {
  console.log(`\n🚀 Setting up Maya for ${industryConfig.name}...`);
  
  try {
    // 1. Get or create QuickAgent System organization
    let systemOrg = await getOrganizationByName("QuickAgent System");
    
    if (!systemOrg) {
      console.log("Creating QuickAgent System organization...");
      systemOrg = await createOrganization({
        name: "QuickAgent System",
        email: "system@quickagent.ai",
        plan: "enterprise",
        status: "active",
        description: "System organization for QuickAgent setup assistants",
      });
      console.log(`✅ Created organization: ${systemOrg.id}`);
    } else {
      console.log(`✅ Found existing organization: ${systemOrg.id}`);
    }
    
    // 2. Create system project for this industry
    console.log("Creating project...");
    const project = await createProject({
      name: `QuickAgent - ${industryConfig.name}`,
      organizationId: systemOrg.id,
      description: `System project for ${industryConfig.name} setup assistants`,
      status: "active",
      priority: "high",
    });
    console.log(`✅ Created project: ${project.id}`);
    
    // 3. Create Maya campaign (setup assistant)
    console.log("Creating Maya campaign...");
    
    const systemPrompt = industryConfig.slug === "insurance-agents" 
      ? generateInsuranceMayaPrompt()
      : "Generic setup assistant prompt"; // For future industries
    
    const mayaCampaign = await createVoiceCampaignAction({
      name: `Maya - ${industryConfig.name}`,
      projectId: project.id,
      type: "inbound",
      systemPrompt,
      firstMessage: industryConfig.mayaGreeting,
      voiceProvider: "vapi",
      model: "gpt-4o",
      phoneNumberSource: "skip", // No phone number needed for setup assistant
      mustCollectFields: industryConfig.setupQuestions.map(q => q.id),
    });
    
    if (!mayaCampaign.success) {
      throw new Error(`Failed to create Maya campaign: ${mayaCampaign.error}`);
    }
    
    console.log(`✅ Created Maya campaign: ${mayaCampaign.campaign?.id}`);
    
    // 4. Store in industries table
    console.log("Storing industry configuration...");
    const industry = await createIndustry({
      slug: industryConfig.slug,
      name: industryConfig.name,
      description: industryConfig.description,
      tagline: industryConfig.tagline,
      setupAssistantCampaignId: mayaCampaign.campaign?.id,
      config: {
        setupQuestions: industryConfig.setupQuestions,
        builtAgentPurpose: industryConfig.builtAgentPurpose,
        builtAgentType: industryConfig.builtAgentType,
        sampleConversation: industryConfig.sampleConversation,
      },
    });
    
    console.log(`✅ Stored industry: ${industry.id}`);
    
    console.log(`\n🎉 Successfully set up Maya for ${industryConfig.name}!`);
    console.log(`   - Organization: ${systemOrg.id}`);
    console.log(`   - Project: ${project.id}`);
    console.log(`   - Campaign: ${mayaCampaign.campaign?.id}`);
    console.log(`   - Industry: ${industry.id}`);
    
    return {
      success: true,
      industry,
      campaign: mayaCampaign.campaign,
    };
  } catch (error) {
    console.error(`❌ Error setting up Maya for ${industryConfig.name}:`, error);
    throw error;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("QuickAgent Maya Setup Script");
  console.log("=".repeat(60));
  
  try {
    // Set up insurance industry first
    await setupMayaForIndustry(insuranceConfig);
    
    // Future: Add more industries here
    // await setupMayaForIndustry(dentalConfig);
    // await setupMayaForIndustry(legalConfig);
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ All industries set up successfully!");
    console.log("=".repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Setup failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { setupMayaForIndustry };

