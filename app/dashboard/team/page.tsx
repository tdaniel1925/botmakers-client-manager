"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, UserPlus, MoreVertical, Mail, Shield, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useOrganization } from "@/lib/organization-context";
import {
  getTeamMembersAction,
  inviteTeamMemberAction,
  updateTeamMemberRoleAction,
  removeTeamMemberAction,
} from "@/actions/team-actions";

export default function TeamPage() {
  const { organizationId } = useOrganization();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [showCredentials, setShowCredentials] = useState<{ email: string; password: string } | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin" | "owner">("member");

  useEffect(() => {
    if (organizationId) {
      loadTeamMembers();
    }
  }, [organizationId]);

  const loadTeamMembers = async () => {
    if (!organizationId) return;
    
    setIsLoading(true);
    const result = await getTeamMembersAction(organizationId);
    
    if (result.isSuccess && result.data) {
      setMembers(result.data);
    } else {
      toast.error(result.message);
    }
    
    setIsLoading(false);
  };

  const handleInvite = async () => {
    if (!organizationId) return;
    
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsInviting(true);
    const result = await inviteTeamMemberAction(organizationId, inviteEmail, inviteRole);

    if (result.isSuccess) {
      toast.success("Team member invited successfully!", {
        description: "An email with login credentials has been sent.",
        duration: 5000,
      });
      
      // Show credentials dialog
      if (result.data) {
        setShowCredentials({
          email: result.data.email,
          password: result.data.tempPassword,
        });
      }
      
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      loadTeamMembers();
    } else {
      toast.error(result.message);
    }

    setIsInviting(false);
  };

  const handleUpdateRole = async (userId: string, newRole: "owner" | "admin" | "member") => {
    if (!organizationId) return;
    
    const result = await updateTeamMemberRoleAction(organizationId, userId, newRole);
    
    if (result.isSuccess) {
      toast.success("Role updated successfully");
      loadTeamMembers();
    } else {
      toast.error(result.message);
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!organizationId) return;
    
    if (!confirm(`Are you sure you want to remove ${userName} from the team?`)) {
      return;
    }

    const result = await removeTeamMemberAction(organizationId, userId);
    
    if (result.isSuccess) {
      toast.success("Team member removed successfully");
      loadTeamMembers();
    } else {
      toast.error(result.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (!organizationId) {
    return (
      <div className="p-6 lg:p-10">
        <div className="text-center py-12">
          <p className="text-gray-500">Please select an organization to view team members</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team</h1>
          <p className="text-gray-600">Manage your organization's team members</p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            {members.length} member{members.length !== 1 ? "s" : ""} in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No team members yet</p>
              <Button onClick={() => setInviteDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Your First Member
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.userId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.imageUrl} alt={member.fullName} />
                          <AvatarFallback>
                            {member.fullName?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.fullName}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateRole(member.userId, "member")}>
                            Change to Member
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateRole(member.userId, "admin")}>
                            Change to Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateRole(member.userId, "owner")}>
                            Change to Owner
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleRemoveMember(member.userId, member.fullName)}
                          >
                            Remove from Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Invite Team Member
            </DialogTitle>
            <DialogDescription>
              Send an invitation to a new team member. They'll receive login credentials via email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="member@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member - View and edit projects</SelectItem>
                  <SelectItem value="admin">Admin - Manage team and settings</SelectItem>
                  <SelectItem value="owner">Owner - Full access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)} disabled={isInviting}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={isInviting}>
              {isInviting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Display Dialog */}
      <Dialog open={!!showCredentials} onOpenChange={() => setShowCredentials(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Team Member Invited Successfully
            </DialogTitle>
            <DialogDescription>
              Save these credentials. An email has also been sent to the user.
            </DialogDescription>
          </DialogHeader>

          {showCredentials && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email (Username)</Label>
                <div className="flex gap-2">
                  <Input value={showCredentials.email} readOnly />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(showCredentials.email)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <div className="flex gap-2">
                  <Input value={showCredentials.password} readOnly className="font-mono" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(showCredentials.password)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded p-3">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> The user should change their password after first login for security.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowCredentials(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
