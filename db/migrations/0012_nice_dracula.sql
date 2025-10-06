CREATE TABLE IF NOT EXISTS "project_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "progress_percentage" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "auto_calculated_progress" integer DEFAULT 0;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_notes" ADD CONSTRAINT "project_notes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
