# Admin-Free Campaigns Feature

## 🎯 Overview

Platform administrators can now create voice campaigns with two billing types:

1. **Billable to Organization** (default) - Campaign usage is tracked and charged to the organization's subscription
2. **Admin Free** - Campaign is provided free by the platform, no charges or usage tracking

## ✨ Key Benefits

- ✅ **Bypass Billing Restrictions**: Admins can create campaigns without worrying about subscription limits
- ✅ **Free Testing**: Create campaigns for testing, demos, or as gifts to clients
- ✅ **No Usage Tracking**: Admin-free campaigns don't count against minutes or campaign limits
- ✅ **Flexible Business Model**: Offer free campaigns as part of customer support or special promotions

---

## 🏗️ Implementation Details

### 1. Database Schema (`db/schema/voice-campaigns-schema.ts`)

Added `billingType` field to campaigns:

```typescript
billingType: text("billing_type").notNull().default("billable")
// Values: "admin_free" or "billable"
```

### 2. TypeScript Types (`types/voice-campaign-types.ts`)

```typescript
export interface CampaignSetupAnswers {
  // ... existing fields ...
  billing_type?: "admin_free" | "billable"; // Optional, defaults to "billable"
}
```

### 3. Campaign Creation Logic (`actions/voice-campaign-actions.ts`)

**Subscription Checks Bypassed for Admin-Free Campaigns:**

```typescript
const billingType = setupAnswers.billing_type || "billable";
const isAdminFreeCampaign = billingType === "admin_free" && isAdmin;

if (!isAdminFreeCampaign) {
  // Run subscription checks (only for billable campaigns)
  // - Check for active subscription
  // - Check usage limits
  // - Check campaign limits
} else {
  console.log("[Campaign] Admin-free campaign - skipping subscription checks");
}
```

### 4. Usage Tracking (`lib/billing/usage-tracker.ts`)

**Admin-Free Campaigns Skip Billing:**

```typescript
export async function recordCallUsage(...) {
  // Check if campaign is admin-free (skip billing)
  const campaign = await getCampaignById(campaignId);
  
  if (campaign && campaign.billingType === "admin_free") {
    console.log("[Usage Tracker] Skipping usage tracking for admin-free campaign");
    return {
      success: true,
      minutesUsed: 0,
      costInCents: 0,
      wasOverage: false,
      remainingMinutes: 0,
      error: "Admin-free campaign - no billing",
    };
  }
  
  // ... normal billing logic for billable campaigns ...
}
```

### 5. User Interface (`components/voice-campaigns/campaign-questions-form.tsx`)

**Billing Type Selector at Top of Campaign Wizard:**

A prominent blue alert box with two radio options:

- **Billable to Organization** (default)
  - Usage tracked and billed
  - Counts against plan limits
  
- **Admin Free (No Charges)**
  - No usage tracking
  - No billing
  - Doesn't count against limits
  - Platform admin only

---

## 🚀 How to Use

### As a Platform Admin:

1. **Navigate to Voice Campaigns** in platform admin view
2. **Click "Create New Campaign"**
3. **At the top of the setup form**, you'll see the "Campaign Billing Type" selector
4. **Choose your billing type:**
   - **Billable**: Normal campaign with subscription checks
   - **Admin Free**: Bypass all billing restrictions
5. **Complete the rest of the wizard** as normal

### Behavior by Billing Type:

| Feature | Billable Campaign | Admin Free Campaign |
|---------|------------------|---------------------|
| Subscription Required | ✅ Yes | ❌ No |
| Usage Tracking | ✅ Yes | ❌ No |
| Minute Charges | ✅ Yes | ❌ No |
| Campaign Limits | ✅ Applies | ❌ Bypassed |
| Plan Restrictions | ✅ Enforced | ❌ Ignored |

---

## 🗄️ Database Migration

### Migration Files Created:

1. **`scripts/add-billing-type-column.sql`** - SQL to add the column
2. **`scripts/run-billing-type-migration.ts`** - Script to execute migration

### Run Migration:

```bash
cd codespring-boilerplate
npx tsx scripts/run-billing-type-migration.ts
```

### What the Migration Does:

- ✅ Adds `billing_type` column with default `'billable'`
- ✅ Adds check constraint for valid values
- ✅ Updates existing campaigns to `'billable'`
- ✅ Adds documentation comment

### Manual Migration (if needed):

```sql
-- Add column
ALTER TABLE voice_campaigns 
ADD COLUMN billing_type TEXT NOT NULL DEFAULT 'billable';

-- Add constraint
ALTER TABLE voice_campaigns
ADD CONSTRAINT voice_campaigns_billing_type_check 
CHECK (billing_type IN ('admin_free', 'billable'));

-- Update existing records
UPDATE voice_campaigns 
SET billing_type = 'billable' 
WHERE billing_type IS NULL;
```

---

## 🔒 Security & Validation

### Backend Validation:

- ✅ Only platform admins can create campaigns (already enforced)
- ✅ Billing type is validated in campaign creation action
- ✅ If non-admin tries to set `admin_free`, normal subscription checks still apply

### Frontend Behavior:

- The UI shows the billing type selector to all users
- Backend validation ensures only admins can actually create admin-free campaigns
- Non-admins selecting "Admin Free" will still hit subscription errors if they don't have an active plan

---

## 📊 Use Cases

### 1. **Testing & Development**

Create campaigns for testing without worrying about usage limits:

```typescript
{
  campaign_name: "Test Campaign",
  billing_type: "admin_free",
  // ... rest of setup
}
```

### 2. **Customer Support**

Provide free campaigns as part of premium support or to resolve issues.

### 3. **Demos & Marketing**

Create free campaigns for demos, trials, or promotional purposes.

### 4. **Special Partnerships**

Offer complimentary campaigns to strategic partners or beta testers.

---

## 🐛 Troubleshooting

### "No active subscription found" error with Admin Free campaign

**Cause**: You're not logged in as a platform admin.

**Solution**: Only platform admins can create admin-free campaigns. Check your admin status.

### Billing type UI not showing

**Cause**: Component cache issue.

**Solution**: Clear Next.js cache: `rm -rf .next` and restart dev server.

### Migration fails with "password authentication failed"

**Cause**: Database credentials not loaded.

**Solution**: Ensure `.env.local` has correct `DATABASE_URL` and re-run migration.

---

## 📝 Summary of Changes

### Files Modified:

1. ✅ `db/schema/voice-campaigns-schema.ts` - Added `billingType` field
2. ✅ `types/voice-campaign-types.ts` - Added `billing_type` to interface
3. ✅ `actions/voice-campaign-actions.ts` - Skip subscription checks for admin-free
4. ✅ `lib/billing/usage-tracker.ts` - Skip usage tracking for admin-free
5. ✅ `components/voice-campaigns/campaign-questions-form.tsx` - Added UI toggle

### Files Created:

1. ✅ `scripts/add-billing-type-column.sql` - Migration SQL
2. ✅ `scripts/run-billing-type-migration.ts` - Migration script
3. ✅ `ADMIN_FREE_CAMPAIGNS_FEATURE.md` - This documentation

---

## 🎉 Feature Complete!

The admin-free campaigns feature is now fully implemented. Platform admins can:

- ✅ Create campaigns without subscription restrictions
- ✅ Choose billing type for each campaign
- ✅ Provide free campaigns to clients
- ✅ Test without usage limits

**Next Steps:**

1. Run the database migration
2. Restart your dev server
3. Create your first admin-free campaign!

---

## 🤝 Support

If you encounter issues:

1. Check that you're logged in as a platform admin
2. Verify database migration completed successfully
3. Clear `.next` cache and restart dev server
4. Check browser console for client-side errors
5. Check server logs for backend errors

**Happy campaigning! 🚀**
