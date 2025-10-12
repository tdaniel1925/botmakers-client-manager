# Quick Reference Guide - Email Client Features

**Last Updated**: October 12, 2025

---

## ⌨️ KEYBOARD SHORTCUTS

| Key | Action |
|-----|--------|
| `j` | Next email |
| `k` | Previous email |
| `r` | Reply to email |
| `s` | Star/unstar email |
| `g` | Refresh / Check for new mail |
| `c` | Compose new email |
| `1` | Go to Imbox |
| `2` | Go to The Feed |
| `3` | Go to Paper Trail |
| `4` | Go to Screener |
| `/` | Open search |
| `l` | Reply Later |
| `s` (in Hey) | Set Aside |
| `Cmd+K` / `Ctrl+K` | Command palette |
| `Escape` | Close viewer/dialog |

---

## 🔍 ADVANCED SEARCH

### Search Operators

```
from:john@example.com          - Emails from specific sender
to:support@company.com          - Emails to specific recipient
has:attachments                 - Emails with attachments
is:starred                      - Starred emails only
is:unread                       - Unread emails only
```

### Combining Operators

```
from:john has:attachments is:unread
```

### Search Filters (UI Buttons)
- **Has Attachments** - Toggle with button
- **Starred** - Toggle with button  
- **Unread** - Toggle with button
- **Clear Filters** - Reset all filters

---

## 📦 BULK OPERATIONS

### How to Use
1. Click "Select" button in header
2. Check emails you want to select
3. Use "Select all" to select all visible
4. Choose bulk action:
   - **Mark Read** - Mark all as read
   - **Mark Unread** - Mark all as unread
   - **Star** - Star all selected
   - **Archive** - Move to archive
   - **Trash** - Move to trash
   - **Delete Forever** - Permanently delete (trash only)

---

## 💾 DRAFT PERSISTENCE

### Auto-Save
- Drafts auto-save every **5 seconds**
- Saved to both database and localStorage
- Crash recovery on next open

### Recovery
- If app crashes, drafts are saved
- On reopen, you'll be asked to restore
- Choose "Restore" to continue where you left off

---

## ⚡ PERFORMANCE FEATURES

### Virtual Scrolling
- **Automatic** for lists with >200 emails
- Renders only visible emails
- Smooth scrolling even with 10,000+ emails
- Blue banner shows when active

### Prefetching
- AI data pre-loaded on hover
- Instant AI summaries
- No waiting for analysis

### Client-Side Filtering
- Instant search results
- No server round-trips
- <50ms response time

---

## 🔒 SECURITY FEATURES

### Built-In Protection
- ✅ XSS prevention (HTML sanitization)
- ✅ SQL injection prevention
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Input validation
- ✅ Secure file uploads

### What This Means
- Email HTML is sanitized before display
- No malicious scripts can run
- Your data is protected
- File uploads are validated (type, size)

---

## 🎨 HEY FEATURES

### Screener
- Review new senders
- Choose where emails go:
  - **Imbox** - Important people
  - **The Feed** - Newsletters
  - **Paper Trail** - Receipts
  - **Block** - Never see again

### Imbox
- Important emails only
- Clean, focused inbox
- Unread count badge

### The Feed
- Newsletters and updates
- Bulk "Mark All Read"
- Separate from important mail

### Paper Trail
- Receipts and confirmations
- Search by category
- Auto-filed

### Reply Later
- Bookmark emails to reply
- "Focus & Reply" mode
- Keyboard shortcut: `l`

### Set Aside
- Temporary holding area
- Review later
- Keyboard shortcut: `s`

---

## 🚨 ERROR HANDLING

### What Happens When Things Go Wrong
- App won't crash (error boundaries)
- Friendly error messages
- "Try Again" button
- Errors logged for debugging

### If You See an Error
1. Click "Try Again"
2. If it persists, refresh the page
3. Still broken? Check your internet connection
4. Report to support if issue continues

---

## 📊 SYNC PROGRESS

### Email Sync
- Click "Download All" to sync
- Progress modal shows:
  - Current page
  - Emails fetched
  - New vs already synced
  - Errors (if any)
- Sync continues even if you refresh
- Modal reopens if sync in progress

### Background Sync
- Emails sync in background
- You can use app while syncing
- Close modal to hide progress
- Sync continues running

---

## 🔄 AUTO-REFRESH

### Automatic Updates
- Checks for new mail every **2 minutes**
- Toast notification for new emails
- Shows count of new messages

### Manual Refresh
- Press `g` keyboard shortcut
- Or click "Download All" button

### Toggle Off
- Can disable auto-refresh in settings (future)
- Manual refresh always available

---

## 📝 BEST PRACTICES

### For Best Performance
1. Use search filters for large inboxes
2. Archive old emails regularly
3. Let virtual scrolling handle large lists
4. Use keyboard shortcuts for speed

### For Best Organization
1. Screen senders to train the system
2. Use Hey views to separate email types
3. Reply Later for emails needing attention
4. Set Aside for temporary holds

### For Security
1. Don't click suspicious links
2. Verify sender before replying
3. Report phishing emails
4. Use strong password (Clerk handles this)

---

## 🆘 TROUBLESHOOTING

### Common Issues

**"No emails showing"**
- Refresh the page
- Click "Download All" to sync
- Check selected folder/view

**"Search not working"**
- Check spelling
- Try removing filters
- Clear search and try again

**"Bulk actions not applying"**
- Wait for action to complete
- Refresh page to see changes
- Check error notifications

**"AI summary not loading"**
- Hover/click again
- Check internet connection
- Email might be too new (AI processing)

**"Can't send email"**
- Check recipient address
- Verify subject and body
- Check internet connection
- Look for error toast

---

## 📱 COMING SOON

- Mobile optimization
- Thread conversation view
- Email labels/tags
- Advanced filters (date range)
- Email scheduling
- Templates
- Signatures
- Rules/automation

---

## 💡 TIPS & TRICKS

1. **Power User Mode**: Learn keyboard shortcuts for 2x speed
2. **Inbox Zero**: Use Hey features to separate email types
3. **Bulk Archive**: Select old emails, bulk archive
4. **Smart Search**: Combine operators for precise results
5. **Focus Mode**: Reply Later → Focus & Reply for batch processing

---

## 🎯 SUPPORT

If you need help:
1. Check this guide first
2. Try the troubleshooting section
3. Contact support with:
   - What you were trying to do
   - What happened instead
   - Any error messages
   - Steps to reproduce

---

**Happy emailing! 📧**

