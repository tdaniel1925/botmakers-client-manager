/**
 * Check Email Accounts - Debug script
 */

import { db } from '@/db/db';
import { emailAccountsTable } from '@/db/schema/email-schema';

async function checkAccounts() {
  console.log('🔍 Checking email accounts...\n');

  try {
    const accounts = await db.select().from(emailAccountsTable);

    console.log(`📊 Total accounts in database: ${accounts.length}\n`);

    if (accounts.length === 0) {
      console.log('❌ No accounts found!\n');
      process.exit(0);
    }

    accounts.forEach((account, i) => {
      console.log(`Account ${i + 1}:`);
      console.log(`  Email: ${account.emailAddress}`);
      console.log(`  ID: ${account.id}`);
      console.log(`  User ID: ${account.userId}`);
      console.log(`  Provider: ${account.provider}`);
      console.log(`  Status: ${account.status}`);
      console.log(`  Sync Status: ${account.syncStatus}`);
      console.log(`  Has Nylas Grant: ${account.nylasGrantId ? 'Yes' : 'No'}`);
      console.log(`  Is Default: ${account.isDefault}`);
      console.log(`  Created: ${account.createdAt}`);
      console.log('');
    });

    console.log('✅ Check complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAccounts();


