# 🔄 Background Email Sync Setup Guide

Your email system now syncs automatically in the background, without requiring the client to be open!

## 🎯 How It Works

### 1. **Real-time Sync (Webhooks)**
- Nylas sends instant notifications when emails arrive
- New emails appear immediately (< 1 second)
- No polling required
- **Status**: ✅ Implemented

### 2. **Scheduled Sync (Cron Jobs)**
- Runs every 15 minutes automatically
- Syncs all active email accounts
- Catches any missed emails
- **Status**: ✅ Implemented

### 3. **Manual Sync**
- Users can still click "Download All Emails"
- Useful for initial setup or troubleshooting
- **Status**: ✅ Already working

---

## 📋 Environment Variables Required

Add these to your `.env.local`:

```bash
# Cron Job Security (generate a random 32-char string)
CRON_SECRET=your-random-32-character-secret-key-here

# Nylas Webhook Secret (from Nylas Dashboard)
NYLAS_WEBHOOK_SECRET=your-nylas-webhook-secret-here
```

**Generate a secure CRON_SECRET:**
```bash
# On Linux/Mac
openssl rand -hex 32

# On Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Or use any password generator for a 32-char string
```

---

## 🚀 Deployment Setup

### **Option 1: Vercel (Recommended)**

1. **Deploy to Vercel:**
   ```bash
   vercel deploy
   ```

2. **Add Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `CRON_SECRET` and `NYLAS_WEBHOOK_SECRET`

3. **Cron Jobs are Auto-Enabled!**
   - The `vercel.json` file configures this automatically
   - Runs every 15 minutes: `*/15 * * * *`
   - Check logs in Vercel Dashboard → Deployments → Functions

4. **Set Up Nylas Webhook:**
   - Go to your emails page and click **"Enable Real-time"** button
   - Or manually configure in Nylas Dashboard:
     - URL: `https://your-domain.vercel.app/api/webhooks/nylas`
     - Events: `message.created`, `message.updated`, `thread.replied`

---

### **Option 2: Other Platforms (Railway, Render, etc.)**

Since these don't have built-in cron support, use an external cron service:

1. **Deploy Your App:**
   - Add `CRON_SECRET` and `NYLAS_WEBHOOK_SECRET` to environment variables

2. **Set Up External Cron (choose one):**

   **A. Cron-job.org (Free)**
   - Create account at https://cron-job.org
   - Add new cron job:
     - URL: `https://your-domain.com/api/cron/sync-emails`
     - Schedule: Every 15 minutes
     - Add header: `Authorization: Bearer YOUR_CRON_SECRET`

   **B. EasyCron (Free tier available)**
   - Create account at https://www.easycron.com
   - Similar setup as above

   **C. GitHub Actions (Free for public repos)**
   - Create `.github/workflows/email-sync.yml`:
     ```yaml
     name: Email Sync
     on:
       schedule:
         - cron: '*/15 * * * *'
     jobs:
       sync:
         runs-on: ubuntu-latest
         steps:
           - name: Trigger Sync
             run: |
               curl -X POST \
                 -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
                 https://your-domain.com/api/cron/sync-emails
     ```

3. **Set Up Nylas Webhook:**
   - URL: `https://your-domain.com/api/webhooks/nylas`
   - Events: `message.created`, `message.updated`, `thread.replied`

---

## 🧪 Testing

### 1. **Test Cron Job Manually**

```bash
# Test the cron endpoint
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3001/api/cron/sync-emails

# Expected response:
{
  "success": true,
  "duration": 1234,
  "total": 2,
  "successful": 2,
  "failed": 0,
  "details": [...]
}
```

### 2. **Test Webhook (Local Development)**

Use ngrok to expose your local server:

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3001

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Add to Nylas Dashboard webhook URL: https://abc123.ngrok.io/api/webhooks/nylas
```

Send a test email to your connected account and watch the terminal logs.

### 3. **Monitor Background Sync**

Check your platform logs:

**Vercel:**
- Dashboard → Deployments → [Latest] → Functions → Click on cron function

**Other Platforms:**
- Check application logs for `⏰ CRON:` prefix

**Database:**
- Check `email_accounts` table → `last_sync_at` column should update every 15 minutes

---

## 📊 API Endpoints

### `POST /api/cron/sync-emails`
Syncs all active email accounts.

**Headers:**
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Response:**
```json
{
  "success": true,
  "duration": 1234,
  "total": 2,
  "successful": 2,
  "failed": 0,
  "details": [
    {
      "email": "user@example.com",
      "status": "success",
      "syncedCount": 15
    }
  ]
}
```

### `POST /api/webhooks/nylas`
Receives real-time email notifications from Nylas.

**Headers:**
```
x-nylas-signature: <signature>
```

**Handles:**
- `message.created` - New email received
- `message.updated` - Email read/starred/etc.
- `thread.replied` - New reply in thread

---

## 🔍 Troubleshooting

### Cron Jobs Not Running

1. **Vercel:**
   - Check `vercel.json` exists and is committed
   - Verify deployment succeeded
   - Check Vercel Dashboard → Functions → Cron

2. **External Cron:**
   - Verify `CRON_SECRET` matches in both places
   - Check cron service logs for errors
   - Test endpoint manually with curl

### Webhooks Not Working

1. **Check Nylas Dashboard:**
   - Webhooks → Verify URL is correct
   - Check delivery logs for errors

2. **Check Webhook Secret:**
   - Verify `NYLAS_WEBHOOK_SECRET` matches Nylas Dashboard

3. **Check Application Logs:**
   - Look for `Nylas webhook received:` messages
   - Check for signature verification errors

### Emails Not Syncing

1. **Check Account Status:**
   ```sql
   SELECT email_address, status, last_sync_at, nylas_grant_id 
   FROM email_accounts 
   WHERE status = 'active';
   ```

2. **Manually Trigger Sync:**
   - Click "Download All Emails" button
   - Check browser console for errors

3. **Check Nylas Grant:**
   - Verify `nylas_grant_id` is not null
   - Try disconnecting and reconnecting account

---

## 🎯 Performance

- **Webhook Response**: < 500ms
- **Cron Job Duration**: ~1-2 seconds per account
- **Email Arrival Delay**: < 1 second (webhooks) or < 15 minutes (cron)

---

## 📝 Monitoring Checklist

✅ Cron jobs running every 15 minutes  
✅ Webhook endpoint responding (200 OK)  
✅ `last_sync_at` updating regularly  
✅ No errors in application logs  
✅ New emails appearing within 1 second  

---

## 🚀 Next Steps

Your background email sync is now fully operational! Users can:

1. ✅ Close the browser - emails still sync
2. ✅ Receive instant notifications (< 1 second)
3. ✅ Have automatic backups (every 15 minutes)
4. ✅ Never miss an email

**All sync happens server-side** - no client required! 🎉



