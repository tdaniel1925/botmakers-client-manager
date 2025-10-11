-- Add SMS and Email automation settings to voice campaigns
-- Migration: 0042_add_automation_settings
-- Created: 2025-10-10

ALTER TABLE voice_campaigns 
ADD COLUMN IF NOT EXISTS sms_settings JSONB,
ADD COLUMN IF NOT EXISTS email_settings JSONB;

-- Add comments for documentation
COMMENT ON COLUMN voice_campaigns.sms_settings IS 'SMS automation configuration: { followUps: { enabled, template }, notifications: { enabled, template, triggers } }';
COMMENT ON COLUMN voice_campaigns.email_settings IS 'Email automation configuration: { followUps: { enabled, subject, body }, notifications: { enabled, frequency } }';





