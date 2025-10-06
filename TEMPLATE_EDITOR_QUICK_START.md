# Template Editor - Quick Start Guide

## 🚀 Getting Started (2 Minutes)

### Access the Template Editor
1. Log in as Platform Admin
2. Click **"Templates"** in the sidebar
3. You'll see all 14 pre-loaded templates

### Edit Your First Template
1. Find "Onboarding Invitation" email template
2. Click **"Edit"** button
3. Make a simple change (e.g., edit the greeting)
4. Click **"Save Changes"**

Done! Your template is updated.

---

## 📝 Editing Templates

### For Email Templates

**Visual Mode (Recommended for beginners):**
```
1. Click "Visual" button
2. Use formatting toolbar (Bold, Italic, Lists, Links)
3. Edit text directly like Microsoft Word
4. Switch to Preview tab to see results
```

**Code Mode (For HTML experts):**
```
1. Click "Code" button
2. Edit HTML directly
3. Syntax highlighting helps avoid errors
4. Use Insert Variable dropdown for {{variables}}
```

### For SMS Templates

**Text Mode:**
```
1. Edit plain text
2. Watch character counter (keep under 160 for single SMS)
3. Preview shows realistic iPhone message
4. Click Save when done
```

---

## 🔤 Using Variables

Variables are placeholders that get replaced with real data when sending.

### Common Variables

| Type This | Gets Replaced With |
|-----------|-------------------|
| `{{clientName}}` | John Doe |
| `{{projectName}}` | Website Redesign |
| `{{link}}` | https://app.com/onboard/... |
| `{{adminName}}` | Your name |

### How to Insert Variables

**Method 1: Type Directly**
```
Hi {{clientName}}, welcome to {{projectName}}!
```

**Method 2: Use Dropdown**
```
1. Click "Insert Variable" button
2. Select variable from list
3. It appears in your content as {{variableName}}
```

---

## 👁️ Previewing Templates

### Preview Tab
1. Click **"Preview"** tab (top of editor)
2. Enter sample data in left panel:
   - Client Name: "John Doe"
   - Project Name: "Website Project"
   - etc.
3. See rendered result in right panel

### Email Preview
- Toggle between **Desktop** and **Mobile** views
- See exactly how email will look
- Subject line shown at top

### SMS Preview
- See message in realistic iPhone bubble
- Character count shown below
- Warning if message will split into multiple SMS

---

## 🧪 Testing Templates

### Send Test Email
1. While editing, click **"Send Test"**
2. Enter your email address
3. Check inbox (including spam)
4. Template sent with sample data

### Send Test SMS
1. While editing, click **"Send Test"**
2. Enter phone with country code: `+1234567890`
3. Check your phone
4. Template sent with sample data

**Pro Tip:** Always test before saving major changes!

---

## 🔍 Finding Templates

### Search
```
Type in search box:
- Template name (e.g., "Onboarding")
- Category (e.g., "todos")
```

### Filter by Type
```
Click tabs at top:
- "All" - Show everything
- "Email" - Only email templates
- "SMS" - Only SMS templates
```

---

## 📋 Managing Templates

### Duplicate a Template
```
1. Find template you want to copy
2. Click Copy icon (📄)
3. New template created with "(Copy)" in name
4. Edit the copy
```

### Delete a Template
```
Only custom templates can be deleted:
1. Click Trash icon (🗑️)
2. Confirm deletion
3. Template deactivated (soft delete)

Note: System templates cannot be deleted (they have "System" badge)
```

---

## ✅ Best Practices

### Email Templates

✅ **Do:**
- Keep subject lines short (under 50 characters)
- Test in both Desktop and Mobile preview
- Use clear call-to-action buttons
- Keep design simple and clean

❌ **Don't:**
- Don't use JavaScript
- Don't reference external CSS files
- Don't make very complex layouts

### SMS Templates

✅ **Do:**
- Keep under 160 characters when possible
- Put important info first
- Use short URLs
- Test character count

❌ **Don't:**
- Don't use excessive emojis
- Don't assume delivery time
- Don't use complex formatting

### Variables

✅ **Do:**
- Use descriptive names
- Test with realistic data
- Document what each variable is for

❌ **Don't:**
- Don't use spaces in variable names
- Don't use special characters (except underscore)
- Don't forget closing braces `}}`

---

## 🆘 Common Issues

### "Template Not Loading"
**Fix:** Refresh page, check console, verify you're platform admin

### "Variables Not Showing in Preview"
**Fix:** Make sure you're using `{{variableName}}` format with double braces

### "Email Looks Different in Preview"
**Fix:** Email clients render differently - test by sending to real inbox

### "SMS Character Count Seems Wrong"
**Fix:** Emojis count as multiple characters. Preview shows accurate count.

### "Can't Delete Template"
**Fix:** System templates (with "System" badge) cannot be deleted. Duplicate and edit instead.

### "Test Email Not Arriving"
**Fix:** 
1. Check spam folder
2. Wait a few minutes
3. Verify email address is correct
4. Check Resend dashboard for delivery status

### "Test SMS Not Arriving"
**Fix:**
1. Verify phone format includes country code (+1234567890)
2. Check Twilio account has credits
3. Wait a few minutes (can take up to 5 min)
4. Check Twilio console for delivery logs

---

## 🎯 Quick Tasks

### Change Email Subject Line
```
1. Edit template
2. Change "Subject" field at top
3. Save
Done!
```

### Update Email Content
```
1. Edit template
2. Click "Visual" mode
3. Edit text
4. Click "Preview" to check
5. Click "Save"
Done!
```

### Shorten SMS Message
```
1. Edit SMS template
2. Remove unnecessary words
3. Watch character counter
4. Keep under 160 for single message
5. Preview in iPhone mockup
6. Save
Done!
```

### Add New Variable
```
1. Edit template
2. Type {{newVariableName}} where you want it
3. Note: Developer must add this variable to the template definition
4. Save
Done!
```

---

## 📞 Need Help?

1. **Full Documentation**: See `TEMPLATE_EDITOR_GUIDE.md`
2. **Integration Help**: See integration examples in full guide
3. **Technical Support**: Check console logs for errors
4. **Feature Requests**: Document desired features

---

## 🎓 Learn More

### 5-Minute Tutorial
1. Navigate to Templates
2. Edit "Onboarding Invitation" email
3. Change greeting to "Hello {{clientName}}!"
4. Switch to Preview tab
5. Enter sample client name
6. See it rendered
7. Click "Send Test" and enter your email
8. Check inbox
9. Click "Save Changes"
10. Done! You've mastered the basics

### Next Level Skills
- Learn HTML basics for advanced email formatting
- Explore all available variables
- Create custom templates by duplicating existing ones
- Test templates with different sample data scenarios

---

**Version**: 1.0  
**For**: Platform Admins  
**Updated**: October 5, 2025

**Pro Tip:** Keep this guide open in another tab while editing templates! 🚀
