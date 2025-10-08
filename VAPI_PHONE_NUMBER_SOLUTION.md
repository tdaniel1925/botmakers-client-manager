# Vapi Phone Number "Pending" Solution

## Problem

When creating a Vapi voice campaign, the phone number shows as **"pending"** instead of an actual phone number.

### Why This Happens

Vapi's phone number provisioning is **asynchronous**:

1. When you request a phone number via `POST /phone-number`, Vapi returns immediately with an ID
2. The actual phone number assignment happens in the background
3. It typically takes **5-30 seconds** for Vapi to provision and assign the number
4. The initial response and even immediate GET requests return without the `number` field

## Solution Implemented

### ✅ Refresh Button System

A **"Check Number"** button now appears on any campaign with a pending phone number:

- **Automatic Detection**: Shows only when `phoneNumber === "pending"`
- **Visual Feedback**: Spinning icon while checking
- **Toast Notifications**: Success, pending, or error messages
- **Auto-Refresh**: Updates the campaign list when number is ready

### How It Works

1. **User creates campaign** → Phone number ID saved as "pending"
2. **Wait 10-20 seconds** for Vapi to provision
3. **Click "Check Number"** button on campaign card
4. **System queries Vapi** for updated phone number status
5. **If ready**: Updates database and shows success toast
6. **If still pending**: Shows info message to wait longer
7. **If error**: Shows error toast

## Files Created/Updated

### New Files

**`actions/voice-campaign-refresh-actions.ts`**
- Server action to refresh phone number status from Vapi
- Queries Vapi API: `GET /phone-number/{id}`
- Updates database when number is ready
- Returns status to UI

### Updated Files

**`components/voice-campaigns/campaigns-list.tsx`**
- Added refresh button overlay on pending campaigns
- Integrated toast notifications
- Loading states and spinning icons
- Auto-refreshes list after update

**`app/layout.tsx`**
- Added Sonner toast provider
- Enables toast notifications app-wide

## Usage Guide

### For Users

1. **Create a Vapi Campaign**
   - Go to platform/dashboard → Projects → Voice Campaigns
   - Click "Create New Campaign"
   - Fill out the wizard

2. **Wait for Phone Number**
   - Campaign is created with "pending" phone number
   - **Wait 10-30 seconds** (Vapi provisioning time)

3. **Check Number Status**
   - You'll see a **"Check Number"** button on the campaign card
   - Click the button to query Vapi
   - Watch the spinning icon

4. **Results**
   - ✅ **Success**: Phone number updates automatically
   - ℹ️ **Still Pending**: Wait a bit longer and try again
   - ❌ **Error**: Check logs or contact support

### For Developers

#### Refresh Action

```typescript
import { refreshCampaignPhoneNumberAction } from "@/actions/voice-campaign-refresh-actions";

const result = await refreshCampaignPhoneNumberAction(campaignId);

if (result.isSuccess) {
  console.log("Phone number:", result.phoneNumber);
}
```

#### Button Implementation

```tsx
{campaign.phoneNumber === "pending" && (
  <Button
    onClick={() => handleRefreshPhoneNumber(campaign.id)}
    disabled={refreshingId === campaign.id}
  >
    <RefreshCw className={refreshingId === campaign.id ? 'animate-spin' : ''} />
    Check Number
  </Button>
)}
```

## API Flow

### Initial Creation

```
1. POST /assistant (Create AI agent)
   ↓
2. POST /phone-number { assistantId, provider: "vapi" }
   ← Returns: { id: "xxx", status: "active" } (NO NUMBER YET!)
   ↓
3. GET /phone-number/{id}
   ← Returns: { id: "xxx", status: "active" } (STILL NO NUMBER)
   ↓
4. Save to database with phoneNumber = "pending"
```

### Refresh Flow

```
1. User clicks "Check Number" button
   ↓
2. GET /phone-number/{id}
   ↓
3. If number exists:
   ← { id: "xxx", number: "+1234567890", status: "active" }
   Update database
   Show success toast
   ↓
4. If still pending:
   ← { id: "xxx", status: "active" } (no number field)
   Show info toast "Please wait and try again"
```

## Technical Details

### Why Immediate Fetch Doesn't Work

Even though the code tries to fetch the phone number immediately after creation:

```typescript
// This doesn't work because Vapi hasn't assigned the number yet
const response = await this.makeRequest<any>("/phone-number", { ... });
const phoneDetails = await this.makeRequest<any>(`/phone-number/${response.id}`);
// phoneDetails.number is still undefined!
```

The number simply isn't ready yet. Vapi needs time to:
1. Request number from their provider (Twilio, etc.)
2. Configure routing rules
3. Link to assistant
4. Update their database

### Polling vs Refresh Button

We chose **manual refresh button** over **auto-polling** because:

✅ **Better UX**: User controls when to check
✅ **No wasted API calls**: Only checks when user wants
✅ **Clear feedback**: User knows when they're checking
✅ **Simple implementation**: No background jobs needed

If you want auto-polling, you could:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    if (campaign.phoneNumber === "pending") {
      handleRefreshPhoneNumber(campaign.id);
    }
  }, 10000); // Check every 10 seconds
  
  return () => clearInterval(interval);
}, [campaign]);
```

## Troubleshooting

### Phone Number Never Updates

**Possible Causes:**
1. Vapi API key is invalid
2. Vapi account has no credits
3. Requested area code not available
4. Vapi service issue

**Solutions:**
- Check Vapi dashboard for phone number status
- Verify API key in `.env.local`
- Try without specifying area code
- Check Vapi status page

### "Check Number" Button Not Showing

**Possible Causes:**
1. Phone number is not "pending" (check database)
2. Component not re-rendering

**Solutions:**
- Check database: `SELECT phone_number FROM voice_campaigns WHERE id = '...'`
- Refresh page to reload campaigns
- Check console for errors

### Error: "Failed to refresh phone number"

**Possible Causes:**
1. Campaign not found in database
2. Vapi API error
3. Network issue

**Solutions:**
- Check browser console for detailed error
- Check server logs for API error messages
- Verify campaign exists in database

## Future Enhancements

Possible improvements:

1. **Auto-Polling**: Automatically check every 10 seconds until ready
2. **Webhook**: Vapi callback when number is ready
3. **Status Badge**: Show "Provisioning..." badge with progress
4. **Bulk Refresh**: Check all pending numbers at once
5. **Notifications**: Email/SMS when number is ready

## Summary

The "pending" phone number issue is a normal part of Vapi's asynchronous provisioning process. The refresh button solution provides a simple, user-friendly way to check when the number is ready, without over-complicating the system with auto-polling or webhooks.

**Expected Timing:**
- Campaign creation: ~15-20 seconds (includes AI generation, webhook, agent)
- Phone number provisioning: Additional 5-30 seconds
- **Total wait time**: ~20-50 seconds before number is ready

**User Experience:**
1. Create campaign → Shows "pending"
2. Wait ~30 seconds
3. Click "Check Number"
4. ✅ Number appears!
