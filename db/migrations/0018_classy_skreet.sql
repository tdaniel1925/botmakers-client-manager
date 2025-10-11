ALTER TABLE "voice_campaigns" ADD COLUMN "sms_settings" jsonb;--> statement-breakpoint
ALTER TABLE "voice_campaigns" ADD COLUMN "email_settings" jsonb;--> statement-breakpoint
ALTER TABLE "email_accounts" ADD COLUMN "nylas_grant_id" text;--> statement-breakpoint
ALTER TABLE "email_threads" ADD COLUMN "nylas_thread_id" text;--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "nylas_message_id" text;--> statement-breakpoint
CREATE INDEX "email_accounts_nylas_grant_id_idx" ON "email_accounts" USING btree ("nylas_grant_id");--> statement-breakpoint
CREATE INDEX "email_threads_nylas_thread_id_idx" ON "email_threads" USING btree ("nylas_thread_id");--> statement-breakpoint
CREATE INDEX "emails_nylas_message_id_idx" ON "emails" USING btree ("nylas_message_id");