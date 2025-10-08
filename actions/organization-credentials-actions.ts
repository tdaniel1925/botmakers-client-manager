"use server";

import { validateRequest } from "@/lib/auth/validate-request";
import {
  getOrganizationCredentials,
  upsertOrganizationCredentials,
  deleteOrganizationCredentials,
} from "@/db/queries/organization-credentials-queries";
import { encryptCredential, maskCredential } from "@/lib/credential-encryption";
import {
  testTwilioCredentials,
  testResendCredentials,
} from "@/lib/messaging/credential-validator";
import { getOrganizationById } from "@/db/queries/organizations-queries";

/**
 * Gets organization messaging credentials (masked for display)
 */
export async function getOrganizationCredentialsAction(organizationId: string) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "Unauthorized" };
    }

    // Check if user has access to this organization
    const org = await getOrganizationById(organizationId);
    if (!org) {
      return { error: "Organization not found" };
    }

    // TODO: Add proper organization permission check
    // For now, only allow organization members and platform admins

    const credentials = await getOrganizationCredentials(organizationId);

    if (!credentials) {
      return {
        success: true,
        data: null,
      };
    }

    // Mask sensitive data
    return {
      success: true,
      data: {
        id: credentials.id,
        organizationId: credentials.organizationId,
        
        // Twilio
        twilioAccountSid: credentials.twilioAccountSid
          ? maskCredential(credentials.twilioAccountSid, 6)
          : null,
        twilioAuthToken: credentials.twilioAuthToken ? "••••••••••••" : null,
        twilioPhoneNumber: credentials.twilioPhoneNumber,
        twilioEnabled: credentials.twilioEnabled,
        twilioVerified: credentials.twilioVerified,
        twilioLastTestedAt: credentials.twilioLastTestedAt,
        
        // Resend
        resendApiKey: credentials.resendApiKey ? "••••••••••••" : null,
        resendFromEmail: credentials.resendFromEmail,
        resendEnabled: credentials.resendEnabled,
        resendVerified: credentials.resendVerified,
        resendLastTestedAt: credentials.resendLastTestedAt,
        
        createdAt: credentials.createdAt,
        updatedAt: credentials.updatedAt,
      },
    };
  } catch (error) {
    console.error("[Organization Credentials] Get error:", error);
    return { error: "Failed to fetch credentials" };
  }
}

/**
 * Updates Twilio credentials and optionally tests them
 */
export async function updateTwilioCredentialsAction(
  organizationId: string,
  data: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    testConnection?: boolean;
  }
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "Unauthorized" };
    }

    // Check if user has access to this organization
    const org = await getOrganizationById(organizationId);
    if (!org) {
      return { error: "Organization not found" };
    }

    // TODO: Add proper organization admin check

    // Test credentials if requested
    let verified = false;
    if (data.testConnection) {
      const testResult = await testTwilioCredentials(
        data.accountSid,
        data.authToken,
        data.phoneNumber
      );

      if (!testResult.success) {
        return {
          error: testResult.error || "Twilio credentials validation failed",
          details: testResult.details,
        };
      }

      verified = true;
    }

    // Encrypt auth token
    const encryptedToken = encryptCredential(data.authToken);

    // Save credentials
    await upsertOrganizationCredentials(organizationId, {
      twilioAccountSid: data.accountSid,
      twilioAuthToken: encryptedToken,
      twilioPhoneNumber: data.phoneNumber,
      twilioEnabled: true,
      twilioVerified: verified,
      twilioLastTestedAt: verified ? new Date() : null,
    });

    return { success: true, verified };
  } catch (error) {
    console.error("[Organization Credentials] Update Twilio error:", error);
    return { error: "Failed to update Twilio credentials" };
  }
}

/**
 * Updates Resend credentials and optionally tests them
 */
export async function updateResendCredentialsAction(
  organizationId: string,
  data: {
    apiKey: string;
    fromEmail: string;
    testConnection?: boolean;
  }
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "Unauthorized" };
    }

    // Check if user has access to this organization
    const org = await getOrganizationById(organizationId);
    if (!org) {
      return { error: "Organization not found" };
    }

    // TODO: Add proper organization admin check

    // Test credentials if requested
    let verified = false;
    let warning = null;
    if (data.testConnection) {
      const testResult = await testResendCredentials(data.apiKey, data.fromEmail);

      if (!testResult.success) {
        return {
          error: testResult.error || "Resend credentials validation failed",
          details: testResult.details,
        };
      }

      if (testResult.details?.warning) {
        warning = testResult.details.warning;
      }

      verified = true;
    }

    // Encrypt API key
    const encryptedApiKey = encryptCredential(data.apiKey);

    // Save credentials
    await upsertOrganizationCredentials(organizationId, {
      resendApiKey: encryptedApiKey,
      resendFromEmail: data.fromEmail,
      resendEnabled: true,
      resendVerified: verified,
      resendLastTestedAt: verified ? new Date() : null,
    });

    return { success: true, verified, warning };
  } catch (error) {
    console.error("[Organization Credentials] Update Resend error:", error);
    return { error: "Failed to update Resend credentials" };
  }
}

/**
 * Tests existing Twilio credentials
 */
export async function testTwilioConnectionAction(organizationId: string) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const org = await getOrganizationById(organizationId);
    if (!org) {
      return { error: "Organization not found" };
    }

    const credentials = await getOrganizationCredentials(organizationId);
    if (
      !credentials?.twilioAccountSid ||
      !credentials?.twilioAuthToken ||
      !credentials?.twilioPhoneNumber
    ) {
      return { error: "Twilio credentials not configured" };
    }

    // Decrypt and test
    const { decryptCredential } = await import("@/lib/credential-encryption");
    const decryptedToken = decryptCredential(credentials.twilioAuthToken);

    const testResult = await testTwilioCredentials(
      credentials.twilioAccountSid,
      decryptedToken,
      credentials.twilioPhoneNumber
    );

    if (!testResult.success) {
      // Update verification status
      await upsertOrganizationCredentials(organizationId, {
        twilioVerified: false,
        twilioLastTestedAt: new Date(),
      });

      return {
        error: testResult.error || "Twilio connection test failed",
        details: testResult.details,
      };
    }

    // Update verification status
    await upsertOrganizationCredentials(organizationId, {
      twilioVerified: true,
      twilioLastTestedAt: new Date(),
    });

    return { success: true, details: testResult.details };
  } catch (error) {
    console.error("[Organization Credentials] Test Twilio error:", error);
    return { error: "Failed to test Twilio connection" };
  }
}

/**
 * Tests existing Resend credentials
 */
export async function testResendConnectionAction(organizationId: string) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const org = await getOrganizationById(organizationId);
    if (!org) {
      return { error: "Organization not found" };
    }

    const credentials = await getOrganizationCredentials(organizationId);
    if (!credentials?.resendApiKey || !credentials?.resendFromEmail) {
      return { error: "Resend credentials not configured" };
    }

    // Decrypt and test
    const { decryptCredential } = await import("@/lib/credential-encryption");
    const decryptedApiKey = decryptCredential(credentials.resendApiKey);

    const testResult = await testResendCredentials(
      decryptedApiKey,
      credentials.resendFromEmail
    );

    if (!testResult.success) {
      // Update verification status
      await upsertOrganizationCredentials(organizationId, {
        resendVerified: false,
        resendLastTestedAt: new Date(),
      });

      return {
        error: testResult.error || "Resend connection test failed",
        details: testResult.details,
      };
    }

    // Update verification status
    await upsertOrganizationCredentials(organizationId, {
      resendVerified: true,
      resendLastTestedAt: new Date(),
    });

    return {
      success: true,
      details: testResult.details,
      warning: testResult.details?.warning,
    };
  } catch (error) {
    console.error("[Organization Credentials] Test Resend error:", error);
    return { error: "Failed to test Resend connection" };
  }
}

/**
 * Deletes Twilio credentials and reverts to platform credentials
 */
export async function deleteTwilioCredentialsAction(organizationId: string) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const org = await getOrganizationById(organizationId);
    if (!org) {
      return { error: "Organization not found" };
    }

    // TODO: Add proper organization admin check

    await upsertOrganizationCredentials(organizationId, {
      twilioAccountSid: null,
      twilioAuthToken: null,
      twilioPhoneNumber: null,
      twilioEnabled: false,
      twilioVerified: false,
      twilioLastTestedAt: null,
    });

    return { success: true };
  } catch (error) {
    console.error("[Organization Credentials] Delete Twilio error:", error);
    return { error: "Failed to delete Twilio credentials" };
  }
}

/**
 * Deletes Resend credentials and reverts to platform credentials
 */
export async function deleteResendCredentialsAction(organizationId: string) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const org = await getOrganizationById(organizationId);
    if (!org) {
      return { error: "Organization not found" };
    }

    // TODO: Add proper organization admin check

    await upsertOrganizationCredentials(organizationId, {
      resendApiKey: null,
      resendFromEmail: null,
      resendEnabled: false,
      resendVerified: false,
      resendLastTestedAt: null,
    });

    return { success: true };
  } catch (error) {
    console.error("[Organization Credentials] Delete Resend error:", error);
    return { error: "Failed to delete Resend credentials" };
  }
}

