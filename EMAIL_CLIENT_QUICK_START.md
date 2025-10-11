# AI Email Client - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### 1. Environment Setup

Create a `.env.local` file with the following variables:

```env
# CRITICAL: Generate a 32-character encryption key
# Run in terminal: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
EMAIL_ENCRYPTION_KEY=your-32-character-encryption-key-here

# Google OAuth (Optional for Gmail)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth (Optional for MS365)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=common

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI (Already configured)
OPENAI_API_KEY=your-existing-openai-key
```

### 2. Database Migration

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate
```

### 3. Access the Email Client

**Platform Admin:**
```
http://localhost:3000/platform/emails
```

**Organization Users:**
```
http://localhost:3000/dashboard/emails
```

---

## 📧 Features Overview

### Panel 1: Folder Sidebar
- **Account Selector:** Switch between multiple email accounts
- **System Folders:** Inbox, Sent, Drafts, Starred, Archive, Trash
- **Custom Labels:** Create your own organization system
- **Sync Status:** Real-time sync indicator
- **Quick Actions:** Add account, manual sync, settings

### Panel 2: Email Cards
- **2-Line Cards:** Subject + Sender in compact format
- **Visual Indicators:** Unread dot, star, attachments, priority
- **Hover AI Summaries:** 800ms hover triggers AI summary popup
- **Search:** Real-time search across all emails
- **Filters:** Quick filters for unread, today, important
- **Bulk Mode:** Select multiple emails for batch operations
- **Infinite Scroll:** Smooth scrolling through thousands of emails

### Panel 3: AI Copilot
- **Conversational Interface:** Natural language commands
- **Context-Aware:** Knows about selected email/thread
- **Suggested Actions:**
  - "Summarize this email"
  - "Draft a professional reply"
  - "Extract action items"
  - "Find similar emails"
- **Real-Time Responses:** Instant AI-powered assistance

---

## 🎯 Common Tasks

### Connecting an Email Account

1. Click "Add" button in sidebar
2. Choose provider:
   - **Gmail/MS365:** OAuth flow (recommended)
   - **Other:** Enter IMAP/SMTP settings
3. Authorize access
4. Wait for initial sync (usually < 2 minutes)

### Reading Emails

1. **Quick View:** Hover over email card for AI summary
2. **Full View:** Click email card to view in thread viewer
3. **Thread View:** Expand/collapse emails in conversation

### Composing Emails

1. Click compose button (+ icon)
2. Fill in recipients and subject
3. Write message or use AI assistance:
   - Type message, then click "Professional", "Casual", or "Brief"
   - AI will enhance your draft
4. Click "Send"

### AI Copilot Commands

Try these natural language queries:
- "Summarize this email"
- "Draft a reply saying I'll follow up tomorrow"
- "What are the action items from this email?"
- "Find all emails from John about the project"
- "Archive all read emails from this week"

### Bulk Operations

1. Click "Select" button
2. Check emails to act on
3. Choose action: Mark Read, Archive, Delete
4. Confirm operation

### Advanced Search

1. Click search icon or press Ctrl+K
2. Enter semantic query: "emails from clients needing response"
3. Or use advanced filters:
   - From/To specific people
   - Date ranges
   - Has attachments
   - Priority level
   - Specific folders

---

## ⚡ Keyboard Shortcuts (Coming Soon)

- `j/k` - Navigate up/down
- `c` - Compose new email
- `r` - Reply to email
- `a` - Archive email
- `e` - Mark as read
- `s` - Star email
- `#` - Delete email
- `/` - Focus search

---

## 🔧 Configuration

### Email Sync Frequency

Edit `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/sync-emails",
    "schedule": "*/5 * * * *"  // Every 5 minutes
  }]
}
```

### AI Summary Cache Duration

Default: 24 hours

Edit in `lib/ai-email-summarizer.ts`:
```typescript
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
```

---

## 🔐 Security Best Practices

1. **Encryption Key:** Never commit `EMAIL_ENCRYPTION_KEY` to git
2. **OAuth Tokens:** Automatically refreshed before expiration
3. **IMAP Passwords:** Encrypted at rest with AES-256-GCM
4. **Row-Level Security:** Users only see their own emails
5. **Audit Logging:** All access logged automatically

---

## 🐛 Troubleshooting

### Emails Not Syncing

1. Check sync status in sidebar
2. Verify account credentials
3. Check sync logs in database: `email_sync_logs` table
4. Manual sync: Click "Sync" button

### OAuth Connection Failed

1. Verify client ID and secret in `.env.local`
2. Check redirect URI in Google/Microsoft console:
   - Gmail: `http://localhost:3000/api/auth/gmail/callback`
   - Microsoft: `http://localhost:3000/api/auth/microsoft/callback`
3. Ensure scopes are approved:
   - Gmail: `gmail.readonly`, `gmail.send`, `gmail.modify`
   - Microsoft: `Mail.ReadWrite`, `Mail.Send`

### AI Summaries Not Loading

1. Verify `OPENAI_API_KEY` is set
2. Check OpenAI API quota
3. Check browser console for errors
4. Fallback: Email snippet displayed if AI fails

### IMAP Connection Issues

1. Enable "Less secure app access" (if required by provider)
2. Verify IMAP/SMTP settings:
   - Gmail: `imap.gmail.com:993`, `smtp.gmail.com:587`
   - Outlook: `outlook.office365.com:993`, `smtp.office365.com:587`
3. Check firewall settings
4. Test connection: Connection test runs automatically on account setup

---

## 📊 Performance Optimization

### Virtual Scrolling (Recommended for 1000+ emails)

The UI is ready for virtual scrolling. To enable:

1. Install react-window: `npm install react-window`
2. Wrap email card list with virtual scroll container
3. Implementation time: ~30 minutes

### Image Lazy Loading

Already implemented via browser native lazy loading.

### Database Indexes

Automatically created on:
- `user_id` - Fast user data lookup
- `account_id` - Quick account filtering
- `thread_id` - Thread grouping
- `received_at` - Date sorting
- `folder` - Folder filtering

---

## 🎨 Customization

### Changing UI Colors

Edit Tailwind config to match your brand:
```typescript
// tailwind.config.ts
colors: {
  primary: {...}, // Your brand primary color
  secondary: {...}, // Your brand secondary color
}
```

### Email Card Layout

Edit `components/email/email-card.tsx` to customize:
- Card height
- Information displayed
- Hover behavior
- Icons and indicators

### AI Copilot Personality

Edit prompt in `lib/ai-email-copilot.ts`:
```typescript
const SYSTEM_PROMPT = "You are a helpful email assistant...";
```

---

## 🚀 Production Deployment Checklist

- [ ] Set strong `EMAIL_ENCRYPTION_KEY` (32 chars)
- [ ] Configure OAuth credentials for production domain
- [ ] Update redirect URIs in Google/Microsoft consoles
- [ ] Set up Vercel cron job
- [ ] Run database migrations
- [ ] Test email sending/receiving
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts
- [ ] Test all providers (Gmail, Microsoft, IMAP)
- [ ] User acceptance testing
- [ ] Performance testing with 1000+ emails

---

## 📚 Additional Resources

- **Full Documentation:** `EMAIL_CLIENT_FINAL_STATUS.md`
- **Implementation Plan:** `../plan.md`
- **Environment Setup:** `EMAIL_SYSTEM_ENV_SETUP.md`
- **Progress Log:** `EMAIL_CLIENT_PROGRESS_SUMMARY.md`

---

## 💡 Tips & Tricks

1. **Hover for Summaries:** No need to open every email
2. **Use AI Copilot:** It understands context better than search
3. **Bulk Operations:** Save time with batch actions
4. **Custom Labels:** Organize emails your way
5. **Advanced Search:** Use natural language queries
6. **Multi-Account:** Manage all emails in one place

---

## 🆘 Support

For issues or questions:
1. Check `EMAIL_CLIENT_FINAL_STATUS.md` for detailed info
2. Review error logs in browser console
3. Check database `email_sync_logs` table
4. Verify environment variables are set correctly

---

**Happy Emailing! 📧✨**





