# AI-Powered Client Onboarding - Testing Guide

## 🎯 Quick Test Checklist

### Prerequisites
- [x] Dev server running (`npm run dev`)
- [ ] OpenAI API key added to `.env.local`
- [ ] Database migrations applied
- [ ] Logged in as platform admin

---

## 📋 Testing Steps

### 1. Access Platform Admin

1. Open browser: `http://localhost:3000`
2. Log in with your account
3. Navigate to `/platform/projects`

### 2. Create Onboarding Session

#### Option A: From Project Page
1. Click on any existing project
2. Scroll to "Client Onboarding" section
3. Click "Create Onboarding Session"
4. Select template type:
   - **Auto-detect (AI)** - Uses OpenAI to detect project type
   - **Web Design** - For website projects
   - **Voice AI Campaign** - For calling campaigns
   - **Software Development** - For software projects
5. Click "Create Session"

#### Option B: Directly Create
1. Go to `/platform/onboarding`
2. Click "Create New Session" (future feature)

### 3. Send Invitation to Client

1. After creating session, click "Send Invitation"
2. Enter client details:
   - **Name:** Test Client
   - **Email:** your-test-email@example.com
3. Click "Send Invitation"
4. Check your email for the invitation

### 4. Test Client Experience

1. Copy the onboarding link from the project page OR click link in email
2. Open link in **incognito/private window** (to test without login)
3. URL format: `http://localhost:3000/onboarding/[token]`

#### Test the Wizard:
- [ ] Welcome step shows project info
- [ ] Progress bar updates correctly
- [ ] Form fields work (text, textarea, select, checkbox, radio, date)
- [ ] File upload works (drag & drop)
- [ ] Auto-save indicator appears
- [ ] "Save & Exit" allows resuming later
- [ ] Navigation (Back/Next) works
- [ ] Review step shows summary
- [ ] Final submission completes

### 5. View Responses (Admin)

1. Go back to `/platform/onboarding`
2. Find your test session in the table
3. Click "View Details"
4. Check tabs:
   - **Overview:** Session info and stats
   - **Responses:** All client answers
   - **Timeline:** Activity history
5. Test actions:
   - [ ] Copy onboarding link
   - [ ] Export responses to CSV
   - [ ] Regenerate access token

### 6. Check Analytics

1. Navigate to `/platform/onboarding/analytics`
2. Verify:
   - [ ] Completion rate card
   - [ ] Template performance chart
   - [ ] Session distribution

---

## 🐛 Troubleshooting

### Issue: "Invalid onboarding link"
**Solution:** 
- Check if token is correct
- Verify session hasn't expired (30 days)
- Try regenerating token from admin panel

### Issue: File upload fails
**Solution:**
- Verify Supabase keys in `.env.local`
- Check bucket exists: `onboarding-files`
- Review RLS policies in Supabase

### Issue: Email not sending
**Solution:**
- Verify `RESEND_API_KEY` in `.env.local`
- Check `RESEND_FROM_EMAIL` is set
- Review Resend dashboard for errors

### Issue: AI template selection not working
**Solution:**
- Verify `OPENAI_API_KEY` in `.env.local`
- Check project has a description
- Fallback to manual template selection

---

## 🎨 UI Components to Test

### Onboarding Wizard
- [x] Progress bar (0-100%)
- [x] Step titles and descriptions
- [x] Auto-save indicator (cloud icon)
- [x] Navigation buttons
- [x] Loading states
- [x] Error messages

### Form Fields
- [x] Text input
- [x] Textarea (multiline)
- [x] Select dropdown
- [x] Checkbox (multiple)
- [x] Radio buttons
- [x] Date picker
- [x] File upload (drag & drop)

### Admin Dashboard
- [x] Sessions table with filters
- [x] Status badges
- [x] Progress bars
- [x] Quick actions dropdown
- [x] Analytics cards
- [x] Export to CSV

---

## 📊 Test Data Examples

### Test Project Descriptions (for AI detection)

**Web Design:**
```
We need a new website for our bakery. Should include an online ordering system, 
menu showcase, and contact form. Modern design with photo gallery.
```

**Voice AI:**
```
Launch an AI calling campaign to reach 5000 leads for our real estate services. 
Need script development, compliance review, and integration with our CRM.
```

**Software Development:**
```
Build a mobile app for iOS and Android. Features include user authentication, 
real-time chat, push notifications, and payment processing.
```

### Test Client Information

- **Name:** John Doe
- **Email:** your-email@example.com (use your real email to test)
- **Company:** Acme Corporation
- **Phone:** (555) 123-4567

---

## ✅ Success Criteria

### Client Onboarding Works If:
- ✅ Client can access onboarding without login
- ✅ All step types render correctly
- ✅ Auto-save prevents data loss
- ✅ File uploads store in Supabase
- ✅ Completion triggers admin notification
- ✅ Responses are viewable in admin panel

### AI Features Work If:
- ✅ Auto-detect chooses correct template
- ✅ Welcome message is personalized
- ✅ Template matches project description
- ✅ Falls back gracefully without OpenAI key

### Admin Features Work If:
- ✅ All sessions visible in dashboard
- ✅ Filters and search work correctly
- ✅ Email invitations send successfully
- ✅ CSV export contains all data
- ✅ Analytics show accurate metrics

---

## 🚀 Advanced Testing

### Multi-Step Resume Test
1. Start onboarding
2. Complete 2-3 steps
3. Close browser
4. Reopen link later
5. Verify progress saved

### File Upload Stress Test
1. Upload multiple files (5-10)
2. Different file types (PDF, images, docs)
3. Large files (up to 25MB)
4. Verify all stored correctly

### Template Comparison
1. Create 3 sessions with different templates
2. Complete each one
3. Compare time to complete
4. Review analytics for each template

---

## 📝 Notes

- Default token expiration: **30 days**
- Max file size: **25MB per file**
- Auto-save interval: **30 seconds**
- Supported file types: Images, PDFs, Docs, Archives

---

## 🆘 Need Help?

If you encounter any issues:
1. Check browser console for errors
2. Review server logs for backend issues
3. Verify all environment variables are set
4. Check database migrations are applied
5. Ensure Supabase bucket exists with RLS policies

---

**Happy Testing! 🎉**
