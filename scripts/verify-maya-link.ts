import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { quickagentIndustriesTable } from "../db/schema/quickagent-industries-schema";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function verify() {
  const [industry] = await db
    .select()
    .from(quickagentIndustriesTable)
    .where(eq(quickagentIndustriesTable.slug, "insurance-agents"));
  
  if (industry?.setupAssistantCampaignId) {
    console.log("✅ Maya is linked!");
    console.log("   Campaign ID:", industry.setupAssistantCampaignId);
  } else {
    console.log("❌ Maya is NOT linked");
  }
  
  await client.end();
}

verify();

