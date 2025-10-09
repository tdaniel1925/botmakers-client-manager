/**
 * Script to link Maya campaign to the insurance industry
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { quickagentIndustriesTable } from "../db/schema/quickagent-industries-schema";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function linkMayaCampaign() {
  const mayaCampaignId = "043195f1-1413-4380-808f-2aa5b2492d4f";
  
  console.log("🔗 Linking Maya campaign to insurance industry...");
  console.log("   Campaign ID:", mayaCampaignId);
  
  try {
    const [updated] = await db
      .update(quickagentIndustriesTable)
      .set({
        setupAssistantCampaignId: mayaCampaignId,
        updatedAt: new Date(),
      })
      .where(eq(quickagentIndustriesTable.slug, "insurance-agents"))
      .returning();
    
    if (updated) {
      console.log("✅ Successfully linked Maya to insurance industry!");
      console.log("   Industry:", updated.name);
      console.log("   Maya Campaign ID:", updated.setupAssistantCampaignId);
      
      // Verify
      const industry = await db.query.quickagentIndustriesTable.findFirst({
        where: eq(quickagentIndustriesTable.slug, "insurance-agents"),
      });
      
      console.log("\n✨ Verification:");
      console.log("   Setup Assistant ID:", industry?.setupAssistantCampaignId);
      console.log("   Is Active:", industry?.isActive);
      
      console.log("\n🎉 QuickAgent is now ready!");
      console.log("   1. Visit http://localhost:3001");
      console.log("   2. Click 'Insurance Agents'");
      console.log("   3. Click 'Build My AI Agent Now'");
      console.log("   4. Talk to Maya!");
    } else {
      console.error("❌ No industry record found for 'insurance-agents'");
    }
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error linking Maya:", error);
    await client.end();
    process.exit(1);
  }
}

linkMayaCampaign();

