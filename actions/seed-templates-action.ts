'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { notificationTemplatesTable } from '@/db/schema';
import { isPlatformAdmin } from '@/db/queries/platform-queries';
import { logAudit } from '@/lib/audit-logger';

const SEED_TEMPLATES = [
  // Email Templates
  {
    name: 'Onboarding Invitation',
    type: 'email' as const,
    category: 'onboarding_invite',
    subject: '🎉 You\'re invited to get started with {{projectName}}!',
    bodyText: 'Hi {{clientName}},\n\nWe\'re excited to work with you on {{projectName}}! To get started, please complete our onboarding questionnaire.\n\nGet Started: {{link}}\n\nThis should take about 15-20 minutes. You can save and return at any time.\n\nIf you have any questions, just reply to this email.\n\nBest regards,\n{{adminName}}\n\n---\nBotmakers\n123 Main Street, Suite 100\nCity, State 12345\n\nYou\'re receiving this email because you were invited to collaborate on a project. If you believe this was sent in error, please contact us.',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onboarding Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Logo Header (White Background) -->
          <tr>
            <td style="background: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 3px solid #00ff00;">
              <img src="{{logoUrl}}" alt="{{companyName}}" style="height: 60px;" onerror="this.style.display='none'" />
            </td>
          </tr>
          
          <!-- Colored Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #00ff00 0%, #000000 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🎉 Let's Get Started!</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi <strong>{{clientName}}</strong>,</p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">We're excited to work with you on <strong style="color: #667eea;">{{projectName}}</strong>! To get started, please complete our onboarding questionnaire.</p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 35px 0;">
                <tr>
                  <td align="center">
                    <a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">Get Started →</a>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; border-radius: 6px; margin: 25px 0;">
                <tr>
                  <td>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">⏱️ <strong>Estimated time:</strong> 15-20 minutes<br>💾 You can save and return at any time</p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">If you have any questions, just reply to this email.</p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">Best regards,<br><strong>{{adminName}}</strong></p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <img src="{{logoUrl}}" alt="{{companyName}}" style="height: 30px; margin-bottom: 15px; opacity: 0.6;" onerror="this.style.display='none'" />
                    <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0 0 10px 0;"><strong>{{companyName}}</strong></p>
                    <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0 0 15px 0;">{{companyAddress}}</p>
                    
                    <!-- Social Links -->
                    <p style="font-size: 12px; color: #6b7280; margin: 15px 0;">
                      <a href="{{websiteUrl}}" style="color: #00ff00; text-decoration: none; margin: 0 8px;">🌐 Visit Website</a>
                    </p>
                    
                    <!-- CAN-SPAM Compliance -->
                    <p style="color: #9ca3af; font-size: 11px; line-height: 1.5; margin: 20px 0 10px 0;">You're receiving this email because you were invited to collaborate on a project with {{companyName}}. If you believe this was sent in error, please <a href="mailto:{{supportEmail}}" style="color: #00ff00; text-decoration: none;">contact us</a>.</p>
                    
                    <p style="color: #d1d5db; font-size: 11px; margin: 10px 0 0 0;">
                      <a href="{{unsubscribeLink}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> | 
                      <a href="https://botmakers.com/privacy" style="color: #9ca3af; text-decoration: underline;">Privacy Policy</a> | 
                      <a href="https://botmakers.com/terms" style="color: #9ca3af; text-decoration: underline;">Terms of Service</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    variables: [
      { key: 'logoUrl', label: 'Company Logo URL', example: 'https://cdn.example.com/logo.png' },
      { key: 'companyName', label: 'Company Name', example: 'Botmakers' },
      { key: 'companyAddress', label: 'Company Address', example: '123 Main St, City, State 12345' },
      { key: 'supportEmail', label: 'Support Email', example: 'support@botmakers.com' },
      { key: 'twitterUrl', label: 'Twitter URL', example: 'https://twitter.com/botmakers' },
      { key: 'linkedinUrl', label: 'LinkedIn URL', example: 'https://linkedin.com/company/botmakers' },
      { key: 'websiteUrl', label: 'Website URL', example: 'https://botmakers.com' },
      { key: 'clientName', label: 'Client Name', example: 'John Doe' },
      { key: 'projectName', label: 'Project Name', example: 'Website Redesign' },
      { key: 'link', label: 'Onboarding Link', example: 'https://app.com/onboarding/abc123' },
      { key: 'adminName', label: 'Admin Name', example: 'Jane Smith' },
      { key: 'unsubscribeLink', label: 'Unsubscribe Link', example: 'https://app.com/unsubscribe/abc123' },
    ],
    isSystem: true,
    isActive: true,
  },
  {
    name: 'Onboarding Complete',
    type: 'email' as const,
    category: 'onboarding_complete',
    subject: '✅ {{clientName}} completed onboarding for {{projectName}}',
    bodyText: 'Great news!\n\n{{clientName}} has completed the onboarding questionnaire for {{projectName}}.\n\nReview their responses here: {{link}}\n\nNext steps:\n- Review all responses\n- Generate and approve to-do lists\n- Schedule kickoff meeting\n\n---\nBotmakers\n123 Main Street, Suite 100\nCity, State 12345\n\nYou\'re receiving this email because you manage projects on Botmakers.',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onboarding Complete</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Logo Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <img src="https://i.imgur.com/YourLogoHere.png" alt="Botmakers" style="height: 50px; margin-bottom: 20px;" />
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">✅ Onboarding Complete!</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Great news! 🎉</p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"><strong>{{clientName}}</strong> has completed the onboarding questionnaire for <strong style="color: #10b981;">{{projectName}}</strong>.</p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 35px 0;">
                <tr>
                  <td align="center">
                    <a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">Review Responses →</a>
                  </td>
                </tr>
              </table>
              
              <!-- Next Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 6px; margin: 25px 0;">
                <tr>
                  <td>
                    <p style="color: #065f46; font-size: 15px; font-weight: 600; margin: 0 0 10px 0;">Next Steps:</p>
                    <ul style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Review all responses</li>
                      <li>Generate and approve to-do lists</li>
                      <li>Schedule kickoff meeting</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <img src="https://i.imgur.com/YourLogoHere.png" alt="Botmakers" style="height: 30px; margin-bottom: 15px; opacity: 0.6;" />
                    <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0 0 10px 0;"><strong>Botmakers</strong></p>
                    <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0 0 15px 0;">123 Main Street, Suite 100<br>City, State 12345</p>
                    
                    <!-- Social Links -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 15px auto;">
                      <tr>
                        <td style="padding: 0 10px;">
                          <a href="https://twitter.com/botmakers" style="color: #667eea; text-decoration: none; font-size: 12px;">Twitter</a>
                        </td>
                        <td style="padding: 0 10px; color: #d1d5db;">|</td>
                        <td style="padding: 0 10px;">
                          <a href="https://linkedin.com/company/botmakers" style="color: #667eea; text-decoration: none; font-size: 12px;">LinkedIn</a>
                        </td>
                        <td style="padding: 0 10px; color: #d1d5db;">|</td>
                        <td style="padding: 0 10px;">
                          <a href="https://botmakers.com" style="color: #667eea; text-decoration: none; font-size: 12px;">Website</a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CAN-SPAM Compliance -->
                    <p style="color: #9ca3af; font-size: 11px; line-height: 1.5; margin: 20px 0 10px 0;">You're receiving this email because you manage projects on Botmakers. If you believe this was sent in error, please <a href="mailto:support@botmakers.com" style="color: #667eea; text-decoration: none;">contact us</a>.</p>
                    
                    <p style="color: #d1d5db; font-size: 11px; margin: 10px 0 0 0;">
                      <a href="{{unsubscribeLink}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> | 
                      <a href="https://botmakers.com/privacy" style="color: #9ca3af; text-decoration: underline;">Privacy Policy</a> | 
                      <a href="https://botmakers.com/terms" style="color: #9ca3af; text-decoration: underline;">Terms of Service</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    variables: [
      { key: 'clientName', label: 'Client Name', example: 'John Doe' },
      { key: 'projectName', label: 'Project Name', example: 'Website Redesign' },
      { key: 'link', label: 'Session Link', example: 'https://app.com/platform/onboarding/abc123' },
      { key: 'unsubscribeLink', label: 'Unsubscribe Link', example: 'https://app.com/unsubscribe/abc123' },
    ],
    isSystem: true,
    isActive: true,
  },
  // SMS Templates
  {
    name: 'Onboarding Invitation',
    type: 'sms' as const,
    category: 'onboarding_invite',
    subject: null,
    bodyText: 'Hi {{clientName}}! You\'ve been invited to complete onboarding for {{projectName}}. Start here: {{link}}',
    bodyHtml: null,
    variables: [
      { key: 'clientName', label: 'Client Name', example: 'John' },
      { key: 'projectName', label: 'Project Name', example: 'Website Project' },
      { key: 'link', label: 'Link', example: 'https://app.com/onboard/abc' },
    ],
    isSystem: true,
    isActive: true,
  },
  {
    name: 'Onboarding Complete',
    type: 'sms' as const,
    category: 'onboarding_complete',
    subject: null,
    bodyText: 'Great news! {{clientName}} completed onboarding for {{projectName}}. Review now in your dashboard.',
    bodyHtml: null,
    variables: [
      { key: 'clientName', label: 'Client Name', example: 'John Doe' },
      { key: 'projectName', label: 'Project Name', example: 'Website Project' },
    ],
    isSystem: true,
    isActive: true,
  },
  
  // Organization Temporary Credentials Email
  {
    name: 'Organization Temporary Credentials',
    type: 'email' as const,
    category: 'org_credentials',
    subject: '🔐 Your temporary login credentials for {{companyName}}',
    bodyText: 'Hi {{organizationName}},\n\nYour organization has been set up successfully! Below are your temporary login credentials:\n\nUsername: {{tempUsername}}\nPassword: {{tempPassword}}\n\nLogin here: {{loginUrl}}\n\nIMPORTANT: \n- These credentials will expire on {{expiresAt}}\n- Please log in and complete your organization profile setup\n- Change your password after first login\n\nIf you have any questions, reply to this email.\n\nBest regards,\nThe Team\n\n---\n{{companyName}}\n{{companyAddress}}\n\nYou\'re receiving this email because an organization account was created for you. If you believe this was sent in error, please contact us at {{supportEmail}}.',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Organization Temporary Credentials</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Logo Header (White Background) -->
          <tr>
            <td style="background: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 3px solid #00ff00;">
              <img src="{{logoUrl}}" alt="{{companyName}}" style="height: 60px;" onerror="this.style.display='none'" />
            </td>
          </tr>
          
          <!-- Colored Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #00ff00 0%, #000000 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🔐 Welcome to Your Organization!</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi <strong>{{organizationName}}</strong>,</p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Your organization has been set up successfully! Below are your temporary login credentials to get started:</p>
              
              <!-- Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 2px solid #00ff00; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <tr>
                  <td>
                    <p style="color: #333333; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">🔑 Login Credentials:</p>
                    <p style="color: #333333; font-size: 14px; margin: 8px 0;"><strong>Username:</strong> <code style="background: #ffffff; padding: 4px 8px; border-radius: 4px; border: 1px solid #dee2e6; font-family: monospace;">{{tempUsername}}</code></p>
                    <p style="color: #333333; font-size: 14px; margin: 8px 0;"><strong>Password:</strong> <code style="background: #ffffff; padding: 4px 8px; border-radius: 4px; border: 1px solid #dee2e6; font-family: monospace;">{{tempPassword}}</code></p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 35px 0;">
                <tr>
                  <td align="center">
                    <a href="{{loginUrl}}" style="display: inline-block; background: linear-gradient(135deg, #00ff00 0%, #00cc00 100%); color: #000000; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 255, 0, 0.4);">Login Now →</a>
                  </td>
                </tr>
              </table>
              
              <!-- Important Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 6px; margin: 25px 0;">
                <tr>
                  <td>
                    <p style="color: #856404; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">⚠️ Important:</p>
                    <ul style="color: #856404; font-size: 13px; line-height: 1.6; margin: 0; padding-left: 20px;">
                      <li>These credentials will expire on <strong>{{expiresAt}}</strong></li>
                      <li>Please log in and complete your organization profile setup</li>
                      <li>Change your password immediately after first login for security</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">If you have any questions, just reply to this email.</p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">Best regards,<br><strong>The Team</strong></p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <img src="{{logoUrl}}" alt="{{companyName}}" style="height: 30px; margin-bottom: 15px; opacity: 0.6;" onerror="this.style.display='none'" />
                    <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0 0 10px 0;"><strong>{{companyName}}</strong></p>
                    <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0 0 15px 0;">{{companyAddress}}</p>
                    
                    <!-- Social Links -->
                    <p style="font-size: 12px; color: #6b7280; margin: 15px 0;">
                      <a href="{{websiteUrl}}" style="color: #00ff00; text-decoration: none; margin: 0 8px;">🌐 Visit Website</a>
                    </p>
                    
                    <!-- CAN-SPAM Compliance -->
                    <p style="color: #9ca3af; font-size: 11px; line-height: 1.5; margin: 20px 0 10px 0;">You're receiving this email because an organization account was created for you with {{companyName}}. If you believe this was sent in error, please <a href="mailto:{{supportEmail}}" style="color: #00ff00; text-decoration: none;">contact us</a>.</p>
                    
                    <p style="color: #d1d5db; font-size: 11px; margin: 10px 0 0 0;">
                      <a href="{{unsubscribeLink}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> | 
                      <a href="https://botmakers.com/privacy" style="color: #9ca3af; text-decoration: underline;">Privacy Policy</a> | 
                      <a href="https://botmakers.com/terms" style="color: #9ca3af; text-decoration: underline;">Terms of Service</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    variables: [
      { key: 'organizationName', label: 'Organization Name', example: 'Acme Corp' },
      { key: 'tempUsername', label: 'Temporary Username', example: 'org-abc123' },
      { key: 'tempPassword', label: 'Temporary Password', example: 'TempPass123!' },
      { key: 'loginUrl', label: 'Login URL', example: 'https://app.example.com/login' },
      { key: 'expiresAt', label: 'Expiration Date', example: 'October 13, 2025' },
      { key: 'companyName', label: 'Company Name', example: 'Botmakers' },
      { key: 'companyAddress', label: 'Company Address', example: '123 Main St, City, State 12345' },
      { key: 'websiteUrl', label: 'Website URL', example: 'https://botmakers.com' },
      { key: 'supportEmail', label: 'Support Email', example: 'support@botmakers.com' },
      { key: 'logoUrl', label: 'Logo URL', example: 'https://example.com/logo.png' },
      { key: 'unsubscribeLink', label: 'Unsubscribe Link', example: 'https://app.example.com/unsubscribe' },
    ],
    isSystem: true,
    isActive: true,
  },
  
  // Team Member Credentials Email
  {
    name: 'Team Member Invitation',
    type: 'email' as const,
    category: 'team_invitation',
    subject: '👥 Welcome to the team at {{organizationName}}!',
    bodyText: 'Hi there,\n\nYou\'ve been invited to join {{organizationName}}\'s team!\n\nYour login credentials:\nEmail: {{email}}\nPassword: {{tempPassword}}\n\nLogin here: {{loginUrl}}\n\nIMPORTANT: \n- Please change your password after your first login for security\n- You\'ve been assigned the role of {{role}}\n\nIf you have any questions, reply to this email.\n\nBest regards,\n{{companyName}} Team\n\n---\n{{companyName}}\n{{companyAddress}}\n\nYou\'re receiving this email because you were added as a team member. If you believe this was sent in error, please contact us at {{supportEmail}}.',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Member Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Logo Header (White Background) -->
          <tr>
            <td style="background: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 3px solid #00ff00;">
              <img src="{{logoUrl}}" alt="{{companyName}}" style="height: 60px;" onerror="this.style.display='none'" />
            </td>
          </tr>
          
          <!-- Colored Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #00ff00 0%, #000000 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">👥 Welcome to the Team!</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">You've been invited to join <strong>{{organizationName}}'s</strong> team!</p>
              
              <!-- Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 2px solid #00ff00; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <tr>
                  <td>
                    <p style="color: #333333; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">🔑 Your Login Credentials:</p>
                    <p style="color: #333333; font-size: 14px; margin: 8px 0;"><strong>Email:</strong> <code style="background: #ffffff; padding: 4px 8px; border-radius: 4px; border: 1px solid #dee2e6; font-family: monospace;">{{email}}</code></p>
                    <p style="color: #333333; font-size: 14px; margin: 8px 0;"><strong>Password:</strong> <code style="background: #ffffff; padding: 4px 8px; border-radius: 4px; border: 1px solid #dee2e6; font-family: monospace;">{{tempPassword}}</code></p>
                    <p style="color: #333333; font-size: 14px; margin: 8px 0 0 0;"><strong>Role:</strong> <span style="background: #00ff00; color: #000000; padding: 2px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase;">{{role}}</span></p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 35px 0;">
                <tr>
                  <td align="center">
                    <a href="{{loginUrl}}" style="display: inline-block; background: linear-gradient(135deg, #00ff00 0%, #00cc00 100%); color: #000000; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 255, 0, 0.4);">Login Now →</a>
                  </td>
                </tr>
              </table>
              
              <!-- Important Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 6px; margin: 25px 0;">
                <tr>
                  <td>
                    <p style="color: #856404; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">⚠️ Important:</p>
                    <p style="color: #856404; font-size: 13px; line-height: 1.6; margin: 0;">Please change your password immediately after your first login for security. Use your email address as your username.</p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">If you have any questions, just reply to this email.</p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">Best regards,<br><strong>{{companyName}} Team</strong></p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <img src="{{logoUrl}}" alt="{{companyName}}" style="height: 30px; margin-bottom: 15px; opacity: 0.6;" onerror="this.style.display='none'" />
                    <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0 0 10px 0;"><strong>{{companyName}}</strong></p>
                    <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0 0 15px 0;">{{companyAddress}}</p>
                    
                    <!-- Social Links -->
                    <p style="font-size: 12px; color: #6b7280; margin: 15px 0;">
                      <a href="{{websiteUrl}}" style="color: #00ff00; text-decoration: none; margin: 0 8px;">🌐 Visit Website</a>
                    </p>
                    
                    <!-- CAN-SPAM Compliance -->
                    <p style="color: #9ca3af; font-size: 11px; line-height: 1.5; margin: 20px 0 10px 0;">You're receiving this email because you were added as a team member to {{organizationName}}. If you believe this was sent in error, please <a href="mailto:{{supportEmail}}" style="color: #00ff00; text-decoration: none;">contact us</a>.</p>
                    
                    <p style="color: #d1d5db; font-size: 11px; margin: 10px 0 0 0;">
                      <a href="{{unsubscribeLink}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> | 
                      <a href="https://botmakers.com/privacy" style="color: #9ca3af; text-decoration: underline;">Privacy Policy</a> | 
                      <a href="https://botmakers.com/terms" style="color: #9ca3af; text-decoration: underline;">Terms of Service</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    variables: [
      { key: 'organizationName', label: 'Organization Name', example: 'Acme Corp' },
      { key: 'email', label: 'Team Member Email', example: 'john@example.com' },
      { key: 'tempPassword', label: 'Temporary Password', example: 'TempPass123!' },
      { key: 'role', label: 'Team Member Role', example: 'Member' },
      { key: 'loginUrl', label: 'Login URL', example: 'https://app.example.com/sign-in' },
      { key: 'companyName', label: 'Company Name', example: 'Botmakers' },
      { key: 'companyAddress', label: 'Company Address', example: '123 Main St, City, State 12345' },
      { key: 'websiteUrl', label: 'Website URL', example: 'https://botmakers.com' },
      { key: 'supportEmail', label: 'Support Email', example: 'support@botmakers.com' },
      { key: 'logoUrl', label: 'Logo URL', example: 'https://example.com/logo.png' },
      { key: 'unsubscribeLink', label: 'Unsubscribe Link', example: 'https://app.example.com/unsubscribe' },
    ],
    isSystem: true,
    isActive: true,
  },
];

export async function seedTemplatesAction(forceReseed = false) {
  try {
    // Check if templates already exist
    const existing = await db.select().from(notificationTemplatesTable).limit(1);
    
    if (existing.length > 0 && !forceReseed) {
      return { success: false, message: 'Templates already seeded. Delete existing templates to reseed.' };
    }

    // Delete all existing templates if reseeding
    if (forceReseed && existing.length > 0) {
      await db.delete(notificationTemplatesTable);
    }

    // Insert seed templates
    await db.insert(notificationTemplatesTable).values(SEED_TEMPLATES);

    return { success: true, message: `Seeded ${SEED_TEMPLATES.length} beautiful email templates with Botmakers logo!` };
  } catch (error: any) {
    console.error('Seed error:', error);
    return { success: false, message: error.message };
  }
}

// Action to clear all templates (admin only)
export async function clearTemplatesAction() {
  try {
    // ✅ FIX BUG-003: Add authentication and authorization checks
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: 'Unauthorized - Authentication required' };
    }

    // Verify platform admin access
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return { success: false, message: 'Forbidden - Platform admin access required' };
    }

    await db.delete(notificationTemplatesTable);
    
    // Log this critical action for audit trail
    await logAudit({
      action: 'templates_cleared',
      entityType: 'notification_templates',
      entityId: undefined,
      changes: { operation: 'delete_all' }
    });
    
    return { success: true, message: 'All templates cleared' };
  } catch (error: any) {
    console.error('Clear error:', error);
    return { success: false, message: error.message };
  }
}
