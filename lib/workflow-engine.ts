import {
  getCallRecordById,
  getActiveWorkflowsForProject,
  getWorkflowById,
  getEmailTemplate,
  getSmsTemplate,
  incrementWorkflowExecutions,
  createWorkflowExecutionLog,
} from "@/db/queries/calls-queries";
import { createProjectTask } from "@/db/queries/projects-queries";
import { sendEmail } from "@/lib/email-service";
import { getMessagingCredentials } from "@/lib/messaging/credential-manager";
import { getOrganizationIdFromProject } from "@/lib/messaging/organization-context";
import type { SelectCallRecord, SelectCallWorkflow } from "@/db/schema";

export async function checkAndExecuteWorkflows(callRecordId: string) {
  try {
    const callRecord = await getCallRecordById(callRecordId);
    if (!callRecord) {
      console.error(`Call record ${callRecordId} not found`);
      return;
    }
    
    const workflows = await getActiveWorkflowsForProject(callRecord.projectId);
    
    const triggeredWorkflowIds: string[] = [];
    
    for (const workflow of workflows) {
      try {
        // Evaluate trigger conditions
        const shouldTrigger = evaluateConditions(
          workflow.triggerConditions as any,
          callRecord
        );
        
        if (shouldTrigger) {
          console.log(`🔔 Workflow "${workflow.name}" triggered for call ${callRecordId}`);
          await executeWorkflow(workflow.id, callRecord);
          triggeredWorkflowIds.push(workflow.id);
        }
      } catch (error) {
        console.error(`Error evaluating workflow ${workflow.id}:`, error);
      }
    }
    
    // Store which workflows were triggered
    if (triggeredWorkflowIds.length > 0) {
      const { updateCallRecord } = await import("@/db/queries/calls-queries");
      await updateCallRecord(callRecordId, {
        workflowTriggers: triggeredWorkflowIds,
      });
    }
    
  } catch (error) {
    console.error(`Error checking workflows for call ${callRecordId}:`, error);
  }
}

function evaluateConditions(conditions: any, callRecord: SelectCallRecord): boolean {
  if (!conditions) return false;
  
  // Handle "all" conditions (AND logic)
  if (conditions.all && Array.isArray(conditions.all)) {
    return conditions.all.every((condition: any) => 
      evaluateSingleCondition(condition, callRecord)
    );
  }
  
  // Handle "any" conditions (OR logic)
  if (conditions.any && Array.isArray(conditions.any)) {
    return conditions.any.some((condition: any) => 
      evaluateSingleCondition(condition, callRecord)
    );
  }
  
  // Single condition
  return evaluateSingleCondition(conditions, callRecord);
}

function evaluateSingleCondition(condition: any, callRecord: SelectCallRecord): boolean {
  const { field, operator, value } = condition;
  
  // Get field value from call record
  const fieldValue = (callRecord as any)[field];
  
  switch (operator) {
    case "equals":
      return fieldValue === value;
    case "not_equals":
      return fieldValue !== value;
    case "greater_than":
      return typeof fieldValue === "number" && fieldValue > value;
    case "less_than":
      return typeof fieldValue === "number" && fieldValue < value;
    case "greater_than_or_equal":
      return typeof fieldValue === "number" && fieldValue >= value;
    case "less_than_or_equal":
      return typeof fieldValue === "number" && fieldValue <= value;
    case "contains":
      return typeof fieldValue === "string" && fieldValue.includes(value);
    case "not_contains":
      return typeof fieldValue === "string" && !fieldValue.includes(value);
    case "is_true":
      return fieldValue === true;
    case "is_false":
      return fieldValue === false;
    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

async function executeWorkflow(workflowId: string, callRecord: SelectCallRecord) {
  const workflow = await getWorkflowById(workflowId);
  if (!workflow) {
    console.error(`Workflow ${workflowId} not found`);
    return;
  }
  
  const executedActions: any[] = [];
  let status = "success";
  let errorMessage: string | null = null;
  
  try {
    const actions = workflow.actions as any[];
    
    for (const action of actions) {
      try {
        const result = await executeAction(action, callRecord, workflow.projectId);
        executedActions.push(result);
      } catch (actionError: any) {
        console.error(`Error executing action:`, actionError);
        executedActions.push({
          ...action,
          success: false,
          error: actionError.message,
        });
        status = "partial";
      }
    }
    
    // Update workflow stats
    await incrementWorkflowExecutions(workflowId);
    
  } catch (error: any) {
    status = "failed";
    errorMessage = error.message;
  }
  
  // Log execution
  await createWorkflowExecutionLog({
    workflowId,
    callRecordId: callRecord.id,
    status,
    actionsExecuted: executedActions,
    errorMessage,
  });
}

async function executeAction(action: any, callRecord: SelectCallRecord, projectId: string) {
  // Get organization ID from project for credential lookup
  const organizationId = await getOrganizationIdFromProject(projectId);
  if (!organizationId) {
    throw new Error("Organization not found for project");
  }

  // Get organization-specific or platform credentials
  const credentials = await getMessagingCredentials(organizationId);

  // Template variable interpolation
  const interpolate = (text: string): string => {
    if (!text) return "";
    
    return text
      .replace(/\{\{caller_name\}\}/g, callRecord.callerName || "Unknown")
      .replace(/\{\{caller_phone\}\}/g, callRecord.callerPhone || "")
      .replace(/\{\{call_topic\}\}/g, callRecord.callTopic || "")
      .replace(/\{\{call_summary\}\}/g, callRecord.callSummary || "")
      .replace(/\{\{call_rating\}\}/g, String(callRecord.callQualityRating || 0))
      .replace(/\{\{follow_up_reason\}\}/g, callRecord.followUpReason || "")
      .replace(/\{\{call_duration\}\}/g, String(Math.round((callRecord.callDurationSeconds || 0) / 60)))
      .replace(/\{\{call_sentiment\}\}/g, callRecord.callSentiment || "neutral");
  };
  
  switch (action.type) {
    case "send_email": {
      if (!credentials.resend) {
        throw new Error(
          "Email service not configured. Please configure Resend credentials in organization settings."
        );
      }

      const template = await getEmailTemplate(action.template_id);
      if (!template) {
        throw new Error(`Email template ${action.template_id} not found`);
      }
      
      const emailData = {
        to: interpolate(action.to),
        subject: interpolate(template.subject),
        body: interpolate(template.body),
      };
      
      if (action.delay_minutes && action.delay_minutes > 0) {
        // TODO: Implement email scheduling (could use a job queue or database table)
        console.log(`Email scheduled for ${action.delay_minutes} minutes`);
        // For now, send immediately
        await credentials.resend.client.emails.send({
          from: credentials.resend.fromEmail,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.body,
        });
      } else {
        await credentials.resend.client.emails.send({
          from: credentials.resend.fromEmail,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.body,
        });
      }
      
      console.log(
        `[Workflow] Email sent using ${credentials.usingPlatformCredentials.resend ? "platform" : "organization"} credentials`
      );
      
      return { type: "send_email", success: true, to: emailData.to };
    }
    
    case "send_sms": {
      if (!credentials.twilio) {
        throw new Error(
          "SMS service not configured. Please configure Twilio credentials in organization settings."
        );
      }
      
      const template = await getSmsTemplate(action.template_id);
      if (!template) {
        throw new Error(`SMS template ${action.template_id} not found`);
      }
      
      const message = interpolate(template.message);
      const to = interpolate(action.to);
      
      if (!to) {
        throw new Error("SMS recipient phone number is empty");
      }
      
      await credentials.twilio.client.messages.create({
        body: message,
        from: credentials.twilio.phoneNumber,
        to,
      });
      
      console.log(
        `[Workflow] SMS sent using ${credentials.usingPlatformCredentials.twilio ? "platform" : "organization"} credentials`
      );
      
      return { type: "send_sms", success: true, to };
    }
    
    case "create_task": {
      const task = await createProjectTask({
        projectId,
        title: interpolate(action.title),
        description: action.description 
          ? interpolate(action.description)
          : `Auto-created from call workflow.\n\nCall ID: ${callRecord.id}\nCaller: ${callRecord.callerName || "Unknown"}\nTopic: ${callRecord.callTopic || "N/A"}`,
        status: "todo",
        assignedTo: action.assigned_to || null,
        dueDate: action.due_days 
          ? new Date(Date.now() + action.due_days * 24 * 60 * 60 * 1000)
          : null,
        aiGenerated: true,
        sourceType: "ai_generated",
        sourceId: callRecord.id,
        sourceMetadata: JSON.stringify({
          callId: callRecord.id,
          callerName: callRecord.callerName,
          callTopic: callRecord.callTopic,
          workflowTriggered: true,
        }),
      });
      
      return { type: "create_task", success: true, task_id: task.id };
    }
    
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}
