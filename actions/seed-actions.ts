// Seed Actions - Server actions for seeding initial data
"use server";

import { auth } from "@clerk/nextjs/server";
import { isPlatformAdmin } from "@/db/queries/platform-queries";
import { createPlan, getAllPlans } from "@/db/queries/billing-queries";

const DEFAULT_PLANS = [
  {
    name: "Free",
    slug: "free",
    description: "Perfect for trying out AI voice campaigns",
    monthlyPrice: 0,
    includedMinutes: 100,
    overageRatePerMinute: 15, // $0.15/min
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
    maxActiveCampaigns: -1,
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
    maxActiveCampaigns: -1,
    maxUsers: -1,
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

export async function seedSubscriptionPlansAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can seed plans" };
    }
    
    const existing = await getAllPlans();
    if (existing.length > 0) {
      return { error: "Plans already seeded", planCount: existing.length };
    }
    
    const created = [];
    for (const plan of DEFAULT_PLANS) {
      const newPlan = await createPlan(plan as any);
      created.push(newPlan);
    }
    
    console.log(`[Seed] Created ${created.length} subscription plans`);
    
    return {
      success: true,
      created,
      message: `Successfully created ${created.length} subscription plans`,
    };
  } catch (error) {
    console.error("[Seed] Error seeding plans:", error);
    return { error: "Failed to seed plans" };
  }
}