CREATE TYPE "public"."email_reminder_status" AS ENUM('pending', 'sent', 'dismissed', 'completed');--> statement-breakpoint
CREATE TABLE "email_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"remind_at" timestamp NOT NULL,
	"reason" text,
	"status" "email_reminder_status" DEFAULT 'pending' NOT NULL,
	"notification_sent" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_snippets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"shortcut" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb,
	"description" text,
	"category" varchar(50),
	"usage_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_threads" ADD COLUMN "importance_score" integer;--> statement-breakpoint
ALTER TABLE "email_threads" ADD COLUMN "importance_reason" text;--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "ai_category" varchar(50);--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "ai_category_confidence" integer;--> statement-breakpoint
ALTER TABLE "email_reminders" ADD CONSTRAINT "email_reminders_email_id_emails_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_reminders_email_id_idx" ON "email_reminders" USING btree ("email_id");--> statement-breakpoint
CREATE INDEX "email_reminders_user_id_idx" ON "email_reminders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_reminders_remind_at_idx" ON "email_reminders" USING btree ("remind_at");--> statement-breakpoint
CREATE INDEX "email_reminders_status_idx" ON "email_reminders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_snippets_user_id_idx" ON "email_snippets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_snippets_shortcut_idx" ON "email_snippets" USING btree ("shortcut");