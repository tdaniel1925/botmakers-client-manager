# Environment Variables Setup

## Required for Logo Uploads

Logo uploads use **UploadThing**, which is already configured in your project!

You need to add UploadThing credentials to your `.env.local` file:

```env
# UploadThing (for file uploads & logo uploads)
UPLOADTHING_SECRET=your_uploadthing_secret_key_here
UPLOADTHING_APP_ID=your_uploadthing_app_id_here
```

### How to Get Your UploadThing Keys:

1. **Go to UploadThing Dashboard:** https://uploadthing.com/dashboard
2. **Sign in** (or create a free account)
3. **Create a new app** (if you haven't already)
4. **Copy your API keys:**
   - `UPLOADTHING_SECRET` (Secret Key)
   - `UPLOADTHING_APP_ID` (App ID)
5. **Add them to your `.env.local` file**

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

# UploadThing (for file uploads & logos)
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# OpenAI
OPENAI_API_KEY=your_openai_key

# SMS (Twilio) - Optional
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
```

### After adding the keys:

1. **Stop your dev server** (Ctrl+C)
2. **Restart it:** `npm run dev`
3. **Try uploading a logo again** - it will now work!

---

## Alternative: Use Direct URL Instead

If you don't want to set up UploadThing right now, you can:

1. Upload your logo to any image hosting service (Imgur, Cloudinary, etc.)
2. Copy the direct image URL
3. Paste it in the "Logo URL (Light Background)" field on the branding page
4. Click "Save Changes"

This bypasses the upload feature entirely.

---

## Why UploadThing?

✅ **Already integrated** - Your project uses UploadThing for onboarding file uploads  
✅ **Free tier available** - 2GB storage, 10GB bandwidth  
✅ **No additional setup** - Just add your API keys  
✅ **Automatic CDN** - Fast global delivery  
✅ **Secure** - Files are stored safely
