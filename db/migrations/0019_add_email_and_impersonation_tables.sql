-- Add Email Client and Impersonation Tables
-- This migration adds new tables without modifying existing ones

-- Impersonation Sessions Table
CREATE TABLE IF NOT EXISTS "impersonation_sessions" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
  "admin_user_id" text NOT NULL,
  "admin_email" text NOT NULL,
  "organization_id" text NOT NULL,
  "organization_name" text NOT NULL,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "ended_at" timestamp,
  "is_active" boolean DEFAULT true NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "reason" text,
  "actions_log" jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT "impersonation_sessions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- Email Accounts Table
CREATE TABLE IF NOT EXISTS "email_accounts" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
  "user_id" text NOT NULL,
  "organization_id" text,
  "email_address" text NOT NULL,
  "display_name" text,
  "provider" text NOT NULL,
  "auth_type" text NOT NULL,
  "imap_host" text,
  "imap_port" integer,
  "imap_username" text,
  "imap_password_encrypted" text,
  "imap_tls" boolean DEFAULT true,
  "smtp_host" text,
  "smtp_port" integer,
  "smtp_username" text,
  "smtp_password_encrypted" text,
  "smtp_secure" boolean DEFAULT true,
  "oauth_access_token_encrypted" text,
  "oauth_refresh_token_encrypted" text,
  "oauth_token_expiry" timestamp,
  "oauth_scopes" jsonb,
  "status" text DEFAULT 'pending' NOT NULL,
  "last_sync_at" timestamp,
  "sync_frequency_minutes" integer DEFAULT 15,
  "is_default" boolean DEFAULT false,
  "signature" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "nylas_grant_id" text,
  "error_message" text,
  "sync_cursor" text,
  UNIQUE("user_id", "email_address")
);

-- Add missing columns if table already exists (safe for re-runs)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_accounts') THEN
    -- Add organization_id if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_accounts' AND column_name = 'organization_id') THEN
      ALTER TABLE "email_accounts" ADD COLUMN "organization_id" text;
    END IF;
    -- Add nylas_grant_id if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_accounts' AND column_name = 'nylas_grant_id') THEN
      ALTER TABLE "email_accounts" ADD COLUMN "nylas_grant_id" text;
    END IF;
    -- Add error_message if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_accounts' AND column_name = 'error_message') THEN
      ALTER TABLE "email_accounts" ADD COLUMN "error_message" text;
    END IF;
    -- Add sync_cursor if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_accounts' AND column_name = 'sync_cursor') THEN
      ALTER TABLE "email_accounts" ADD COLUMN "sync_cursor" text;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "email_accounts_user_id_idx" ON "email_accounts"("user_id");
CREATE INDEX IF NOT EXISTS "email_accounts_organization_id_idx" ON "email_accounts"("organization_id");
CREATE INDEX IF NOT EXISTS "email_accounts_status_idx" ON "email_accounts"("status");
CREATE INDEX IF NOT EXISTS "email_accounts_nylas_grant_id_idx" ON "email_accounts"("nylas_grant_id");

-- Email Threads Table
CREATE TABLE IF NOT EXISTS "email_threads" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
  "account_id" text NOT NULL,
  "user_id" text NOT NULL,
  "thread_id" text NOT NULL,
  "subject" text,
  "participants" jsonb NOT NULL,
  "message_count" integer DEFAULT 1,
  "last_message_at" timestamp NOT NULL,
  "is_read" boolean DEFAULT false,
  "is_starred" boolean DEFAULT false,
  "is_archived" boolean DEFAULT false,
  "is_muted" boolean DEFAULT false,
  "snippet" text,
  "labels" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "has_attachments" boolean DEFAULT false,
  "nylas_thread_id" text,
  CONSTRAINT "email_threads_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "email_accounts"("id") ON DELETE CASCADE,
  UNIQUE("account_id", "thread_id")
);

-- Add missing columns if table already exists (safe for re-runs)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_threads') THEN
    -- Add nylas_thread_id if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_threads' AND column_name = 'nylas_thread_id') THEN
      ALTER TABLE "email_threads" ADD COLUMN "nylas_thread_id" text;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "email_threads_account_id_idx" ON "email_threads"("account_id");
CREATE INDEX IF NOT EXISTS "email_threads_user_id_idx" ON "email_threads"("user_id");
CREATE INDEX IF NOT EXISTS "email_threads_last_message_at_idx" ON "email_threads"("last_message_at");
CREATE INDEX IF NOT EXISTS "email_threads_nylas_thread_id_idx" ON "email_threads"("nylas_thread_id");

-- Emails Table
CREATE TABLE IF NOT EXISTS "emails" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
  "account_id" text NOT NULL,
  "user_id" text NOT NULL,
  "thread_id" text,
  "message_id" text NOT NULL,
  "in_reply_to" text,
  "references" text[],
  "subject" text,
  "snippet" text,
  "from_address" jsonb NOT NULL,
  "to_addresses" jsonb NOT NULL,
  "cc_addresses" jsonb DEFAULT '[]'::jsonb,
  "bcc_addresses" jsonb DEFAULT '[]'::jsonb,
  "reply_to_addresses" jsonb DEFAULT '[]'::jsonb,
  "body_text" text,
  "body_html" text,
  "sent_at" timestamp,
  "received_at" timestamp NOT NULL,
  "is_read" boolean DEFAULT false,
  "is_starred" boolean DEFAULT false,
  "is_draft" boolean DEFAULT false,
  "is_sent" boolean DEFAULT false,
  "is_trash" boolean DEFAULT false,
  "is_archived" boolean DEFAULT false,
  "is_spam" boolean DEFAULT false,
  "has_attachments" boolean DEFAULT false,
  "folder_name" text,
  "label_ids" jsonb DEFAULT '[]'::jsonb,
  "raw_headers" jsonb,
  "priority" integer DEFAULT 0,
  "read_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "nylas_message_id" text,
  "size_bytes" integer,
  "is_important" boolean DEFAULT false,
  "is_unsubscribed" boolean DEFAULT false,
  "conversation_id" text,
  "scheduled_send_at" timestamp,
  "sent_by_scheduled_send" boolean DEFAULT false,
  CONSTRAINT "emails_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "email_accounts"("id") ON DELETE CASCADE,
  CONSTRAINT "emails_thread_id_email_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "email_threads"("id") ON DELETE SET NULL,
  UNIQUE("account_id", "message_id")
);

-- Add missing columns if table already exists (safe for re-runs)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'emails') THEN
    -- Add nylas_message_id if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'emails' AND column_name = 'nylas_message_id') THEN
      ALTER TABLE "emails" ADD COLUMN "nylas_message_id" text;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "emails_account_id_idx" ON "emails"("account_id");
CREATE INDEX IF NOT EXISTS "emails_user_id_idx" ON "emails"("user_id");
CREATE INDEX IF NOT EXISTS "emails_thread_id_idx" ON "emails"("thread_id");
CREATE INDEX IF NOT EXISTS "emails_received_at_idx" ON "emails"("received_at");
CREATE INDEX IF NOT EXISTS "emails_is_read_idx" ON "emails"("is_read");
CREATE INDEX IF NOT EXISTS "emails_folder_name_idx" ON "emails"("folder_name");
CREATE INDEX IF NOT EXISTS "emails_is_draft_idx" ON "emails"("is_draft");
CREATE INDEX IF NOT EXISTS "emails_nylas_message_id_idx" ON "emails"("nylas_message_id");

-- Email Attachments Table
CREATE TABLE IF NOT EXISTS "email_attachments" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
  "email_id" text NOT NULL,
  "filename" text NOT NULL,
  "content_type" text NOT NULL,
  "size_bytes" integer NOT NULL,
  "content_id" text,
  "is_inline" boolean DEFAULT false,
  "download_url" text,
  "file_path" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "email_attachments_email_id_emails_id_fk" FOREIGN KEY ("email_id") REFERENCES "emails"("id") ON DELETE CASCADE
);

-- Add missing columns if table already exists (safe for re-runs)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_attachments') THEN
    -- Add content_type if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_attachments' AND column_name = 'content_type') THEN
      ALTER TABLE "email_attachments" ADD COLUMN "content_type" text NOT NULL DEFAULT 'application/octet-stream';
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "email_attachments_email_id_idx" ON "email_attachments"("email_id");
CREATE INDEX IF NOT EXISTS "email_attachments_content_type_idx" ON "email_attachments"("content_type");

-- Email Labels Table
CREATE TABLE IF NOT EXISTS "email_labels" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
  "account_id" text NOT NULL,
  "name" text NOT NULL,
  "color" text,
  "is_system" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "email_labels_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "email_accounts"("id") ON DELETE CASCADE,
  UNIQUE("account_id", "name")
);

-- Add missing columns if table already exists (safe for re-runs)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_labels') THEN
    -- Add is_system if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_labels' AND column_name = 'is_system') THEN
      ALTER TABLE "email_labels" ADD COLUMN "is_system" boolean DEFAULT false;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "email_labels_account_id_idx" ON "email_labels"("account_id");
CREATE INDEX IF NOT EXISTS "email_labels_name_idx" ON "email_labels"("name");
CREATE INDEX IF NOT EXISTS "email_labels_is_system_idx" ON "email_labels"("is_system");

-- Email Sync Logs Table
CREATE TABLE IF NOT EXISTS "email_sync_logs" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
  "account_id" text NOT NULL,
  "sync_started_at" timestamp DEFAULT now() NOT NULL,
  "sync_ended_at" timestamp,
  "status" text NOT NULL,
  "emails_synced" integer DEFAULT 0,
  "emails_failed" integer DEFAULT 0,
  "error_message" text,
  "sync_cursor" text,
  "sync_type" text DEFAULT 'full',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "duration_ms" integer,
  "last_message_date" timestamp,
  "provider_response" jsonb,
  CONSTRAINT "email_sync_logs_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "email_accounts"("id") ON DELETE CASCADE
);

-- Add missing columns if table already exists (safe for re-runs)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_sync_logs') THEN
    -- Add sync_started_at if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_sync_logs' AND column_name = 'sync_started_at') THEN
      ALTER TABLE "email_sync_logs" ADD COLUMN "sync_started_at" timestamp DEFAULT now() NOT NULL;
    END IF;
    -- Add sync_ended_at if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_sync_logs' AND column_name = 'sync_ended_at') THEN
      ALTER TABLE "email_sync_logs" ADD COLUMN "sync_ended_at" timestamp;
    END IF;
    -- Add status if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_sync_logs' AND column_name = 'status') THEN
      ALTER TABLE "email_sync_logs" ADD COLUMN "status" text NOT NULL DEFAULT 'pending';
    END IF;
    -- Add sync_type if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_sync_logs' AND column_name = 'sync_type') THEN
      ALTER TABLE "email_sync_logs" ADD COLUMN "sync_type" text DEFAULT 'full';
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "email_sync_logs_account_id_idx" ON "email_sync_logs"("account_id");
CREATE INDEX IF NOT EXISTS "email_sync_logs_status_idx" ON "email_sync_logs"("status");
CREATE INDEX IF NOT EXISTS "email_sync_logs_sync_started_at_idx" ON "email_sync_logs"("sync_started_at");
CREATE INDEX IF NOT EXISTS "email_sync_logs_sync_type_idx" ON "email_sync_logs"("sync_type");

-- Email Drafts Table
CREATE TABLE IF NOT EXISTS "email_drafts" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
  "account_id" text NOT NULL,
  "user_id" text NOT NULL,
  "thread_id" text,
  "in_reply_to" text,
  "subject" text,
  "to_addresses" jsonb DEFAULT '[]'::jsonb,
  "cc_addresses" jsonb DEFAULT '[]'::jsonb,
  "bcc_addresses" jsonb DEFAULT '[]'::jsonb,
  "body_html" text,
  "body_text" text,
  "attachments" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "scheduled_send_at" timestamp,
  "is_template" boolean DEFAULT false,
  "template_name" text,
  CONSTRAINT "email_drafts_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "email_accounts"("id") ON DELETE CASCADE,
  CONSTRAINT "email_drafts_thread_id_email_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "email_threads"("id") ON DELETE SET NULL
);

-- Add missing columns if table already exists (safe for re-runs)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_drafts') THEN
    -- Add updated_at if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_drafts' AND column_name = 'updated_at') THEN
      ALTER TABLE "email_drafts" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;
    END IF;
    -- Add scheduled_send_at if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_drafts' AND column_name = 'scheduled_send_at') THEN
      ALTER TABLE "email_drafts" ADD COLUMN "scheduled_send_at" timestamp;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "email_drafts_account_id_idx" ON "email_drafts"("account_id");
CREATE INDEX IF NOT EXISTS "email_drafts_user_id_idx" ON "email_drafts"("user_id");
CREATE INDEX IF NOT EXISTS "email_drafts_thread_id_idx" ON "email_drafts"("thread_id");
CREATE INDEX IF NOT EXISTS "email_drafts_updated_at_idx" ON "email_drafts"("updated_at");
CREATE INDEX IF NOT EXISTS "email_drafts_scheduled_send_at_idx" ON "email_drafts"("scheduled_send_at");

-- Email AI Summaries Table
CREATE TABLE IF NOT EXISTS "email_ai_summaries" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
  "email_id" text,
  "thread_id" text,
  "summary_type" text NOT NULL,
  "summary_text" text NOT NULL,
  "key_points" jsonb DEFAULT '[]'::jsonb,
  "sentiment" text,
  "action_items" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "email_ai_summaries_email_id_emails_id_fk" FOREIGN KEY ("email_id") REFERENCES "emails"("id") ON DELETE CASCADE,
  CONSTRAINT "email_ai_summaries_thread_id_email_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "email_threads"("id") ON DELETE CASCADE
);

-- Add missing columns if table already exists (safe for re-runs)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_ai_summaries') THEN
    -- Add summary_type if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_ai_summaries' AND column_name = 'summary_type') THEN
      ALTER TABLE "email_ai_summaries" ADD COLUMN "summary_type" text NOT NULL DEFAULT 'general';
    END IF;
    -- Add created_at if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_ai_summaries' AND column_name = 'created_at') THEN
      ALTER TABLE "email_ai_summaries" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "email_ai_summaries_email_id_idx" ON "email_ai_summaries"("email_id");
CREATE INDEX IF NOT EXISTS "email_ai_summaries_thread_id_idx" ON "email_ai_summaries"("thread_id");
CREATE INDEX IF NOT EXISTS "email_ai_summaries_summary_type_idx" ON "email_ai_summaries"("summary_type");
CREATE INDEX IF NOT EXISTS "email_ai_summaries_created_at_idx" ON "email_ai_summaries"("created_at");

-- Scheduled Emails Table
CREATE TABLE IF NOT EXISTS "scheduled_emails" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
  "account_id" text NOT NULL,
  "user_id" text NOT NULL,
  "scheduled_for" timestamp NOT NULL,
  "to_addresses" jsonb NOT NULL,
  "cc_addresses" jsonb DEFAULT '[]'::jsonb,
  "bcc_addresses" jsonb DEFAULT '[]'::jsonb,
  "subject" text NOT NULL,
  "body_html" text,
  "body_text" text,
  "attachments" jsonb DEFAULT '[]'::jsonb,
  "status" text DEFAULT 'pending' NOT NULL,
  "sent_at" timestamp,
  "error_message" text,
  "thread_id" text,
  "in_reply_to" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "retry_count" integer DEFAULT 0,
  "last_retry_at" timestamp
);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS "email_templates" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
  "user_id" text NOT NULL,
  "organization_id" text,
  "name" text NOT NULL,
  "subject" text NOT NULL,
  "body_html" text,
  "body_text" text,
  "variables" jsonb DEFAULT '[]'::jsonb,
  "is_shared" boolean DEFAULT false,
  "category" text,
  "tags" jsonb DEFAULT '[]'::jsonb,
  "use_count" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "last_used_at" timestamp,
  "description" text
);

