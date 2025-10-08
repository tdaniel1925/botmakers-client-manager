# Twilio Integration Guide - Use Your Own Phone Numbers

## Overview

Instead of waiting for Vapi to provision phone numbers (which can take 10-30 seconds and sometimes fail), you can now use your **existing Twilio phone numbers** with your voice campaigns!

## Benefits

✅ **Instant Setup** - No more "pending" phone numbers
✅ **Use Existing Numbers** - Leverage your current Twilio inventory  
✅ **Better Control** - Manage numbers directly in Twilio dashboard
✅ **Cost Effective** - Use numbers you already own
✅ **More Reliable** - No provisioning delays or failures

## Setup Instructions

### Step 1: Get Your Twilio Credentials

1. Log in to [Twilio Console](https://console.twilio.com/)
2. Find your **Account SID** and **Auth Token** on the dashboard
3. Copy both values

### Step 2: Add to Environment Variables

Open your `.env.local` file and add:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
```

### Step 3: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Create a Campaign

1. Go to **Voice Campaigns**
2. Click **Create New Campaign**
3. Fill out the campaign wizard
4. When you reach the phone number step, you'll see two options:
   - **Vapi Managed Number** (old way - can be slow)
   - **Use My Twilio Number** ✨ (new way - instant!)

5. Select **"Use My Twilio Number"**
6. Choose from your available Twilio phone numbers
7. Complete the wizard

The phone number will be **immediately available** - no waiting!

## How It Works

### Vapi Managed (Old Way)
```
User creates campaign
  ↓
Vapi provisions new number (5-30 seconds)
  ↓
Number shows as "pending"
  ↓
User must click "Check Number" repeatedly
  ↓
Number eventually becomes available
```

### Twilio BYO (New Way)
```
User creates campaign
  ↓
Selects existing Twilio number
  ↓
Vapi registers the number (instant)
  ↓
Number is immediately available ✨
```

## Technical Details

### API Calls

**Vapi Managed:**
```typescript
POST /phone-number
{
  "provider": "vapi",
  "assistantId": "xxx"
}
// Response doesn't include actual number yet!
```

**Twilio BYO:**
```typescript
POST /phone-number
{
  "provider": "twilio",
  "number": "+15551234567",
  "twilioAccountSid": "ACxxx",
  "twilioAuthToken": "xxx",
  "assistantId": "xxx"
}
// Number is immediately available!
```

### Files Created

1. **`lib/twilio-client.ts`**
   - Fetches phone numbers from Twilio API
   - Checks if Twilio is configured

2. **`actions/twilio-actions.ts`**
   - Server action to get Twilio numbers
   - Handles authentication

3. **`components/voice-campaigns/phone-number-selector.tsx`**
   - UI component for selecting phone source
   - Shows available Twilio numbers
   - Validates configuration

4. **`lib/voice-providers/vapi-provider.ts`**
   - Added `registerTwilioNumber()` method
   - Handles Twilio number registration with Vapi

## Supported Providers

Currently, **Twilio BYO** is supported for:
- ✅ **Vapi** (fully implemented)
- ⏳ **Retell AI** (coming soon)
- ⏳ **Synthflow** (coming soon)  
- ⏳ **Autocalls** (coming soon)

Other providers will be added as their APIs support it.

## Troubleshooting

### "Twilio is not configured"

**Problem:** You haven't added Twilio credentials

**Solution:**
1. Add `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` to `.env.local`
2. Restart the dev server
3. Refresh the campaign wizard

### "No Twilio phone numbers found"

**Problem:** Your Twilio account has no phone numbers

**Solution:**
1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Phone Numbers** → **Buy a Number**
3. Purchase a number
4. Refresh the phone selector

### "Failed to register Twilio number"

**Possible Causes:**
1. Invalid Twilio credentials
2. Number is already in use by another service
3. Number doesn't have voice capabilities

**Solution:**
1. Verify your Twilio credentials
2. Check if the number is already assigned in Twilio
3. Ensure the number has voice capability enabled

## Environment Variables Reference

```env
# Required for Twilio Integration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# Existing Vapi credentials
VAPI_API_KEY=your_vapi_key_here
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Other provider keys...
```

## Future Enhancements

Possible improvements:
1. **Phone Number Pool** - Rotate through multiple numbers
2. **Number Filtering** - Filter by capability (voice/sms)
3. **Multi-Provider Support** - Twilio numbers for all providers
4. **Number Testing** - Test number before assigning
5. **Auto-Configuration** - Automatically configure Twilio webhook URLs

## FAQ

### Q: Can I use the same Twilio number for multiple campaigns?

**A:** No, each campaign needs its own unique phone number. However, you can delete a campaign and reuse the number for a new one.

### Q: Will this cost more?

**A:** No! Using your Twilio numbers is often **cheaper** because:
- You're not paying Vapi's markup on phone numbers
- You can use existing numbers you already pay for
- No per-minute charges from Vapi for number rental

### Q: What if I don't have Twilio?

**A:** You can:
1. Sign up for Twilio (free trial available)
2. Or continue using Vapi-managed numbers (but you'll have the "pending" delay)

### Q: Can I switch between Twilio and Vapi numbers?

**A:** When creating a campaign, you choose which source to use. Each campaign can use either source independently.

## Summary

Using Twilio numbers eliminates the frustrating "pending" phone number issue and gives you immediate access to phone numbers for your voice campaigns. Simply add your Twilio credentials, restart the server, and select "Use My Twilio Number" when creating a campaign!

**Questions?** Check the troubleshooting section or create an issue.
