/**
 * Task Utility Functions
 * Helper functions for task management, sorting, filtering, and display
 */

import { SelectProjectTask } from "@/db/schema/projects-schema";
import { differenceInDays, isPast, isToday, isTomorrow } from "date-fns";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface TasksByStatus {
  todo: SelectProjectTask[];
  in_progress: SelectProjectTask[];
  done: SelectProjectTask[];
}

/**
 * Get color for task status badge
 */
export function getTaskStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    todo: "gray",
    in_progress: "blue",
    done: "green",
  };
  return colors[status] || "gray";
}

/**
 * Get status label for display
 */
export function getTaskStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done",
  };
  return labels[status] || status;
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(dueDate: Date | null): boolean {
  if (!dueDate) return false;
  return isPast(dueDate) && !isToday(dueDate);
}

/**
 * Get due date badge variant based on date
 */
export function getTaskDueDateBadge(dueDate: Date | null): {
  variant: "default" | "secondary" | "destructive" | "outline";
  label: string;
} {
  if (!dueDate) {
    return { variant: "outline", label: "No due date" };
  }

  if (isTaskOverdue(dueDate)) {
    const daysOverdue = Math.abs(differenceInDays(new Date(), dueDate));
    return {
      variant: "destructive",
      label: daysOverdue === 0 ? "Overdue" : `Overdue by ${daysOverdue}d`,
    };
  }

  if (isToday(dueDate)) {
    return { variant: "default", label: "Due today" };
  }

  if (isTomorrow(dueDate)) {
    return { variant: "default", label: "Due tomorrow" };
  }

  const daysUntilDue = differenceInDays(dueDate, new Date());
  
  if (daysUntilDue <= 3) {
    return { variant: "default", label: `Due in ${daysUntilDue}d` };
  }

  return { variant: "secondary", label: `Due ${dueDate.toLocaleDateString()}` };
}

/**
 * Sort tasks by status for Kanban board
 */
export function sortTasksByStatus(tasks: SelectProjectTask[]): TasksByStatus {
  return tasks.reduce(
    (acc, task) => {
      const status = task.status as TaskStatus;
      if (acc[status]) {
        acc[status].push(task);
      }
      return acc;
    },
    {
      todo: [],
      in_progress: [],
      done: [],
    } as TasksByStatus
  );
}

/**
 * Sort tasks for list view
 */
export function sortTasks(
  tasks: SelectProjectTask[],
  sortBy: "title" | "status" | "dueDate" | "createdAt" = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): SelectProjectTask[] {
  const sorted = [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "status":
        const statusOrder: Record<TaskStatus, number> = {
          todo: 1,
          in_progress: 2,
          done: 3,
        };
        comparison = statusOrder[a.status as TaskStatus] - statusOrder[b.status as TaskStatus];
        break;
      case "dueDate":
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case "createdAt":
      default:
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Filter tasks by criteria
 */
export function filterTasks(
  tasks: SelectProjectTask[],
  filters: {
    status?: TaskStatus | "all";
    assignee?: string | "all";
    searchQuery?: string;
    showCompleted?: boolean;
  }
): SelectProjectTask[] {
  let filtered = [...tasks];

  // Filter by status
  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((task) => task.status === filters.status);
  }

  // Filter by assignee
  if (filters.assignee && filters.assignee !== "all") {
    filtered = filtered.filter((task) => task.assignedTo === filters.assignee);
  }

  // Filter by search query
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
    );
  }

  // Hide completed if specified
  if (filters.showCompleted === false) {
    filtered = filtered.filter((task) => task.status !== "done");
  }

  return filtered;
}

/**
 * Get initials from a name or user ID
 */
export function getInitials(name: string | null): string {
  if (!name) return "?";
  
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Get color for assignee avatar
 */
export function getAvatarColor(userId: string | null): string {
  if (!userId) return "bg-gray-400";
  
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-teal-500",
  ];
  
  // Simple hash to get consistent color for user
  const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
