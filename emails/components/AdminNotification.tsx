/**
 * Admin Notification Email Template
 */

import * as React from 'react';
import EmailLayout from './EmailLayout';

interface AdminNotificationProps {
  adminName?: string;
  subject: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Array<{ label: string; value: string }>;
}

export default function AdminNotification({
  adminName,
  subject,
  message,
  actionUrl,
  actionLabel,
  metadata,
}: AdminNotificationProps) {
  return (
    <EmailLayout previewText={subject}>
      <h2 style={heading}>{subject}</h2>
      {adminName && <p style={paragraph}>Hi {adminName},</p>}
      <p style={paragraph}>{message}</p>
      
      {metadata && metadata.length > 0 && (
        <table style={metadataTable} cellPadding="0" cellSpacing="0">
          <tbody>
            {metadata.map((item, index) => (
              <tr key={index}>
                <td style={metadataLabel}>{item.label}:</td>
                <td style={metadataValue}>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {actionUrl && actionLabel && (
        <table style={buttonContainer} cellPadding="0" cellSpacing="0" border={0}>
          <tbody>
            <tr>
              <td>
                <a href={actionUrl} style={button}>
                  {actionLabel}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      )}
      
      <p style={paragraph}>
        This is an automated notification from ClientFlow.
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

const metadataTable = {
  width: '100%',
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  padding: '16px',
  marginBottom: '24px',
};

const metadataLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#6b7280',
  paddingRight: '16px',
  paddingBottom: '8px',
};

const metadataValue = {
  fontSize: '14px',
  color: '#374151',
  paddingBottom: '8px',
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