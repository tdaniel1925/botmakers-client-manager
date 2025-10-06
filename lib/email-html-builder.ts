/**
 * Email HTML Builder
 * Simple utility to build email HTML without react-dom/server
 */

export function buildEmailLayout(content: string, previewText?: string): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="background-color: #f6f9fc; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif; padding: 0; margin: 0;">
    ${previewText ? `<span style="display: none; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;">${previewText}</span>` : ''}
    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; margin-bottom: 64px; max-width: 600px; width: 100%;">
      <tbody>
        <tr>
          <td style="padding: 32px 48px 24px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: bold; color: #0066FF; margin: 0;">ClientFlow</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 48px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td>
            <hr style="border-color: #e6ebf1; border-style: solid; border-width: 1px 0 0 0; margin: 32px 0;" />
          </td>
        </tr>
        <tr>
          <td style="padding: 0 48px;">
            <p style="color: #8898aa; font-size: 14px; line-height: 20px; margin-bottom: 12px;">
              You are receiving this email because you have a project with <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}" style="color: #0066FF; text-decoration: none;">ClientFlow</a>.
            </p>
            <p style="color: #8898aa; font-size: 14px; line-height: 20px; margin-bottom: 12px;">
              Need help? Reply to this email or <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}/support" style="color: #0066FF; text-decoration: none;">contact support</a>.
            </p>
            <p style="color: #8898aa; font-size: 12px; line-height: 16px;">
              © ${new Date().getFullYear()} ClientFlow. All rights reserved.
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
}

export function buildOnboardingInvitationEmail({
  clientName,
  agencyName,
  onboardingUrl,
  projectName,
}: {
  clientName: string;
  agencyName: string;
  onboardingUrl: string;
  projectName?: string;
}): string {
  const content = `
    <h2 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 16px;">Welcome to ${agencyName}!</h2>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">Hi ${clientName},</p>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      We're excited to start working with you${projectName ? ` on ${projectName}` : ''}! To ensure we have all the information needed to deliver exceptional results, we've prepared a brief onboarding form.
    </p>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      This will only take a few minutes and will help us understand your goals, preferences, and requirements better.
    </p>
    <table style="margin: 32px 0; width: 100%;" cellpadding="0" cellspacing="0" border="0">
      <tbody>
        <tr>
          <td>
            <a href="${onboardingUrl}" style="background-color: #0066FF; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; display: inline-block; padding: 14px 32px;">
              Start Onboarding
            </a>
          </td>
        </tr>
      </tbody>
    </table>
    <hr style="border-color: #e6ebf1; border-style: solid; border-width: 1px 0 0 0; margin: 32px 0;" />
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      <strong>What to expect:</strong>
    </p>
    <ul style="padding-left: 20px; margin-bottom: 16px;">
      <li style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 8px;">Answer a few quick questions about your business and goals</li>
      <li style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 8px;">Upload any relevant files or documents</li>
      <li style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 8px;">Review and confirm project details</li>
    </ul>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      If you have any questions, feel free to reply to this email. We're here to help!
    </p>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      Best regards,<br />
      The ${agencyName} Team
    </p>
  `;

  return buildEmailLayout(content, `Complete your onboarding for ${projectName || 'your project'}`);
}

export function buildOnboardingReminderEmail({
  clientName,
  agencyName,
  onboardingUrl,
  projectName,
  daysRemaining,
}: {
  clientName: string;
  agencyName: string;
  onboardingUrl: string;
  projectName?: string;
  daysRemaining?: number;
}): string {
  const content = `
    <h2 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 16px;">Friendly Reminder</h2>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">Hi ${clientName},</p>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      We noticed you haven't completed your onboarding yet${projectName ? ` for ${projectName}` : ''}.
      ${daysRemaining ? ` Your onboarding link will expire in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}.` : ''}
    </p>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      Completing the onboarding process will help us deliver better results and ensure we have all the information we need to get started on your project.
    </p>
    <table style="margin: 32px 0; width: 100%;" cellpadding="0" cellspacing="0" border="0">
      <tbody>
        <tr>
          <td>
            <a href="${onboardingUrl}" style="background-color: #0066FF; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; display: inline-block; padding: 14px 32px;">
              Complete Onboarding Now
            </a>
          </td>
        </tr>
      </tbody>
    </table>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      It only takes a few minutes, and you can save your progress and return later if needed.
    </p>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      If you're experiencing any issues or have questions, please don't hesitate to reach out.
    </p>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      Best regards,<br />
      The ${agencyName} Team
    </p>
  `;

  return buildEmailLayout(content, 'Reminder: Complete your onboarding');
}

export function buildOnboardingCompleteEmail({
  clientName,
  agencyName,
  dashboardUrl,
  projectName,
  nextSteps,
}: {
  clientName: string;
  agencyName: string;
  dashboardUrl?: string;
  projectName?: string;
  nextSteps?: string[];
}): string {
  const content = `
    <h2 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 16px;">Onboarding Complete! 🎉</h2>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">Hi ${clientName},</p>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      Thank you for completing your onboarding${projectName ? ` for ${projectName}` : ''}! 
      We've received all your information and our team is reviewing it now.
    </p>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      We're excited to get started on your project and deliver exceptional results.
    </p>
    ${dashboardUrl ? `
    <table style="margin: 32px 0; width: 100%;" cellpadding="0" cellspacing="0" border="0">
      <tbody>
        <tr>
          <td>
            <a href="${dashboardUrl}" style="background-color: #0066FF; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; display: inline-block; padding: 14px 32px;">
              View Your Dashboard
            </a>
          </td>
        </tr>
      </tbody>
    </table>
    ` : ''}
    <hr style="border-color: #e6ebf1; border-style: solid; border-width: 1px 0 0 0; margin: 32px 0;" />
    ${nextSteps && nextSteps.length > 0 ? `
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      <strong>What happens next:</strong>
    </p>
    <ul style="padding-left: 20px; margin-bottom: 16px;">
      ${nextSteps.map(step => `<li style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 8px;">${step}</li>`).join('')}
    </ul>
    ` : ''}
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      We'll be in touch soon with the next steps. If you have any questions in the meantime, 
      feel free to reply to this email or contact our support team.
    </p>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      Thank you for choosing ${agencyName}!
    </p>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      Best regards,<br />
      The ${agencyName} Team
    </p>
  `;

  return buildEmailLayout(content, 'Thank you for completing your onboarding');
}

export function buildAdminNotificationEmail({
  adminName,
  subject,
  message,
  actionUrl,
  actionLabel,
  metadata,
}: {
  adminName?: string;
  subject: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Array<{ label: string; value: string }>;
}): string {
  const content = `
    <h2 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 16px;">${subject}</h2>
    ${adminName ? `<p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">Hi ${adminName},</p>` : ''}
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">${message}</p>
    ${metadata && metadata.length > 0 ? `
    <table style="width: 100%; background-color: #f8f9fa; border-radius: 6px; padding: 16px; margin-bottom: 24px;" cellpadding="0" cellspacing="0">
      <tbody>
        ${metadata.map(item => `
        <tr>
          <td style="font-size: 14px; font-weight: bold; color: #6b7280; padding-right: 16px; padding-bottom: 8px;">${item.label}:</td>
          <td style="font-size: 14px; color: #374151; padding-bottom: 8px;">${item.value}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}
    ${actionUrl && actionLabel ? `
    <table style="margin: 32px 0; width: 100%;" cellpadding="0" cellspacing="0" border="0">
      <tbody>
        <tr>
          <td>
            <a href="${actionUrl}" style="background-color: #0066FF; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; display: inline-block; padding: 14px 32px;">
              ${actionLabel}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
    ` : ''}
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      This is an automated notification from ClientFlow.
    </p>
  `;

  return buildEmailLayout(content, subject);
}

export function buildTestEmail(): string {
  const content = `
    <h1 style="font-size: 32px; font-weight: bold; color: #1a1a1a; margin-bottom: 16px;">Test Email</h1>
    <p style="font-size: 16px; line-height: 24px; color: #374151; margin-bottom: 16px;">
      If you are seeing this, email sending is working!
    </p>
    <p style="font-size: 14px; line-height: 20px; color: #6b7280;">
      This is a test email from the ClientFlow email service.
    </p>
  `;

  return buildEmailLayout(content, 'Test Email from ClientFlow');
}
