// Seed Subscription Plans
// Run this script to populate the database with default subscription plans

import { config } from "dotenv";

// Load environment variables BEFORE importing db
config({ path: ".env.local" });

import { db } from "./db";
import { subscriptionPlansTable } from "./schema/billing-schema";
import { eq } from "drizzle-orm";

const DEFAULT_PLANS = [
  {
    name: "Free",
    slug: "free",
    description: "Perfect for trying out AI voice campaigns",
    monthlyPrice: 0,
    includedMinutes: 100,
    overageRatePerMinute: 15, // $0.15/min - high rate to encourage upgrade
    maxActiveCampaigns: 1,
    maxUsers: 2,
    features: [
      "100 free minutes/month",
      "1 active campaign",
      "Basic analytics",
      "Email support",
      "GPT-4o AI model",
    ],
    displayOrder: 1,
    isActive: true,
  },
  {
    name: "Starter",
    slug: "starter",
    description: "Great for small businesses getting started",
    monthlyPrice: 9900, // $99/month
    includedMinutes: 1000,
    overageRatePerMinute: 10, // $0.10/min
    maxActiveCampaigns: 5,
    maxUsers: 5,
    features: [
      "1,000 minutes/month",
      "5 active campaigns",
      "Advanced analytics",
      "Priority email support",
      "Custom voicemail messages",
      "GPT-4o AI model",
      "Webhook integrations",
    ],
    displayOrder: 2,
    isActive: true,
  },
  {
    name: "Professional",
    slug: "professional",
    description: "For growing businesses with high call volumes",
    monthlyPrice: 29900, // $299/month
    includedMinutes: 5000,
    overageRatePerMinute: 8, // $0.08/min
    maxActiveCampaigns: -1, // unlimited
    maxUsers: 15,
    features: [
      "5,000 minutes/month",
      "Unlimited campaigns",
      "Real-time analytics & insights",
      "Phone + email support",
      "Custom integrations",
      "White-label option",
      "GPT-4o AI model",
      "Priority voice provisioning",
      "Advanced call routing",
    ],
    displayOrder: 3,
    isActive: true,
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    description: "Custom solutions for enterprise needs",
    monthlyPrice: 99900, // $999/month
    includedMinutes: 20000,
    overageRatePerMinute: 6, // $0.06/min
    maxActiveCampaigns: -1, // unlimited
    maxUsers: -1, // unlimited
    features: [
      "20,000 minutes/month",
      "Unlimited everything",
      "Dedicated account manager",
      "24/7 priority support",
      "Custom development",
      "SLA guarantee (99.9% uptime)",
      "GPT-4o AI model",
      "Custom voice models",
      "Multi-region deployment",
      "Advanced security & compliance",
      "API access & custom endpoints",
    ],
    displayOrder: 4,
    isActive: true,
  },
];

export async function seedPlans() {
  console.log("🌱 Seeding subscription plans...");
  
  try {
    for (const plan of DEFAULT_PLANS) {
      // Check if plan already exists
      const existing = await db
        .select()
        .from(subscriptionPlansTable)
        .where(eq(subscriptionPlansTable.slug, plan.slug))
        .limit(1);
      
      if (existing.length > 0) {
        console.log(`  ⚠️  Plan "${plan.name}" already exists, skipping...`);
        continue;
      }
      
      // Create the plan
      await db.insert(subscriptionPlansTable).values(plan);
      console.log(`  ✅ Created plan: ${plan.name} ($${plan.monthlyPrice / 100}/month)`);
    }
    
    console.log("✅ Subscription plans seeded successfully!");
    
    // Display summary
    const allPlans = await db
      .select()
      .from(subscriptionPlansTable)
      .orderBy(subscriptionPlansTable.displayOrder);
    
    console.log("\n📊 Current Plans:");
    allPlans.forEach((plan) => {
      console.log(
        `  - ${plan.name}: $${plan.monthlyPrice / 100}/mo | ${plan.includedMinutes} mins | Overage: $${plan.overageRatePerMinute / 100}/min`
      );
    });
  } catch (error) {
    console.error("❌ Error seeding plans:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedPlans()
    .then(() => {
      console.log("\n✨ Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Failed:", error);
      process.exit(1);
    });
}
