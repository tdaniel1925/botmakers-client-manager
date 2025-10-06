/**
 * Unified Notification Service
 * Routes notifications to email or SMS based on user preferences
 */

import { getPlatformAdminPreferences, getOrgUserPreferences } from '@/db/queries/notification-preferences-queries';

export type NotificationType = 
  | 'onboarding_invite'
  | 'onboarding_complete'
  | 'todo_approved'
  | 'todo_completed'
  | 'all_todos_complete'
  | 'project_created'
  | 'task_assigned';

interface NotificationData {
  userId: string;
  type: NotificationType;
  isPlatformAdmin?: boolean;
  orgId?: string;
  emailFn: () => Promise<any>;
  smsFn: () => Promise<any>;
}

/**
 * Send notification via email, SMS, or both based on user preferences
 */
export async function sendNotification({
  userId,
  type,
  isPlatformAdmin = false,
  orgId,
  emailFn,
  smsFn,
}: NotificationData) {
  try {
    // Get user preferences
    const prefs = isPlatformAdmin
      ? await getPlatformAdminPreferences(userId)
      : orgId
      ? await getOrgUserPreferences(userId, orgId)
      : null;

    // If no preferences or SMS disabled, send email only
    if (!prefs || !prefs.smsNotificationsEnabled) {
      return await emailFn();
    }

    // Get preference for this notification type
    const notificationPrefs = prefs.notificationPreferences as Record<string, string> | null;
    const preference = notificationPrefs?.[type] || 'email';
    const phoneNumber = prefs.phoneNumber;

    // Route based on preference
    if (preference === 'email') {
      await emailFn();
    } else if (preference === 'sms' && phoneNumber) {
      await smsFn();
    } else if (preference === 'both' && phoneNumber) {
      await Promise.all([emailFn(), smsFn()]);
    } else {
      // Fallback to email if no phone number or invalid preference
      await emailFn();
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    // Fallback to email on error
    try {
      await emailFn();
    } catch (fallbackError) {
      console.error('Fallback email also failed:', fallbackError);
    }
    return { success: false, error };
  }
}

/**
 * Send notification to multiple users
 */
export async function sendNotificationToMultipleUsers(
  notifications: NotificationData[]
) {
  const results = await Promise.allSettled(
    notifications.map(notification => sendNotification(notification))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return {
    total: results.length,
    successful,
    failed,
  };
}
