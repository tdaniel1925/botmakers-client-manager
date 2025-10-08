import twilio from "twilio";
import { Resend } from "resend";

export interface ValidationResult {
  success: boolean;
  error?: string;
  details?: any;
}

/**
 * Tests Twilio credentials by attempting to fetch account information
 */
export async function testTwilioCredentials(
  accountSid: string,
  authToken: string,
  phoneNumber?: string
): Promise<ValidationResult> {
  try {
    if (!accountSid || !authToken) {
      return {
        success: false,
        error: "Account SID and Auth Token are required",
      };
    }

    // Validate format
    if (!accountSid.startsWith("AC")) {
      return {
        success: false,
        error: "Invalid Account SID format (should start with 'AC')",
      };
    }

    // Create client and test credentials
    const client = twilio(accountSid, authToken);

    // Fetch account to verify credentials
    const account = await client.api.v2010.accounts(accountSid).fetch();

    if (account.status === "suspended") {
      return {
        success: false,
        error: "Twilio account is suspended",
        details: { accountStatus: account.status },
      };
    }

    // If phone number provided, verify it exists and is owned by this account
    if (phoneNumber) {
      try {
        const formattedNumber = phoneNumber.startsWith("+")
          ? phoneNumber
          : `+${phoneNumber}`;

        const incomingNumber = await client.incomingPhoneNumbers
          .list({ phoneNumber: formattedNumber, limit: 1 });

        if (incomingNumber.length === 0) {
          return {
            success: false,
            error: "Phone number not found in this Twilio account",
            details: { phoneNumber: formattedNumber },
          };
        }

        // Check if number has SMS capability
        const number = incomingNumber[0];
        if (!number.capabilities.sms) {
          return {
            success: false,
            error: "Phone number does not have SMS capability",
            details: { phoneNumber: formattedNumber },
          };
        }
      } catch (phoneError) {
        return {
          success: false,
          error: `Failed to verify phone number: ${phoneError instanceof Error ? phoneError.message : "Unknown error"}`,
        };
      }
    }

    return {
      success: true,
      details: {
        accountSid: account.sid,
        accountName: account.friendlyName,
        accountStatus: account.status,
      },
    };
  } catch (error: any) {
    console.error("[Twilio Validation] Error:", error);

    // Parse Twilio-specific errors
    if (error.status === 401) {
      return {
        success: false,
        error: "Invalid Twilio credentials (authentication failed)",
      };
    }

    if (error.status === 403) {
      return {
        success: false,
        error: "Insufficient permissions for this Twilio account",
      };
    }

    return {
      success: false,
      error: `Twilio validation failed: ${error.message || "Unknown error"}`,
    };
  }
}

/**
 * Tests Resend credentials by attempting to send a test request
 */
export async function testResendCredentials(
  apiKey: string,
  fromEmail: string
): Promise<ValidationResult> {
  try {
    if (!apiKey || !fromEmail) {
      return {
        success: false,
        error: "API Key and From Email are required",
      };
    }

    // Validate API key format
    if (!apiKey.startsWith("re_")) {
      return {
        success: false,
        error: "Invalid Resend API key format (should start with 're_')",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fromEmail)) {
      return {
        success: false,
        error: "Invalid email address format",
      };
    }

    // Create Resend client
    const resend = new Resend(apiKey);

    // Test the API key by fetching API keys list
    // Note: Resend doesn't have a direct "test" endpoint, so we use a lightweight operation
    try {
      // Attempt to list domains (minimal API call)
      const { data, error } = await resend.domains.list();

      if (error) {
        return {
          success: false,
          error: `Resend API error: ${error.message || "Unknown error"}`,
        };
      }

      // Verify the from email domain is configured in Resend
      const fromDomain = fromEmail.split("@")[1];
      const domains = data || [];
      
      const domainConfigured = domains.some(
        (d: any) => d.name === fromDomain && d.status === "verified"
      );

      if (domains.length > 0 && !domainConfigured) {
        return {
          success: true,
          details: {
            warning: `Domain '${fromDomain}' is not verified in Resend. You may not be able to send emails from this address.`,
            configuredDomains: domains.map((d: any) => d.name),
          },
        };
      }

      return {
        success: true,
        details: {
          fromEmail,
          domainsConfigured: domains.length,
        },
      };
    } catch (apiError: any) {
      // Check for authentication errors
      if (apiError.statusCode === 401 || apiError.statusCode === 403) {
        return {
          success: false,
          error: "Invalid Resend API key (authentication failed)",
        };
      }

      return {
        success: false,
        error: `Resend API error: ${apiError.message || "Unknown error"}`,
      };
    }
  } catch (error: any) {
    console.error("[Resend Validation] Error:", error);

    return {
      success: false,
      error: `Resend validation failed: ${error.message || "Unknown error"}`,
    };
  }
}

