-- ✅ FIX BUG-008: Add unique constraint to prevent duplicate project names
-- within the same organization

-- Create unique index on organization_id + LOWER(name) 
-- This prevents duplicates regardless of case sensitivity
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_org_name_unique 
ON projects(organization_id, LOWER(name));

-- Add index comment for documentation
COMMENT ON INDEX idx_projects_org_name_unique IS 
'Ensures project names are unique within each organization (case-insensitive)';
