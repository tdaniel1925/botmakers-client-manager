# Phase 0 Setup Guide - Quick Start

**Time Required:** ~30 minutes  
**Goal:** Get email and file upload working

---

## ✅ Step 1: Install Dependencies (5 min)

```bash
cd "C:\Users\tdani\One World Dropbox\Trent Daniel\1 - App Builds\botmakers-client-manager\codespring-boilerplate"

npm install resend react-email @react-email/components @supabase/supabase-js mime-types
npm install --save-dev @types/mime-types
```

---

## ✅ Step 2: Get Resend API Key (5 min)

1. Go to **[resend.com](https://resend.com)**
2. Click **"Sign Up"**
3. Verify your email
4. Go to **Settings → API Keys**
5. Click **"Create API Key"**
6. Copy the key (starts with `re_...`)

**For testing:** Use `onboarding@resend.dev` as from address  
**For production:** Verify your own domain

---

## ✅ Step 3: Get Supabase Keys (3 min)

You already have Supabase for your database!

1. Go to your **Supabase project dashboard**
2. Click **Settings** (gear icon) → **API**
3. Copy these values:
   - Project URL
   - anon/public key
   - service_role key (keep secret!)

---

## ✅ Step 4: Create Storage Bucket (5 min)

1. In Supabase dashboard, click **Storage**
2. Click **"New bucket"**
3. Name: `onboarding-files`
4. **Public:** OFF (keep private)
5. Click **Save**

6. Click **SQL Editor** (left sidebar)
7. Paste and run this:

```sql
-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'onboarding-files');

-- Allow reading
CREATE POLICY "Allow org members to read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'onboarding-files');

-- Allow deleting
CREATE POLICY "Allow org members to delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'onboarding-files');
```

---

## ✅ Step 5: Update .env.local (3 min)

Add these lines to your `.env.local` file:

```bash
# ===== EMAIL (Resend) =====
RESEND_API_KEY="re_your_key_here"
RESEND_FROM_EMAIL="onboarding@resend.dev"

# ===== SUPABASE (File Storage) =====
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# ===== APP URL =====
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## ✅ Step 6: Restart Dev Server (1 min)

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## ✅ Step 7: Test Email (2 min)

1. Open browser: `http://localhost:3000/test/email`
2. Enter your email address
3. Click "Send Test Email"
4. Check your inbox (and spam folder)

**Success:** Email received with "Test Email from ClientFlow"  
**Failure:** Check console for errors, verify RESEND_API_KEY

---

## ✅ Step 8: Test File Upload (2 min)

1. Open browser: `http://localhost:3000/test/upload`
2. Drag and drop a file OR click to browse
3. Wait for upload to complete
4. Go to Supabase → Storage → onboarding-files
5. Verify file is there

**Success:** File appears in Supabase Storage  
**Failure:** Check console, verify bucket exists and RLS policies set

---

## 🎉 You're Done!

Phase 0 is complete and working. You now have:

✅ Email system (Resend)  
✅ File upload system (Supabase Storage)  
✅ Test pages to verify both  
✅ Ready for Phase 1 (Onboarding database)

---

## 🐛 Troubleshooting

### Email not sending?
- Check RESEND_API_KEY is correct
- Use `onboarding@resend.dev` for testing
- Check Resend dashboard for errors

### Upload failing?
- Verify bucket `onboarding-files` exists
- Check RLS policies are set
- Verify Supabase keys are correct
- Check file size < 25MB

### Server won't start?
- Run `npm install` again
- Delete `node_modules` and reinstall
- Check for TypeScript errors

---

## 📚 Next: Phase 1

Once testing is complete, we'll build:
- Onboarding database schema
- Session management
- AI analysis system

See `PRD/PHASE_0_COMPLETE_SUMMARY.md` for detailed docs!



