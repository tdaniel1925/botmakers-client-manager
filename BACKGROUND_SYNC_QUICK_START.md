# 🚀 Background Email Sync - Quick Start

Get your automatic email sync running in **5 minutes**!

---

## 📋 Prerequisites

- Email account connected via Nylas
- App running locally or deployed

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Add Environment Variables

Add to your `.env.local`:

```bash
# Generate a secure random 32-character string
CRON_SECRET=your-random-32-character-secret-here

# Get from Nylas Dashboard → Webhooks
NYLAS_WEBHOOK_SECRET=your-nylas-webhook-secret
```

**Generate `CRON_SECRET`:**
```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### Step 2: Test Locally

```bash
# Start the server
npm run dev

# In another terminal, test the sync
npm run test:sync
```

**Expected output:**
```
✅ CRON_SECRET is set
✅ NYLAS_WEBHOOK_SECRET is set
📧 Found 1 active email account(s)
✅ Cron endpoint is working!
✅ Background sync is ready to use!
```

### Step 3: Deploy (Vercel)

```bash
# Deploy to production
vercel deploy --prod

# Add environment variables in Vercel Dashboard:
# Settings → Environment Variables
# - CRON_SECRET
# - NYLAS_WEBHOOK_SECRET
```

**That's it!** 🎉

---

## 🧪 Verify It's Working

### Test Real-time Sync (Webhooks)

1. Send yourself an email
2. Open your email client
3. Email should appear **instantly** (< 1 second)

### Test Scheduled Sync (Cron)

```bash
# Trigger manually
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3001/api/cron/sync-emails

# Or in production
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/sync-emails
```

**Expected response:**
```json
{
  "success": true,
  "duration": 1234,
  "total": 1,
  "successful": 1,
  "failed": 0
}
```

---

## 📊 What Happens Now?

### ⚡ Real-time (Webhooks)
- **New emails arrive instantly** (< 1 second)
- Works 24/7 without client open
- Automatic setup when connecting accounts

### 🔄 Scheduled (Cron Jobs)
- **Syncs every 15 minutes** automatically
- Catches any missed emails
- Runs on Vercel (or your platform)

### 💾 Always Synced
- **Close your browser** - emails still sync
- **Never miss an email**
- **Zero manual intervention**

---

## 🎯 Monitoring

### Check Cron Jobs (Vercel)

1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments"
4. Click on latest deployment
5. Go to "Functions" tab
6. Look for cron job logs

### Check Webhooks (Nylas)

1. Go to Nylas Dashboard
2. Click "Webhooks"
3. View delivery logs
4. Should see successful deliveries

### Check Database

```sql
-- Last sync times should update every 15 minutes
SELECT email_address, last_sync_at 
FROM email_accounts 
WHERE status = 'active';
```

---

## ❓ Troubleshooting

### "CRON_SECRET not set"
- Add to `.env.local`
- Restart dev server

### "No active accounts found"
- Connect an email account first
- Go to emails page → "Add Account"

### "Server is not running"
- Run `npm run dev` first
- Then run test script in another terminal

### "Webhook not configured"
- Click "Enable Real-time" button in emails page
- Or reconnect your email account

---

## 📚 Full Documentation

- **Complete Setup**: `BACKGROUND_EMAIL_SYNC_SETUP.md`
- **Implementation Details**: `BACKGROUND_SYNC_IMPLEMENTATION.md`
- **Environment Variables**: `ENV_VARIABLES.md`

---

## 🎉 You're All Set!

Your email system now:

✅ Syncs automatically in background  
✅ Delivers emails instantly (< 1 second)  
✅ Works 24/7 without client open  
✅ Never misses an email  
✅ Zero maintenance required  

**Enjoy your fully automated email sync!** 🚀


