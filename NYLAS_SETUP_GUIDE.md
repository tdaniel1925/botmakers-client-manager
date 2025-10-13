# Nylas Email Integration Setup Guide

## 🚀 Quick Start

This guide will help you set up Nylas email integration for your ClientFlow application.

## Step 1: Create Nylas Account

1. Go to https://dashboard.nylas.com/register
2. Sign up for a free account (includes 5 email accounts)
3. Verify your email address

## Step 2: Create Nylas Application

1. In the Nylas Dashboard, click **"Create App"**
2. Give your app a name (e.g., "ClientFlow Email")
3. Note your credentials:
   - **Client ID**: Found in Settings → Application
   - **Client Secret**: Found in Settings → Application → API Keys
   - **API Key**: Your main API key (v3 uses this)

## Step 3: Configure Redirect URIs

In Nylas Dashboard → Settings → Application → Callback URIs:

**For Development:**
```
http://localhost:3001/api/auth/nylas/callback
```

**For Production:**
```
https://yourdomain.com/api/auth/nylas/callback
```

## Step 4: Enable Email Providers

In Nylas Dashboard → Settings → Hosted Authentication:

✅ Enable:
- Gmail / Google Workspace
- Microsoft 365 / Outlook
- IMAP (for all other providers)

## Step 5: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Nylas Configuration
NYLAS_CLIENT_ID=your_client_id_here
NYLAS_CLIENT_SECRET=your_client_secret_here
NYLAS_API_KEY=your_api_key_here
NYLAS_API_URI=https://api.us.nylas.com  # or eu.nylas.com for EU region

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3001  # Change for production

# Webhook Secret (generate a secure random string)
NYLAS_WEBHOOK_SECRET=your_webhook_secret_here
```

### Generate Webhook Secret

```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Step 6: Set Up Webhooks (for real-time email sync)

In Nylas Dashboard → Webhooks:

1. Click **"Create Webhook"**
2. Set the webhook URL:
   - **Dev (with ngrok):** `https://your-ngrok-url.ngrok.io/api/webhooks/nylas`
   - **Production:** `https://yourdomain.com/api/webhooks/nylas`
3. Select triggers:
   - ✅ `message.created`
   - ✅ `message.updated`
   - ✅ `thread.replied`
4. Save the webhook

### Using ngrok for Local Development

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose port 3001
ngrok http 3001

# Copy the HTTPS URL and add it to Nylas webhooks
```

## Step 7: Run Database Migrations

```bash
npm run db:generate
npm run db:push
```

## Step 8: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/platform/emails` or `/dashboard/emails`
3. Click **"Connect Email Account"**
4. Choose your email provider
5. Authorize the connection
6. Watch emails sync automatically! 🎉

## Features Enabled with Nylas

✅ **OAuth 2.0** - Secure authentication for Gmail, Outlook, etc.  
✅ **Real-time Sync** - Webhooks deliver emails instantly  
✅ **Unified API** - One API for all email providers  
✅ **Thread Intelligence** - Smart email threading  
✅ **Search** - Powerful email search  
✅ **Send Email** - Send from any connected account  
✅ **Labels/Folders** - Full label/folder support  
✅ **Attachments** - Handle attachments seamlessly  
✅ **Calendar** - Bonus: Calendar integration available  

## Pricing

- **Free Tier:** 5 email accounts
- **Pro:** $12/month per email account
- **Enterprise:** Custom pricing with SLA

For most SaaS apps, the Pro tier cost is easily offset by development time saved and reliability gained.

## Troubleshooting

### "Invalid redirect URI"
- Make sure the callback URL in Nylas Dashboard exactly matches your app URL
- Check for trailing slashes (should NOT have one)

### "Invalid credentials"
- Double-check your Client ID, Client Secret, and API Key
- Make sure you're using the correct API region (US vs EU)

### Webhooks not firing
- Verify webhook URL is publicly accessible (use ngrok for local dev)
- Check webhook secret matches your environment variable
- Check Nylas Dashboard → Webhooks → Logs for errors

### Rate limits
- Free tier: 5 accounts, 1000 API calls/day
- Pro tier: Unlimited accounts, 10,000 API calls/day
- Contact Nylas support for higher limits

## Support

- Nylas Documentation: https://developer.nylas.com/docs/
- Nylas API Reference: https://developer.nylas.com/docs/api/
- Nylas Support: support@nylas.com
- Community Slack: https://www.nylas.com/community

## Migration from IMAP

The old IMAP implementation has been replaced by Nylas. Key changes:

- **No more manual IMAP configuration** - OAuth handles everything
- **No more sync delays** - Webhooks provide real-time updates
- **No more connection errors** - Nylas handles all provider quirks
- **Better reliability** - 99.9% uptime SLA

All existing email data will remain in your database. New connections will use Nylas automatically.

---

**Ready to go?** Just add your Nylas credentials to `.env.local` and restart your server! 🚀






