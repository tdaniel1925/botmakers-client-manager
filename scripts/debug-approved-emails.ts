/**
 * Debug Script: Find Approved Emails That Didn't Go to Imbox
 * Run this to see where your approved emails actually are in the database
 */

import { db } from '@/db/db';
import { emailsTable } from '@/db/schema/email-schema';
import { eq } from 'drizzle-orm';

async function debugApprovedEmails() {
  console.log('🔍 DEBUGGING: Looking for emails that should be in Imbox...\n');

  // Get all emails
  const allEmails = await db.select().from(emailsTable);

  console.log(`📊 Total emails in database: ${allEmails.length}\n`);

  // Group by heyView
  const groupedByView: Record<string, any[]> = {};
  allEmails.forEach(email => {
    const view = email.heyView || 'null/undefined';
    if (!groupedByView[view]) {
      groupedByView[view] = [];
    }
    groupedByView[view].push(email);
  });

  console.log('📁 EMAILS BY VIEW:');
  console.log('─'.repeat(80));
  Object.entries(groupedByView).forEach(([view, emails]) => {
    console.log(`\n${view.toUpperCase()}: ${emails.length} emails`);
    
    // Show screening status breakdown
    const statusBreakdown: Record<string, number> = {};
    emails.forEach(e => {
      const status = e.screeningStatus || 'no_status';
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    });
    
    console.log(`  Screening Status:`, statusBreakdown);
    
    // Show sample emails (first 3)
    if (emails.length > 0) {
      console.log(`  Sample emails:`);
      emails.slice(0, 3).forEach(e => {
        let fromAddr = 'unknown';
        try {
          if (typeof e.fromAddress === 'string') {
            const parsed = JSON.parse(e.fromAddress);
            fromAddr = parsed.email || parsed.name || e.fromAddress;
          } else if (e.fromAddress && typeof e.fromAddress === 'object') {
            fromAddr = (e.fromAddress as any).email || (e.fromAddress as any).name || 'unknown';
          }
        } catch {
          fromAddr = String(e.fromAddress || 'unknown');
        }
        console.log(`    - "${e.subject}" from ${fromAddr}`);
        console.log(`      heyView: ${e.heyView}, screeningStatus: ${e.screeningStatus}`);
      });
    }
  });

  console.log('\n' + '─'.repeat(80));

  // Find recently screened emails
  const recentlyScreened = allEmails
    .filter(e => e.screeningStatus === 'screened')
    .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0))
    .slice(0, 10);

  console.log('\n🕐 RECENTLY SCREENED EMAILS (Last 10):');
  console.log('─'.repeat(80));
  recentlyScreened.forEach(email => {
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
    console.log(`\n📧 "${email.subject}"`);
    console.log(`   From: ${fromAddr}`);
    console.log(`   heyView: ${email.heyView || 'NULL'} ⚠️`);
    console.log(`   screeningStatus: ${email.screeningStatus}`);
    console.log(`   Updated: ${email.updatedAt?.toLocaleString()}`);
  });

  console.log('\n' + '─'.repeat(80));
  console.log('\n✅ Debug complete!\n');

  process.exit(0);
}

debugApprovedEmails().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

