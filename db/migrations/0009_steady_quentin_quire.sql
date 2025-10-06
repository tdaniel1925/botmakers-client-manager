DO $$ BEGIN
 CREATE TYPE "public"."organization_status" AS ENUM('active', 'trial', 'suspended', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."platform_admin_role" AS ENUM('super_admin', 'support_staff', 'billing_admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."sender_type" AS ENUM('user', 'platform_admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ticket_category" AS ENUM('billing', 'technical', 'feature_request', 'bug_report', 'account', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ticket_priority" AS ENUM('low', 'medium', 'high', 'critical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ticket_status" AS ENUM('open', 'in_progress', 'waiting_response', 'resolved', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform_admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"role" "platform_admin_role" DEFAULT 'super_admin' NOT NULL,
	"permissions" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platform_admins_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"sender_id" text NOT NULL,
	"sender_type" "sender_type" NOT NULL,
	"message" text NOT NULL,
	"is_internal_note" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_by" text NOT NULL,
	"assigned_to" uuid,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"category" "ticket_category" DEFAULT 'other' NOT NULL,
	"priority" "ticket_priority" DEFAULT 'medium' NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"changes" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "status" "organization_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "trial_ends_at" timestamp;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "max_storage_gb" integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "settings" text DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "feature_flags" text DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "suspended_at" timestamp;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_platform_admins_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."platform_admins"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_slug_unique" UNIQUE("slug");