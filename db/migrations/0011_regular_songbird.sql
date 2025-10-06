DO $$ BEGIN
 CREATE TYPE "public"."onboarding_status" AS ENUM('pending', 'in_progress', 'completed', 'abandoned');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."onboarding_step_type" AS ENUM('welcome', 'form', 'upload', 'choice', 'approval', 'review', 'complete');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."project_type" AS ENUM('web_design', 'voice_ai', 'software_dev', 'marketing', 'custom', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "client_onboarding_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"template_id" uuid,
	"access_token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"onboarding_type" "project_type" NOT NULL,
	"status" "onboarding_status" DEFAULT 'pending' NOT NULL,
	"steps" jsonb NOT NULL,
	"responses" jsonb DEFAULT '{}'::jsonb,
	"current_step" integer DEFAULT 0 NOT NULL,
	"completion_percentage" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"last_activity_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_onboarding_sessions_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onboarding_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"step_index" integer NOT NULL,
	"step_type" "onboarding_step_type" NOT NULL,
	"response_data" jsonb NOT NULL,
	"time_spent" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onboarding_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"project_type" "project_type" NOT NULL,
	"description" text,
	"steps" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_ai_generated" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"average_completion_time" integer,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "client_onboarding_sessions" ADD CONSTRAINT "client_onboarding_sessions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "client_onboarding_sessions" ADD CONSTRAINT "client_onboarding_sessions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "client_onboarding_sessions" ADD CONSTRAINT "client_onboarding_sessions_template_id_onboarding_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."onboarding_templates"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "onboarding_responses" ADD CONSTRAINT "onboarding_responses_session_id_client_onboarding_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."client_onboarding_sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
