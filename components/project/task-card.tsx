/**
 * Task Card Component
 * Reusable card for displaying tasks in Kanban board
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { SelectProjectTask } from "@/db/schema/projects-schema";
import {
  getTaskDueDateBadge,
  getInitials,
  getAvatarColor,
  truncateText,
} from "@/lib/task-utils";
import { format } from "date-fns";
import { TaskSourceBadge } from "@/components/platform/task-source-badge";

interface TaskCardProps {
  task: SelectProjectTask;
  onClick?: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging = false }: TaskCardProps) {
  const dueDateBadge = task.dueDate
    ? getTaskDueDateBadge(new Date(task.dueDate))
    : null;
  
  const initials = getInitials(task.assignedTo);
  const avatarColor = getAvatarColor(task.assignedTo);

  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        isDragging ? "opacity-50 rotate-2" : ""
      }`}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header with source badge */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm line-clamp-2 flex-1">
            {task.title}
          </h4>
          <TaskSourceBadge
            sourceType={task.sourceType}
            sourceId={task.sourceId}
            sourceMetadata={task.sourceMetadata}
            size="sm"
          />
        </div>

        {/* Description preview */}
        {task.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {truncateText(task.description, 100)}
          </p>
        )}

        {/* Footer with assignee and due date */}
        <div className="flex items-center justify-between">
          {/* Assignee */}
          {task.assignedTo ? (
            <div
              className={`h-7 w-7 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-medium`}
              title={task.assignedTo}
            >
              {initials}
            </div>
          ) : (
            <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
              ?
            </div>
          )}

          {/* Due date badge */}
          {dueDateBadge && (
            <Badge
              variant={dueDateBadge.variant}
              className="text-xs flex items-center gap-1"
            >
              <Calendar className="h-3 w-3" />
              {dueDateBadge.label}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
