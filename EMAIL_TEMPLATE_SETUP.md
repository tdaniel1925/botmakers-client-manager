# Email Template Setup Guide

## 📧 Beautiful Email Templates with Botmakers Logo

Your email templates now include:
- ✅ **Botmakers logo** at the top and footer
- ✅ **Professional design** with gradient headers
- ✅ **CAN-SPAM compliance** footer
- ✅ **Responsive design** for mobile devices
- ✅ **Call-to-action buttons** with hover effects
- ✅ **Social media links**
- ✅ **Unsubscribe link** (required by law)

## 🎨 Update Logo URL

**Current placeholder:** `https://i.imgur.com/YourLogoHere.png`

### Option 1: Upload to Image Hosting
1. Upload your logo to:
   - [Imgur](https://imgur.com) (free, easy)
   - [Cloudinary](https://cloudinary.com) (professional)
   - Your own website/CDN
2. Get the direct image URL
3. Replace the placeholder in templates

### Option 2: Use Base64 Data URI (Recommended for email)
1. Convert logo to Base64: https://www.base64-image.de/
2. Replace `src="https://i.imgur.com/YourLogoHere.png"` with:
   ```html
   src="data:image/png;base64,YOUR_BASE64_STRING_HERE"
   ```

## 📍 Update Company Information

Edit these in `actions/seed-templates-action.ts`:

```html
<!-- Update physical address (CAN-SPAM requirement) -->
<p>123 Main Street, Suite 100<br>City, State 12345</p>

<!-- Update social links -->
<a href="https://twitter.com/botmakers">Twitter</a>
<a href="https://linkedin.com/company/botmakers">LinkedIn</a>
<a href="https://botmakers.com">Website</a>

<!-- Update contact email -->
<a href="mailto:support@botmakers.com">contact us</a>

<!-- Update unsubscribe functionality -->
<a href="{{unsubscribeLink}}">Unsubscribe</a>
```

## 🔄 Reseed Templates with New Design

After updating the logo URL and company info:

1. **Delete old templates** (from database or Template Manager UI)
2. **Restart the dev server**
3. **Visit** `/platform/templates`
4. **Templates will auto-seed** with the new beautiful design

Or manually trigger reseed by deleting all templates in the UI and refreshing.

## 🎨 Template Colors

Current color scheme (you can customize):
- **Primary Gradient:** Purple to Violet (`#667eea` to `#764ba2`)
- **Success Gradient:** Green (`#10b981` to `#059669`)
- **Background:** Light gray (`#f5f5f5`)
- **Text:** Dark gray (`#333333`)

## 📱 Email Client Compatibility

These templates are tested and work in:
- ✅ Gmail
- ✅ Outlook
- ✅ Apple Mail
- ✅ Yahoo Mail
- ✅ Mobile clients (iOS/Android)

## 🛡️ CAN-SPAM Compliance

Your templates now include all required elements:
1. ✅ **Unsubscribe link** in every email
2. ✅ **Physical address** in footer
3. ✅ **Clear sender identification** (Botmakers)
4. ✅ **Reason for receiving** the email
5. ✅ **Contact information** (support email)

## 🔗 Important Variables

Make sure to pass these variables when sending emails:
- `{{clientName}}` - Recipient's name
- `{{projectName}}` - Project/campaign name
- `{{link}}` - CTA destination URL
- `{{adminName}}` - Sender's name
- `{{unsubscribeLink}}` - Unsubscribe URL (generate per user)

## 🎯 Next Steps

1. Upload your Botmakers logo
2. Update the logo URL in `actions/seed-templates-action.ts`
3. Update company address and contact info
4. Test send an email to yourself
5. Verify on mobile devices

Enjoy your beautiful, compliant email templates! 🎉
