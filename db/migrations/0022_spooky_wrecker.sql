CREATE TABLE "blocked_senders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"email_address" text NOT NULL,
	"reason" text,
	"blocked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"enabled" boolean DEFAULT true,
	"priority" integer DEFAULT 0,
	"conditions" jsonb NOT NULL,
	"actions" jsonb NOT NULL,
	"match_count" integer DEFAULT 0,
	"last_triggered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"auto_sync_enabled" boolean DEFAULT true,
	"sync_frequency_minutes" integer DEFAULT 5,
	"webhook_enabled" boolean DEFAULT true,
	"signature" text,
	"signature_enabled" boolean DEFAULT true,
	"signature_html" text,
	"auto_reply_enabled" boolean DEFAULT false,
	"auto_reply_subject" text,
	"auto_reply_message" text,
	"auto_reply_start_date" timestamp,
	"auto_reply_end_date" timestamp,
	"forwarding_enabled" boolean DEFAULT false,
	"forwarding_address" text,
	"forwarding_keep_copy" boolean DEFAULT true,
	"emails_per_page" integer DEFAULT 50,
	"show_preview" boolean DEFAULT true,
	"compact_mode" boolean DEFAULT false,
	"dark_mode" boolean DEFAULT false,
	"desktop_notifications" boolean DEFAULT true,
	"email_notifications" boolean DEFAULT false,
	"notify_on_important_only" boolean DEFAULT false,
	"notification_sound" boolean DEFAULT true,
	"ai_summaries_enabled" boolean DEFAULT true,
	"ai_copilot_enabled" boolean DEFAULT true,
	"ai_auto_categorization_enabled" boolean DEFAULT true,
	"ai_smart_replies_enabled" boolean DEFAULT true,
	"mark_as_read_on_view" boolean DEFAULT true,
	"mark_as_read_delay" integer DEFAULT 2,
	"send_read_receipts" boolean DEFAULT false,
	"blocked_senders" jsonb DEFAULT '[]'::jsonb,
	"keyboard_shortcuts_enabled" boolean DEFAULT true,
	"custom_shortcuts" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_settings_account_id_unique" UNIQUE("account_id")
);
--> statement-breakpoint
ALTER TABLE "blocked_senders" ADD CONSTRAINT "blocked_senders_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."email_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_rules" ADD CONSTRAINT "email_rules_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."email_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_settings" ADD CONSTRAINT "email_settings_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."email_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blocked_senders_account_id_idx" ON "blocked_senders" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "blocked_senders_email_address_idx" ON "blocked_senders" USING btree ("email_address");--> statement-breakpoint
CREATE INDEX "email_rules_account_id_idx" ON "email_rules" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "email_rules_user_id_idx" ON "email_rules" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_rules_priority_idx" ON "email_rules" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "email_settings_account_id_idx" ON "email_settings" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "email_settings_user_id_idx" ON "email_settings" USING btree ("user_id");