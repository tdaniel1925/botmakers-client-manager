import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { subscriptionPlansTable } from "@/db/schema/billing-schema";
import { eq } from "drizzle-orm";

const DEFAULT_PLANS = [
  {
    name: "Free",
    slug: "free",
    description: "Basic access for testing and small projects",
    monthlyPrice: 0,
    includedMinutes: 100,
    overageRatePerMinute: 10, // $0.10/min
    maxActiveCampaigns: 1,
    features: ["1 Active Campaign", "100 Free Minutes/month", "Basic Analytics", "Email Support"],
  },
  {
    name: "Starter",
    slug: "starter",
    description: "Ideal for growing businesses with moderate call volumes",
    monthlyPrice: 9900, // $99.00
    includedMinutes: 1000,
    overageRatePerMinute: 8, // $0.08/min
    maxActiveCampaigns: 5,
    features: ["5 Active Campaigns", "1,000 Free Minutes/month", "Advanced Analytics", "Priority Email Support"],
  },
  {
    name: "Professional",
    slug: "professional",
    description: "For businesses needing higher capacity and priority support",
    monthlyPrice: 29900, // $299.00
    includedMinutes: 3000,
    overageRatePerMinute: 6, // $0.06/min
    maxActiveCampaigns: 20,
    features: ["20 Active Campaigns", "3,000 Free Minutes/month", "Advanced Analytics", "Priority Support"],
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    description: "Custom solutions for large-scale operations",
    monthlyPrice: 99900, // $999.00
    includedMinutes: 10000,
    overageRatePerMinute: 4, // $0.04/min
    maxActiveCampaigns: -1, // Unlimited
    features: ["Unlimited Campaigns", "10,000 Free Minutes/month", "Dedicated Account Manager", "SLA"],
  },
];

export async function POST(req: Request) {
  try {
    // Check authentication (you might want to add admin role check here)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🌱 Seeding subscription plans...");

    const results = [];

    for (const planData of DEFAULT_PLANS) {
      const existingPlan = await db.query.subscriptionPlansTable.findFirst({
        where: eq(subscriptionPlansTable.slug, planData.slug),
      });

      if (existingPlan) {
        await db
          .update(subscriptionPlansTable)
          .set({
            ...planData,
            updatedAt: new Date(),
          })
          .where(eq(subscriptionPlansTable.id, existingPlan.id));
        
        results.push({ action: "updated", plan: planData.name });
        console.log(`✅ Updated plan: ${planData.name}`);
      } else {
        await db.insert(subscriptionPlansTable).values(planData);
        results.push({ action: "created", plan: planData.name });
        console.log(`➕ Created plan: ${planData.name}`);
      }
    }

    console.log("✨ Subscription plans seeded successfully!");

    return NextResponse.json({
      success: true,
      message: "Subscription plans seeded successfully",
      results,
    });
  } catch (error: any) {
    console.error("❌ Error seeding plans:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed plans" },
      { status: 500 }
    );
  }
}

