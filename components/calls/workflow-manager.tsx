"use client";

import { useState, useEffect } from "react";
import { type SelectCallWorkflow, type SelectWorkflowEmailTemplate, type SelectWorkflowSmsTemplate } from "@/db/schema";
import {
  getProjectWorkflowsAction,
  createWorkflowAction,
  updateWorkflowAction,
  deleteWorkflowAction,
  getEmailTemplatesAction,
  getSmsTemplatesAction,
} from "@/actions/calls-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Settings, Edit, Eye } from "lucide-react";
import { toast } from "sonner";

interface WorkflowManagerProps {
  projectId: string;
}

export function WorkflowManager({ projectId }: WorkflowManagerProps) {
  const [workflows, setWorkflows] = useState<SelectCallWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<SelectCallWorkflow | null>(null);
  const [previewWorkflow, setPreviewWorkflow] = useState<SelectCallWorkflow | null>(null);
  
  useEffect(() => {
    loadWorkflows();
  }, [projectId]);
  
  async function loadWorkflows() {
    setLoading(true);
    const result = await getProjectWorkflowsAction(projectId);
    if (result.workflows) {
      setWorkflows(result.workflows);
    }
    setLoading(false);
  }
  
  async function handleToggleActive(workflowId: string, isActive: boolean) {
    const result = await updateWorkflowAction(workflowId, { isActive });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Workflow ${isActive ? "activated" : "deactivated"}`);
      loadWorkflows();
    }
  }
  
  async function handleDelete(workflowId: string) {
    if (!confirm("Are you sure you want to delete this workflow?")) {
      return;
    }
    
    const result = await deleteWorkflowAction(workflowId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Workflow deleted");
      loadWorkflows();
    }
  }
  
  if (loading) {
    return <div>Loading workflows...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Automated Workflows</CardTitle>
        <CardDescription>
          Configure automatic actions that trigger when specific call conditions are met.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h4 className="font-medium">{workflow.name}</h4>
                <Badge variant={workflow.isActive ? "default" : "secondary"}>
                  {workflow.isActive ? "Active" : "Inactive"}
                </Badge>
                {workflow.totalExecutions !== null && workflow.totalExecutions > 0 && (
                  <Badge variant="outline">
                    {workflow.totalExecutions} executions
                  </Badge>
                )}
              </div>
              <Switch
                checked={workflow.isActive || false}
                onCheckedChange={(checked) => handleToggleActive(workflow.id, checked)}
              />
            </div>
            
            {workflow.description && (
              <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
            )}
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Conditions: </span>
                <span className="text-gray-600">
                  {JSON.stringify(workflow.triggerConditions)}
                </span>
              </div>
              
              <div>
                <span className="font-medium">Actions: </span>
                <span className="text-gray-600">
                  {(workflow.actions as any[])?.length || 0} configured
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingWorkflow(workflow)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewWorkflow(workflow)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(workflow.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        ))}
        
        {workflows.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No workflows configured. Create one to automate call follow-ups.
          </div>
        )}
        
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Workflow
        </Button>
      </CardContent>
      
      <CreateWorkflowDialog
        open={showCreateDialog}
        projectId={projectId}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false);
          loadWorkflows();
        }}
      />
      
      {editingWorkflow && (
        <CreateWorkflowDialog
          open={!!editingWorkflow}
          projectId={projectId}
          existingWorkflow={editingWorkflow}
          onClose={() => setEditingWorkflow(null)}
          onSuccess={() => {
            setEditingWorkflow(null);
            loadWorkflows();
          }}
        />
      )}
      
      {previewWorkflow && (
        <WorkflowPreviewDialog
          workflow={previewWorkflow}
          projectId={projectId}
          onClose={() => setPreviewWorkflow(null)}
        />
      )}
    </Card>
  );
}

function CreateWorkflowDialog({
  open,
  projectId,
  existingWorkflow,
  onClose,
  onSuccess,
}: {
  open: boolean;
  projectId: string;
  existingWorkflow?: SelectCallWorkflow;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEditMode = !!existingWorkflow;
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);
  
  // Manual mode fields (legacy)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [conditionField, setConditionField] = useState("followUpNeeded");
  const [conditionOperator, setConditionOperator] = useState("is_true");
  const [conditionValue, setConditionValue] = useState("");
  const [actionType, setActionType] = useState("create_task");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");
  const [taskDueDays, setTaskDueDays] = useState("1");
  
  // Email action fields
  const [emailTemplateId, setEmailTemplateId] = useState("");
  const [emailRecipient, setEmailRecipient] = useState("{{caller_email}}");
  const [emailDelayMinutes, setEmailDelayMinutes] = useState("0");
  
  // SMS action fields
  const [smsTemplateId, setSmsTemplateId] = useState("");
  const [smsRecipient, setSmsRecipient] = useState("{{caller_phone}}");
  
  const [emailTemplates, setEmailTemplates] = useState<SelectWorkflowEmailTemplate[]>([]);
  const [smsTemplates, setSmsTemplates] = useState<SelectWorkflowSmsTemplate[]>([]);
  
  useEffect(() => {
    if (open) {
      loadTemplates();
      
      // Populate fields if editing
      if (existingWorkflow) {
        setMode("manual"); // Force manual mode for editing
        setName(existingWorkflow.name);
        setDescription(existingWorkflow.description || "");
        
        // Parse existing trigger conditions
        const conditions = existingWorkflow.triggerConditions as any;
        if (conditions?.all?.[0]) {
          const firstCondition = conditions.all[0];
          setConditionField(firstCondition.field || "followUpNeeded");
          setConditionOperator(firstCondition.operator || "is_true");
          setConditionValue(firstCondition.value?.toString() || "");
        }
        
        // Parse existing actions
        const actions = existingWorkflow.actions as any[];
        if (actions?.[0]) {
          const firstAction = actions[0];
          setActionType(firstAction.type || "create_task");
          if (firstAction.type === "create_task") {
            setTaskTitle(firstAction.title || "");
            setTaskAssignedTo(firstAction.assigned_to || "");
            setTaskDueDays(firstAction.due_days?.toString() || "1");
          } else if (firstAction.type === "send_email") {
            setEmailTemplateId(firstAction.template_id || "");
            setEmailRecipient(firstAction.to || firstAction.recipient_email || "{{caller_email}}");
            setEmailDelayMinutes(firstAction.delay_minutes?.toString() || "0");
          } else if (firstAction.type === "send_sms") {
            setSmsTemplateId(firstAction.template_id || "");
            setSmsRecipient(firstAction.to || firstAction.recipient_phone || "{{caller_phone}}");
          }
        }
      }
    }
  }, [open, existingWorkflow]);
  
  async function loadTemplates() {
    const [emailResult, smsResult] = await Promise.all([
      getEmailTemplatesAction(projectId),
      getSmsTemplatesAction(projectId),
    ]);
    
    if (emailResult.templates) setEmailTemplates(emailResult.templates);
    if (smsResult.templates) setSmsTemplates(smsResult.templates);
  }
  
  async function handleGenerateFromAI() {
    if (!prompt.trim()) {
      toast.error("Please describe what you want the workflow to do");
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await fetch("/api/workflows/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, projectId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate workflow");
      }
      
      const result = await response.json();
      setGeneratedWorkflow(result);
      toast.success("Workflow generated! Review and create.");
    } catch (error: any) {
      console.error("Error generating workflow:", error);
      toast.error(error.message || "Failed to generate workflow");
    } finally {
      setIsGenerating(false);
    }
  }
  
  async function handleCreateGeneratedWorkflow() {
    if (!generatedWorkflow) {
      toast.error("No workflow generated");
      return;
    }
    
    const result = await createWorkflowAction(projectId, {
      name: generatedWorkflow.workflowName,
      description: generatedWorkflow.workflowDescription,
      triggerConditions: generatedWorkflow.triggerConditions,
      actions: generatedWorkflow.actions,
    });
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Workflow created successfully!");
      resetForm();
      onSuccess();
    }
  }
  
  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Workflow name is required");
      return;
    }
    
    // Build trigger conditions
    const triggerConditions = {
      all: [
        {
          field: conditionField,
          operator: conditionOperator,
          value: conditionValue || true,
        },
      ],
    };
    
    // Build actions
    const actions: any[] = [];
    
    if (actionType === "create_task") {
      actions.push({
        type: "create_task",
        title: taskTitle || "Follow up with {{caller_name}}",
        assigned_to: taskAssignedTo || null,
        due_days: parseInt(taskDueDays) || 1,
      });
    } else if (actionType === "send_email") {
      if (!emailTemplateId) {
        toast.error("Please select an email template");
        return;
      }
      actions.push({
        type: "send_email",
        template_id: emailTemplateId,
        to: emailRecipient,
        delay_minutes: parseInt(emailDelayMinutes) || 0,
      });
    } else if (actionType === "send_sms") {
      if (!smsTemplateId) {
        toast.error("Please select an SMS template");
        return;
      }
      actions.push({
        type: "send_sms",
        template_id: smsTemplateId,
        to: smsRecipient,
      });
    }
    
    const result = isEditMode 
      ? await updateWorkflowAction(existingWorkflow.id, {
          name,
          description,
          triggerConditions,
          actions,
        })
      : await createWorkflowAction(projectId, {
          name,
          description,
          triggerConditions,
          actions,
        });
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isEditMode ? "Workflow updated successfully" : "Workflow created successfully");
      resetForm();
      onSuccess();
    }
  }
  
  function resetForm() {
    setPrompt("");
    setGeneratedWorkflow(null);
    setName("");
    setDescription("");
    setConditionField("followUpNeeded");
    setConditionOperator("is_true");
    setConditionValue("");
    setActionType("create_task");
    setTaskTitle("");
    setTaskAssignedTo("");
    setTaskDueDays("1");
    setEmailTemplateId("");
    setEmailRecipient("{{caller_email}}");
    setEmailDelayMinutes("0");
    setSmsTemplateId("");
    setSmsRecipient("{{caller_phone}}");
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Workflow" : "Create New Workflow"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update your workflow configuration" 
              : "Describe what you want to happen and AI will create the workflow for you."}
          </DialogDescription>
        </DialogHeader>
        
        {/* Mode Toggle - Only show when creating */}
        {!isEditMode && (
          <div className="flex gap-2 border-b pb-4">
            <Button
              type="button"
              variant={mode === "ai" ? "default" : "outline"}
              onClick={() => setMode("ai")}
              className="flex-1"
            >
              AI-Powered (Recommended)
            </Button>
            <Button
              type="button"
              variant={mode === "manual" ? "default" : "outline"}
              onClick={() => setMode("manual")}
              className="flex-1"
            >
              Manual Setup
            </Button>
          </div>
        )}
        
        {mode === "ai" ? (
          <div className="space-y-6">
            {/* AI Prompt Interface */}
            <div>
              <Label htmlFor="prompt">Describe your workflow</Label>
              <div className="text-xs text-gray-500 mb-2">
                Example: "If a caller expresses interest in buying a product, send them an SMS saying 'Thanks for your interest! Our team will reach out within 24 hours.'"
              </div>
              <Textarea
                id="prompt"
                className="min-h-[120px]"
                placeholder="Example: When a caller needs urgent follow-up, create a high-priority task and send me an email notification with the call summary..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            
            {/* Generate Button */}
            {!generatedWorkflow && (
              <Button
                onClick={handleGenerateFromAI}
                disabled={isGenerating || !prompt.trim()}
                className="w-full"
              >
                {isGenerating ? "Generating with AI..." : "Generate Workflow"}
              </Button>
            )}
            
            {/* Generated Workflow Preview */}
            {generatedWorkflow && (
              <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Generated Workflow</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGeneratedWorkflow(null)}
                  >
                    Edit Prompt
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-sm">Name:</span>
                    <p className="text-sm mt-1">{generatedWorkflow.workflowName}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-sm">Description:</span>
                    <p className="text-sm mt-1">{generatedWorkflow.workflowDescription}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-sm">Triggers when:</span>
                    <pre className="text-xs mt-1 p-2 bg-white rounded border overflow-x-auto">
                      {JSON.stringify(generatedWorkflow.triggerConditions, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <span className="font-medium text-sm">Actions:</span>
                    <div className="mt-1 space-y-2">
                      {generatedWorkflow.actions.map((action: any, idx: number) => (
                        <div key={idx} className="p-2 bg-white rounded border text-xs">
                          <div className="font-medium capitalize">{action.type.replace('_', ' ')}</div>
                          <pre className="mt-1 text-xs">
                            {JSON.stringify(action, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {generatedWorkflow.createdTemplates && (
                    <div>
                      <span className="font-medium text-sm">Created Templates:</span>
                      <div className="text-xs mt-1">
                        {generatedWorkflow.createdTemplates.emailTemplates?.length > 0 && (
                          <div>Email: {generatedWorkflow.createdTemplates.emailTemplates.map((t: any) => t.name).join(", ")}</div>
                        )}
                        {generatedWorkflow.createdTemplates.smsTemplates?.length > 0 && (
                          <div>SMS: {generatedWorkflow.createdTemplates.smsTemplates.map((t: any) => t.name).join(", ")}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={handleCreateGeneratedWorkflow}
                  className="w-full"
                >
                  Create This Workflow
                </Button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., High Priority Follow-up"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what this workflow does"
              />
            </div>
          </div>
          
          {/* Trigger Conditions */}
          <div className="space-y-4">
            <h3 className="font-semibold">When should this trigger?</h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="condition-field">Field</Label>
                <Select value={conditionField} onValueChange={setConditionField}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="followUpNeeded">Follow-up Needed</SelectItem>
                    <SelectItem value="followUpUrgency">Follow-up Urgency</SelectItem>
                    <SelectItem value="callQualityRating">Call Quality Rating</SelectItem>
                    <SelectItem value="callSentiment">Call Sentiment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="condition-operator">Operator</Label>
                <Select value={conditionOperator} onValueChange={setConditionOperator}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="is_true">Is True</SelectItem>
                    <SelectItem value="is_false">Is False</SelectItem>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="not_equals">Not Equals</SelectItem>
                    <SelectItem value="greater_than">Greater Than</SelectItem>
                    <SelectItem value="less_than">Less Than</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {!["is_true", "is_false"].includes(conditionOperator) && (
                <div>
                  <Label htmlFor="condition-value">Value</Label>
                  <Input
                    id="condition-value"
                    value={conditionValue}
                    onChange={(e) => setConditionValue(e.target.value)}
                    placeholder="e.g., 5, urgent, negative"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-4">
            <h3 className="font-semibold">What actions should happen?</h3>
            
            <div>
              <Label htmlFor="action-type">Action Type</Label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create_task">Create Task</SelectItem>
                  <SelectItem value="send_email">Send Email</SelectItem>
                  <SelectItem value="send_sms">Send SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {actionType === "create_task" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g., Follow up with {{caller_name}}"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {"{{caller_name}}"}, {"{{call_topic}}"}, {"{{call_rating}}"}, etc.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="task-assigned">Assigned To (User ID)</Label>
                    <Input
                      id="task-assigned"
                      value={taskAssignedTo}
                      onChange={(e) => setTaskAssignedTo(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="task-due">Due in (days)</Label>
                    <Input
                      id="task-due"
                      type="number"
                      value={taskDueDays}
                      onChange={(e) => setTaskDueDays(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {actionType === "send_email" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email-template">Email Template</Label>
                  <Select value={emailTemplateId} onValueChange={setEmailTemplateId}>
                    <SelectTrigger id="email-template">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          No templates available. Create one first.
                        </div>
                      ) : (
                        emailTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {emailTemplates.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Go to the Templates page to create email templates first.
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email-recipient">Recipient Email</Label>
                  <Input
                    id="email-recipient"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    placeholder="e.g., {{caller_email}} or admin@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {"{{caller_email}}"} for dynamic recipient
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="email-delay">Delay (minutes)</Label>
                  <Input
                    id="email-delay"
                    type="number"
                    value={emailDelayMinutes}
                    onChange={(e) => setEmailDelayMinutes(e.target.value)}
                    min="0"
                    placeholder="0 = send immediately"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    0 = send immediately after call analysis
                  </p>
                </div>
              </div>
            )}
            
            {actionType === "send_sms" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="sms-template">SMS Template</Label>
                  <Select value={smsTemplateId} onValueChange={setSmsTemplateId}>
                    <SelectTrigger id="sms-template">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {smsTemplates.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          No templates available. Create one first.
                        </div>
                      ) : (
                        smsTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {smsTemplates.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Go to the Templates page to create SMS templates first.
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="sms-recipient">Recipient Phone</Label>
                  <Input
                    id="sms-recipient"
                    value={smsRecipient}
                    onChange={(e) => setSmsRecipient(e.target.value)}
                    placeholder="e.g., {{caller_phone}} or +1-555-123-4567"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {"{{caller_phone}}"} for dynamic recipient
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEditMode ? "Update Workflow" : "Create Workflow"}</Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Preview Dialog Component
function WorkflowPreviewDialog({
  workflow,
  projectId,
  onClose,
}: {
  workflow: SelectCallWorkflow;
  projectId: string;
  onClose: () => void;
}) {
  const [emailTemplates, setEmailTemplates] = useState<SelectWorkflowEmailTemplate[]>([]);
  const [smsTemplates, setSmsTemplates] = useState<SelectWorkflowSmsTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadTemplates();
  }, []);
  
  async function loadTemplates() {
    const [emailResult, smsResult] = await Promise.all([
      getEmailTemplatesAction(projectId),
      getSmsTemplatesAction(projectId),
    ]);
    
    if (emailResult.templates) setEmailTemplates(emailResult.templates);
    if (smsResult.templates) setSmsTemplates(smsResult.templates);
    setLoading(false);
  }
  
  // Sample data for preview
  const sampleData = {
    caller_name: "John Doe",
    caller_phone: "+1-555-123-4567",
    caller_email: "john.doe@example.com",
    call_topic: "Product Inquiry",
    call_summary: "Customer inquired about premium features and pricing options.",
    call_rating: "8",
    follow_up_reason: "Customer wants detailed pricing breakdown",
  };
  
  function interpolate(text: string) {
    return text
      .replace(/\{\{caller_name\}\}/g, sampleData.caller_name)
      .replace(/\{\{caller_phone\}\}/g, sampleData.caller_phone)
      .replace(/\{\{caller_email\}\}/g, sampleData.caller_email)
      .replace(/\{\{call_topic\}\}/g, sampleData.call_topic)
      .replace(/\{\{call_summary\}\}/g, sampleData.call_summary)
      .replace(/\{\{call_rating\}\}/g, sampleData.call_rating)
      .replace(/\{\{follow_up_reason\}\}/g, sampleData.follow_up_reason);
  }
  
  const actions = workflow.actions as any[];
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Workflow Preview: {workflow.name}</DialogTitle>
          <DialogDescription>
            See what your workflow will do with sample call data
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Sample Data Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 text-blue-900">Sample Call Data (for preview)</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="font-medium">Caller:</span> {sampleData.caller_name}</div>
              <div><span className="font-medium">Phone:</span> {sampleData.caller_phone}</div>
              <div><span className="font-medium">Topic:</span> {sampleData.call_topic}</div>
              <div><span className="font-medium">Rating:</span> {sampleData.call_rating}/10</div>
            </div>
          </div>
          
          {/* Trigger Conditions */}
          <div>
            <h4 className="font-semibold mb-2">Trigger Conditions</h4>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(workflow.triggerConditions, null, 2)}
            </pre>
          </div>
          
          {/* Actions Preview */}
          <div>
            <h4 className="font-semibold mb-3">Actions ({actions.length})</h4>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-gray-500">Loading templates...</p>
              ) : (
                actions.map((action, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-white">
                    <Badge className="mb-2">{action.type.replace('_', ' ').toUpperCase()}</Badge>
                    
                    {action.type === "create_task" && (
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-gray-500">Task Title</Label>
                          <p className="text-sm font-medium">{interpolate(action.title)}</p>
                        </div>
                        {action.assigned_to && (
                          <div>
                            <Label className="text-xs text-gray-500">Assigned To</Label>
                            <p className="text-sm">{action.assigned_to}</p>
                          </div>
                        )}
                        {action.due_days && (
                          <div>
                            <Label className="text-xs text-gray-500">Due Date</Label>
                            <p className="text-sm">{action.due_days} days from call</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {action.type === "send_email" && (
                      <div className="space-y-3">
                        {(() => {
                          const template = emailTemplates.find(t => t.id === action.template_id);
                          if (!template) {
                            return <p className="text-sm text-red-500">Template not found</p>;
                          }
                          
                          return (
                            <>
                              <div>
                                <Label className="text-xs text-gray-500">To</Label>
                                <p className="text-sm">{interpolate(action.recipient_email || action.to)}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">Subject</Label>
                                <p className="text-sm font-medium">{interpolate(template.subject)}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">Body</Label>
                                <div className="bg-gray-50 p-3 rounded border text-sm whitespace-pre-wrap">
                                  {interpolate(template.body)}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                    
                    {action.type === "send_sms" && (
                      <div className="space-y-3">
                        {(() => {
                          const template = smsTemplates.find(t => t.id === action.template_id);
                          if (!template) {
                            return <p className="text-sm text-red-500">Template not found</p>;
                          }
                          
                          return (
                            <>
                              <div>
                                <Label className="text-xs text-gray-500">To</Label>
                                <p className="text-sm">{interpolate(action.recipient_phone || action.to)}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">Message</Label>
                                <div className="bg-gray-50 p-3 rounded border text-sm">
                                  {interpolate(template.message)}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                Character count: {interpolate(template.message).length}/160
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
