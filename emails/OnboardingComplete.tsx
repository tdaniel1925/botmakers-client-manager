/**
 * Onboarding Complete Email Template
 */

import * as React from 'react';
import EmailLayout from './components/EmailLayout';

interface OnboardingCompleteProps {
  clientName: string;
  agencyName: string;
  dashboardUrl?: string;
  projectName?: string;
  nextSteps?: string[];
}

export default function OnboardingComplete({
  clientName,
  agencyName,
  dashboardUrl,
  projectName,
  nextSteps,
}: OnboardingCompleteProps) {
  return (
    <EmailLayout previewText="Thank you for completing your onboarding">
      <h2 style={heading}>Onboarding Complete! 🎉</h2>
      <p style={paragraph}>Hi {clientName},</p>
      <p style={paragraph}>
        Thank you for completing your onboarding{projectName ? ` for ${projectName}` : ''}! 
        We've received all your information and our team is reviewing it now.
      </p>
      <p style={paragraph}>
        We're excited to get started on your project and deliver exceptional results.
      </p>
      
      {dashboardUrl && (
        <>
          <table style={buttonContainer} cellPadding="0" cellSpacing="0" border={0}>
            <tbody>
              <tr>
                <td>
                  <a href={dashboardUrl} style={button}>
                    View Your Dashboard
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      <hr style={divider} />
      
      {nextSteps && nextSteps.length > 0 && (
        <>
          <p style={paragraph}>
            <strong>What happens next:</strong>
          </p>
          <ul style={list}>
            {nextSteps.map((step, index) => (
              <li key={index} style={listItem}>{step}</li>
            ))}
          </ul>
        </>
      )}
      
      <p style={paragraph}>
        We'll be in touch soon with the next steps. If you have any questions in the meantime, 
        feel free to reply to this email or contact our support team.
      </p>
      
      <p style={paragraph}>
        Thank you for choosing {agencyName}!
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