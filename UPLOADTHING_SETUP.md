# Uploadthing Setup Guide

This project uses **Uploadthing** for file uploads in the client onboarding system.

## Why Uploadthing?

- **Simple & Reliable**: Purpose-built for Next.js/React applications
- **Built-in CDN**: Fast file delivery worldwide
- **Automatic Handling**: No manual storage bucket configuration needed
- **Type-safe**: Full TypeScript support
- **Generous Free Tier**: 2GB storage, 10GB bandwidth/month

---

## Setup Instructions

### 1. Create Uploadthing Account

1. Go to [uploadthing.com](https://uploadthing.com)
2. Sign up with GitHub (fastest) or email
3. Create a new app/project

### 2. Get API Keys

1. In your Uploadthing dashboard, go to **API Keys**
2. Copy your **App ID** and **Secret Key**

### 3. Add Environment Variables

Add these to your `.env.local` file:

```bash
# Uploadthing Configuration
UPLOADTHING_SECRET=your_uploadthing_secret_key_here
UPLOADTHING_APP_ID=your_uploadthing_app_id_here
```

**Important:** 
- Never commit these keys to version control
- Use different keys for development/production
- `.env.local` is already in `.gitignore`

### 4. Restart Dev Server

```bash
npm run dev
```

---

## Configuration

### File Size Limits

Current limits (configurable in `app/api/uploadthing/core.ts`):
- **Images**: 16MB per file, max 10 files
- **PDFs**: 16MB per file, max 10 files
- **Documents** (Word, Excel): 16MB per file, max 10 files
- **Text files** (TXT, CSV): 4MB per file, max 10 files
- **Archives** (ZIP): 25MB per file, max 5 files

### Accepted File Types

- **Images**: JPEG, PNG, GIF, SVG, WebP
- **Documents**: PDF, DOC, DOCX, XLS, XLSX
- **Text**: TXT, CSV
- **Archives**: ZIP

### Upload Endpoints

Two endpoints are configured:

1. **`authenticatedUpload`** - For logged-in users
   - Requires Clerk authentication
   - Used in admin/dashboard uploads

2. **`onboardingUpload`** - For public onboarding forms
   - Token-based authentication
   - Used in client onboarding wizard
   - No login required

---

## Testing

### Test Upload Flow

1. Navigate to: `/test/upload`
2. Select an organization
3. Upload test files
4. Verify files appear in the list

### Test Onboarding Flow

1. Create a new project
2. Generate an onboarding session
3. Open the onboarding link (incognito window)
4. Upload files in the upload step
5. Check admin view to see uploaded files

### Automated Test

Run the automated test suite:
```
http://localhost:3000/test/auto-test-uploads
```

This will:
- Create a test session
- Upload mock files
- Verify files are saved
- Validate file URLs

---

## Troubleshooting

### "Unauthorized" Error

**Problem**: Upload fails with unauthorized error

**Solution**: 
- Check that `UPLOADTHING_SECRET` is set in `.env.local`
- Restart your dev server after adding env vars
- For onboarding uploads, ensure valid token is passed

### Files Not Appearing

**Problem**: Upload succeeds but files don't show in UI

**Solution**:
- Check browser console for errors
- Verify `onUploadComplete` callback is firing
- Check that file data structure matches expected format
- Open Network tab and look for upload response

### Upload Fails Silently

**Problem**: No error shown but upload doesn't work

**Solution**:
- Check Uploadthing dashboard for failed uploads
- Look at server logs for error messages
- Verify file size is within limits
- Check file type is in accepted list

### Invalid App ID

**Problem**: "Invalid app ID" error

**Solution**:
- Verify `UPLOADTHING_APP_ID` matches your dashboard
- Check for typos or extra spaces
- Make sure you're using the correct environment (dev/prod)

---

## Production Deployment

### Environment Variables

Set these in your hosting platform (Vercel, etc.):

```bash
UPLOADTHING_SECRET=sk_live_your_production_secret
UPLOADTHING_APP_ID=your_production_app_id
```

### Recommended Settings

1. **Create separate Uploadthing apps** for dev/staging/production
2. **Enable webhook events** in Uploadthing dashboard for:
   - Upload complete notifications
   - File deletion tracking
3. **Set up monitoring** for:
   - Upload success rates
   - Average upload times
   - Storage usage

### Rate Limits

Free tier limits:
- 2GB total storage
- 10GB bandwidth per month
- Unlimited uploads

Upgrade to paid plan if you exceed these limits.

---

## File Storage Locations

Uploaded files are stored on Uploadthing's CDN with URLs like:

```
https://utfs.io/f/[unique-file-key]
```

Files are:
- **Globally distributed** via CDN
- **Automatically cached** for fast access
- **Secure** with unique, unguessable URLs
- **Permanent** (unless manually deleted)

---

## Support

- **Uploadthing Docs**: [docs.uploadthing.com](https://docs.uploadthing.com)
- **Discord Community**: Join Uploadthing Discord for help
- **GitHub Issues**: Report bugs in the uploadthing repo

---

## Migration from Supabase

If migrating from Supabase Storage:

1. Old files in Supabase remain accessible at their URLs
2. New uploads automatically use Uploadthing
3. No data migration needed (URLs remain in database)
4. Can run both systems in parallel during transition
5. Eventually deprecate Supabase storage bucket

---

## Cost Comparison

| Service | Free Tier | Paid Plans Start |
|---------|-----------|------------------|
| Uploadthing | 2GB storage, 10GB bandwidth | $20/mo for 100GB |
| Supabase Storage | 1GB storage | $25/mo for 100GB |
| AWS S3 | 5GB for 12 months | ~$23/mo for 100GB |
| Cloudinary | 25GB storage, 25GB bandwidth | $89/mo |

**Uploadthing is the most cost-effective for small-medium projects.**
