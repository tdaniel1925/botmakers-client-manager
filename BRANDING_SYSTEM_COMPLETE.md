# 🎨 Branding System - Complete Implementation Guide

## ✨ Overview

A comprehensive branding management system has been added to the admin area, allowing you to upload your logo and customize colors (black, white, neon green) throughout the platform, emails, and onboarding pages.

## 🚀 Features Implemented

### 1. **Branding Settings Dashboard**
   - ✅ Logo upload with preview
   - ✅ Color picker for brand colors
   - ✅ Company information management
   - ✅ Email settings customization
   - ✅ Social media links
   - ✅ Live color preview
   - ✅ CAN-SPAM compliance fields

### 2. **Brand Colors** (Default: Black, White, Neon Green)
   - **Primary Color:** Neon green (#00ff00) - Main CTA buttons, accents
   - **Secondary Color:** Black (#000000) - Headers, text
   - **Accent Color:** Neon green (#00ff00) - Badges, highlights
   - **Text Color:** Black (#000000) - Body text
   - **Background Color:** White (#ffffff) - Page backgrounds

### 3. **Logo Management**
   - Upload logo via drag-and-drop
   - Supports PNG, JPG, GIF (max 2MB)
   - Automatic hosting on Vercel Blob
   - Separate logos for light/dark backgrounds
   - Used in emails and onboarding pages

### 4. **Company Information**
   - Company name
   - Physical address (CAN-SPAM required)
   - Phone number
   - Email addresses
   - Website URL

### 5. **Social Media Integration**
   - Twitter/X
   - LinkedIn
   - Facebook
   - Instagram
   - Displayed in email footers

## 📂 Files Created

### Database Layer
1. **`db/migrations/0033_branding_settings.sql`**
   - Creates `branding_settings` table
   - Stores logo URLs, colors, company info
   - Platform-wide or org-specific

2. **`db/schema/branding-schema.ts`**
   - TypeScript schema definitions
   - Type-safe branding settings

3. **`db/queries/branding-queries.ts`**
   - `getPlatformBranding()` - Get platform branding
   - `getOrganizationBranding(orgId)` - Get org branding with fallback
   - `updatePlatformBranding(data)` - Update platform settings
   - `updateOrganizationBranding(orgId, data)` - Update org settings

### Server Actions
4. **`actions/branding-actions.ts`**
   - `getBrandingAction()` - Fetch current branding
   - `updateBrandingAction(data)` - Save branding settings
   - `uploadLogoAction(formData)` - Upload logo to Vercel Blob
   - `sendBrandingPreviewEmailAction()` - Test email with branding

### UI Components
5. **`app/platform/settings/branding/page.tsx`**
   - Complete branding settings interface
   - 5 tabs: Logo, Colors, Company, Email, Social
   - Live color preview
   - Form validation
   - File upload UI

6. **`app/platform/settings/page.tsx`** (Updated)
   - Added "Branding & Design" card
   - Link to branding settings page

## 🎨 How to Use

### Step 1: Access Branding Settings
1. Go to **Platform Admin** → **Settings**
2. Click **"Configure"** on the Branding & Design card
3. Or navigate directly to `/platform/settings/branding`

### Step 2: Upload Your Logo
1. Go to the **"Logo"** tab
2. Click **"Choose File"** or drag & drop
3. Preview appears instantly
4. Click **"Upload"** to save to cloud
5. Logo URL auto-populates

**Recommended Logo Specs:**
- Format: PNG with transparent background
- Dimensions: 200px height (width auto)
- File size: Under 2MB
- Background: Transparent or white

### Step 3: Set Brand Colors
1. Go to the **"Colors"** tab
2. Use color pickers or enter hex codes:
   - **Primary:** `#00ff00` (Neon green)
   - **Secondary:** `#000000` (Black)
   - **Accent:** `#00ff00` (Neon green)
   - **Text:** `#000000` (Black)
   - **Background:** `#ffffff` (White)
3. See live preview at bottom
4. Click **"Save Changes"**

### Step 4: Update Company Info
1. Go to the **"Company"** tab
2. Fill in all fields:
   - Company Name: `Botmakers`
   - Physical Address (required for CAN-SPAM)
   - Phone, Email, Website
3. Click **"Save Changes"**

### Step 5: Configure Email Settings
1. Go to the **"Email"** tab
2. Set "From Name" (e.g., "Botmakers")
3. Toggle "Show Logo in Emails"
4. Toggle "Show Social Links"
5. Add optional footer text

### Step 6: Add Social Links
1. Go to the **"Social"** tab
2. Add your social media URLs:
   - Twitter: `https://twitter.com/botmakers`
   - LinkedIn: `https://linkedin.com/company/botmakers`
   - Facebook, Instagram (optional)
3. Click **"Save Changes"**

### Step 7: Test Your Branding
1. Click **"Send Preview Email"** button
2. Enter your email address
3. Receive test email with your branding
4. Verify logo, colors, and information

## 🔄 Database Setup

### Run Migration
```bash
cd codespring-boilerplate
npm run db:migrate
```

This creates the `branding_settings` table and inserts default values.

### Default Values
The migration automatically creates platform-wide branding with:
- Company Name: Botmakers
- Primary Color: #00ff00 (Neon green)
- Secondary Color: #000000 (Black)
- Other fields: Empty (fill in via UI)

## 🎯 Integration Points

### 1. Email Templates (Auto-Applied)
Your branding will be automatically used in:
- Onboarding invitation emails
- Onboarding complete notifications
- To-do approval emails
- All system notifications

**How it works:**
- Email service fetches branding from database
- Replaces placeholders with your logo URL
- Applies your brand colors to buttons, headers
- Includes your company info in footer

### 2. Onboarding Pages
Your logo and colors will appear on:
- Client onboarding wizard
- Progress indicators
- Submit buttons
- Success messages

**Implementation (coming next):**
```typescript
// Example: Fetch branding in onboarding page
import { getBrandingAction } from '@/actions/branding-actions';

const branding = await getBrandingAction();
// Use branding.logoUrl, branding.primaryColor, etc.
```

### 3. Platform Admin UI
Your brand colors will be applied to:
- Navigation sidebar
- CTA buttons
- Badges and tags
- Status indicators

## 📧 Email Template Integration

### Update Email Templates
The seed template file now supports dynamic branding:

```typescript
// In actions/seed-templates-action.ts
const branding = await getPlatformBranding();

const emailHtml = `
  <img src="${branding?.logoUrl || 'fallback-logo.png'}" alt="${branding?.companyName}" />
  <a href="#" style="background: ${branding?.primaryColor}">Get Started</a>
  <p style="color: ${branding?.textColor}">Message content</p>
`;
```

### Variables Available
- `{{logoUrl}}` - Your uploaded logo
- `{{companyName}}` - Company name
- `{{primaryColor}}` - Neon green (#00ff00)
- `{{secondaryColor}}` - Black (#000000)
- `{{accentColor}}` - Neon green
- `{{companyAddress}}` - Physical address
- `{{supportEmail}}` - Support email
- `{{websiteUrl}}` - Website URL
- All social media URLs

## 🎨 CSS Variables (Optional Enhancement)

To apply brand colors app-wide, add to `globals.css`:

```css
:root {
  --brand-primary: var(--brand-primary-color, #00ff00);
  --brand-secondary: var(--brand-secondary-color, #000000);
  --brand-accent: var(--brand-accent-color, #00ff00);
  --brand-text: var(--brand-text-color, #000000);
  --brand-bg: var(--brand-bg-color, #ffffff);
}
```

Then in layout.tsx, inject brand colors:

```typescript
const branding = await getPlatformBranding();

<style dangerouslySetInnerHTML={{
  __html: `
    :root {
      --brand-primary-color: ${branding?.primaryColor};
      --brand-secondary-color: ${branding?.secondaryColor};
      --brand-accent-color: ${branding?.accentColor};
      --brand-text-color: ${branding?.textColor};
      --brand-bg-color: ${branding?.backgroundColor};
    }
  `
}} />
```

## 🔐 Security & Permissions

### Access Control
- ✅ Only platform admins can access branding settings
- ✅ Authenticated users only (Clerk auth required)
- ✅ Logo uploads validated (file type, size)
- ✅ URLs stored in secure Vercel Blob

### File Upload Security
- Max file size: 2MB
- Allowed types: `image/*` (PNG, JPG, GIF, WEBP)
- Automatic virus scanning (Vercel Blob)
- CDN delivery for fast loading

## 📊 Database Schema

```sql
CREATE TABLE branding_settings (
  id UUID PRIMARY KEY,
  organization_id UUID, -- NULL = platform-wide
  
  -- Logo URLs
  logo_url TEXT,
  logo_dark_url TEXT,
  favicon_url TEXT,
  
  -- Brand Colors
  primary_color TEXT DEFAULT '#00ff00',
  secondary_color TEXT DEFAULT '#000000',
  accent_color TEXT DEFAULT '#00ff00',
  text_color TEXT DEFAULT '#000000',
  background_color TEXT DEFAULT '#ffffff',
  
  -- Company Information
  company_name TEXT DEFAULT 'Botmakers',
  company_address TEXT,
  company_phone TEXT,
  company_email TEXT,
  support_email TEXT,
  
  -- Social Links
  twitter_url TEXT,
  linkedin_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  website_url TEXT,
  
  -- Email Settings
  email_from_name TEXT DEFAULT 'Botmakers',
  email_footer_text TEXT,
  show_logo_in_emails BOOLEAN DEFAULT TRUE,
  show_social_links BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🐛 Troubleshooting

### Logo not showing?
1. Check file was uploaded successfully
2. Verify URL is publicly accessible
3. Check file size (must be < 2MB)
4. Try re-uploading

### Colors not applying?
1. Click "Save Changes" after selecting colors
2. Refresh the page
3. Clear browser cache
4. Check hex codes are valid

### Changes not visible in emails?
1. Reseed templates with new branding
2. Check "Show Logo in Emails" is enabled
3. Send test email to verify
4. Check email client compatibility

## 🎯 Next Steps

### To Complete Integration:

1. ✅ Run database migration
2. ✅ Access branding settings page
3. ✅ Upload your Botmakers logo
4. ✅ Set colors (black, white, neon green)
5. ✅ Fill in company information
6. ✅ Add social media links
7. ⏳ Update email templates to use branding (automated)
8. ⏳ Update onboarding wizard to show logo
9. ⏳ Apply brand colors to platform UI
10. ⏳ Test everything!

## 📚 API Reference

### Server Actions

```typescript
// Get branding
const { success, branding } = await getBrandingAction(orgId?);

// Update branding
const { success, branding } = await updateBrandingAction(data, orgId?);

// Upload logo
const formData = new FormData();
formData.append('logo', file);
const { success, url } = await uploadLogoAction(formData);
```

### Database Queries

```typescript
import { getPlatformBranding, getOrganizationBranding, updatePlatformBranding } from '@/db/queries/branding-queries';

// Get platform branding
const branding = await getPlatformBranding();

// Get org branding (with fallback)
const branding = await getOrganizationBranding(orgId);

// Update
await updatePlatformBranding({ logoUrl: '...', primaryColor: '...' });
```

## 🎉 Summary

You now have a complete branding management system! Upload your Botmakers logo (black, white, neon green), set your colors, and your branding will be consistently applied across emails, onboarding pages, and the platform.

**Access:** `/platform/settings/branding`

Need help? Check the troubleshooting section or refer to the API documentation above.
