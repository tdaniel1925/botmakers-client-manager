# Testing Guide - Onboarding Enhancements

**Date:** October 5, 2025  
**Status:** Ready for Testing

---

## 🚀 Quick Start

### Step 1: Environment Configuration

Create or update your `.env.local` file with the following variable:

```env
# Add this to your existing .env.local file:
CRON_SECRET=your-secure-random-string-here
```

**Generate a secure random string:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use any random password generator
```

**Required Environment Variables Checklist:**
- [ ] `NEXT_PUBLIC_APP_URL` (e.g., http://localhost:3000)
- [ ] `CLERK_SECRET_KEY` (Clerk authentication)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Clerk public key)
- [ ] `DATABASE_URL` (PostgreSQL connection string)
- [ ] `RESEND_API_KEY` (Email sending)
- [ ] `UPLOADTHING_SECRET` (File uploads)
- [ ] `UPLOADTHING_APP_ID` (File uploads)
- [ ] `UPLOADTHING_TOKEN` (File uploads)
- [ ] `OPENAI_API_KEY` (AI features)
- [ ] `CRON_SECRET` **NEW** (Cron job security)

### Step 2: Start Development Server

```bash
cd codespring-boilerplate
npm run dev
```

**Expected Output:**
- Server starts on http://localhost:3000
- No TypeScript errors
- No build errors
- All imports resolve successfully

**If you see errors:**
1. Check for missing dependencies: `npm install`
2. Check for TypeScript errors: `npm run build`
3. Review server logs for specific issues

---

## 🧪 Testing Checklist

### Phase 1: Conditional Logic Testing ✅

**Test Scenario:** Dynamic onboarding flow

1. **Create Test Onboarding:**
   - Log in as platform admin
   - Navigate to platform projects
   - Create or select a project
   - Create onboarding session (if template has conditions)

2. **Navigate Through Form:**
   - Start onboarding from public link
   - Answer questions that trigger conditions
   - Verify steps appear/disappear based on responses
   - Check progress bar updates correctly
   - Confirm only visible steps count in total

**Expected Results:**
- [ ] Steps show/hide dynamically
- [ ] Progress bar recalculates in real-time
- [ ] Navigation skips hidden steps
- [ ] Step counter shows correct visible count

---

### Phase 2: Reminder System Testing ✅

**Test Scenario:** Automated and manual reminders

#### 2.1 Reminder Settings Dialog

1. Navigate to `/platform/onboarding/[session-id]`
2. Click "Reminders" button in header
3. **Schedule Tab Tests:**
   - [ ] Toggle reminders on → Save → Verify success message
   - [ ] Toggle reminders off → Save → Verify cancelled message
   - [ ] Select "Standard" schedule → Save
   - [ ] Select "Aggressive" schedule → Save
   - [ ] Select "Gentle" schedule → Save
   - [ ] Verify schedule info displays correctly

4. **Manual Send Tab Tests:**
   - [ ] Send with default (no custom fields) → Verify sent
   - [ ] Send with custom subject only → Verify sent
   - [ ] Send with custom subject + message → Verify sent
   - [ ] Preview shows correctly before sending
   - [ ] Success toast appears

**Expected Results:**
- Settings save without errors
- Manual reminders send immediately
- Toast notifications appear
- Dialog closes after successful save

#### 2.2 Reminder History Card

1. Navigate to "Reminders" tab
2. **Verify Display:**
   - [ ] All reminders show in timeline
   - [ ] Status icons display correctly (✅ Sent, ⏰ Pending, ❌ Failed, 🚫 Cancelled)
   - [ ] Stats show correct counts (sent, open rate, click rate)
   - [ ] Timestamps display correctly

3. **Test Resend:**
   - [ ] Click "Send Another Reminder" button
   - [ ] Verify reminder sends
   - [ ] Timeline updates with new reminder

**Expected Results:**
- Timeline displays all reminders
- Stats calculate correctly
- Resend button works
- Real-time updates after actions

#### 2.3 Session List Indicators

1. Navigate to `/platform/onboarding`
2. **Check Reminders Column:**
   - [ ] Bell icon + count for enabled sessions
   - [ ] BellOff icon for disabled sessions
   - [ ] Sparkles icon for sessions with generated tasks
   - [ ] Counts display correctly

**Expected Results:**
- Icons display correctly
- Counts are accurate
- Visual indicators match session state

---

### Phase 3: Task Generation Testing ✅

**Test Scenario:** Auto-generate tasks from onboarding

#### 3.1 Prerequisites

1. **Complete an onboarding session with substantial responses:**
   - Business description
   - Project goals
   - Budget information
   - Timeline
   - Any files uploaded

2. **Ensure session is linked to a project**

#### 3.2 Task Generation Preview Dialog

1. Navigate to onboarding detail page
2. Click "Generate Tasks" button
3. **Verify Preview:**
   - [ ] Loading spinner appears
   - [ ] Tasks generate successfully
   - [ ] Summary stats display (total, high/medium/low)
   - [ ] All tasks show title, description, priority, due date

4. **Test Filters:**
   - [ ] Click "High" tab → Only high priority tasks show
   - [ ] Click "Medium" tab → Only medium priority tasks show
   - [ ] Click "Low" tab → Only low priority tasks show
   - [ ] Click "All" tab → All tasks show

5. **Test Selection:**
   - [ ] Uncheck individual task → Selection count decreases
   - [ ] Check individual task → Selection count increases
   - [ ] Click "Select All" → All tasks selected
   - [ ] Click "Select All" again → All tasks deselected

6. **Create Tasks:**
   - [ ] Select 3-5 tasks
   - [ ] Click "Create X Tasks" button
   - [ ] Success message appears
   - [ ] Dialog closes

**Expected Results:**
- Preview generates 10-30 tasks (depends on responses)
- Filters work correctly
- Selection UI updates
- Tasks create successfully

#### 3.3 Verify Created Tasks

1. Navigate to the project: `/platform/projects/[project-id]`
2. **Check Tasks Tab:**
   - [ ] Created tasks appear in Kanban board
   - [ ] Tasks show in correct columns (todo, in-progress, done)
   - [ ] Task source badges display
   - [ ] Task details are complete

3. **Check Task Source Badge:**
   - [ ] Purple "From Onboarding" badge appears
   - [ ] Hover shows tooltip with metadata
   - [ ] Click badge → Navigates to onboarding session
   - [ ] Tooltip shows rule name and timestamp

**Expected Results:**
- All selected tasks appear in project
- Source badges link back to onboarding
- Task data is complete and accurate
- Progress bar updates if tasks are marked done

---

### Phase 4: Admin UI Components Testing ✅

#### 4.1 Task Source Badge (in Task Cards)

1. View tasks in Kanban board
2. View tasks in List view
3. **Verify Badge:**
   - [ ] Appears on onboarding-generated tasks
   - [ ] Does NOT appear on manual tasks
   - [ ] Icon is FileCheck2 (document with check)
   - [ ] Color is purple
   - [ ] Tooltip shows on hover
   - [ ] Click navigates to onboarding

**Expected Results:**
- Badge only on sourced tasks
- Tooltip provides context
- Link works correctly

#### 4.2 All Components Together

**End-to-End Workflow:**

1. Create project
2. Send onboarding invitation
3. Complete onboarding (simulate client)
4. Enable reminders → Standard schedule
5. View reminder history (should show scheduled reminders)
6. Generate tasks from onboarding
7. Select and create 10 tasks
8. View tasks in project with source badges
9. Mark some tasks complete → Progress updates
10. Check session list → Shows reminder + task indicators

**Expected Results:**
- Complete workflow works end-to-end
- No errors at any step
- All data persists correctly
- UI updates in real-time

---

### Phase 5: Cron Job Testing 🔴

**Test Scenario:** Manual trigger of reminder sending

#### 5.1 Setup

Ensure you have:
- At least one pending reminder in database
- Reminder scheduled for past date (or current date)
- Session with valid client email

#### 5.2 Manual Trigger

**Using cURL (PowerShell):**
```powershell
$headers = @{
    "Authorization" = "Bearer your-cron-secret-from-env"
}
Invoke-WebRequest -Uri "http://localhost:3000/api/cron/send-reminders" -Headers $headers -Method GET
```

**Using cURL (Command Line):**
```bash
curl -X GET http://localhost:3000/api/cron/send-reminders \
  -H "Authorization: Bearer your-cron-secret-from-env"
```

**Using Browser:**
1. Install a REST client extension (e.g., Thunder Client, REST Client)
2. Create GET request to: `http://localhost:3000/api/cron/send-reminders`
3. Add header: `Authorization: Bearer your-cron-secret`
4. Send request

#### 5.3 Verify Results

**Check API Response:**
- [ ] Returns 200 status code
- [ ] JSON shows processed count
- [ ] Shows sent/failed/skipped counts
- [ ] Duration is reasonable (<5s for 100 reminders)

**Check Database:**
- [ ] Reminder status updated to "sent"
- [ ] `sentAt` timestamp populated
- [ ] Session `reminderCount` incremented
- [ ] Session `lastReminderSentAt` updated

**Check Email Service (Resend):**
- [ ] Log into Resend dashboard
- [ ] Verify email was sent
- [ ] Check delivery status
- [ ] View email content

**Check UI:**
- [ ] Refresh session detail page
- [ ] Reminder history shows sent reminder
- [ ] Stats update (sent count increases)
- [ ] Session list shows updated count

**Expected Results:**
- Cron job processes reminders successfully
- Emails send without errors
- Database updates correctly
- UI reflects changes

---

### Phase 6: Permission Testing 🔐

**Test Scenario:** Verify access control

#### 6.1 Platform Admin Access (Should Work)

1. Log in as platform admin user
2. **Verify Access:**
   - [ ] Can view all onboarding sessions
   - [ ] Can access session detail pages
   - [ ] "Reminders" button visible
   - [ ] "Generate Tasks" button visible
   - [ ] Reminders tab accessible
   - [ ] Can save reminder settings
   - [ ] Can send manual reminders
   - [ ] Can generate and create tasks

**Expected Results:**
- All features accessible
- No permission errors
- UI shows all admin controls

#### 6.2 Organization User Access (Should NOT Work)

1. Log in as regular org user (not platform admin)
2. **Verify Restrictions:**
   - [ ] Cannot access `/platform/onboarding`
   - [ ] Redirects to `/dashboard`
   - [ ] No "Generate Tasks" button in project view
   - [ ] Cannot access onboarding URLs directly

3. **Test Server Actions (if you can):**
   - Try calling server actions directly
   - Should receive "Not authorized" errors

**Expected Results:**
- All platform admin features hidden
- Redirects work correctly
- Server actions reject requests

---

### Phase 7: Error Handling Testing ⚠️

**Test Scenario:** Graceful error handling

#### 7.1 Task Generation Errors

1. **No Responses:**
   - Create empty onboarding session
   - Try to generate tasks
   - [ ] Shows friendly error message
   - [ ] Dialog closes gracefully

2. **No Project Link:**
   - Complete onboarding without project
   - Try to generate tasks
   - [ ] Error message displayed
   - [ ] No crash

#### 7.2 Reminder Errors

1. **No Email Address:**
   - Create session without client email
   - Try to send reminder
   - [ ] Error message explains issue
   - [ ] Suggests adding email

2. **Invalid Email:**
   - Session with malformed email
   - Trigger cron job
   - [ ] Marks reminder as failed
   - [ ] Logs error in metadata

#### 7.3 General Errors

- [ ] Missing environment variables → Clear error message
- [ ] Database connection issues → Graceful degradation
- [ ] Network errors → Retry logic or user notification
- [ ] Invalid data → Validation errors displayed

**Expected Results:**
- No uncaught exceptions
- User-friendly error messages
- Errors don't break application
- Logs provide debugging info

---

### Phase 8: Performance Testing ⚡

**Test Scenario:** Ensure acceptable performance

#### 8.1 Load Testing

1. **Task Generation:**
   - Generate 50+ tasks
   - [ ] Preview loads in <2 seconds
   - [ ] Creating tasks completes in <5 seconds
   - [ ] UI remains responsive

2. **Reminder History:**
   - Session with 20+ reminders
   - [ ] History loads in <1 second
   - [ ] Timeline renders smoothly
   - [ ] Stats calculate quickly

3. **Session List:**
   - View 100+ onboarding sessions
   - [ ] List loads in <3 seconds
   - [ ] Filtering is instant
   - [ ] Indicators display quickly

**Expected Results:**
- Fast load times
- Smooth interactions
- No UI freezing or lag

---

## 🐛 Known Issues to Watch For

### Common Problems:

1. **TypeScript Errors:**
   - Missing type imports
   - Incorrect prop types
   - Async/await issues

2. **Database Errors:**
   - Query syntax errors
   - Missing migrations
   - Foreign key violations

3. **UI Rendering Issues:**
   - Components not mounting
   - State not updating
   - CSS conflicts

4. **Permission Bypasses:**
   - Server actions not checking auth
   - Direct URL access not blocked
   - Client-side-only protection

### How to Debug:

**Server Errors:**
```bash
# Check server logs in terminal where dev server is running
# Look for stack traces and error messages
```

**Client Errors:**
```javascript
// Open browser DevTools (F12)
// Check Console tab for errors
// Check Network tab for failed requests
```

**Database Errors:**
```bash
# Check database logs
# Run query manually to test
# Verify migrations applied: npm run db:migrate
```

---

## 📝 Issue Documentation Template

When you find issues, document them like this:

```markdown
### Issue: [Brief Description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Error Messages:**
```
Paste any error messages here
```

**Screenshots:**
[Attach if relevant]

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Node: v20.10.0
- Dev server running: Yes

**Possible Fix:**
Ideas for how to fix it
```

---

## ✅ Testing Completion Checklist

After completing all tests:

- [ ] All conditional logic works
- [ ] Reminders send successfully
- [ ] Tasks generate correctly
- [ ] Admin UI components function
- [ ] Cron job processes reminders
- [ ] Permissions enforced properly
- [ ] Errors handled gracefully
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All documentation accurate

---

## 🚀 Ready for Production?

Before deploying to production:

1. **Fix all critical and high severity issues**
2. **Update environment variables for production**
3. **Configure production cron job** (Vercel Cron, GitHub Actions, etc.)
4. **Test on production database** (or staging)
5. **Monitor Resend email deliverability**
6. **Set up error tracking** (Sentry, LogRocket, etc.)
7. **Create backup of database**
8. **Document any known limitations**

---

## 🆘 Need Help?

**Common Solutions:**

**Server won't start:**
```bash
npm install
rm -rf .next
npm run dev
```

**TypeScript errors:**
```bash
npm run build
# Fix errors shown in output
```

**Database issues:**
```bash
npm run db:migrate
npm run db:push
```

**Environment variables not loading:**
- Restart dev server after changing .env.local
- Verify variable names match exactly
- Check for typos or extra spaces

---

**Happy Testing!** 🎉

Report any issues you find and we'll fix them before production deployment.
