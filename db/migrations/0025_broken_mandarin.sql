CREATE TYPE "public"."ai_action_type" AS ENUM('add_to_calendar', 'set_reminder', 'save_receipt', 'create_task', 'save_contact', 'book_meeting', 'reply_later', 'set_aside');--> statement-breakpoint
CREATE TYPE "public"."contact_source" AS ENUM('email', 'manual', 'import', 'calendar');--> statement-breakpoint
CREATE TABLE "contact_screening" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"email_address" text NOT NULL,
	"decision" varchar(50),
	"decided_at" timestamp,
	"first_email_id" uuid,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_email_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"email_mode" varchar(50) DEFAULT 'traditional',
	"screening_enabled" boolean DEFAULT false,
	"auto_classification_enabled" boolean DEFAULT true,
	"privacy_protection_enabled" boolean DEFAULT true,
	"keyboard_shortcuts_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_signatures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"account_id" uuid,
	"name" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_contextual_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"actions" jsonb,
	"extracted_events" jsonb,
	"extracted_contacts" jsonb,
	"extracted_tasks" jsonb,
	"analysis_model" varchar(50),
	"confidence" integer,
	"tokens_used" integer,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_group_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text,
	"name" text NOT NULL,
	"description" text,
	"color" varchar(7) DEFAULT '#3B82F6',
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sms_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"phone_number" varchar(20),
	"phone_number_verified" boolean DEFAULT false,
	"verification_code" varchar(10),
	"verification_expiry" timestamp,
	"sms_enabled" boolean DEFAULT false,
	"sms_reminder_enabled" boolean DEFAULT true,
	"twilio_account_sid" text,
	"twilio_auth_token" text,
	"twilio_phone_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_sms_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "email_templates" ALTER COLUMN "name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "email_templates" ALTER COLUMN "category" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "email_templates" ALTER COLUMN "category" SET DEFAULT 'general';--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "ai_quick_replies" jsonb;--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "ai_smart_actions" jsonb;--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "ai_generated_at" timestamp;--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "hey_view" varchar(50);--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "hey_category" varchar(50);--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "screening_status" varchar(50) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "is_reply_later" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "reply_later_until" timestamp;--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "reply_later_note" text;--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "is_set_aside" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "set_aside_at" timestamp;--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "is_bubbled_up" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "bubbled_up_at" timestamp;--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "custom_subject" text;--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "trackers_blocked" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "tracking_stripped" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "email_templates" ADD COLUMN "is_shared" text DEFAULT 'false';--> statement-breakpoint
ALTER TABLE "contact_group_members" ADD CONSTRAINT "contact_group_members_group_id_contact_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."contact_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_group_members" ADD CONSTRAINT "contact_group_members_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_screening_user_id_idx" ON "contact_screening" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "contact_screening_user_email_idx" ON "contact_screening" USING btree ("user_id","email_address");--> statement-breakpoint
CREATE INDEX "contact_screening_decision_idx" ON "contact_screening" USING btree ("user_id","decision");--> statement-breakpoint
CREATE INDEX "ai_contextual_actions_email_id_idx" ON "ai_contextual_actions" USING btree ("email_id");--> statement-breakpoint
CREATE INDEX "ai_contextual_actions_user_id_idx" ON "ai_contextual_actions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_contextual_actions_expires_at_idx" ON "ai_contextual_actions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "contact_group_members_group_id_idx" ON "contact_group_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "contact_group_members_contact_id_idx" ON "contact_group_members" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "contact_groups_user_id_idx" ON "contact_groups" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_sms_settings_user_id_idx" ON "user_sms_settings" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "email_templates" DROP COLUMN "is_global";--> statement-breakpoint
ALTER TABLE "email_templates" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "email_templates" DROP COLUMN "html_body";--> statement-breakpoint
ALTER TABLE "email_templates" DROP COLUMN "variables";--> statement-breakpoint
ALTER TABLE "email_templates" DROP COLUMN "last_used_at";--> statement-breakpoint
ALTER TABLE "email_templates" DROP COLUMN "is_favorite";--> statement-breakpoint
ALTER TABLE "email_templates" DROP COLUMN "tags";