"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Loader2, Sparkles, ClipboardList, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProjectAction } from "@/actions/projects-actions";
import { getAllOrganizationsAction } from "@/actions/platform-actions";
import { startManualOnboardingAction } from "@/actions/manual-onboarding-actions";
import { toast } from "sonner";
import { generateProjectTasks } from "@/lib/ai-project-helper";

export default function NewProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [generateAITasks, setGenerateAITasks] = useState(false);
  const [onboardingTemplates, setOnboardingTemplates] = useState<any[]>([]);
  const [enableOnboarding, setEnableOnboarding] = useState(true);
  const [onboardingMode, setOnboardingMode] = useState<'client' | 'manual' | 'hybrid'>('client');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
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
    clientEmail: "",
    clientName: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch organizations
      const orgsResult = await getAllOrganizationsAction();
      if (orgsResult.isSuccess && orgsResult.data) {
        setOrganizations(orgsResult.data);
      }

      // Fetch onboarding templates
      try {
        const response = await fetch('/api/onboarding/templates');
        if (response.ok) {
          const data = await response.json();
          setOnboardingTemplates(data.templates || []);
          // Auto-select first template if available
          if (data.templates && data.templates.length > 0) {
            setSelectedTemplate(data.templates[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate onboarding fields if enabled
    if (enableOnboarding && onboardingMode === 'client' && (!formData.clientEmail || !formData.clientName)) {
      toast.error('Client email and name are required for client onboarding');
      return;
    }
    
    if (enableOnboarding && !selectedTemplate) {
      toast.error('Please select an onboarding template');
      return;
    }
    
    setIsLoading(true);

    try {
      const projectData: any = {
        organizationId: formData.organizationId,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        clientEmail: formData.clientEmail,
        clientName: formData.clientName,
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
        const projectId = result.data.id;
        
        // If AI task generation is enabled, generate tasks
        if (generateAITasks) {
          const tasks = generateProjectTasks(formData.description);
          toast.success(`Project created with ${tasks.length} AI-generated tasks!`);
        }
        
        // Handle onboarding setup
        if (enableOnboarding) {
          if (onboardingMode === 'manual' || onboardingMode === 'hybrid') {
            // Start manual onboarding session
            const onboardingResult = await startManualOnboardingAction(
              projectId,
              selectedTemplate,
              onboardingMode
            );
            
            if (onboardingResult.success && onboardingResult.sessionId) {
              toast.success('Project created! Redirecting to onboarding form...');
              router.push(`/platform/onboarding/manual/${onboardingResult.sessionId}`);
              return;
            } else {
              toast.error(onboardingResult.error || 'Failed to start onboarding');
            }
          } else {
            // Client mode - send invitation via API
            try {
              const inviteResponse = await fetch('/api/onboarding/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  projectId,
                  templateId: selectedTemplate,
                  clientEmail: formData.clientEmail,
                  clientName: formData.clientName,
                }),
              });
              
              if (inviteResponse.ok) {
                toast.success('Project created and invitation sent to client!');
              } else {
                toast.warning('Project created but invitation failed to send');
              }
            } catch (error) {
              console.error('Failed to send invitation:', error);
              toast.warning('Project created but invitation failed to send');
            }
          }
        }
        
        // If not manual/hybrid mode, redirect to projects list
        if (!enableOnboarding || onboardingMode === 'client') {
          router.push("/platform/projects");
        }
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Project creation error:', error);
      toast.error(error.message || "Failed to create project");
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

            {/* Client Information */}
            <Separator className="my-6" />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Client Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    placeholder="John Doe"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Client Onboarding */}
            <Separator className="my-6" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">Client Onboarding</h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableOnboarding}
                    onChange={(e) => setEnableOnboarding(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Enable onboarding</span>
                </label>
              </div>

              {enableOnboarding && (
                <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                  {/* Template Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="onboardingTemplate">Onboarding Template *</Label>
                    <Select
                      value={selectedTemplate}
                      onValueChange={setSelectedTemplate}
                      required={enableOnboarding}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {onboardingTemplates.length === 0 && (
                          <SelectItem value="none" disabled>No templates available</SelectItem>
                        )}
                        {onboardingTemplates.map((template: any) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} 
                            <Badge variant="outline" className="ml-2">
                              {template.projectType}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Choose a questionnaire template for collecting project information
                    </p>
                  </div>

                  {/* Completion Mode */}
                  <div className="space-y-3">
                    <Label>How will onboarding be completed? *</Label>
                    <RadioGroup value={onboardingMode} onValueChange={(value: any) => setOnboardingMode(value)}>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="client" id="mode-client" />
                        <Label htmlFor="mode-client" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Send invitation to client</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Client receives email and completes the questionnaire themselves
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="manual" id="mode-manual" />
                        <Label htmlFor="mode-manual" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <FolderKanban className="h-4 w-4 text-green-600" />
                            <span className="font-medium">I'll fill it out on behalf of client</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            You complete the questionnaire in an admin-optimized form
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="hybrid" id="mode-hybrid" />
                        <Label htmlFor="mode-hybrid" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">Hybrid (I'll fill some, client fills rest)</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            You complete certain sections, then send remaining sections to client
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {onboardingMode === 'client' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900">
                        💡 Make sure client name and email are filled in above
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Task Generation */}
            <Separator className="my-6" />
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



