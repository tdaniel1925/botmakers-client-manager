/**
 * Test Email API Route
 * For testing email sending functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email-service';
import { applyRateLimit, authRateLimiter } from '@/lib/rate-limit'; // ✅ FIX BUG-018

export async function POST(request: NextRequest) {
  // ✅ FIX BUG-018: Very strict rate limiting (5 req/min per IP) to prevent email spam
  const rateLimitResult = await applyRateLimit(request, authRateLimiter);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { isSuccess: false, message: 'Email address required' },
        { status: 400 }
      );
    }

    const result = await sendTestEmail(email);

    if (result.isSuccess) {
      return NextResponse.json({
        isSuccess: true,
        message: 'Email sent successfully! Check your inbox.',
        data: result.data,
      });
    }

    return NextResponse.json(
      { isSuccess: false, message: result.message || 'Failed to send email' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      {
        isSuccess: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

