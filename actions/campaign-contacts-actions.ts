"use server";

/**
 * Campaign Contacts Server Actions
 * Handle contact list uploads, parsing, and management
 */

import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import {
  createCampaignContactUpload,
  createCampaignContactsBulk,
  getCampaignContacts,
  getCampaignContactStats,
  getCampaignContactUploads,
  updateCampaignContact,
  markUploadCompleted,
  markUploadFailed,
  getCampaignContactUploadByBatch,
  getCampaignContactsByBatch,
} from "@/db/queries/campaign-contacts-queries";
import {
  getTimezoneFromPhoneNumber,
  formatPhoneNumber,
  calculateTimezoneSummary,
} from "@/lib/timezone-mapper";
import { InsertCampaignContact } from "@/db/schema";

/**
 * Process uploaded contact list
 * This action receives the parsed data from the client and processes it
 */
export async function processContactListAction(data: {
  campaignId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  totalRows: number;
  columnMapping: Record<string, string | null>;
  parsedRows: Record<string, any>[];
}) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const batchId = `batch_${nanoid(16)}`;
    
    // Create upload record
    const upload = await createCampaignContactUpload({
      campaignId: data.campaignId,
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      totalRows: data.totalRows,
      validRows: 0,
      invalidRows: 0,
      duplicateRows: 0,
      columnMapping: data.columnMapping,
      processingStatus: "processing",
      batchId,
      uploadedBy: userId,
    });

    // Process rows
    const contacts: InsertCampaignContact[] = [];
    const phoneNumbers: string[] = [];
    const phoneNumbersSeen = new Set<string>();
    let invalidCount = 0;
    let duplicateCount = 0;

    for (let i = 0; i < data.parsedRows.length; i++) {
      const row = data.parsedRows[i];
      
      // Extract mapped values
      const phoneRaw = data.columnMapping.phone
        ? String(row[data.columnMapping.phone] || "").trim()
        : "";
      const firstName = data.columnMapping.firstName
        ? String(row[data.columnMapping.firstName] || "").trim()
        : "";
      const lastName = data.columnMapping.lastName
        ? String(row[data.columnMapping.lastName] || "").trim()
        : "";
      const email = data.columnMapping.email
        ? String(row[data.columnMapping.email] || "").trim()
        : "";
      const company = data.columnMapping.company
        ? String(row[data.columnMapping.company] || "").trim()
        : "";

      // Validate phone number
      if (!phoneRaw) {
        invalidCount++;
        continue;
      }

      const phoneFormatted = formatPhoneNumber(phoneRaw);
      const phoneDigits = phoneRaw.replace(/\D/g, "");

      // Check for duplicates
      if (phoneNumbersSeen.has(phoneDigits)) {
        duplicateCount++;
        continue;
      }
      phoneNumbersSeen.add(phoneDigits);

      // Get timezone info
      const timezoneInfo = getTimezoneFromPhoneNumber(phoneRaw);
      const areaCode = phoneDigits.length >= 10 ? phoneDigits.substring(0, 3) : null;

      // Build full name
      const fullName = [firstName, lastName].filter(Boolean).join(" ") || null;

      // Collect custom fields (all non-mapped columns)
      const customFields: Record<string, any> = {};
      const mappedColumns = new Set(Object.values(data.columnMapping).filter(Boolean));
      Object.keys(row).forEach((key) => {
        if (!mappedColumns.has(key) && row[key]) {
          customFields[key] = row[key];
        }
      });

      contacts.push({
        campaignId: data.campaignId,
        phoneNumber: phoneFormatted,
        firstName: firstName || null,
        lastName: lastName || null,
        fullName,
        email: email || null,
        company: company || null,
        areaCode,
        timezone: timezoneInfo?.timezone || null,
        timezoneOffset: timezoneInfo?.offset || null,
        customFields: Object.keys(customFields).length > 0 ? customFields : null,
        uploadBatchId: batchId,
        rowNumber: i + 1,
        callStatus: "pending",
      });

      phoneNumbers.push(phoneFormatted);
    }

    // Bulk insert contacts
    if (contacts.length > 0) {
      await createCampaignContactsBulk(contacts);
    }

    // Calculate timezone summary
    const timezoneSummary = calculateTimezoneSummary(phoneNumbers);

    // Update upload record
    await markUploadCompleted(upload.id, {
      validRows: contacts.length,
      invalidRows: invalidCount,
      duplicateRows: duplicateCount,
      timezoneSummary,
    });

    return {
      success: true,
      uploadId: upload.id,
      batchId,
      stats: {
        total: data.totalRows,
        valid: contacts.length,
        invalid: invalidCount,
        duplicates: duplicateCount,
        timezoneSummary,
      },
    };
  } catch (error: any) {
    console.error("Error processing contact list:", error);
    return {
      error: error.message || "Failed to process contact list",
    };
  }
}

/**
 * Get contacts for a campaign
 */
export async function getCampaignContactsAction(campaignId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const contacts = await getCampaignContacts(campaignId);
    return { success: true, contacts };
  } catch (error: any) {
    console.error("Error fetching contacts:", error);
    return { error: error.message || "Failed to fetch contacts" };
  }
}

/**
 * Get contact statistics for a campaign
 */
export async function getCampaignContactStatsAction(campaignId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const stats = await getCampaignContactStats(campaignId);
    return { success: true, stats };
  } catch (error: any) {
    console.error("Error fetching contact stats:", error);
    return { error: error.message || "Failed to fetch contact stats" };
  }
}

/**
 * Get upload history for a campaign
 */
export async function getCampaignContactUploadsAction(campaignId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const uploads = await getCampaignContactUploads(campaignId);
    return { success: true, uploads };
  } catch (error: any) {
    console.error("Error fetching uploads:", error);
    return { error: error.message || "Failed to fetch uploads" };
  }
}

/**
 * Get upload details with contacts
 */
export async function getUploadDetailsAction(batchId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const upload = await getCampaignContactUploadByBatch(batchId);
    const contacts = await getCampaignContactsByBatch(batchId);
    
    return {
      success: true,
      upload,
      contacts,
    };
  } catch (error: any) {
    console.error("Error fetching upload details:", error);
    return { error: error.message || "Failed to fetch upload details" };
  }
}

/**
 * Update a contact
 */
export async function updateCampaignContactAction(
  contactId: string,
  updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
    company?: string;
    notes?: string;
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const updated = await updateCampaignContact(contactId, updates);
    return { success: true, contact: updated };
  } catch (error: any) {
    console.error("Error updating contact:", error);
    return { error: error.message || "Failed to update contact" };
  }
}
