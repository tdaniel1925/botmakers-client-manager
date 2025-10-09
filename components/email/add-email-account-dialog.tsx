/**
 * Add Email Account Dialog
 * Simple dialog for connecting email accounts via IMAP/SMTP
 */

'use client';

import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { connectImapAccountAction } from '@/actions/email-account-actions';

interface AddEmailAccountDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddEmailAccountDialog({ onClose, onSuccess }: AddEmailAccountDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState('993');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setConnecting(true);

    try {
      const result = await connectImapAccountAction({
        emailAddress: email,
        password,
        imapHost,
        imapPort: parseInt(imapPort),
        smtpHost,
        smtpPort: parseInt(smtpPort),
        smtpSecure: parseInt(smtpPort) === 465,
      });

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to connect account');
      }
    } catch (err) {
      setError('An error occurred while connecting the account');
    } finally {
      setConnecting(false);
    }
  };

  const handleQuickSetup = (provider: 'gmail' | 'outlook' | 'yahoo') => {
    if (provider === 'gmail') {
      setImapHost('imap.gmail.com');
      setImapPort('993');
      setSmtpHost('smtp.gmail.com');
      setSmtpPort('587');
    } else if (provider === 'outlook') {
      setImapHost('outlook.office365.com');
      setImapPort('993');
      setSmtpHost('smtp.office365.com');
      setSmtpPort('587');
    } else if (provider === 'yahoo') {
      setImapHost('imap.mail.yahoo.com');
      setImapPort('993');
      setSmtpHost('smtp.mail.yahoo.com');
      setSmtpPort('587');
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border shadow-2xl rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Connect Email Account</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Setup */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Quick Setup</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleQuickSetup('gmail')}
              >
                Gmail
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleQuickSetup('outlook')}
              >
                Outlook
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleQuickSetup('yahoo')}
              >
                Yahoo
              </Button>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your email password"
              required
            />
            <p className="text-xs text-muted-foreground">
              For Gmail, use an App Password. For others, use your email password.
            </p>
          </div>

          {/* IMAP Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="imapHost">IMAP Host *</Label>
              <Input
                id="imapHost"
                value={imapHost}
                onChange={(e) => setImapHost(e.target.value)}
                placeholder="imap.gmail.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imapPort">IMAP Port *</Label>
              <Input
                id="imapPort"
                type="number"
                value={imapPort}
                onChange={(e) => setImapPort(e.target.value)}
                placeholder="993"
                required
              />
            </div>
          </div>

          {/* SMTP Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host *</Label>
              <Input
                id="smtpHost"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.gmail.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port *</Label>
              <Input
                id="smtpPort"
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={connecting}>
              {connecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

