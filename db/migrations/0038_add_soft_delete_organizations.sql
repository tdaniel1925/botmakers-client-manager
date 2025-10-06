-- ✅ FIX BUG-014: Add soft delete support for organizations
-- Allows recovery of accidentally deleted organizations instead of hard delete
-- Maintains referential integrity while hiding deleted orgs from normal queries

-- Add deleted_at column for soft delete
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS deleted_by TEXT; -- User ID who deleted the organization

-- Add index for filtering out deleted organizations (performance optimization)
CREATE INDEX IF NOT EXISTS idx_organizations_deleted_at ON organizations(deleted_at) 
WHERE deleted_at IS NULL;

-- Add index for finding deleted organizations (admin recovery)
CREATE INDEX IF NOT EXISTS idx_organizations_deleted ON organizations(deleted_at DESC) 
WHERE deleted_at IS NOT NULL;

-- Note: Application queries should filter WHERE deleted_at IS NULL for active orgs
-- Admin recovery views can query WHERE deleted_at IS NOT NULL for deleted orgs
