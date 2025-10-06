import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { seedTemplatesAction, clearTemplatesAction } from '@/actions/seed-templates-action';
import { applyRateLimit, authRateLimiter } from '@/lib/rate-limit'; // ✅ FIX BUG-018

export async function POST(request: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // ✅ FIX BUG-018: Rate limit template operations (5 req/min per user)
  const rateLimitResult = await applyRateLimit(request, authRateLimiter, userId);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // 'reseed' or 'clear'
    
    if (action === 'clear') {
      const result = await clearTemplatesAction();
      return NextResponse.json(result);
    }
    
    // Default: reseed with force
    const result = await seedTemplatesAction(true);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to reseed templates',
    endpoints: {
      reseed: 'POST /api/seed-templates',
      clear: 'POST /api/seed-templates?action=clear',
    }
  });
}
