"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MoreVertical, Workflow, Webhook, FileText, Phone } from "lucide-react";
import { deleteProjectAction } from "@/actions/projects-actions";
import { toast } from "@/lib/toast";
import Link from "next/link";

interface ProjectHeaderActionsProps {
  projectId: string;
  projectName: string;
}

export function ProjectHeaderActions({ projectId, projectName }: ProjectHeaderActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        const result = await deleteProjectAction(projectId);
        if (result.isSuccess) {
          toast.success("Project deleted", {
            description: `${projectName} has been deleted successfully.`
          });
          router.push("/platform/projects");
          router.refresh();
        } else {
          toast.error("Delete failed", {
            description: result.message || "Failed to delete project."
          });
        }
      } catch (error: any) {
        toast.error("Error occurred", {
          description: error.message || "An unexpected error occurred."
        });
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/platform/projects/${projectId}/calls`} className="flex items-center w-full">
              <Phone className="h-4 w-4 mr-2" />
              Calls
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/platform/projects/${projectId}/campaigns`} className="flex items-center w-full">
              <Phone className="h-4 w-4 mr-2" />
              Campaigns
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/platform/projects/${projectId}/webhooks`} className="flex items-center w-full">
              <Webhook className="h-4 w-4 mr-2" />
              Manage Webhooks
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/platform/projects/${projectId}/workflows`} className="flex items-center w-full">
              <Workflow className="h-4 w-4 mr-2" />
              Manage Workflows
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/platform/projects/${projectId}/templates`} className="flex items-center w-full">
              <FileText className="h-4 w-4 mr-2" />
              Manage Templates
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            Edit Project
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${projectName}"? This will also delete all associated data including calls, campaigns, and tasks. This action cannot be undone.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
        loading={isPending}
      />
    </>
  );
}

