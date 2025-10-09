"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { 
  campaignMessageTemplatesTable,
  campaignMessagingConfigTable,
  campaignMessageLogTable 
} from "@/db/schema/campaign-messaging-schema";
import { eq, and, desc } from "drizzle-orm";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { revalidatePath } from "next/cache";

// ===== TEMPLATE ACTIONS =====

export async function createMessageTemplateAction(template: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const isAdmin = await isPlatformAdmin();
    if (!isAdmin) {
      return { error: "Only platform admins can create message templates" };
    }

    const [newTemplate] = await db.insert(campaignMessageTemplatesTable).values({
      campaignId: template.campaignId,
      projectId: template.projectId,
      type: template.type,
      name: template.name,
      description: template.description,
      smsMessage: template.smsMessage,
      emailSubject: template.emailSubject,
      emailBody: template.emailBody,
      triggerConditions: template.triggerConditions,
      availableVariables: template.availableVariables,
      isActive: template.isActive,
      createdBy: userId,
    }).returning();

    revalidatePath(`/platform/projects/[id]/campaigns/[campaignId]`);

    return { template: newTemplate };
  } catch (error: any) {
    console.error("[Template] Create error:", error);
    return { error: error.message || "Failed to create template" };
  }
}

export async function updateMessageTemplateAction(templateId: string, updates: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const isAdmin = await isPlatformAdmin();
    if (!isAdmin) {
      return { error: "Only platform admins can update message templates" };
    }

    const [updatedTemplate] = await db
      .update(campaignMessageTemplatesTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(campaignMessageTemplatesTable.id, templateId))
      .returning();

    revalidatePath(`/platform/projects/[id]/campaigns/[campaignId]`);

    return { template: updatedTemplate };
  } catch (error: any) {
    console.error("[Template] Update error:", error);
    return { error: error.message || "Failed to update template" };
  }
}

export async function deleteMessageTemplateAction(templateId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const isAdmin = await isPlatformAdmin();
    if (!isAdmin) {
      return { error: "Only platform admins can delete message templates" };
    }

    await db
      .delete(campaignMessageTemplatesTable)
      .where(eq(campaignMessageTemplatesTable.id, templateId));

    revalidatePath(`/platform/projects/[id]/campaigns/[campaignId]`);

    return { success: true };
  } catch (error: any) {
    console.error("[Template] Delete error:", error);
    return { error: error.message || "Failed to delete template" };
  }
}

export async function getTemplatesForCampaignAction(campaignId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const templates = await db
      .select()
      .from(campaignMessageTemplatesTable)
      .where(eq(campaignMessageTemplatesTable.campaignId, campaignId))
      .orderBy(desc(campaignMessageTemplatesTable.createdAt));

    return { templates };
  } catch (error: any) {
    console.error("[Template] Fetch error:", error);
    return { error: error.message || "Failed to fetch templates" };
  }
}

// ===== MESSAGING CONFIG ACTIONS =====

export async function updateMessagingConfigAction(
  campaignId: string,
  config: {
    smsEnabled: boolean;
    emailEnabled: boolean;
    smsTemplateId?: string;
    emailTemplateId?: string;
    defaultSendTiming: string;
    maxMessagesPerContact: number;
    minTimeBetweenMessages: number;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const isAdmin = await isPlatformAdmin();
    if (!isAdmin) {
      return { error: "Only platform admins can update messaging config" };
    }

    // Check if config exists
    const existing = await db
      .select()
      .from(campaignMessagingConfigTable)
      .where(eq(campaignMessagingConfigTable.campaignId, campaignId))
      .limit(1);

    let result;
    if (existing.length > 0) {
      // Update existing
      [result] = await db
        .update(campaignMessagingConfigTable)
        .set({
          smsEnabled: config.smsEnabled,
          emailEnabled: config.emailEnabled,
          smsTemplateId: config.smsTemplateId || null,
          emailTemplateId: config.emailTemplateId || null,
          defaultSendTiming: config.defaultSendTiming,
          maxMessagesPerContact: config.maxMessagesPerContact,
          minTimeBetweenMessages: config.minTimeBetweenMessages,
          updatedAt: new Date(),
        })
        .where(eq(campaignMessagingConfigTable.campaignId, campaignId))
        .returning();
    } else {
      // Create new
      [result] = await db
        .insert(campaignMessagingConfigTable)
        .values({
          campaignId,
          smsEnabled: config.smsEnabled,
          emailEnabled: config.emailEnabled,
          smsTemplateId: config.smsTemplateId || null,
          emailTemplateId: config.emailTemplateId || null,
          defaultSendTiming: config.defaultSendTiming,
          maxMessagesPerContact: config.maxMessagesPerContact,
          minTimeBetweenMessages: config.minTimeBetweenMessages,
        })
        .returning();
    }

    revalidatePath(`/platform/projects/[id]/campaigns/[campaignId]`);

    return { config: result };
  } catch (error: any) {
    console.error("[Messaging Config] Update error:", error);
    return { error: error.message || "Failed to update messaging config" };
  }
}

export async function getMessagingConfigAction(campaignId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const configs = await db
      .select()
      .from(campaignMessagingConfigTable)
      .where(eq(campaignMessagingConfigTable.campaignId, campaignId))
      .limit(1);

    return { config: configs[0] || null };
  } catch (error: any) {
    console.error("[Messaging Config] Fetch error:", error);
    return { error: error.message || "Failed to fetch messaging config" };
  }
}

// ===== MESSAGE LOG ACTIONS =====

export async function getMessageLogsAction(campaignId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const logs = await db
      .select()
      .from(campaignMessageLogTable)
      .where(eq(campaignMessageLogTable.campaignId, campaignId))
      .orderBy(desc(campaignMessageLogTable.createdAt))
      .limit(100); // Limit to recent 100

    return { logs };
  } catch (error: any) {
    console.error("[Message Log] Fetch error:", error);
    return { error: error.message || "Failed to fetch message logs" };
  }
}

