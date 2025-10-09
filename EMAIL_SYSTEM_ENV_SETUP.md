# Email System - Environment Variables Setup

## Required Environment Variables

Add these to your `.env.local` file:

```env
# ============================================================================
# Email System - Core Settings
# ============================================================================

# Email Encryption Key (32-byte hex string, 64 characters)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
EMAIL_ENCRYPTION_KEY=your-64-character-hex-key-here

# Email Sync Settings
EMAIL_SYNC_SECRET=your-random-secret-for-cron-authentication
EMAIL_SYNC_BATCH_SIZE=50
EMAIL_SYNC_INTERVAL_MINUTES=5

# ============================================================================
# Gmail OAuth 2.0 (Optional - for Gmail integration)
# ============================================================================

# Get these from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=${NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback

# Gmail API Settings
GOOGLE_PROJECT_ID=your-google-project-id

# Gmail Push Notifications (optional for real-time sync)
GOOGLE_PUBSUB_TOPIC=projects/your-project-id/topics/gmail-push
GOOGLE_PUBSUB_SUBSCRIPTION=projects/your-project-id/subscriptions/gmail-push-sub

# ============================================================================
# Microsoft OAuth 2.0 (Optional - for Outlook/Office 365)
# ============================================================================

# Get these from: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
MICROSOFT_CLIENT_ID=your-microsoft-app-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=common # or your specific tenant ID
MICROSOFT_REDIRECT_URI=${NEXT_PUBLIC_APP_URL}/api/auth/microsoft/callback

# ============================================================================
# AI Features (Already configured in your system)
# ============================================================================

# OpenAI API Key (for email summaries, categorization, drafting)
OPENAI_API_KEY=sk-xxxxx

# ============================================================================
# Database (Already configured)
# ============================================================================

DATABASE_URL=postgresql://...

# ============================================================================
# App Settings (Already configured)
# ============================================================================

NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================================================
# File Storage (Already configured - for email attachments)
# ============================================================================

UPLOADTHING_SECRET=sk_live_xxxxx
UPLOADTHING_APP_ID=your_app_id
```

## Generate Encryption Key

Run this command to generate a secure encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `EMAIL_ENCRYPTION_KEY`.

## Google Cloud Console Setup (for Gmail)

1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Enable Gmail API
4. Go to "APIs & Services" > "Credentials"
5. Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/gmail/callback`
   - Add production URLs when deploying
6. Copy Client ID and Client Secret to .env.local
7. Configure OAuth consent screen
8. Add test users during development

**Required Scopes:**
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.modify`

## Microsoft Azure Portal Setup (for Outlook/Office 365)

1. Go to https://portal.azure.com/
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Configure:
   - Name: Your app name
   - Supported account types: Multitenant
   - Redirect URI: `http://localhost:3000/api/auth/microsoft/callback`
5. Go to "Certificates & secrets" > Create new client secret
6. Go to "API permissions" > Add permissions
   - Microsoft Graph > Delegated permissions
   - Add: `Mail.ReadWrite`, `Mail.Send`, `offline_access`
7. Grant admin consent
8. Copy Application (client) ID and Client secret to .env.local

## Testing Encryption

After setting up `EMAIL_ENCRYPTION_KEY`, test it:

```typescript
import { testEncryption, generateEncryptionKey } from '@/lib/email-encryption';

// Generate a key
console.log('New key:', generateEncryptionKey());

// Test encryption/decryption
const isValid = testEncryption('test-user-id');
console.log('Encryption test:', isValid ? 'PASS' : 'FAIL');
```

## Migration Commands

After setting up environment variables:

```bash
# Generate migration (already done)
npx drizzle-kit generate

# Apply migration to database
npx drizzle-kit migrate

# Or push directly (development only)
npx drizzle-kit push
```

## Security Notes

- **Never commit** `.env.local` to version control
- Use different encryption keys for dev/staging/production
- Rotate encryption keys periodically
- Keep OAuth secrets secure
- Use environment-specific redirect URIs
- Enable 2FA on provider accounts

