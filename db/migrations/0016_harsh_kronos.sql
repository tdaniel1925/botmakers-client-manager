CREATE TYPE "public"."contact_call_status" AS ENUM('pending', 'queued', 'calling', 'completed', 'failed', 'no_answer', 'voicemail', 'busy', 'invalid');--> statement-breakpoint
CREATE TYPE "public"."draft_source" AS ENUM('user', 'ai_suggestion', 'ai_autonomous');--> statement-breakpoint
CREATE TYPE "public"."email_account_status" AS ENUM('active', 'inactive', 'error', 'syncing');--> statement-breakpoint
CREATE TYPE "public"."email_auth_type" AS ENUM('oauth', 'password');--> statement-breakpoint
CREATE TYPE "public"."email_provider" AS ENUM('gmail', 'microsoft', 'imap', 'yahoo', 'aol', 'custom');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."sentiment" AS ENUM('positive', 'neutral', 'negative');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('pending', 'in_progress', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."sync_type" AS ENUM('full', 'incremental', 'webhook', 'manual');--> statement-breakpoint
ALTER TYPE "public"."campaign_status" ADD VALUE 'pending' BEFORE 'active';--> statement-breakpoint
CREATE TABLE "campaign_contact_uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"file_type" text,
	"total_rows" integer DEFAULT 0 NOT NULL,
	"valid_rows" integer DEFAULT 0 NOT NULL,
	"invalid_rows" integer DEFAULT 0 NOT NULL,
	"duplicate_rows" integer DEFAULT 0 NOT NULL,
	"column_mapping" jsonb NOT NULL,
	"timezone_summary" jsonb,
	"processing_status" text DEFAULT 'pending' NOT NULL,
	"processing_error" text,
	"batch_id" text NOT NULL,
	"uploaded_by" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "campaign_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"phone_number" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"full_name" text,
	"email" text,
	"company" text,
	"area_code" text,
	"timezone" text,
	"timezone_offset" text,
	"custom_fields" jsonb,
	"call_status" "contact_call_status" DEFAULT 'pending' NOT NULL,
	"call_attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"last_attempt_at" timestamp,
	"next_attempt_at" timestamp,
	"scheduled_for" timestamp,
	"best_call_time" text,
	"call_record_id" uuid,
	"call_outcome" text,
	"notes" text,
	"upload_batch_id" text,
	"row_number" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_message_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"contact_id" uuid,
	"template_id" uuid,
	"message_type" text NOT NULL,
	"recipient" text NOT NULL,
	"subject" text,
	"body" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"error_message" text,
	"provider_id" text,
	"provider_response" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_message_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"project_id" uuid NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sms_message" text,
	"email_subject" text,
	"email_body" text,
	"trigger_conditions" jsonb,
	"available_variables" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_messaging_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"sms_enabled" boolean DEFAULT false NOT NULL,
	"email_enabled" boolean DEFAULT false NOT NULL,
	"sms_template_id" uuid,
	"email_template_id" uuid,
	"templates" jsonb,
	"default_send_timing" text DEFAULT 'immediately',
	"max_messages_per_contact" integer DEFAULT 3,
	"min_time_between_messages" integer DEFAULT 24,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_messaging_config_campaign_id_unique" UNIQUE("campaign_id")
);
--> statement-breakpoint
CREATE TABLE "organization_messaging_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"twilio_account_sid" text,
	"twilio_auth_token" text,
	"twilio_phone_number" text,
	"twilio_enabled" boolean DEFAULT false NOT NULL,
	"twilio_verified" boolean DEFAULT false NOT NULL,
	"twilio_last_tested_at" timestamp,
	"resend_api_key" text,
	"resend_from_email" text,
	"resend_enabled" boolean DEFAULT false NOT NULL,
	"resend_verified" boolean DEFAULT false NOT NULL,
	"resend_last_tested_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_messaging_credentials_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "quickagent_industries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"tagline" text,
	"setup_assistant_campaign_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"config" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quickagent_industries_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"subscription_id" uuid,
	"invoice_number" text NOT NULL,
	"subscription_amount" integer NOT NULL,
	"usage_amount" integer DEFAULT 0,
	"subtotal" integer NOT NULL,
	"tax_amount" integer DEFAULT 0,
	"total_amount" integer NOT NULL,
	"minutes_included" integer NOT NULL,
	"minutes_used" integer NOT NULL,
	"overage_minutes" integer DEFAULT 0,
	"payment_provider" text NOT NULL,
	"external_invoice_id" text,
	"status" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"due_date" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "organization_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"payment_provider" text NOT NULL,
	"external_subscription_id" text,
	"external_customer_id" text,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"minutes_used_this_cycle" integer DEFAULT 0,
	"minutes_included_this_cycle" integer NOT NULL,
	"overage_minutes_this_cycle" integer DEFAULT 0,
	"overage_cost_this_cycle" integer DEFAULT 0,
	"status" text DEFAULT 'active' NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false,
	"trial_ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"canceled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"monthly_price" integer NOT NULL,
	"included_minutes" integer NOT NULL,
	"overage_rate_per_minute" integer NOT NULL,
	"max_active_campaigns" integer DEFAULT -1,
	"max_users" integer DEFAULT 5,
	"features" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"stripe_product_id" text,
	"stripe_price_id" text,
	"stripe_metered_price_id" text,
	"square_product_id" text,
	"square_plan_id" text,
	"paypal_plan_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "usage_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"subscription_id" uuid,
	"campaign_id" uuid,
	"call_record_id" uuid,
	"duration_in_seconds" integer NOT NULL,
	"minutes_used" integer NOT NULL,
	"cost_in_cents" integer NOT NULL,
	"was_overage" boolean DEFAULT false,
	"rate_per_minute" integer NOT NULL,
	"billing_period_start" timestamp NOT NULL,
	"billing_period_end" timestamp NOT NULL,
	"reported_to_provider" boolean DEFAULT false,
	"external_usage_record_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "impersonation_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" text NOT NULL,
	"admin_email" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"organization_name" text NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"reason" text,
	"actions_log" text[] DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "email_ai_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_id" uuid,
	"thread_id" uuid,
	"user_id" text NOT NULL,
	"summary_text" text NOT NULL,
	"key_points" jsonb,
	"action_items" jsonb,
	"sentiment" "sentiment",
	"urgency" "priority",
	"suggested_reply" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"provider" "email_provider" NOT NULL,
	"auth_type" "email_auth_type" NOT NULL,
	"email_address" varchar(255) NOT NULL,
	"display_name" text,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"imap_host" varchar(255),
	"imap_port" integer,
	"imap_username" varchar(255),
	"imap_password" text,
	"imap_use_ssl" boolean DEFAULT true,
	"smtp_host" varchar(255),
	"smtp_port" integer,
	"smtp_username" varchar(255),
	"smtp_password" text,
	"smtp_use_ssl" boolean DEFAULT true,
	"status" "email_account_status" DEFAULT 'active' NOT NULL,
	"last_sync_at" timestamp,
	"last_sync_error" text,
	"last_uid" integer,
	"webhook_subscription_id" text,
	"webhook_expires_at" timestamp,
	"signature" text,
	"reply_to_email" varchar(255),
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"storage_url" text,
	"external_id" text,
	"content_id" text,
	"is_inline" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"thread_id" uuid,
	"in_reply_to_email_id" uuid,
	"to_addresses" jsonb NOT NULL,
	"cc_addresses" jsonb,
	"bcc_addresses" jsonb,
	"subject" text NOT NULL,
	"body_text" text,
	"body_html" text,
	"source" "draft_source" DEFAULT 'user' NOT NULL,
	"ai_prompt" text,
	"ai_confidence" integer,
	"scheduled_send_at" timestamp,
	"is_sent" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(7),
	"is_system_label" boolean DEFAULT false NOT NULL,
	"external_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"sync_type" "sync_type" NOT NULL,
	"status" "sync_status" DEFAULT 'pending' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"duration" integer,
	"emails_fetched" integer DEFAULT 0 NOT NULL,
	"emails_processed" integer DEFAULT 0 NOT NULL,
	"emails_skipped" integer DEFAULT 0 NOT NULL,
	"emails_failed" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"error_stack" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"subject" text NOT NULL,
	"snippet" text,
	"participants" jsonb NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"is_starred" boolean DEFAULT false NOT NULL,
	"is_muted" boolean DEFAULT false NOT NULL,
	"has_attachments" boolean DEFAULT false NOT NULL,
	"first_message_at" timestamp NOT NULL,
	"last_message_at" timestamp NOT NULL,
	"ai_summary_id" uuid,
	"key_points" jsonb,
	"action_items" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"thread_id" uuid,
	"message_id" text NOT NULL,
	"external_id" text,
	"in_reply_to" text,
	"references" jsonb DEFAULT '[]'::jsonb,
	"from_address" jsonb NOT NULL,
	"to_addresses" jsonb NOT NULL,
	"cc_addresses" jsonb,
	"bcc_addresses" jsonb,
	"reply_to_addresses" jsonb,
	"subject" text NOT NULL,
	"snippet" text,
	"body_text" text,
	"body_html" text,
	"received_at" timestamp NOT NULL,
	"sent_at" timestamp,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_starred" boolean DEFAULT false NOT NULL,
	"is_important" boolean DEFAULT false NOT NULL,
	"is_snoozed" boolean DEFAULT false NOT NULL,
	"snooze_until" timestamp,
	"has_attachments" boolean DEFAULT false NOT NULL,
	"is_draft" boolean DEFAULT false NOT NULL,
	"is_sent" boolean DEFAULT false NOT NULL,
	"is_trash" boolean DEFAULT false NOT NULL,
	"is_spam" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"label_ids" jsonb DEFAULT '[]'::jsonb,
	"folder_name" varchar(100),
	"ai_summary_id" uuid,
	"priority" "priority",
	"sentiment" "sentiment",
	"category" varchar(100),
	"raw_headers" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "current_subscription_id" uuid;--> statement-breakpoint
ALTER TABLE "voice_campaigns" ADD COLUMN "billing_type" text DEFAULT 'billable' NOT NULL;--> statement-breakpoint
ALTER TABLE "voice_campaigns" ADD COLUMN "schedule_config" jsonb;--> statement-breakpoint
ALTER TABLE "campaign_contact_uploads" ADD CONSTRAINT "campaign_contact_uploads_campaign_id_voice_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."voice_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_contacts" ADD CONSTRAINT "campaign_contacts_campaign_id_voice_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."voice_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_contacts" ADD CONSTRAINT "campaign_contacts_call_record_id_call_records_id_fk" FOREIGN KEY ("call_record_id") REFERENCES "public"."call_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_message_log" ADD CONSTRAINT "campaign_message_log_campaign_id_voice_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."voice_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_message_log" ADD CONSTRAINT "campaign_message_log_template_id_campaign_message_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."campaign_message_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_message_templates" ADD CONSTRAINT "campaign_message_templates_campaign_id_voice_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."voice_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_message_templates" ADD CONSTRAINT "campaign_message_templates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_messaging_config" ADD CONSTRAINT "campaign_messaging_config_campaign_id_voice_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."voice_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_messaging_config" ADD CONSTRAINT "campaign_messaging_config_sms_template_id_campaign_message_templates_id_fk" FOREIGN KEY ("sms_template_id") REFERENCES "public"."campaign_message_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_messaging_config" ADD CONSTRAINT "campaign_messaging_config_email_template_id_campaign_message_templates_id_fk" FOREIGN KEY ("email_template_id") REFERENCES "public"."campaign_message_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_messaging_credentials" ADD CONSTRAINT "organization_messaging_credentials_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quickagent_industries" ADD CONSTRAINT "quickagent_industries_setup_assistant_campaign_id_voice_campaigns_id_fk" FOREIGN KEY ("setup_assistant_campaign_id") REFERENCES "public"."voice_campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_organization_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."organization_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_subscription_id_organization_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."organization_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_campaign_id_voice_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."voice_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_call_record_id_call_records_id_fk" FOREIGN KEY ("call_record_id") REFERENCES "public"."call_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impersonation_sessions" ADD CONSTRAINT "impersonation_sessions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_ai_summaries" ADD CONSTRAINT "email_ai_summaries_email_id_emails_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_ai_summaries" ADD CONSTRAINT "email_ai_summaries_thread_id_email_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."email_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_attachments" ADD CONSTRAINT "email_attachments_email_id_emails_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_drafts" ADD CONSTRAINT "email_drafts_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."email_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_drafts" ADD CONSTRAINT "email_drafts_thread_id_email_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."email_threads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_drafts" ADD CONSTRAINT "email_drafts_in_reply_to_email_id_emails_id_fk" FOREIGN KEY ("in_reply_to_email_id") REFERENCES "public"."emails"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_labels" ADD CONSTRAINT "email_labels_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."email_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_sync_logs" ADD CONSTRAINT "email_sync_logs_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."email_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_threads" ADD CONSTRAINT "email_threads_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."email_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_threads" ADD CONSTRAINT "email_threads_ai_summary_id_email_ai_summaries_id_fk" FOREIGN KEY ("ai_summary_id") REFERENCES "public"."email_ai_summaries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."email_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_thread_id_email_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."email_threads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_ai_summary_id_email_ai_summaries_id_fk" FOREIGN KEY ("ai_summary_id") REFERENCES "public"."email_ai_summaries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_campaign_uploads_campaign_id" ON "campaign_contact_uploads" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_campaign_uploads_batch_id" ON "campaign_contact_uploads" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "idx_campaign_contacts_campaign_id" ON "campaign_contacts" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_campaign_contacts_call_status" ON "campaign_contacts" USING btree ("campaign_id","call_status");--> statement-breakpoint
CREATE INDEX "idx_campaign_contacts_timezone" ON "campaign_contacts" USING btree ("timezone");--> statement-breakpoint
CREATE INDEX "idx_campaign_contacts_scheduled" ON "campaign_contacts" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_campaign_contacts_phone" ON "campaign_contacts" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "idx_campaign_contacts_upload_batch" ON "campaign_contacts" USING btree ("upload_batch_id");--> statement-breakpoint
CREATE INDEX "idx_campaign_message_log_campaign_id" ON "campaign_message_log" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_campaign_message_log_contact_id" ON "campaign_message_log" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "idx_campaign_message_log_status" ON "campaign_message_log" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_campaign_templates_campaign_id" ON "campaign_message_templates" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_campaign_templates_project_id" ON "campaign_message_templates" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_campaign_templates_type" ON "campaign_message_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_campaign_messaging_campaign_id" ON "campaign_messaging_config" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "email_ai_summaries_email_id_idx" ON "email_ai_summaries" USING btree ("email_id");--> statement-breakpoint
CREATE INDEX "email_ai_summaries_thread_id_idx" ON "email_ai_summaries" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "email_ai_summaries_user_id_idx" ON "email_ai_summaries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_ai_summaries_expires_at_idx" ON "email_ai_summaries" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "email_accounts_user_id_idx" ON "email_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_accounts_email_address_idx" ON "email_accounts" USING btree ("email_address");--> statement-breakpoint
CREATE INDEX "email_accounts_status_idx" ON "email_accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_attachments_email_id_idx" ON "email_attachments" USING btree ("email_id");--> statement-breakpoint
CREATE INDEX "email_attachments_user_id_idx" ON "email_attachments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_drafts_account_id_idx" ON "email_drafts" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "email_drafts_user_id_idx" ON "email_drafts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_drafts_thread_id_idx" ON "email_drafts" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "email_drafts_is_sent_idx" ON "email_drafts" USING btree ("is_sent");--> statement-breakpoint
CREATE INDEX "email_drafts_scheduled_send_at_idx" ON "email_drafts" USING btree ("scheduled_send_at");--> statement-breakpoint
CREATE INDEX "email_labels_account_id_idx" ON "email_labels" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "email_labels_user_id_idx" ON "email_labels" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_labels_name_idx" ON "email_labels" USING btree ("name");--> statement-breakpoint
CREATE INDEX "email_sync_logs_account_id_idx" ON "email_sync_logs" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "email_sync_logs_user_id_idx" ON "email_sync_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_sync_logs_status_idx" ON "email_sync_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_sync_logs_started_at_idx" ON "email_sync_logs" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "email_threads_account_id_idx" ON "email_threads" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "email_threads_user_id_idx" ON "email_threads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_threads_last_message_at_idx" ON "email_threads" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "emails_account_id_idx" ON "emails" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "emails_user_id_idx" ON "emails" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "emails_thread_id_idx" ON "emails" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "emails_message_id_idx" ON "emails" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "emails_received_at_idx" ON "emails" USING btree ("received_at");--> statement-breakpoint
CREATE INDEX "emails_is_read_idx" ON "emails" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "emails_folder_name_idx" ON "emails" USING btree ("folder_name");