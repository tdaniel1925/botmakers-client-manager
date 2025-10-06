/**
 * SMS Service - Twilio Integration
 * Central utility for sending SMS notifications throughout the app
 * Updated to use editable templates from template system
 */

import { Twilio } from 'twilio';
import { renderTemplate } from './template-service';

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
  : null;

const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER;

interface SendSMSOptions {
  to: string;
  message: string;
}

/**
 * Send an SMS using Twilio
 */
export async function sendSMS({ to, message }: SendSMSOptions) {
  if (!twilioClient || !FROM_NUMBER) {
    console.error('Twilio not configured');
    return { isSuccess: false, message: 'SMS service not configured' };
  }

  // Validate phone number format
  if (!to || to.length < 10) {
    console.error('Invalid phone number:', to);
    return { isSuccess: false, message: 'Invalid phone number' };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: FROM_NUMBER,
      to: to,
    });

    console.log('SMS sent successfully:', result.sid);
    return { isSuccess: true, messageId: result.sid };
  } catch (error: any) {
    console.error('SMS send error:', error);
    return { isSuccess: false, message: error.message };
  }
}

/**
 * Send onboarding invitation SMS
 * Now uses editable template system
 */
export async function sendOnboardingInviteSMS(
  phone: string,
  clientName: string,
  projectName: string,
  link: string
) {
  const rendered = await renderTemplate('onboarding_invite', 'sms', {
    clientName,
    projectName,
    link,
  });

  const message = rendered 
    ? rendered.text 
    : `Hi ${clientName}! You've been invited to complete onboarding for ${projectName}. Start here: ${link}`;
  
  return sendSMS({ to: phone, message });
}

/**
 * Send onboarding completion SMS to admin
 * Now uses editable template system
 */
export async function sendOnboardingCompleteSMS(
  phone: string,
  clientName: string,
  projectName: string
) {
  const rendered = await renderTemplate('onboarding_complete', 'sms', {
    clientName,
    projectName,
  });

  const message = rendered
    ? rendered.text
    : `Great news! ${clientName} completed onboarding for ${projectName}. Review now in your dashboard.`;
  
  return sendSMS({ to: phone, message });
}

/**
 * Send to-dos approved SMS to client
 * Now uses editable template system
 */
export async function sendTodosApprovedSMS(
  phone: string,
  clientName: string,
  projectName: string,
  todoCount: number,
  link: string
) {
  const rendered = await renderTemplate('todos_approved', 'sms', {
    clientName,
    projectName,
    todoCount: todoCount.toString(),
    link,
  });

  const message = rendered
    ? rendered.text
    : `${clientName}, your ${todoCount} task${todoCount === 1 ? '' : 's'} for ${projectName} are ready! View them: ${link}`;
  
  return sendSMS({ to: phone, message });
}

/**
 * Send to-do completed SMS to admin
 * Now uses editable template system
 */
export async function sendTodoCompletedSMS(
  phone: string,
  clientName: string,
  todoTitle: string,
  projectName: string
) {
  const rendered = await renderTemplate('todo_completed', 'sms', {
    clientName,
    todoTitle,
    projectName,
  });

  const message = rendered
    ? rendered.text
    : `✓ ${clientName} completed: "${todoTitle}" for ${projectName}`;
  
  return sendSMS({ to: phone, message });
}

/**
 * Send all to-dos complete SMS (celebration)
 * Now uses editable template system
 */
export async function sendAllTodosCompleteSMS(
  phone: string,
  clientName: string,
  projectName: string
) {
  const rendered = await renderTemplate('all_todos_complete', 'sms', {
    clientName,
    projectName,
  });

  const message = rendered
    ? rendered.text
    : `🎉 ${clientName} completed all tasks for ${projectName}! Ready to kickoff.`;
  
  return sendSMS({ to: phone, message });
}

/**
 * Send project created SMS
 * Now uses editable template system
 */
export async function sendProjectCreatedSMS(
  phone: string,
  projectName: string,
  organizationName: string
) {
  const rendered = await renderTemplate('project_created', 'sms', {
    projectName,
    organizationName,
  });

  const message = rendered
    ? rendered.text
    : `New project created: ${projectName} for ${organizationName}. View details in your dashboard.`;
  
  return sendSMS({ to: phone, message });
}

/**
 * Send task assigned SMS
 * Now uses editable template system
 */
export async function sendTaskAssignedSMS(
  phone: string,
  taskTitle: string,
  projectName: string,
  dueDate?: string
) {
  const rendered = await renderTemplate('task_assigned', 'sms', {
    taskTitle,
    projectName,
    dueDate: dueDate || 'Not set',
  });

  const dueDateText = dueDate ? ` (Due: ${dueDate})` : '';
  const message = rendered
    ? rendered.text
    : `New task assigned: "${taskTitle}" for ${projectName}${dueDateText}. Check your dashboard.`;
  
  return sendSMS({ to: phone, message });
}

/**
 * Test SMS sending (for development)
 */
export async function sendTestSMS(phone: string) {
  const message = 'Test message from ClientFlow. Your SMS notifications are working correctly! 🎉';
  return sendSMS({ to: phone, message });
}
