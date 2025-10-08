/**
 * Quick migration to add billing_type column
 * Uses existing db connection from drizzle
 */

require('dotenv').config({ path: '.env.local' });

const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

async function migrate() {
  console.log('🚀 Adding billing_type column to voice_campaigns...\n');
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }
  
  const client = postgres(connectionString);
  const db = drizzle(client);
  
  try {
    console.log('📝 Executing SQL...');
    
    // Add the column with default value
    await client`
      ALTER TABLE voice_campaigns 
      ADD COLUMN IF NOT EXISTS billing_type TEXT NOT NULL DEFAULT 'billable'
    `;
    console.log('✅ Column added');
    
    // Add check constraint
    await client`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'voice_campaigns_billing_type_check'
        ) THEN
          ALTER TABLE voice_campaigns
          ADD CONSTRAINT voice_campaigns_billing_type_check 
          CHECK (billing_type IN ('admin_free', 'billable'));
        END IF;
      END $$
    `;
    console.log('✅ Check constraint added');
    
    // Update existing records
    await client`
      UPDATE voice_campaigns 
      SET billing_type = 'billable' 
      WHERE billing_type IS NULL
    `;
    console.log('✅ Existing campaigns updated to billable');
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('✨ You can now create admin-free campaigns!\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    process.exit(0);
  }
}

migrate();
