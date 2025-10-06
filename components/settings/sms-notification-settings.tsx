'use client';

/**
 * SMS Notification Settings Component
 * Allows users to configure SMS notification preferences
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, Bell, Check } from 'lucide-react';
import { getSMSPreferencesAction, updateSMSPreferencesAction, sendTestSMSAction } from '@/actions/notification-preferences-actions';

const notificationTypes = [
  { key: 'onboarding_invite', label: 'Onboarding Invitations Sent' },
  { key: 'onboarding_complete', label: 'Client Completes Onboarding' },
  { key: 'todo_approved', label: 'To-Dos Approved for Client' },
  { key: 'todo_completed', label: 'Client Completes a To-Do' },
  { key: 'all_todos_complete', label: 'All To-Dos Complete' },
  { key: 'project_created', label: 'New Project Created' },
  { key: 'task_assigned', label: 'Task Assigned to You' },
];

interface SMSNotificationSettingsProps {
  orgId?: string;
}

export function SMSNotificationSettings({ orgId }: SMSNotificationSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSMS, setTestingSMS] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [phone, setPhone] = useState('');
  const [preferences, setPreferences] = useState<Record<string, string>>({});

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const result = await getSMSPreferencesAction(orgId);
      
      if (result.success && result.data) {
        setEnabled(result.data.smsNotificationsEnabled || false);
        setPhone(result.data.phoneNumber || '');
        setPreferences((result.data.notificationPreferences as Record<string, string>) || {});
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load SMS preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate phone number if enabled
      if (enabled && !phone) {
        toast.error('Please enter a phone number');
        return;
      }

      const result = await updateSMSPreferencesAction({
        phoneNumber: phone,
        smsEnabled: enabled,
        preferences,
        orgId,
      });

      if (result.success) {
        toast.success('SMS preferences saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save SMS preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSMS = async () => {
    if (!phone) {
      toast.error('Please enter a phone number first');
      return;
    }

    try {
      setTestingSMS(true);
      const result = await sendTestSMSAction(phone);
      
      if (result.isSuccess) {
        toast.success('Test SMS sent! Check your phone.');
      } else {
        toast.error(result.message || 'Failed to send test SMS');
      }
    } catch (error) {
      console.error('Error sending test SMS:', error);
      toast.error('Failed to send test SMS');
    } finally {
      setTestingSMS(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SMS Notifications</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          SMS Notifications
        </CardTitle>
        <CardDescription>
          Receive important updates via text message
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
            <p className="text-sm text-gray-500">
              Get notified via text in addition to email
            </p>
          </div>
          <Switch
            id="sms-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {/* Phone Number & Settings (only show when enabled) */}
        {enabled && (
          <>
            {/* Phone Number Input */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleTestSMS}
                  disabled={testingSMS || !phone}
                >
                  {testingSMS ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Test SMS'
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Include country code (e.g., +1 for US, +44 for UK)
              </p>
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertDescription>
                <strong>Note:</strong> Standard SMS rates may apply. You can choose email, SMS, or both for each notification type below.
              </AlertDescription>
            </Alert>

            {/* Notification Type Preferences */}
            <div className="space-y-4">
              <Label>Notification Preferences</Label>
              <div className="space-y-3">
                {notificationTypes.map((type) => (
                  <div key={type.key} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm">{type.label}</span>
                    <Select
                      value={preferences[type.key] || 'email'}
                      onValueChange={(value) => 
                        setPreferences({ ...preferences, [type.key]: value })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">📧 Email</SelectItem>
                        <SelectItem value="sms">📱 SMS</SelectItem>
                        <SelectItem value="both">📧📱 Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Disabled State Message */}
        {!enabled && (
          <Alert>
            <AlertDescription>
              SMS notifications are currently disabled. Toggle the switch above to enable them.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
