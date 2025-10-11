/**
 * Add Email Account Dialog - Nylas Edition
 * Connect email accounts via Nylas OAuth (Gmail, Outlook) or IMAP fallback
 */

'use client';

import { useState } from 'react';
import { X, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { connectNylasAccountAction } from '@/actions/email-nylas-actions';

interface AddEmailAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddEmailAccountDialog({ open, onOpenChange, onSuccess }: AddEmailAccountDialogProps) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    if (!connecting) {
      onOpenChange(false);
    }
  };

  const handleConnect = async (provider: 'gmail' | 'microsoft' | 'imap') => {
    setError('');
    setConnecting(true);

    try {
      const result = await connectNylasAccountAction(provider);

      if (result.authUrl) {
        // Redirect to Nylas OAuth
        window.location.href = result.authUrl;
      } else if (result.error) {
        setError(result.error);
        setConnecting(false);
      }
    } catch (err) {
      setError('Failed to initiate connection');
      setConnecting(false);
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-background border shadow-2xl rounded-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Connect Email Account</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={connecting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your email account to start managing emails with AI-powered features.
          </p>

          {/* Provider Buttons */}
          <div className="space-y-3">
            {/* Gmail */}
            <Button
              onClick={() => handleConnect('gmail')}
              disabled={connecting}
              className="w-full justify-start h-auto py-4 px-4"
              variant="outline"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#EA4335" d="M5 5v14h14V5H5zm13 13H6V6h12v12z"/>
                    <path fill="#FBBC05" d="M8.5 8.5h7v7h-7z"/>
                    <path fill="#34A853" d="M8.5 11h3.5v4.5H8.5z"/>
                    <path fill="#4285F4" d="M12 8.5h3.5V12H12z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-base">Gmail</div>
                  <div className="text-xs text-muted-foreground">
                    Connect your Google account (recommended)
                  </div>
                </div>
                {connecting && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </Button>

            {/* Microsoft/Outlook */}
            <Button
              onClick={() => handleConnect('microsoft')}
              disabled={connecting}
              className="w-full justify-start h-auto py-4 px-4"
              variant="outline"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0 w-8 h-8 bg-[#0078D4] rounded flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                    <path d="M3 3v18h18V3H3zm16 16H5V5h14v14z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-base">Microsoft / Outlook</div>
                  <div className="text-xs text-muted-foreground">
                    Connect your Microsoft 365 or Outlook account
                  </div>
                </div>
                {connecting && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </Button>

            {/* IMAP (fallback) */}
            <Button
              onClick={() => handleConnect('imap')}
              disabled={connecting}
              className="w-full justify-start h-auto py-4 px-4"
              variant="outline"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0 w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-base">Other Email Provider</div>
                  <div className="text-xs text-muted-foreground">
                    Yahoo, iCloud, custom IMAP, etc.
                  </div>
                </div>
                {connecting && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              <strong>Secure & Private:</strong> Your email credentials are encrypted and stored
              securely. We use Nylas for reliable, enterprise-grade email connectivity.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-end">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={connecting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
