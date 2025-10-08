const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL || 'postgres://postgres:ttandSellaBella1@1@db.gbufjhhorcwaizoysfep.supabase.co:5432/postgres');

async function checkCampaign() {
  try {
    const campaign = await sql`
      SELECT id, name, phone_number, provider_phone_number_id, provider_assistant_id, status
      FROM voice_campaigns 
      WHERE id = '4086b4a3-6b9f-4c14-ae3a-b509c8e54f82'
    `;
    
    console.log('Campaign details:', JSON.stringify(campaign, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

checkCampaign();
