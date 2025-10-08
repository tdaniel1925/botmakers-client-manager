-- Fix Campaign Status Check Constraint
-- Drop the old constraint and let the enum type handle validation

-- Drop the existing check constraint
ALTER TABLE voice_campaigns DROP CONSTRAINT IF EXISTS voice_campaigns_status_check;

-- The enum type itself will enforce valid values, so we don't need a separate check constraint
-- But if you want to add it back with the correct values, uncomment below:

-- ALTER TABLE voice_campaigns ADD CONSTRAINT voice_campaigns_status_check 
-- CHECK (status IN ('draft', 'pending', 'active', 'paused', 'completed', 'failed'));

