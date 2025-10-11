/**
 * Notification Settings Tab
 * Configure email notification preferences
 */

'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { getEmailSettingsAction, updateEmailSettingsAction } from '@/actions/email-settings-actions';
import type { SelectEmailAccount } from '@/db/schema/email-schema';

interface NotificationSettingsProps {
  account: SelectEmailAccount;
  onUpdate?: () => void;
}

export function NotificationSettings({ account, onUpdate }: NotificationSettingsProps) {
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [notifyOnImportantOnly, setNotifyOnImportantOnly] = useState(false);
  const [notificationSound, setNotificationSound] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [account.id]);

  async function loadSettings() {
    setLoading(true);
    try {
      const result = await getEmailSettingsAction(account.id);
      if (result.success && result.settings) {
        setDesktopNotifications(result.settings.desktopNotifications ?? true);
        setEmailNotifications(result.settings.emailNotifications ?? false);
        setNotifyOnImportantOnly(result.settings.notifyOnImportantOnly ?? false);
        setNotificationSound(result.settings.notificationSound ?? true);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const result = await updateEmailSettingsAction(account.id, {
        desktopNotifications,
        emailNotifications,
        notifyOnImportantOnly,
        notificationSound,
      });

      if (result.success) {
        onUpdate?.();
      } else {
        alert('Failed to save notification settings');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      alert('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  }

  // Auto-save on toggle changes
  useEffect(() => {
    if (!loading) {
      handleSave();
    }
  }, [desktopNotifications, emailNotifications, notifyOnImportantOnly, notificationSound]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you want to be notified about new emails
        </p>
      </div>

      {/* Desktop Notifications */}
      <div className="flex items-start justify-between p-4 border rounded-lg">
        <div className="flex-1">
          <Label className="text-base font-medium">Desktop Notifications</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Show browser notifications when new emails arrive
          </p>
          {desktopNotifications && typeof window !== 'undefined' && Notification.permission === 'default' && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => Notification.requestPermission()}
            >
              Grant Permission
            </Button>
          )}
          {desktopNotifications && typeof window !== 'undefined' && Notification.permission === 'denied' && (
            <p className="text-xs text-destructive mt-2">
              Browser notifications are blocked. Please enable them in your browser settings.
            </p>
          )}
        </div>
        <input
          type="checkbox"
          checked={desktopNotifications}
          onChange={(e) => setDesktopNotifications(e.target.checked)}
          className="h-5 w-5 rounded border-gray-300 mt-1"
        />
      </div>

      {/* Notification Sound */}
      <div className="flex items-start justify-between p-4 border rounded-lg">
        <div className="flex-1">
          <Label className="text-base font-medium">Notification Sound</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Play a sound when desktop notifications appear
          </p>
        </div>
        <input
          type="checkbox"
          checked={notificationSound}
          onChange={(e) => setNotificationSound(e.target.checked)}
          disabled={!desktopNotifications}
          className="h-5 w-5 rounded border-gray-300 mt-1 disabled:opacity-50"
        />
      </div>

      {/* Important Only */}
      <div className="flex items-start justify-between p-4 border rounded-lg">
        <div className="flex-1">
          <Label className="text-base font-medium">Important Emails Only</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Only notify for emails marked as important by AI
          </p>
        </div>
        <input
          type="checkbox"
          checked={notifyOnImportantOnly}
          onChange={(e) => setNotifyOnImportantOnly(e.target.checked)}
          disabled={!desktopNotifications}
          className="h-5 w-5 rounded border-gray-300 mt-1 disabled:opacity-50"
        />
      </div>

      {/* Email Notifications */}
      <div className="p-4 border rounded-lg space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Label className="text-base font-medium">Email Notifications</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Forward new email notifications to another address
            </p>
          </div>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 mt-1"
          />
        </div>

        {emailNotifications && (
          <div className="space-y-2 pt-2">
            <Label htmlFor="notification-email">Forward to Email</Label>
            <Input
              id="notification-email"
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="your-phone@carrier.com"
            />
            <p className="text-xs text-muted-foreground">
              Useful for SMS notifications via email-to-SMS gateways
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-muted/30 border rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Real-time notifications require webhook integration. Enable it
          in the General settings tab for instant delivery.
        </p>
      </div>

      {saving && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          Saving changes...
        </div>
      )}
    </div>
  );
}


