/**
 * Email Service - Resend Integration
 * Central utility for sending emails throughout the app
 * Updated to use editable templates from template system
 */

import { Resend } from 'resend';
import {
  buildOnboardingInvitationEmail,
  buildOnboardingReminderEmail,
  buildOnboardingCompleteEmail,
  buildAdminNotificationEmail,
  buildTestEmail,
} from './email-html-builder';
import { renderTemplate } from './template-service';
import { getResendCredentials } from './messaging/credential-manager';

// Email configuration
const FROM_NAME = 'ClientFlow';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  organizationId?: string; // Optional: use org-specific credentials
}

/**
 * Send an email using Resend
 * If organizationId is provided, will use org-specific credentials if configured,
 * otherwise falls back to platform credentials
 */
export async function sendEmail({ to, subject, html, replyTo, organizationId }: SendEmailOptions) {
  try {
    let resendClient: Resend;
    let fromEmail: string;
    let replyToEmail: string;

    if (organizationId) {
      // Try to use organization-specific credentials
      const orgCredentials = await getResendCredentials(organizationId);
      
      if (orgCredentials) {
        resendClient = orgCredentials.client;
        fromEmail = orgCredentials.fromEmail;
        replyToEmail = replyTo || orgCredentials.fromEmail;
      } else {
        // Fall back to platform credentials
        if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
          console.error('Email service not configured for organization or platform');
          return { isSuccess: false, message: 'Email service not configured' };
        }
        resendClient = new Resend(process.env.RESEND_API_KEY);
        fromEmail = process.env.RESEND_FROM_EMAIL;
        replyToEmail = replyTo || process.env.RESEND_REPLY_TO || fromEmail;
      }
    } else {
      // Use platform credentials
      if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
        console.error('RESEND_API_KEY or RESEND_FROM_EMAIL is not set');
        return { isSuccess: false, message: 'Email service not configured - platform credentials missing' };
      }
      resendClient = new Resend(process.env.RESEND_API_KEY);
      fromEmail = process.env.RESEND_FROM_EMAIL;
      replyToEmail = replyTo || process.env.RESEND_REPLY_TO || fromEmail;
    }

    const { data, error } = await resendClient.emails.send({
      from: `${FROM_NAME} <${fromEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: replyToEmail,
    });

    if (error) {
      console.error('Email send error:', error);
      return { isSuccess: false, message: error.message };
    }

    console.log('Email sent successfully:', data?.id);
    return { isSuccess: true, message: 'Email sent successfully', data: { id: data?.id } };
  } catch (error) {
    console.error('Email send exception:', error);
    return { isSuccess: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send onboarding invitation email
 * Now uses editable template system
 */
export async function sendOnboardingInvitation({
  clientEmail,
  clientName,
  projectName,
  onboardingLink,
  estimatedMinutes,
  adminName = 'ClientFlow Team',
}: {
  clientEmail: string;
  clientName: string;
  projectName: string;
  onboardingLink: string;
  estimatedMinutes: number;
  adminName?: string;
}) {
  // Try to use template system first
  const rendered = await renderTemplate('onboarding_invite', 'email', {
    clientName,
    projectName,
    link: onboardingLink,
    adminName,
  });

  if (rendered) {
    return sendEmail({
      to: clientEmail,
      subject: rendered.subject!,
      html: rendered.html!,
    });
  }

  // Fallback to old method if template not found
  const html = buildOnboardingInvitationEmail({
    clientName,
    agencyName: 'ClientFlow',
    onboardingUrl: onboardingLink,
    projectName,
  });

  return sendEmail({
    to: clientEmail,
    subject: `Welcome to Your ${projectName} Project - Complete Your Onboarding`,
    html,
  });
}

/**
 * Send onboarding reminder email
 */
export async function sendOnboardingReminder({
  to,
  clientName,
  agencyName,
  onboardingUrl,
  projectName,
  daysRemaining,
}: {
  to: string;
  clientName: string;
  agencyName: string;
  onboardingUrl: string;
  projectName?: string;
  daysRemaining?: number;
}) {
  const html = buildOnboardingReminderEmail({
    clientName,
    agencyName,
    onboardingUrl,
    projectName,
    daysRemaining,
  });

  return sendEmail({
    to,
    subject: `Reminder: Complete Your Onboarding${projectName ? ` for ${projectName}` : ''}`,
    html,
  });
}

/**
 * Send onboarding complete email
 * Now uses editable template system
 */
export async function sendOnboardingComplete({
  to,
  clientName,
  agencyName,
  dashboardUrl,
  projectName,
  nextSteps,
}: {
  to: string;
  clientName: string;
  agencyName: string;
  dashboardUrl?: string;
  projectName?: string;
  nextSteps?: string[];
}) {
  // Try to use template system first
  const rendered = await renderTemplate('onboarding_complete', 'email', {
    clientName,
    projectName: projectName || 'Your Project',
    link: dashboardUrl || '#',
  });

  if (rendered) {
    return sendEmail({
      to,
      subject: rendered.subject!,
      html: rendered.html!,
    });
  }

  // Fallback to old method if template not found
  const html = buildOnboardingCompleteEmail({
    clientName,
    agencyName,
    dashboardUrl,
    projectName,
    nextSteps,
  });

  return sendEmail({
    to,
    subject: `Onboarding Complete${projectName ? ` - ${projectName}` : ''}!`,
    html,
  });
}

/**
 * Send notification to platform admin
 */
export async function sendPlatformAdminNotification({
  adminEmail,
  subject,
  message,
  actionUrl,
}: {
  adminEmail: string;
  subject: string;
  message: string;
  actionUrl?: string;
}) {
  const html = buildAdminNotificationEmail({ subject, message, actionUrl });

  return sendEmail({
    to: adminEmail,
    subject,
    html,
  });
}

/**
 * Test email sending (for development)
 */
export async function sendTestEmail(to: string) {
  const html = buildTestEmail();
  
  const result = await sendEmail({
    to,
    subject: 'Test Email from ClientFlow',
    html,
  });
  
  return result;
}

/**
 * Send notification to client that their to-dos are ready
 * Now uses editable template system
 */
export async function sendTodosApprovedEmail({
  clientEmail,
  clientName,
  projectName,
  todoCount,
  todosUrl,
}: {
  clientEmail: string;
  clientName: string;
  projectName: string;
  todoCount: number;
  todosUrl: string;
}) {
  // Try to use template system first
  const rendered = await renderTemplate('todos_approved', 'email', {
    clientName,
    projectName,
    todoCount: todoCount.toString(),
    link: todosUrl,
  });

  if (rendered) {
    return sendEmail({
      to: clientEmail,
      subject: rendered.subject!,
      html: rendered.html!,
    });
  }

  // Fallback to inline HTML if template not found
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎯 Your Tasks Are Ready!</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>
            
            <p>Great news! Your project team has reviewed your onboarding and prepared <strong>${todoCount} task${todoCount === 1 ? '' : 's'}</strong> for you to complete.</p>
            
            <p><strong>Project:</strong> ${projectName}</p>
            
            <p>These tasks will help us gather everything we need to get started on your project. Most can be completed in just a few minutes.</p>
            
            <div style="text-align: center;">
              <a href="${todosUrl}" class="button">View Your Tasks</a>
            </div>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <strong>What's next?</strong><br/>
              Complete your tasks at your own pace. We'll be notified as you finish each one, and we'll reach out once everything is ready!
            </p>
          </div>
          <div class="footer">
            <p>Need help? Just reply to this email!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: clientEmail,
    subject: `Your Tasks for ${projectName} Are Ready!`,
    html,
  });
}

/**
 * Send notification to admin when client completes a to-do
 * Now uses editable template system
 */
export async function sendTodoCompletedNotification({
  adminEmail,
  clientName,
  projectName,
  todoTitle,
  sessionUrl,
}: {
  adminEmail: string;
  clientName: string;
  projectName: string;
  todoTitle: string;
  sessionUrl: string;
}) {
  // Try to use template system first
  const rendered = await renderTemplate('todo_completed', 'email', {
    clientName,
    projectName,
    todoTitle,
    link: sessionUrl,
  });

  if (rendered) {
    return sendEmail({
      to: adminEmail,
      subject: rendered.subject!,
      html: rendered.html!,
    });
  }

  // Fallback to inline HTML if template not found
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .notification { background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>✅ Task Completed</h2>
          
          <div class="notification">
            <p style="margin: 0;"><strong>${clientName}</strong> completed a task:</p>
            <p style="margin: 10px 0 0 0; font-size: 16px;">"${todoTitle}"</p>
          </div>
          
          <p><strong>Project:</strong> ${projectName}</p>
          
          <a href="${sessionUrl}" class="button">View Session Details</a>
          
          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            Check the session to see what they've submitted and track overall progress.
          </p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `${clientName} completed a task - ${projectName}`,
    html,
  });
}

/**
 * Send celebration email when all to-dos are complete
 * Now uses editable template system for admin email
 */
export async function sendAllTodosCompleteEmail({
  adminEmail,
  clientEmail,
  clientName,
  projectName,
  sessionUrl,
}: {
  adminEmail: string;
  clientEmail: string;
  clientName: string;
  projectName: string;
  sessionUrl: string;
}) {
  // Email to admin - use template system
  const adminRendered = await renderTemplate('all_todos_complete', 'email', {
    clientName,
    projectName,
    link: sessionUrl,
  });

  let adminHtml: string;
  let adminSubject: string;

  if (adminRendered) {
    adminHtml = adminRendered.html!;
    adminSubject = adminRendered.subject!;
  } else {
    // Fallback to inline HTML if template not found
    adminSubject = `🎉 ${clientName} completed all tasks - ${projectName}`;
    adminHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .celebration { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="celebration">
              <h1 style="margin: 0; font-size: 48px;">🎉</h1>
              <h2 style="margin: 10px 0;">All Tasks Complete!</h2>
            </div>
            
            <p><strong>${clientName}</strong> has completed all their onboarding tasks for <strong>${projectName}</strong>!</p>
            
            <p>They're ready for the next steps. Time to kick off the project!</p>
            
            <div style="text-align: center;">
              <a href="${sessionUrl}" class="button">View Complete Session</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Email to client
  const clientHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .celebration { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 8px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="celebration">
            <h1 style="margin: 0; font-size: 64px;">🎉</h1>
            <h2 style="margin: 20px 0 10px 0;">Congratulations, ${clientName}!</h2>
            <p style="margin: 0; font-size: 18px;">You've completed all your tasks!</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border-radius: 8px; margin-top: 20px;">
            <p style="font-size: 16px;"><strong>What happens next?</strong></p>
            
            <p>Your project team has been notified and will be in touch very soon with the next steps for your project.</p>
            
            <p>Thank you for providing all the information we need to make your project a success!</p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
            <p>Questions? Just reply to this email!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Send both emails
  await Promise.all([
    sendEmail({
      to: adminEmail,
      subject: adminSubject,
      html: adminHtml,
    }),
    sendEmail({
      to: clientEmail,
      subject: `🎉 All tasks complete for ${projectName}!`,
      html: clientHtml,
    }),
  ]);

  return { isSuccess: true };
}

/**
 * Send client review notification for manual onboarding
 */
export async function sendClientReviewNotificationEmail(
  clientEmail: string,
  clientName: string,
  sessionId: string,
  accessToken: string,
  adminFilledSections: string[]
) {
  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/${accessToken}/review`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; }
          .button { 
            display: inline-block; 
            background-color: #667eea; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
            font-weight: bold;
          }
          .section-list {
            background: #f9fafb;
            border-left: 4px solid #667eea;
            padding: 15px 20px;
            margin: 20px 0;
          }
          .section-list ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .section-list li {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📋 Review Your Onboarding Information</h1>
          </div>
          
          <div style="padding: 20px 0;">
            <p>Hi ${clientName},</p>
            
            <p>We've filled out some of your project onboarding questionnaire to help speed things along and get your project started faster.</p>
            
            ${adminFilledSections.length > 0 ? `
              <div class="section-list">
                <p><strong>Sections we completed for you:</strong></p>
                <ul>
                  ${adminFilledSections.map(section => `<li>${section}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            <p><strong>What you need to do:</strong></p>
            <ol>
              <li>Review all the information we've entered</li>
              <li>Make any changes or corrections needed</li>
              <li>Complete any remaining sections</li>
              <li>Add any notes or feedback you have</li>
              <li>Click "Approve & Finalize" when you're satisfied</li>
            </ol>
            
            <div style="text-align: center;">
              <a href="${reviewUrl}" class="button">Review & Complete Onboarding →</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              <strong>💡 Tip:</strong> You can edit any information we've entered if it needs to be changed. We want to make sure everything is accurate before we proceed with your project.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
            <p>Questions? Just reply to this email and we'll be happy to help!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: clientEmail,
    subject: `Please review your project onboarding information`,
    html,
  });

  return { isSuccess: true };
}