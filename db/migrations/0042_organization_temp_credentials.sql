-- Add temporary login credentials for organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS temp_username TEXT,
ADD COLUMN IF NOT EXISTS temp_password TEXT,
ADD COLUMN IF NOT EXISTS credentials_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS credentials_used_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS credentials_expires_at TIMESTAMP;
