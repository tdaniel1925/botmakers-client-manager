import { db } from '../db/db';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    console.log('Running email enhancements migration...');
    
    const migrationPath = path.join(process.cwd(), 'db', 'migrations', '0025_email_enhancements.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await db.execute(sql.raw(statement));
    }
    
    console.log('✓ Migration completed successfully!');
    console.log('Created tables:');
    console.log('  - email_templates');
    console.log('  - email_signatures');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

