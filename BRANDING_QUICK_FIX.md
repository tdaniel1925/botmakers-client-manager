# Branding Quick Fixes

## Issue 1: Logo Upload Not Working ❌

**Error:** `BlobError: No token found`

**Fix:** Add Vercel Blob token to your environment variables

### Option A: Add Environment Variable (Recommended)

1. **Create/Edit `.env.local` in the `codespring-boilerplate` folder:**

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX
```

2. **Get your token from Vercel:**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to **Storage** tab
   - Create a Blob Store (if needed)
   - Copy the `BLOB_READ_WRITE_TOKEN`

3. **Restart dev server:**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Option B: Use Direct URL (Quick Workaround)

1. Upload your logo to Imgur, Cloudinary, or any image host
2. Copy the direct image URL
3. Paste it in "Logo URL (Light Background)" field
4. Click "Save Changes"

---

## Issue 2: Website URL Not Showing in Emails ❌

**Problem:** Email footer had hardcoded social links that didn't use your website URL variable

**Fix:** Updated email templates to show website link dynamically

### What Changed:

**Before:**
- Footer showed Twitter | LinkedIn | Website (always)
- Even if URLs were empty

**After:**
- Footer shows "🌐 Visit Website" linked to your actual website
- Clean, simple design
- Uses your saved `{{websiteUrl}}`

### To Apply the Fix:

1. **Go to:** `http://localhost:3000/platform/settings/branding`

2. **Make sure your Website URL is set** (Social tab):
   - Should be: `https://botmakers.com` (or your actual site)

3. **Reseed the email templates:**
   - Open browser console (F12)
   - Run this in console:
   ```javascript
   fetch('/api/seed-templates', { method: 'POST' })
     .then(r => r.json())
     .then(console.log)
   ```
   
   OR create a button in your UI to trigger template reseeding

4. **Test with Preview Email:**
   - Click "Preview Email" button
   - Scroll to footer
   - You should see "🌐 Visit Website" linked to https://botmakers.com

---

## Summary of What's Fixed:

✅ **Website link now appears in email footers**  
✅ **Cleaner footer design** (no empty social links)  
✅ **Company address shows** (CAN-SPAM compliant)  
✅ **Support email linked** in footer  
✅ **Unsubscribe link** included  

---

## Current Status:

### ✅ Working:
- Company name
- Company address
- Phone number
- Support email
- All colors
- Email settings
- Website URL (once templates are reseeded)

### ⚠️ Needs Token:
- Logo upload (needs `BLOB_READ_WRITE_TOKEN`)

### Workaround:
- Use direct URL instead of uploading

---

**Next Steps:**

1. Add `BLOB_READ_WRITE_TOKEN` to `.env.local`
2. Restart dev server
3. Upload your logo
4. Verify website link shows in email preview

Everything else is saving correctly! 🎉
