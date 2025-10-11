/**
 * Signature Settings Tab
 * Configure email signatures with HTML preview
 */

'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { getEmailSettingsAction, updateEmailSettingsAction } from '@/actions/email-settings-actions';
import type { SelectEmailAccount } from '@/db/schema/email-schema';

interface SignatureSettingsProps {
  account: SelectEmailAccount;
  onUpdate?: () => void;
}

export function SignatureSettings({ account, onUpdate }: SignatureSettingsProps) {
  const [signature, setSignature] = useState('');
  const [signatureHtml, setSignatureHtml] = useState('');
  const [signatureEnabled, setSignatureEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [account.id]);

  async function loadSettings() {
    setLoading(true);
    try {
      const result = await getEmailSettingsAction(account.id);
      if (result.success && result.settings) {
        setSignature(result.settings.signature || '');
        setSignatureHtml(result.settings.signatureHtml || '');
        setSignatureEnabled(result.settings.signatureEnabled ?? true);
      }
    } catch (error) {
      console.error('Error loading signature settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const result = await updateEmailSettingsAction(account.id, {
        signature,
        signatureHtml,
        signatureEnabled,
      });

      if (result.success) {
        onUpdate?.();
      } else {
        alert('Failed to save signature settings');
      }
    } catch (error) {
      console.error('Error saving signature:', error);
      alert('Failed to save signature settings');
    } finally {
      setSaving(false);
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
        <h3 className="text-lg font-semibold mb-1">Email Signature</h3>
        <p className="text-sm text-muted-foreground">
          Automatically add a signature to your outgoing emails
        </p>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label className="text-base font-medium">Enable Signature</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Automatically append signature to sent emails
          </p>
        </div>
        <input
          type="checkbox"
          checked={signatureEnabled}
          onChange={(e) => setSignatureEnabled(e.target.checked)}
          className="h-5 w-5 rounded border-gray-300"
        />
      </div>

      {/* Plain Text Signature */}
      <div className="space-y-2">
        <Label htmlFor="signature-text">Plain Text Signature</Label>
        <Textarea
          id="signature-text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Best regards,&#10;John Doe&#10;CEO, Company Name&#10;john@company.com"
          className="min-h-[120px] font-mono text-sm"
          disabled={!signatureEnabled}
        />
        <p className="text-xs text-muted-foreground">
          Used as fallback when HTML is not supported
        </p>
      </div>

      {/* HTML Signature */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="signature-html">HTML Signature</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            disabled={!signatureEnabled}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
        <Textarea
          id="signature-html"
          value={signatureHtml}
          onChange={(e) => setSignatureHtml(e.target.value)}
          placeholder='<div style="font-family: Arial, sans-serif;">&#10;  <p><strong>John Doe</strong><br/>&#10;  CEO, Company Name<br/>&#10;  <a href="mailto:john@company.com">john@company.com</a></p>&#10;</div>'
          className="min-h-[150px] font-mono text-sm"
          disabled={!signatureEnabled}
        />
        <p className="text-xs text-muted-foreground">
          Use HTML for rich formatting (bold, links, images, etc.)
        </p>
      </div>

      {/* HTML Preview */}
      {showPreview && signatureHtml && signatureEnabled && (
        <div className="space-y-2">
          <Label>Preview</Label>
          <div
            className="p-4 border rounded-lg bg-muted/30"
            dangerouslySetInnerHTML={{ __html: signatureHtml }}
          />
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving || !signatureEnabled}>
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Signature
            </>
          )}
        </Button>
      </div>
    </div>
  );
}


