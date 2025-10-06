"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderKanban, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProjectAction } from "@/actions/projects-actions";
import { getAllOrganizationsAction } from "@/actions/platform-actions";
import { toast } from "sonner";
import { generateProjectTasks } from "@/lib/ai-project-helper";

export default function NewProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [generateAITasks, setGenerateAITasks] = useState(false);
  
  const [formData, setFormData] = useState({
    organizationId: "",
    name: "",
    description: "",
    status: "planning" as "planning" | "active" | "on_hold" | "completed" | "cancelled",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    budget: "",
    startDate: "",
    endDate: "",
    assignedTo: "",
  });

  useEffect(() => {
    const fetchOrgs = async () => {
      const result = await getAllOrganizationsAction();
      if (result.isSuccess && result.data) {
        setOrganizations(result.data);
      }
    };
    fetchOrgs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const projectData: any = {
        organizationId: formData.organizationId,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
      };

      if (formData.budget) {
        projectData.budget = parseFloat(formData.budget);
      }
      if (formData.startDate) {
        projectData.startDate = new Date(formData.startDate);
      }
      if (formData.endDate) {
        projectData.endDate = new Date(formData.endDate);
      }
      if (formData.assignedTo) {
        projectData.assignedTo = formData.assignedTo;
      }

      const result = await createProjectAction(projectData);

      if (result.isSuccess && result.data) {
        // If AI task generation is enabled, generate tasks
        if (generateAITasks) {
          const tasks = generateProjectTasks(formData.description);
          toast.success(`Project created with ${tasks.length} AI-generated tasks!`);
        } else {
          toast.success(result.message);
        }
        router.push("/platform/projects");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-6 lg:p-10">
      <div className="mb-8">
        <Link
          href="/platform/projects"
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Projects
        </Link>
        <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
        <p className="text-gray-600">Add a new project for an organization</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization */}
            <div className="space-y-2">
              <Label htmlFor="organization">Organization *</Label>
              <Select
                value={formData.organizationId}
                onValueChange={(value) =>
                  setFormData({ ...formData, organizationId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="Website Redesign"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed project description. The AI will use this to generate tasks and insights..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                💡 Tip: Include requirements, deliverables, and timelines for better AI task generation
              </p>
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (Optional)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="10000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                />
              </div>
            </div>

            {/* AI Task Generation */}
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateAITasks}
                  onChange={(e) => setGenerateAITasks(e.target.checked)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Generate Tasks with AI</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Automatically create project tasks based on the description
                  </p>
                </div>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/platform/projects")}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}



