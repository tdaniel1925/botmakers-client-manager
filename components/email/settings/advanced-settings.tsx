/**
 * Advanced Settings Tab
 * Vacation responder, forwarding, shortcuts, import/export
 */

'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Download, Upload, Keyboard } from 'lucide-react';
import { getEmailSettingsAction, updateEmailSettingsAction } from '@/actions/email-settings-actions';
import type { SelectEmailAccount } from '@/db/schema/email-schema';

interface AdvancedSettingsProps {
  account: SelectEmailAccount;
  onUpdate?: () => void;
}

export function AdvancedSettings({ account, onUpdate }: AdvancedSettingsProps) {
  // Vacation Responder
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplySubject, setAutoReplySubject] = useState('');
  const [autoReplyMessage, setAutoReplyMessage] = useState('');
  const [autoReplyStartDate, setAutoReplyStartDate] = useState('');
  const [autoReplyEndDate, setAutoReplyEndDate] = useState('');

  // Forwarding
  const [forwardingEnabled, setForwardingEnabled] = useState(false);
  const [forwardingAddress, setForwardingAddress] = useState('');
  const [forwardingKeepCopy, setForwardingKeepCopy] = useState(true);

  // Keyboard Shortcuts
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true);

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
        // Vacation Responder
        setAutoReplyEnabled(result.settings.autoReplyEnabled ?? false);
        setAutoReplySubject(result.settings.autoReplySubject || '');
        setAutoReplyMessage(result.settings.autoReplyMessage || '');
        setAutoReplyStartDate(
          result.settings.autoReplyStartDate
            ? new Date(result.settings.autoReplyStartDate).toISOString().split('T')[0]
            : ''
        );
        setAutoReplyEndDate(
          result.settings.autoReplyEndDate
            ? new Date(result.settings.autoReplyEndDate).toISOString().split('T')[0]
            : ''
        );

        // Forwarding
        setForwardingEnabled(result.settings.forwardingEnabled ?? false);
        setForwardingAddress(result.settings.forwardingAddress || '');
        setForwardingKeepCopy(result.settings.forwardingKeepCopy ?? true);

        // Keyboard Shortcuts
        setKeyboardShortcutsEnabled(result.settings.keyboardShortcutsEnabled ?? true);
      }
    } catch (error) {
      console.error('Error loading advanced settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const result = await updateEmailSettingsAction(account.id, {
        autoReplyEnabled,
        autoReplySubject,
        autoReplyMessage,
        autoReplyStartDate: autoReplyStartDate ? new Date(autoReplyStartDate) : null,
        autoReplyEndDate: autoReplyEndDate ? new Date(autoReplyEndDate) : null,
        forwardingEnabled,
        forwardingAddress,
        forwardingKeepCopy,
        keyboardShortcutsEnabled,
      });

      if (result.success) {
        onUpdate?.();
        alert('Settings saved successfully');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving advanced settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    try {
      const result = await getEmailSettingsAction(account.id);
      if (result.success && result.settings) {
        const dataStr = JSON.stringify(result.settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `email-settings-${account.emailAddress}-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting settings:', error);
      alert('Failed to export settings');
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const settings = JSON.parse(text);
      
      const result = await updateEmailSettingsAction(account.id, settings);
      if (result.success) {
        await loadSettings();
        onUpdate?.();
        alert('Settings imported successfully');
      } else {
        alert('Failed to import settings');
      }
    } catch (error) {
      console.error('Error importing settings:', error);
      alert('Failed to import settings. Make sure the file is valid.');
    }
  }

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
        <h3 className="text-lg font-semibold mb-1">Advanced Settings</h3>
        <p className="text-sm text-muted-foreground">
          Vacation responder, forwarding, and other advanced features
        </p>
      </div>

      {/* Vacation Responder */}
      <div className="p-4 border rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Vacation Responder</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Send automatic replies when you're away
            </p>
          </div>
          <input
            type="checkbox"
            checked={autoReplyEnabled}
            onChange={(e) => setAutoReplyEnabled(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300"
          />
        </div>

        {autoReplyEnabled && (
          <div className="space-y-3 pt-3 border-t">
            <div className="space-y-2">
              <Label htmlFor="auto-reply-subject">Subject</Label>
              <Input
                id="auto-reply-subject"
                value={autoReplySubject}
                onChange={(e) => setAutoReplySubject(e.target.value)}
                placeholder="Out of Office"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auto-reply-message">Message</Label>
              <Textarea
                id="auto-reply-message"
                value={autoReplyMessage}
                onChange={(e) => setAutoReplyMessage(e.target.value)}
                placeholder="Thank you for your email. I am currently out of office and will respond when I return."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="auto-reply-start">Start Date</Label>
                <Input
                  id="auto-reply-start"
                  type="date"
                  value={autoReplyStartDate}
                  onChange={(e) => setAutoReplyStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auto-reply-end">End Date</Label>
                <Input
                  id="auto-reply-end"
                  type="date"
                  value={autoReplyEndDate}
                  onChange={(e) => setAutoReplyEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Forwarding */}
      <div className="p-4 border rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Email Forwarding</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Forward all incoming emails to another address
            </p>
          </div>
          <input
            type="checkbox"
            checked={forwardingEnabled}
            onChange={(e) => setForwardingEnabled(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300"
          />
        </div>

        {forwardingEnabled && (
          <div className="space-y-3 pt-3 border-t">
            <div className="space-y-2">
              <Label htmlFor="forwarding-address">Forward to Email</Label>
              <Input
                id="forwarding-address"
                type="email"
                value={forwardingAddress}
                onChange={(e) => setForwardingAddress(e.target.value)}
                placeholder="forward@example.com"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={forwardingKeepCopy}
                onChange={(e) => setForwardingKeepCopy(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">Keep a copy in this inbox</span>
            </label>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="p-4 border rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">
              <Keyboard className="inline h-4 w-4 mr-2" />
              Keyboard Shortcuts
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Use keyboard shortcuts for faster navigation
            </p>
          </div>
          <input
            type="checkbox"
            checked={keyboardShortcutsEnabled}
            onChange={(e) => setKeyboardShortcutsEnabled(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300"
          />
        </div>

        {keyboardShortcutsEnabled && (
          <div className="pt-3 border-t">
            <p className="text-sm font-medium mb-2">Available Shortcuts:</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Archive email</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">E</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Delete email</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">#</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reply</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">R</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Forward</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">F</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Compose new</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">C</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Star email</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">S</kbd>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Import/Export */}
      <div className="p-4 border rounded-lg space-y-3">
        <div>
          <Label className="text-base font-medium">Import / Export Settings</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Backup or restore your email settings
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <label>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button variant="outline" type="button" onClick={() => {
              document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
            }}>
              <Upload className="h-4 w-4 mr-2" />
              Import Settings
            </Button>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}



