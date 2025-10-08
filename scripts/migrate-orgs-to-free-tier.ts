// Migration Script: Assign Free Tier to Existing Organizations
// This script assigns all existing organizations without a subscription to the Free plan

import { db } from "../db/db";
import { organizationsTable } from "../db/schema/crm-schema";
import { 
  organizationSubscriptionsTable, 
  subscriptionPlansTable 
} from "../db/schema/billing-schema";
import { eq, sql } from "drizzle-orm";

interface MigrationResult {
  organizationsProcessed: number;
  subscriptionsCreated: number;
  alreadyHadSubscription: number;
  errors: number;
  errorDetails: Array<{ orgId: string; error: string }>;
}

export async function migrateOrgsToFreeTier(): Promise<MigrationResult> {
  console.log("🚀 Starting migration: Assigning Free tier to existing organizations\n");
  
  const result: MigrationResult = {
    organizationsProcessed: 0,
    subscriptionsCreated: 0,
    alreadyHadSubscription: 0,
    errors: 0,
    errorDetails: [],
  };
  
  try {
    // 1. Get the Free plan
    const freePlan = await db
      .select()
      .from(subscriptionPlansTable)
      .where(eq(subscriptionPlansTable.slug, "free"))
      .limit(1);
    
    if (freePlan.length === 0) {
      throw new Error("Free plan not found! Please run seed-plans.ts first.");
    }
    
    console.log(`✅ Found Free plan: ${freePlan[0].name} (${freePlan[0].includedMinutes} minutes/month)\n`);
    
    // 2. Get all organizations
    const organizations = await db
      .select()
      .from(organizationsTable)
      .where(sql`${organizationsTable.deletedAt} IS NULL`); // Only active orgs
    
    console.log(`📊 Found ${organizations.length} organizations to process\n`);
    
    // 3. Process each organization
    for (const org of organizations) {
      result.organizationsProcessed++;
      
      try {
        // Check if organization already has a subscription
        const existingSubscription = await db
          .select()
          .from(organizationSubscriptionsTable)
          .where(eq(organizationSubscriptionsTable.organizationId, org.id))
          .limit(1);
        
        if (existingSubscription.length > 0) {
          console.log(`  ⚠️  ${org.name} already has a subscription, skipping...`);
          result.alreadyHadSubscription++;
          continue;
        }
        
        // Create subscription for this organization
        const now = new Date();
        const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        
        const newSubscription = await db
          .insert(organizationSubscriptionsTable)
          .values({
            organizationId: org.id,
            planId: freePlan[0].id,
            paymentProvider: "none", // Free tier doesn't require payment
            status: "active",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            minutesUsedThisCycle: 0,
            minutesIncludedThisCycle: freePlan[0].includedMinutes,
            overageMinutesThisCycle: 0,
            overageCostThisCycle: 0,
          })
          .returning();
        
        // Update organization to reference this subscription
        await db
          .update(organizationsTable)
          .set({
            currentSubscriptionId: newSubscription[0].id,
            plan: "free",
            updatedAt: new Date(),
          })
          .where(eq(organizationsTable.id, org.id));
        
        console.log(`  ✅ Created Free subscription for: ${org.name}`);
        result.subscriptionsCreated++;
      } catch (error) {
        console.error(`  ❌ Error processing ${org.name}:`, error);
        result.errors++;
        result.errorDetails.push({
          orgId: org.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
    
    // 4. Display summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Complete!");
    console.log("=".repeat(60));
    console.log(`Total organizations processed: ${result.organizationsProcessed}`);
    console.log(`Subscriptions created: ${result.subscriptionsCreated}`);
    console.log(`Already had subscription: ${result.alreadyHadSubscription}`);
    console.log(`Errors: ${result.errors}`);
    
    if (result.errorDetails.length > 0) {
      console.log("\n❌ Error Details:");
      result.errorDetails.forEach((err) => {
        console.log(`  - Org ID ${err.orgId}: ${err.error}`);
      });
    }
    
    console.log("\n✨ Migration completed successfully!");
    
    return result;
  } catch (error) {
    console.error("\n❌ Fatal error during migration:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  migrateOrgsToFreeTier()
    .then((result) => {
      console.log("\n✅ Done!");
      process.exit(result.errors > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error("\n❌ Migration failed:", error);
      process.exit(1);
    });
}
