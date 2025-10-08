"use server";

import { auth } from "@clerk/nextjs/server";
import {
  getProjectWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  getCallsForProject,
  getCallRecordById,
  getCallsNeedingFollowUp,
  getAllWorkflowsForProject,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getEmailTemplatesForProject,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getSmsTemplatesForProject,
  createSmsTemplate,
  updateSmsTemplate,
  deleteSmsTemplate,
  getCallStats,
  getWorkflowExecutionLogs,
} from "@/db/queries/calls-queries";
import { isPlatformAdmin } from "@/db/queries/platform-queries";
import { nanoid } from "nanoid";
import crypto from "crypto";

// ===== WEBHOOK ACTIONS =====

export async function getProjectWebhooksAction(projectId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can manage webhooks" };
    }
    
    const webhooks = await getProjectWebhooks(projectId);
    return { webhooks };
  } catch (error) {
    console.error("Error getting project webhooks:", error);
    return { error: "Failed to get webhooks" };
  }
}

export async function createWebhookAction(projectId: string, label: string, requireApiKey: boolean = false) {
  try {
    console.log('[createWebhookAction] Starting...', { projectId, label, requireApiKey });
    
    const { userId } = await auth();
    console.log('[createWebhookAction] User ID:', userId);
    
    if (!userId) {
      console.log('[createWebhookAction] No user ID - unauthorized');
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    console.log('[createWebhookAction] Is platform admin:', isAdmin);
    
    if (!isAdmin) {
      console.log('[createWebhookAction] Not platform admin');
      return { error: "Only platform admins can create webhooks" };
    }
    
    // Generate secure webhook token
    const webhookToken = `wh_${nanoid(32)}`;
    console.log('[createWebhookAction] Generated token:', webhookToken.substring(0, 10) + '...');
    
    // Generate optional API key
    const apiKey = requireApiKey ? `sk_${nanoid(32)}` : null;
    console.log('[createWebhookAction] API key required:', requireApiKey, 'generated:', !!apiKey);
    
    const webhookData = {
      projectId,
      label,
      webhookToken,
      apiKey,
      createdBy: userId,
      isActive: true,
    };
    console.log('[createWebhookAction] Creating webhook with data:', webhookData);
    
    const webhook = await createWebhook(webhookData);
    console.log('[createWebhookAction] Webhook created successfully:', webhook);
    
    return { webhook };
  } catch (error: any) {
    console.error("[createWebhookAction] Error creating webhook:", error);
    console.error("[createWebhookAction] Error stack:", error.stack);
    return { error: error.message || "Failed to create webhook" };
  }
}

export async function updateWebhookAction(
  webhookId: string,
  data: { label?: string; isActive?: boolean }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can update webhooks" };
    }
    
    const webhook = await updateWebhook(webhookId, data);
    return { webhook };
  } catch (error) {
    console.error("Error updating webhook:", error);
    return { error: "Failed to update webhook" };
  }
}

export async function deleteWebhookAction(webhookId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can delete webhooks" };
    }
    
    await deleteWebhook(webhookId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return { error: "Failed to delete webhook" };
  }
}

export async function regenerateApiKeyAction(webhookId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can regenerate API keys" };
    }
    
    const newApiKey = `sk_${nanoid(32)}`;
    const webhook = await updateWebhook(webhookId, { apiKey: newApiKey });
    
    return { webhook };
  } catch (error) {
    console.error("Error regenerating API key:", error);
    return { error: "Failed to regenerate API key" };
  }
}

// ===== CALL RECORD ACTIONS =====

export async function getProjectCallsAction(projectId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    // Both platform admins and org users can view calls
    const calls = await getCallsForProject(projectId);
    return { calls };
  } catch (error) {
    console.error("Error getting project calls:", error);
    return { error: "Failed to get calls" };
  }
}

export async function getCallDetailAction(callId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const call = await getCallRecordById(callId);
    if (!call) {
      return { error: "Call not found" };
    }
    
    return { call };
  } catch (error) {
    console.error("Error getting call detail:", error);
    return { error: "Failed to get call detail" };
  }
}

export async function getFollowUpCallsAction(projectId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const calls = await getCallsNeedingFollowUp(projectId);
    return { calls };
  } catch (error) {
    console.error("Error getting follow-up calls:", error);
    return { error: "Failed to get follow-up calls" };
  }
}

export async function getCallStatsAction(projectId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const stats = await getCallStats(projectId);
    return { stats };
  } catch (error) {
    console.error("Error getting call stats:", error);
    return { error: "Failed to get call stats" };
  }
}

// ===== WORKFLOW ACTIONS =====

export async function getProjectWorkflowsAction(projectId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can manage workflows" };
    }
    
    const workflows = await getAllWorkflowsForProject(projectId);
    return { workflows };
  } catch (error) {
    console.error("Error getting workflows:", error);
    return { error: "Failed to get workflows" };
  }
}

export async function createWorkflowAction(
  projectId: string,
  data: {
    name: string;
    description?: string;
    triggerConditions: any;
    actions: any[];
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can create workflows" };
    }
    
    const workflow = await createWorkflow({
      projectId,
      name: data.name,
      description: data.description || null,
      triggerConditions: data.triggerConditions,
      actions: data.actions,
      isActive: true,
      createdBy: userId,
    });
    
    return { workflow };
  } catch (error) {
    console.error("Error creating workflow:", error);
    return { error: "Failed to create workflow" };
  }
}

export async function updateWorkflowAction(
  workflowId: string,
  data: {
    name?: string;
    description?: string;
    triggerConditions?: any;
    actions?: any[];
    isActive?: boolean;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can update workflows" };
    }
    
    const workflow = await updateWorkflow(workflowId, data);
    return { workflow };
  } catch (error) {
    console.error("Error updating workflow:", error);
    return { error: "Failed to update workflow" };
  }
}

export async function deleteWorkflowAction(workflowId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can delete workflows" };
    }
    
    await deleteWorkflow(workflowId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return { error: "Failed to delete workflow" };
  }
}

export async function getWorkflowLogsAction(workflowId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { error: "Only platform admins can view workflow logs" };
    }
    
    const logs = await getWorkflowExecutionLogs(workflowId);
    return { logs };
  } catch (error) {
    console.error("Error getting workflow logs:", error);
    return { error: "Failed to get workflow logs" };
  }
}

// ===== TEMPLATE ACTIONS =====

export async function getEmailTemplatesAction(projectId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const templates = await getEmailTemplatesForProject(projectId);
    return { templates };
  } catch (error) {
    console.error("Error getting email templates:", error);
    return { error: "Failed to get email templates" };
  }
}

export async function createEmailTemplateAction(
  projectId: string,
  data: { name: string; subject: string; body: string }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const template = await createEmailTemplate({
      projectId,
      name: data.name,
      subject: data.subject,
      body: data.body,
      createdBy: userId,
    });
    
    return { template };
  } catch (error) {
    console.error("Error creating email template:", error);
    return { error: "Failed to create email template" };
  }
}

export async function updateEmailTemplateAction(
  templateId: string,
  data: { name?: string; subject?: string; body?: string }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const template = await updateEmailTemplate(templateId, data);
    return { template };
  } catch (error) {
    console.error("Error updating email template:", error);
    return { error: "Failed to update email template" };
  }
}

export async function deleteEmailTemplateAction(templateId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    await deleteEmailTemplate(templateId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting email template:", error);
    return { error: "Failed to delete email template" };
  }
}

// SMS Templates
export async function getSmsTemplatesAction(projectId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const templates = await getSmsTemplatesForProject(projectId);
    return { templates };
  } catch (error) {
    console.error("Error getting SMS templates:", error);
    return { error: "Failed to get SMS templates" };
  }
}

export async function createSmsTemplateAction(
  projectId: string,
  data: { name: string; message: string }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const template = await createSmsTemplate({
      projectId,
      name: data.name,
      message: data.message,
      createdBy: userId,
    });
    
    return { template };
  } catch (error) {
    console.error("Error creating SMS template:", error);
    return { error: "Failed to create SMS template" };
  }
}

export async function updateSmsTemplateAction(
  templateId: string,
  data: { name?: string; message?: string }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    const template = await updateSmsTemplate(templateId, data);
    return { template };
  } catch (error) {
    console.error("Error updating SMS template:", error);
    return { error: "Failed to update SMS template" };
  }
}

export async function deleteSmsTemplateAction(templateId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    
    await deleteSmsTemplate(templateId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting SMS template:", error);
    return { error: "Failed to delete SMS template" };
  }
}
