/**
 * SMTP Email Client
 * Universal SMTP client for sending emails from any provider
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { EmailAddress } from '../email-types';

// ============================================================================
// Types
// ============================================================================

export interface SmtpConfig {
  host: string;
  port: number;
  secure?: boolean; // true for 465, false for other ports
  user: string;
  password: string;
  from?: EmailAddress;
}

export interface SendEmailOptions {
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: EmailAddress;
  inReplyTo?: string;
  references?: string[];
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
  headers?: Record<string, string>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ============================================================================
// SMTP Client Class
// ============================================================================

export class SmtpClient {
  private transporter: Transporter;
  private config: SmtpConfig;

  constructor(config: SmtpConfig) {
    this.config = config;
    
    // Create reusable transporter
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? (config.port === 465), // true for 465, false for other ports
      auth: {
        user: config.user,
        pass: config.password,
      },
      // Allow self-signed certificates
      tls: {
        rejectUnauthorized: false,
      },
      // Connection timeout
      connectionTimeout: 10000,
      // Greeting timeout
      greetingTimeout: 5000,
      // Socket timeout
      socketTimeout: 10000,
    });
  }

  /**
   * Test SMTP connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP test connection failed:', error);
      return false;
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      // Format email addresses
      const from = this.formatEmailAddress(options.from);
      const to = options.to.map((addr) => this.formatEmailAddress(addr));
      const cc = options.cc?.map((addr) => this.formatEmailAddress(addr));
      const bcc = options.bcc?.map((addr) => this.formatEmailAddress(addr));
      const replyTo = options.replyTo ? this.formatEmailAddress(options.replyTo) : undefined;

      // Build email message
      const mailOptions: any = {
        from,
        to,
        cc,
        bcc,
        replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
        headers: options.headers || {},
      };

      // Add threading headers
      if (options.inReplyTo) {
        mailOptions.inReplyTo = options.inReplyTo;
      }

      if (options.references && options.references.length > 0) {
        mailOptions.references = options.references.join(' ');
      }

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('SMTP send email error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send multiple emails (bulk)
   */
  async sendBulkEmails(emails: SendEmailOptions[]): Promise<SendEmailResult[]> {
    const results: SendEmailResult[] = [];

    for (const email of emails) {
      const result = await this.sendEmail(email);
      results.push(result);
      
      // Small delay between emails to avoid rate limiting
      await this.delay(100);
    }

    return results;
  }

  /**
   * Format email address for nodemailer
   */
  private formatEmailAddress(addr: EmailAddress): string {
    if (addr.name) {
      // Escape quotes in name
      const escapedName = addr.name.replace(/"/g, '\\"');
      return `"${escapedName}" <${addr.email}>`;
    }
    return addr.email;
  }

  /**
   * Close SMTP connection
   */
  close(): void {
    this.transporter.close();
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get SMTP settings for common providers
 */
export function getSmtpSettings(emailDomain: string): {
  host: string;
  port: number;
  secure: boolean;
} | null {
  const domain = emailDomain.toLowerCase();

  const providers: Record<string, any> = {
    'gmail.com': {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
    },
    'yahoo.com': {
      host: 'smtp.mail.yahoo.com',
      port: 587,
      secure: false,
    },
    'outlook.com': {
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
    },
    'hotmail.com': {
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
    },
    'aol.com': {
      host: 'smtp.aol.com',
      port: 587,
      secure: false,
    },
    'icloud.com': {
      host: 'smtp.mail.me.com',
      port: 587,
      secure: false,
    },
  };

  // Check exact match
  if (providers[domain]) {
    return providers[domain];
  }

  // Try common pattern
  return {
    host: `smtp.${domain}`,
    port: 587,
    secure: false,
  };
}

/**
 * Create HTML email body from text
 */
export function textToHtml(text: string): string {
  // Convert plain text to simple HTML
  return text
    .split('\n\n')
    .map((paragraph) => {
      const escaped = paragraph
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      
      return `<p>${escaped.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
}

/**
 * Create email signature HTML
 */
export function createSignatureHtml(signature: string): string {
  return `
<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
  ${signature}
</div>
  `.trim();
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Extract domain from email address
 */
export function extractDomain(email: string): string {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : '';
}

/**
 * Build reply email with quote
 */
export function buildReplyText(
  originalText: string,
  originalFrom: EmailAddress,
  originalDate: Date
): string {
  const fromName = originalFrom.name || originalFrom.email;
  const dateStr = originalDate.toLocaleString();
  
  const quotedText = originalText
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');

  return `\n\nOn ${dateStr}, ${fromName} wrote:\n${quotedText}`;
}

/**
 * Build reply email HTML with quote
 */
export function buildReplyHtml(
  originalHtml: string,
  originalFrom: EmailAddress,
  originalDate: Date
): string {
  const fromName = originalFrom.name || originalFrom.email;
  const dateStr = originalDate.toLocaleString();

  return `
<br><br>
<div style="border-left: 3px solid #ccc; padding-left: 15px; margin-left: 0;">
  <p style="color: #666; font-size: 0.9em;">
    On ${dateStr}, ${fromName} wrote:
  </p>
  ${originalHtml}
</div>
  `.trim();
}





