/**
 * Clean up broken email records to allow fresh sync
 * Run this with: npx tsx scripts/clean-emails.ts
 */

import { db } from '../db/db';
import { emailsTable, emailThreadsTable } from '../db/schema/email-schema';

async function cleanEmails() {
  try {
    console.log('Deleting all email threads...');
    const deletedThreads = await db.delete(emailThreadsTable);
    console.log(`✓ Deleted email threads`);

    console.log('Deleting all emails...');
    const deletedEmails = await db.delete(emailsTable);
    console.log(`✓ Deleted emails`);

    console.log('\n✅ Email cleanup complete! You can now sync emails again.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning emails:', error);
    process.exit(1);
  }
}

cleanEmails();


