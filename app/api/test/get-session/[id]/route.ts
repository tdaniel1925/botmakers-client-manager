/**
 * Test API Route - Get Session Data
 * FOR DEVELOPMENT/TESTING ONLY
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { clientOnboardingSessionsTable } from '@/db/schema/onboarding-schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    const sessionId = params.id;
    console.log('🔍 GET session request for ID:', sessionId);

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Get the session - use direct select instead of db.query
    console.log('🔎 Querying database for session...');
    const sessions = await db
      .select()
      .from(clientOnboardingSessionsTable)
      .where(eq(clientOnboardingSessionsTable.id, sessionId))
      .limit(1);
    
    const session = sessions[0];
    console.log('📊 Query result:', session ? 'Found' : 'Not found');

    if (!session) {
      console.log('❌ Session not found in database');
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    console.log('✅ Session found:', session.id);

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        responses: session.responses,
        steps: session.steps,
        currentStep: session.currentStep,
        completionPercentage: session.completionPercentage,
      },
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch session',
      },
      { status: 500 }
    );
  }
}
