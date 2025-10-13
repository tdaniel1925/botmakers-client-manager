/**
 * Task Generation Preview Dialog
 * Preview and create tasks from onboarding responses
 */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Flag,
  FileCheck2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  previewGeneratedTasksAction,
  createGeneratedTasksAction,
} from "@/actions/task-generation-actions";
import { formatDistanceToNow } from "date-fns";

interface TaskGenerationPreviewProps {
  sessionId: string;
  projectId: string;
  projectName: string;
  onTasksCreated?: () => void;
  trigger?: React.ReactNode;
}

export function TaskGenerationPreview({
  sessionId,
  projectId,
  projectName,
  onTasksCreated,
  trigger,
}: TaskGenerationPreviewProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [summary, setSummary] = useState<any>(null);
  const [groupedTasks, setGroupedTasks] = useState<any>(null);
  const [currentView, setCurrentView] = useState<"all" | "high" | "medium" | "low">("all");

  useEffect(() => {
    if (open && tasks.length === 0) {
      loadPreview();
    }
  }, [open]);

  const loadPreview = async () => {
    setLoading(true);
    const result = await previewGeneratedTasksAction(sessionId);

    if (result.success && result.data) {
      setTasks(result.data.tasks || []);
      setSummary((result.data as any).summary || null);
      setGroupedTasks((result.data as any).groupedByPriority || {});
      // Select all tasks by default
      setSelectedTasks(new Set(result.data.tasks.map((_: any, i: number) => i)));
    } else {
      toast.error((result as any).error || "Failed to generate tasks");
      setOpen(false);
    }
    setLoading(false);
  };

  const handleToggleTask = (index: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map((_, i) => i)));
    }
  };

  const handleCreateTasks = async () => {
    if (selectedTasks.size === 0) {
      toast.error("Please select at least one task to create");
      return;
    }

    setCreating(true);
    const selectedTasksData = tasks.filter((_, i) => selectedTasks.has(i));

    const result = await createGeneratedTasksAction(sessionId, selectedTasksData);

    if (result.success) {
      toast.success(
        `Created ${result.data?.totalCreated || 0} tasks for ${projectName}`
      );
      onTasksCreated?.();
      setOpen(false);
    } else {
      toast.error(result.error || "Failed to create tasks");
    }

    setCreating(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getFilteredTasks = () => {
    if (currentView === "all") return tasks;
    return tasks.filter((task) => task.priority === currentView);
  };

  const filteredTasks = getFilteredTasks();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Tasks
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Generate Tasks from Onboarding
          </DialogTitle>
          <DialogDescription>
            Review and select tasks to add to {projectName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
              <div className="text-sm text-gray-600">
                Analyzing onboarding responses...
              </div>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400" />
            <div className="text-gray-600">
              No tasks could be generated from this onboarding
            </div>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-3 bg-purple-50">
                <div className="text-2xl font-bold text-purple-600">
                  {tasks.length}
                </div>
                <div className="text-xs text-gray-600">Total Tasks</div>
              </Card>
              <Card className="p-3 bg-red-50">
                <div className="text-2xl font-bold text-red-600">
                  {summary?.highPriority || 0}
                </div>
                <div className="text-xs text-gray-600">High Priority</div>
              </Card>
              <Card className="p-3 bg-yellow-50">
                <div className="text-2xl font-bold text-yellow-600">
                  {summary?.mediumPriority || 0}
                </div>
                <div className="text-xs text-gray-600">Medium Priority</div>
              </Card>
              <Card className="p-3 bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">
                  {summary?.withDueDate || 0}
                </div>
                <div className="text-xs text-gray-600">With Due Dates</div>
              </Card>
            </div>

            {/* Filter Tabs */}
            <Tabs value={currentView} onValueChange={(v: any) => setCurrentView(v)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  All ({tasks.length})
                </TabsTrigger>
                <TabsTrigger value="high">
                  High ({summary?.highPriority || 0})
                </TabsTrigger>
                <TabsTrigger value="medium">
                  Medium ({summary?.mediumPriority || 0})
                </TabsTrigger>
                <TabsTrigger value="low">
                  Low ({summary?.lowPriority || 0})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Select All */}
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedTasks.size === tasks.length}
                  onCheckedChange={handleSelectAll}
                  id="select-all"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  Select All ({selectedTasks.size} of {tasks.length} selected)
                </label>
              </div>
            </div>

            {/* Task List */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {filteredTasks.map((task, index) => {
                  const globalIndex = tasks.indexOf(task);
                  const isSelected = selectedTasks.has(globalIndex);

                  return (
                    <Card
                      key={globalIndex}
                      className={`p-4 transition-all cursor-pointer ${
                        isSelected
                          ? "border-purple-600 bg-purple-50"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => handleToggleTask(globalIndex)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleTask(globalIndex)}
                          onClick={(e) => e.stopPropagation()}
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="font-medium text-gray-900">
                              {task.title}
                            </div>
                            <Badge
                              variant="secondary"
                              className={getPriorityColor(task.priority || "medium")}
                            >
                              {task.priority || "medium"}
                            </Badge>
                          </div>

                          <div className="text-sm text-gray-600 mb-3">
                            {task.description}
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <FileCheck2 className="h-3 w-3" />
                              <span>{task.status || "todo"}</span>
                            </div>
                            {task.dueDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Due{" "}
                                  {formatDistanceToNow(new Date(task.dueDate), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Flag className="h-3 w-3" />
                              <span>From Onboarding</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  Tasks are generated from client responses and optimized for your workflow.
                  You can edit task details after creation in the project view.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTasks}
                disabled={creating || selectedTasks.size === 0}
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create {selectedTasks.size} Task{selectedTasks.size !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
