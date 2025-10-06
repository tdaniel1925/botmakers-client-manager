# SMS Notifications - Quick Start Guide

**🚀 Get up and running in 5 minutes**

---

## Step 1: Get Twilio Credentials (2 min)

1. Sign up at [twilio.com](https://www.twilio.com/try-twilio)
2. Note your **Account SID** and **Auth Token** from dashboard
3. Get a phone number: Console → Phone Numbers → Buy a number (~$1/month)

---

## Step 2: Add to Environment (30 sec)

Add to `.env.local`:

```bash
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+15551234567"
```

---

## Step 3: Restart Server (30 sec)

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## Step 4: Test It! (2 min)

1. Go to `http://localhost:3000/platform/settings`
2. Scroll to "SMS Notifications"
3. Toggle **Enable SMS Notifications**
4. Enter your phone: `+1234567890` (with country code!)
5. Click **"Test SMS"**
6. Check your phone! 📱🎉

---

## Step 5: Configure Preferences (1 min)

Select Email/SMS/Both for each notification type:
- Onboarding Invite
- Onboarding Complete
- To-Do Approved
- To-Do Completed
- All To-Dos Complete
- Project Created
- Task Assigned

Click **"Save Preferences"** ✅

---

## That's It! 🎉

SMS notifications are now enabled for your account!

---

## Quick Integration Example

To add SMS to any notification:

```typescript
import { sendNotification } from '@/lib/notification-service';
import { sendEmailFunction } from '@/lib/email-service';
import { sendSMSFunction } from '@/lib/sms-service';

await sendNotification({
  userId: userId,
  type: 'onboarding_complete',
  isPlatformAdmin: true,
  emailFn: () => sendEmailFunction(...),
  smsFn: () => sendSMSFunction(...),
});
```

**See `SMS_INTEGRATION_GUIDE.md` for detailed examples.**

---

## Troubleshooting

**Test SMS not received?**
- ✅ Check phone number has country code (+1, +44, etc.)
- ✅ Verify Twilio credentials are correct
- ✅ Check Twilio account has credit
- ✅ For trial accounts: verify phone in Twilio console

**"SMS service not configured" error?**
- ✅ Restart server after adding environment variables
- ✅ Check all 3 variables are set correctly

---

## Cost

- Phone number: **$1/month**
- SMS (US): **$0.0079/message**
- **Example:** 100 SMS = $0.79

---

## Documentation

- 📖 **SMS_INTEGRATION_GUIDE.md** - Complete guide (600+ lines)
- 📖 **TWILIO_SMS_IMPLEMENTATION_COMPLETE.md** - Implementation summary
- 📖 **SMS_QUICK_START.md** - This file

---

**Questions?** See the full integration guide for detailed examples and troubleshooting.

*Version 1.0 | October 5, 2025*
