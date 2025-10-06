-- ✅ FIX BUG-015: Add missing indexes to audit_logs table for query performance
-- audit_logs table is queried frequently by user_id, organization_id, entity_type, and created_at
-- Without indexes, these queries perform full table scans which becomes very slow as logs grow

-- Index on user_id (most common query pattern: "show all actions by this user")
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Composite index on organization_id + created_at (for org-specific audit trails sorted by date)
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs(organization_id, created_at DESC);

-- Index on entity_type + entity_id (for entity-specific audit trails: "show history of this contact")
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Index on action (for filtering by action type: "show all delete actions")
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Index on created_at DESC (for recent activity queries)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
