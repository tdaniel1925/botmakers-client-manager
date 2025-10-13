/**
 * SMS Settings Component
 * Phone verification and SMS reminder settings
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Check, Loader2, AlertCircle } from 'lucide-react';
import { getSmsSettingsAction, sendSmsVerificationAction, verifySmsCodeAction, updateSmsSettingsAction } from '@/actions/reminders-calendar-actions';
import type { SelectUserSmsSettings } from '@/db/schema';
import { useToast } from '@/components/ui/use-toast';

export function SmsSettings() {
  const [settings, setSettings] = useState<SelectUserSmsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const result = await getSmsSettingsAction();
    if (result.success && result.data) {
      setSettings(result.data);
      setPhoneNumber(result.data.phoneNumber || '');
    }
    setLoading(false);
  };

  const handleSendVerificationCode = async () => {
    if (!phoneNumber) {
      toast({
        title: 'Error',
        description: 'Please enter a phone number',
        variant: 'destructive',
      });
      return;
    }

    // Basic phone validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s()-]/g, ''))) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid phone number with country code (e.g., +1 555 123 4567)',
        variant: 'destructive',
      });
      return;
    }

    setSendingCode(true);
    const result = await sendSmsVerificationAction(phoneNumber);

    if (result.success) {
      setCodeSent(true);
      toast({
        title: 'Verification code sent',
        description: 'Check your phone for the 6-digit code',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to send verification code',
        variant: 'destructive',
      });
    }
    setSendingCode(false);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter the 6-digit verification code',
        variant: 'destructive',
      });
      return;
    }

    setVerifying(true);
    const result = await verifySmsCodeAction(verificationCode);

    if (result.success) {
      toast({
        title: 'Phone verified!',
        description: 'Your phone number has been verified successfully',
      });
      setCodeSent(false);
      setVerificationCode('');
      loadSettings();
    } else {
      toast({
        title: 'Verification failed',
        description: result.error || 'Invalid or expired code',
        variant: 'destructive',
      });
    }
    setVerifying(false);
  };

  const handleToggleSms = async () => {
    if (!settings) return;

    const result = await updateSmsSettingsAction({
      smsEnabled: !settings.smsEnabled,
    });

    if (result.success) {
      toast({
        title: settings.smsEnabled ? 'SMS disabled' : 'SMS enabled',
        description: settings.smsEnabled 
          ? 'SMS reminders have been turned off'
          : 'SMS reminders are now active',
      });
      loadSettings();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update settings',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>SMS Settings</CardTitle>
              <CardDescription>
                Set up SMS reminders for important emails and events
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Verification Status */}
          {settings?.phoneNumberVerified ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">Phone Verified</h3>
                  <p className="text-sm text-green-700">{settings.phoneNumber}</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Verified
                </Badge>
              </div>

              {/* SMS Toggle */}
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-green-900">SMS Reminders</h4>
                    <p className="text-sm text-green-700">
                      {settings.smsEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <Button
                    variant={settings.smsEnabled ? 'destructive' : 'default'}
                    size="sm"
                    onClick={handleToggleSms}
                  >
                    {settings.smsEnabled ? 'Disable' : 'Enable'} SMS
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Phone Number Input */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={codeSent}
                  />
                  <Button
                    onClick={handleSendVerificationCode}
                    disabled={sendingCode || codeSent || !phoneNumber}
                  >
                    {sendingCode ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : codeSent ? (
                      'Code Sent'
                    ) : (
                      'Send Code'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +1 for US)
                </p>
              </div>

              {/* Verification Code Input */}
              {codeSent && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 mb-1">Verification Code Sent</h4>
                      <p className="text-sm text-blue-700">
                        We've sent a 6-digit code to {phoneNumber}. Enter it below to verify your phone.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="code"
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        className="font-mono text-lg tracking-widest"
                      />
                      <Button
                        onClick={handleVerifyCode}
                        disabled={verifying || verificationCode.length !== 6}
                      >
                        {verifying ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Verify'
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCodeSent(false);
                      setVerificationCode('');
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Use a different number
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="rounded-lg border bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">About SMS Reminders</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Receive text reminders for important emails and events</li>
              <li>Standard SMS rates may apply from your carrier</li>
              <li>You can disable SMS at any time</li>
              <li>Your phone number is stored securely and never shared</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Twilio Configuration (Admin Only) */}
      {settings?.phoneNumberVerified && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">SMS Provider</CardTitle>
            <CardDescription className="text-xs">
              Powered by Twilio for reliable message delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              SMS reminders are sent via Twilio. Configure your Twilio credentials in environment variables.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


