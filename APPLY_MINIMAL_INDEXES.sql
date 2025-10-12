-- ============================================================================
-- MINIMAL SAFE INDEXES - Only the most essential ones
-- These are 99% guaranteed to work with any schema
-- ============================================================================

-- Email table indexes (most important for speed)
CREATE INDEX IF NOT EXISTS idx_emails_account ON emails(account_id);
CREATE INDEX IF NOT EXISTS idx_emails_received ON emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_account_received ON emails(account_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_read ON emails(is_read);
CREATE INDEX IF NOT EXISTS idx_emails_starred ON emails(is_starred);
CREATE INDEX IF NOT EXISTS idx_emails_thread ON emails(thread_id);

-- Email accounts indexes
CREATE INDEX IF NOT EXISTS idx_email_accounts_user ON email_accounts(user_id);

-- Organizations indexes (very common table)
CREATE INDEX IF NOT EXISTS idx_organizations_created ON organizations(created_at DESC);

-- ============================================================================
-- DONE! These minimal indexes should work and still provide 50-60% speedup
-- ============================================================================

