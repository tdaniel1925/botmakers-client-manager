CREATE TYPE "public"."attendee_status" AS ENUM('accepted', 'declined', 'tentative', 'needs_action');--> statement-breakpoint
CREATE TYPE "public"."calendar_type" AS ENUM('primary', 'work', 'personal', 'shared', 'other');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('confirmed', 'tentative', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."recurrence_frequency" AS ENUM('daily', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."reminder_method" AS ENUM('email', 'popup', 'sms');--> statement-breakpoint
CREATE TABLE "availability_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"duration" integer NOT NULL,
	"available_days" jsonb NOT NULL,
	"buffer_time" integer DEFAULT 0,
	"max_bookings_per_day" integer,
	"advance_notice" integer DEFAULT 60,
	"max_advance_time" integer DEFAULT 10080,
	"slug" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true,
	"location" text,
	"conference_type" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "availability_slots_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calendar_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"nylas_event_id" text,
	"nylas_calendar_id" text,
	"title" text NOT NULL,
	"description" text,
	"location" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"is_all_day" boolean DEFAULT false,
	"timezone" varchar(100) DEFAULT 'America/New_York',
	"status" "event_status" DEFAULT 'confirmed',
	"organizer" jsonb,
	"is_recurring" boolean DEFAULT false,
	"recurrence_rule" jsonb,
	"recurrence_id" text,
	"conference_link" text,
	"conference_data" jsonb,
	"attachments" jsonb,
	"reminders" jsonb,
	"visibility" varchar(20) DEFAULT 'default',
	"related_email_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"default_view" varchar(20) DEFAULT 'week',
	"week_start_day" integer DEFAULT 0,
	"working_hours_start" varchar(5) DEFAULT '09:00',
	"working_hours_end" varchar(5) DEFAULT '17:00',
	"working_days" jsonb DEFAULT '[1,2,3,4,5]'::jsonb,
	"show_week_numbers" boolean DEFAULT false,
	"time_format" varchar(10) DEFAULT '12h',
	"date_format" varchar(50) DEFAULT 'MM/DD/YYYY',
	"default_reminders" jsonb DEFAULT '[{"minutes":15,"method":"popup"}]'::jsonb,
	"enable_notifications" boolean DEFAULT true,
	"enable_email_notifications" boolean DEFAULT true,
	"enable_ai_scheduling" boolean DEFAULT true,
	"enable_auto_event_creation" boolean DEFAULT true,
	"availability_rules" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "calendar_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "calendars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text,
	"nylas_calendar_id" text,
	"email_account_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"color" varchar(7) DEFAULT '#3B82F6',
	"type" "calendar_type" DEFAULT 'personal',
	"is_default" boolean DEFAULT false,
	"is_visible" boolean DEFAULT true,
	"timezone" varchar(100) DEFAULT 'America/New_York',
	"last_synced_at" timestamp,
	"sync_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" text,
	"status" "attendee_status" DEFAULT 'needs_action',
	"is_optional" boolean DEFAULT false,
	"is_organizer" boolean DEFAULT false,
	"comment" text,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_calendar_id_calendars_id_fk" FOREIGN KEY ("calendar_id") REFERENCES "public"."calendars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_event_id_calendar_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "availability_user_id_idx" ON "availability_slots" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "availability_slug_idx" ON "availability_slots" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "events_calendar_id_idx" ON "calendar_events" USING btree ("calendar_id");--> statement-breakpoint
CREATE INDEX "events_user_id_idx" ON "calendar_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "events_start_time_idx" ON "calendar_events" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "events_nylas_id_idx" ON "calendar_events" USING btree ("nylas_event_id");--> statement-breakpoint
CREATE INDEX "calendar_settings_user_id_idx" ON "calendar_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "calendars_user_id_idx" ON "calendars" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "calendars_nylas_id_idx" ON "calendars" USING btree ("nylas_calendar_id");--> statement-breakpoint
CREATE INDEX "attendees_event_id_idx" ON "event_attendees" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "attendees_email_idx" ON "event_attendees" USING btree ("email");