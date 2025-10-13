/**
 * Add AI cache columns to emails table
 * Stores pre-generated AI analysis for instant popup loading
 */

-- Add AI analysis columns to emails table
ALTER TABLE emails ADD COLUMN IF NOT EXISTS ai_quick_replies jsonb;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS ai_smart_actions jsonb;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS ai_generated_at timestamp with time zone;

-- Create index for faster AI cache lookups
CREATE INDEX IF NOT EXISTS idx_emails_ai_generated_at ON emails(ai_generated_at);

-- Comments for documentation
COMMENT ON COLUMN emails.ai_quick_replies IS 'Pre-generated AI quick reply suggestions (array of strings)';
COMMENT ON COLUMN emails.ai_smart_actions IS 'Pre-generated AI smart actions (array of action objects)';
COMMENT ON COLUMN emails.ai_generated_at IS 'Timestamp when AI analysis was generated';


