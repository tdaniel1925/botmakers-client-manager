/**
 * Email Layout Component
 * Shared layout for all email templates
 */

import * as React from 'react';

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

export default function EmailLayout({ children, previewText }: EmailLayoutProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      {previewText && (
        <span
          style={{
            display: 'none',
            fontSize: 1,
            color: '#ffffff',
            lineHeight: 1,
            maxHeight: 0,
            maxWidth: 0,
            opacity: 0,
            overflow: 'hidden',
          }}
        >
          {previewText}
        </span>
      )}
      <body style={main}>
        <table style={container} cellPadding="0" cellSpacing="0" border={0}>
          <tbody>
            {/* Logo/Header */}
            <tr>
              <td style={header}>
                <h1 style={logo}>ClientFlow</h1>
              </td>
            </tr>

            {/* Main Content */}
            <tr>
              <td style={content}>{children}</td>
            </tr>

            {/* Footer */}
            <tr>
              <td>
                <hr style={hr} />
              </td>
            </tr>
            <tr>
              <td style={footer}>
                <p style={footerText}>
                  You are receiving this email because you have a project with{' '}
                  <a href={process.env.NEXT_PUBLIC_APP_URL} style={link}>
                    ClientFlow
                  </a>
                  .
                </p>
                <p style={footerText}>
                  Need help? Reply to this email or{' '}
                  <a href={`${process.env.NEXT_PUBLIC_APP_URL}/support`} style={link}>
                    contact support
                  </a>
                  .
                </p>
                <p style={footerTextSmall}>
                  © {new Date().getFullYear()} ClientFlow. All rights reserved.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '0',
  margin: '0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
  width: '100%',
};

const header = {
  padding: '32px 48px 24px',
  textAlign: 'center' as const,
};

const logo = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#0066FF',
  margin: '0',
};

const content = {
  padding: '0 48px',
};

const hr = {
  borderColor: '#e6ebf1',
  borderStyle: 'solid',
  borderWidth: '1px 0 0 0',
  margin: '32px 0',
};

const footer = {
  padding: '0 48px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '12px',
};

const footerTextSmall = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};

const link = {
  color: '#0066FF',
  textDecoration: 'none',
};