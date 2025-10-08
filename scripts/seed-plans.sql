-- Seed Subscription Plans
INSERT INTO subscription_plans (
  name, slug, description, price_monthly, price_yearly, free_minutes, 
  per_minute_overage_rate, max_active_campaigns, features, created_at, updated_at
) VALUES
(
  'Free',
  'free',
  'Basic access for testing and small projects',
  0,
  0,
  100,
  10, -- $0.10/min overage
  1,
  ARRAY['1 Active Campaign', '100 Free Minutes/month', 'Basic Analytics', 'Email Support'],
  NOW(),
  NOW()
),
(
  'Starter',
  'starter',
  'Ideal for growing businesses with moderate call volumes',
  9900, -- $99.00
  99000, -- $990.00
  1000,
  8, -- $0.08/min overage
  5,
  ARRAY['5 Active Campaigns', '1,000 Free Minutes/month', 'Advanced Analytics', 'Priority Email Support'],
  NOW(),
  NOW()
),
(
  'Professional',
  'professional',
  'For businesses needing higher capacity and priority support',
  29900, -- $299.00
  299000, -- $2,990.00
  3000,
  6, -- $0.06/min overage
  20,
  ARRAY['20 Active Campaigns', '3,000 Free Minutes/month', 'Advanced Analytics', 'Priority Support'],
  NOW(),
  NOW()
),
(
  'Enterprise',
  'enterprise',
  'Custom solutions for large-scale operations',
  99900, -- $999.00
  999000, -- $9,990.00
  10000,
  4, -- $0.04/min overage
  -1, -- Unlimited
  ARRAY['Unlimited Campaigns', '10,000 Free Minutes/month', 'Dedicated Account Manager', 'SLA'],
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  free_minutes = EXCLUDED.free_minutes,
  per_minute_overage_rate = EXCLUDED.per_minute_overage_rate,
  max_active_campaigns = EXCLUDED.max_active_campaigns,
  features = EXCLUDED.features,
  updated_at = NOW();

