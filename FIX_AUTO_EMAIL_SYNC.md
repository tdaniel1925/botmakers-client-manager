# 🔧 Fix: Emails Not Syncing Automatically

## ❌ Problem
New emails are not coming in automatically.

## ✅ Solution (3 Steps)

### **Step 1: Add Environment Variables**

1. Open `codespring-boilerplate/.env.local`
2. Add these two lines:

```bash
# Background Email Sync
CRON_SECRET=k8WHAeF2SO7D3cJwMdZn6gQjLG4hVC9z
NYLAS_WEBHOOK_SECRET=your-nylas-webhook-secret-here
```

3. **Get your Nylas Webhook Secret:**
   - Go to https://dashboard.nylas.com
   - Click "Webhooks" in left menu
   - Copy the webhook secret
   - Replace `your-nylas-webhook-secret-here` with it

### **Step 2: Restart Dev Server**

The server has been restarted automatically. Wait 10 seconds for it to fully start.

### **Step 3: Enable Webhooks for Your Account**

1. Go to http://localhost:3001/platform/emails (or /dashboard/emails)
2. Click the **"Enable Real-time"** button in the sidebar
3. Wait for "✓ Real-time Enabled" to appear

---

## 🧪 **Test It Works**

### **Option 1: Send yourself a test email**

1. Send an email to your connected account from another email
2. Open your email client (http://localhost:3001/platform/emails)
3. Email should appear **instantly** (within 1-2 seconds)

### **Option 2: Manual sync test**

Open a new terminal and run:

```bash
cd "C:\Users\tdani\One World Dropbox\Trent Daniel\1 - App Builds\botmakers-client-manager\codespring-boilerplate"
npm run test:sync
```

Expected output:
```
✅ CRON_SECRET is set
✅ NYLAS_WEBHOOK_SECRET is set
📧 Found 1 active email account(s)
   • Grant ID: ✅
   • Webhook ID: ✅ webhook_123
✅ Cron endpoint is working!
✅ Background sync is ready to use!
```

---

## 🔍 **Check Webhook Status**

### **In Your Email Client:**
Look for this in the sidebar under "Enable Real-time" button:
- ✅ **"✓ Real-time Enabled"** = Webhooks working
- ❌ **Just the button** = Webhooks not set up

### **In Terminal Logs:**
When you send a test email, you should see:
```
Nylas webhook received: message.created
Created new email from webhook: msg_123
✅ Email saved to database
```

---

## ❓ **Troubleshooting**

### **"Enable Real-time" button doesn't work**
- Make sure `NYLAS_WEBHOOK_SECRET` is correct
- Check terminal for error messages
- Try disconnecting and reconnecting your email account

### **Webhook says enabled but emails don't arrive**
- Check Nylas Dashboard → Webhooks → Delivery Logs
- Look for failed deliveries
- Verify webhook URL is: `http://localhost:3001/api/webhooks/nylas` (for local dev)

### **Test sync shows "No active accounts"**
- Connect an email account first
- Go to emails page → "Add Account" → Connect with Nylas

### **Still not working?**
1. Check browser console for errors (F12)
2. Check terminal logs for webhook messages
3. Verify your Nylas account has webhook permissions
4. Try the "Download All Emails" button as a fallback

---

## 📊 **How Background Sync Works**

Once set up, emails sync in **two ways**:

### 1️⃣ **Real-time (Webhooks)** - Instant ⚡
- Nylas sends your server a notification when email arrives
- Email appears in **< 1 second**
- **Requires**: `NYLAS_WEBHOOK_SECRET` + "Enable Real-time" button

### 2️⃣ **Scheduled (Cron)** - Every 15 minutes 🔄
- Automatic backup sync
- Catches any missed emails
- **Requires**: `CRON_SECRET` + deployment to Vercel (or external cron service)
- **Note**: Only works in production, not local dev

**For local development**, you only need webhooks (step 3 above).

---

## ✅ **Next Steps**

After fixing:

1. ✅ Add environment variables to `.env.local`
2. ✅ Dev server restarted automatically
3. ⏳ **Wait 10 seconds** for server to fully start
4. 📧 Click "Enable Real-time" button
5. 🧪 Send yourself a test email
6. 🎉 Email should appear instantly!

---

**Need more help?** Check:
- `BACKGROUND_SYNC_QUICK_START.md` - Quick setup guide
- `BACKGROUND_EMAIL_SYNC_SETUP.md` - Complete documentation


