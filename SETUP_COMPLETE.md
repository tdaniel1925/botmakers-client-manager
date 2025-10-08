# ✅ Billing System Setup Complete

## What Was Done

### 1. ✅ Database Schema Created
All billing tables have been successfully created in your database:
- `subscription_plans` - Stores plan definitions (Free, Starter, Professional, Enterprise)
- `organization_subscriptions` - Tracks active subscriptions per organization
- `usage_records` - Detailed call-by-call usage tracking
- `invoices` - Monthly invoice records
- `current_subscription_id` column added to `organizations` table

### 2. ✅ Critical Bug Fixed
Fixed the SQL syntax error with `IS NULL` checks in `voice-campaigns-queries.ts`

### 3. ✅ Complete Implementation
All code has been implemented:
- Payment provider interfaces (Stripe fully functional, Square/PayPal stubs ready)
- Usage tracking system with automatic minute counting
- Campaign creation guards with subscription checks
- Call webhook integration for usage recording
- Billing cycle automation scripts
- UI components (UsageMeter, PlanSelector)
- Server actions for subscription management

## Next Steps to Complete Setup

### Step 1: Seed Subscription Plans

You have two options:

**Option A: Via Server Action (Recommended)**
Create a temporary admin page or API route that calls:
```typescript
import { seedSubscriptionPlansAction } from "@/actions/seed-actions";

// In a server component or API route:
const result = await seedSubscriptionPlansAction();
```

**Option B: Manual SQL**
Run this SQL in your database:
```sql
INSERT INTO subscription_plans (name, slug, description, monthly_price, included_minutes, overage_rate_per_minute, max_active_campaigns, max_users, features, display_order) VALUES
('Free', 'free', 'Perfect for trying out AI voice campaigns', 0, 100, 15, 1, 2, '["100 free minutes/month","1 active campaign","Basic analytics","Email support","GPT-4o AI model"]', 1),
('Starter', 'starter', 'Great for small businesses', 9900, 1000, 10, 5, 5, '["1,000 minutes/month","5 active campaigns","Advanced analytics","Priority support","Custom voicemail","GPT-4o AI model","Webhooks"]', 2),
('Professional', 'professional', 'For growing businesses', 29900, 5000, 8, -1, 15, '["5,000 minutes/month","Unlimited campaigns","Real-time analytics","Phone support","Custom integrations","White-label","GPT-4o","Priority provisioning"]', 3),
('Enterprise', 'enterprise', 'Custom enterprise solutions', 99900, 20000, 6, -1, -1, '["20,000 minutes/month","Unlimited everything","Account manager","24/7 support","Custom development","SLA","Custom voice models","Multi-region"]', 4);
```

### Step 2: Migrate Existing Organizations

Run the migration script using the server action or manual SQL:

**Via Server Action:**
```typescript
import { migrateOrgsToFreeTier } from "@/scripts/migrate-orgs-to-free-tier";
// Call from an admin API route
```

**Via Manual SQL:**
```sql
-- Get the Free plan ID
WITH free_plan AS (
  SELECT id FROM subscription_plans WHERE slug = 'free' LIMIT 1
)
-- Create subscriptions for all orgs without one
INSERT INTO organization_subscriptions (
  organization_id,
  plan_id,
  payment_provider,
  status,
  current_period_start,
  current_period_end,
  minutes_used_this_cycle,
  minutes_included_this_cycle,
  overage_minutes_this_cycle,
  overage_cost_this_cycle
)
SELECT 
  o.id,
  (SELECT id FROM free_plan),
  'none',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  0,
  100,
  0,
  0
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM organization_subscriptions 
  WHERE organization_id = o.id
)
AND o.deleted_at IS NULL;

-- Update organizations to reference their subscription
UPDATE organizations o
SET current_subscription_id = s.id
FROM organization_subscriptions s
WHERE s.organization_id = o.id
AND o.current_subscription_id IS NULL;
```

### Step 3: Configure Stripe (for Paid Plans)

1. **Create Products in Stripe Dashboard:**
   - Create a product for each paid plan (Starter, Professional, Enterprise)
   - For each product, create TWO prices:
     a) Standard recurring price (monthly subscription)
     b) Metered usage price (for overage billing)

2. **Update Plans Table with Stripe IDs:**
```sql
UPDATE subscription_plans 
SET 
  stripe_product_id = 'prod_xxx',
  stripe_price_id = 'price_xxx',
  stripe_metered_price_id = 'price_xxx_metered'
WHERE slug = 'starter';
-- Repeat for 'professional' and 'enterprise'
```

3. **Set Up Stripe Webhook:**
   - URL: `https://yourdomain.com/api/webhooks/stripe-billing`
   - Events to subscribe:
     - customer.subscription.created
     - customer.subscription.updated
     - customer.subscription.deleted
     - invoice.payment_succeeded
     - invoice.payment_failed

### Step 4: Set Up Daily Billing Cycle Job

Schedule this to run daily:
```bash
npx tsx lib/cron/billing-cycle-reset.ts
```

Use a cron service like:
- Vercel Cron
- AWS EventBridge
- GitHub Actions scheduled workflow
- Node-cron in your app

## How to Test

### Test 1: Create a Campaign (Subscription Check)
1. Try to create a voice campaign
2. System should check for active subscription
3. Should either succeed (if org has Free tier) or show subscription required error

### Test 2: Make a Test Call (Usage Tracking)
1. Create a campaign with an organization that has a subscription
2. Make a test call via the webhook: `POST /api/webhooks/calls/[token]`
3. Check that:
   - Usage is recorded in `usage_records` table
   - `minutes_used_this_cycle` incremented in `organization_subscriptions`
   - Overage calculated if over limit

### Test 3: View Usage
```typescript
import { getOrganizationUsageStats } from "@/db/queries/billing-queries";

const stats = await getOrganizationUsageStats(organizationId);
console.log(stats);
```

## Monitoring

Check these logs in your terminal:
- `[Campaign] Subscription check passed for org...` - Campaign creation authorized
- `[Usage] Recorded X minutes for org...` - Usage tracking working
- `[Stripe] Updated subscription for org...` - Webhook processing

## Troubleshooting

### "No active subscription found"
**Problem:** Organization doesn't have a subscription record
**Solution:** Run the migration script or manually create a subscription

### "Campaign limit reached"
**Problem:** Organization has reached their plan's campaign limit
**Solution:** Upgrade to a higher tier plan

### Usage not being tracked
**Problem:** Webhook not recording usage
**Solution:** Check that:
1. Campaign has a `webhookId`
2. Project has an `organizationId`
3. Organization has an active subscription

## System is Ready!

Your billing system is now fully implemented and ready for use. The key features:

✅ Multi-tier subscription plans
✅ Automatic usage tracking on every call
✅ Overage billing with Stripe metered billing
✅ Campaign creation guards
✅ 30-day rolling billing cycles
✅ Invoice generation
✅ Multi-payment provider architecture

All that's left is seeding the plans and optionally configuring Stripe for paid subscriptions!
