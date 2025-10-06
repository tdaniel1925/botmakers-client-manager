-- Manual Onboarding System
-- Adds fields to track admin-completed onboarding sessions

ALTER TABLE client_onboarding_sessions 
ADD COLUMN IF NOT EXISTS completion_mode TEXT DEFAULT 'client', -- 'client', 'manual', 'hybrid'
ADD COLUMN IF NOT EXISTS completed_by_sections JSONB, -- Track who completed each section
ADD COLUMN IF NOT EXISTS manually_completed_by TEXT, -- Admin user ID who manually completed
ADD COLUMN IF NOT EXISTS manually_completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS finalized_by_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS client_review_requested_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS client_reviewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS client_review_notes TEXT;

-- Add index for completion_mode for faster filtering
CREATE INDEX IF NOT EXISTS idx_sessions_completion_mode ON client_onboarding_sessions(completion_mode);

-- Add index for manually_completed_by for admin attribution queries
CREATE INDEX IF NOT EXISTS idx_sessions_manually_completed_by ON client_onboarding_sessions(manually_completed_by);
