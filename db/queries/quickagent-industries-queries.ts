import { db } from "../db";
import { quickagentIndustriesTable } from "../schema/quickagent-industries-schema";
import { voiceCampaignsTable } from "../schema/voice-campaigns-schema";
import { eq } from "drizzle-orm";

export async function getIndustryBySlug(slug: string) {
  // Get industry
  const [industry] = await db
    .select()
    .from(quickagentIndustriesTable)
    .where(eq(quickagentIndustriesTable.slug, slug))
    .limit(1);
  
  if (!industry) {
    return null;
  }
  
  // If there's a setup assistant campaign ID, fetch it
  if (industry.setupAssistantCampaignId) {
    const [campaign] = await db
      .select()
      .from(voiceCampaignsTable)
      .where(eq(voiceCampaignsTable.id, industry.setupAssistantCampaignId))
      .limit(1);
    
    return {
      ...industry,
      setupAssistantCampaign: campaign,
    };
  }
  
  return industry;
}

export async function getAllActiveIndustries() {
  const industries = await db.query.quickagentIndustriesTable.findMany({
    where: eq(quickagentIndustriesTable.isActive, true),
    orderBy: (industries, { asc }) => [asc(industries.name)],
  });
  
  return industries;
}

export async function createIndustry(data: {
  slug: string;
  name: string;
  description?: string;
  tagline?: string;
  setupAssistantCampaignId?: string;
  config?: any;
}) {
  const [industry] = await db
    .insert(quickagentIndustriesTable)
    .values({
      ...data,
      isActive: true,
    })
    .returning();
  
  return industry;
}

export async function updateIndustry(slug: string, data: {
  name?: string;
  description?: string;
  tagline?: string;
  setupAssistantCampaignId?: string;
  config?: any;
  isActive?: boolean;
}) {
  const [industry] = await db
    .update(quickagentIndustriesTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(quickagentIndustriesTable.slug, slug))
    .returning();
  
  return industry;
}

export async function deleteIndustry(slug: string) {
  await db
    .delete(quickagentIndustriesTable)
    .where(eq(quickagentIndustriesTable.slug, slug));
}

