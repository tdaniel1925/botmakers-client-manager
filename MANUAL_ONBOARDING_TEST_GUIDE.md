# 🧪 **Manual Onboarding System - Testing Guide**

**Purpose:** Validate all 4 manual onboarding workflows end-to-end  
**Estimated Time:** 30-60 minutes  
**Prerequisites:** 
- Dev server running (http://localhost:3000)
- Platform admin access
- Test email account accessible

---

## 🎯 **Testing Scenarios Overview**

| Test | Scenario | Time | Status |
|------|----------|------|--------|
| 1 | Full Manual (Admin only) | 5 min | ⏳ Pending |
| 2 | Manual with Client Review | 10 min | ⏳ Pending |
| 3 | Hybrid (Admin + Client) | 10 min | ⏳ Pending |
| 4 | Convert Abandoned Session | 10 min | ⏳ Pending |

---

## 📋 **Pre-Test Checklist**

Before starting, ensure:
- [ ] Dev server is running on http://localhost:3000
- [ ] You're logged in as platform admin
- [ ] Database migrations are applied (0034_manual_onboarding.sql)
- [ ] You have access to a test email inbox
- [ ] Browser console is open (F12) for debugging

---

## 🧪 **TEST 1: Full Manual (Admin Only, No Client Review)**

**Goal:** Admin completes entire onboarding, finalizes immediately without client involvement

### Step-by-Step

**1.1 Create New Project with Manual Onboarding**
```
1. Navigate to: http://localhost:3000/platform/projects/new
2. Fill in project details:
   - Name: "Test Manual Onboarding 1"
   - Description: "Testing full manual workflow"
   - Client Name: "John Doe"
   - Client Email: "test@example.com"
3. Toggle "Enable onboarding" ON
4. Select template: "Outbound Calling Campaign" (or any available)
5. Select onboarding mode: "I'll fill it out on behalf of client"
6. Click "Create Project & Start Onboarding"
```

**Expected:** Redirected to `/platform/onboarding/manual/[sessionId]`

**1.2 Verify Manual Onboarding Page Loads**
```
✅ Check page displays:
   - Header: "Manual Onboarding"
   - Completion mode badge: "Full Manual" or "Admin Filled"
   - Session information card
   - ManualOnboardingForm with all sections visible
```

**1.3 Fill Out Onboarding Form**
```
1. Scroll through all sections (should be single-page)
2. Fill out at least 3-5 fields in each section
3. Verify auto-save indicator appears after 30 seconds
4. Check progress percentage updates as you fill fields
```

**Expected:** 
- Progress bar increases as fields are filled
- Auto-save toast notification appears
- No errors in console

**1.4 Finalize Without Client Review**
```
1. Scroll to bottom of form
2. Find "Finalize now" toggle/checkbox
3. Toggle "Finalize now" ON
4. Verify button text changes to "Finalize Onboarding"
5. Click "Finalize Onboarding"
```

**Expected:** 
- Success toast notification
- Redirected to onboarding sessions list or project page
- AI analysis triggered in background

**1.5 Verify Completion**
```
1. Navigate to: http://localhost:3000/platform/onboarding
2. Find the test session in the list
3. Verify completion mode badge shows "Admin Filled"
4. Verify status shows "Completed"
5. Click "View Details"
6. Verify completion mode alert shows "Manual (Admin Filled)"
7. Verify "Finalized without client review" message appears
```

**Expected Results:**
- ✅ Session marked as completed
- ✅ completion_mode = 'manual'
- ✅ finalized_by_admin = true
- ✅ No client email sent
- ✅ AI analysis completed
- ✅ Todos generated (if implemented)

**1.6 Check Console for Errors**
```
Browser Console:
- No errors related to manual onboarding
- API calls succeeded (200 responses)
- Auto-save worked without issues
```

---

## 🧪 **TEST 2: Manual with Client Review**

**Goal:** Admin fills onboarding, sends to client for review, client can edit & approve

### Step-by-Step

**2.1 Create New Project**
```
1. Navigate to: http://localhost:3000/platform/projects/new
2. Fill in project details:
   - Name: "Test Manual Review 2"
   - Description: "Testing manual with review workflow"
   - Client Name: "Jane Smith"
   - Client Email: "[YOUR_TEST_EMAIL]" (use real email you can check)
3. Enable onboarding, select template
4. Select mode: "I'll fill it out on behalf of client"
5. Create & start onboarding
```

**2.2 Fill Onboarding Form**
```
1. Fill out all sections (minimum 3 fields per section)
2. Wait for auto-save to trigger once
3. Scroll to bottom
```

**2.3 Send for Client Review (Don't Finalize)**
```
1. IMPORTANT: Toggle "Finalize now" OFF (unchecked)
2. Verify button text shows "Send for Client Review"
3. Click "Send for Client Review"
```

**Expected:** 
- Success toast: "Sent for client review"
- Session status changes to "pending_review"
- Email sent to client

**2.4 Check Email Notification**
```
1. Check your test email inbox
2. Find email with subject: "Please review your project onboarding information"
3. Verify email includes:
   - Client name (Jane Smith)
   - List of admin-filled sections
   - "Review & Complete Onboarding" link
   - Branding (logo, colors if configured)
```

**2.5 Client Review Flow**
```
1. Copy the review link from email
2. Open in new incognito window (simulate client)
3. Paste URL: http://localhost:3000/onboarding/[token]/review
```

**Expected:** 
- Review page loads
- Shows all admin-filled responses
- All fields are editable
- "Review Notes" text area visible
- "Approve & Finalize" button visible

**2.6 Client Edits Responses**
```
1. Change 2-3 field values
2. Add text in "Review Notes": "Looks good, made a few corrections"
3. Click "Approve & Finalize"
```

**Expected:** 
- Success toast notification
- Redirected or shown confirmation message
- AI analysis triggered

**2.7 Verify Final State**
```
1. Back in admin view, go to: http://localhost:3000/platform/onboarding
2. Find test session
3. Click "View Details"
4. Verify:
   - Status: "Completed"
   - Completion mode: "Manual (Admin Filled)"
   - Client review section shows:
     * "Reviewed By Client" timestamp
     * Review notes: "Looks good, made a few corrections"
```

**Expected Results:**
- ✅ Client received email
- ✅ Client could review and edit
- ✅ Client's edits merged with admin data
- ✅ Review notes saved
- ✅ AI analysis triggered after client approval
- ✅ Todos generated

---

## 🧪 **TEST 3: Hybrid (Admin Fills Some, Client Fills Rest)**

**Goal:** Admin completes certain sections, delegates others to client, both contribute

### Step-by-Step

**3.1 Create Project in Hybrid Mode**
```
1. Navigate to: http://localhost:3000/platform/projects/new
2. Fill in project details:
   - Name: "Test Hybrid Onboarding 3"
   - Description: "Testing hybrid workflow"
   - Client Name: "Bob Johnson"
   - Client Email: "[YOUR_TEST_EMAIL]"
3. Enable onboarding, select template with 4+ sections
4. Select mode: "I'll fill some sections, client fills the rest"
5. Create & start onboarding
```

**3.2 Admin Fills Some Sections**
```
1. In manual onboarding form, locate first 2 sections
2. Fill out these sections completely (all required fields)
3. Scroll to next 2 sections
4. For each of these sections, check "Delegate to client" checkbox
5. Verify:
   - Delegated sections show "Client Pending" badge
   - Form fields in delegated sections are disabled/grayed out
```

**3.3 Send to Client**
```
1. Scroll to bottom
2. Toggle "Finalize now" OFF (important!)
3. Click "Send for Client Review"
```

**Expected:** 
- Email sent to client
- Session status: "pending_review"

**3.4 Client Completes Delegated Sections**
```
1. Open email, click review link (incognito window)
2. Verify review page shows:
   - Section 1 & 2: Read-only (admin-filled), but editable
   - Section 3 & 4: Fully editable (delegated to client)
3. Fill out sections 3 & 4 completely
4. Optionally edit section 1 or 2
5. Add review notes: "Completed my sections"
6. Click "Approve & Finalize"
```

**3.5 Verify Hybrid Attribution**
```
1. Back in admin view, navigate to session details
2. Look for "Completion Breakdown" card
3. Verify each section shows correct attribution:
   - Section 1: Badge "Admin"
   - Section 2: Badge "Admin"
   - Section 3: Badge "Client"
   - Section 4: Badge "Client"
4. Verify timestamps for each section
```

**Expected Results:**
- ✅ Admin filled 2 sections
- ✅ Client filled 2 sections
- ✅ Attribution tracked per section in completed_by_sections
- ✅ Completion breakdown visible in session details
- ✅ Mixed badges: "Admin" and "Client"
- ✅ AI analysis triggered after all sections complete

**3.6 Check Database (Optional)**
```
SQL Query:
SELECT 
  id, 
  completion_mode, 
  completed_by_sections,
  status
FROM client_onboarding_sessions 
WHERE project_id = '[project_id]';

Expected:
- completion_mode = 'hybrid'
- completed_by_sections = { section1: {completed_by: 'user_xxx'}, section3: {completed_by: 'client_token'} }
- status = 'completed'
```

---

## 🧪 **TEST 4: Convert Abandoned Session**

**Goal:** Client starts onboarding, abandons it, admin converts to manual and completes

### Step-by-Step

**4.1 Create Client-Started Session**
```
Option A (Quick - Modify Database):
1. Create a regular client onboarding session
2. Manually update in database:
   UPDATE client_onboarding_sessions 
   SET 
     status = 'in_progress',
     updated_at = NOW() - INTERVAL '8 days'
   WHERE id = '[session_id]';

Option B (Real Flow):
1. Create project with "Send invitation to client" mode
2. As client, start onboarding via email link
3. Fill 1-2 sections only
4. Abandon (don't complete)
5. Wait (or manually update updated_at to 8 days ago)
```

**4.2 Identify Abandoned Session**
```
1. Navigate to: http://localhost:3000/platform/onboarding
2. Look for session with:
   - Status: "In Progress"
   - Completion mode: "Client"
   - "Abandoned" badge (red, 7+ days inactive)
```

**4.3 Convert to Manual**
```
1. Find abandoned session in list
2. Click actions dropdown (⋮)
3. Click "Convert to Manual"
4. Confirm in dialog: "Convert & Continue"
```

**Expected:** 
- Success toast: "Session converted to manual onboarding"
- Redirected to manual onboarding form
- Client's partial responses preserved in form

**4.4 Continue from Client's Progress**
```
1. Verify form shows:
   - Sections client filled: Already have data (preserved)
   - Sections client didn't fill: Empty, ready for admin
2. Fill remaining sections
3. Toggle "Finalize now" ON
4. Click "Finalize Onboarding"
```

**4.5 Verify Mixed Attribution**
```
1. Go to session details
2. Check completion mode: Should show "Manual (Admin Filled)" or "Hybrid"
3. Look for attribution indicators:
   - Early sections: Completed by client (before abandonment)
   - Later sections: Completed by admin (after conversion)
```

**Expected Results:**
- ✅ Client's partial data preserved
- ✅ Admin completed remaining sections
- ✅ Completion mode changed from 'client' to 'manual'
- ✅ Attribution shows mixed (client early, admin later)
- ✅ Session marked as completed
- ✅ No data loss

---

## ✅ **Success Criteria Summary**

### Test 1: Full Manual
- [x] Admin can fill entire onboarding alone
- [x] Finalize toggle works correctly
- [x] No client email sent when finalized immediately
- [x] AI analysis triggers
- [x] Session marked with correct completion mode

### Test 2: Manual with Review
- [x] Admin can send filled onboarding for client review
- [x] Client receives email with review link
- [x] Client can view admin-filled data
- [x] Client can edit any field
- [x] Client can approve & finalize
- [x] Review notes saved
- [x] AI analysis triggers after client approval

### Test 3: Hybrid
- [x] Admin can delegate specific sections to client
- [x] Delegated sections are disabled for admin
- [x] Client receives email
- [x] Client completes delegated sections
- [x] Attribution tracked per section
- [x] Completion breakdown visible in UI
- [x] Mixed badges display correctly

### Test 4: Convert Abandoned
- [x] Abandoned sessions identified (7+ days)
- [x] Convert action available in UI
- [x] Client's partial data preserved
- [x] Admin can continue from client's progress
- [x] Mixed attribution visible
- [x] Session completes successfully

---

## 🐛 **Common Issues & Troubleshooting**

### Issue: Email not received
**Solution:** 
- Check email service configuration (Resend API key in .env)
- Check spam folder
- Verify email template exists in notification_templates table
- Check console for email sending errors

### Issue: Auto-save not working
**Solution:**
- Check browser console for errors
- Verify saveManualSectionAction is called every 30s
- Check network tab for API calls
- Ensure isSaving state isn't stuck

### Issue: Form fields not saving
**Solution:**
- Check responses state in React DevTools
- Verify handleFieldChange updates state correctly
- Check database after save to confirm persistence
- Look for validation errors in console

### Issue: Session not found after creation
**Solution:**
- Check database for session record
- Verify createOnboardingSession returns sessionId
- Check redirect logic after creation
- Ensure session is linked to project

### Issue: Completion mode badge not showing
**Solution:**
- Verify completion_mode field in database
- Check badge rendering logic in component
- Ensure session is fetched with all fields
- Refresh page to clear cache

### Issue: Client review link doesn't work
**Solution:**
- Verify accessToken is generated
- Check token hasn't expired
- Ensure client review page route exists
- Verify getOnboardingSessionByToken query works

---

## 📊 **Testing Report Template**

After completing all tests, fill out this report:

```markdown
# Manual Onboarding System Test Report

**Date:** [Date]
**Tester:** [Your Name]
**Environment:** Development
**Browser:** [Chrome/Firefox/Safari] [Version]

## Test Results

| Test | Status | Notes |
|------|--------|-------|
| 1. Full Manual | ✅ Pass / ❌ Fail | [Any issues] |
| 2. Manual with Review | ✅ Pass / ❌ Fail | [Any issues] |
| 3. Hybrid | ✅ Pass / ❌ Fail | [Any issues] |
| 4. Convert Abandoned | ✅ Pass / ❌ Fail | [Any issues] |

## Issues Found

1. [Issue description]
   - Severity: Critical/High/Medium/Low
   - Steps to reproduce
   - Expected vs Actual behavior

## Recommendations

1. [Recommendation]

## Overall Assessment

- [ ] Ready for production
- [ ] Needs minor fixes
- [ ] Needs major fixes
- [ ] Requires redesign

**Notes:** [Additional comments]
```

---

## 🚀 **Next Steps After Testing**

### If All Tests Pass ✅
1. Mark Test 12 as complete
2. Update MANUAL_ONBOARDING_COMPLETE.md to 100%
3. Consider production deployment
4. Create user documentation
5. Train team on new workflows

### If Tests Fail ❌
1. Document all issues found
2. Prioritize by severity
3. Fix critical bugs first
4. Retest failed scenarios
5. Repeat until all pass

---

**Good luck with testing!** 🎯

Remember to test in a clean browser session and check both happy paths and edge cases. Take notes of any unexpected behavior for debugging.
