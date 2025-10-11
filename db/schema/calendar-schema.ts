/**
 * Calendar System Database Schema
 * Full-featured calendar with Nylas integration
 */

import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  varchar,
  index,
} from "drizzle-orm/pg-core";

// ============================================================================
// Enums
// ============================================================================

export const eventStatusEnum = pgEnum("event_status", [
  "confirmed",
  "tentative",
  "cancelled",
]);

export const attendeeStatusEnum = pgEnum("attendee_status", [
  "accepted",
  "declined",
  "tentative",
  "needs_action",
]);

export const recurrenceFrequencyEnum = pgEnum("recurrence_frequency", [
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);

export const reminderMethodEnum = pgEnum("reminder_method", [
  "email",
  "popup",
  "sms",
]);

export const calendarTypeEnum = pgEnum("calendar_type", [
  "primary",
  "work",
  "personal",
  "shared",
  "other",
]);

// ============================================================================
// CALENDARS TABLE
// ============================================================================

export const calendarsTable = pgTable(
  "calendars",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    organizationId: text("organization_id"),
    
    // Nylas integration
    nylasCalendarId: text("nylas_calendar_id"),
    emailAccountId: uuid("email_account_id"),
    
    // Calendar details
    name: text("name").notNull(),
    description: text("description"),
    color: varchar("color", { length: 7 }).default("#3B82F6"), // Hex color
    type: calendarTypeEnum("type").default("personal"),
    
    // Settings
    isDefault: boolean("is_default").default(false),
    isVisible: boolean("is_visible").default(true),
    timeZone: varchar("timezone", { length: 100 }).default("America/New_York"),
    
    // Sync status
    lastSyncedAt: timestamp("last_synced_at"),
    syncEnabled: boolean("sync_enabled").default(true),
    
    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("calendars_user_id_idx").on(table.userId),
    nylasIdIdx: index("calendars_nylas_id_idx").on(table.nylasCalendarId),
  })
);

// ============================================================================
// CALENDAR EVENTS TABLE
// ============================================================================

export const calendarEventsTable = pgTable(
  "calendar_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    calendarId: uuid("calendar_id").notNull().references(() => calendarsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    
    // Nylas integration
    nylasEventId: text("nylas_event_id"),
    nylasCalendarId: text("nylas_calendar_id"),
    
    // Event details
    title: text("title").notNull(),
    description: text("description"),
    location: text("location"),
    
    // Time
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    isAllDay: boolean("is_all_day").default(false),
    timeZone: varchar("timezone", { length: 100 }).default("America/New_York"),
    
    // Status
    status: eventStatusEnum("status").default("confirmed"),
    
    // Organization details
    organizer: jsonb("organizer"), // { name, email }
    
    // Recurrence
    isRecurring: boolean("is_recurring").default(false),
    recurrenceRule: jsonb("recurrence_rule"), // iCal RRULE format
    recurrenceId: text("recurrence_id"), // For recurring event instances
    
    // Meeting details
    conferenceLink: text("conference_link"),
    conferenceData: jsonb("conference_data"), // Zoom, Meet, Teams details
    
    // Attachments
    attachments: jsonb("attachments"), // Array of attachment objects
    
    // Reminders
    reminders: jsonb("reminders"), // Array of reminder objects
    
    // Visibility
    visibility: varchar("visibility", { length: 20 }).default("default"), // default, public, private
    
    // Email integration
    relatedEmailId: uuid("related_email_id"), // Link to email that created this event
    
    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    calendarIdIdx: index("events_calendar_id_idx").on(table.calendarId),
    userIdIdx: index("events_user_id_idx").on(table.userId),
    startTimeIdx: index("events_start_time_idx").on(table.startTime),
    nylasIdIdx: index("events_nylas_id_idx").on(table.nylasEventId),
  })
);

// ============================================================================
// EVENT ATTENDEES TABLE
// ============================================================================

export const eventAttendeesTable = pgTable(
  "event_attendees",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id").notNull().references(() => calendarEventsTable.id, { onDelete: "cascade" }),
    
    // Attendee details
    email: varchar("email", { length: 255 }).notNull(),
    name: text("name"),
    
    // Status
    status: attendeeStatusEnum("status").default("needs_action"),
    isOptional: boolean("is_optional").default(false),
    isOrganizer: boolean("is_organizer").default(false),
    
    // Response
    comment: text("comment"),
    respondedAt: timestamp("responded_at"),
    
    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    eventIdIdx: index("attendees_event_id_idx").on(table.eventId),
    emailIdx: index("attendees_email_idx").on(table.email),
  })
);

// ============================================================================
// CALENDAR SETTINGS TABLE
// ============================================================================

export const calendarSettingsTable = pgTable(
  "calendar_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().unique(),
    
    // View preferences
    defaultView: varchar("default_view", { length: 20 }).default("week"), // day, week, month, agenda
    weekStartDay: integer("week_start_day").default(0), // 0 = Sunday, 1 = Monday
    workingHoursStart: varchar("working_hours_start", { length: 5 }).default("09:00"),
    workingHoursEnd: varchar("working_hours_end", { length: 5 }).default("17:00"),
    workingDays: jsonb("working_days").default([1, 2, 3, 4, 5]), // Mon-Fri
    
    // Display settings
    showWeekNumbers: boolean("show_week_numbers").default(false),
    timeFormat: varchar("time_format", { length: 10 }).default("12h"), // 12h or 24h
    dateFormat: varchar("date_format", { length: 50 }).default("MM/DD/YYYY"),
    
    // Notifications
    defaultReminders: jsonb("default_reminders").default([{ minutes: 15, method: "popup" }]),
    enableNotifications: boolean("enable_notifications").default(true),
    enableEmailNotifications: boolean("enable_email_notifications").default(true),
    
    // AI features
    enableAiScheduling: boolean("enable_ai_scheduling").default(true),
    enableAutoEventCreation: boolean("enable_auto_event_creation").default(true),
    
    // Availability
    availabilityRules: jsonb("availability_rules"), // Complex availability rules
    
    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("calendar_settings_user_id_idx").on(table.userId),
  })
);

// ============================================================================
// AVAILABILITY SLOTS TABLE (for scheduling links)
// ============================================================================

export const availabilitySlotsTable = pgTable(
  "availability_slots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    
    // Slot details
    name: text("name").notNull(),
    description: text("description"),
    duration: integer("duration").notNull(), // in minutes
    
    // Availability
    availableDays: jsonb("available_days").notNull(), // Day/time rules
    bufferTime: integer("buffer_time").default(0), // Minutes before/after
    
    // Booking settings
    maxBookingsPerDay: integer("max_bookings_per_day"),
    advanceNotice: integer("advance_notice").default(60), // Minutes
    maxAdvanceTime: integer("max_advance_time").default(10080), // Minutes (1 week)
    
    // Link
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    isActive: boolean("is_active").default(true),
    
    // Meeting details
    location: text("location"),
    conferenceType: varchar("conference_type", { length: 50 }), // zoom, meet, teams
    
    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("availability_user_id_idx").on(table.userId),
    slugIdx: index("availability_slug_idx").on(table.slug),
  })
);

// ============================================================================
// Type Exports
// ============================================================================

export type SelectCalendar = typeof calendarsTable.$inferSelect;
export type InsertCalendar = typeof calendarsTable.$inferInsert;

export type SelectCalendarEvent = typeof calendarEventsTable.$inferSelect;
export type InsertCalendarEvent = typeof calendarEventsTable.$inferInsert;

export type SelectEventAttendee = typeof eventAttendeesTable.$inferSelect;
export type InsertEventAttendee = typeof eventAttendeesTable.$inferInsert;

export type SelectCalendarSettings = typeof calendarSettingsTable.$inferSelect;
export type InsertCalendarSettings = typeof calendarSettingsTable.$inferInsert;

export type SelectAvailabilitySlot = typeof availabilitySlotsTable.$inferSelect;
export type InsertAvailabilitySlot = typeof availabilitySlotsTable.$inferInsert;


