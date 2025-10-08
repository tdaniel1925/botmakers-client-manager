-- Add impersonation_sessions table for tracking admin impersonation
CREATE TABLE IF NOT EXISTS impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ip_address TEXT,
  user_agent TEXT,
  reason TEXT,
  actions_log TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_impersonation_admin ON impersonation_sessions(admin_user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_impersonation_org ON impersonation_sessions(organization_id);

-- Add comment
COMMENT ON TABLE impersonation_sessions IS 'Tracks when platform admins impersonate organizations for support/testing purposes';
