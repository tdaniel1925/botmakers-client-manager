import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAllTemplates } from '@/db/queries/onboarding-templates-queries';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const templates = await getAllTemplates();

    return NextResponse.json({
      templates,
    });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
