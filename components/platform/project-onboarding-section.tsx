/**
 * Project Onboarding Section Component
 * Shows onboarding status and actions for a project
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, ExternalLink, Mail, Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createOnboardingSessionAction, sendOnboardingInvitationAction, resetOnboardingSessionAction } from "@/actions/onboarding-actions";
import Link from "next/link";

interface ProjectOnboardingSectionProps {
  projectId: string;
  onboardingSession: any | null;
}

export function ProjectOnboardingSection({
  projectId,
  onboardingSession,
}: ProjectOnboardingSectionProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [templateType, setTemplateType] = useState<string>("auto");
  const [clientEmail, setClientEmail] = useState("");
  const [clientName, setClientName] = useState("");

  const handleCreateOnboarding = async () => {
    setCreating(true);
    const result = await createOnboardingSessionAction(
      projectId,
      templateType as any
    );
    setCreating(false);

    if (result.isSuccess) {
      toast.success("Onboarding session created successfully!");
      setCreateDialogOpen(false);
      window.location.reload(); // Refresh to show new session
    } else {
      toast.error(result.message || "Failed to create onboarding session");
    }
  };

  const handleSendInvitation = async () => {
    if (!clientEmail || !clientName || !onboardingSession) {
      toast.error("Please enter both email and name");
      return;
    }

    setSending(true);
    const result = await sendOnboardingInvitationAction(
      onboardingSession.id,
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

  const handleResetOnboarding = async () => {
    setResetting(true);
    const result = await resetOnboardingSessionAction(projectId, "auto");
    setResetting(false);

    if (result.isSuccess) {
      toast.success("Onboarding session reset successfully! A new session has been created.");
      setResetDialogOpen(false);
      window.location.reload(); // Refresh to show new session
    } else {
      toast.error(result.message || "Failed to reset onboarding session");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      pending: { label: "Not Started", variant: "secondary", icon: Clock },
      in_progress: { label: "In Progress", variant: "default", icon: Clock },
      completed: { label: "Completed", variant: "default", icon: CheckCircle },
      abandoned: { label: "Abandoned", variant: "destructive", icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // No onboarding session exists
  if (!onboardingSession) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Onboarding</CardTitle>
          <CardDescription>
            Create an onboarding session to collect client information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            No onboarding session has been created for this project yet.
          </p>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Onboarding Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Onboarding Session</DialogTitle>
                <DialogDescription>
                  Choose a template type for the client onboarding
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="templateType">Template Type</Label>
                  <Select value={templateType} onValueChange={setTemplateType}>
                    <SelectTrigger id="templateType">
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect (AI)</SelectItem>
                      <SelectItem value="web_design">Web Design</SelectItem>
                      <SelectItem value="voice_ai">Voice AI Campaign</SelectItem>
                      <SelectItem value="software_dev">Software Development</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-detect will use AI to choose the best template based on project description
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOnboarding} disabled={creating}>
                  {creating ? "Creating..." : "Create Session"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  // Onboarding session exists
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  const onboardingUrl = `${appUrl}/onboarding/${onboardingSession.accessToken}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Client Onboarding</CardTitle>
            <CardDescription>
              Track client onboarding progress and manage invitations
            </CardDescription>
          </div>
          {getStatusBadge(onboardingSession.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Progress</Label>
            <span className="text-sm text-gray-600">
              {onboardingSession.completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${onboardingSession.completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-xs text-gray-500">Created</Label>
            <p className="font-medium">
              {new Date(onboardingSession.createdAt).toLocaleDateString()}
            </p>
          </div>
          {onboardingSession.startedAt && (
            <div>
              <Label className="text-xs text-gray-500">Started</Label>
              <p className="font-medium">
                {new Date(onboardingSession.startedAt).toLocaleDateString()}
              </p>
            </div>
          )}
          {onboardingSession.completedAt && (
            <div>
              <Label className="text-xs text-gray-500">Completed</Label>
              <p className="font-medium">
                {new Date(onboardingSession.completedAt).toLocaleDateString()}
              </p>
            </div>
          )}
          {onboardingSession.lastActivityAt && (
            <div>
              <Label className="text-xs text-gray-500">Last Activity</Label>
              <p className="font-medium">
                {new Date(onboardingSession.lastActivityAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t flex-wrap">
          <Link href={`/platform/onboarding/${onboardingSession.id}`}>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>

          {onboardingSession.status !== "completed" && (
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
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
                  <Button onClick={handleSendInvitation} disabled={sending}>
                    {sending ? "Sending..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Onboarding
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset Onboarding Session?</DialogTitle>
                <DialogDescription>
                  This will delete the current onboarding session and all collected responses, 
                  then create a fresh session. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-amber-900">Warning</p>
                      <p className="text-sm text-amber-800">
                        All client responses and uploaded files will be permanently deleted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleResetOnboarding} 
                  disabled={resetting}
                >
                  {resetting ? "Resetting..." : "Reset Onboarding"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
