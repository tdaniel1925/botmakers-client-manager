import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createOnboardingSession, getOnboardingSessionByProjectId } from '@/db/queries/onboarding-queries';
import { getTemplateById } from '@/db/queries/onboarding-templates-queries';
import { getProjectById } from '@/db/queries/projects-queries';
import { sendOnboardingInvitation } from '@/lib/email-service';
import { applyRateLimit, apiRateLimiter } from '@/lib/rate-limit'; // ✅ FIX BUG-018

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // ✅ FIX BUG-018: Apply rate limiting (100 req/min per user)
  const rateLimitResult = await applyRateLimit(request, apiRateLimiter, userId);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  try {
    const body = await request.json();
    const { projectId, templateId, clientEmail, clientName } = body;

    if (!projectId || !templateId || !clientEmail || !clientName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ✅ FIX #1: Check for existing session to prevent duplicates
    const existingSession = await getOnboardingSessionByProjectId(projectId);
    if (existingSession) {
      return NextResponse.json(
        { error: 'Onboarding session already exists for this project', sessionId: existingSession.id },
        { status: 409 }
      );
    }

    // Get project and template
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const template = await getTemplateById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Create onboarding session
    const session = await createOnboardingSession({
      projectId,
      organizationId: project.organizationId,
      templateLibraryId: templateId,
      onboardingType: template.projectType as any,
      steps: template.questions,
      status: 'pending',
      completionMode: 'client',
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // Send invitation email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const onboardingUrl = `${appUrl}/onboarding/${session.accessToken}`;

    await sendOnboardingInvitation({
      clientEmail,
      clientName,
      projectName: project.name,
      onboardingLink: onboardingUrl,
      estimatedMinutes: 10, // Default estimated time
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Error creating onboarding session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
