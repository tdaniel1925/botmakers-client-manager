/**
 * Test API Route - Inject Mock Upload Data
 * FOR DEVELOPMENT/TESTING ONLY
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { clientOnboardingSessionsTable } from '@/db/schema/onboarding-schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    const { sessionId, stepIndex, uploadData } = await request.json();

    if (!sessionId || stepIndex === undefined || !uploadData) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, stepIndex, uploadData' },
        { status: 400 }
      );
    }

    // Get the current session - use direct select instead of db.query
    const sessions = await db
      .select()
      .from(clientOnboardingSessionsTable)
      .where(eq(clientOnboardingSessionsTable.id, sessionId))
      .limit(1);
    
    const session = sessions[0];

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get current responses
    const currentResponses = (session.responses as any) || {};
    
    // Inject the upload data at the specified step
    currentResponses[stepIndex] = uploadData;

    // Update the session
    await db
      .update(clientOnboardingSessionsTable)
      .set({
        responses: currentResponses,
        updatedAt: new Date(),
      })
      .where(eq(clientOnboardingSessionsTable.id, sessionId));

    console.log(`✅ Injected mock upload data into session ${sessionId} at step ${stepIndex}`);

    return NextResponse.json({
      success: true,
      message: 'Mock upload data injected successfully',
      sessionId,
      stepIndex,
      filesInjected: Object.keys(uploadData).reduce(
        (total, category) => total + (uploadData[category]?.length || 0),
        0
      ),
    });
  } catch (error) {
    console.error('Error injecting mock data:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to inject mock data',
      },
      { status: 500 }
    );
  }
}
