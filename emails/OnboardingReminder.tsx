/**
 * Onboarding Reminder Email Template
 */

import * as React from 'react';
import EmailLayout from './components/EmailLayout';

interface OnboardingReminderProps {
  clientName: string;
  agencyName: string;
  onboardingUrl: string;
  projectName?: string;
  daysRemaining?: number;
}

export default function OnboardingReminder({
  clientName,
  agencyName,
  onboardingUrl,
  projectName,
  daysRemaining,
}: OnboardingReminderProps) {
  return (
    <EmailLayout previewText="Reminder: Complete your onboarding">
      <h2 style={heading}>Friendly Reminder</h2>
      <p style={paragraph}>Hi {clientName},</p>
      <p style={paragraph}>
        We noticed you haven't completed your onboarding yet{projectName ? ` for ${projectName}` : ''}.
        {daysRemaining && ` Your onboarding link will expire in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}.`}
      </p>
      <p style={paragraph}>
        Completing the onboarding process will help us deliver better results and ensure we have all the information we need to get started on your project.
      </p>
      
      <table style={buttonContainer} cellPadding="0" cellSpacing="0" border={0}>
        <tbody>
          <tr>
            <td>
              <a href={onboardingUrl} style={button}>
                Complete Onboarding Now
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      <p style={paragraph}>
        It only takes a few minutes, and you can save your progress and return later if needed.
      </p>
      
      <p style={paragraph}>
        If you're experiencing any issues or have questions, please don't hesitate to reach out.
      </p>
      
      <p style={paragraph}>
        Best regards,
        <br />
        The {agencyName} Team
      </p>
    </EmailLayout>
  );
}

// Styles
const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  marginBottom: '16px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '16px',
};

const buttonContainer = {
  margin: '32px 0',
  width: '100%',
};

const button = {
  backgroundColor: '#0066FF',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};