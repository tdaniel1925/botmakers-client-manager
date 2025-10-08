/**
 * Campaign Scheduler Service
 * Handles scheduling and initiating outbound calls with timezone awareness
 */

import {
  getCampaignContactsByStatus,
  getCampaignContactsByTimezone,
  updateContactCallStatus,
  incrementContactCallAttempts,
} from "@/db/queries/campaign-contacts-queries";
import { getCampaignById } from "@/db/queries/voice-campaigns-queries";
import { getVoiceProvider } from "@/lib/voice-providers/base-voice-provider";

interface ScheduleConfig {
  callDays: string[]; // ["Monday", "Tuesday", ...]
  callWindows: Array<{
    start: string; // "09:00"
    end: string; // "17:00"
    label: string; // "Morning", "Afternoon"
  }>;
  respectTimezones: boolean;
  maxAttemptsPerContact: number;
  timeBetweenAttempts: number; // hours
  maxConcurrentCalls: number;
}

/**
 * Check if current time is within calling hours for a timezone
 */
export function isWithinCallingHours(
  timezone: string,
  scheduleConfig: ScheduleConfig
): boolean {
  const now = new Date();
  
  // Check if today is a valid call day
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  if (!scheduleConfig.callDays.includes(dayName)) {
    return false;
  }

  // Get current time in the contact's timezone
  // This is simplified - in production you'd use a proper timezone library like date-fns-tz
  const timezoneOffsets: Record<string, number> = {
    ET: -5,
    CT: -6,
    MT: -7,
    PT: -8,
    AKT: -9,
    HAT: -10,
  };

  const offset = timezoneOffsets[timezone] || -5;
  const localTime = new Date(now.getTime() + offset * 60 * 60 * 1000);
  const hours = localTime.getUTCHours();
  const minutes = localTime.getUTCMinutes();
  const currentMinutes = hours * 60 + minutes;

  // Check if within any call window
  for (const window of scheduleConfig.callWindows) {
    const [startHour, startMin] = window.start.split(":").map(Number);
    const [endHour, endMin] = window.end.split(":").map(Number);
    const windowStart = startHour * 60 + startMin;
    const windowEnd = endHour * 60 + endMin;

    if (currentMinutes >= windowStart && currentMinutes <= windowEnd) {
      return true;
    }
  }

  return false;
}

/**
 * Get contacts that are ready to be called
 */
export async function getContactsReadyForCalling(
  campaignId: string,
  scheduleConfig: ScheduleConfig
): Promise<any[]> {
  // Get all pending contacts
  const pendingContacts = await getCampaignContactsByStatus(campaignId, "pending");
  
  const readyContacts = [];
  const now = new Date();

  for (const contact of pendingContacts) {
    // Check if max attempts reached
    if (contact.callAttempts >= (contact.maxAttempts || scheduleConfig.maxAttemptsPerContact)) {
      continue;
    }

    // Check if enough time has passed since last attempt
    if (contact.lastAttemptAt) {
      const hoursSinceLastAttempt =
        (now.getTime() - contact.lastAttemptAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastAttempt < scheduleConfig.timeBetweenAttempts) {
        continue;
      }
    }

    // Check if within calling hours for their timezone
    if (
      scheduleConfig.respectTimezones &&
      contact.timezone &&
      !isWithinCallingHours(contact.timezone, scheduleConfig)
    ) {
      continue;
    }

    readyContacts.push(contact);
  }

  return readyContacts;
}

/**
 * Initiate outbound call to a contact
 * This is a simplified version - in production you'd integrate with Vapi's outbound calling API
 */
export async function initiateOutboundCall(
  campaignId: string,
  contactId: string,
  phoneNumber: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return { success: false, error: "Campaign not found" };
    }

    // Get voice provider
    const provider = getVoiceProvider(campaign.provider);

    // Increment call attempts
    await incrementContactCallAttempts(contactId);

    // Update status to calling
    await updateContactCallStatus(contactId, "calling");

    // TODO: Integrate with provider's outbound calling API
    // For now, this is a placeholder
    // const result = await provider.initiateCall({
    //   assistantId: campaign.providerAssistantId,
    //   phoneNumber: phoneNumber,
    //   metadata: { contactId, campaignId }
    // });

    console.log(`[Scheduler] Initiated call to ${phoneNumber} for contact ${contactId}`);

    return { success: true };
  } catch (error: any) {
    console.error(`[Scheduler] Error initiating call:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Process outbound calls for a campaign
 * This should be called periodically (e.g., every minute) by a cron job
 */
export async function processOutboundCalls(campaignId: string): Promise<{
  initiated: number;
  skipped: number;
  errors: number;
}> {
  try {
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Only process active campaigns
    if (campaign.status !== "active") {
      return { initiated: 0, skipped: 0, errors: 0 };
    }

    // Only process outbound or both campaigns
    if (campaign.campaignType === "inbound") {
      return { initiated: 0, skipped: 0, errors: 0 };
    }

    // Get schedule config
    const scheduleConfig: ScheduleConfig = (campaign.scheduleConfig as any) || {
      callDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      callWindows: [
        { start: "09:00", end: "12:00", label: "Morning" },
        { start: "13:00", end: "17:00", label: "Afternoon" },
      ],
      respectTimezones: true,
      maxAttemptsPerContact: 3,
      timeBetweenAttempts: 24,
      maxConcurrentCalls: 10,
    };

    // Get contacts ready for calling
    const readyContacts = await getContactsReadyForCalling(campaignId, scheduleConfig);

    // Limit to max concurrent calls
    const contactsToCall = readyContacts.slice(0, scheduleConfig.maxConcurrentCalls);

    const stats = {
      initiated: 0,
      skipped: readyContacts.length - contactsToCall.length,
      errors: 0,
    };

    // Initiate calls
    for (const contact of contactsToCall) {
      const result = await initiateOutboundCall(
        campaignId,
        contact.id,
        contact.phoneNumber
      );

      if (result.success) {
        stats.initiated++;
      } else {
        stats.errors++;
        // Mark as failed
        await updateContactCallStatus(contact.id, "failed");
      }
    }

    console.log(
      `[Scheduler] Processed campaign ${campaignId}: ${stats.initiated} initiated, ${stats.skipped} skipped, ${stats.errors} errors`
    );

    return stats;
  } catch (error: any) {
    console.error(`[Scheduler] Error processing campaign ${campaignId}:`, error);
    return { initiated: 0, skipped: 0, errors: 0 };
  }
}

/**
 * Calculate next call time for a contact based on timezone and schedule
 */
export function calculateNextCallTime(
  timezone: string,
  scheduleConfig: ScheduleConfig
): Date {
  const now = new Date();
  const nextCall = new Date(now);

  // Simple logic: schedule for next available window
  // In production, use a proper timezone library
  nextCall.setHours(nextCall.getHours() + 1);

  return nextCall;
}
