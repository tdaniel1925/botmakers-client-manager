/**
 * Onboarding Session Overview Component
 * Displays detailed information about an onboarding session
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Mail, RotateCw, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  sendOnboardingInvitationAction,
  regenerateOnboardingTokenAction,
  resetOnboardingSessionAction,
} from "@/actions/onboarding-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface OnboardingSessionOverviewProps {
  session: any;
  project: any;
}

export function OnboardingSessionOverview({
  session,
  project,
}: OnboardingSessionOverviewProps) {
  const router = useRouter();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [resetAndSendDialogOpen, setResetAndSendDialogOpen] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [sending, setSending] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [resetting, setResetting] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  const onboardingUrl = `${appUrl}/onboarding/${session.accessToken}`;

  const copyLink = () => {
    navigator.clipboard.writeText(onboardingUrl);
    toast.success("Link copied to clipboard!");
  };

  const openLink = () => {
    window.open(onboardingUrl, "_blank");
  };

  const sendInvitation = async () => {
    if (!clientEmail || !clientName) {
      toast.error("Please enter both email and name");
      return;
    }

    setSending(true);
    const result = await sendOnboardingInvitationAction(
      session.id,
      clientEmail,
      clientName
    );
    setSending(false);

    if (result.isSuccess) {
      toast.success("Invitation sent successfully!");
      setEmailDialogOpen(false);
      setClientEmail("");
      setClientName("");
    } else {
      toast.error(result.message || "Failed to send invitation");
    }
  };

  const regenerateToken = async () => {
    setRegenerating(true);
    const result = await regenerateOnboardingTokenAction(session.id);
    setRegenerating(false);

    if (result.isSuccess) {
      toast.success("Access token regenerated!");
      router.refresh();
    } else {
      toast.error(result.message || "Failed to regenerate token");
    }
  };

  const resetOnboarding = async () => {
    setResetting(true);
    const result = await resetOnboardingSessionAction(project.id, session.onboardingType);
    setResetting(false);

    if (result.isSuccess) {
      toast.success("Onboarding session reset successfully!");
      setTimeout(() => router.refresh(), 1000);
    } else {
      toast.error(result.message || "Failed to reset onboarding session");
    }
  };

  const resetAndSendInvite = async () => {
    if (!clientEmail || !clientName) {
      toast.error("Please enter both email and name");
      return;
    }

    setResetting(true);
    
    // First reset the onboarding
    const resetResult = await resetOnboardingSessionAction(project.id, session.onboardingType);
    
    if (!resetResult.isSuccess || !resetResult.data) {
      toast.error(resetResult.message || "Failed to reset onboarding session");
      setResetting(false);
      return;
    }

    // Then send invitation with the new session ID
    const sendResult = await sendOnboardingInvitationAction(
      resetResult.data.sessionId,
      clientEmail,
      clientName
    );
    
    setResetting(false);

    if (sendResult.isSuccess) {
      toast.success("Onboarding reset and invitation sent!");
      setResetAndSendDialogOpen(false);
      setClientEmail("");
      setClientName("");
      setTimeout(() => router.refresh(), 1000);
    } else {
      toast.error(sendResult.message || "Failed to send invitation");
      // Still refresh to show the reset session
      setTimeout(() => router.refresh(), 1000);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      pending: { label: "Pending", variant: "secondary" },
      in_progress: { label: "In Progress", variant: "default" },
      completed: { label: "Completed", variant: "default" },
      abandoned: { label: "Abandoned", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Session Details */}
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          <CardDescription>Current onboarding session information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Status</Label>
              <div className="mt-1">{getStatusBadge(session.status)}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Progress</Label>
              <p className="text-lg font-semibold">
                {session.completionPercentage || 0}%
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Created</Label>
              <p className="text-sm">
                {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Last Activity</Label>
              <p className="text-sm">
                {new Date(session.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Onboarding Type</Label>
              <p className="text-sm capitalize">{session.onboardingType?.replace(/_/g, " ")}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Current Step</Label>
              <p className="text-sm">
                Step {session.currentStep + 1} of {session.steps?.length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Information */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Details about the associated project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Project Name</Label>
            <p className="text-sm mt-1">{project.name}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Description</Label>
            <p className="text-sm mt-1">{project.description || "No description provided"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Link */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Link</CardTitle>
          <CardDescription>Share this link with the client to start onboarding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={onboardingUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={copyLink} variant="outline" size="icon">
              <Copy className="h-4 w-4" />
            </Button>
            <Button onClick={openLink} variant="outline" size="icon">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Send Invitation Email Dialog */}
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Onboarding Invitation</DialogTitle>
                  <DialogDescription>
                    Enter the client's information to send them the onboarding link
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Client Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={sendInvitation} disabled={sending}>
                    {sending ? "Sending..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Reset Onboarding Button */}
            <Button
              variant="outline"
              onClick={resetOnboarding}
              disabled={resetting}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${resetting ? "animate-spin" : ""}`} />
              Reset Onboarding
            </Button>

            {/* Reset Onboarding & Send Invite Dialog */}
            <Dialog open={resetAndSendDialogOpen} onOpenChange={setResetAndSendDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <Mail className="h-4 w-4 mr-2" />
                  Reset Onboarding & Send Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Onboarding & Send Invitation</DialogTitle>
                  <DialogDescription>
                    This will reset the onboarding session and send a new invitation email to the client
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="resetClientName">Client Name</Label>
                    <Input
                      id="resetClientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resetClientEmail">Client Email</Label>
                    <Input
                      id="resetClientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setResetAndSendDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={resetAndSendInvite} 
                    disabled={resetting}
                    variant="default"
                  >
                    {resetting ? "Resetting..." : "Reset & Send Invitation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}