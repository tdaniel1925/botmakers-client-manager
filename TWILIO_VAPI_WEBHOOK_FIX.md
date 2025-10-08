# Twilio + Vapi Webhook Integration Fix

## Problem

When registering an existing Twilio phone number with Vapi, the Twilio number's webhook was still pointing to the old service (e.g., Synthflow). This caused incoming calls to route to the wrong service instead of Vapi.

## Root Cause

When you register a Twilio number with Vapi using their API, Vapi registers the number in their system but **may not automatically update the webhook configuration in your Twilio account**. The Twilio number's "Voice URL" webhook needs to be explicitly updated to point to Vapi's incoming call endpoint.

## Solution Implemented

### 1. New Twilio Helper Functions

Added to `lib/twilio-client.ts`:

- **`getTwilioNumberSid(phoneNumber: string)`**: Gets the Twilio SID for a phone number
- **`updateTwilioNumberWebhook(phoneNumberSid: string, voiceUrl: string, voiceMethod: 'POST' | 'GET')`**: Updates the webhook URL for a Twilio number

### 2. Automatic Webhook Update

Modified `lib/voice-providers/vapi-provider.ts` → `registerTwilioNumber()` method to:

1. Register the number with Vapi (as before)
2. **Automatically get the Twilio number SID**
3. **Automatically update the Twilio webhook** to point to Vapi's endpoint: `https://api.vapi.ai/call/incoming/{phone-number-id}`

## Vapi Webhook URL Format

When a Twilio number is registered with Vapi, the correct webhook URL is:

```
https://api.vapi.ai/call/incoming/{vapi-phone-number-id}
```

Where `{vapi-phone-number-id}` is the `id` returned by Vapi when you register the phone number.

## How to Fix Existing Campaigns

If you have existing campaigns where the Twilio number was already registered but the webhook wasn't updated, you have **two options**:

### Option A: Delete and Recreate the Campaign (Recommended)

1. Delete the existing campaign (this will unregister the number from Vapi)
2. Create a new campaign with the same Twilio number
3. The new automatic webhook update will apply

### Option B: Manually Update in Twilio Console

1. Go to [Twilio Console → Phone Numbers → Manage → Active Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Click on the phone number (e.g., `+14065306330`)
3. Scroll to **"Voice Configuration"** section
4. Under **"A CALL COMES IN"**, update the webhook URL to:
   ```
   https://api.vapi.ai/call/incoming/{vapi-phone-number-id}
   ```
5. Set method to **POST**
6. Click **Save**

To find your Vapi phone number ID:
- Check your campaign creation logs for the `[Vapi] Twilio number registered! Response:` entry
- Or check your Vapi dashboard under Phone Numbers

## Testing the Fix

1. **Create a new campaign** using a Twilio number
2. Watch the logs for:
   ```
   [Vapi] Registering Twilio number: +1234567890
   [Vapi] Twilio number registered! Response: {...}
   [Vapi] Updating Twilio webhook to: https://api.vapi.ai/call/incoming/xxxxx
   [Vapi] ✅ Twilio webhook successfully updated! Calls will now route to Vapi.
   ```
3. **Call the number** - it should now connect to the Vapi agent, not the old service

## Error Handling

If the automatic webhook update fails, you'll see:
```
[Vapi] ❌ Failed to update Twilio webhook: [error details]
[Vapi] Please manually update the webhook in Twilio console to: https://api.vapi.ai/call/incoming/xxxxx
```

In this case, follow **Option B** above to manually update the webhook.

## Prevention

Going forward, **all new campaigns** that use Twilio numbers will automatically have their webhooks updated to point to Vapi. No manual intervention needed!

## New Feature: Verify Phone Webhook Button

A **"Verify Phone Webhook"** button has been added to the Campaign Settings dialog (Advanced tab) for all Vapi campaigns using Twilio numbers.

### How to Use:

1. Open any Vapi campaign with a Twilio number
2. Go to **Campaign Settings** → **Advanced** tab
3. Find the **Phone Number** section
4. Click **"Verify Phone Webhook"** button

### What It Does:

- ✅ **Checks** if the Twilio number is correctly pointing to Vapi
- ✅ **Confirms** with a success message if already correct
- ✅ **Updates** the webhook automatically if it's pointing to the wrong service
- ✅ **Shows** detailed before/after information in the toast notification

### Use This If:

- You suspect calls are routing to the wrong service
- You manually changed something in Twilio console
- You want to verify everything is configured correctly after troubleshooting
- You're experiencing issues with calls not reaching the AI agent

---

**Files Modified:**
- `lib/twilio-client.ts` - Added webhook management functions (`getTwilioNumberDetails`, `getTwilioNumberSid`, `updateTwilioNumberWebhook`)
- `lib/voice-providers/vapi-provider.ts` - Added automatic webhook update logic on registration
- `actions/voice-campaign-actions.ts` - Added `verifyPhoneWebhookAction` server action
- `components/voice-campaigns/campaign-settings-dialog.tsx` - Added "Verify Phone Webhook" button to Advanced tab
