"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MembersTable } from "@/components/dashboard/members-table";
import { InviteMemberDialog } from "@/components/dashboard/invite-member-dialog";
import { getOrganizationMembersAction, getUserRoleAction } from "@/actions/organizations-actions";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Users, AlertCircle } from "lucide-react";
import { useOrganizationContext } from "@/lib/organization-context";

export default function MembersPage() {
  const { userId } = useAuth();
  const { organizationId } = useOrganizationContext();
  const [members, setMembers] = useState<any[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const [membersResult, roleResult] = await Promise.all([
        getOrganizationMembersAction(organizationId),
        getUserRoleAction(organizationId),
      ]);

      if (membersResult.isSuccess && membersResult.data) {
        setMembers(membersResult.data);
      } else {
        setError(membersResult.message || "Failed to load members");
      }

      if (roleResult.isSuccess && roleResult.data) {
        setCurrentUserRole(roleResult.data.role);
      }
    } catch (err) {
      console.error("Error loading members:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [organizationId]);

  if (loading) {
    return (
      <main className="p-6 md:p-10">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 md:p-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    );
  }

  const canInvite = currentUserRole === "admin";

  return (
    <main className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-gray-600 mt-2">
            Manage your organization's team members and their roles
          </p>
        </div>
        {canInvite && (
          <InviteMemberDialog
            organizationId={organizationId!}
            onInviteSuccess={loadMembers}
          />
        )}
      </div>

      {/* Members Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            <CardTitle>Organization Members</CardTitle>
          </div>
          <CardDescription>
            {members.length} {members.length === 1 ? "member" : "members"} in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MembersTable
            members={members}
            currentUserId={userId || ""}
            currentUserRole={currentUserRole || ""}
            organizationId={organizationId!}
            onUpdate={loadMembers}
          />
        </CardContent>
      </Card>

      {/* Info Alert */}
      {!canInvite && (
        <Alert className="mt-6">
          <AlertDescription>
            Only organization admins can invite new members. Contact your admin if you need to add someone to the team.
          </AlertDescription>
        </Alert>
      )}
    </main>
  );
}