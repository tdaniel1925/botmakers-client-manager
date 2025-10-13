/**
 * Email Snippets Server Actions
 * Manage text expansion shortcuts for faster email composition
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/db';
import { emailSnippetsTable } from '@/db/schema/email-schema';
import { eq, and, desc } from 'drizzle-orm';
import type { InsertEmailSnippet, SelectEmailSnippet } from '@/db/schema/email-schema';

/**
 * Get all snippets for current user
 */
export async function getSnippetsAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const snippets = await db
      .select()
      .from(emailSnippetsTable)
      .where(
        and(
          eq(emailSnippetsTable.userId, userId),
          eq(emailSnippetsTable.isActive, true)
        )
      )
      .orderBy(desc(emailSnippetsTable.usageCount));

    return { success: true, snippets };
  } catch (error: any) {
    console.error('Error getting snippets:', error);
    return { success: false, error: error.message || 'Failed to get snippets' };
  }
}

/**
 * Create a new snippet
 */
export async function createSnippetAction(data: Omit<InsertEmailSnippet, 'userId'>) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if shortcut already exists
    const existing = await db.query.emailSnippetsTable.findFirst({
      where: and(
        eq(emailSnippetsTable.userId, userId),
        eq(emailSnippetsTable.shortcut, data.shortcut)
      ),
    });

    if (existing) {
      return { success: false, error: 'A snippet with this shortcut already exists' };
    }

    const [snippet] = await db
      .insert(emailSnippetsTable)
      .values({
        ...data,
        userId,
      })
      .returning();

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true, snippet };
  } catch (error: any) {
    console.error('Error creating snippet:', error);
    return { success: false, error: error.message || 'Failed to create snippet' };
  }
}

/**
 * Update a snippet
 */
export async function updateSnippetAction(id: string, data: Partial<InsertEmailSnippet>) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const snippet = await db.query.emailSnippetsTable.findFirst({
      where: eq(emailSnippetsTable.id, id),
    });

    if (!snippet || snippet.userId !== userId) {
      return { success: false, error: 'Snippet not found' };
    }

    const [updated] = await db
      .update(emailSnippetsTable)
      .set(data)
      .where(eq(emailSnippetsTable.id, id))
      .returning();

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true, snippet: updated };
  } catch (error: any) {
    console.error('Error updating snippet:', error);
    return { success: false, error: error.message || 'Failed to update snippet' };
  }
}

/**
 * Delete a snippet
 */
export async function deleteSnippetAction(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const snippet = await db.query.emailSnippetsTable.findFirst({
      where: eq(emailSnippetsTable.id, id),
    });

    if (!snippet || snippet.userId !== userId) {
      return { success: false, error: 'Snippet not found' };
    }

    await db
      .delete(emailSnippetsTable)
      .where(eq(emailSnippetsTable.id, id));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting snippet:', error);
    return { success: false, error: error.message || 'Failed to delete snippet' };
  }
}

/**
 * Increment snippet usage count
 */
export async function incrementSnippetUsageAction(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const snippet = await db.query.emailSnippetsTable.findFirst({
      where: eq(emailSnippetsTable.id, id),
    });

    if (!snippet || snippet.userId !== userId) {
      return { success: false, error: 'Snippet not found' };
    }

    await db
      .update(emailSnippetsTable)
      .set({ usageCount: (snippet.usageCount || 0) + 1 })
      .where(eq(emailSnippetsTable.id, id));

    return { success: true };
  } catch (error: any) {
    console.error('Error incrementing snippet usage:', error);
    return { success: false, error: error.message || 'Failed to increment usage' };
  }
}

/**
 * Search snippets by shortcut prefix
 */
export async function searchSnippetsAction(query: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized', snippets: [] };
    }

    const snippets = await db.query.emailSnippetsTable.findMany({
      where: and(
        eq(emailSnippetsTable.userId, userId),
        eq(emailSnippetsTable.isActive, true)
      ),
    });

    // Filter by shortcut prefix
    const filtered = snippets.filter(s => 
      s.shortcut.toLowerCase().startsWith(query.toLowerCase())
    );

    // Sort by usage count
    filtered.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

    return { success: true, snippets: filtered };
  } catch (error: any) {
    console.error('Error searching snippets:', error);
    return { success: false, error: error.message || 'Failed to search snippets', snippets: [] };
  }
}

/**
 * Get default snippets (pre-built templates)
 */
export function getDefaultSnippets(): Omit<InsertEmailSnippet, 'userId'>[] {
  return [
    {
      shortcut: ';meeting',
      content: 'Hi {name},\\n\\nThanks for reaching out! I\'d be happy to meet. How does {date} at {time} work for you?\\n\\nBest,',
      description: 'Meeting request response',
      category: 'meetings',
      variables: ['{name}', '{date}', '{time}'],
    },
    {
      shortcut: ';thanks',
      content: 'Thanks for your email! I appreciate you reaching out.\n\nBest regards,',
      description: 'Quick thank you',
      category: 'responses',
      variables: [],
    },
    {
      shortcut: ';followup',
      content: 'Hi {name},\n\nJust following up on my previous email. Do you have any updates on {topic}?\n\nThanks!',
      description: 'Follow-up email',
      category: 'follow-ups',
      variables: ['{name}', '{topic}'],
    },
    {
      shortcut: ';decline',
      content: 'Thank you for thinking of me, but I won\'t be able to participate at this time. I appreciate your understanding.\\n\\nBest,',
      description: 'Polite decline',
      category: 'responses',
      variables: [],
    },
    {
      shortcut: ';received',
      content: 'Got it, thanks! I\'ll take a look and get back to you shortly.',
      description: 'Acknowledge receipt',
      category: 'responses',
      variables: [],
    },
  ];
}



