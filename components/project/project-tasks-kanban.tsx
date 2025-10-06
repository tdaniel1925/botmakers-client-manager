/**
 * Project Tasks Kanban Component
 * Kanban board view with drag-and-drop functionality
 */

"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SelectProjectTask } from "@/db/schema/projects-schema";
import { TaskCard } from "./task-card";
import { KanbanColumn } from "./kanban-column";
import { sortTasksByStatus, TasksByStatus } from "@/lib/task-utils";
import { updateProjectTaskAction } from "@/actions/projects-actions";
import { toast } from "sonner";

interface ProjectTasksKanbanProps {
  tasks: SelectProjectTask[];
  onTaskClick: (task: SelectProjectTask) => void;
  onAddTask: (status: "todo" | "in_progress" | "done") => void;
  onTasksChanged: () => void;
}

export function ProjectTasksKanban({
  tasks,
  onTaskClick,
  onAddTask,
  onTasksChanged,
}: ProjectTasksKanbanProps) {
  const [activeTask, setActiveTask] = useState<SelectProjectTask | null>(null);
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>(
    sortTasksByStatus(tasks)
  );

  // Update local state when tasks prop changes
  useState(() => {
    setTasksByStatus(sortTasksByStatus(tasks));
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as "todo" | "in_progress" | "done";
    
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // If status didn't change, do nothing
    if (task.status === newStatus) return;

    // Optimistically update UI
    const updatedTasksByStatus = { ...tasksByStatus };
    const oldStatus = task.status as "todo" | "in_progress" | "done";
    
    // Remove from old column
    updatedTasksByStatus[oldStatus] = updatedTasksByStatus[oldStatus].filter(
      (t) => t.id !== taskId
    );
    
    // Add to new column
    updatedTasksByStatus[newStatus] = [
      ...updatedTasksByStatus[newStatus],
      { ...task, status: newStatus },
    ];
    
    setTasksByStatus(updatedTasksByStatus);

    // Update on server
    const result = await updateProjectTaskAction(taskId, { status: newStatus });
    
    if (result.isSuccess) {
      toast.success(`Task moved to ${newStatus.replace("_", " ")}`);
      onTasksChanged();
    } else {
      toast.error("Failed to update task");
      // Revert on error
      setTasksByStatus(sortTasksByStatus(tasks));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Todo Column */}
        <KanbanColumn
          id="todo"
          title="To Do"
          tasks={tasksByStatus.todo}
          onTaskClick={onTaskClick}
          onAddTask={() => onAddTask("todo")}
          color="gray"
        />

        {/* In Progress Column */}
        <KanbanColumn
          id="in_progress"
          title="In Progress"
          tasks={tasksByStatus.in_progress}
          onTaskClick={onTaskClick}
          onAddTask={() => onAddTask("in_progress")}
          color="blue"
        />

        {/* Done Column */}
        <KanbanColumn
          id="done"
          title="Done"
          tasks={tasksByStatus.done}
          onTaskClick={onTaskClick}
          onAddTask={() => onAddTask("done")}
          color="green"
        />
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
