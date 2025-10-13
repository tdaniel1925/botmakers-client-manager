/**
 * Contacts Server Actions
 * CRUD operations for contact management
 */

'use server';

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { emailContactsTable, contactGroupsTable, contactGroupMembersTable } from "@/db/schema";
import { eq, and, or, like, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResult = {
  success: boolean;
  error?: string;
  data?: any;
  updated?: boolean;
  created?: boolean;
  alreadyExists?: boolean;
};

// ============================================================================
// CONTACTS CRUD
// ============================================================================

/**
 * Get all contacts for current user
 */
export async function getContactsAction(options?: {
  searchQuery?: string;
  groupId?: string;
  limit?: number;
  offset?: number;
}): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const { searchQuery, groupId, limit = 100, offset = 0 } = options || {};

    // Build conditions array
    const conditions = [
      eq(emailContactsTable.userId, userId),
      eq(emailContactsTable.isBlocked, false)
    ];

    // Apply search filter
    if (searchQuery) {
      conditions.push(
        or(
          like(emailContactsTable.name, `%${searchQuery}%`),
          like(emailContactsTable.email, `%${searchQuery}%`),
          like(emailContactsTable.company, `%${searchQuery}%`)
        )!
      );
    }

    // Apply group filter
    let contactIds: string[] | null = null;
    if (groupId) {
      const groupMembers = await db
        .select({ contactId: contactGroupMembersTable.contactId })
        .from(contactGroupMembersTable)
        .where(eq(contactGroupMembersTable.groupId, groupId));
      
      contactIds = groupMembers.map(m => m.contactId);
      if (contactIds.length > 0) {
        conditions.push(sql`${emailContactsTable.id} IN (${sql.join(contactIds.map(id => sql`${id}`), sql`, `)})`);
      }
    }

    const contacts = await db
      .select()
      .from(emailContactsTable)
      .where(and(...conditions))
      .orderBy(desc(emailContactsTable.lastEmailedAt))
      .limit(limit)
      .offset(offset);

    return { success: true, data: contacts };
  } catch (error: any) {
    console.error('Get Contacts Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a single contact by ID
 */
export async function getContactAction(contactId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const contact = await db
      .select()
      .from(emailContactsTable)
      .where(and(
        eq(emailContactsTable.id, contactId),
        eq(emailContactsTable.userId, userId)
      ))
      .limit(1);

    if (contact.length === 0) {
      return { success: false, error: 'Contact not found' };
    }

    return { success: true, data: contact[0] };
  } catch (error: any) {
    console.error('Get Contact Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a new contact
 */
export async function createContactAction(contactData: {
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  notes?: string;
  tags?: string[];
  avatarUrl?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  website?: string;
  address?: any;
  source?: 'email' | 'manual' | 'import' | 'calendar';
  sourceEmailId?: string;
  customFields?: Record<string, any>;
}): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    // Check if contact already exists
    const existing = await db
      .select()
      .from(emailContactsTable)
      .where(and(
        eq(emailContactsTable.userId, userId),
        eq(emailContactsTable.email, contactData.email)
      ))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: 'Contact with this email already exists' };
    }

    const newContact = await db
      .insert(emailContactsTable)
      .values({
        userId,
        ...contactData,
        displayName: contactData.name || `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim(),
      })
      .returning();

    revalidatePath('/platform/contacts');
    revalidatePath('/dashboard/contacts');

    return { success: true, data: newContact[0] };
  } catch (error: any) {
    console.error('Create Contact Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing contact
 */
export async function updateContactAction(
  contactId: string,
  updates: Partial<typeof emailContactsTable.$inferInsert>
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const updated = await db
      .update(emailContactsTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(
        eq(emailContactsTable.id, contactId),
        eq(emailContactsTable.userId, userId)
      ))
      .returning();

    if (updated.length === 0) {
      return { success: false, error: 'Contact not found' };
    }

    revalidatePath('/platform/contacts');
    revalidatePath('/dashboard/contacts');

    return { success: true, data: updated[0] };
  } catch (error: any) {
    console.error('Update Contact Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a contact
 */
export async function deleteContactAction(contactId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    await db
      .delete(emailContactsTable)
      .where(and(
        eq(emailContactsTable.id, contactId),
        eq(emailContactsTable.userId, userId)
      ));

    revalidatePath('/platform/contacts');
    revalidatePath('/dashboard/contacts');

    return { success: true };
  } catch (error: any) {
    console.error('Delete Contact Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle favorite status
 */
export async function toggleContactFavoriteAction(contactId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const contact = await db
      .select({ isFavorite: emailContactsTable.isFavorite })
      .from(emailContactsTable)
      .where(and(
        eq(emailContactsTable.id, contactId),
        eq(emailContactsTable.userId, userId)
      ))
      .limit(1);

    if (contact.length === 0) {
      return { success: false, error: 'Contact not found' };
    }

    const updated = await db
      .update(emailContactsTable)
      .set({
        isFavorite: !contact[0].isFavorite,
        updatedAt: new Date(),
      })
      .where(eq(emailContactsTable.id, contactId))
      .returning();

    revalidatePath('/platform/contacts');
    revalidatePath('/dashboard/contacts');

    return { success: true, data: updated[0] };
  } catch (error: any) {
    console.error('Toggle Contact Favorite Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create contact from email
 */
export async function createContactFromEmailAction(data: {
  email: string;
  name: string;
  emailId: string;
}): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    // Check if contact already exists
    const existing = await db
      .select()
      .from(emailContactsTable)
      .where(and(
        eq(emailContactsTable.userId, userId),
        eq(emailContactsTable.email, data.email)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update email count
      await db
        .update(emailContactsTable)
        .set({
          emailCount: sql`${emailContactsTable.emailCount} + 1`,
          lastEmailedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(emailContactsTable.id, existing[0].id));

      return { success: true, data: existing[0], updated: true };
    }

    // Create new contact
    const newContact = await db
      .insert(emailContactsTable)
      .values({
        userId,
        email: data.email,
        name: data.name,
        displayName: data.name,
        source: 'email',
        sourceEmailId: data.emailId,
        emailCount: 1,
        lastEmailedAt: new Date(),
      })
      .returning();

    revalidatePath('/platform/contacts');
    revalidatePath('/dashboard/contacts');

    return { success: true, data: newContact[0], created: true };
  } catch (error: any) {
    console.error('Create Contact From Email Error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// CONTACT GROUPS CRUD
// ============================================================================

/**
 * Get all contact groups
 */
export async function getContactGroupsAction(): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const groups = await db
      .select()
      .from(contactGroupsTable)
      .where(eq(contactGroupsTable.userId, userId))
      .orderBy(contactGroupsTable.name);

    return { success: true, data: groups };
  } catch (error: any) {
    console.error('Get Contact Groups Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a contact group
 */
export async function createContactGroupAction(data: {
  name: string;
  description?: string;
  color?: string;
}): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const newGroup = await db
      .insert(contactGroupsTable)
      .values({
        userId,
        ...data,
      })
      .returning();

    revalidatePath('/platform/contacts');
    revalidatePath('/dashboard/contacts');

    return { success: true, data: newGroup[0] };
  } catch (error: any) {
    console.error('Create Contact Group Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add contact to group
 */
export async function addContactToGroupAction(
  contactId: string,
  groupId: string
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    // Verify ownership
    const contact = await db
      .select()
      .from(emailContactsTable)
      .where(and(
        eq(emailContactsTable.id, contactId),
        eq(emailContactsTable.userId, userId)
      ))
      .limit(1);

    if (contact.length === 0) {
      return { success: false, error: 'Contact not found' };
    }

    // Check if already in group
    const existing = await db
      .select()
      .from(contactGroupMembersTable)
      .where(and(
        eq(contactGroupMembersTable.contactId, contactId),
        eq(contactGroupMembersTable.groupId, groupId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, data: existing[0], alreadyExists: true };
    }

    const member = await db
      .insert(contactGroupMembersTable)
      .values({
        contactId,
        groupId,
      })
      .returning();

    revalidatePath('/platform/contacts');
    revalidatePath('/dashboard/contacts');

    return { success: true, data: member[0] };
  } catch (error: any) {
    console.error('Add Contact To Group Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove contact from group
 */
export async function removeContactFromGroupAction(
  contactId: string,
  groupId: string
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    await db
      .delete(contactGroupMembersTable)
      .where(and(
        eq(contactGroupMembersTable.contactId, contactId),
        eq(contactGroupMembersTable.groupId, groupId)
      ));

    revalidatePath('/platform/contacts');
    revalidatePath('/dashboard/contacts');

    return { success: true };
  } catch (error: any) {
    console.error('Remove Contact From Group Error:', error);
    return { success: false, error: error.message };
  }
}
