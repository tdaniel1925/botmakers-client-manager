/**
 * Task Detail Dialog Component
 * Modal for viewing and editing task details
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Sparkles, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { SelectProjectTask } from "@/db/schema/projects-schema";
import { updateProjectTaskAction, deleteProjectTaskAction } from "@/actions/projects-actions";
import { getTaskStatusLabel } from "@/lib/task-utils";

interface TaskDetailDialogProps {
  task: SelectProjectTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPlatformAdmin?: boolean;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  isPlatformAdmin = false,
  onTaskUpdated,
  onTaskDeleted,
}: TaskDetailDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">("todo");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status as "todo" | "in_progress" | "done");
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    }
  }, [task]);

  const handleSubmit = async () => {
    if (!task) return;

    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    setIsSubmitting(true);
    const result = await updateProjectTaskAction(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      dueDate,
    });
    setIsSubmitting(false);

    if (result.isSuccess) {
      toast.success("Task updated successfully");
      onOpenChange(false);
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    } else {
      toast.error(result.message || "Failed to update task");
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    setIsDeleting(true);
    const result = await deleteProjectTaskAction(task.id);
    setIsDeleting(false);

    if (result.isSuccess) {
      toast.success("Task deleted successfully");
      setDeleteDialogOpen(false);
      onOpenChange(false);
      if (onTaskDeleted) {
        onTaskDeleted();
      }
    } else {
      toast.error(result.message || "Failed to delete task");
    }
  };

  if (!task) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>Task Details</DialogTitle>
              {task.aiGenerated && (
                <Badge variant="outline">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Generated
                </Badge>
              )}
            </div>
            <DialogDescription>
              View and edit task information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-task-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-task-description">Description</Label>
              <Textarea
                id="edit-task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value: "todo" | "in_progress" | "done") => setStatus(value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">{getTaskStatusLabel("todo")}</SelectItem>
                  <SelectItem value="in_progress">{getTaskStatusLabel("in_progress")}</SelectItem>
                  <SelectItem value="done">{getTaskStatusLabel("done")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal"
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "No due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {dueDate && (
                  <Button
                    variant="outline"
                    onClick={() => setDueDate(undefined)}
                    disabled={isSubmitting}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
              <div>Created: {new Date(task.createdAt).toLocaleString()}</div>
              <div>Last updated: {new Date(task.updatedAt).toLocaleString()}</div>
              {task.assignedTo && <div>Assigned to: {task.assignedTo}</div>}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isPlatformAdmin && (
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto sm:mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim()}
                className="flex-1 sm:flex-none"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
