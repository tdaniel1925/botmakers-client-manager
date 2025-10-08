DO $$ BEGIN
 CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'active', 'paused', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."campaign_type" AS ENUM('inbound', 'outbound', 'both');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."voice_provider" AS ENUM('vapi', 'autocalls', 'synthflow', 'retell');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "call_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"webhook_id" uuid NOT NULL,
	"raw_payload" jsonb NOT NULL,
	"call_external_id" text,
	"caller_phone" text,
	"caller_name" text,
	"call_duration_seconds" integer,
	"call_timestamp" timestamp,
	"audio_url" text,
	"transcript" text NOT NULL,
	"structured_data" jsonb,
	"ai_analysis_status" text DEFAULT 'pending',
	"ai_analysis_completed_at" timestamp,
	"call_topic" text,
	"call_summary" text,
	"questions_asked" text[],
	"call_sentiment" text,
	"call_quality_rating" integer,
	"follow_up_needed" boolean DEFAULT false,
	"follow_up_reason" text,
	"follow_up_urgency" text,
	"workflow_triggers" text[],
	"ai_insights" jsonb,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "call_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"trigger_conditions" jsonb NOT NULL,
	"actions" jsonb NOT NULL,
	"total_executions" integer DEFAULT 0,
	"last_executed_at" timestamp,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"label" text NOT NULL,
	"webhook_token" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"api_key" text,
	"total_calls_received" integer DEFAULT 0,
	"last_call_received_at" timestamp,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_webhooks_webhook_token_unique" UNIQUE("webhook_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_execution_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"call_record_id" uuid NOT NULL,
	"status" text NOT NULL,
	"actions_executed" jsonb,
	"error_message" text,
	"executed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_sms_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"message" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaign_provider_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"provider" "voice_provider" NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "voice_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"webhook_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"campaign_type" "campaign_type" DEFAULT 'inbound' NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"provider" "voice_provider" NOT NULL,
	"provider_assistant_id" text,
	"provider_phone_number_id" text,
	"phone_number" text,
	"setup_answers" jsonb NOT NULL,
	"ai_generated_config" jsonb,
	"provider_config" jsonb,
	"campaign_goal" text,
	"agent_personality" text,
	"system_prompt" text,
	"first_message" text,
	"voicemail_message" text,
	"total_calls" integer DEFAULT 0,
	"completed_calls" integer DEFAULT 0,
	"failed_calls" integer DEFAULT 0,
	"average_call_duration" integer,
	"average_call_quality" integer,
	"total_cost" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"last_call_at" timestamp,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "temp_username" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "temp_password" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "credentials_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "credentials_used_at" timestamp;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "credentials_expires_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_records" ADD CONSTRAINT "call_records_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_records" ADD CONSTRAINT "call_records_webhook_id_project_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."project_webhooks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_workflows" ADD CONSTRAINT "call_workflows_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_webhooks" ADD CONSTRAINT "project_webhooks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_email_templates" ADD CONSTRAINT "workflow_email_templates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_execution_logs" ADD CONSTRAINT "workflow_execution_logs_workflow_id_call_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."call_workflows"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_execution_logs" ADD CONSTRAINT "workflow_execution_logs_call_record_id_call_records_id_fk" FOREIGN KEY ("call_record_id") REFERENCES "public"."call_records"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_sms_templates" ADD CONSTRAINT "workflow_sms_templates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaign_provider_metadata" ADD CONSTRAINT "campaign_provider_metadata_campaign_id_voice_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."voice_campaigns"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "voice_campaigns" ADD CONSTRAINT "voice_campaigns_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "voice_campaigns" ADD CONSTRAINT "voice_campaigns_webhook_id_project_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."project_webhooks"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_call_records_project" ON "call_records" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_call_records_webhook" ON "call_records" USING btree ("webhook_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_call_records_timestamp" ON "call_records" USING btree ("call_timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_call_records_follow_up" ON "call_records" USING btree ("follow_up_needed");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_call_workflows_project" ON "call_workflows" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_call_workflows_active" ON "call_workflows" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_project_webhooks_project" ON "project_webhooks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_project_webhooks_token" ON "project_webhooks" USING btree ("webhook_token");