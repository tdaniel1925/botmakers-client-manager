# 🔍 Email Sync Debugging Guide

## Issue: Only 11 Emails Downloaded (Expected 4000+)

The sync appears to be stopping prematurely. Here's how to debug:

---

## Step 1: Check PowerShell Terminal

Look at the PowerShell window running `npm run dev`. You should see logs like:

```
🔄 Starting OPTIMIZED email sync for account: your@email.com
📊 Max emails: 200, Skip classification: true
📧 Page 1: Fetched 50 emails (Total: 50)
Processing email 1: ...
Processing email 2: ...
```

**Look for:**
- ❌ Red error messages
- ⚠️ Warning messages about participants or threads
- ✗ Failed to sync email messages
- Any stack traces or exceptions

---

## Step 2: Common Sync Issues

### Issue A: Thread Creation Errors
**Symptom:** Error like "participants is not valid"

**Fix:** Already applied - participants array handling

### Issue B: Database Constraint Violations
**Symptom:** Unique constraint violations, foreign key errors

**Fix:** Check if emails already exist, skip duplicates

### Issue C: Nylas API Rate Limiting
**Symptom:** Sync stops after a few emails, API errors

**Fix:** Need to add retry logic and rate limiting

### Issue D: Memory Issues
**Symptom:** Node process crashes during sync

**Fix:** Reduce batch size, add memory monitoring

---

## Step 3: Enable Verbose Logging

I've added detailed logging. Check your PowerShell terminal for:

```
📧 Page ${pageNumber}: Fetched ${count} emails
Processing email ${number}: subject, from, to
✓ Email ${number} synced successfully
✗ Failed to sync email ${number}: error details
📄 Page ${pageNumber} complete. Next page: Yes/No
⚡ Reached max email limit (200). Stopping sync.
🎉 Sync Complete: X synced, Y skipped, Z errors
```

---

## Step 4: Increase Sync Limit

The default is 200 emails. To sync more:

### Option A: Sync All Emails (4000+)
```typescript
// In email-layout.tsx or where sync is triggered
await syncNylasEmailsAction(accountId, {
  maxEmails: 5000,  // Sync up to 5000
  skipClassification: true  // Keep it fast
});
```

### Option B: Gradual Sync
```typescript
// Sync in batches
await syncNylasEmailsAction(accountId, { maxEmails: 500 });
// Wait, then sync more
await syncNylasEmailsAction(accountId, { maxEmails: 1000 });
```

---

## Step 5: Check Database

```sql
-- How many emails are actually in database?
SELECT COUNT(*) FROM emails WHERE account_id = 'your-account-id';

-- Check for errors in sync
SELECT screening_status, COUNT(*) 
FROM emails 
WHERE account_id = 'your-account-id'
GROUP BY screening_status;

-- Check newest emails
SELECT subject, received_at, screening_status
FROM emails
WHERE account_id = 'your-account-id'
ORDER BY received_at DESC
LIMIT 20;
```

---

## Step 6: Manual Re-Sync

### Clear and Re-Sync
```sql
-- CAUTION: This deletes all emails for the account
DELETE FROM emails WHERE account_id = 'your-account-id';
DELETE FROM email_threads WHERE account_id = 'your-account-id';
```

Then trigger a fresh sync from the UI.

---

## Step 7: Check for Specific Errors

### Check PowerShell for These Patterns:

1. **"No participants found"**
   - Means email has invalid from/to addresses
   - Should still sync with default participant

2. **"Failed to sync email"**
   - Shows which email failed and why
   - Count how many failed

3. **"Reached max email limit"**
   - Good! Means it hit the 200 limit intentionally
   - If you see this but only have 11 emails, something else is wrong

4. **"Sync Complete"**
   - Shows final counts: synced, skipped, errors
   - If errors > 0, those emails weren't saved

---

## Step 8: Temporary Fix - Remove Limit

To sync ALL emails immediately:

1. Open `actions/email-nylas-actions.ts`
2. Find line 97: `const maxEmails = options?.maxEmails || 200;`
3. Change to: `const maxEmails = options?.maxEmails || 10000;`
4. Restart server
5. Re-sync account

**Warning:** This will take 5-15 minutes for 4000 emails!

---

## Step 9: Add Sync Progress UI

I can add a progress indicator so you can see:
- How many emails synced so far
- How many pages processed
- Any errors encountered
- Estimated time remaining

Would you like me to implement this?

---

## Step 10: What to Report

Please check your PowerShell terminal and tell me:

1. **Do you see any red error messages?**
2. **What does the "Sync Complete" message say?**
   - Example: "🎉 Sync Complete: 11 synced, 0 skipped, 0 errors"
3. **Do you see "Reached max email limit (200)"?**
4. **Any specific error patterns repeated?**

---

## Quick Fix: Increase Limit Now

Run this in your browser console while on the emails page:

```javascript
// This will trigger a sync of up to 1000 emails
fetch('/api/email/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accountId: 'your-account-id',
    maxEmails: 1000
  })
});
```

---

## Expected Behavior

### First Sync (Current):
- ✅ Syncs 200 most recent emails
- ✅ Takes 10-15 seconds
- ✅ Skips AI classification for speed

### Full Sync (What You Want):
- 📧 Syncs 4000+ emails
- ⏱️ Takes 3-5 minutes
- 🎯 Gets all historical emails

---

## Next Steps

1. **Check PowerShell logs** - Look for errors
2. **Report what you see** - I'll diagnose the issue
3. **I'll create a fix** - Either increase limit or fix errors
4. **Add progress UI** - So you can see what's happening

---

## Contact Points

- Check: PowerShell window running dev server
- Look for: "Sync Complete" message with counts
- Report: Any red error messages or warnings
- Goal: Understand why only 11 emails synced

---

Let me know what you see in the PowerShell terminal and I'll create a targeted fix! 🔍

