-- Create branding settings table
CREATE TABLE IF NOT EXISTS branding_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID, -- NULL for platform-wide branding
  
  -- Logo URLs
  logo_url TEXT,
  logo_dark_url TEXT, -- For dark backgrounds
  favicon_url TEXT,
  
  -- Brand Colors
  primary_color TEXT DEFAULT '#00ff00', -- Neon green
  secondary_color TEXT DEFAULT '#000000', -- Black
  accent_color TEXT DEFAULT '#00ff00', -- Neon green accent
  text_color TEXT DEFAULT '#000000', -- Black text
  background_color TEXT DEFAULT '#ffffff', -- White background
  
  -- Company Information
  company_name TEXT DEFAULT 'Botmakers',
  company_address TEXT,
  company_phone TEXT,
  company_email TEXT,
  support_email TEXT DEFAULT 'support@botmakers.com',
  
  -- Social Links
  twitter_url TEXT,
  linkedin_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  website_url TEXT DEFAULT 'https://botmakers.com',
  
  -- Email Settings
  email_from_name TEXT DEFAULT 'Botmakers',
  email_footer_text TEXT,
  
  -- Feature Flags
  show_logo_in_emails BOOLEAN DEFAULT TRUE,
  show_social_links BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique constraint: one branding per org (or one platform-wide if org_id is NULL)
  UNIQUE(organization_id)
);

-- Create index for faster lookups
CREATE INDEX idx_branding_settings_org ON branding_settings(organization_id);

-- Insert default platform branding
INSERT INTO branding_settings (
  organization_id,
  company_name,
  primary_color,
  secondary_color,
  accent_color,
  text_color,
  background_color,
  company_address,
  support_email,
  website_url
) VALUES (
  NULL, -- Platform-wide
  'Botmakers',
  '#00ff00', -- Neon green
  '#000000', -- Black
  '#00ff00', -- Neon green accent
  '#000000', -- Black text
  '#ffffff', -- White background
  '123 Main Street, Suite 100, City, State 12345',
  'support@botmakers.com',
  'https://botmakers.com'
) ON CONFLICT DO NOTHING;
