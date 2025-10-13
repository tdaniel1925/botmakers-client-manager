-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  organization_id UUID,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  subject TEXT,
  body TEXT NOT NULL,
  is_shared TEXT DEFAULT 'false',
  usage_count TEXT DEFAULT '0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);

-- Email Signatures Table
CREATE TABLE IF NOT EXISTS email_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  account_id UUID,
  name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_signatures_user_id ON email_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_email_signatures_account_id ON email_signatures(account_id);
CREATE INDEX IF NOT EXISTS idx_email_signatures_default ON email_signatures(user_id, is_default) WHERE is_default = TRUE;


