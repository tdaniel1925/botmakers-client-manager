/**
 * Run Hey Features Migration
 * Adds screening tables and columns needed for Hey-inspired email client
 */

import { sql } from 'drizzle-orm';
import { db } from '../db/db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('🚀 Running Hey Features Migration...');
    
    // Read the SQL migration file
    const migrationPath = path.join(__dirname, '../db/migrations/0027_hey_features.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('📄 Migration file loaded');
    console.log('⚙️  Executing SQL...');
    
    // Execute the migration
    await db.execute(sql.raw(migrationSQL));
    
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('📊 Created:');
    console.log('  - contact_screening table');
    console.log('  - user_email_preferences table');
    console.log('  - Hey-specific columns in emails table');
    console.log('  - Performance indexes');
    console.log('');
    console.log('🎉 Your email client now has Hey-inspired features!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
