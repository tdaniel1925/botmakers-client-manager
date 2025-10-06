/**
 * Onboarding Sessions List Component
 * Displays table of all onboarding sessions with filters and actions
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Mail, Copy, MoreHorizontal, Trash2, Bell, BellOff, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteOnboardingSessionAction } from "@/actions/onboarding-actions";

interface OnboardingSessionsListProps {
  sessions: any[];
}

export function OnboardingSessionsList({ sessions }: OnboardingSessionsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [isApplyingBulkAction, setIsApplyingBulkAction] = useState(false);

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      session.projectId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      pending: { label: "Pending", variant: "secondary" },
      in_progress: { label: "In Progress", variant: "default" },
      completed: { label: "Completed", variant: "default" },
      abandoned: { label: "Abandoned", variant: "destructive" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const copyOnboardingLink = (token: string) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const link = `${appUrl}/onboarding/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Onboarding link copied to clipboard!");
  };

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;

    setIsDeleting(true);
    const result = await deleteOnboardingSessionAction(sessionToDelete);
    setIsDeleting(false);

    if (result.isSuccess) {
      toast.success("Onboarding session deleted successfully!");
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
      // Refresh the page to show updated list
      window.location.reload();
    } else {
      toast.error(result.message || "Failed to delete onboarding session");
    }
  };

  const toggleSelectAll = () => {
    if (selectedSessions.size === filteredSessions.length) {
      setSelectedSessions(new Set());
    } else {
      setSelectedSessions(new Set(filteredSessions.map(s => s.id)));
    }
  };

  const toggleSelectSession = (sessionId: string) => {
    const newSelected = new Set(selectedSessions);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedSessions(newSelected);
  };

  const handleApplyBulkAction = async () => {
    if (!bulkAction || selectedSessions.size === 0) {
      toast.error("Please select sessions and an action");
      return;
    }

    setIsApplyingBulkAction(true);

    if (bulkAction === "delete") {
      let successCount = 0;
      let failCount = 0;

      for (const sessionId of selectedSessions) {
        const result = await deleteOnboardingSessionAction(sessionId);
        if (result.isSuccess) {
          successCount++;
        } else {
          failCount++;
        }
      }

      setIsApplyingBulkAction(false);

      if (successCount > 0) {
        toast.success(`${successCount} session(s) deleted successfully`);
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} session(s)`);
      }

      setSelectedSessions(new Set());
      setBulkAction("");
      window.location.reload();
    } else if (bulkAction === "send_reminder") {
      // TODO: Implement send reminder functionality
      toast.info("Send reminder functionality coming soon");
      setIsApplyingBulkAction(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Bulk Actions */}
      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-4">
          <Input
            placeholder="Search by project ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedSessions.size > 0 && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">
              {selectedSessions.size} selected
            </span>
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Bulk Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delete">Delete Sessions</SelectItem>
                <SelectItem value="send_reminder">Send Reminder</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleApplyBulkAction}
              disabled={!bulkAction || isApplyingBulkAction}
              variant="default"
            >
              {isApplyingBulkAction ? "Applying..." : "Apply"}
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedSessions.size === filteredSessions.length && filteredSessions.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Reminders</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No onboarding sessions found
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSessions.has(session.id)}
                      onCheckedChange={() => toggleSelectSession(session.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {session.projectId?.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {session.organizationId?.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{getStatusBadge(session.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${session.completionPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {session.completionPercentage}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {session.reminderEnabled ? (
                        <>
                          <Bell className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-gray-600">
                            {session.reminderCount || 0} sent
                          </span>
                        </>
                      ) : (
                        <>
                          <BellOff className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-400">Off</span>
                        </>
                      )}
                      {session.tasksGenerated && (
                        <Sparkles className="h-4 w-4 text-purple-600 ml-1" title="Tasks Generated" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {session.startedAt
                      ? new Date(session.startedAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {session.lastActivityAt
                      ? new Date(session.lastActivityAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/platform/onboarding/${session.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => copyOnboardingLink(session.accessToken)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(session.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Session
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Onboarding Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the onboarding session
              and all associated responses and uploaded files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Session"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
