# Email Enhancements - Database Setup Guide

## ✅ Implementation Status

All email enhancement features have been **fully implemented** and are ready to use once the database tables are created.

## 🗄️ Database Tables to Create

Two new tables need to be added to your database:

1. **email_templates** - For saving and reusing email content
2. **email_signatures** - For custom email signatures per account

## 📋 Setup Options

### Option 1: Using Drizzle Studio (Recommended - Visual Interface)

1. **Start Drizzle Studio:**
   ```bash
   cd codespring-boilerplate
   npx drizzle-kit studio
   ```

2. Open your browser to the URL shown (usually `https://local.drizzle.studio`)

3. The new tables should automatically sync when you connect

4. Verify the tables appear in the sidebar

### Option 2: Using Drizzle Push (Automated)

1. **Ensure DATABASE_URL is set:**
   Create `.env.local` file in `codespring-boilerplate/` with:
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   ```

2. **Apply schema changes:**
   ```bash
   cd codespring-boilerplate
   npx drizzle-kit push
   ```

3. **Follow the prompts:**
   - When asked about `email_templates` → Select "+ create table"
   - When asked about `email_signatures` → Select "+ create table"
   - Confirm the changes

### Option 3: Direct SQL (Manual)

If you prefer to run SQL directly in your database client (pgAdmin, TablePlus, etc.):

```sql
-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  organization_id UUID,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  subject TEXT,
  body TEXT NOT NULL,
  is_shared TEXT DEFAULT 'false',
  usage_count TEXT DEFAULT '0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for email_templates
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);

-- Create email_signatures table
CREATE TABLE IF NOT EXISTS email_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  account_id UUID,
  name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for email_signatures
CREATE INDEX IF NOT EXISTS idx_email_signatures_user_id ON email_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_email_signatures_account_id ON email_signatures(account_id);
CREATE INDEX IF NOT EXISTS idx_email_signatures_default ON email_signatures(user_id, is_default) WHERE is_default = TRUE;
```

### Option 4: Using Custom Script (When Database is Running)

Once your database is accessible, run:

```bash
cd codespring-boilerplate
npx tsx scripts/apply-email-schemas.ts
```

This will create all tables and indexes automatically.

## ✅ Verification

After creating the tables, verify they exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('email_templates', 'email_signatures');
```

You should see both tables listed.

## 🚀 What Happens After Database Setup

Once the tables are created, these features will be immediately available:

### 📋 Email Templates
- Save frequently used emails as reusable templates
- Organize templates by categories (Business, Personal, Support, etc.)
- One-click template insertion
- Track template usage
- Access via "Templates" button in email composer

### ✍️ Email Signatures  
- Create multiple signatures per email account
- Rich HTML formatting support
- Set default signature per account
- Auto-insert into new emails
- Access via "Signature" button in email composer

### 📝 Rich Text Editor
- Professional WYSIWYG formatting
- Bold, italic, underline, lists, headings
- Links, blockquotes, code blocks
- Spell checking built-in
- Already integrated and ready to use!

### ⏰ Scheduled Send
- Quick presets (Tomorrow 9AM, Monday 9AM, etc.)
- Custom date/time picker
- Access via "Schedule Send" button in composer header

### 🖼️ Inline Images
- Paste images with Ctrl+V
- Drag & drop support
- Auto-upload and embed
- Image button in rich text toolbar

### 👁️ Email Preview
- Desktop and mobile preview modes
- Real-time preview as you type
- Toggle between Edit/Preview
- Access via "Preview" button in toolbar

## 🔧 Troubleshooting

### Database Connection Issues

If you get `ECONNREFUSED` errors:

1. **Check .env.local exists** in `codespring-boilerplate/`
2. **Verify DATABASE_URL** is set correctly
3. **Ensure database is running** (check your PostgreSQL/Supabase service)
4. **Test connection:**
   ```bash
   npx drizzle-kit studio
   ```

### Tables Already Exist

If you see "already exists" errors, the tables are already created! You're good to go.

### Schema Export Issue

The schema is already exported in `db/schema/index.ts`:
```typescript
export * from "./email-templates-schema";
export * from "./email-signatures-schema";
```

## 📦 Files Created

### Database Schemas
- ✅ `db/schema/email-templates-schema.ts`
- ✅ `db/schema/email-signatures-schema.ts`

### Server Actions
- ✅ `actions/email-templates-actions.ts` (5 functions)
- ✅ `actions/email-signatures-actions.ts` (5 functions)

### UI Components
- ✅ `components/email/rich-text-editor.tsx`
- ✅ `components/email/template-selector.tsx`
- ✅ `components/email/signature-selector.tsx`
- ✅ `components/email/schedule-send-dialog.tsx`
- ✅ `components/email/email-preview.tsx`

### Integrations
- ✅ Updated `email-composer.tsx` with all features
- ✅ Updated `composer-toolbar.tsx` with new buttons
- ✅ Updated `email-summary-popup.tsx` for instant loading

## 🎉 Summary

Everything is implemented and ready! Just create the database tables using any of the methods above, and all features will work immediately.

**Next Steps:**
1. Choose one of the setup options above
2. Create the database tables
3. Start using the new features in your email client!

For questions or issues, refer to `EMAIL_ENHANCEMENTS_COMPLETE.md` for full implementation details.

