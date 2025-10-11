/**
 * Custom Migration Runner
 * Uses the app's db connection to run the latest migration
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { client } from '../db/db';

async function runMigration() {
  try {
    console.log('🔄 Starting migration...');
    
    // Read the migration file
    const migrationPath = join(process.cwd(), 'db', 'migrations', '0019_secret_sunspot.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('📄 Migration file loaded');
    console.log('🗄️  Connecting to database...');
    
    // Execute the migration
    await client.unsafe(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('📦 Tables created:');
    console.log('  - impersonation_sessions');
    console.log('  - email_accounts');
    console.log('  - emails');
    console.log('  - email_threads');
    console.log('  - email_attachments');
    console.log('  - email_labels');
    console.log('  - email_sync_logs');
    console.log('  - email_drafts');
    console.log('  - email_ai_summaries');
    console.log('  - scheduled_emails');
    console.log('  - email_templates');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();





