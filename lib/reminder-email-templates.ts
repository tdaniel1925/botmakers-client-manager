/**
 * Reminder Email Templates
 * Generates HTML email content for onboarding reminders
 */

import { formatReminderType } from "./reminder-scheduler";

interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

interface SessionData {
  id: string;
  accessToken: string;
  projectName: string;
  organizationName: string;
  completionPercentage: number;
  currentStep: number;
  totalSteps: number;
  createdAt: Date;
  expiresAt: Date | null;
}

/**
 * Get onboarding URL for a session
 */
function getOnboardingUrl(accessToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/onboarding/${accessToken}`;
}

/**
 * Calculate days remaining until expiration
 */
function getDaysRemaining(expiresAt: Date | null): number {
  if (!expiresAt) return 30;
  const now = new Date();
  const diffTime = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Build gentle reminder email (Day 2)
 */
export function buildGentleReminderEmail(
  session: SessionData,
  recipientName: string = "there"
): EmailTemplate {
  const onboardingUrl = getOnboardingUrl(session.accessToken);
  const daysRemaining = getDaysRemaining(session.expiresAt);

  const subject = `Quick reminder: Your ${session.projectName} onboarding awaits`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">👋 Quick Reminder</h1>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${recipientName},</p>
    
    <p style="font-size: 16px;">We noticed you started the onboarding for <strong>${session.projectName}</strong> but haven't finished yet.</p>
    
    ${session.completionPercentage > 0 ? `
      <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">Your Progress:</p>
        <div style="background: #e5e7eb; border-radius: 10px; height: 20px; margin-top: 8px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; width: ${session.completionPercentage}%; transition: width 0.3s ease;"></div>
        </div>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">${session.completionPercentage}% Complete (Step ${session.currentStep} of ${session.totalSteps})</p>
      </div>
    ` : ''}
    
    <p style="font-size: 16px;">It only takes a few more minutes to complete. Let's get your project started! 🚀</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${onboardingUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Continue Onboarding</a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
      <strong>Note:</strong> This link expires in ${daysRemaining} days. Complete your onboarding before it expires!
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>Need help? Reply to this email and we'll get back to you right away.</p>
  </div>
</body>
</html>
  `.trim();

  const textBody = `
Hi ${recipientName},

We noticed you started the onboarding for ${session.projectName} but haven't finished yet.

${session.completionPercentage > 0 ? `Your Progress: ${session.completionPercentage}% Complete (Step ${session.currentStep} of ${session.totalSteps})` : ''}

It only takes a few more minutes to complete. Let's get your project started!

Continue Onboarding: ${onboardingUrl}

Note: This link expires in ${daysRemaining} days.

Need help? Reply to this email and we'll get back to you right away.
  `.trim();

  return { subject, htmlBody, textBody };
}

/**
 * Build encouragement email (Day 5)
 */
export function buildEncouragementEmail(
  session: SessionData,
  recipientName: string = "there"
): EmailTemplate {
  const onboardingUrl = getOnboardingUrl(session.accessToken);
  const daysRemaining = getDaysRemaining(session.expiresAt);

  const subject = `Need help with your ${session.projectName} onboarding?`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">💜 We're Here to Help</h1>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${recipientName},</p>
    
    <p style="font-size: 16px;">We wanted to check in on your onboarding for <strong>${session.projectName}</strong>.</p>
    
    <p style="font-size: 16px;">Completing your onboarding helps us:</p>
    <ul style="font-size: 16px; padding-left: 20px;">
      <li>Understand your exact requirements</li>
      <li>Start your project faster</li>
      <li>Deliver exactly what you need</li>
      <li>Avoid back-and-forth delays</li>
    </ul>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #78350f;"><strong>Stuck on something?</strong> Reply to this email and we'll help you through it. We can even hop on a quick call if that's easier!</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${onboardingUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Complete Onboarding Now</a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
      <strong>Expires in ${daysRemaining} days.</strong> Don't miss out on getting your project started!
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>Questions? Just hit reply – we're here to help! 💬</p>
  </div>
</body>
</html>
  `.trim();

  const textBody = `
Hi ${recipientName},

We wanted to check in on your onboarding for ${session.projectName}.

Completing your onboarding helps us:
• Understand your exact requirements
• Start your project faster
• Deliver exactly what you need
• Avoid back-and-forth delays

Stuck on something? Reply to this email and we'll help you through it. We can even hop on a quick call if that's easier!

Complete Onboarding Now: ${onboardingUrl}

Expires in ${daysRemaining} days. Don't miss out!

Questions? Just hit reply – we're here to help!
  `.trim();

  return { subject, htmlBody, textBody };
}

/**
 * Build final reminder email (Day 7)
 */
export function buildFinalReminderEmail(
  session: SessionData,
  recipientName: string = "there"
): EmailTemplate {
  const onboardingUrl = getOnboardingUrl(session.accessToken);
  const daysRemaining = getDaysRemaining(session.expiresAt);

  const subject = `⏰ Final reminder: Complete your ${session.projectName} onboarding`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Final Reminder</h1>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${recipientName},</p>
    
    <p style="font-size: 16px;">This is our final reminder about your onboarding for <strong>${session.projectName}</strong>.</p>
    
    <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 16px; color: #7f1d1d;"><strong>⚠️ Your onboarding link expires in ${daysRemaining} days!</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #991b1b;">After it expires, you'll need to request a new invitation to continue.</p>
    </div>
    
    <p style="font-size: 16px;">We're excited to start working on your project, but we need your input first!</p>
    
    <p style="font-size: 16px; font-weight: 600;">⏱️ Takes only ${20 - Math.floor(session.completionPercentage / 5)} more minutes to complete.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${onboardingUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Complete Now - Before It Expires</a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
      <strong>Having trouble?</strong> Hit reply and we'll personally help you through it.
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>This is our last reminder. We hope to hear from you soon! 🙏</p>
  </div>
</body>
</html>
  `.trim();

  const textBody = `
Hi ${recipientName},

This is our final reminder about your onboarding for ${session.projectName}.

⚠️ YOUR ONBOARDING LINK EXPIRES IN ${daysRemaining} DAYS!

After it expires, you'll need to request a new invitation to continue.

We're excited to start working on your project, but we need your input first!

⏱️ Takes only ${20 - Math.floor(session.completionPercentage / 5)} more minutes to complete.

Complete Now: ${onboardingUrl}

Having trouble? Hit reply and we'll personally help you through it.

This is our last reminder. We hope to hear from you soon!
  `.trim();

  return { subject, htmlBody, textBody };
}

/**
 * Build custom reminder email
 */
export function buildCustomReminderEmail(
  session: SessionData,
  recipientName: string,
  customSubject: string,
  customMessage: string
): EmailTemplate {
  const onboardingUrl = getOnboardingUrl(session.accessToken);

  const subject = customSubject;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📨 Message from Your Team</h1>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${recipientName},</p>
    
    <div style="font-size: 16px; white-space: pre-wrap;">${customMessage}</div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${onboardingUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Continue to Onboarding</a>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>Questions? Reply to this email anytime.</p>
  </div>
</body>
</html>
  `.trim();

  const textBody = `
Hi ${recipientName},

${customMessage}

Continue to Onboarding: ${onboardingUrl}

Questions? Reply to this email anytime.
  `.trim();

  return { subject, htmlBody, textBody };
}

/**
 * Get email template by reminder type
 */
export function getReminderEmailTemplate(
  type: "initial" | "gentle" | "encouragement" | "final" | "custom",
  session: SessionData,
  recipientName: string,
  customSubject?: string,
  customMessage?: string
): EmailTemplate {
  switch (type) {
    case "gentle":
      return buildGentleReminderEmail(session, recipientName);
    case "encouragement":
      return buildEncouragementEmail(session, recipientName);
    case "final":
      return buildFinalReminderEmail(session, recipientName);
    case "custom":
      if (!customSubject || !customMessage) {
        throw new Error("Custom reminder requires subject and message");
      }
      return buildCustomReminderEmail(session, recipientName, customSubject, customMessage);
    default:
      return buildGentleReminderEmail(session, recipientName);
  }
}
