-- Add billing_type column to voice_campaigns table
-- This allows admins to mark campaigns as "admin_free" (not billed) or "billable" (billed to org)

-- Add the column with default value
ALTER TABLE voice_campaigns 
ADD COLUMN IF NOT EXISTS billing_type TEXT NOT NULL DEFAULT 'billable';

-- Add a check constraint to ensure only valid values
ALTER TABLE voice_campaigns
ADD CONSTRAINT voice_campaigns_billing_type_check 
CHECK (billing_type IN ('admin_free', 'billable'));

-- Add comment for documentation
COMMENT ON COLUMN voice_campaigns.billing_type IS 'Billing type: "admin_free" (platform provides free) or "billable" (charged to organization)';

-- Update existing campaigns to billable (safe default)
UPDATE voice_campaigns 
SET billing_type = 'billable' 
WHERE billing_type IS NULL;
