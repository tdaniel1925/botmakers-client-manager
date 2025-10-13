/**
 * Verify: How many emails actually have heyView='imbox' in database?
 */

import { db } from '@/db/db';
import { emailsTable } from '@/db/schema/email-schema';
import { eq } from 'drizzle-orm';

async function verifyImboxEmails() {
  console.log('🔍 VERIFYING: How many emails are in Imbox (heyView="imbox")...\n');

  // Count emails by heyView
  const allEmails = await db.select().from(emailsTable);
  
  const imboxEmails = allEmails.filter(e => e.heyView === 'imbox');
  const feedEmails = allEmails.filter(e => e.heyView === 'feed');
  const paperTrailEmails = allEmails.filter(e => e.heyView === 'paper_trail');
  const nullEmails = allEmails.filter(e => e.heyView === null || e.heyView === undefined);
  
  console.log('📊 EMAIL COUNTS BY VIEW:');
  console.log('─'.repeat(80));
  console.log(`✨ Imbox:       ${imboxEmails.length} emails`);
  console.log(`📰 Feed:        ${feedEmails.length} emails`);
  console.log(`🧾 Paper Trail: ${paperTrailEmails.length} emails`);
  console.log(`⚠️  Null/None:   ${nullEmails.length} emails`);
  console.log(`📊 TOTAL:       ${allEmails.length} emails`);
  console.log('─'.repeat(80));
  
  // Show screening status of Imbox emails
  const imboxScreened = imboxEmails.filter(e => e.screeningStatus === 'screened');
  const imboxAutoClassified = imboxEmails.filter(e => e.screeningStatus === 'auto_classified');
  const imboxPending = imboxEmails.filter(e => e.screeningStatus === 'pending');
  
  console.log('\n📥 IMBOX EMAILS BREAKDOWN:');
  console.log('─'.repeat(80));
  console.log(`✅ Screened (manually approved): ${imboxScreened.length}`);
  console.log(`🤖 Auto-classified:              ${imboxAutoClassified.length}`);
  console.log(`⏳ Pending (shouldn't be here):  ${imboxPending.length}`);
  console.log('─'.repeat(80));
  
  // Show sample Imbox emails
  console.log('\n📧 SAMPLE IMBOX EMAILS (First 10):');
  console.log('─'.repeat(80));
  imboxEmails.slice(0, 10).forEach((email, i) => {
    let fromAddr = 'unknown';
    try {
      if (typeof email.fromAddress === 'string') {
        const parsed = JSON.parse(email.fromAddress);
        fromAddr = parsed.email || parsed.name || email.fromAddress;
      } else if (email.fromAddress && typeof email.fromAddress === 'object') {
        fromAddr = (email.fromAddress as any).email || (email.fromAddress as any).name || 'unknown';
      }
    } catch {
      fromAddr = String(email.fromAddress || 'unknown');
    }
    
    console.log(`${i + 1}. "${email.subject?.substring(0, 50)}..."`);
    console.log(`   From: ${fromAddr}`);
    console.log(`   Status: ${email.screeningStatus}, Updated: ${email.updatedAt?.toLocaleDateString()}`);
    console.log('');
  });
  
  console.log('─'.repeat(80));
  console.log('\n✅ Verification complete!\n');
  
  process.exit(0);
}

verifyImboxEmails().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});


