# Environment Variables Configuration

This document lists all required environment variables for the application.

## 📋 Required Variables

Add these to your `.env.local` file:

### Database
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

### Clerk Authentication
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Nylas Email Integration
```bash
NYLAS_API_KEY=nyk_v0_...
NYLAS_API_URI=https://api.us.nylas.com
NYLAS_CLIENT_ID=...
NYLAS_CLIENT_SECRET=...
NYLAS_WEBHOOK_SECRET=...
```

### Background Email Sync ⚡ NEW
```bash
# Generate a secure random 32-character string
# On Linux/Mac:
#   openssl rand -hex 32
# On Windows PowerShell:
#   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
CRON_SECRET=your-random-32-character-secret-here
```

### AI Features
```bash
OPENAI_API_KEY=sk-...
```

### CopilotKit (AI Assistant)
```bash
COPILOT_API_KEY=...
```

### App Configuration
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

---

## 🔐 Security Notes

- **Never commit** `.env.local` to version control
- **Rotate secrets** regularly in production
- **Use strong passwords** for database connections
- **Generate unique secrets** for each environment (dev/staging/prod)

---

## 🚀 Deployment

When deploying to production:

1. Set all environment variables in your hosting platform (Vercel, Railway, etc.)
2. Update `NEXT_PUBLIC_APP_URL` to your production domain
3. Update `NODE_ENV` to `production`
4. Ensure `CRON_SECRET` is different from development

---

## ✅ Verification

To verify your environment variables are set correctly:

```bash
# Test database connection
npm run db:push

# Test Nylas connection (in browser console after connecting account)
# Check for "✅ Webhook setup successful" in terminal

# Test cron endpoint
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3001/api/cron/sync-emails
```


