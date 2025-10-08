# ⚡ Migration Instructions

## ✅ Dependencies Installed!

The npm packages have been successfully installed:
- ✅ `papaparse` - CSV parsing
- ✅ `xlsx` - Excel parsing
- ✅ `@types/papaparse` - TypeScript types

---

## 🗄️ Database Migration Options

There's a Drizzle version mismatch. Choose one of these options to run the migration:

### **Option 1: Direct SQL (Recommended)**

Run the migration file directly with your PostgreSQL database:

```bash
# Using psql command line
psql -d your_database_name -f db/migrations/add-campaign-features.sql

# Or using a PostgreSQL client
# Just open and execute: db/migrations/add-campaign-features.sql
```

### **Option 2: Update Drizzle & Push**

Update Drizzle to the latest version:

```bash
npm install drizzle-kit@latest drizzle-orm@latest
npx drizzle-kit push:pg
```

### **Option 3: Studio (Visual)**

Use Drizzle Studio to apply changes:

```bash
npx drizzle-kit studio
# Opens a web UI at http://localhost:4983
# You can view and apply schema changes there
```

---

## 📋 What the Migration Does

The migration file `db/migrations/add-campaign-features.sql` will:

1. ✅ Add `pending` status to `campaign_status` enum
2. ✅ Add `schedule_config` column to `voice_campaigns` table
3. ✅ Create `contact_call_status` enum
4. ✅ Create `campaign_contacts` table (with 6 indexes)
5. ✅ Create `campaign_contact_uploads` table
6. ✅ Create `campaign_message_templates` table
7. ✅ Create `campaign_messaging_config` table
8. ✅ Create `campaign_message_log` table

**Total:** 5 new tables, 15+ indexes, 2 new enums

---

## ✅ Verify Migration Success

After running the migration, verify with:

```sql
-- Check if new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'campaign_%';

-- Should return:
-- campaign_contacts
-- campaign_contact_uploads
-- campaign_message_templates
-- campaign_messaging_config
-- campaign_message_log

-- Check if pending status exists
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'campaign_status'::regtype;

-- Should include: draft, pending, active, paused, completed, failed
```

---

## 🚀 After Migration

Once the migration is complete, you're ready to use all new features:

1. **Start Dev Server:**
   ```bash
   npm run dev
   ```

2. **Go to Campaigns:**
   - Create a new campaign → It will be in "pending" status
   - Upload contact list → CSV/Excel with automatic timezone detection
   - Review summary → See timezone distribution
   - Launch campaign → Confirmation dialog

---

## 📁 Migration File Location

The full SQL migration is here:
```
db/migrations/add-campaign-features.sql
```

It's safe to run multiple times (uses `IF NOT EXISTS` and `IF NOT EXISTS` checks).

---

## 🆘 Troubleshooting

### Error: "Relation already exists"
- Some tables might already exist
- The migration uses `IF NOT EXISTS` so it's safe to run again
- Skip any errors about existing objects

### Error: "Type already exists"
- The enums might already be created
- This is fine, the migration handles it

### Error: "Cannot find DATABASE_URL"
- Make sure `.env.local` has your `DATABASE_URL` set
- Check your database connection

---

## ✨ You're Almost There!

**Status:**
- ✅ Dependencies installed
- ⏳ Migration pending (choose option above)
- 📚 Documentation ready
- 🎨 UI components ready
- 🚀 Ready to launch!

**Next:** Run one of the migration options above, then start using the features!

---

**Need Help?** Check these docs:
- `GETTING_STARTED_NOW.md` - Quick start guide
- `CAMPAIGN_FEATURES_IMPLEMENTATION.md` - Full documentation
- `WHATS_NEW.md` - Feature overview
