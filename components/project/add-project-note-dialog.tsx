/**
 * Add Project Note Dialog Component
 * Dialog for platform admins to add progress notes
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addProjectNoteAction } from "@/actions/project-notes-actions";

interface AddProjectNoteDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteAdded?: () => void;
}

export function AddProjectNoteDialog({
  projectId,
  open,
  onOpenChange,
  onNoteAdded,
}: AddProjectNoteDialogProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxLength = 2000;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please enter a note");
      return;
    }

    if (content.length > maxLength) {
      toast.error(`Note must be ${maxLength} characters or less`);
      return;
    }

    setIsSubmitting(true);
    const result = await addProjectNoteAction(projectId, content);
    setIsSubmitting(false);

    if (result.isSuccess) {
      toast.success("Progress note added successfully");
      setContent("");
      onOpenChange(false);
      if (onNoteAdded) {
        onNoteAdded();
      }
    } else {
      toast.error(result.message || "Failed to add note");
    }
  };

  const handleCancel = () => {
    setContent("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Progress Note</DialogTitle>
          <DialogDescription>
            Add a timestamped note to track important updates and milestones for this project.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note-content">Note Content</Label>
            <Textarea
              id="note-content"
              placeholder="Enter your progress note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="resize-none"
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                This note will be visible to organization users
              </p>
              <p className={`text-xs ${remainingChars < 100 ? "text-orange-600" : "text-gray-500"}`}>
                {remainingChars} characters remaining
              </p>
            </div>
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
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? "Adding..." : "Add Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
