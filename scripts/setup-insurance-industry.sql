-- Simple SQL script to create the insurance industry record
-- Run this if you prefer not to use the TypeScript setup script

INSERT INTO quickagent_industries (
  slug,
  name,
  description,
  tagline,
  is_active,
  config,
  created_at,
  updated_at
) VALUES (
  'insurance-agents',
  'QuickAgent for Insurance Agents',
  'AI-powered lead qualification for life insurance agents. Automatically screen and qualify potential customers 24/7.',
  'Build Your Lead Qualification Agent in 5 Minutes',
  true,
  '{
    "setupQuestions": [
      {"id": "agent_name", "question": "What''s your name?"},
      {"id": "agency_name", "question": "What''s your agency name?"},
      {"id": "product_types", "question": "What types of life insurance do you sell?"},
      {"id": "ideal_customer_age", "question": "What age range are your ideal customers?"},
      {"id": "income_threshold", "question": "What''s the minimum annual income you look for?"},
      {"id": "qualifying_questions", "question": "What questions should I ask to qualify leads?"}
    ],
    "builtAgentPurpose": "Lead qualification for life insurance",
    "builtAgentType": "both"
  }',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tagline = EXCLUDED.tagline,
  config = EXCLUDED.config,
  updated_at = NOW();

