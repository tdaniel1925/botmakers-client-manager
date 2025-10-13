/**
 * FIX SCRIPT: Move all screened emails with null heyView to Imbox
 * This fixes the 203 emails that were approved but stuck with heyView=null
 */

import { db } from '@/db/db';
import { emailsTable } from '@/db/schema/email-schema';
import { eq, and, isNull } from 'drizzle-orm';

async function fixApprovedEmails() {
  console.log('🔧 FIXING: Moving screened emails with null heyView to Imbox...\n');

  try {
    // Find all emails with screeningStatus='screened' but heyView=null
    const brokenEmails = await db
      .select()
      .from(emailsTable)
      .where(
        and(
          eq(emailsTable.screeningStatus, 'screened'),
          isNull(emailsTable.heyView)
        )
      );

    console.log(`📊 Found ${brokenEmails.length} emails to fix\n`);

    if (brokenEmails.length === 0) {
      console.log('✅ No emails to fix! All good.\n');
      process.exit(0);
    }

    // Show sample of what will be fixed
    console.log('📧 Sample emails that will be moved to Imbox:');
    console.log('─'.repeat(80));
    brokenEmails.slice(0, 5).forEach(email => {
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
      console.log(`  - "${email.subject}" from ${fromAddr}`);
    });
    
    if (brokenEmails.length > 5) {
      console.log(`  ... and ${brokenEmails.length - 5} more`);
    }
    console.log('─'.repeat(80));
    console.log('');

    // Fix each email - set heyView to 'imbox'
    console.log('🔄 Updating emails...\n');
    
    let successCount = 0;
    let errorCount = 0;

    for (const email of brokenEmails) {
      try {
        await db
          .update(emailsTable)
          .set({ heyView: 'imbox' })
          .where(eq(emailsTable.id, email.id));
        
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`  ✓ Fixed ${successCount}/${brokenEmails.length} emails...`);
        }
      } catch (error) {
        console.error(`  ✗ Failed to update email ${email.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n' + '─'.repeat(80));
    console.log(`\n✅ FIX COMPLETE!`);
    console.log(`   ${successCount} emails moved to Imbox ✨`);
    if (errorCount > 0) {
      console.log(`   ${errorCount} emails failed ⚠️`);
    }
    console.log('\n📬 All your approved emails are now in Imbox!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixApprovedEmails();


