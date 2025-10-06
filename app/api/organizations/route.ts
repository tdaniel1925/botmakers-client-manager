/**
 * Organizations API Route
 * Fetch organizations for the current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { organizationsTable, userRolesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isPlatformAdmin } from '@/lib/platform-admin';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if platform admin
    const isAdmin = await isPlatformAdmin();

    let organizations;

    if (isAdmin) {
      // Platform admins can see all organizations
      organizations = await db.select().from(organizationsTable);
    } else {
      // Regular users see only their organizations
      const userOrgs = await db
        .select({
          id: organizationsTable.id,
          name: organizationsTable.name,
          plan: organizationsTable.plan,
          status: organizationsTable.status,
        })
        .from(userRolesTable)
        .leftJoin(organizationsTable, eq(userRolesTable.organizationId, organizationsTable.id))
        .where(eq(userRolesTable.userId, userId));

      organizations = userOrgs.map(org => ({
        id: org.id,
        name: org.name,
        plan: org.plan,
        status: org.status,
      }));
    }

    return NextResponse.json({
      success: true,
      organizations,
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch organizations',
      },
      { status: 500 }
    );
  }
}
