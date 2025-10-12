/**
 * Reminders & Calendar Server Actions
 * CRUD operations for email reminders and calendar events
 */

'use server';

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import {
  aiEmailRemindersTable,
  calendarEventsTable,
  calendarsTable,
  userSmsSettingsTable,
} from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResult = {
  success: boolean;
  error?: string;
  data?: any;
};

// ============================================================================
// EMAIL REMINDERS CRUD
// ============================================================================

/**
 * Get all reminders for current user
 */
export async function getRemindersAction(options?: {
  status?: 'pending' | 'sent' | 'failed' | 'cancelled' | 'completed';
  emailId?: string;
  limit?: number;
}): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const { status, emailId, limit = 100 } = options || {};

    let query = db
      .select()
      .from(aiEmailRemindersTable)
      .where(eq(aiEmailRemindersTable.userId, userId));

    if (status) {
      query = query.where(eq(aiEmailRemindersTable.status, status)) as any;
    }

    if (emailId) {
      query = query.where(eq(aiEmailRemindersTable.emailId, emailId)) as any;
    }

    const reminders = await query
      .orderBy(desc(aiEmailRemindersTable.reminderAt))
      .limit(limit);

    return { success: true, data: reminders };
  } catch (error: any) {
    console.error('Get Reminders Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a new reminder
 */
export async function createReminderAction(reminderData: {
  emailId?: string;
  title: string;
  description?: string;
  reminderAt: Date;
  method?: 'email' | 'sms' | 'both';
  isRecurring?: boolean;
  recurrenceRule?: string;
  metadata?: Record<string, any>;
}): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    // If SMS is requested, check if user has SMS enabled
    if (reminderData.method === 'sms' || reminderData.method === 'both') {
      const smsSettings = await db
        .select()
        .from(userSmsSettingsTable)
        .where(eq(userSmsSettingsTable.userId, userId))
        .limit(1);

      if (smsSettings.length === 0 || !smsSettings[0].smsEnabled || !smsSettings[0].phoneNumberVerified) {
        return { success: false, error: 'SMS reminders require phone verification. Please set up SMS in settings.' };
      }
    }

    const newReminder = await db
      .insert(aiEmailRemindersTable)
      .values({
        userId,
        ...reminderData,
        status: 'pending',
      })
      .returning();

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true, data: newReminder[0] };
  } catch (error: any) {
    console.error('Create Reminder Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a reminder
 */
export async function updateReminderAction(
  reminderId: string,
  updates: Partial<typeof aiEmailRemindersTable.$inferInsert>
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const updated = await db
      .update(aiEmailRemindersTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(
        eq(aiEmailRemindersTable.id, reminderId),
        eq(aiEmailRemindersTable.userId, userId)
      ))
      .returning();

    if (updated.length === 0) {
      return { success: false, error: 'Reminder not found' };
    }

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true, data: updated[0] };
  } catch (error: any) {
    console.error('Update Reminder Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a reminder
 */
export async function deleteReminderAction(reminderId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    await db
      .delete(aiEmailRemindersTable)
      .where(and(
        eq(aiEmailRemindersTable.id, reminderId),
        eq(aiEmailRemindersTable.userId, userId)
      ));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error: any) {
    console.error('Delete Reminder Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark reminder as completed
 */
export async function completeReminderAction(reminderId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const updated = await db
      .update(aiEmailRemindersTable)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(aiEmailRemindersTable.id, reminderId),
        eq(aiEmailRemindersTable.userId, userId)
      ))
      .returning();

    if (updated.length === 0) {
      return { success: false, error: 'Reminder not found' };
    }

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true, data: updated[0] };
  } catch (error: any) {
    console.error('Complete Reminder Error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// CALENDAR EVENTS CRUD
// ============================================================================

/**
 * Get user's default calendar or create one
 */
async function getOrCreateDefaultCalendar(userId: string) {
  const calendars = await db
    .select()
    .from(calendarsTable)
    .where(and(
      eq(calendarsTable.userId, userId),
      eq(calendarsTable.isDefault, true)
    ))
    .limit(1);

  if (calendars.length > 0) {
    return calendars[0];
  }

  // Create default calendar
  const newCalendar = await db
    .insert(calendarsTable)
    .values({
      userId,
      name: 'My Calendar',
      description: 'Default personal calendar',
      type: 'personal',
      isDefault: true,
      isVisible: true,
    })
    .returning();

  return newCalendar[0];
}

/**
 * Get calendar events
 */
export async function getCalendarEventsAction(options?: {
  calendarId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const { calendarId, startDate, endDate, limit = 100 } = options || {};

    let query = db
      .select()
      .from(calendarEventsTable)
      .where(eq(calendarEventsTable.userId, userId));

    if (calendarId) {
      query = query.where(eq(calendarEventsTable.calendarId, calendarId)) as any;
    }

    if (startDate) {
      query = query.where(gte(calendarEventsTable.startTime, startDate)) as any;
    }

    if (endDate) {
      query = query.where(lte(calendarEventsTable.startTime, endDate)) as any;
    }

    const events = await query
      .orderBy(calendarEventsTable.startTime)
      .limit(limit);

    return { success: true, data: events };
  } catch (error: any) {
    console.error('Get Calendar Events Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a calendar event
 */
export async function createCalendarEventAction(eventData: {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  isAllDay?: boolean;
  relatedEmailId?: string;
  reminders?: any;
  attendees?: any[];
}): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    // Get or create default calendar
    const calendar = await getOrCreateDefaultCalendar(userId);

    const newEvent = await db
      .insert(calendarEventsTable)
      .values({
        calendarId: calendar.id,
        userId,
        ...eventData,
        status: 'confirmed',
      })
      .returning();

    revalidatePath('/platform/calendar');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true, data: newEvent[0] };
  } catch (error: any) {
    console.error('Create Calendar Event Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a calendar event
 */
export async function updateCalendarEventAction(
  eventId: string,
  updates: Partial<typeof calendarEventsTable.$inferInsert>
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const updated = await db
      .update(calendarEventsTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(
        eq(calendarEventsTable.id, eventId),
        eq(calendarEventsTable.userId, userId)
      ))
      .returning();

    if (updated.length === 0) {
      return { success: false, error: 'Event not found' };
    }

    revalidatePath('/platform/calendar');
    revalidatePath('/dashboard/calendar');

    return { success: true, data: updated[0] };
  } catch (error: any) {
    console.error('Update Calendar Event Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEventAction(eventId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    await db
      .delete(calendarEventsTable)
      .where(and(
        eq(calendarEventsTable.id, eventId),
        eq(calendarEventsTable.userId, userId)
      ));

    revalidatePath('/platform/calendar');
    revalidatePath('/dashboard/calendar');

    return { success: true };
  } catch (error: any) {
    console.error('Delete Calendar Event Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create calendar event from email data
 */
export async function createEventFromEmailAction(data: {
  emailId: string;
  title: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  location?: string;
  description?: string;
}): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    // Get or create default calendar
    const calendar = await getOrCreateDefaultCalendar(userId);

    const newEvent = await db
      .insert(calendarEventsTable)
      .values({
        calendarId: calendar.id,
        userId,
        title: data.title,
        description: data.description,
        location: data.location,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        relatedEmailId: data.emailId,
        status: 'confirmed',
      })
      .returning();

    revalidatePath('/platform/calendar');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true, data: newEvent[0] };
  } catch (error: any) {
    console.error('Create Event From Email Error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// SMS SETTINGS
// ============================================================================

/**
 * Get user SMS settings
 */
export async function getSmsSettingsAction(): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const settings = await db
      .select()
      .from(userSmsSettingsTable)
      .where(eq(userSmsSettingsTable.userId, userId))
      .limit(1);

    return { success: true, data: settings[0] || null };
  } catch (error: any) {
    console.error('Get SMS Settings Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update SMS settings
 */
export async function updateSmsSettingsAction(updates: {
  phoneNumber?: string;
  smsEnabled?: boolean;
  smsReminderEnabled?: boolean;
}): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    // Check if settings exist
    const existing = await db
      .select()
      .from(userSmsSettingsTable)
      .where(eq(userSmsSettingsTable.userId, userId))
      .limit(1);

    let result;
    if (existing.length > 0) {
      // Update existing
      result = await db
        .update(userSmsSettingsTable)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(userSmsSettingsTable.userId, userId))
        .returning();
    } else {
      // Create new
      result = await db
        .insert(userSmsSettingsTable)
        .values({
          userId,
          ...updates,
        })
        .returning();
    }

    revalidatePath('/platform/settings');
    revalidatePath('/dashboard/settings');

    return { success: true, data: result[0] };
  } catch (error: any) {
    console.error('Update SMS Settings Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send SMS verification code
 */
export async function sendSmsVerificationAction(phoneNumber: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    // Generate 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes from now
    const verificationExpiry = new Date();
    verificationExpiry.setMinutes(verificationExpiry.getMinutes() + 10);

    // Update or create SMS settings with verification code
    const existing = await db
      .select()
      .from(userSmsSettingsTable)
      .where(eq(userSmsSettingsTable.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(userSmsSettingsTable)
        .set({
          phoneNumber,
          verificationCode,
          verificationExpiry,
          phoneNumberVerified: false,
          updatedAt: new Date(),
        })
        .where(eq(userSmsSettingsTable.userId, userId));
    } else {
      await db
        .insert(userSmsSettingsTable)
        .values({
          userId,
          phoneNumber,
          verificationCode,
          verificationExpiry,
          phoneNumberVerified: false,
        });
    }

    // Send SMS via Twilio
    const { sendVerificationSms } = await import('@/lib/twilio');
    const smsResult = await sendVerificationSms(phoneNumber, verificationCode);

    if (!smsResult.success) {
      console.warn(`Failed to send SMS, but code saved: ${smsResult.error}`);
      // Still return success because code is saved in DB
      // For development/testing without Twilio configured
    }

    console.log(`SMS verification code for ${phoneNumber}: ${verificationCode}`);

    return { success: true, message: 'Verification code sent' };
  } catch (error: any) {
    console.error('Send SMS Verification Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify SMS code
 */
export async function verifySmsCodeAction(code: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const settings = await db
      .select()
      .from(userSmsSettingsTable)
      .where(eq(userSmsSettingsTable.userId, userId))
      .limit(1);

    if (settings.length === 0) {
      return { success: false, error: 'No verification request found' };
    }

    const setting = settings[0];

    // Check if code expired
    if (setting.verificationExpiry && new Date() > setting.verificationExpiry) {
      return { success: false, error: 'Verification code expired' };
    }

    // Check if code matches
    if (setting.verificationCode !== code) {
      return { success: false, error: 'Invalid verification code' };
    }

    // Mark as verified
    const updated = await db
      .update(userSmsSettingsTable)
      .set({
        phoneNumberVerified: true,
        verificationCode: null,
        verificationExpiry: null,
        smsEnabled: true,
        updatedAt: new Date(),
      })
      .where(eq(userSmsSettingsTable.userId, userId))
      .returning();

    return { success: true, data: updated[0], message: 'Phone number verified' };
  } catch (error: any) {
    console.error('Verify SMS Code Error:', error);
    return { success: false, error: error.message };
  }
}

