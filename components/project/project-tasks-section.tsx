/**
 * Project Tasks Section Component
 * Main container for task management with view switching
 */

"use client";

import { useState, useEffect } from "react";
import { SelectProjectTask } from "@/db/schema/projects-schema";
import { TaskViewToggle } from "./task-view-toggle";
import { ProjectTasksKanban } from "./project-tasks-kanban";
import { ProjectTasksList } from "./project-tasks-list";
import { CreateTaskDialog } from "./create-task-dialog";
import { TaskDetailDialog } from "./task-detail-dialog";
import { getProjectTasksAction } from "@/actions/projects-actions";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectTasksSectionProps {
  projectId: string;
  isPlatformAdmin: boolean;
  organizationId?: string;
}

export function ProjectTasksSection({
  projectId,
  isPlatformAdmin,
  organizationId,
}: ProjectTasksSectionProps) {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [tasks, setTasks] = useState<SelectProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<SelectProjectTask | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<"todo" | "in_progress" | "done">("todo");

  // Load tasks
  const loadTasks = async () => {
    setIsLoading(true);
    const result = await getProjectTasksAction(projectId);
    setIsLoading(false);

    if (result.isSuccess && result.data) {
      setTasks(result.data);
    } else {
      toast.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const handleAddTask = (status: "todo" | "in_progress" | "done" = "todo") => {
    setDefaultStatus(status);
    setCreateDialogOpen(true);
  };

  const handleTaskClick = (task: SelectProjectTask) => {
    setSelectedTask(task);
    setDetailDialogOpen(true);
  };

  const handleTasksChanged = () => {
    loadTasks();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <TaskViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Task view */}
      {view === "kanban" ? (
        <ProjectTasksKanban
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onAddTask={handleAddTask}
          onTasksChanged={handleTasksChanged}
        />
      ) : (
        <ProjectTasksList
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onAddTask={() => handleAddTask("todo")}
          onTasksChanged={handleTasksChanged}
          isPlatformAdmin={isPlatformAdmin}
        />
      )}

      {/* Dialogs */}
      <CreateTaskDialog
        projectId={projectId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultStatus={defaultStatus}
        onTaskCreated={handleTasksChanged}
      />

      <TaskDetailDialog
        task={selectedTask}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        isPlatformAdmin={isPlatformAdmin}
        onTaskUpdated={handleTasksChanged}
        onTaskDeleted={handleTasksChanged}
      />
    </div>
  );
}
