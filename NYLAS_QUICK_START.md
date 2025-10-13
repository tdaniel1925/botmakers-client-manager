# Nylas Email Integration - Quick Start ⚡

Your email client has been upgraded to use **Nylas**! Follow these 5 steps to get started.

---

## ⏱️ 5-Minute Setup

### Step 1: Sign Up for Nylas (2 minutes)

1. Go to: https://dashboard.nylas.com/register
2. Sign up for a free account (includes 5 email accounts)
3. Create an application
4. Note your credentials:
   - Client ID
   - Client Secret  
   - API Key

### Step 2: Configure Callback URI (30 seconds)

In Nylas Dashboard → Settings → Callback URIs:

```
http://localhost:3001/api/auth/nylas/callback
```

(Change to your production URL when deploying)

### Step 3: Add Environment Variables (1 minute)

Create or update `.env.local`:

```env
# Nylas Configuration
NYLAS_CLIENT_ID=your_client_id_here
NYLAS_CLIENT_SECRET=your_client_secret_here
NYLAS_API_KEY=your_api_key_here
NYLAS_API_URI=https://api.us.nylas.com

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Webhook Secret (generate with: openssl rand -base64 32)
NYLAS_WEBHOOK_SECRET=your_random_32_char_string
```

### Step 4: Apply Database Changes (30 seconds)

```bash
cd codespring-boilerplate
npm run db:push
```

### Step 5: Start Your Server (30 seconds)

```bash
npm run dev
```

---

## ✅ Test It Out

1. Navigate to: `http://localhost:3001/platform/emails`
2. Click **"Connect Email Account"**
3. Choose **Gmail** or **Outlook**
4. Authorize the connection
5. ✨ Watch your emails sync automatically!

---

## 🎉 You're Done!

Your email client now has:
- ✅ Real-time email sync
- ✅ OAuth authentication
- ✅ 99.9% uptime reliability
- ✅ Works with all email providers
- ✅ Enterprise-grade security

---

## 📖 More Information

- **Complete Setup Guide:** `NYLAS_SETUP_GUIDE.md`
- **Full Documentation:** `NYLAS_INTEGRATION_COMPLETE.md`
- **Nylas Docs:** https://developer.nylas.com/docs/

---

## 💰 Pricing

- **Free:** 5 email accounts (perfect for development/testing)
- **Pro:** $12/month per account (when you scale)

---

## 🆘 Need Help?

**Common Issues:**
- "Invalid redirect URI" → Check callback URL matches exactly
- "Invalid credentials" → Double-check Client ID, Secret, and API Key
- Database error → Make sure `npm run db:push` completed successfully

**Still stuck?**
- Check troubleshooting in `NYLAS_SETUP_GUIDE.md`
- Contact Nylas support: support@nylas.com
- View Nylas docs: https://developer.nylas.com/docs/

---

**That's it! Your production-ready email client is live! 🚀**






