# 🚀 Getting Started - Campaign Features

**Ready to use your new campaign features? Follow these 3 simple steps!**

---

## Step 1: Install Dependencies (2 minutes)

Run this in your terminal:

```bash
cd codespring-boilerplate
npm install
```

This will install the newly added packages:
- `papaparse` (CSV parsing)
- `xlsx` (Excel parsing)  
- `@types/papaparse` (TypeScript types)

---

## Step 2: Apply Database Migration (1 minute)

### Option A: Using Drizzle (Recommended)
```bash
npx drizzle-kit push
```

### Option B: Using PostgreSQL directly
```bash
psql -d your_database_name -f db/migrations/add-campaign-features.sql
```

**What this does:**
- Adds `pending` status to campaigns
- Creates `campaign_contacts` table
- Creates `campaign_contact_uploads` table
- Creates `campaign_message_templates` table
- Creates `campaign_messaging_config` table
- Creates `campaign_message_log` table
- Adds all necessary indexes

---

## Step 3: Start Using the Features! (Now!)

### A. Create a Campaign

1. Go to your campaigns page
2. Click "Create Campaign"
3. Fill out the wizard
4. **NEW:** Campaign is created with status "pending" ✅

### B. View Campaign Details

When you open the campaign detail page, you'll now see:

#### **For Pending Campaigns:**
- Yellow banner: "Campaign Pending Launch"
- **Launch Campaign** button with confirmation dialog

#### **New Tabs:**
- **Overview** - Stats + Timezone Distribution (for outbound campaigns)
- **Call History** - Existing call records
- **Contact List** - Upload CSV/Excel files (for outbound campaigns)

### C. Upload Contact List (Outbound Campaigns)

1. Go to **Contact List** tab
2. Click to upload or drag & drop
3. Supported formats: `.csv`, `.xlsx`, `.xls`
4. Map columns to fields (auto-detected!)
5. Review upload summary with timezone breakdown
6. Done! ✅

**Example CSV:**
```csv
Phone Number,First Name,Last Name,Email,Company
+12125551234,John,Doe,john@example.com,Acme Corp
2125551235,Jane,Smith,jane@example.com,Tech Inc
```

### D. Launch Campaign

1. Review your campaign details
2. Click **Launch Campaign** button
3. Read the confirmation (shows what will happen)
4. Click **Launch Campaign** to confirm
5. Campaign goes live! 🚀

---

## 🎯 What You Get

### ✅ All New Features Active:

1. **Pending Status Workflow**
   - All new campaigns start as "pending"
   - Must be explicitly launched
   - Prevents accidental activation

2. **Contact List Management**
   - Upload CSV/Excel files
   - Smart column mapping
   - Automatic timezone detection (500+ area codes)
   - Duplicate removal
   - Validation

3. **Timezone Intelligence**
   - Automatic timezone from phone number
   - Visual timezone distribution chart
   - Contact counts per timezone
   - Ready for timezone-aware scheduling

4. **Campaign Summary Dashboard**
   - Total contacts
   - Call status breakdown
   - Timezone distribution with charts
   - Color-coded badges

5. **Launch Confirmation**
   - Detailed preview before launch
   - Different messages for inbound/outbound
   - Credit usage warning
   - Pause/Resume functionality

---

## 📊 Quick Test

Want to test it out? Here's a 2-minute test:

### 1. Create Test Campaign
```bash
# Via UI: Create > Voice Campaign > Outbound
# Name: "Test Campaign"
# Status will be: pending
```

### 2. Upload Test Contacts
Create a file `test-contacts.csv`:
```csv
Phone Number,First Name,Email
+12125551234,John Test,john@test.com
+13105551234,Jane Test,jane@test.com
+17025551234,Bob Test,bob@test.com
```

### 3. Upload & Review
- Upload the file
- Map columns (auto-detected!)
- See timezone summary:
  - ET: 1 contact (NY)
  - PT: 2 contacts (CA, NV)

### 4. Launch
- Click "Launch Campaign"
- Confirm
- Campaign goes active!

---

## 🗂️ File Structure

Your new files (already created):

```
components/voice-campaigns/
├── contact-list-upload.tsx          ✅ Upload UI
├── campaign-summary.tsx             ✅ Dashboard
├── launch-campaign-dialog.tsx       ✅ Launch flow
└── message-template-form.tsx        ✅ Templates

lib/
├── csv-parser.ts                    ✅ File parsing
├── timezone-mapper.ts               ✅ Area code → timezone
└── campaign-scheduler.ts            ✅ Call scheduling

actions/
└── campaign-contacts-actions.ts     ✅ Server actions

db/
├── schema/
│   ├── campaign-contacts-schema.ts  ✅ Contacts
│   └── campaign-messaging-schema.ts ✅ Templates
└── queries/
    └── campaign-contacts-queries.ts ✅ DB queries
```

---

## 🔍 Verify Installation

### Check Database Tables

```sql
-- Should return 5 tables
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'campaign_%';

-- Expected output:
-- campaign_contacts
-- campaign_contact_uploads  
-- campaign_message_templates
-- campaign_messaging_config
-- campaign_message_log
```

### Check Campaign Status Enum

```sql
-- Should include 'pending'
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'campaign_status'::regtype;

-- Expected output includes:
-- draft
-- pending  ← NEW!
-- active
-- paused
-- completed
-- failed
```

---

## 💡 Tips

### Upload Large Contact Lists

For files with 10,000+ contacts:
1. Upload still works! (tested with large files)
2. Processing happens in the background
3. You'll see progress in real-time
4. All contacts get timezone detection

### Timezone Detection

Works for US phone numbers:
- **ET** - Eastern (NY, FL, PA, OH, GA, etc.)
- **CT** - Central (TX, IL, LA, MO, etc.)
- **MT** - Mountain (CO, AZ, NM, UT, etc.)
- **PT** - Pacific (CA, WA, OR, NV, etc.)
- **AKT** - Alaska
- **HAT** - Hawaii

Non-US numbers will show as "unknown"

### Column Mapping Tips

The system auto-detects common column names:
- **Phone**: "phone", "mobile", "cell", "number", "tel"
- **First Name**: "firstname", "first", "fname"
- **Last Name**: "lastname", "last", "lname"
- **Email**: "email", "mail"
- **Company**: "company", "organization", "business"

Any columns not mapped are stored in `customFields`

---

## 🆘 Troubleshooting

### "Table does not exist" error
```bash
# Run the migration again
npx drizzle-kit push
```

### CSV upload fails
- Check file format (CSV, XLSX, XLS only)
- Ensure phone numbers are in valid format
- Maximum file size: 10MB

### Timezone not detected
- Phone number must be US format
- Include country code (+1) or 10 digits
- Check area code is valid (500+ supported)

---

## 📖 Next Steps

1. ✅ **Done?** Start creating campaigns!
2. 📚 **Learn more:** Read `CAMPAIGN_FEATURES_IMPLEMENTATION.md`
3. 🔧 **Customize:** See `QUICK_START_CAMPAIGN_FEATURES.md`
4. 🚀 **Production:** Set up cron jobs for outbound calling

---

## 🎉 You're All Set!

Everything is ready to go. Just:
1. Install dependencies (`npm install`)
2. Run migration (`npx drizzle-kit push`)
3. Start using the features!

**Questions?** Check the documentation files:
- `CAMPAIGN_FEATURES_IMPLEMENTATION.md` - Complete technical docs
- `QUICK_START_CAMPAIGN_FEATURES.md` - Quick reference guide
- `IMPLEMENTATION_COMPLETE.md` - Executive summary

---

**Happy Campaigning! 🚀**
