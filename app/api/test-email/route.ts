/**
 * Test Email API Route
 * For testing email sending functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
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

