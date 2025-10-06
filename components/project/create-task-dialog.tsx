/**
 * Create Task Dialog Component
 * Modal for creating new tasks
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createProjectTaskAction } from "@/actions/projects-actions";

interface CreateTaskDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus?: "todo" | "in_progress" | "done";
  onTaskCreated?: () => void;
}

export function CreateTaskDialog({
  projectId,
  open,
  onOpenChange,
  defaultStatus = "todo",
  onTaskCreated,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    setIsSubmitting(true);
    const result = await createProjectTaskAction({
      projectId,
      title: title.trim(),
      description: description.trim() || undefined,
      status: defaultStatus,
      dueDate,
    });
    setIsSubmitting(false);

    if (result.isSuccess) {
      toast.success("Task created successfully");
      setTitle("");
      setDescription("");
      setDueDate(undefined);
      onOpenChange(false);
      if (onTaskCreated) {
        onTaskCreated();
      }
    } else {
      toast.error(result.message || "Failed to create task");
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setDueDate(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to this project.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="task-title"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              placeholder="Enter task description (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date (optional)"}
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
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
