CREATE TYPE "public"."payment_provider" AS ENUM('stripe', 'whop');--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "payment_provider" "payment_provider" DEFAULT 'whop';--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "whop_user_id" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "whop_membership_id" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "billing_cycle_start" timestamp;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "billing_cycle_end" timestamp;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "next_credit_renewal" timestamp;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "usage_credits" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "used_credits" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "status" text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "plan_duration" text;