-- Add client information fields to projects table
-- Needed for manual onboarding to send review emails

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Add index for faster client email lookups
CREATE INDEX IF NOT EXISTS idx_projects_client_email ON projects(client_email);
