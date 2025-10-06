/**
 * Sortable Task Card Component
 * Wraps TaskCard with drag-and-drop functionality
 */

"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SelectProjectTask } from "@/db/schema/projects-schema";
import { TaskCard } from "./task-card";

interface SortableTaskCardProps {
  task: SelectProjectTask;
  onClick: () => void;
}

export function SortableTaskCard({ task, onClick }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}
