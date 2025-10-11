# Email System Environment Variables Setup

⚠️ **DEPRECATED:** This email system has been upgraded to use **Nylas** for enterprise-grade reliability.

Please refer to **NYLAS_SETUP_GUIDE.md** for the new setup instructions.

## Old Variables (No Longer Needed)

The following OAuth setup is no longer required with Nylas:

```env
# DEPRECATED - No longer needed with Nylas
# EMAIL_ENCRYPTION_KEY=your_32_character_encryption_key_here
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
# MICROSOFT_CLIENT_ID=your_microsoft_client_id
# MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
# MICROSOFT_TENANT_ID=common
# NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## New Nylas Variables

See **NYLAS_SETUP_GUIDE.md** for complete setup:

```env
# Nylas Configuration
NYLAS_CLIENT_ID=your_nylas_client_id
NYLAS_CLIENT_SECRET=your_nylas_client_secret
NYLAS_API_KEY=your_nylas_api_key
NYLAS_API_URI=https://api.us.nylas.com
NYLAS_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## Migration Guide

If you were using the old IMAP/SMTP setup:

1. Sign up for Nylas at https://dashboard.nylas.com/register
2. Get your Nylas credentials (see NYLAS_SETUP_GUIDE.md)
3. Add Nylas environment variables to `.env.local`
4. Run `npm run db:push` to apply schema changes
5. Restart your development server
6. Reconnect email accounts via the new OAuth flow

**Benefits:**
- No more IMAP connection issues
- Real-time email sync via webhooks
- 99.9% uptime SLA
- Works with all email providers
- Enterprise-grade security





