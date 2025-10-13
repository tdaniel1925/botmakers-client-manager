// Voice Campaigns Queries - Database operations for voice campaigns

import { db } from "../db";
import {
  voiceCampaignsTable,
  campaignProviderMetadataTable,
  type SelectVoiceCampaign,
  type InsertVoiceCampaign,
  type SelectCampaignProviderMetadata,
  type InsertCampaignProviderMetadata,
} from "../schema";
import { eq, and, desc, sql } from "drizzle-orm";

// ===== CAMPAIGN CRUD =====

export async function getCampaignById(id: string): Promise<SelectVoiceCampaign | null> {
  const results = await db
    .select()
    .from(voiceCampaignsTable)
    .where(eq(voiceCampaignsTable.id, id))
    .limit(1);
  
  return results[0] || null;
}

export async function getCampaignsByProject(projectId: string): Promise<SelectVoiceCampaign[]> {
  return await db
    .select()
    .from(voiceCampaignsTable)
    .where(eq(voiceCampaignsTable.projectId, projectId))
    .orderBy(desc(voiceCampaignsTable.createdAt));
}

export async function getActiveCampaignsByProject(projectId: string): Promise<SelectVoiceCampaign[]> {
  return await db
    .select()
    .from(voiceCampaignsTable)
    .where(
      and(
        eq(voiceCampaignsTable.projectId, projectId),
        eq(voiceCampaignsTable.isActive, true),
        eq(voiceCampaignsTable.status, "active")
      )
    )
    .orderBy(desc(voiceCampaignsTable.createdAt));
}

export async function getCampaignByPhoneNumber(phoneNumber: string): Promise<SelectVoiceCampaign | null> {
  const results = await db
    .select()
    .from(voiceCampaignsTable)
    .where(eq(voiceCampaignsTable.phoneNumber, phoneNumber))
    .limit(1);
  
  return results[0] || null;
}

export async function getCampaignByWebhookId(webhookId: string): Promise<SelectVoiceCampaign | null> {
  const results = await db
    .select()
    .from(voiceCampaignsTable)
    .where(eq(voiceCampaignsTable.webhookId, webhookId))
    .limit(1);
  
  return results[0] || null;
}

export async function getCampaignByProviderAssistantId(
  provider: string,
  assistantId: string
): Promise<SelectVoiceCampaign | null> {
  const results = await db
    .select()
    .from(voiceCampaignsTable)
    .where(
      and(
        eq(voiceCampaignsTable.provider, provider as any),
        eq(voiceCampaignsTable.providerAssistantId, assistantId)
      )
    )
    .limit(1);
  
  return results[0] || null;
}

export async function createCampaign(data: InsertVoiceCampaign): Promise<SelectVoiceCampaign> {
  const results = await db
    .insert(voiceCampaignsTable)
    .values(data)
    .returning();
  
  return results[0];
}

export async function updateCampaign(
  id: string,
  data: Partial<InsertVoiceCampaign>
): Promise<SelectVoiceCampaign | null> {
  const results = await db
    .update(voiceCampaignsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(voiceCampaignsTable.id, id))
    .returning();
  
  return results[0] || null;
}

export async function deleteCampaign(id: string): Promise<void> {
  await db
    .delete(voiceCampaignsTable)
    .where(eq(voiceCampaignsTable.id, id));
}

// ===== CAMPAIGN STATS =====

export async function updateCampaignStats(
  id: string,
  stats: {
    totalCalls?: number;
    completedCalls?: number;
    failedCalls?: number;
    averageCallDuration?: number;
    averageCallQuality?: number;
    totalCost?: number;
    lastCallAt?: Date;
  }
): Promise<void> {
  await db
    .update(voiceCampaignsTable)
    .set({
      ...stats,
      updatedAt: new Date(),
    })
    .where(eq(voiceCampaignsTable.id, id));
}

export async function incrementCampaignCallCount(
  id: string,
  success: boolean = true
): Promise<void> {
  await db
    .update(voiceCampaignsTable)
    .set({
      totalCalls: sql`${voiceCampaignsTable.totalCalls} + 1`,
      completedCalls: success
        ? sql`${voiceCampaignsTable.completedCalls} + 1`
        : voiceCampaignsTable.completedCalls,
      failedCalls: !success
        ? sql`${voiceCampaignsTable.failedCalls} + 1`
        : voiceCampaignsTable.failedCalls,
      lastCallAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(voiceCampaignsTable.id, id));
}

export async function updateCampaignStatus(
  id: string,
  status: "draft" | "active" | "paused" | "completed" | "failed"
): Promise<void> {
  await db
    .update(voiceCampaignsTable)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(voiceCampaignsTable.id, id));
}

// ===== PROVIDER METADATA =====

export async function getCampaignProviderMetadata(
  campaignId: string
): Promise<SelectCampaignProviderMetadata | null> {
  const results = await db
    .select()
    .from(campaignProviderMetadataTable)
    .where(eq(campaignProviderMetadataTable.campaignId, campaignId))
    .limit(1);
  
  return results[0] || null;
}

export async function createCampaignProviderMetadata(
  data: InsertCampaignProviderMetadata
): Promise<SelectCampaignProviderMetadata> {
  const results = await db
    .insert(campaignProviderMetadataTable)
    .values(data)
    .returning();
  
  return results[0];
}

export async function updateCampaignProviderMetadata(
  campaignId: string,
  metadata: any
): Promise<SelectCampaignProviderMetadata | null> {
  const results = await db
    .update(campaignProviderMetadataTable)
    .set({
      metadata,
      updatedAt: new Date(),
    })
    .where(eq(campaignProviderMetadataTable.campaignId, campaignId))
    .returning();
  
  return results[0] || null;
}

// ===== CAMPAIGN ANALYTICS =====

export async function getCampaignAnalytics(projectId: string) {
  const campaigns = await getCampaignsByProject(projectId);
  
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const totalCalls = campaigns.reduce((sum, c) => sum + (c.totalCalls || 0), 0);
  const completedCalls = campaigns.reduce((sum, c) => sum + (c.completedCalls || 0), 0);
  const avgCallDuration = campaigns.reduce((sum, c) => sum + (c.averageCallDuration || 0), 0) / totalCampaigns || 0;
  const avgCallQuality = campaigns.reduce((sum, c) => sum + (c.averageCallQuality || 0), 0) / totalCampaigns || 0;
  const totalCost = campaigns.reduce((sum, c) => sum + (c.totalCost || 0), 0);
  
  return {
    totalCampaigns,
    activeCampaigns,
    totalCalls,
    completedCalls,
    successRate: totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0,
    avgCallDuration: Math.round(avgCallDuration),
    avgCallQuality: Math.round(avgCallQuality * 10) / 10,
    totalCost,
    providerDistribution: campaigns.reduce((acc, c) => {
      acc[c.provider] = (acc[c.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

// ===== BULK OPERATIONS =====

export async function pauseAllCampaigns(projectId: string): Promise<void> {
  await db
    .update(voiceCampaignsTable)
    .set({
      status: "paused",
      isActive: false,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(voiceCampaignsTable.projectId, projectId),
        eq(voiceCampaignsTable.status, "active")
      )
    );
}

export async function resumeAllCampaigns(projectId: string): Promise<void> {
  await db
    .update(voiceCampaignsTable)
    .set({
      status: "active",
      isActive: true,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(voiceCampaignsTable.projectId, projectId),
        eq(voiceCampaignsTable.status, "paused")
      )
    );
}

// Alias for backward compatibility
export const getVoiceCampaignById = getCampaignById;
