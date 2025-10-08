"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";
import { Loader2, CheckCircle2, AlertCircle, Phone, Mail, ExternalLink } from "lucide-react";
import {
  getOrganizationCredentialsAction,
  updateTwilioCredentialsAction,
  updateResendCredentialsAction,
  testTwilioConnectionAction,
  testResendConnectionAction,
  deleteTwilioCredentialsAction,
  deleteResendCredentialsAction,
} from "@/actions/organization-credentials-actions";

interface MessagingCredentialsSettingsProps {
  organizationId: string;
}

export function MessagingCredentialsSettings({
  organizationId,
}: MessagingCredentialsSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [testingTwilio, setTestingTwilio] = useState(false);
  const [testingResend, setTestingResend] = useState(false);
  const [savingTwilio, setSavingTwilio] = useState(false);
  const [savingResend, setSavingResend] = useState(false);

  // Twilio state
  const [twilioEnabled, setTwilioEnabled] = useState(false);
  const [twilioAccountSid, setTwilioAccountSid] = useState("");
  const [twilioAuthToken, setTwilioAuthToken] = useState("");
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState("");
  const [twilioVerified, setTwilioVerified] = useState(false);
  const [twilioLastTested, setTwilioLastTested] = useState<Date | null>(null);

  // Resend state
  const [resendEnabled, setResendEnabled] = useState(false);
  const [resendApiKey, setResendApiKey] = useState("");
  const [resendFromEmail, setResendFromEmail] = useState("");
  const [resendVerified, setResendVerified] = useState(false);
  const [resendLastTested, setResendLastTested] = useState<Date | null>(null);

  useEffect(() => {
    loadCredentials();
  }, [organizationId]);

  async function loadCredentials() {
    setLoading(true);
    try {
      const result = await getOrganizationCredentialsAction(organizationId);

      if (result.error) {
        toast.error("Failed to load credentials", { description: result.error });
        return;
      }

      if (result.data) {
        // Twilio
        setTwilioEnabled(result.data.twilioEnabled || false);
        setTwilioAccountSid(result.data.twilioAccountSid || "");
        setTwilioPhoneNumber(result.data.twilioPhoneNumber || "");
        setTwilioVerified(result.data.twilioVerified || false);
        setTwilioLastTested(
          result.data.twilioLastTestedAt
            ? new Date(result.data.twilioLastTestedAt)
            : null
        );

        // Resend
        setResendEnabled(result.data.resendEnabled || false);
        setResendFromEmail(result.data.resendFromEmail || "");
        setResendVerified(result.data.resendVerified || false);
        setResendLastTested(
          result.data.resendLastTestedAt
            ? new Date(result.data.resendLastTestedAt)
            : null
        );
      }
    } catch (error) {
      console.error("Error loading credentials:", error);
      toast.error("Failed to load credentials");
    } finally {
      setLoading(false);
    }
  }

  async function handleTestTwilio() {
    setTestingTwilio(true);
    try {
      const result = await testTwilioConnectionAction(organizationId);

      if (result.error) {
        toast.error("Twilio Connection Failed", { description: result.error });
        setTwilioVerified(false);
        return;
      }

      toast.success("Twilio Connection Successful", {
        description: "Your Twilio credentials are working correctly.",
      });
      setTwilioVerified(true);
      setTwilioLastTested(new Date());
    } catch (error) {
      console.error("Error testing Twilio:", error);
      toast.error("Failed to test Twilio connection");
    } finally {
      setTestingTwilio(false);
    }
  }

  async function handleTestResend() {
    setTestingResend(true);
    try {
      const result = await testResendConnectionAction(organizationId);

      if (result.error) {
        toast.error("Resend Connection Failed", { description: result.error });
        setResendVerified(false);
        return;
      }

      if (result.warning) {
        toast.success("Resend Connection Successful", {
          description: result.warning,
        });
      } else {
        toast.success("Resend Connection Successful", {
          description: "Your Resend credentials are working correctly.",
        });
      }

      setResendVerified(true);
      setResendLastTested(new Date());
    } catch (error) {
      console.error("Error testing Resend:", error);
      toast.error("Failed to test Resend connection");
    } finally {
      setTestingResend(false);
    }
  }

  async function handleSaveTwilio() {
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      toast.error("Missing Fields", {
        description: "Please fill in all Twilio fields.",
      });
      return;
    }

    setSavingTwilio(true);
    try {
      const result = await updateTwilioCredentialsAction(organizationId, {
        accountSid: twilioAccountSid,
        authToken: twilioAuthToken,
        phoneNumber: twilioPhoneNumber,
        testConnection: true,
      });

      if (result.error) {
        toast.error("Failed to Save Twilio Credentials", {
          description: result.error,
        });
        return;
      }

      toast.success("Twilio Credentials Saved", {
        description: result.verified
          ? "Your credentials have been saved and verified."
          : "Your credentials have been saved but not yet verified.",
      });

      setTwilioVerified(result.verified || false);
      if (result.verified) {
        setTwilioLastTested(new Date());
      }

      // Clear auth token after saving for security
      setTwilioAuthToken("");
    } catch (error) {
      console.error("Error saving Twilio:", error);
      toast.error("Failed to save Twilio credentials");
    } finally {
      setSavingTwilio(false);
    }
  }

  async function handleSaveResend() {
    if (!resendApiKey || !resendFromEmail) {
      toast.error("Missing Fields", {
        description: "Please fill in all Resend fields.",
      });
      return;
    }

    setSavingResend(true);
    try {
      const result = await updateResendCredentialsAction(organizationId, {
        apiKey: resendApiKey,
        fromEmail: resendFromEmail,
        testConnection: true,
      });

      if (result.error) {
        toast.error("Failed to Save Resend Credentials", {
          description: result.error,
        });
        return;
      }

      if (result.warning) {
        toast.success("Resend Credentials Saved", {
          description: result.warning,
        });
      } else {
        toast.success("Resend Credentials Saved", {
          description: result.verified
            ? "Your credentials have been saved and verified."
            : "Your credentials have been saved but not yet verified.",
        });
      }

      setResendVerified(result.verified || false);
      if (result.verified) {
        setResendLastTested(new Date());
      }

      // Clear API key after saving for security
      setResendApiKey("");
    } catch (error) {
      console.error("Error saving Resend:", error);
      toast.error("Failed to save Resend credentials");
    } finally {
      setSavingResend(false);
    }
  }

  async function handleRevertTwilio() {
    if (!confirm("Are you sure you want to revert to platform Twilio credentials?")) {
      return;
    }

    try {
      const result = await deleteTwilioCredentialsAction(organizationId);

      if (result.error) {
        toast.error("Failed to revert Twilio credentials", {
          description: result.error,
        });
        return;
      }

      toast.success("Reverted to Platform Credentials", {
        description: "Now using platform Twilio credentials for SMS.",
      });

      // Reset state
      setTwilioEnabled(false);
      setTwilioAccountSid("");
      setTwilioAuthToken("");
      setTwilioPhoneNumber("");
      setTwilioVerified(false);
      setTwilioLastTested(null);
    } catch (error) {
      console.error("Error reverting Twilio:", error);
      toast.error("Failed to revert Twilio credentials");
    }
  }

  async function handleRevertResend() {
    if (!confirm("Are you sure you want to revert to platform Resend credentials?")) {
      return;
    }

    try {
      const result = await deleteResendCredentialsAction(organizationId);

      if (result.error) {
        toast.error("Failed to revert Resend credentials", {
          description: result.error,
        });
        return;
      }

      toast.success("Reverted to Platform Credentials", {
        description: "Now using platform Resend credentials for email.",
      });

      // Reset state
      setResendEnabled(false);
      setResendApiKey("");
      setResendFromEmail("");
      setResendVerified(false);
      setResendLastTested(null);
    } catch (error) {
      console.error("Error reverting Resend:", error);
      toast.error("Failed to revert Resend credentials");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          By default, messaging uses platform-wide credentials. You can optionally configure your
          own Twilio and Resend accounts for more control and dedicated rate limits.
        </AlertDescription>
      </Alert>

      {/* Twilio SMS Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>Twilio SMS Configuration</CardTitle>
                <CardDescription>
                  Configure your own Twilio account for sending SMS messages
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {twilioVerified && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}
              {twilioEnabled && !twilioVerified && (
                <Badge variant="secondary">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Not Verified
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="twilio-enabled">Use Custom Twilio Account</Label>
            <Switch
              id="twilio-enabled"
              checked={twilioEnabled}
              onCheckedChange={setTwilioEnabled}
            />
          </div>

          {twilioEnabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="twilio-sid">Account SID</Label>
                <Input
                  id="twilio-sid"
                  value={twilioAccountSid}
                  onChange={(e) => setTwilioAccountSid(e.target.value)}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twilio-token">Auth Token</Label>
                <Input
                  id="twilio-token"
                  type="password"
                  value={twilioAuthToken}
                  onChange={(e) => setTwilioAuthToken(e.target.value)}
                  placeholder="Enter auth token"
                />
                <p className="text-xs text-muted-foreground">
                  For security, you&apos;ll need to re-enter your auth token to make changes.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="twilio-phone">Phone Number</Label>
                <Input
                  id="twilio-phone"
                  value={twilioPhoneNumber}
                  onChange={(e) => setTwilioPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>

              {twilioLastTested && (
                <p className="text-xs text-muted-foreground">
                  Last tested: {twilioLastTested.toLocaleString()}
                </p>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSaveTwilio} disabled={savingTwilio}>
                  {savingTwilio && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save & Test Credentials
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestTwilio}
                  disabled={testingTwilio || !twilioAccountSid}
                >
                  {testingTwilio && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test Connection
                </Button>
                <Button variant="ghost" onClick={handleRevertTwilio}>
                  Revert to Platform
                </Button>
              </div>

              <Alert>
                <ExternalLink className="h-4 w-4" />
                <AlertDescription>
                  Get your Twilio credentials from{" "}
                  <a
                    href="https://console.twilio.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    Twilio Console
                  </a>
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {/* Resend Email Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-purple-600" />
              <div>
                <CardTitle>Resend Email Configuration</CardTitle>
                <CardDescription>
                  Configure your own Resend account for sending emails
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {resendVerified && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}
              {resendEnabled && !resendVerified && (
                <Badge variant="secondary">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Not Verified
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="resend-enabled">Use Custom Email Service</Label>
            <Switch
              id="resend-enabled"
              checked={resendEnabled}
              onCheckedChange={setResendEnabled}
            />
          </div>

          {resendEnabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="resend-key">API Key</Label>
                <Input
                  id="resend-key"
                  type="password"
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                />
                <p className="text-xs text-muted-foreground">
                  For security, you&apos;ll need to re-enter your API key to make changes.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resend-email">From Email</Label>
                <Input
                  id="resend-email"
                  type="email"
                  value={resendFromEmail}
                  onChange={(e) => setResendFromEmail(e.target.value)}
                  placeholder="noreply@yourdomain.com"
                />
                <p className="text-xs text-muted-foreground">
                  Make sure this domain is verified in your Resend account.
                </p>
              </div>

              {resendLastTested && (
                <p className="text-xs text-muted-foreground">
                  Last tested: {resendLastTested.toLocaleString()}
                </p>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSaveResend} disabled={savingResend}>
                  {savingResend && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save & Test Credentials
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestResend}
                  disabled={testingResend || !resendApiKey}
                >
                  {testingResend && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test Connection
                </Button>
                <Button variant="ghost" onClick={handleRevertResend}>
                  Revert to Platform
                </Button>
              </div>

              <Alert>
                <ExternalLink className="h-4 w-4" />
                <AlertDescription>
                  Get your Resend API key from{" "}
                  <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    Resend Dashboard
                  </a>
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

