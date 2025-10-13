/**
 * Display Settings Tab
 * Configure email client display preferences
 */

'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { getEmailSettingsAction, updateEmailSettingsAction } from '@/actions/email-settings-actions';
import type { SelectEmailAccount } from '@/db/schema/email-schema';

interface DisplaySettingsProps {
  account: SelectEmailAccount;
  onUpdate?: () => void;
}

export function DisplaySettings({ account, onUpdate }: DisplaySettingsProps) {
  const [emailsPerPage, setEmailsPerPage] = useState(50);
  const [showPreview, setShowPreview] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
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
        setEmailsPerPage(result.settings.emailsPerPage ?? 50);
        setShowPreview(result.settings.showPreview ?? true);
        setCompactMode(result.settings.compactMode ?? false);
        setDarkMode(result.settings.darkMode ?? false);
      }
    } catch (error) {
      console.error('Error loading display settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(updates: any) {
    setSaving(true);
    try {
      const result = await updateEmailSettingsAction(account.id, updates);

      if (result.success) {
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error saving display settings:', error);
    } finally {
      setSaving(false);
    }
  }

  // Auto-save on changes
  useEffect(() => {
    if (!loading) {
      handleSave({ emailsPerPage, showPreview, compactMode, darkMode });
    }
  }, [emailsPerPage, showPreview, compactMode, darkMode]);

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
        <h3 className="text-lg font-semibold mb-1">Display Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Customize how emails are displayed in your inbox
        </p>
      </div>

      {/* Emails Per Page */}
      <div className="p-4 border rounded-lg space-y-3">
        <div>
          <Label className="text-base font-medium">Emails Per Page</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Number of emails to load at once
          </p>
        </div>
        <select
          value={emailsPerPage}
          onChange={(e) => setEmailsPerPage(Number(e.target.value))}
          className="w-full max-w-xs p-2 border rounded-md"
        >
          <option value={25}>25 emails</option>
          <option value={50}>50 emails</option>
          <option value={100}>100 emails</option>
          <option value={200}>200 emails</option>
        </select>
      </div>

      {/* Show Preview */}
      <div className="flex items-start justify-between p-4 border rounded-lg">
        <div className="flex-1">
          <Label className="text-base font-medium">Email Preview</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Show a snippet of the email content in the list view
          </p>
        </div>
        <input
          type="checkbox"
          checked={showPreview}
          onChange={(e) => setShowPreview(e.target.checked)}
          className="h-5 w-5 rounded border-gray-300 mt-1"
        />
      </div>

      {/* Compact Mode */}
      <div className="flex items-start justify-between p-4 border rounded-lg">
        <div className="flex-1">
          <Label className="text-base font-medium">Compact Mode</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Reduce spacing between emails to fit more on screen
          </p>
        </div>
        <input
          type="checkbox"
          checked={compactMode}
          onChange={(e) => setCompactMode(e.target.checked)}
          className="h-5 w-5 rounded border-gray-300 mt-1"
        />
      </div>

      {/* Dark Mode */}
      <div className="flex items-start justify-between p-4 border rounded-lg">
        <div className="flex-1">
          <Label className="text-base font-medium">Dark Mode</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Use dark theme for the email client (Coming soon)
          </p>
        </div>
        <input
          type="checkbox"
          checked={darkMode}
          onChange={(e) => setDarkMode(e.target.checked)}
          disabled
          className="h-5 w-5 rounded border-gray-300 mt-1 disabled:opacity-50"
        />
      </div>

      {/* Preview Example */}
      <div className="p-4 border rounded-lg space-y-3">
        <Label className="text-base font-medium">Preview</Label>
        <div className={`space-y-2 ${compactMode ? 'space-y-1' : 'space-y-2'}`}>
          <div className={`border rounded p-3 ${compactMode ? 'p-2' : 'p-3'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">Example Sender</p>
                <p className="text-sm font-semibold">Email Subject Line</p>
                {showPreview && (
                  <p className="text-xs text-muted-foreground mt-1">
                    This is a preview of the email content that would appear...
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground">2m ago</span>
            </div>
          </div>
          <div className={`border rounded p-3 ${compactMode ? 'p-2' : 'p-3'} bg-muted/30`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">Another Sender</p>
                <p className="text-sm">Another Email Subject</p>
                {showPreview && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Preview text for the second email example...
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground">1h ago</span>
            </div>
          </div>
        </div>
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



