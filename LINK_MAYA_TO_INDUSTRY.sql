-- Run this SQL after creating the Maya campaign in ClientFlow
-- Replace 'YOUR_MAYA_CAMPAIGN_ID' with the actual campaign ID from ClientFlow

UPDATE quickagent_industries 
SET setup_assistant_campaign_id = 'YOUR_MAYA_CAMPAIGN_ID'
WHERE slug = 'insurance-agents';

-- Verify it worked:
SELECT 
  slug,
  name,
  setup_assistant_campaign_id as maya_campaign_id,
  is_active
FROM quickagent_industries 
WHERE slug = 'insurance-agents';

