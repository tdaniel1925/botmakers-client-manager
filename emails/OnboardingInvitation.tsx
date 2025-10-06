/**
 * Onboarding Invitation Email Template
 */

import * as React from 'react';
import EmailLayout from './components/EmailLayout';

interface OnboardingInvitationProps {
  clientName: string;
  agencyName: string;
  onboardingUrl: string;
  projectName?: string;
}

export default function OnboardingInvitation({
  clientName,
  agencyName,
  onboardingUrl,
  projectName,
}: OnboardingInvitationProps) {
  return (
    <EmailLayout previewText={`Complete your onboarding for ${projectName || 'your project'}`}>
      <h2 style={heading}>Welcome to {agencyName}!</h2>
      <p style={paragraph}>Hi {clientName},</p>
      <p style={paragraph}>
        We're excited to start working with you{projectName ? ` on ${projectName}` : ''}! To ensure we have all the information needed to deliver exceptional results, we've prepared a brief onboarding form.
      </p>
      <p style={paragraph}>
        This will only take a few minutes and will help us understand your goals, preferences, and requirements better.
      </p>
      
      <table style={buttonContainer} cellPadding="0" cellSpacing="0" border={0}>
        <tbody>
          <tr>
            <td>
              <a href={onboardingUrl} style={button}>
                Start Onboarding
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      <hr style={divider} />
      
      <p style={paragraph}>
        <strong>What to expect:</strong>
      </p>
      <ul style={list}>
        <li style={listItem}>Answer a few quick questions about your business and goals</li>
        <li style={listItem}>Upload any relevant files or documents</li>
        <li style={listItem}>Review and confirm project details</li>
      </ul>
      
      <p style={paragraph}>
        If you have any questions, feel free to reply to this email. We're here to help!
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

const divider = {
  borderColor: '#e6ebf1',
  borderStyle: 'solid',
  borderWidth: '1px 0 0 0',
  margin: '32px 0',
};

const list = {
  paddingLeft: '20px',
  marginBottom: '16px',
};

const listItem = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '8px',
};