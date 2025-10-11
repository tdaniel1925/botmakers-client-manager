CREATE TABLE "email_draft_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"draft_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"to_addresses" jsonb NOT NULL,
	"subject" text NOT NULL,
	"body_text" text,
	"body_html" text,
	"change_type" varchar(50),
	"ai_prompt" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_draft_versions" ADD CONSTRAINT "email_draft_versions_draft_id_email_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."email_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "draft_versions_draft_id_idx" ON "email_draft_versions" USING btree ("draft_id");--> statement-breakpoint
CREATE INDEX "draft_versions_created_at_idx" ON "email_draft_versions" USING btree ("created_at");