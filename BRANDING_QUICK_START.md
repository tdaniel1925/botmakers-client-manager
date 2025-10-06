# 🚀 Branding Setup - Quick Start Guide

## ✨ What You Got

A complete branding management system where you can:
- ✅ Upload your Botmakers logo
- ✅ Set brand colors (black, white, neon green)
- ✅ Configure company info for CAN-SPAM compliance
- ✅ Add social media links
- ✅ Apply branding across emails, onboarding pages, and platform

## 🎯 5-Minute Setup

### 1. Access Branding Settings
```
http://localhost:3000/platform/settings/branding
```

Or navigate:
1. **Platform Admin** → **Settings**
2. Click **"Configure"** on "Branding & Design" card

### 2. Upload Your Logo (Logo Tab)
1. Click **"Choose File"** or drag & drop
2. Select your Botmakers logo (PNG with transparent background)
3. See instant preview
4. Click **"Upload"** button
5. Logo URL auto-fills
6. ✅ Done!

**Logo Specs:**
- Format: PNG (transparent background)
- Size: 200px height, under 2MB
- Colors: Black, white, neon green

### 3. Set Brand Colors (Colors Tab)
Click the color picker or paste hex codes:

```
Primary Color:      #00ff00  (Neon green - buttons, CTAs)
Secondary Color:    #000000  (Black - headers, text)
Accent Color:       #00ff00  (Neon green - badges)
Text Color:         #000000  (Black - body text)
Background Color:   #ffffff  (White - backgrounds)
```

See live preview at bottom of page!

### 4. Company Info (Company Tab)
Fill in these fields:

```
Company Name:    Botmakers
Address:         [Your actual business address - required by law]
Phone:           [Your phone number]
Company Email:   hello@botmakers.com
Support Email:   support@botmakers.com
Website:         https://botmakers.com
```

⚠️ **Physical address is required by CAN-SPAM Act for email compliance!**

### 5. Social Links (Social Tab) - Optional
```
Twitter:   https://twitter.com/botmakers
LinkedIn:  https://linkedin.com/company/botmakers
Facebook:  https://facebook.com/botmakers
Instagram: https://instagram.com/botmakers
```

### 6. Save Everything
Click the big **"Save Changes"** button at top right!

## 🎨 Brand Colors Explained

Your Botmakers branding uses three colors:

### 1. **Neon Green** (#00ff00)
- Primary CTA buttons ("Get Started", "Submit")
- Links and interactive elements
- Progress bars and accents
- Email header gradients

### 2. **Black** (#000000)
- Headers and titles
- Body text
- Navigation items
- Icons

### 3. **White** (#ffffff)
- Page backgrounds
- Card backgrounds
- Button text (on green)

This creates a modern, high-contrast, tech-forward look! 🚀

## 📧 Where Your Branding Appears

### Automatically Applied To:
✅ **Email Templates**
- Logo in header and footer
- CTA buttons use your primary color
- Company info in footer
- Social links in footer

✅ **Onboarding Pages** (coming next)
- Logo on wizard header
- Submit buttons use primary color
- Progress indicators
- Success messages

✅ **Platform UI** (coming next)
- Navigation sidebar
- Primary buttons
- Status badges
- Charts and graphs

## 🔄 Test Your Branding

### Option 1: Reseed Email Templates
1. Go to `/platform/templates`
2. Click **"Reseed Templates"** button
3. New templates will include your branding!

### Option 2: Send Test Email (Future)
1. In Branding Settings, scroll to bottom
2. Click **"Send Preview Email"**
3. Enter your email
4. Receive test email with your branding

## 🎯 Next Steps After Setup

### Update Email Templates to Use Branding

The system is ready! Next time you:
- Reseed templates → They'll use your logo & colors
- Send onboarding invite → Client sees your branding
- Client completes onboarding → Emails have your branding

### Apply to Platform UI (Optional)

To apply your colors app-wide, add to components:

```typescript
import { getBrandingAction } from '@/actions/branding-actions';

const branding = await getBrandingAction();

<Button style={{ backgroundColor: branding.primaryColor }}>
  Click Me
</Button>
```

Or use CSS variables (see full guide).

## 🐛 Common Issues

### Logo not showing?
- ✅ Check file was uploaded (see URL filled in)
- ✅ Try different image format (PNG recommended)
- ✅ Verify file size < 2MB
- ✅ Refresh page after upload

### Colors not updating?
- ✅ Click "Save Changes" after picking colors
- ✅ Hard refresh (Ctrl+Shift+R)
- ✅ Check hex codes are valid (#00ff00)

### Can't access branding page?
- ✅ Must be logged in as Platform Admin
- ✅ Check you're on `/platform/settings/branding`
- ✅ Try navigating from Platform Settings

## 📚 Files Created

### Database
- `db/migrations/0033_branding_settings.sql` ✅ Migrated
- `db/schema/branding-schema.ts`
- `db/queries/branding-queries.ts`

### Server Actions
- `actions/branding-actions.ts`

### UI Pages
- `app/platform/settings/branding/page.tsx` ← **Your new branding dashboard!**
- `app/platform/settings/page.tsx` (updated)

### Documentation
- `BRANDING_SYSTEM_COMPLETE.md` ← Full technical docs
- `BRANDING_QUICK_START.md` ← This file!

## 🎉 You're Done!

Your branding system is ready to use! 

**Access it now:** http://localhost:3000/platform/settings/branding

Upload your logo, set those neon green colors, and watch your branding come to life across the entire platform! 🚀✨

---

Need help? See `BRANDING_SYSTEM_COMPLETE.md` for full technical documentation.
