import { NextResponse } from 'next/server';
import { getOnboardingSessionByToken } from '@/db/queries/onboarding-queries';
import { getTemplateById } from '@/db/queries/onboarding-templates-queries';
import { applyRateLimit, publicRateLimiter } from '@/lib/rate-limit'; // ✅ FIX BUG-018

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  // ✅ FIX BUG-018: Apply rate limiting (30 req/min per IP) for public endpoint
  const rateLimitResult = await applyRateLimit(request, publicRateLimiter);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  try {
    const session = await getOnboardingSessionByToken(params.token);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const template = session.templateLibraryId 
      ? await getTemplateById(session.templateLibraryId)
      : null;

    return NextResponse.json({
      session,
      template,
    });
  } catch (error: any) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
