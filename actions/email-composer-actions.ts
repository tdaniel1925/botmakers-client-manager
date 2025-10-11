"use server";

import { db } from "@/db/db";
import { emailDraftsTable, emailDraftVersionsTable, emailsTable } from "@/db/schema/email-schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ============================================================================
// Draft Management
// ============================================================================

export async function saveDraft(data: {
  id?: string;
  userId: string;
  accountId: string;
  toAddresses: { name?: string; email: string }[];
  ccAddresses?: { name?: string; email: string }[];
  bccAddresses?: { name?: string; email: string }[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
  changeType?: string;
  aiPrompt?: string;
}) {
  try {
    let draftId = data.id;
    let versionNumber = 1;

    if (draftId) {
      // Update existing draft
      await db
        .update(emailDraftsTable)
        .set({
          toAddresses: data.toAddresses,
          ccAddresses: data.ccAddresses || [],
          bccAddresses: data.bccAddresses || [],
          subject: data.subject,
          bodyText: data.bodyText,
          bodyHtml: data.bodyHtml,
          updatedAt: new Date(),
        })
        .where(eq(emailDraftsTable.id, draftId));

      // Get current version number
      const versions = await db
        .select({ versionNumber: emailDraftVersionsTable.versionNumber })
        .from(emailDraftVersionsTable)
        .where(eq(emailDraftVersionsTable.draftId, draftId))
        .orderBy(desc(emailDraftVersionsTable.versionNumber))
        .limit(1);

      versionNumber = (versions[0]?.versionNumber || 0) + 1;
    } else {
      // Create new draft
      const [newDraft] = await db
        .insert(emailDraftsTable)
        .values({
          userId: data.userId,
          accountId: data.accountId,
          toAddresses: data.toAddresses,
          ccAddresses: data.ccAddresses || [],
          bccAddresses: data.bccAddresses || [],
          subject: data.subject,
          bodyText: data.bodyText,
          bodyHtml: data.bodyHtml,
          threadId: data.threadId,
          inReplyTo: data.inReplyTo,
          references: data.references || [],
          isSent: false,
        })
        .returning();

      draftId = newDraft.id;
    }

    // Save version history
    await db.insert(emailDraftVersionsTable).values({
      draftId,
      versionNumber,
      toAddresses: data.toAddresses,
      subject: data.subject,
      bodyText: data.bodyText,
      bodyHtml: data.bodyHtml,
      changeType: data.changeType || "manual",
      aiPrompt: data.aiPrompt,
    });

    revalidatePath("/dashboard/emails");
    revalidatePath("/platform/emails");

    return { success: true, draftId, versionNumber };
  } catch (error) {
    console.error("Error saving draft:", error);
    return { success: false, error: "Failed to save draft" };
  }
}

export async function getDraft(draftId: string) {
  try {
    const [draft] = await db
      .select()
      .from(emailDraftsTable)
      .where(eq(emailDraftsTable.id, draftId));

    if (!draft) {
      return { success: false, error: "Draft not found" };
    }

    return { success: true, draft };
  } catch (error) {
    console.error("Error fetching draft:", error);
    return { success: false, error: "Failed to fetch draft" };
  }
}

export async function getDraftVersions(draftId: string) {
  try {
    const versions = await db
      .select()
      .from(emailDraftVersionsTable)
      .where(eq(emailDraftVersionsTable.draftId, draftId))
      .orderBy(desc(emailDraftVersionsTable.versionNumber));

    return { success: true, versions };
  } catch (error) {
    console.error("Error fetching draft versions:", error);
    return { success: false, error: "Failed to fetch versions" };
  }
}

export async function restoreDraftVersion(draftId: string, versionId: string) {
  try {
    const [version] = await db
      .select()
      .from(emailDraftVersionsTable)
      .where(eq(emailDraftVersionsTable.id, versionId));

    if (!version) {
      return { success: false, error: "Version not found" };
    }

    // Update draft with version data
    await db
      .update(emailDraftsTable)
      .set({
        toAddresses: version.toAddresses,
        subject: version.subject,
        bodyText: version.bodyText,
        bodyHtml: version.bodyHtml,
        updatedAt: new Date(),
      })
      .where(eq(emailDraftsTable.id, draftId));

    // Create new version entry for the restore
    const latestVersions = await db
      .select({ versionNumber: emailDraftVersionsTable.versionNumber })
      .from(emailDraftVersionsTable)
      .where(eq(emailDraftVersionsTable.draftId, draftId))
      .orderBy(desc(emailDraftVersionsTable.versionNumber))
      .limit(1);

    const newVersionNumber = (latestVersions[0]?.versionNumber || 0) + 1;

    await db.insert(emailDraftVersionsTable).values({
      draftId,
      versionNumber: newVersionNumber,
      toAddresses: version.toAddresses,
      subject: version.subject,
      bodyText: version.bodyText,
      bodyHtml: version.bodyHtml,
      changeType: "restore",
    });

    revalidatePath("/dashboard/emails");
    revalidatePath("/platform/emails");

    return { success: true };
  } catch (error) {
    console.error("Error restoring draft version:", error);
    return { success: false, error: "Failed to restore version" };
  }
}

export async function deleteDraft(draftId: string) {
  try {
    await db.delete(emailDraftsTable).where(eq(emailDraftsTable.id, draftId));

    revalidatePath("/dashboard/emails");
    revalidatePath("/platform/emails");

    return { success: true };
  } catch (error) {
    console.error("Error deleting draft:", error);
    return { success: false, error: "Failed to delete draft" };
  }
}

export async function getUserDrafts(userId: string, accountId: string) {
  try {
    const drafts = await db
      .select()
      .from(emailDraftsTable)
      .where(
        and(
          eq(emailDraftsTable.userId, userId),
          eq(emailDraftsTable.accountId, accountId),
          eq(emailDraftsTable.isSent, false)
        )
      )
      .orderBy(desc(emailDraftsTable.updatedAt));

    return { success: true, drafts };
  } catch (error) {
    console.error("Error fetching user drafts:", error);
    return { success: false, error: "Failed to fetch drafts" };
  }
}

// ============================================================================
// Send Email
// ============================================================================

export async function sendDraftEmail(draftId: string) {
  try {
    const [draft] = await db
      .select()
      .from(emailDraftsTable)
      .where(eq(emailDraftsTable.id, draftId));

    if (!draft) {
      return { success: false, error: "Draft not found" };
    }

    // TODO: Integrate with Nylas API to actually send the email
    // For now, we'll mark it as sent and create an email record

    // Mark draft as sent
    await db
      .update(emailDraftsTable)
      .set({ isSent: true, sentAt: new Date() })
      .where(eq(emailDraftsTable.id, draftId));

    // Create email record (this would normally be done by Nylas webhook)
    await db.insert(emailsTable).values({
      accountId: draft.accountId,
      nylasMessageId: `draft-${draftId}`, // Placeholder
      threadId: draft.threadId,
      subject: draft.subject,
      from: "user@example.com", // TODO: Get from account
      to: draft.toAddresses,
      cc: draft.ccAddresses || [],
      bcc: draft.bccAddresses || [],
      bodyText: draft.bodyText,
      bodyHtml: draft.bodyHtml,
      sentAt: new Date(),
      inReplyTo: draft.inReplyTo,
      references: draft.references || [],
    });

    revalidatePath("/dashboard/emails");
    revalidatePath("/platform/emails");

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

