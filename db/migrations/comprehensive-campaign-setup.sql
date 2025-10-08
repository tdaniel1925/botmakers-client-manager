-- =========================================================================
-- COMPREHENSIVE VOICE CAMPAIGNS SETUP
-- =========================================================================
-- Date: October 8, 2025
-- Description: Creates all missing enum types and tables for voice campaigns
-- Handles both new and existing voice_campaigns tables
-- =========================================================================

-- ===== 1. CREATE ALL ENUM TYPES =====

-- Voice Provider Enum
DO $$ BEGIN
  CREATE TYPE voice_provider AS ENUM(
    'vapi',
    'autocalls',
    'synthflow',
    'retell'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Campaign Type Enum
DO $$ BEGIN
  CREATE TYPE campaign_type AS ENUM(
    'inbound',
    'outbound',
    'both'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Campaign Status Enum (with pending from start)
DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM(
    'draft',
    'pending',
    'active',
    'paused',
    'completed',
    'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Contact Call Status Enum
DO $$ BEGIN
  CREATE TYPE contact_call_status AS ENUM(
    'pending',
    'queued',
    'calling',
    'completed',
    'failed',
    'no_answer',
    'voicemail',
    'busy',
    'invalid'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ===== 2. ADD MISSING COLUMNS TO VOICE_CAMPAIGNS (if table exists) =====

-- Add schedule_config column if it doesn't exist
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'voice_campaigns') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'voice_campaigns' AND column_name = 'schedule_config') THEN
      ALTER TABLE voice_campaigns ADD COLUMN schedule_config JSONB;
      COMMENT ON COLUMN voice_campaigns.schedule_config IS 'Schedule configuration for outbound campaigns';
    END IF;
  END IF;
END $$;

-- ===== 3. CREATE CAMPAIGN CONTACTS TABLE =====
CREATE TABLE IF NOT EXISTS campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES voice_campaigns(id) ON DELETE CASCADE,

  -- Contact Info
  phone_number TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  company TEXT,

  -- Timezone Info
  area_code TEXT,
  timezone TEXT,
  timezone_offset TEXT,

  -- Custom Fields
  custom_fields JSONB,

  -- Call Status
  call_status contact_call_status NOT NULL DEFAULT 'pending',
  call_attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_attempt_at TIMESTAMP,
  next_attempt_at TIMESTAMP,

  -- Scheduling
  scheduled_for TIMESTAMP,
  best_call_time TEXT,

  -- Results
  call_record_id UUID REFERENCES call_records(id),
  call_outcome TEXT,
  notes TEXT,

  -- Metadata
  upload_batch_id TEXT,
  row_number INTEGER,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign_id ON campaign_contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_call_status ON campaign_contacts(campaign_id, call_status);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_timezone ON campaign_contacts(timezone);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_scheduled ON campaign_contacts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_phone ON campaign_contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_upload_batch ON campaign_contacts(upload_batch_id);

COMMENT ON TABLE campaign_contacts IS 'Contact lists for outbound voice campaigns';

-- ===== 4. CREATE CAMPAIGN CONTACT UPLOADS TABLE =====
CREATE TABLE IF NOT EXISTS campaign_contact_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES voice_campaigns(id) ON DELETE CASCADE,

  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  total_rows INTEGER NOT NULL DEFAULT 0,
  valid_rows INTEGER NOT NULL DEFAULT 0,
  invalid_rows INTEGER NOT NULL DEFAULT 0,
  duplicate_rows INTEGER NOT NULL DEFAULT 0,

  column_mapping JSONB NOT NULL,
  timezone_summary JSONB,

  processing_status TEXT NOT NULL DEFAULT 'pending',
  processing_error TEXT,
  batch_id TEXT NOT NULL,

  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaign_uploads_campaign_id ON campaign_contact_uploads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_uploads_batch_id ON campaign_contact_uploads(batch_id);

COMMENT ON TABLE campaign_contact_uploads IS 'Track CSV/Excel contact list uploads';

-- ===== 5. CREATE CAMPAIGN MESSAGE TEMPLATES TABLE =====
CREATE TABLE IF NOT EXISTS campaign_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES voice_campaigns(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sms_message TEXT,
  email_subject TEXT,
  email_body TEXT,
  trigger_conditions JSONB,
  available_variables TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_by TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_templates_campaign_id ON campaign_message_templates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_project_id ON campaign_message_templates(project_id);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_type ON campaign_message_templates(type);

COMMENT ON TABLE campaign_message_templates IS 'SMS and email templates for campaigns';

-- ===== 6. CREATE CAMPAIGN MESSAGING CONFIG TABLE =====
CREATE TABLE IF NOT EXISTS campaign_messaging_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL UNIQUE REFERENCES voice_campaigns(id) ON DELETE CASCADE,

  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  email_enabled BOOLEAN NOT NULL DEFAULT false,
  sms_template_id UUID REFERENCES campaign_message_templates(id) ON DELETE SET NULL,
  email_template_id UUID REFERENCES campaign_message_templates(id) ON DELETE SET NULL,
  templates JSONB,
  default_send_timing TEXT DEFAULT 'immediately',
  max_messages_per_contact INTEGER DEFAULT 3,
  min_time_between_messages INTEGER DEFAULT 24,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_messaging_campaign_id ON campaign_messaging_config(campaign_id);

COMMENT ON TABLE campaign_messaging_config IS 'Messaging configuration per campaign';

-- ===== 7. CREATE CAMPAIGN MESSAGE LOG TABLE =====
CREATE TABLE IF NOT EXISTS campaign_message_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES voice_campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES campaign_contacts(id) ON DELETE SET NULL,
  template_id UUID REFERENCES campaign_message_templates(id) ON DELETE SET NULL,

  message_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  error_message TEXT,
  provider_id TEXT,
  provider_response JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_message_log_campaign_id ON campaign_message_log(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_message_log_contact_id ON campaign_message_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_message_log_status ON campaign_message_log(status);

COMMENT ON TABLE campaign_message_log IS 'Log of all messages sent from campaigns';

-- ===== 8. ADD UPDATE TRIGGERS =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_campaign_contacts_updated_at ON campaign_contacts;
CREATE TRIGGER update_campaign_contacts_updated_at
    BEFORE UPDATE ON campaign_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaign_message_templates_updated_at ON campaign_message_templates;
CREATE TRIGGER update_campaign_message_templates_updated_at
    BEFORE UPDATE ON campaign_message_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaign_messaging_config_updated_at ON campaign_messaging_config;
CREATE TRIGGER update_campaign_messaging_config_updated_at
    BEFORE UPDATE ON campaign_messaging_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- MIGRATION COMPLETE ✅
-- =========================================================================
-- Created:
--   ✅ All enum types (campaign_status, contact_call_status, etc.)
--   ✅ campaign_contacts table
--   ✅ campaign_contact_uploads table
--   ✅ campaign_message_templates table
--   ✅ campaign_messaging_config table
--   ✅ campaign_message_log table
--   ✅ Added schedule_config to voice_campaigns (if needed)
-- =========================================================================

