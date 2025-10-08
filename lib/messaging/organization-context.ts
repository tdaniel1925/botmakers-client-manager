import { db } from "@/db";
import { projectsTable, voiceCampaignsTable, callRecordsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Gets organization ID from a project ID
 */
export async function getOrganizationIdFromProject(
  projectId: string
): Promise<string | null> {
  try {
    const [project] = await db
      .select({ organizationId: projectsTable.organizationId })
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .limit(1);

    return project?.organizationId || null;
  } catch (error) {
    console.error(
      `[Organization Context] Error fetching org from project ${projectId}:`,
      error
    );
    return null;
  }
}

/**
 * Gets organization ID from a campaign ID
 */
export async function getOrganizationIdFromCampaign(
  campaignId: string
): Promise<string | null> {
  try {
    const [result] = await db
      .select({ organizationId: projectsTable.organizationId })
      .from(voiceCampaignsTable)
      .innerJoin(projectsTable, eq(voiceCampaignsTable.projectId, projectsTable.id))
      .where(eq(voiceCampaignsTable.id, campaignId))
      .limit(1);

    return result?.organizationId || null;
  } catch (error) {
    console.error(
      `[Organization Context] Error fetching org from campaign ${campaignId}:`,
      error
    );
    return null;
  }
}

/**
 * Gets organization ID from a call record ID
 */
export async function getOrganizationIdFromCallRecord(
  callRecordId: string
): Promise<string | null> {
  try {
    const [result] = await db
      .select({ organizationId: projectsTable.organizationId })
      .from(callRecordsTable)
      .innerJoin(projectsTable, eq(callRecordsTable.projectId, projectsTable.id))
      .where(eq(callRecordsTable.id, callRecordId))
      .limit(1);

    return result?.organizationId || null;
  } catch (error) {
    console.error(
      `[Organization Context] Error fetching org from call record ${callRecordId}:`,
      error
    );
    return null;
  }
}

/**
 * Gets organization ID from various context types
 */
export async function getOrganizationIdFromContext(
  contextType: "project" | "campaign" | "call",
  contextId: string
): Promise<string | null> {
  switch (contextType) {
    case "project":
      return getOrganizationIdFromProject(contextId);
    case "campaign":
      return getOrganizationIdFromCampaign(contextId);
    case "call":
      return getOrganizationIdFromCallRecord(contextId);
    default:
      console.error(`[Organization Context] Unknown context type: ${contextType}`);
      return null;
  }
}

