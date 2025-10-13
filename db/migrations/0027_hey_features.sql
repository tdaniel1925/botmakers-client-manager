/**
 * Hey-Inspired Email Features Migration
 * Adds screening, Imbox/Feed/Paper Trail views, Reply Later, Set Aside, and more
 */

-- Contact Screening Table (Hey's core feature)
CREATE TABLE IF NOT EXISTS contact_screening (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email_address TEXT NOT NULL,
  decision TEXT, -- 'imbox', 'feed', 'paper_trail', 'blocked', 'pending'
  decided_at TIMESTAMP WITH TIME ZONE,
  first_email_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, email_address)
);

CREATE INDEX IF NOT EXISTS idx_contact_screening_user_email ON contact_screening(user_id, email_address);
CREATE INDEX IF NOT EXISTS idx_contact_screening_decision ON contact_screening(user_id, decision);

-- Add Hey-specific columns to emails table
ALTER TABLE emails ADD COLUMN IF NOT EXISTS hey_view TEXT; -- 'imbox', 'feed', 'paper_trail', 'screener'
ALTER TABLE emails ADD COLUMN IF NOT EXISTS hey_category TEXT; -- 'newsletter', 'receipt', 'confirmation', 'important'
ALTER TABLE emails ADD COLUMN IF NOT EXISTS screening_status TEXT DEFAULT 'pending'; -- 'pending', 'screened', 'auto_classified'

-- Reply Later (Enhanced Snooze)
ALTER TABLE emails ADD COLUMN IF NOT EXISTS is_reply_later BOOLEAN DEFAULT FALSE;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS reply_later_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS reply_later_note TEXT;

-- Set Aside (Temporary Holding)
ALTER TABLE emails ADD COLUMN IF NOT EXISTS is_set_aside BOOLEAN DEFAULT FALSE;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS set_aside_at TIMESTAMP WITH TIME ZONE;

-- Bubble Up (Resurface Old Threads)
ALTER TABLE emails ADD COLUMN IF NOT EXISTS is_bubbled_up BOOLEAN DEFAULT FALSE;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS bubbled_up_at TIMESTAMP WITH TIME ZONE;

-- Rename Threads
ALTER TABLE emails ADD COLUMN IF NOT EXISTS custom_subject TEXT; -- User's renamed subject

-- Privacy & Tracking
ALTER TABLE emails ADD COLUMN IF NOT EXISTS trackers_blocked INTEGER DEFAULT 0;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS tracking_stripped BOOLEAN DEFAULT FALSE;

-- Hey Mode User Preferences
CREATE TABLE IF NOT EXISTS user_email_preferences (
  user_id TEXT PRIMARY KEY,
  email_mode TEXT DEFAULT 'traditional', -- 'traditional', 'hey', 'hybrid'
  screening_enabled BOOLEAN DEFAULT FALSE,
  auto_classification_enabled BOOLEAN DEFAULT TRUE,
  privacy_protection_enabled BOOLEAN DEFAULT TRUE,
  keyboard_shortcuts_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_emails_hey_view ON emails(hey_view) WHERE hey_view IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_emails_screening_status ON emails(screening_status);
CREATE INDEX IF NOT EXISTS idx_emails_reply_later ON emails(is_reply_later, reply_later_until) WHERE is_reply_later = TRUE;
CREATE INDEX IF NOT EXISTS idx_emails_set_aside ON emails(is_set_aside, set_aside_at) WHERE is_set_aside = TRUE;
CREATE INDEX IF NOT EXISTS idx_emails_bubbled_up ON emails(is_bubbled_up, bubbled_up_at) WHERE is_bubbled_up = TRUE;

-- Comments for documentation
COMMENT ON TABLE contact_screening IS 'Hey-style email screening - control who reaches your Imbox';
COMMENT ON COLUMN emails.hey_view IS 'Hey view classification: imbox (important), feed (newsletters), paper_trail (receipts)';
COMMENT ON COLUMN emails.is_reply_later IS 'Marked for Reply Later workflow';
COMMENT ON COLUMN emails.is_set_aside IS 'Temporarily set aside (like desk pile)';
COMMENT ON COLUMN emails.is_bubbled_up IS 'Manually resurfaced to top of Imbox';
COMMENT ON COLUMN emails.custom_subject IS 'User-renamed subject line (Hey feature)';


