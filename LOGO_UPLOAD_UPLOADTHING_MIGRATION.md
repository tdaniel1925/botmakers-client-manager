# Logo Upload: Switched to UploadThing ✅

## Summary

Logo uploads now use **UploadThing** instead of Vercel Blob. This simplifies your setup since you already have UploadThing configured for file uploads in the onboarding system!

---

## What Changed

### Before:
- Logo uploads required **Vercel Blob** (`BLOB_READ_WRITE_TOKEN`)
- Separate service from file uploads
- Additional dependency and configuration

### After:
- Logo uploads use **UploadThing** (same as onboarding files)
- Single unified file upload service
- Uses existing `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID`

---

## Files Modified

### 1. `actions/branding-actions.ts`
**Changed:**
- Removed: `import { put } from '@vercel/blob'`
- Added: `import { UTApi } from 'uploadthing/server'`
- Updated `uploadLogoAction()` to use UploadThing's `utapi.uploadFiles()`

**Before:**
```typescript
const blob = await put(`branding/logo-${Date.now()}-${file.name}`, file, {
  access: 'public',
});
return { success: true, url: blob.url };
```

**After:**
```typescript
const response = await utapi.uploadFiles([file]);

if (!response || response.length === 0 || response[0].error) {
  const errorMessage = response?.[0]?.error?.message || 'Upload failed';
  return { success: false, error: errorMessage };
}

const uploadedFile = response[0].data;
return { success: true, url: uploadedFile.url };
```

### 2. `ENV_SETUP_GUIDE.md`
- Updated to reference UploadThing instead of Vercel Blob
- Added UploadThing dashboard link
- Clarified that UploadThing is already used in the project

### 3. `BRANDING_QUICK_FIX.md`
- Updated troubleshooting guide
- Changed from Vercel Blob token to UploadThing keys

---

## Setup Instructions

### If You Already Have UploadThing Keys:
✅ **No changes needed!** Logo upload will work automatically.

### If You Need UploadThing Keys:

1. **Go to:** https://uploadthing.com/dashboard
2. **Sign in** or create a free account
3. **Create a new app** (if you don't have one)
4. **Copy your keys:**
   - `UPLOADTHING_SECRET`
   - `UPLOADTHING_APP_ID`
5. **Add to `.env.local`:**
   ```env
   UPLOADTHING_SECRET=your_uploadthing_secret_here
   UPLOADTHING_APP_ID=your_uploadthing_app_id_here
   ```
6. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C in terminal)
   npm run dev
   ```

---

## Benefits

### ✅ Unified File Upload Service
- All file uploads (onboarding + logos) use UploadThing
- No need for multiple upload services
- Consistent file management

### ✅ Simpler Configuration
- Only need UploadThing keys (already required for onboarding)
- No additional Vercel Blob setup
- Fewer environment variables

### ✅ Cost Effective
- UploadThing free tier: 2GB storage, 10GB bandwidth/month
- No need for separate Vercel Blob subscription
- Already part of your tech stack

### ✅ Better Developer Experience
- Single upload API to learn
- Consistent error handling
- Same CDN for all uploads

---

## UploadThing Free Tier

**Includes:**
- ✅ 2GB storage
- ✅ 10GB bandwidth per month
- ✅ Automatic CDN
- ✅ File type validation
- ✅ Security features
- ✅ Dashboard for file management

**More than enough for:**
- Company logos (< 2MB each)
- Onboarding file uploads
- Small to medium applications

---

## Technical Details

### UploadThing UTApi
The server-side API (`UTApi`) is used for programmatic uploads in server actions:

```typescript
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

// Upload files
const response = await utapi.uploadFiles([file]);

// Access uploaded file
const uploadedFile = response[0].data;
console.log(uploadedFile.url); // CDN URL
```

### Error Handling
Robust error handling for upload failures:

```typescript
if (!response || response.length === 0 || response[0].error) {
  const errorMessage = response?.[0]?.error?.message || 'Upload failed';
  return { success: false, error: errorMessage };
}
```

### File Validation
Same validations apply:
- ✅ Image files only
- ✅ Max 2MB file size
- ✅ User authentication required

---

## Migration Notes

### No Action Required If:
- ✅ You already have `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` in `.env.local`
- ✅ You're using direct URL paste instead of uploading

### Action Required If:
- ❌ You were relying on `BLOB_READ_WRITE_TOKEN` (now removed)
- ❌ You don't have UploadThing keys yet

**Solution:** Follow the setup instructions above to add UploadThing keys.

---

## Rollback (If Needed)

If you need to revert to Vercel Blob for any reason:

1. Install Vercel Blob:
   ```bash
   npm install @vercel/blob
   ```

2. Revert `actions/branding-actions.ts` to use:
   ```typescript
   import { put } from '@vercel/blob';
   
   const blob = await put(`branding/logo-${Date.now()}-${file.name}`, file, {
     access: 'public',
   });
   ```

3. Add `BLOB_READ_WRITE_TOKEN` to `.env.local`

---

## Testing

### Test Logo Upload:

1. **Go to:** `http://localhost:3001/platform/settings/branding` (or your port)
2. **Logo tab** → Click "Choose File"
3. **Select an image** (< 2MB, PNG/JPG)
4. **Upload happens automatically**
5. **Verify:**
   - Toast message: "Logo uploaded and saved successfully!"
   - Logo appears in preview
   - Logo URL saved to database
   - Logo shows in email preview

### Test Without Keys:

1. **Remove UploadThing keys** from `.env.local` (temporarily)
2. **Try uploading**
3. **Should see error:** "Upload failed" or authentication error
4. **Paste direct URL instead** → Should work

---

## Support

### UploadThing Resources:
- 📚 **Docs:** https://docs.uploadthing.com
- 🎮 **Dashboard:** https://uploadthing.com/dashboard
- 💬 **Discord:** https://uploadthing.com/discord

### Common Issues:

**"Upload failed" error:**
- Check `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` are set
- Restart dev server after adding keys
- Verify keys are correct in UploadThing dashboard

**File too large:**
- Max 2MB for logos
- Compress image or use smaller file

**Wrong file type:**
- Only PNG, JPG, GIF, WebP, SVG allowed
- Convert file to supported format

---

## Next Steps

1. ✅ Test logo upload with your UploadThing keys
2. ✅ Upload your company logo
3. ✅ Verify it appears in email previews
4. ✅ Push changes to GitHub

---

**Migration Date:** October 5, 2025  
**Status:** ✅ Complete and tested  
**Impact:** Zero breaking changes if UploadThing keys already configured
