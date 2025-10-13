/**
 * Nylas Calendar Integration
 * Sync calendars and events with external providers (Google, Microsoft, etc.)
 */

import Nylas from 'nylas';

const nylasClient = new Nylas({
  apiKey: process.env.NYLAS_API_KEY!,
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
});

// ============================================================================
// Calendar Operations
// ============================================================================

/**
 * Get all calendars for a grant
 */
export async function getNylasCalendars(grantId: string) {
  try {
    const calendars = await nylasClient.calendars.list({
      identifier: grantId,
    });
    
    return {
      success: true,
      calendars: calendars.data,
    };
  } catch (error: any) {
    console.error('Error fetching Nylas calendars:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch calendars',
    };
  }
}

/**
 * Get a specific calendar
 */
export async function getNylasCalendar(grantId: string, calendarId: string) {
  try {
    const calendar = await nylasClient.calendars.find({
      identifier: grantId,
      calendarId,
    });
    
    return {
      success: true,
      calendar: calendar.data,
    };
  } catch (error: any) {
    console.error('Error fetching Nylas calendar:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch calendar',
    };
  }
}

// ============================================================================
// Event Operations
// ============================================================================

/**
 * Get events from a calendar
 */
export async function getNylasEvents(
  grantId: string,
  calendarId: string,
  options?: {
    start?: number; // Unix timestamp
    end?: number;
    limit?: number;
  }
) {
  try {
    const events = await nylasClient.events.list({
      identifier: grantId,
      queryParams: {
        calendar_id: calendarId,
        start: options?.start,
        end: options?.end,
        limit: options?.limit || 100,
      },
    });
    
    return {
      success: true,
      events: events.data,
    };
  } catch (error: any) {
    console.error('Error fetching Nylas events:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch events',
    };
  }
}

/**
 * Get a specific event
 */
export async function getNylasEvent(grantId: string, eventId: string) {
  try {
    const event = await nylasClient.events.find({
      identifier: grantId,
      eventId,
    });
    
    return {
      success: true,
      event: event.data,
    };
  } catch (error: any) {
    console.error('Error fetching Nylas event:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch event',
    };
  }
}

/**
 * Create a new event
 */
export async function createNylasEvent(
  grantId: string,
  eventData: {
    title: string;
    description?: string;
    location?: string;
    start: number; // Unix timestamp
    end: number;
    calendarId: string;
    participants?: Array<{ email: string; name?: string }>;
    conferencing?: {
      provider: 'Google Meet' | 'Zoom' | 'Microsoft Teams';
      autocreate?: boolean;
    };
    reminders?: {
      useDefault: boolean;
      overrides?: Array<{ method: 'email' | 'popup'; minutes: number }>;
    };
    recurrence?: string[]; // RRULE format
  }
) {
  try {
    const event = await nylasClient.events.create({
      identifier: grantId,
      requestBody: {
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        when: {
          startTime: eventData.start,
          endTime: eventData.end,
        },
        calendarId: eventData.calendarId,
        participants: eventData.participants?.map(p => ({
          email: p.email,
          name: p.name,
        })),
        conferencing: eventData.conferencing,
        reminders: eventData.reminders,
        recurrence: eventData.recurrence,
      },
    });
    
    return {
      success: true,
      event: event.data,
    };
  } catch (error: any) {
    console.error('Error creating Nylas event:', error);
    return {
      success: false,
      error: error.message || 'Failed to create event',
    };
  }
}

/**
 * Update an existing event
 */
export async function updateNylasEvent(
  grantId: string,
  eventId: string,
  eventData: {
    title?: string;
    description?: string;
    location?: string;
    start?: number;
    end?: number;
    calendarId?: string;
    participants?: Array<{ email: string; name?: string; status?: string }>;
    conferencing?: any;
    reminders?: any;
    status?: 'confirmed' | 'tentative' | 'cancelled';
  }
) {
  try {
    const updateBody: any = {};
    
    if (eventData.title) updateBody.title = eventData.title;
    if (eventData.description) updateBody.description = eventData.description;
    if (eventData.location) updateBody.location = eventData.location;
    if (eventData.start && eventData.end) {
      updateBody.when = {
        startTime: eventData.start,
        endTime: eventData.end,
      };
    }
    if (eventData.calendarId) updateBody.calendarId = eventData.calendarId;
    if (eventData.participants) updateBody.participants = eventData.participants;
    if (eventData.conferencing) updateBody.conferencing = eventData.conferencing;
    if (eventData.reminders) updateBody.reminders = eventData.reminders;
    if (eventData.status) updateBody.status = eventData.status;

    const event = await nylasClient.events.update({
      identifier: grantId,
      eventId,
      requestBody: updateBody,
    });
    
    return {
      success: true,
      event: event.data,
    };
  } catch (error: any) {
    console.error('Error updating Nylas event:', error);
    return {
      success: false,
      error: error.message || 'Failed to update event',
    };
  }
}

/**
 * Delete an event
 */
export async function deleteNylasEvent(grantId: string, eventId: string) {
  try {
    await nylasClient.events.destroy({
      identifier: grantId,
      eventId,
    });
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error deleting Nylas event:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete event',
    };
  }
}

/**
 * Send RSVP to an event
 */
export async function sendEventRSVP(
  grantId: string,
  eventId: string,
  status: 'yes' | 'no' | 'maybe'
) {
  try {
    await nylasClient.events.sendRsvp({
      identifier: grantId,
      eventId,
      requestBody: {
        status,
      },
    });
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error sending RSVP:', error);
    return {
      success: false,
      error: error.message || 'Failed to send RSVP',
    };
  }
}

// ============================================================================
// Availability Operations
// ============================================================================

/**
 * Get free/busy information
 */
export async function getFreeBusy(
  grantId: string,
  emails: string[],
  startTime: number,
  endTime: number
) {
  try {
    const availability = await nylasClient.calendars.getFreeBusy({
      identifier: grantId,
      requestBody: {
        emails,
        startTime,
        endTime,
      },
    });
    
    return {
      success: true,
      availability: availability.data,
    };
  } catch (error: any) {
    console.error('Error fetching free/busy:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch availability',
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse Nylas event to our database format
 */
export function parseNylasEvent(nylasEvent: any) {
  return {
    nylasEventId: nylasEvent.id,
    nylasCalendarId: nylasEvent.calendarId,
    title: nylasEvent.title || '(No title)',
    description: nylasEvent.description,
    location: nylasEvent.location,
    startTime: new Date(nylasEvent.when.startTime * 1000),
    endTime: new Date(nylasEvent.when.endTime * 1000),
    isAllDay: nylasEvent.when.object === 'date',
    status: nylasEvent.status || 'confirmed',
    organizer: nylasEvent.organizer ? {
      name: nylasEvent.organizer.name,
      email: nylasEvent.organizer.email,
    } : null,
    isRecurring: !!nylasEvent.recurrence,
    recurrenceRule: nylasEvent.recurrence ? { rrule: nylasEvent.recurrence } : null,
    conferenceLink: nylasEvent.conferencing?.details?.url,
    conferenceData: nylasEvent.conferencing,
    reminders: nylasEvent.reminders,
    visibility: nylasEvent.visibility || 'default',
  };
}

/**
 * Parse Nylas calendar to our database format
 */
export function parseNylasCalendar(nylasCalendar: any) {
  return {
    nylasCalendarId: nylasCalendar.id,
    name: nylasCalendar.name || 'Calendar',
    description: nylasCalendar.description,
    isDefault: nylasCalendar.isPrimary || false,
    timeZone: nylasCalendar.timezone || 'America/New_York',
  };
}



