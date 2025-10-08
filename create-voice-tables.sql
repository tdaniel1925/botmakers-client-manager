-- Create voice campaigns tables
-- Run this if migration fails

CREATE TABLE IF NOT EXISTS voice_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  webhook_id UUID REFERENCES project_webhooks(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('inbound', 'outbound', 'both')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  
  provider TEXT NOT NULL,
  provider_assistant_id TEXT UNIQUE,
  provider_phone_number_id TEXT,
  provider_config JSONB,
  
  phone_number TEXT UNIQUE,
  twilio_phone_number_sid TEXT,
  
  setup_answers JSONB NOT NULL,
  ai_generated_config JSONB,
  
  system_prompt TEXT,
  first_message TEXT,
  voicemail_message TEXT,
  agent_personality TEXT,
  campaign_goal TEXT,
  
  total_calls INTEGER DEFAULT 0 NOT NULL,
  successful_calls INTEGER DEFAULT 0 NOT NULL,
  failed_calls INTEGER DEFAULT 0 NOT NULL,
  average_call_duration INTEGER,
  total_cost INTEGER DEFAULT 0 NOT NULL,
  last_call_at TIMESTAMP,
  
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_voice_campaigns_project ON voice_campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_voice_campaigns_status ON voice_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_voice_campaigns_provider_assistant ON voice_campaigns(provider_assistant_id);
CREATE INDEX IF NOT EXISTS idx_voice_campaigns_phone_number ON voice_campaigns(phone_number);

-- Optional: metadata table for provider-specific data
CREATE TABLE IF NOT EXISTS campaign_provider_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES voice_campaigns(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_campaign_provider_metadata_campaign ON campaign_provider_metadata(campaign_id);
