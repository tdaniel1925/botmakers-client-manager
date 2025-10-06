import { NextResponse } from 'next/server';
import { getOnboardingSessionByToken } from '@/db/queries/onboarding-queries';
import { getTemplateById } from '@/db/queries/onboarding-templates-queries';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
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
