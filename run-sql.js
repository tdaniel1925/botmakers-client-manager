const { readFileSync } = require('fs');
const postgres = require('postgres');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:ttandSellaBella1@1@db.gbufjhhorcwaizoysfep.supabase.co:5432/postgres';

async function runSQL() {
  const sql = postgres(DATABASE_URL);
  
  try {
    console.log('📋 Adding missing columns...');
    await sql`ALTER TABLE voice_campaigns ADD COLUMN IF NOT EXISTS completed_calls INTEGER DEFAULT 0 NOT NULL`;
    await sql`ALTER TABLE voice_campaigns ADD COLUMN IF NOT EXISTS average_call_quality INTEGER`;
    
    console.log('✅ Columns added successfully!');
    console.log('  - completed_calls');
    console.log('  - average_call_quality');
    console.log('\n🎉 Database is ready!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runSQL();
