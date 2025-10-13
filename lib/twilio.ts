/**
 * Twilio SMS Service
 * Handles sending SMS messages via Twilio
 */

import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: twilio.Twilio | null = null;

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

export interface SendSmsOptions {
  to: string;
  message: string;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an SMS message
 */
export async function sendSms(options: SendSmsOptions): Promise<SmsResult> {
  try {
    if (!twilioClient) {
      console.error('Twilio client not initialized. Check environment variables.');
      return {
        success: false,
        error: 'SMS service not configured',
      };
    }

    if (!twilioPhoneNumber) {
      console.error('TWILIO_PHONE_NUMBER not set in environment variables');
      return {
        success: false,
        error: 'SMS service phone number not configured',
      };
    }

    const message = await twilioClient.messages.create({
      body: options.message,
      from: twilioPhoneNumber,
      to: options.to,
    });

    console.log(`SMS sent successfully: ${message.sid}`);

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    console.error('Twilio SMS error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    };
  }
}

/**
 * Send SMS verification code
 */
export async function sendVerificationSms(phoneNumber: string, code: string): Promise<SmsResult> {
  const message = `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this message.`;

  return sendSms({
    to: phoneNumber,
    message,
  });
}

/**
 * Send reminder SMS
 */
export async function sendReminderSms(
  phoneNumber: string,
  title: string,
  description?: string
): Promise<SmsResult> {
  let message = `📧 Reminder: ${title}`;
  
  if (description) {
    message += `\n\n${description}`;
  }

  return sendSms({
    to: phoneNumber,
    message,
  });
}

/**
 * Check if Twilio is configured
 */
export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && twilioPhoneNumber);
}

/**
 * Get Twilio configuration status
 */
export function getTwilioStatus() {
  return {
    configured: isTwilioConfigured(),
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
    hasPhoneNumber: !!twilioPhoneNumber,
  };
}


