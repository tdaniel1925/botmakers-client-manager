# Twilio Buy New Number Feature

## Overview

You can now **search and purchase new Twilio phone numbers** directly from the campaign wizard, without ever leaving your app!

## How It Works

### When Creating a Campaign:

1. **Navigate to the Phone Number Selection step**
2. **Select "Use My Twilio Number"**
3. **Click the "Buy New" button** (next to the Refresh button)

### In the Buy Number Dialog:

1. **Enter an area code** (optional, e.g., "415" for San Francisco)
   - Leave blank to see numbers from any area
2. **Click "Search"** to find available numbers
3. **Browse the results** - up to 20 available numbers will be shown
4. **Click "Buy"** on your preferred number
5. The number is **instantly purchased** and added to your Twilio account
6. The number is **automatically selected** for your campaign
7. You're **ready to continue** with campaign creation!

## Benefits

✅ **No Context Switching** - Stay in your app, no need to visit Twilio dashboard  
✅ **Instant Search** - Find numbers by area code in seconds  
✅ **One-Click Purchase** - Buy numbers with a single click  
✅ **Auto-Selection** - Newly purchased numbers are automatically selected  
✅ **Immediate Use** - Start using your new number right away  

## Features

### Smart Search
- **Area Code Filtering** - Specify 3-digit area codes (e.g., 415, 212, 310)
- **Any Area** - Leave blank to see numbers from all areas
- **Voice Enabled** - Only shows numbers with voice capability
- **Up to 20 Results** - Shows the first 20 available numbers

### Purchase Flow
1. **One-Click Purchase** - Click "Buy" to purchase instantly
2. **Visual Feedback** - Loading spinner shows purchase in progress
3. **Success Notification** - Toast notification confirms purchase
4. **Auto-Refresh** - Number list refreshes to show new number
5. **Auto-Select** - New number is automatically selected for campaign

### User Experience
- **Real-Time Feedback** - Loading states and progress indicators
- **Error Handling** - Clear error messages if something goes wrong
- **Location Info** - Shows city and state for each number
- **Clean UI** - Modern, easy-to-use interface

## Technical Details

### API Calls

**Search Available Numbers:**
```typescript
GET /2010-04-01/Accounts/{AccountSid}/AvailablePhoneNumbers/US/Local.json
  ?VoiceEnabled=true
  &AreaCode=415  // optional
```

**Purchase Number:**
```typescript
POST /2010-04-01/Accounts/{AccountSid}/IncomingPhoneNumbers.json
Body:
  PhoneNumber: +14155551234
  FriendlyName: Campaign Phone Number
```

### Files Modified

1. **`lib/twilio-client.ts`**
   - Added `searchAvailableTwilioNumbers()` - Search for available numbers
   - Added `purchaseTwilioNumber()` - Purchase a specific number

2. **`actions/twilio-actions.ts`**
   - Added `searchTwilioNumbersAction()` - Server action for search
   - Added `purchaseTwilioNumberAction()` - Server action for purchase

3. **`components/voice-campaigns/phone-number-selector.tsx`**
   - Added "Buy New" button next to "Refresh"
   - Added search dialog with area code input
   - Added available numbers list with Buy buttons
   - Added purchase flow with loading states

## Cost Considerations

### Twilio Pricing (as of 2024)
- **US Local Numbers**: ~$1.00/month rental
- **Purchase Fee**: Usually $0-1 one-time fee
- **Voice Minutes**: ~$0.01-0.02 per minute

**Note:** Prices may vary. Check your Twilio pricing page for accurate rates.

### Cost Comparison

**Vapi Managed Numbers:**
- Vapi handles provisioning
- May include markup on Twilio's base price
- Less control over billing

**Buy Your Own (BYO) Twilio:**
- Direct Twilio pricing (no markup)
- Full control over your numbers
- Can manage numbers in Twilio dashboard
- **Usually cheaper in the long run**

## Usage Tips

### Finding Numbers

**For Specific Areas:**
```
Search: 415  → San Francisco, CA numbers
Search: 212  → New York, NY numbers
Search: 310  → Los Angeles, CA numbers
```

**For Any Area:**
```
Search: (leave blank) → Numbers from anywhere
```

### Best Practices

1. **Test Area Codes First** - Search your preferred area code to see availability
2. **Have Backups** - If your preferred area code is unavailable, try nearby codes
3. **Name Your Numbers** - Numbers are auto-labeled "Campaign Phone Number"
4. **Track Your Numbers** - Purchased numbers appear in both your app and Twilio dashboard
5. **Budget Wisely** - Consider monthly rental costs when buying multiple numbers

## Troubleshooting

### "No numbers found"

**Possible Causes:**
1. Area code has no available numbers
2. Area code doesn't exist
3. All numbers in that area are taken

**Solutions:**
- Try a different area code
- Search without area code (leave blank)
- Check Twilio's availability status page

### "Failed to purchase number"

**Possible Causes:**
1. Insufficient Twilio account balance
2. Number was just purchased by someone else
3. Twilio account limits reached

**Solutions:**
- Add funds to your Twilio account
- Try purchasing a different number
- Check your Twilio account limits/quotas

### "Twilio is not configured"

**Solution:**
Add credentials to `.env.local`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
```
Then restart the server.

## Workflow Example

### Complete Campaign Creation with Number Purchase:

1. **Go to Project** → Click "Voice Campaigns"
2. **Click "Create Campaign"**
3. **Select Provider** → Choose "Vapi"
4. **Answer Questions** → Fill out campaign setup
5. **Phone Number Section** → Select "Use My Twilio Number"
6. **Click "Buy New"** → Opens buy dialog
7. **Enter "415"** → Search San Francisco numbers
8. **Click "Search"** → Shows 20 available numbers
9. **Pick a Number** → Click "Buy" on your favorite
10. **Wait 2-3 seconds** → Number is purchased
11. **Auto-Selected!** → Number is now selected
12. **Continue Campaign** → Complete the wizard
13. **Done!** → Campaign is ready with your new number

## FAQ

### Q: How long does it take to purchase a number?

**A:** Usually 2-3 seconds. The purchase is instant once Twilio confirms.

### Q: Can I return a number if I don't like it?

**A:** Yes, you can release numbers in your Twilio dashboard. However, you've already paid the monthly rental fee.

### Q: How many numbers can I buy?

**A:** Depends on your Twilio account limits. Most accounts start with a limit of 5-10 numbers.

### Q: Will I be charged immediately?

**A:** Yes, Twilio bills immediately. You'll see the charge on your Twilio account.

### Q: Can I use the same number for multiple campaigns?

**A:** No, each campaign needs its own unique phone number. However, you can delete a campaign and reuse its number.

### Q: What happens if I run out of Twilio credits?

**A:** The purchase will fail with an error. Add funds to your Twilio account first.

### Q: Can I see my purchased numbers in Twilio?

**A:** Yes! All numbers purchased through this feature appear in your Twilio console under "Phone Numbers" → "Manage" → "Active Numbers".

## Summary

The **Buy New Number** feature makes it incredibly easy to:
- 🔍 **Search** for available Twilio numbers
- 🛒 **Purchase** numbers with one click
- ⚡ **Use immediately** in your campaigns
- 💰 **Save money** by using direct Twilio pricing

No more switching between Twilio dashboard and your app. Everything happens seamlessly within the campaign wizard!

**Ready to try it?** Create a new campaign and click "Buy New" in the phone number section! 🚀
