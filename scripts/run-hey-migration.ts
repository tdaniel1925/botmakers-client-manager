/**
 * Run Hey Features Migration
 * Adds screening, Imbox/Feed/Paper Trail, Reply Later, Set Aside, etc.
 */

import { db } from '../db/db';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    console.log('🚀 Starting Hey features migration...\n');

    // Read the migration SQL
    const migrationPath = path.join(__dirname, '../db/migrations/0027_hey_features.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Execute the migration
    await db.execute(sql.raw(migrationSQL));

    console.log('✅ Hey features migration completed successfully!\n');
    console.log('📊 Changes applied:');
    console.log('   ✓ Created contact_screening table');
    console.log('   ✓ Created user_email_preferences table');
    console.log('   ✓ Added hey_view, hey_category columns to emails');
    console.log('   ✓ Added Reply Later columns (is_reply_later, reply_later_until)');
    console.log('   ✓ Added Set Aside columns (is_set_aside, set_aside_at)');
    console.log('   ✓ Added Bubble Up columns (is_bubbled_up, bubbled_up_at)');
    console.log('   ✓ Added custom_subject for thread renaming');
    console.log('   ✓ Added privacy/tracking columns');
    console.log('   ✓ Created performance indexes\n');
    console.log('🎯 Next: The email client now supports Hey-inspired features!');
    console.log('   - Email screening');
    console.log('   - Imbox/Feed/Paper Trail views');
    console.log('   - Reply Later workflow');
    console.log('   - Set Aside temporary holding');
    console.log('   - And more!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

