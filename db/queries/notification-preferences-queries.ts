/**
 * Notification Preferences Queries
 * Database operations for user SMS notification settings
 */

import { db } from '@/db/db';
import { platformAdminsTable } from '@/db/schema/platform-schema';
import { userRolesTable } from '@/db/schema/crm-schema';
import { eq, and } from 'drizzle-orm';

/**
 * Get platform admin's notification preferences
 */
export async function getPlatformAdminPreferences(userId: string) {
  try {
    const admin = await db
      .select()
      .from(platformAdminsTable)
      .where(eq(platformAdminsTable.userId, userId))
      .limit(1);
    
    return admin[0] || null;
  } catch (error) {
    console.error('Error fetching platform admin preferences:', error);
    return null;
  }
}

/**
 * Get organization user's notification preferences
 */
export async function getOrgUserPreferences(userId: string, orgId: string) {
  try {
    const user = await db
      .select()
      .from(userRolesTable)
      .where(
        and(
          eq(userRolesTable.userId, userId),
          eq(userRolesTable.organizationId, orgId)
        )
      )
      .limit(1);
    
    return user[0] || null;
  } catch (error) {
    console.error('Error fetching org user preferences:', error);
    return null;
  }
}

/**
 * Update notification preferences for platform admin
 */
export async function updatePlatformAdminPreferences(
  userId: string,
  data: {
    phoneNumber?: string;
    smsEnabled?: boolean;
    preferences?: Record<string, 'email' | 'sms' | 'both'>;
  }
) {
  try {
    const updateData: any = {};
    
    if (data.phoneNumber !== undefined) {
      updateData.phoneNumber = data.phoneNumber;
    }
    if (data.smsEnabled !== undefined) {
      updateData.smsNotificationsEnabled = data.smsEnabled;
    }
    if (data.preferences !== undefined) {
      updateData.notificationPreferences = data.preferences;
    }

    await db
      .update(platformAdminsTable)
      .set(updateData)
      .where(eq(platformAdminsTable.userId, userId));

    return { success: true };
  } catch (error) {
    console.error('Error updating platform admin preferences:', error);
    return { success: false, error };
  }
}

/**
 * Update notification preferences for org user
 */
export async function updateOrgUserPreferences(
  userId: string,
  orgId: string,
  data: {
    phoneNumber?: string;
    smsEnabled?: boolean;
    preferences?: Record<string, 'email' | 'sms' | 'both'>;
  }
) {
  try {
    const updateData: any = {};
    
    if (data.phoneNumber !== undefined) {
      updateData.phoneNumber = data.phoneNumber;
    }
    if (data.smsEnabled !== undefined) {
      updateData.smsNotificationsEnabled = data.smsEnabled;
    }
    if (data.preferences !== undefined) {
      updateData.notificationPreferences = data.preferences;
    }

    await db
      .update(userRolesTable)
      .set(updateData)
      .where(
        and(
          eq(userRolesTable.userId, userId),
          eq(userRolesTable.organizationId, orgId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error('Error updating org user preferences:', error);
    return { success: false, error };
  }
}
