/**
 * Project Tasks List Component
 * List/table view with sorting and filtering
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Trash2, Calendar, Sparkles } from "lucide-react";
import { SelectProjectTask } from "@/db/schema/projects-schema";
import {
  filterTasks,
  sortTasks,
  getTaskStatusLabel,
  getTaskStatusColor,
  getTaskDueDateBadge,
  getInitials,
  getAvatarColor,
} from "@/lib/task-utils";
import { toast } from "sonner";
import { deleteProjectTaskAction } from "@/actions/projects-actions";
import { useConfirm } from "@/hooks/use-confirm";

interface ProjectTasksListProps {
  tasks: SelectProjectTask[];
  onTaskClick: (task: SelectProjectTask) => void;
  onAddTask: () => void;
  onTasksChanged: () => void;
  isPlatformAdmin?: boolean;
}

export function ProjectTasksList({
  tasks,
  onTaskClick,
  onAddTask,
  onTasksChanged,
  isPlatformAdmin = false,
}: ProjectTasksListProps) {
  const { confirm, ConfirmDialog } = useConfirm();
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "todo" | "in_progress" | "done">("all");
  const [showCompleted, setShowCompleted] = useState(true);
  const [sortBy, setSortBy] = useState<"title" | "status" | "dueDate" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter and sort tasks
  const filtered = filterTasks(tasks, {
    status: statusFilter,
    searchQuery,
    showCompleted,
  });

  const sorted = sortTasks(filtered, sortBy, sortOrder);

  const toggleSelectAll = () => {
    if (selectedTasks.size === sorted.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(sorted.map((t) => t.id)));
    }
  };

  const toggleSelectTask = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return;

    const confirmed = await confirm({
      title: "Delete Tasks?",
      description: `Are you sure you want to delete ${selectedTasks.size} task(s)? This action cannot be undone.`,
      confirmText: "Delete Tasks",
      variant: "danger",
    });
    
    if (!confirmed) return;

    let successCount = 0;
    for (const taskId of selectedTasks) {
      const result = await deleteProjectTaskAction(taskId);
      if (result.isSuccess) successCount++;
    }

    if (successCount > 0) {
      toast.success(`${successCount} task(s) deleted`);
      setSelectedTasks(new Set());
      onTasksChanged();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Tasks</CardTitle>
          <Button onClick={onAddTask} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value: any) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedTasks.size > 0 && isPlatformAdmin && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-gray-600">{selectedTasks.size} selected</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedTasks.size === sorted.length && sorted.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((task) => {
                  const dueDateBadge = task.dueDate
                    ? getTaskDueDateBadge(new Date(task.dueDate))
                    : null;
                  const initials = getInitials(task.assignedTo);
                  const avatarColor = getAvatarColor(task.assignedTo);

                  return (
                    <TableRow
                      key={task.id}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedTasks.has(task.id)}
                          onCheckedChange={() => toggleSelectTask(task.id)}
                        />
                      </TableCell>
                      <TableCell onClick={() => onTaskClick(task)}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{task.title}</span>
                          {task.aiGenerated && (
                            <Badge variant="outline" className="text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => onTaskClick(task)}>
                        <Badge variant={getTaskStatusColor(task.status as any) as any}>
                          {getTaskStatusLabel(task.status as any)}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={() => onTaskClick(task)}>
                        {dueDateBadge ? (
                          <Badge
                            variant={dueDateBadge.variant}
                            className="text-xs"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            {dueDateBadge.label}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell onClick={() => onTaskClick(task)}>
                        {task.assignedTo ? (
                          <div
                            className={`h-8 w-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-medium`}
                            title={task.assignedTo}
                          >
                            {initials}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {/* Actions can be added here */}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <ConfirmDialog />
    </Card>
  );
}
