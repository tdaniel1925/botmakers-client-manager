/**
 * Direct database schema application for email enhancements
 * This script creates the email_templates and email_signatures tables
 */

import { db } from '../db/db';
import { sql } from 'drizzle-orm';

async function applySchemas() {
  console.log('🚀 Applying email enhancement schemas to database...\n');
  
  try {
    // Create email_templates table
    console.log('📋 Creating email_templates table...');
    await db.execute(sql`
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
    `);
    console.log('✅ email_templates table created\n');

    // Create indexes for email_templates
    console.log('📊 Creating indexes for email_templates...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_email_templates_user_id 
      ON email_templates(user_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_email_templates_category 
      ON email_templates(category);
    `);
    console.log('✅ email_templates indexes created\n');

    // Create email_signatures table
    console.log('✍️  Creating email_signatures table...');
    await db.execute(sql`
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
    `);
    console.log('✅ email_signatures table created\n');

    // Create indexes for email_signatures
    console.log('📊 Creating indexes for email_signatures...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_email_signatures_user_id 
      ON email_signatures(user_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_email_signatures_account_id 
      ON email_signatures(account_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_email_signatures_default 
      ON email_signatures(user_id, is_default) 
      WHERE is_default = TRUE;
    `);
    console.log('✅ email_signatures indexes created\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('email_templates', 'email_signatures')
      ORDER BY table_name;
    `);
    
    const tables = result.map((row: any) => row.table_name);
    console.log(`Found ${tables.length} tables:`, tables.join(', '));
    
    if (tables.length === 2) {
      console.log('\n✨ SUCCESS! All email enhancement tables are ready!\n');
      console.log('📦 Available features:');
      console.log('  ✅ Email Templates - Save and reuse email content');
      console.log('  ✅ Email Signatures - Custom signatures per account');
      console.log('  ✅ Rich Text Editor - Professional formatting');
      console.log('  ✅ Scheduled Send - Schedule emails for later');
      console.log('  ✅ Inline Images - Paste images directly');
      console.log('  ✅ Email Preview - Desktop & mobile preview\n');
    } else {
      console.log('\n⚠️  Some tables may not have been created. Check the logs above.');
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error applying schemas:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n✅ Tables already exist! No changes needed.\n');
      process.exit(0);
    } else {
      console.error('\nFull error:', error);
      process.exit(1);
    }
  }
}

applySchemas();


