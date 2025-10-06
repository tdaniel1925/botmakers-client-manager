import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { brandingSettingsTable } from '@/db/schema';
import { isNull } from 'drizzle-orm';

export async function GET() {
  try {
    // Test: Can we read from branding table?
    const allBranding = await db.select().from(brandingSettingsTable);
    
    console.log('[test-branding] All branding records:', allBranding);
    
    // Try to get platform branding
    const [platformBranding] = await db
      .select()
      .from(brandingSettingsTable)
      .where(isNull(brandingSettingsTable.organizationId))
      .limit(1);
    
    console.log('[test-branding] Platform branding:', platformBranding);
    
    return NextResponse.json({
      success: true,
      totalRecords: allBranding.length,
      platformBranding,
      allBranding,
    });
  } catch (error: any) {
    console.error('[test-branding] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
