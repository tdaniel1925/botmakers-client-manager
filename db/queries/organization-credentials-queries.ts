import { db } from "../db";
import { organizationMessagingCredentialsTable } from "../schema";
import { eq } from "drizzle-orm";

export async function getOrganizationCredentials(organizationId: string) {
  const [credentials] = await db
    .select()
    .from(organizationMessagingCredentialsTable)
    .where(eq(organizationMessagingCredentialsTable.organizationId, organizationId))
    .limit(1);

  return credentials || null;
}

export async function upsertOrganizationCredentials(
  organizationId: string,
  data: {
    twilioAccountSid?: string | null;
    twilioAuthToken?: string | null;
    twilioPhoneNumber?: string | null;
    twilioEnabled?: boolean;
    twilioVerified?: boolean;
    twilioLastTestedAt?: Date | null;
    resendApiKey?: string | null;
    resendFromEmail?: string | null;
    resendEnabled?: boolean;
    resendVerified?: boolean;
    resendLastTestedAt?: Date | null;
  }
) {
  const existing = await getOrganizationCredentials(organizationId);

  if (existing) {
    // Update existing record
    const [updated] = await db
      .update(organizationMessagingCredentialsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(organizationMessagingCredentialsTable.organizationId, organizationId))
      .returning();

    return updated;
  } else {
    // Insert new record
    const [inserted] = await db
      .insert(organizationMessagingCredentialsTable)
      .values({
        organizationId,
        ...data,
      })
      .returning();

    return inserted;
  }
}

export async function deleteOrganizationCredentials(organizationId: string) {
  await db
    .delete(organizationMessagingCredentialsTable)
    .where(eq(organizationMessagingCredentialsTable.organizationId, organizationId));
}

export async function updateTwilioCredentials(
  organizationId: string,
  data: {
    twilioAccountSid?: string | null;
    twilioAuthToken?: string | null;
    twilioPhoneNumber?: string | null;
    twilioEnabled?: boolean;
    twilioVerified?: boolean;
    twilioLastTestedAt?: Date | null;
  }
) {
  return upsertOrganizationCredentials(organizationId, data);
}

export async function updateResendCredentials(
  organizationId: string,
  data: {
    resendApiKey?: string | null;
    resendFromEmail?: string | null;
    resendEnabled?: boolean;
    resendVerified?: boolean;
    resendLastTestedAt?: Date | null;
  }
) {
  return upsertOrganizationCredentials(organizationId, data);
}

