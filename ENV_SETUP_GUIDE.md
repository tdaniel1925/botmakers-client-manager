# Environment Variables Setup

## Required for Logo Uploads

You need to add Vercel Blob credentials to your `.env.local` file:

```env
# Vercel Blob Storage (for logo uploads)
BLOB_READ_WRITE_TOKEN=your_token_here
```

### How to Get Your Vercel Blob Token:

1. **Go to Vercel Dashboard:** https://vercel.com/dashboard
2. **Select your project**
3. **Go to Storage tab**
4. **Create a new Blob Store** (if you haven't already)
5. **Copy the `BLOB_READ_WRITE_TOKEN`**
6. **Add it to your `.env.local` file**

OR if you already have a token in Vercel's environment variables:

1. Go to **Settings** → **Environment Variables**
2. Find `BLOB_READ_WRITE_TOKEN`
3. Copy the value
4. Add to `.env.local`

### Your `.env.local` should look like:

```env
# Database
DATABASE_URL=your_database_url

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Email (Resend)
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=onboarding@yourdomain.com

# Vercel Blob (for logos)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX

# OpenAI
OPENAI_API_KEY=your_openai_key
```

### After adding the token:

1. **Stop your dev server** (Ctrl+C)
2. **Restart it:** `npm run dev`
3. **Try uploading a logo again**

---

## Alternative: Use Direct URL Instead

If you don't want to set up Vercel Blob right now, you can:

1. Upload your logo to any image hosting service (Imgur, Cloudinary, etc.)
2. Copy the direct image URL
3. Paste it in the "Logo URL (Light Background)" field on the branding page
4. Click "Save Changes"

This bypasses the Vercel Blob upload entirely.
