/**
 * Apply AI Cache Migration
 * Adds pre-generated AI columns to emails table
 */

import { db } from '../db/db';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    console.log('🚀 Starting AI cache migration...');

    // Read the migration SQL
    const migrationPath = path.join(__dirname, '../db/migrations/0026_email_ai_cache.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Execute the migration
    await db.execute(sql.raw(migrationSQL));

    console.log('✅ AI cache migration completed successfully!');
    console.log('📊 New columns added to emails table:');
    console.log('   - ai_quick_replies (jsonb)');
    console.log('   - ai_smart_actions (jsonb)');
    console.log('   - ai_generated_at (timestamp)');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   1. AI will auto-generate for new emails');
    console.log('   2. Viewport emails get background AI generation');
    console.log('   3. Popups will show pre-generated AI instantly!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

