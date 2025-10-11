/**
 * Calendar Server Actions
 * CRUD operations for calendars, events, and sync with Nylas
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import {
  calendarsTable,
  calendarEventsTable,
  eventAttendeesTable,
  calendarSettingsTable,
  availabilitySlotsTable,
  type SelectCalendar,
  type SelectCalendarEvent,
  type InsertCalendarEvent,
} from '@/db/schema/calendar-schema';
import { emailAccountsTable } from '@/db/schema/email-schema';
import { eq, and, between, gte, lte, desc } from 'drizzle-orm';
import {
  getNylasCalendars,
  getNylasEvents,
  createNylasEvent,
  updateNylasEvent,
  deleteNylasEvent,
  parseNylasEvent,
  parseNylasCalendar,
} from '@/lib/nylas-calendar';

interface ActionResult<T = void> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// ============================================================================
// Calendar Operations
// ============================================================================

/**
 * Get all calendars for current user
 */
export async function getCalendarsAction(): Promise<ActionResult<{ calendars: SelectCalendar[] }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const calendars = await db.query.calendarsTable.findMany({
      where: eq(calendarsTable.userId, userId),
      orderBy: [desc(calendarsTable.isDefault), desc(calendarsTable.createdAt)],
    });

    return {
      success: true,
      data: { calendars },
    };
  } catch (error: any) {
    console.error('Error fetching calendars:', error);
    return {
      success: false,
      error: 'Failed to fetch calendars',
    };
  }
}

/**
 * Create a new calendar
 */
export async function createCalendarAction(calendarData: {
  name: string;
  description?: string;
  color?: string;
  type?: 'primary' | 'work' | 'personal' | 'shared' | 'other';
  isDefault?: boolean;
}): Promise<ActionResult<{ calendar: SelectCalendar }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // If this is set as default, unset other defaults
    if (calendarData.isDefault) {
      await db
        .update(calendarsTable)
        .set({ isDefault: false })
        .where(eq(calendarsTable.userId, userId));
    }

    const [calendar] = await db
      .insert(calendarsTable)
      .values({
        userId,
        name: calendarData.name,
        description: calendarData.description,
        color: calendarData.color || '#3B82F6',
        type: calendarData.type || 'personal',
        isDefault: calendarData.isDefault || false,
      })
      .returning();

    return {
      success: true,
      data: { calendar },
    };
  } catch (error: any) {
    console.error('Error creating calendar:', error);
    return {
      success: false,
      error: 'Failed to create calendar',
    };
  }
}

/**
 * Sync calendars from Nylas
 */
export async function syncNylasCalendarsAction(
  emailAccountId: string
): Promise<ActionResult<{ synced: number }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get email account with Nylas grant
    const account = await db.query.emailAccountsTable.findFirst({
      where: and(
        eq(emailAccountsTable.id, emailAccountId),
        eq(emailAccountsTable.userId, userId)
      ),
    });

    if (!account || !account.nylasGrantId) {
      return { success: false, error: 'Account not found or not connected to Nylas' };
    }

    // Fetch calendars from Nylas
    const nylasResult = await getNylasCalendars(account.nylasGrantId);
    if (!nylasResult.success || !nylasResult.calendars) {
      return { success: false, error: nylasResult.error || 'Failed to fetch calendars from Nylas' };
    }

    let syncedCount = 0;

    // Sync each calendar
    for (const nylasCalendar of nylasResult.calendars) {
      const parsed = parseNylasCalendar(nylasCalendar);
      
      // Check if calendar already exists
      const existing = await db.query.calendarsTable.findFirst({
        where: and(
          eq(calendarsTable.nylasCalendarId, parsed.nylasCalendarId),
          eq(calendarsTable.userId, userId)
        ),
      });

      if (existing) {
        // Update existing
        await db
          .update(calendarsTable)
          .set({
            name: parsed.name,
            description: parsed.description,
            lastSyncedAt: new Date(),
          })
          .where(eq(calendarsTable.id, existing.id));
      } else {
        // Create new
        await db.insert(calendarsTable).values({
          userId,
          emailAccountId,
          nylasCalendarId: parsed.nylasCalendarId,
          name: parsed.name,
          description: parsed.description,
          isDefault: parsed.isDefault,
          timeZone: parsed.timeZone,
          lastSyncedAt: new Date(),
        });
      }

      syncedCount++;
    }

    return {
      success: true,
      data: { synced: syncedCount },
      message: `Synced ${syncedCount} calendar(s)`,
    };
  } catch (error: any) {
    console.error('Error syncing Nylas calendars:', error);
    return {
      success: false,
      error: 'Failed to sync calendars',
    };
  }
}

// ============================================================================
// Event Operations
// ============================================================================

/**
 * Get events for a calendar within a date range
 */
export async function getEventsAction(
  calendarId: string,
  startDate: Date,
  endDate: Date
): Promise<ActionResult<{ events: SelectCalendarEvent[] }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify calendar ownership
    const calendar = await db.query.calendarsTable.findFirst({
      where: and(
        eq(calendarsTable.id, calendarId),
        eq(calendarsTable.userId, userId)
      ),
    });

    if (!calendar) {
      return { success: false, error: 'Calendar not found' };
    }

    // Fetch events
    const events = await db.query.calendarEventsTable.findMany({
      where: and(
        eq(calendarEventsTable.calendarId, calendarId),
        gte(calendarEventsTable.startTime, startDate),
        lte(calendarEventsTable.startTime, endDate)
      ),
      orderBy: [calendarEventsTable.startTime],
    });

    return {
      success: true,
      data: { events },
    };
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return {
      success: false,
      error: 'Failed to fetch events',
    };
  }
}

/**
 * Get all events for user across all calendars
 */
export async function getAllEventsAction(
  startDate: Date,
  endDate: Date
): Promise<ActionResult<{ events: SelectCalendarEvent[] }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get all user's calendars
    const calendars = await db.query.calendarsTable.findMany({
      where: and(
        eq(calendarsTable.userId, userId),
        eq(calendarsTable.isVisible, true)
      ),
    });

    const calendarIds = calendars.map(c => c.id);

    // Fetch events from all calendars
    const events = await db
      .select()
      .from(calendarEventsTable)
      .where(
        and(
          gte(calendarEventsTable.startTime, startDate),
          lte(calendarEventsTable.startTime, endDate)
        )
      )
      .orderBy(calendarEventsTable.startTime);

    // Filter to only user's calendars
    const userEvents = events.filter(e => calendarIds.includes(e.calendarId));

    return {
      success: true,
      data: { events: userEvents },
    };
  } catch (error: any) {
    console.error('Error fetching all events:', error);
    return {
      success: false,
      error: 'Failed to fetch events',
    };
  }
}

/**
 * Create a new event
 */
export async function createEventAction(eventData: {
  calendarId: string;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  isAllDay?: boolean;
  attendees?: Array<{ email: string; name?: string }>;
  reminders?: any;
  conferenceLink?: string;
}): Promise<ActionResult<{ event: SelectCalendarEvent }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify calendar ownership
    const calendar = await db.query.calendarsTable.findFirst({
      where: and(
        eq(calendarsTable.id, eventData.calendarId),
        eq(calendarsTable.userId, userId)
      ),
    });

    if (!calendar) {
      return { success: false, error: 'Calendar not found' };
    }

    // If calendar has Nylas integration, create event in Nylas first
    let nylasEventId: string | undefined;
    if (calendar.nylasCalendarId && calendar.emailAccountId) {
      const account = await db.query.emailAccountsTable.findFirst({
        where: eq(emailAccountsTable.id, calendar.emailAccountId),
      });

      if (account?.nylasGrantId) {
        const nylasResult = await createNylasEvent(account.nylasGrantId, {
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          start: Math.floor(eventData.startTime.getTime() / 1000),
          end: Math.floor(eventData.endTime.getTime() / 1000),
          calendarId: calendar.nylasCalendarId,
          participants: eventData.attendees,
          reminders: eventData.reminders,
        });

        if (nylasResult.success && nylasResult.event) {
          nylasEventId = nylasResult.event.id;
        }
      }
    }

    // Create event in database
    const [event] = await db
      .insert(calendarEventsTable)
      .values({
        calendarId: eventData.calendarId,
        userId,
        nylasEventId,
        nylasCalendarId: calendar.nylasCalendarId,
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        isAllDay: eventData.isAllDay || false,
        reminders: eventData.reminders,
        conferenceLink: eventData.conferenceLink,
      })
      .returning();

    // Add attendees if provided
    if (eventData.attendees && eventData.attendees.length > 0) {
      await db.insert(eventAttendeesTable).values(
        eventData.attendees.map(attendee => ({
          eventId: event.id,
          email: attendee.email,
          name: attendee.name,
        }))
      );
    }

    return {
      success: true,
      data: { event },
      message: 'Event created successfully',
    };
  } catch (error: any) {
    console.error('Error creating event:', error);
    return {
      success: false,
      error: 'Failed to create event',
    };
  }
}

/**
 * Update an event
 */
export async function updateEventAction(
  eventId: string,
  eventData: Partial<InsertCalendarEvent>
): Promise<ActionResult<{ event: SelectCalendarEvent }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify event ownership
    const event = await db.query.calendarEventsTable.findFirst({
      where: and(
        eq(calendarEventsTable.id, eventId),
        eq(calendarEventsTable.userId, userId)
      ),
    });

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    // If event has Nylas integration, update in Nylas first
    if (event.nylasEventId) {
      const calendar = await db.query.calendarsTable.findFirst({
        where: eq(calendarsTable.id, event.calendarId),
      });

      if (calendar?.emailAccountId) {
        const account = await db.query.emailAccountsTable.findFirst({
          where: eq(emailAccountsTable.id, calendar.emailAccountId),
        });

        if (account?.nylasGrantId) {
          await updateNylasEvent(account.nylasGrantId, event.nylasEventId, {
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            start: eventData.startTime ? Math.floor(eventData.startTime.getTime() / 1000) : undefined,
            end: eventData.endTime ? Math.floor(eventData.endTime.getTime() / 1000) : undefined,
          });
        }
      }
    }

    // Update in database
    const [updatedEvent] = await db
      .update(calendarEventsTable)
      .set({
        ...eventData,
        updatedAt: new Date(),
      })
      .where(eq(calendarEventsTable.id, eventId))
      .returning();

    return {
      success: true,
      data: { event: updatedEvent },
      message: 'Event updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating event:', error);
    return {
      success: false,
      error: 'Failed to update event',
    };
  }
}

/**
 * Delete an event
 */
export async function deleteEventAction(eventId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify event ownership
    const event = await db.query.calendarEventsTable.findFirst({
      where: and(
        eq(calendarEventsTable.id, eventId),
        eq(calendarEventsTable.userId, userId)
      ),
    });

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    // If event has Nylas integration, delete from Nylas first
    if (event.nylasEventId) {
      const calendar = await db.query.calendarsTable.findFirst({
        where: eq(calendarsTable.id, event.calendarId),
      });

      if (calendar?.emailAccountId) {
        const account = await db.query.emailAccountsTable.findFirst({
          where: eq(emailAccountsTable.id, calendar.emailAccountId),
        });

        if (account?.nylasGrantId) {
          await deleteNylasEvent(account.nylasGrantId, event.nylasEventId);
        }
      }
    }

    // Delete from database
    await db.delete(calendarEventsTable).where(eq(calendarEventsTable.id, eventId));

    return {
      success: true,
      message: 'Event deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return {
      success: false,
      error: 'Failed to delete event',
    };
  }
}

/**
 * Sync events from Nylas for a calendar
 */
export async function syncNylasEventsAction(
  calendarId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ActionResult<{ synced: number }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get calendar
    const calendar = await db.query.calendarsTable.findFirst({
      where: and(
        eq(calendarsTable.id, calendarId),
        eq(calendarsTable.userId, userId)
      ),
    });

    if (!calendar || !calendar.nylasCalendarId || !calendar.emailAccountId) {
      return { success: false, error: 'Calendar not found or not connected to Nylas' };
    }

    // Get email account
    const account = await db.query.emailAccountsTable.findFirst({
      where: eq(emailAccountsTable.id, calendar.emailAccountId),
    });

    if (!account?.nylasGrantId) {
      return { success: false, error: 'Email account not connected to Nylas' };
    }

    // Fetch events from Nylas
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 2, 0);

    const nylasResult = await getNylasEvents(account.nylasGrantId, calendar.nylasCalendarId, {
      start: Math.floor(start.getTime() / 1000),
      end: Math.floor(end.getTime() / 1000),
    });

    if (!nylasResult.success || !nylasResult.events) {
      return { success: false, error: nylasResult.error || 'Failed to fetch events from Nylas' };
    }

    let syncedCount = 0;

    // Sync each event
    for (const nylasEvent of nylasResult.events) {
      const parsed = parseNylasEvent(nylasEvent);
      
      // Check if event already exists
      const existing = await db.query.calendarEventsTable.findFirst({
        where: and(
          eq(calendarEventsTable.nylasEventId, parsed.nylasEventId),
          eq(calendarEventsTable.userId, userId)
        ),
      });

      if (existing) {
        // Update existing
        await db
          .update(calendarEventsTable)
          .set({
            ...parsed,
            updatedAt: new Date(),
          })
          .where(eq(calendarEventsTable.id, existing.id));
      } else {
        // Create new
        await db.insert(calendarEventsTable).values({
          ...parsed,
          calendarId: calendar.id,
          userId,
        });
      }

      syncedCount++;
    }

    // Update calendar sync timestamp
    await db
      .update(calendarsTable)
      .set({ lastSyncedAt: new Date() })
      .where(eq(calendarsTable.id, calendarId));

    return {
      success: true,
      data: { synced: syncedCount },
      message: `Synced ${syncedCount} event(s)`,
    };
  } catch (error: any) {
    console.error('Error syncing Nylas events:', error);
    return {
      success: false,
      error: 'Failed to sync events',
    };
  }
}

// ============================================================================
// Settings Operations
// ============================================================================

/**
 * Get calendar settings for user
 */
export async function getCalendarSettingsAction(): Promise<ActionResult<any>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const settings = await db.query.calendarSettingsTable.findFirst({
      where: eq(calendarSettingsTable.userId, userId),
    });

    // Create default settings if none exist
    if (!settings) {
      const [newSettings] = await db
        .insert(calendarSettingsTable)
        .values({ userId })
        .returning();
      
      return {
        success: true,
        data: { settings: newSettings },
      };
    }

    return {
      success: true,
      data: { settings },
    };
  } catch (error: any) {
    console.error('Error fetching calendar settings:', error);
    return {
      success: false,
      error: 'Failed to fetch calendar settings',
    };
  }
}

/**
 * Update calendar settings
 */
export async function updateCalendarSettingsAction(
  settingsData: Partial<typeof calendarSettingsTable.$inferInsert>
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await db
      .update(calendarSettingsTable)
      .set({
        ...settingsData,
        updatedAt: new Date(),
      })
      .where(eq(calendarSettingsTable.userId, userId));

    return {
      success: true,
      message: 'Settings updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating calendar settings:', error);
    return {
      success: false,
      error: 'Failed to update settings',
    };
  }
}


