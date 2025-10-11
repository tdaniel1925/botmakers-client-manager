import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { userEmailPreferencesTable } from '@/db/schema/email-schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [preferences] = await db
      .select()
      .from(userEmailPreferencesTable)
      .where(eq(userEmailPreferencesTable.userId, userId))
      .limit(1);

    if (!preferences) {
      return NextResponse.json({
        emailMode: 'traditional',
        screeningEnabled: false,
        autoClassificationEnabled: true,
        privacyProtectionEnabled: true,
        keyboardShortcutsEnabled: true,
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      mode,
      screeningEnabled,
      autoClassificationEnabled,
      privacyProtectionEnabled,
      keyboardShortcutsEnabled,
    } = body;

    await db
      .insert(userEmailPreferencesTable)
      .values({
        userId,
        emailMode: mode || 'traditional',
        screeningEnabled: screeningEnabled ?? false,
        autoClassificationEnabled: autoClassificationEnabled ?? true,
        privacyProtectionEnabled: privacyProtectionEnabled ?? true,
        keyboardShortcutsEnabled: keyboardShortcutsEnabled ?? true,
      })
      .onConflictDoUpdate({
        target: userEmailPreferencesTable.userId,
        set: {
          emailMode: mode || 'traditional',
          screeningEnabled: screeningEnabled ?? false,
          autoClassificationEnabled: autoClassificationEnabled ?? true,
          privacyProtectionEnabled: privacyProtectionEnabled ?? true,
          keyboardShortcutsEnabled: keyboardShortcutsEnabled ?? true,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving email preferences:', error);
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}
