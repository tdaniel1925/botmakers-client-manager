CREATE TABLE IF NOT EXISTS "onboarding_templates_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"project_type" text NOT NULL,
	"description" text,
	"questions" jsonb NOT NULL,
	"conditional_rules" jsonb,
	"industry_triggers" jsonb,
	"is_ai_generated" boolean DEFAULT false NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL,
	"times_used" integer DEFAULT 0 NOT NULL,
	"avg_completion_time" integer,
	"completion_rate" numeric(5, 2),
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onboarding_todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"estimated_minutes" integer,
	"assigned_to" uuid,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"completed_by" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"dependencies" jsonb DEFAULT '[]'::jsonb,
	"ai_generated" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_types_registry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"template_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_types_registry_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"subject" text,
	"body_text" text NOT NULL,
	"body_html" text,
	"variables" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"is_system" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "branding_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"logo_url" text,
	"logo_dark_url" text,
	"favicon_url" text,
	"primary_color" text DEFAULT '#00ff00' NOT NULL,
	"secondary_color" text DEFAULT '#000000' NOT NULL,
	"accent_color" text DEFAULT '#00ff00' NOT NULL,
	"text_color" text DEFAULT '#000000' NOT NULL,
	"background_color" text DEFAULT '#ffffff' NOT NULL,
	"company_name" text DEFAULT 'Botmakers' NOT NULL,
	"company_address" text,
	"company_phone" text,
	"company_email" text,
	"support_email" text DEFAULT 'support@botmakers.com' NOT NULL,
	"twitter_url" text,
	"linkedin_url" text,
	"facebook_url" text,
	"instagram_url" text,
	"website_url" text DEFAULT 'https://botmakers.com' NOT NULL,
	"email_from_name" text DEFAULT 'Botmakers' NOT NULL,
	"email_footer_text" text,
	"show_logo_in_emails" boolean DEFAULT true NOT NULL,
	"show_social_links" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "healing_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"error_category" text NOT NULL,
	"error_source" text NOT NULL,
	"error_message" text NOT NULL,
	"error_stack" text,
	"error_context" jsonb,
	"ai_analysis" jsonb,
	"ai_confidence_score" numeric(3, 2),
	"healing_strategy" text,
	"healing_actions" jsonb,
	"healing_result" text,
	"healing_duration_ms" integer,
	"affected_users" text[],
	"affected_organizations" text[],
	"severity" text NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"admins_notified" text[],
	"notification_sent_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "healing_patterns" (
	"id" text PRIMARY KEY NOT NULL,
	"error_signature" text NOT NULL,
	"error_pattern" text NOT NULL,
	"successful_healing_strategy" text NOT NULL,
	"success_count" integer DEFAULT 1,
	"failure_count" integer DEFAULT 0,
	"success_rate" numeric(5, 2),
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "healing_patterns_error_signature_unique" UNIQUE("error_signature")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_health_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"check_type" text NOT NULL,
	"check_name" text NOT NULL,
	"status" text NOT NULL,
	"metrics" jsonb,
	"threshold_breached" boolean DEFAULT false,
	"auto_healed" boolean DEFAULT false,
	"healing_event_id" text,
	"checked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"full_name" text,
	"job_title" text,
	"department" text,
	"email" text,
	"phone" text,
	"mobile_phone" text,
	"office_phone" text,
	"address_line1" text,
	"address_line2" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text,
	"notes" text,
	"is_primary" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "address_line_1" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "address_line_2" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "country" text DEFAULT 'United States';--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN "sms_notifications_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN "notification_preferences" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "platform_admins" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "platform_admins" ADD COLUMN "sms_notifications_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "platform_admins" ADD COLUMN "notification_preferences" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "client_name" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "client_email" text;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "template_library_id" uuid;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "ai_analysis" jsonb;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "todos_generated_at" timestamp;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "todos_approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "todos_approved_by" text;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "completion_mode" text DEFAULT 'client';--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "completed_by_sections" jsonb;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "manually_completed_by" text;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "manually_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "finalized_by_admin" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "client_review_requested_at" timestamp;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "client_reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD COLUMN "client_review_notes" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "onboarding_todos" ADD CONSTRAINT "onboarding_todos_session_id_client_onboarding_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."client_onboarding_sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_types_registry" ADD CONSTRAINT "project_types_registry_template_id_onboarding_templates_library_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."onboarding_templates_library"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "system_health_checks" ADD CONSTRAINT "system_health_checks_healing_event_id_healing_events_id_fk" FOREIGN KEY ("healing_event_id") REFERENCES "public"."healing_events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_contacts" ADD CONSTRAINT "organization_contacts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_healing_events_created" ON "healing_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_healing_events_category" ON "healing_events" USING btree ("error_category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_healing_events_severity" ON "healing_events" USING btree ("severity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_healing_events_result" ON "healing_events" USING btree ("healing_result");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_healing_events_source" ON "healing_events" USING btree ("error_source");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_healing_patterns_signature" ON "healing_patterns" USING btree ("error_signature");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_healing_patterns_success_rate" ON "healing_patterns" USING btree ("success_rate");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_health_checks_status" ON "system_health_checks" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_health_checks_checked" ON "system_health_checks" USING btree ("checked_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_health_checks_type" ON "system_health_checks" USING btree ("check_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_org_contacts_org_id" ON "organization_contacts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_org_contacts_email" ON "organization_contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_org_contacts_name" ON "organization_contacts" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_org_contacts_active" ON "organization_contacts" USING btree ("is_active");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "client_onboarding_sessions" ADD CONSTRAINT "client_onboarding_sessions_template_library_id_onboarding_templates_library_id_fk" FOREIGN KEY ("template_library_id") REFERENCES "public"."onboarding_templates_library"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_org_created" ON "audit_logs" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_entity" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");