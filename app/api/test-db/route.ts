import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { emailAccountsTable, emailsTable } from '@/db/schema/email-schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('🧪 Test DB: Starting...');
    
    // Test 1: Auth
    const authResult = await auth();
    console.log('🧪 Test 1 - Auth:', { hasUserId: !!authResult?.userId });
    
    if (!authResult?.userId) {
      return NextResponse.json({ 
        error: 'No user ID',
        step: 'auth'
      });
    }
    
    const { userId } = authResult;
    
    // Test 2: Database connection
    console.log('🧪 Test 2 - DB Connection...');
    const accounts = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.userId, userId));
    console.log('🧪 Test 2 - Accounts found:', accounts.length);
    
    if (accounts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Auth works, DB works, but no accounts found',
        userId: userId.substring(0, 10) + '...',
        accountCount: 0
      });
    }
    
    // Test 3: Fetch emails for first account
    console.log('🧪 Test 3 - Fetching emails...');
    const emails = await db.select().from(emailsTable).where(eq(emailsTable.accountId, accounts[0].id)).limit(10);
    console.log('🧪 Test 3 - Emails found:', emails.length);
    
    return NextResponse.json({
      success: true,
      message: 'All tests passed!',
      userId: userId.substring(0, 10) + '...',
      accountCount: accounts.length,
      firstAccountEmail: accounts[0].emailAddress,
      emailCount: emails.length,
      sampleEmails: emails.slice(0, 3).map(e => ({ 
        subject: e.subject, 
        from: typeof e.fromAddress === 'object' ? e.fromAddress.email : e.fromAddress 
      }))
    });
    
  } catch (error: any) {
    console.error('🧪 Test DB: Error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      details: error.toString()
    }, { status: 500 });
  }
}


