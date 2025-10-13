/**
 * Campaign Contacts Database Queries
 * CRUD operations for campaign contacts and uploads
 */

import { db } from "@/db/db";
import { eq, and, inArray, desc } from "drizzle-orm";
import {
  campaignContactsTable,
  campaignContactUploadsTable,
  InsertCampaignContact,
  InsertCampaignContactUpload,
  SelectCampaignContact,
  SelectCampaignContactUpload,
} from "@/db/schema";

// ===== CAMPAIGN CONTACTS =====

/**
 * Create a new campaign contact
 */
export async function createCampaignContact(
  data: InsertCampaignContact
): Promise<SelectCampaignContact> {
  const [contact] = await db
    .insert(campaignContactsTable)
    .values(data)
    .returning();
  return contact;
}

/**
 * Create multiple campaign contacts (bulk insert)
 */
export async function createCampaignContactsBulk(
  contacts: InsertCampaignContact[]
): Promise<SelectCampaignContact[]> {
  if (contacts.length === 0) return [];
  
  return await db
    .insert(campaignContactsTable)
    .values(contacts)
    .returning();
}

/**
 * Get contact by ID
 */
export async function getCampaignContactById(
  id: string
): Promise<SelectCampaignContact | null> {
  const [contact] = await db
    .select()
    .from(campaignContactsTable)
    .where(eq(campaignContactsTable.id, id))
    .limit(1);
  
  return contact || null;
}

/**
 * Get all contacts for a campaign
 */
export async function getCampaignContacts(
  campaignId: string
): Promise<SelectCampaignContact[]> {
  return await db
    .select()
    .from(campaignContactsTable)
    .where(eq(campaignContactsTable.campaignId, campaignId))
    .orderBy(desc(campaignContactsTable.createdAt));
}

/**
 * Get contacts by status
 */
export async function getCampaignContactsByStatus(
  campaignId: string,
  status: string
): Promise<SelectCampaignContact[]> {
  return await db
    .select()
    .from(campaignContactsTable)
    .where(
      and(
        eq(campaignContactsTable.campaignId, campaignId),
        eq(campaignContactsTable.callStatus, status as any)
      )
    )
    .orderBy(desc(campaignContactsTable.createdAt));
}

/**
 * Get contacts by timezone
 */
export async function getCampaignContactsByTimezone(
  campaignId: string,
  timezone: string
): Promise<SelectCampaignContact[]> {
  return await db
    .select()
    .from(campaignContactsTable)
    .where(
      and(
        eq(campaignContactsTable.campaignId, campaignId),
        eq(campaignContactsTable.timezone, timezone)
      )
    );
}

/**
 * Get contacts by upload batch
 */
export async function getCampaignContactsByBatch(
  batchId: string
): Promise<SelectCampaignContact[]> {
  return await db
    .select()
    .from(campaignContactsTable)
    .where(eq(campaignContactsTable.uploadBatchId, batchId))
    .orderBy(campaignContactsTable.rowNumber);
}

/**
 * Update contact
 */
export async function updateCampaignContact(
  id: string,
  data: Partial<InsertCampaignContact>
): Promise<SelectCampaignContact | null> {
  const [updated] = await db
    .update(campaignContactsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(campaignContactsTable.id, id))
    .returning();
  
  return updated || null;
}

/**
 * Update contact call status
 */
export async function updateContactCallStatus(
  id: string,
  status: string,
  callRecordId?: string
): Promise<void> {
  const updateData: any = {
    callStatus: status,
    lastAttemptAt: new Date(),
    updatedAt: new Date(),
  };
  
  if (callRecordId) {
    updateData.callRecordId = callRecordId;
  }
  
  await db
    .update(campaignContactsTable)
    .set(updateData)
    .where(eq(campaignContactsTable.id, id));
}

/**
 * Increment call attempts
 */
export async function incrementContactCallAttempts(id: string): Promise<void> {
  const contact = await getCampaignContactById(id);
  if (!contact) return;
  
  await db
    .update(campaignContactsTable)
    .set({
      callAttempts: (contact.callAttempts || 0) + 1,
      lastAttemptAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(campaignContactsTable.id, id));
}

/**
 * Delete contact
 */
export async function deleteCampaignContact(id: string): Promise<void> {
  await db
    .delete(campaignContactsTable)
    .where(eq(campaignContactsTable.id, id));
}

/**
 * Delete all contacts for a campaign
 */
export async function deleteCampaignContacts(campaignId: string): Promise<void> {
  await db
    .delete(campaignContactsTable)
    .where(eq(campaignContactsTable.campaignId, campaignId));
}

/**
 * Get campaign contact statistics
 */
export async function getCampaignContactStats(campaignId: string): Promise<{
  total: number;
  pending: number;
  completed: number;
  failed: number;
  byTimezone: Record<string, number>;
}> {
  const contacts = await getCampaignContacts(campaignId);
  
  const stats = {
    total: contacts.length,
    pending: 0,
    completed: 0,
    failed: 0,
    byTimezone: {} as Record<string, number>,
  };
  
  for (const contact of contacts) {
    // Count by status
    if (contact.callStatus === "pending" || contact.callStatus === "queued") {
      stats.pending++;
    } else if (contact.callStatus === "completed") {
      stats.completed++;
    } else if (contact.callStatus === "failed" || contact.callStatus === "invalid") {
      stats.failed++;
    }
    
    // Count by timezone
    const tz = contact.timezone || "unknown";
    stats.byTimezone[tz] = (stats.byTimezone[tz] || 0) + 1;
  }
  
  return stats;
}

// ===== CAMPAIGN CONTACT UPLOADS =====

/**
 * Create upload record
 */
export async function createCampaignContactUpload(
  data: InsertCampaignContactUpload
): Promise<SelectCampaignContactUpload> {
  const [upload] = await db
    .insert(campaignContactUploadsTable)
    .values(data)
    .returning();
  return upload;
}

/**
 * Get upload by ID
 */
export async function getCampaignContactUploadById(
  id: string
): Promise<SelectCampaignContactUpload | null> {
  const [upload] = await db
    .select()
    .from(campaignContactUploadsTable)
    .where(eq(campaignContactUploadsTable.id, id))
    .limit(1);
  
  return upload || null;
}

/**
 * Get upload by batch ID
 */
export async function getCampaignContactUploadByBatch(
  batchId: string
): Promise<SelectCampaignContactUpload | null> {
  const [upload] = await db
    .select()
    .from(campaignContactUploadsTable)
    .where(eq(campaignContactUploadsTable.batchId, batchId))
    .limit(1);
  
  return upload || null;
}

/**
 * Get all uploads for a campaign
 */
export async function getCampaignContactUploads(
  campaignId: string
): Promise<SelectCampaignContactUpload[]> {
  return await db
    .select()
    .from(campaignContactUploadsTable)
    .where(eq(campaignContactUploadsTable.campaignId, campaignId))
    .orderBy(desc(campaignContactUploadsTable.uploadedAt));
}

/**
 * Update upload
 */
export async function updateCampaignContactUpload(
  id: string,
  data: Partial<InsertCampaignContactUpload>
): Promise<SelectCampaignContactUpload | null> {
  const [updated] = await db
    .update(campaignContactUploadsTable)
    .set(data)
    .where(eq(campaignContactUploadsTable.id, id))
    .returning();
  
  return updated || null;
}

/**
 * Mark upload as completed
 */
export async function markUploadCompleted(
  id: string,
  stats: {
    validRows: number;
    invalidRows: number;
    duplicateRows: number;
    timezoneSummary: Record<string, number>;
  }
): Promise<void> {
  await db
    .update(campaignContactUploadsTable)
    .set({
      processingStatus: "completed",
      processedAt: new Date(),
      validRows: stats.validRows,
      invalidRows: stats.invalidRows,
      duplicateRows: stats.duplicateRows,
      timezoneSummary: stats.timezoneSummary,
    })
    .where(eq(campaignContactUploadsTable.id, id));
}

/**
 * Mark upload as failed
 */
export async function markUploadFailed(
  id: string,
  errorMessage: string
): Promise<void> {
  await db
    .update(campaignContactUploadsTable)
    .set({
      processingStatus: "failed",
      processingError: errorMessage,
      processedAt: new Date(),
    })
    .where(eq(campaignContactUploadsTable.id, id));
}
