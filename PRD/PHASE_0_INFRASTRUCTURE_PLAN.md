# Phase 0: Email & File Upload Infrastructure

**For:** AI-Powered Client Onboarding  
**Version:** 1.0  
**Date:** October 2024  
**Status:** In Progress

---

## 🎯 Overview

This document outlines the implementation of critical infrastructure required before building the AI Onboarding system:

1. **Email System** - Resend + React Email for invitations and notifications
2. **File Upload System** - Supabase Storage for asset collection

**Why Phase 0?** These are hard dependencies for onboarding. Without them, clients can't receive invitations or upload assets.

---

## 📦 Installation

### Step 1: Install Dependencies

```bash
# Email system
npm install resend react-email @react-email/components

# Supabase client for file storage  
npm install @supabase/supabase-js

# Utilities
npm install mime-types
npm install --save-dev @types/mime-types
```

### Step 2: Environment Variables

Add to `.env.local`:

```bash
# ===== EMAIL (Resend) =====
RESEND_API_KEY="re_..."

# ===== SUPABASE (File Storage) =====
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# ===== APP CONFIG =====
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Get Keys:**
- **Resend:** [resend.com](https://resend.com) → Settings → API Keys
- **Supabase:** Project Settings → API

---

## 📁 Files Created

### Email System (6 files)

```
lib/
└── email-service.ts              # Core email sending utility

emails/
├── components/
│   └── EmailLayout.tsx           # Shared layout
├── OnboardingInvitation.tsx      # Invitation email
├── OnboardingReminder.tsx        # Reminder email
└── OnboardingComplete.tsx        # Completion email
```

### File Upload System (4 files)

```
lib/
├── supabase-client.ts            # Supabase setup
└── file-upload-service.ts        # Upload utilities

components/
└── file-upload.tsx               # Upload UI component

actions/
└── file-upload-actions.ts        # Server actions
```

---

## 🔧 Implementation Details

### Email Service

**Functions:**
- `sendEmail(to, subject, template)` - Send any email
- `sendOnboardingInvitation(...)` - Send invitation
- `sendOnboardingReminder(...)` - Send reminder
- `sendOnboardingComplete(...)` - Confirmation
- `sendPlatformAdminNotification(...)` - Notify admin

**Features:**
- Error handling and retries
- Email delivery logging
- Template rendering
- From/reply-to configuration

### File Upload Service

**Functions:**
- `uploadFile(file, category, organizationId)` - Upload single
- `uploadMultipleFiles(...)` - Batch upload
- `deleteFile(fileId)` - Remove file
- `getFileUrl(filePath)` - Get download URL
- `validateFile(file)` - Check file type, size

**Limits:**
- Images: 10MB max
- Documents: 25MB max
- Videos: 100MB max

**Allowed Types:**
- Images: jpg, jpeg, png, gif, webp, svg
- Documents: pdf, doc, docx, xls, xlsx, ppt, pptx
- Archives: zip, rar
- Other: txt, csv

---

## 🧪 Testing

### Email Testing
1. Send test invitation
2. Check deliverability
3. Verify formatting
4. Test on mobile
5. Check spam folder

### File Upload Testing
1. Upload various file types
2. Test security/access control
3. Verify progress indicators
4. Test error handling
5. Mobile experience

---

## ✅ Success Criteria

- [ ] Email service sends successfully
- [ ] All templates render correctly
- [ ] Emails not marked as spam
- [ ] File uploads work
- [ ] File validation works
- [ ] Organization scoping correct
- [ ] UI is intuitive
- [ ] Mobile-responsive

---

## ⏱️ Timeline

| Task | Time |
|------|------|
| Install dependencies | 5 min |
| Get API keys | 15 min |
| Email service | 2 hours |
| Email templates | 3 hours |
| File upload service | 2 hours |
| File upload UI | 3 hours |
| Testing | 2 hours |

**Total:** ~13-14 hours (2 days)

---

## 📝 Next Steps

After Phase 0:
1. Phase 1: Onboarding database schema
2. Phase 2: AI analysis system
3. Phase 3: Platform admin UI
4. Phase 4: Client onboarding UI
5. Phase 5: Integration

---

**Status:** 🟡 In Progress



