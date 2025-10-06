DO $$ BEGIN
 CREATE TYPE "public"."task_source_type" AS ENUM('manual', 'ai_generated', 'onboarding_response');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."reminder_schedule" AS ENUM('standard', 'aggressive', 'gentle', 'custom');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."reminder_status" AS ENUM('pending', 'sent', 'failed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."reminder_type" AS ENUM('initial', 'gentle', 'encouragement', 'final', 'custom');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onboarding_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"reminder_type" "reminder_type" NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"sent_at" timestamp,
	"status" "reminder_status" DEFAULT 'pending' NOT NULL,
	"email_subject" text,
	"email_body" text,
	"metadata" jsonb,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_tasks" ADD COLUMN "source_type" "task_source_type" DEFAULT 'manual';--> statement-breakpoint
ALTER TABLE "project_tasks" ADD COLUMN "source_id" uuid;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD COLUMN "source_metadata" text;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "reminder_schedule" "reminder_schedule" DEFAULT 'standard';--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "last_reminder_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "reminder_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "reminder_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "tasks_generated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "tasks_generated_at" timestamp;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "task_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "visible_steps" jsonb;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "skipped_steps" jsonb;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "onboarding_reminders" ADD CONSTRAINT "onboarding_reminders_session_id_client_onboarding_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."client_onboarding_sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
