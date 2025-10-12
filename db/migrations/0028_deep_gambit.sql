CREATE TYPE "public"."email_reminder_method" AS ENUM('email', 'sms', 'both');--> statement-breakpoint
CREATE TABLE "ai_email_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"email_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"reminder_at" timestamp NOT NULL,
	"method" "email_reminder_method" DEFAULT 'email',
	"status" "email_reminder_status" DEFAULT 'pending',
	"sent_at" timestamp,
	"completed_at" timestamp,
	"is_recurring" boolean DEFAULT false,
	"recurrence_rule" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text,
	"email" varchar(255) NOT NULL,
	"name" text,
	"first_name" text,
	"last_name" text,
	"display_name" text,
	"phone" varchar(50),
	"company" text,
	"job_title" text,
	"notes" text,
	"tags" jsonb,
	"avatar_url" text,
	"photo_data" text,
	"linkedin_url" text,
	"twitter_handle" text,
	"website" text,
	"address" jsonb,
	"email_count" integer DEFAULT 0,
	"last_emailed_at" timestamp,
	"last_email_subject" text,
	"source" "contact_source" DEFAULT 'email',
	"source_email_id" uuid,
	"is_favorite" boolean DEFAULT false,
	"is_blocked" boolean DEFAULT false,
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_group_members" DROP CONSTRAINT "contact_group_members_contact_id_contacts_id_fk";
--> statement-breakpoint
ALTER TABLE "email_reminders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "email_reminders" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
ALTER TABLE "ai_email_reminders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ai_email_reminders" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."email_reminder_status";--> statement-breakpoint
CREATE TYPE "public"."email_reminder_status" AS ENUM('pending', 'sent', 'failed', 'cancelled', 'completed');--> statement-breakpoint
ALTER TABLE "email_reminders" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."email_reminder_status";--> statement-breakpoint
ALTER TABLE "email_reminders" ALTER COLUMN "status" SET DATA TYPE "public"."email_reminder_status" USING "status"::"public"."email_reminder_status";--> statement-breakpoint
ALTER TABLE "ai_email_reminders" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."email_reminder_status";--> statement-breakpoint
ALTER TABLE "ai_email_reminders" ALTER COLUMN "status" SET DATA TYPE "public"."email_reminder_status" USING "status"::"public"."email_reminder_status";--> statement-breakpoint
CREATE INDEX "ai_email_reminders_user_id_idx" ON "ai_email_reminders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_email_reminders_email_id_idx" ON "ai_email_reminders" USING btree ("email_id");--> statement-breakpoint
CREATE INDEX "ai_email_reminders_reminder_at_idx" ON "ai_email_reminders" USING btree ("reminder_at");--> statement-breakpoint
CREATE INDEX "ai_email_reminders_status_idx" ON "ai_email_reminders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_contacts_user_id_idx" ON "email_contacts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_contacts_email_idx" ON "email_contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "email_contacts_name_idx" ON "email_contacts" USING btree ("name");--> statement-breakpoint
CREATE INDEX "email_contacts_company_idx" ON "email_contacts" USING btree ("company");--> statement-breakpoint
ALTER TABLE "contact_group_members" ADD CONSTRAINT "contact_group_members_contact_id_email_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."email_contacts"("id") ON DELETE cascade ON UPDATE no action;