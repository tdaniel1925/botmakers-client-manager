"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Shield, Trash2 } from "lucide-react";
import { SelectUserRole } from "@/db/schema";
import { removeUserFromOrganizationAction } from "@/actions/organizations-actions";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";

interface MembersTableProps {
  members: (SelectUserRole & { userName?: string; userEmail?: string })[];
  currentUserId: string;
  currentUserRole: string;
  organizationId: string;
  onUpdate: () => void;
}

const roleColors = {
  admin: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  sales_rep: "bg-green-100 text-green-700",
};

const roleLabels = {
  admin: "Admin",
  manager: "Manager",
  sales_rep: "Member",
};

export function MembersTable({ members, currentUserId, currentUserRole, organizationId, onUpdate }: MembersTableProps) {
  const { confirm, ConfirmDialog } = useConfirm();
  const [loading, setLoading] = useState<string | null>(null);

  const handleRemoveMember = async (userId: string, userName?: string) => {
    const confirmed = await confirm({
      title: "Remove Member?",
      description: `Are you sure you want to remove ${userName || "this member"} from the organization? They will lose all access immediately.`,
      confirmText: "Remove Member",
      variant: "danger",
    });
    
    if (!confirmed) return;

    setLoading(userId);
    try {
      const result = await removeUserFromOrganizationAction(userId, organizationId);
      if (result.isSuccess) {
        toast.success("Member removed successfully");
        onUpdate();
      } else {
        toast.error(result.message || "Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                No team members found
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => {
              const isCurrentUser = member.userId === currentUserId;
              const canManage = currentUserRole === "admin" && !isCurrentUser;

              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.userName || "Unknown User"}
                    {isCurrentUser && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {member.userEmail || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[member.role]} variant="secondary">
                      {roleLabels[member.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canManage ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={loading === member.userId}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.userId, member.userName)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <ConfirmDialog />
    </div>
  );
}
