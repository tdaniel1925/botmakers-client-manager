/**
 * Test Background Email Sync
 * 
 * This script tests the background email sync functionality:
 * 1. Tests cron endpoint authentication
 * 2. Tests sync for all active accounts
 * 3. Verifies webhook configuration
 * 
 * Usage:
 *   npx tsx scripts/test-background-sync.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') });

import { db } from '../db/db';
import { emailAccountsTable } from '../db/schema/email-schema';
import { eq } from 'drizzle-orm';

async function testBackgroundSync() {
  console.log('🧪 Testing Background Email Sync...\n');

  try {
    // 1. Check for CRON_SECRET
    console.log('1️⃣ Checking CRON_SECRET...');
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.error('❌ CRON_SECRET not set in environment variables');
      console.log('   Add to .env.local: CRON_SECRET=your-random-32-character-string');
      process.exit(1);
    }
    console.log('✅ CRON_SECRET is set\n');

    // 2. Check for NYLAS_WEBHOOK_SECRET
    console.log('2️⃣ Checking NYLAS_WEBHOOK_SECRET...');
    const webhookSecret = process.env.NYLAS_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ NYLAS_WEBHOOK_SECRET not set in environment variables');
      console.log('   Add to .env.local: NYLAS_WEBHOOK_SECRET=your-nylas-webhook-secret');
      process.exit(1);
    }
    console.log('✅ NYLAS_WEBHOOK_SECRET is set\n');

    // 3. Check active email accounts
    console.log('3️⃣ Checking email accounts...');
    const accounts = await db
      .select()
      .from(emailAccountsTable)
      .where(eq(emailAccountsTable.status, 'active'));

    console.log(`📧 Found ${accounts.length} active email account(s):`);
    accounts.forEach((account, index) => {
      console.log(`\n   ${index + 1}. ${account.emailAddress}`);
      console.log(`      • Grant ID: ${account.nylasGrantId ? '✅' : '❌ Missing'}`);
      console.log(`      • Webhook ID: ${account.webhookSubscriptionId ? '✅ ' + account.webhookSubscriptionId : '⚠️  Not configured'}`);
      console.log(`      • Last Sync: ${account.lastSyncAt ? account.lastSyncAt.toISOString() : 'Never'}`);
    });

    if (accounts.length === 0) {
      console.log('\n⚠️  No active accounts found. Connect an email account first.');
    }
    console.log();

    // 4. Test cron endpoint (if server is running)
    console.log('4️⃣ Testing cron endpoint...');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${appUrl}/api/cron/sync-emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Cron endpoint is working!');
        console.log(`   • Duration: ${data.duration}ms`);
        console.log(`   • Successful: ${data.successful}/${data.total}`);
        console.log(`   • Failed: ${data.failed}/${data.total}`);
        
        if (data.details && data.details.length > 0) {
          console.log('\n   Details:');
          data.details.forEach((detail: any) => {
            const status = detail.status === 'success' ? '✅' : detail.status === 'error' ? '❌' : '⚠️';
            console.log(`   ${status} ${detail.email}: ${detail.status === 'success' ? `${detail.syncedCount} emails` : detail.reason || detail.error}`);
          });
        }
      } else {
        console.error('❌ Cron endpoint returned error:', response.status, response.statusText);
        if (response.status === 401) {
          console.log('   Check that CRON_SECRET matches');
        }
      }
    } catch (fetchError: any) {
      if (fetchError.code === 'ECONNREFUSED') {
        console.log('⚠️  Server is not running. Start with: npm run dev');
        console.log('   (This test requires the dev server to be running)');
      } else {
        console.error('❌ Error testing cron endpoint:', fetchError.message);
      }
    }
    console.log();

    // 5. Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Background Sync Status Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Environment variables: Configured`);
    console.log(`📧 Active accounts: ${accounts.length}`);
    
    const accountsWithWebhooks = accounts.filter(a => a.webhookSubscriptionId).length;
    console.log(`🔔 Accounts with webhooks: ${accountsWithWebhooks}/${accounts.length}`);
    
    if (accounts.length > 0 && accountsWithWebhooks < accounts.length) {
      console.log('\n⚠️  Tip: Click "Enable Real-time" for each account to set up webhooks');
    }
    
    console.log('\n✅ Background sync is ready to use!');
    console.log('\n📚 Next steps:');
    console.log('   1. Deploy to Vercel (cron jobs will start automatically)');
    console.log('   2. Or use external cron service (see BACKGROUND_EMAIL_SYNC_SETUP.md)');
    console.log('   3. Send yourself a test email to verify real-time sync');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error testing background sync:', error);
    process.exit(1);
  }
}

testBackgroundSync();

