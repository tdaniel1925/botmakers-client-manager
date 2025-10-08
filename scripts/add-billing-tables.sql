-- Add Billing Schema Tables
-- Run this SQL script to add billing tables to your database

-- 1. Add current_subscription_id to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS current_subscription_id UUID;

-- 2. Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  monthly_price INTEGER NOT NULL,
  included_minutes INTEGER NOT NULL,
  overage_rate_per_minute INTEGER NOT NULL,
  max_active_campaigns INTEGER DEFAULT -1,
  max_users INTEGER DEFAULT 5,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  stripe_metered_price_id TEXT,
  square_product_id TEXT,
  square_plan_id TEXT,
  paypal_plan_id TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 3. Create organization_subscriptions table
CREATE TABLE IF NOT EXISTS organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  payment_provider TEXT NOT NULL,
  external_subscription_id TEXT,
  external_customer_id TEXT,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  minutes_used_this_cycle INTEGER DEFAULT 0,
  minutes_included_this_cycle INTEGER NOT NULL,
  overage_minutes_this_cycle INTEGER DEFAULT 0,
  overage_cost_this_cycle INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  canceled_at TIMESTAMP
);

-- 4. Create usage_records table
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES organization_subscriptions(id),
  campaign_id UUID REFERENCES voice_campaigns(id),
  call_record_id UUID REFERENCES call_records(id),
  duration_in_seconds INTEGER NOT NULL,
  minutes_used INTEGER NOT NULL,
  cost_in_cents INTEGER NOT NULL,
  was_overage BOOLEAN DEFAULT false,
  rate_per_minute INTEGER NOT NULL,
  billing_period_start TIMESTAMP NOT NULL,
  billing_period_end TIMESTAMP NOT NULL,
  reported_to_provider BOOLEAN DEFAULT false,
  external_usage_record_id TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 5. Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES organization_subscriptions(id),
  invoice_number TEXT NOT NULL UNIQUE,
  subscription_amount INTEGER NOT NULL,
  usage_amount INTEGER DEFAULT 0,
  subtotal INTEGER NOT NULL,
  tax_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  minutes_included INTEGER NOT NULL,
  minutes_used INTEGER NOT NULL,
  overage_minutes INTEGER DEFAULT 0,
  payment_provider TEXT NOT NULL,
  external_invoice_id TEXT,
  status TEXT NOT NULL,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_org_id ON organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_status ON organization_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_records_org_id ON usage_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_subscription_id ON usage_records(subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_created_at ON usage_records(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

SELECT 'Billing tables created successfully!' as message;

