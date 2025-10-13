import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { contactsTable, dealsTable, activitiesTable, projectsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Export data handlers for different types
const exportHandlers = {
  contacts: async (userId: string, orgId: string) => {
    const data = await db.query.contactsTable.findMany({
      where: eq(contactsTable.organizationId, orgId),
      limit: 1000, // Reasonable limit for CSV export
    });

    const headers = ['id', 'name', 'email', 'phone', 'company', 'status', 'createdAt'];
    const items = data.map(contact => ({
      id: contact.id,
      name: `${contact.firstName} ${contact.lastName}`,
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      status: contact.status || 'active',
      createdAt: contact.createdAt?.toISOString() || '',
    }));

    return { headers, items };
  },

  deals: async (userId: string, orgId: string) => {
    const data = await db.query.dealsTable.findMany({
      where: eq(dealsTable.organizationId, orgId),
      limit: 1000,
    });

    const headers = ['id', 'title', 'value', 'stage', 'contactId', 'createdAt', 'closedAt'];
    const items = data.map(deal => ({
      id: deal.id,
      title: deal.title,
      value: deal.value || 0,
      stage: deal.stage || '',
      contactId: deal.contactId || '',
      createdAt: deal.createdAt?.toISOString() || '',
      closedAt: deal.actualCloseDate?.toISOString() || '',
    }));

    return { headers, items };
  },

  activities: async (userId: string, orgId: string) => {
    const data = await db.query.activitiesTable.findMany({
      where: eq(activitiesTable.organizationId, orgId),
      limit: 1000,
    });

    const headers = ['id', 'type', 'subject', 'description', 'completed', 'dueDate', 'createdAt'];
    const items = data.map(activity => ({
      id: activity.id,
      type: activity.type || '',
      subject: activity.subject || '',
      description: activity.description || '',
      completed: activity.completed ? 'Yes' : 'No',
      dueDate: activity.dueDate?.toISOString() || '',
      createdAt: activity.createdAt?.toISOString() || '',
    }));

    return { headers, items };
  },

  projects: async (userId: string, orgId: string) => {
    const data = await db.query.projectsTable.findMany({
      where: eq(projectsTable.organizationId, orgId),
      limit: 1000,
    });

    const headers = ['id', 'name', 'description', 'status', 'startDate', 'endDate', 'createdAt'];
    const items = data.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description || '',
      status: project.status || '',
      startDate: project.startDate?.toISOString() || '',
      endDate: project.endDate?.toISOString() || '',
      createdAt: project.createdAt?.toISOString() || '',
    }));

    return { headers, items };
  },
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  try {
    // Check authentication
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { type } = params;

    // Validate export type
    if (!exportHandlers[type as keyof typeof exportHandlers]) {
      return NextResponse.json(
        { error: 'Invalid export type' },
        { status: 400 }
      );
    }

    // Get the appropriate handler
    const handler = exportHandlers[type as keyof typeof exportHandlers];
    const data = await handler(userId, orgId);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

