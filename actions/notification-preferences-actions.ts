/**
 * Notification Preferences Server Actions
 * Handles SMS notification settings for users
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import {
  getPlatformAdminPreferences,
  getOrgUserPreferences,
  updatePlatformAdminPreferences,
  updateOrgUserPreferences,
} from '@/db/queries/notification-preferences-queries';
import { sendTestSMS } from '@/lib/sms-service';

/**
 * Get current user's SMS preferences
 */
export async function getSMSPreferencesAction(orgId?: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Try platform admin first
    const platformPrefs = await getPlatformAdminPreferences(userId);
    if (platformPrefs) {
      return {
        success: true,
        data: {
          phoneNumber: platformPrefs.phoneNumber,
          smsNotificationsEnabled: platformPrefs.smsNotificationsEnabled,
          notificationPreferences: platformPrefs.notificationPreferences,
          isPlatformAdmin: true,
        },
      };
    }

    // If not platform admin and orgId provided, get org user prefs
    if (orgId) {
      const orgPrefs = await getOrgUserPreferences(userId, orgId);
      if (orgPrefs) {
        return {
          success: true,
          data: {
            phoneNumber: orgPrefs.phoneNumber,
            smsNotificationsEnabled: orgPrefs.smsNotificationsEnabled,
            notificationPreferences: orgPrefs.notificationPreferences,
            isPlatformAdmin: false,
          },
        };
      }
    }

    return {
      success: true,
      data: {
        phoneNumber: null,
        smsNotificationsEnabled: false,
        notificationPreferences: {},
        isPlatformAdmin: false,
      },
    };
  } catch (error) {
    console.error('Error getting SMS preferences:', error);
    return {
      success: false,
      error: 'Failed to fetch preferences',
    };
  }
}

/**
 * Update SMS notification preferences
 */
export async function updateSMSPreferencesAction(data: {
  phoneNumber: string;
  smsEnabled: boolean;
  preferences: Record<string, 'email' | 'sms' | 'both'>;
  orgId?: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Check if platform admin
    const isPlatformAdmin = !!(await getPlatformAdminPreferences(userId));

    if (isPlatformAdmin) {
      const result = await updatePlatformAdminPreferences(userId, {
        phoneNumber: data.phoneNumber,
        smsEnabled: data.smsEnabled,
        preferences: data.preferences,
      });
      return result;
    } else if (data.orgId) {
      const result = await updateOrgUserPreferences(userId, data.orgId, {
        phoneNumber: data.phoneNumber,
        smsEnabled: data.smsEnabled,
        preferences: data.preferences,
      });
      return result;
    } else {
      return {
        success: false,
        error: 'Organization ID required for non-platform admins',
      };
    }
  } catch (error) {
    console.error('Error updating SMS preferences:', error);
    return {
      success: false,
      error: 'Failed to update preferences',
    };
  }
}

/**
 * Send test SMS to verify phone number
 */
export async function sendTestSMSAction(phoneNumber: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const result = await sendTestSMS(phoneNumber);
    return result;
  } catch (error) {
    console.error('Error sending test SMS:', error);
    return {
      isSuccess: false,
      message: 'Failed to send test SMS',
    };
  }
}
