import twilio from "twilio";
import { Resend } from "resend";
import { getOrganizationCredentials } from "@/db/queries/organization-credentials-queries";
import { decryptCredential } from "@/lib/credential-encryption";

export interface MessagingCredentials {
  twilio: {
    client: ReturnType<typeof twilio>;
    phoneNumber: string;
  } | null;
  resend: {
    client: Resend;
    fromEmail: string;
  } | null;
  usingPlatformCredentials: {
    twilio: boolean;
    resend: boolean;
  };
}

/**
 * Gets messaging credentials for an organization
 * Returns org-specific credentials if configured and enabled,
 * otherwise falls back to platform credentials
 */
export async function getMessagingCredentials(
  organizationId: string
): Promise<MessagingCredentials> {
  const result: MessagingCredentials = {
    twilio: null,
    resend: null,
    usingPlatformCredentials: {
      twilio: true,
      resend: true,
    },
  };

  try {
    // Fetch organization credentials
    const orgCredentials = await getOrganizationCredentials(organizationId);

    // Check Twilio credentials
    if (
      orgCredentials?.twilioEnabled &&
      orgCredentials.twilioVerified &&
      orgCredentials.twilioAccountSid &&
      orgCredentials.twilioAuthToken &&
      orgCredentials.twilioPhoneNumber
    ) {
      try {
        const decryptedToken = decryptCredential(orgCredentials.twilioAuthToken);
        const twilioClient = twilio(
          orgCredentials.twilioAccountSid,
          decryptedToken
        );

        result.twilio = {
          client: twilioClient,
          phoneNumber: orgCredentials.twilioPhoneNumber,
        };
        result.usingPlatformCredentials.twilio = false;

        console.log(
          `[Credential Manager] Using organization Twilio credentials for org ${organizationId}`
        );
      } catch (error) {
        console.error(
          `[Credential Manager] Failed to decrypt org Twilio credentials:`,
          error
        );
        // Fall through to platform credentials
      }
    }

    // If org Twilio not available, use platform Twilio
    if (!result.twilio) {
      if (
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER
      ) {
        const twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        result.twilio = {
          client: twilioClient,
          phoneNumber: process.env.TWILIO_PHONE_NUMBER,
        };

        console.log(
          `[Credential Manager] Using platform Twilio credentials for org ${organizationId}`
        );
      }
    }

    // Check Resend credentials
    if (
      orgCredentials?.resendEnabled &&
      orgCredentials.resendVerified &&
      orgCredentials.resendApiKey &&
      orgCredentials.resendFromEmail
    ) {
      try {
        const decryptedApiKey = decryptCredential(orgCredentials.resendApiKey);
        const resendClient = new Resend(decryptedApiKey);

        result.resend = {
          client: resendClient,
          fromEmail: orgCredentials.resendFromEmail,
        };
        result.usingPlatformCredentials.resend = false;

        console.log(
          `[Credential Manager] Using organization Resend credentials for org ${organizationId}`
        );
      } catch (error) {
        console.error(
          `[Credential Manager] Failed to decrypt org Resend credentials:`,
          error
        );
        // Fall through to platform credentials
      }
    }

    // If org Resend not available, use platform Resend
    if (!result.resend) {
      if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
        const resendClient = new Resend(process.env.RESEND_API_KEY);

        result.resend = {
          client: resendClient,
          fromEmail: process.env.RESEND_FROM_EMAIL,
        };

        console.log(
          `[Credential Manager] Using platform Resend credentials for org ${organizationId}`
        );
      }
    }
  } catch (error) {
    console.error(
      `[Credential Manager] Error fetching credentials for org ${organizationId}:`,
      error
    );
    // Return result with whatever credentials we have (may be null)
  }

  return result;
}

/**
 * Gets only Twilio credentials for an organization
 */
export async function getTwilioCredentials(organizationId: string) {
  const credentials = await getMessagingCredentials(organizationId);
  return credentials.twilio;
}

/**
 * Gets only Resend credentials for an organization
 */
export async function getResendCredentials(organizationId: string) {
  const credentials = await getMessagingCredentials(organizationId);
  return credentials.resend;
}

