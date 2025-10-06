/**
 * Kanban Column Component
 * Droppable column for Kanban board
 */

"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { SelectProjectTask } from "@/db/schema/projects-schema";
import { SortableTaskCard } from "./sortable-task-card";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: SelectProjectTask[];
  onTaskClick: (task: SelectProjectTask) => void;
  onAddTask: () => void;
  color: "gray" | "blue" | "green";
}

export function KanbanColumn({
  id,
  title,
  tasks,
  onTaskClick,
  onAddTask,
  color,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const colorClasses = {
    gray: "border-gray-300 bg-gray-50",
    blue: "border-blue-300 bg-blue-50",
    green: "border-green-300 bg-green-50",
  };

  const badgeVariants = {
    gray: "secondary" as const,
    blue: "default" as const,
    green: "default" as const,
  };

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 transition-colors ${
        isOver ? "border-blue-500 bg-blue-50" : "border-gray-200"
      }`}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Badge variant={badgeVariants[color]}>{tasks.length}</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddTask}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3 min-h-[200px]">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No tasks
                </div>
              ) : (
                tasks.map((task) => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}
