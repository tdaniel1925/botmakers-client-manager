-- Add missing columns
ALTER TABLE voice_campaigns ADD COLUMN IF NOT EXISTS completed_calls INTEGER DEFAULT 0 NOT NULL;
