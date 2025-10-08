import OpenAI from "openai";
import {
  createEmailTemplate,
  createSmsTemplate,
} from "@/db/queries/calls-queries";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface WorkflowGenerationResult {
  workflowName: string;
  workflowDescription: string;
  triggerConditions: any;
  actions: any[];
  createdTemplates: {
    emailTemplates: Array<{ id: string; name: string }>;
    smsTemplates: Array<{ id: string; name: string }>;
  };
}

/**
 * Generate a complete workflow from a natural language prompt
 */
export async function generateWorkflowFromPrompt(
  prompt: string,
  projectId: string,
  createdBy: string
): Promise<WorkflowGenerationResult> {
  // Step 1: Use AI to analyze the prompt and generate workflow structure
  const workflowStructure = await analyzePromptWithAI(prompt);
  
  // Step 2: Create any necessary templates
  const createdTemplates = await createTemplatesFromStructure(
    workflowStructure,
    projectId,
    createdBy
  );
  
  // Step 3: Update actions with created template IDs
  const finalActions = workflowStructure.actions.map((action: any) => {
    if (action.type === "send_email" && action.template_content) {
      const template = createdTemplates.emailTemplates.find(
        (t) => t.name === action.template_name
      );
      return {
        ...action,
        template_id: template?.id,
        template_content: undefined, // Remove content after creating template
        template_name: undefined,
      };
    }
    
    if (action.type === "send_sms" && action.template_content) {
      const template = createdTemplates.smsTemplates.find(
        (t) => t.name === action.template_name
      );
      return {
        ...action,
        template_id: template?.id,
        template_content: undefined,
        template_name: undefined,
      };
    }
    
    return action;
  });
  
  return {
    workflowName: workflowStructure.workflow_name,
    workflowDescription: workflowStructure.workflow_description,
    triggerConditions: workflowStructure.trigger_conditions,
    actions: finalActions,
    createdTemplates,
  };
}

/**
 * Use OpenAI to analyze the prompt and generate workflow structure
 */
async function analyzePromptWithAI(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are an AI assistant that converts natural language workflow descriptions into structured JSON for an automation system.

The workflow system has these components:

1. TRIGGER CONDITIONS - When should the workflow run?
   Available fields to check:
   - call_sentiment: "positive", "neutral", "negative"
   - call_quality_rating: 1-10
   - follow_up_needed: true/false
   - follow_up_urgency: "low", "medium", "high", "urgent"
   - call_topic: string (AI-extracted topic)
   - call_summary: string (AI-generated summary)
   - transcript: string (full call transcript)
   - call_duration_seconds: number
   
   Operators: "equals", "not_equals", "greater_than", "less_than", "contains", "not_contains"
   
   Logic: Use "all" for AND, "any" for OR
   
   Example:
   {
     "any": [
       { "field": "transcript", "operator": "contains", "value": "interested in buying" },
       { "field": "transcript", "operator": "contains", "value": "want to purchase" },
       { "field": "call_sentiment", "operator": "equals", "value": "positive" }
     ]
   }

2. ACTIONS - What should happen?
   Available action types:
   
   a) send_email:
   {
     "type": "send_email",
     "to": "{{caller_email}}" or specific email,
     "delay_minutes": 0,
     "template_name": "Friendly name for template",
     "template_content": {
       "subject": "Email subject with {{variables}}",
       "body": "Email body with {{caller_name}}, {{caller_phone}}, {{call_topic}}, {{call_summary}}, etc."
     }
   }
   
   b) send_sms:
   {
     "type": "send_sms",
     "to": "{{caller_phone}}" or specific number,
     "template_name": "Friendly name for template",
     "template_content": {
       "message": "SMS message (max 160 chars) with {{variables}}"
     }
   }
   
   c) create_task:
   {
     "type": "create_task",
     "title": "Task title with {{variables}}",
     "assigned_to": null, // Will be assigned by admin later
     "due_days": 1 // Days from now
   }

Available template variables: {{caller_name}}, {{caller_phone}}, {{call_topic}}, {{call_summary}}, {{call_rating}}, {{follow_up_reason}}

IMPORTANT: 
- If the user provides specific message content, include it in template_content
- Try to infer smart triggers based on context (e.g., "interested in buying" should check transcript)
- Be flexible with trigger matching - use "contains" and "any" logic for natural language
- Keep SMS messages under 160 characters
- Use professional, friendly tone for templates`,
      },
      {
        role: "user",
        content: `Create a workflow based on this description:

"${prompt}"

Return ONLY valid JSON in this exact format:
{
  "workflow_name": "Short descriptive name",
  "workflow_description": "One sentence description",
  "trigger_conditions": { /* condition structure */ },
  "actions": [ /* array of actions */ ]
}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const result = JSON.parse(completion.choices[0].message.content || "{}");
  console.log("[AI Workflow Generator] Generated structure:", JSON.stringify(result, null, 2));
  
  return result;
}

/**
 * Create email/SMS templates from the workflow structure
 */
async function createTemplatesFromStructure(
  workflowStructure: any,
  projectId: string,
  createdBy: string
) {
  const emailTemplates: Array<{ id: string; name: string }> = [];
  const smsTemplates: Array<{ id: string; name: string }> = [];

  for (const action of workflowStructure.actions) {
    if (action.type === "send_email" && action.template_content) {
      const template = await createEmailTemplate({
        projectId,
        name: action.template_name || `${workflowStructure.workflow_name} - Email`,
        subject: action.template_content.subject,
        body: action.template_content.body,
        createdBy,
      });
      
      emailTemplates.push({
        id: template.id,
        name: template.name,
      });
    }
    
    if (action.type === "send_sms" && action.template_content) {
      const template = await createSmsTemplate({
        projectId,
        name: action.template_name || `${workflowStructure.workflow_name} - SMS`,
        message: action.template_content.message,
        createdBy,
      });
      
      smsTemplates.push({
        id: template.id,
        name: template.name,
      });
    }
  }

  return { emailTemplates, smsTemplates };
}

/**
 * Improve an existing workflow prompt with AI suggestions
 */
export async function suggestWorkflowImprovements(
  currentPrompt: string
): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are an AI assistant that suggests improvements to workflow automation descriptions. 
        Provide 3-5 specific, actionable suggestions to make the workflow more effective.`,
      },
      {
        role: "user",
        content: `Suggest improvements for this workflow description:

"${currentPrompt}"

Return suggestions as a JSON array of strings:
["suggestion 1", "suggestion 2", ...]`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{"suggestions":[]}');
  return result.suggestions || [];
}
