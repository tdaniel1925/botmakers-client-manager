/**
 * Email Settings Dialog
 * Configure email account settings and preferences
 */

'use client';

import { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { SelectEmailAccount } from '@/db/schema/email-schema';

interface EmailSettingsDialogProps {
  account: SelectEmailAccount;
  onClose: () => void;
  onSave: (settings: Partial<SelectEmailAccount>) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function EmailSettingsDialog({ account, onClose, onSave, onDelete }: EmailSettingsDialogProps) {
  const [signature, setSignature] = useState(account.signature || '');
  const [syncEnabled, setSyncEnabled] = useState(account.settings?.syncEnabled ?? true);
  const [aiSummariesEnabled, setAiSummariesEnabled] = useState(
    account.settings?.aiSummariesEnabled ?? true
  );
  const [aiCopilotEnabled, setAiCopilotEnabled] = useState(
    account.settings?.aiCopilotEnabled ?? true
  );
  const [realtimeNotifications, setRealtimeNotifications] = useState(
    account.settings?.realtimeNotificationsEnabled ?? true
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        signature,
        settings: {
          ...(account.settings || {}),
          syncEnabled,
          sendEnabled: account.settings?.sendEnabled ?? true,
          aiSummariesEnabled,
          aiCopilotEnabled,
          realtimeNotificationsEnabled: realtimeNotifications,
        },
      });
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove ${account.emailAddress}? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border shadow-2xl rounded-lg w-full max-w-2xl">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Email Account Settings</h2>
            <p className="text-sm text-muted-foreground">{account.emailAddress}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Account Info */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Account Information</Label>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Provider:</span>
                <span className="ml-2 font-medium capitalize">{account.provider}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Auth Type:</span>
                <span className="ml-2 font-medium capitalize">{account.authType}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className={`ml-2 font-medium capitalize ${
                  account.status === 'active' ? 'text-green-600' :
                  account.status === 'error' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {account.status}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Sync:</span>
                <span className="ml-2 font-medium">
                  {account.lastSyncAt
                    ? new Date(account.lastSyncAt).toLocaleString()
                    : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="space-y-2">
            <Label htmlFor="signature">Email Signature</Label>
            <Textarea
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Best regards,&#10;Your Name&#10;Your Title"
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              This signature will be automatically added to your outgoing emails
            </p>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Preferences</Label>

            <label className="flex items-center justify-between py-2 cursor-pointer">
              <div>
                <span className="font-medium">Enable Email Sync</span>
                <p className="text-sm text-muted-foreground">
                  Automatically fetch new emails every 5 minutes
                </p>
              </div>
              <input
                type="checkbox"
                checked={syncEnabled}
                onChange={(e) => setSyncEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300"
              />
            </label>

            <label className="flex items-center justify-between py-2 cursor-pointer">
              <div>
                <span className="font-medium">AI Email Summaries</span>
                <p className="text-sm text-muted-foreground">
                  Generate AI summaries when hovering over emails
                </p>
              </div>
              <input
                type="checkbox"
                checked={aiSummariesEnabled}
                onChange={(e) => setAiSummariesEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300"
              />
            </label>

            <label className="flex items-center justify-between py-2 cursor-pointer">
              <div>
                <span className="font-medium">AI Copilot</span>
                <p className="text-sm text-muted-foreground">
                  Enable AI assistant for email management
                </p>
              </div>
              <input
                type="checkbox"
                checked={aiCopilotEnabled}
                onChange={(e) => setAiCopilotEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300"
              />
            </label>

            <label className="flex items-center justify-between py-2 cursor-pointer">
              <div>
                <span className="font-medium">Real-Time Notifications</span>
                <p className="text-sm text-muted-foreground">
                  Get instant notifications for new emails (webhooks)
                </p>
              </div>
              <input
                type="checkbox"
                checked={realtimeNotifications}
                onChange={(e) => setRealtimeNotifications(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300"
              />
            </label>
          </div>

          {/* Danger Zone */}
          <div className="border-t pt-4">
            <Label className="text-sm font-semibold text-destructive">Danger Zone</Label>
            <div className="mt-3 p-4 border border-destructive/30 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">Remove Email Account</p>
                  <p className="text-sm text-muted-foreground">
                    This will permanently remove this account and all synced emails
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Account
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
    </div>
  );
}





