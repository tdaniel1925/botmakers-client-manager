/**
 * Simple script to create the insurance industry record
 * Run this with: npx tsx scripts/create-insurance-industry.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { quickagentIndustriesTable } from "../db/schema/quickagent-industries-schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  console.log("Creating insurance industry record...");
  
  try {
    const result = await db
      .insert(quickagentIndustriesTable)
      .values({
        slug: "insurance-agents",
        name: "QuickAgent for Insurance Agents",
        description: "AI-powered lead qualification for life insurance agents. Automatically screen and qualify potential customers 24/7.",
        tagline: "Build Your Lead Qualification Agent in 5 Minutes",
        isActive: true,
        config: {
          builtAgentPurpose: "Lead qualification for life insurance",
          builtAgentType: "both",
          setupQuestions: [
            { id: "agent_name", question: "What's your name?" },
            { id: "agency_name", question: "What's your agency name?" },
            { id: "product_types", question: "What types of life insurance do you sell?" },
            { id: "ideal_customer_age", question: "What age range are your ideal customers?" },
            { id: "income_threshold", question: "What's the minimum annual income you look for?" },
            { id: "qualifying_questions", question: "What questions should I ask to qualify leads?" },
          ],
        },
      })
      .onConflictDoNothing()
      .returning();
    
    if (result.length > 0) {
      console.log("✅ Successfully created insurance industry record!");
      console.log("   ID:", result[0].id);
      console.log("   Slug:", result[0].slug);
    } else {
      console.log("ℹ️  Industry record already exists.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating industry record:", error);
    process.exit(1);
  }
}

main();

