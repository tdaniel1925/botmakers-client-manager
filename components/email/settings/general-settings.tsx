/**
 * General Settings Tab
 * Auto-sync, webhook, and account info settings
 */

'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2 } from 'lucide-react';
import { getEmailSettingsAction, updateEmailSettingsAction } from '@/actions/email-settings-actions';
import type { SelectEmailAccount, SelectEmailSettings } from '@/db/schema/email-schema';

interface GeneralSettingsProps {
  account: SelectEmailAccount;
}

export function GeneralSettings({ account }: GeneralSettingsProps) {
  const [settings, setSettings] = useState<SelectEmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (account?.id) {
      loadSettings();
    }
  }, [account?.id]);

  async function loadSettings() {
    if (!account?.id) return;
    
    setLoading(true);
    const result = await getEmailSettingsAction(account.id);
    if (result.success && result.settings) {
      setSettings(result.settings);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!settings || !account?.id) return;

    setSaving(true);
    const result = await updateEmailSettingsAction(account.id, {
      autoSyncEnabled: settings.autoSyncEnabled,
      webhookEnabled: settings.webhookEnabled,
      syncFrequencyMinutes: settings.syncFrequencyMinutes,
    });

    if (result.success) {
      alert('Settings saved successfully!');
    } else {
      alert(`Failed to save settings: ${result.error}`);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Email Address:</span>
            <p className="font-medium">{account.emailAddress}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Provider:</span>
            <p className="font-medium capitalize">{account.provider}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Auth Type:</span>
            <p className="font-medium capitalize">{account.authType}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <p className={`font-medium capitalize ${
              account.status === 'active' ? 'text-green-600' :
              account.status === 'error' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {account.status}
            </p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Last Sync:</span>
            <p className="font-medium">
              {account.lastSyncAt
                ? new Date(account.lastSyncAt).toLocaleString()
                : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Sync Settings */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Sync Settings</h3>
        <div className="space-y-4">
          {/* Auto Sync Toggle */}
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div>
              <span className="font-medium">Enable Auto-Sync</span>
              <p className="text-sm text-muted-foreground">
                Automatically sync emails in the background
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoSyncEnabled ?? true}
              onChange={(e) => setSettings({ ...settings, autoSyncEnabled: e.target.checked })}
              className="h-5 w-5 rounded border-gray-300"
            />
          </label>

          {/* Webhook/Real-time Toggle */}
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div>
              <span className="font-medium">Enable Real-Time Sync (Webhooks)</span>
              <p className="text-sm text-muted-foreground">
                Receive emails instantly as they arrive
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.webhookEnabled ?? true}
              onChange={(e) => setSettings({ ...settings, webhookEnabled: e.target.checked })}
              className="h-5 w-5 rounded border-gray-300"
            />
          </label>

          {/* Sync Frequency */}
          <div className="space-y-2">
            <Label>Sync Frequency (minutes)</Label>
            <Select
              value={String(settings.syncFrequencyMinutes || 5)}
              onValueChange={(value) => setSettings({ ...settings, syncFrequencyMinutes: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Every 1 minute</SelectItem>
                <SelectItem value="5">Every 5 minutes</SelectItem>
                <SelectItem value="15">Every 15 minutes</SelectItem>
                <SelectItem value="30">Every 30 minutes</SelectItem>
                <SelectItem value="60">Every hour</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How often to check for new emails (only used when webhooks are disabled)
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}


