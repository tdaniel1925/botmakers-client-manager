# Environment Variables Template

Copy this to `.env.local` and fill in your values:

```bash
# Database
DATABASE_URL=your-postgres-connection-string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# OpenAI (Required for AI Email Assistant) ⭐ NEW
OPENAI_API_KEY=sk-...your-key-here

# Nylas Email Integration
NYLAS_API_KEY=your-nylas-api-key
NYLAS_API_URI=https://api.us.nylas.com
NYLAS_CLIENT_ID=your-client-id
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Background Sync (Optional)
CRON_SECRET=your-random-secret-string
NYLAS_WEBHOOK_SECRET=your-nylas-webhook-secret

# VAPI (Voice AI)
VAPI_API_KEY=your-vapi-key

# App Configuration
NEXT_PUBLIC_APP_NAME=ClientFlow
NODE_ENV=development
```

## 🔑 How to Get Each Key

### OpenAI API Key ⭐ **NEW - REQUIRED FOR AI**
1. Go to https://platform.openai.com
2. Sign up / Log in
3. Go to API Keys → Create new secret key
4. Copy the key (starts with `sk-`)

### Database URL
- Use Supabase, Neon, or any Postgres provider
- Format: `postgres://user:password@host:port/database`

### Clerk Keys
1. Go to https://clerk.com
2. Create an application
3. Copy keys from Dashboard → API Keys

### Nylas Keys
1. Go to https://dashboard.nylas.com
2. Create an application
3. Copy API key and Client ID

### Cron & Webhook Secrets
- Generate random strings (32+ characters)
- Use: `openssl rand -hex 32`

## 📝 Notes

- Never commit `.env.local` to git
- Keep secrets secure
- Use different keys for dev/production
- Regenerate if exposed


