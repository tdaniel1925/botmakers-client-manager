/**
 * Diagnostic API - Check system configuration
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = auth();

    const diagnostics = {
      timestamp: new Date().toISOString(),
      authentication: {
        userId: userId || 'NOT_LOGGED_IN',
        isAuthenticated: !!userId,
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
        resendApiKey: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing',
      },
      supabaseConfig: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
        anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      }
    };

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
