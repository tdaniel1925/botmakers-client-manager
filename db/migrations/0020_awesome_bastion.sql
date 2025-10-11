CREATE TABLE "email_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"nylas_folder_id" text,
	"external_id" text,
	"name" text NOT NULL,
	"display_name" text,
	"folder_type" text NOT NULL,
	"parent_folder_id" uuid,
	"path" text,
	"total_count" integer DEFAULT 0,
	"unread_count" integer DEFAULT 0,
	"is_system_folder" boolean DEFAULT false,
	"is_sync_enabled" boolean DEFAULT true,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_folders" ADD CONSTRAINT "email_folders_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."email_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_folders_account_id_idx" ON "email_folders" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "email_folders_folder_type_idx" ON "email_folders" USING btree ("folder_type");--> statement-breakpoint
CREATE INDEX "email_folders_nylas_folder_id_idx" ON "email_folders" USING btree ("nylas_folder_id");