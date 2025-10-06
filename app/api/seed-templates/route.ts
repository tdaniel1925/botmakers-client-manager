import { NextResponse } from 'next/server';
import { seedTemplatesAction, clearTemplatesAction } from '@/actions/seed-templates-action';

export async function POST(request: Request) {
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
