-- Fix 1: Add missing current_subscription_id column to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS current_subscription_id UUID;

-- Fix 2: Verify billing tables exist (these should have been created by add-billing-tables.sql)
-- If they don't exist, uncomment and run the lines below:

/*
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly INTEGER NOT NULL,
  price_yearly INTEGER,
  free_minutes INTEGER NOT NULL DEFAULT 0,
  per_minute_overage_rate INTEGER NOT NULL,
  max_active_campaigns INTEGER NOT NULL DEFAULT 1,
  features TEXT[] DEFAULT '{}',
  stripe_product_id TEXT,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL,
  provider_subscription_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'trialing',
  billing_cycle TEXT NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  trial_ends_at TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP,
  metadata TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES organization_subscriptions(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES voice_campaigns(id) ON DELETE SET NULL,
  call_record_id UUID REFERENCES call_records(id) ON DELETE SET NULL,
  minutes_used DECIMAL(10,4) NOT NULL,
  cost_in_cents INTEGER NOT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  billing_period_start TIMESTAMP NOT NULL,
  billing_period_end TIMESTAMP NOT NULL,
  provider_usage_record_id TEXT
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES organization_subscriptions(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE,
  amount_due INTEGER NOT NULL,
  amount_paid INTEGER DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  pdf_url TEXT,
  provider_invoice_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
*/

