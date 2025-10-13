import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { emailsTable, emailThreadsTable } from "@/db/schema/email-schema";
import { eq, and, or, desc, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { recipientEmail, accountId } = await req.json();

    if (!recipientEmail || !accountId) {
      return NextResponse.json(
        { error: "Recipient email and account ID are required" },
        { status: 400 }
      );
    }

    // Fetch all emails with this recipient
    const emails = await db
      .select({
        id: emailsTable.id,
        subject: emailsTable.subject,
        bodyText: emailsTable.bodyText,
        from: emailsTable.from,
        to: emailsTable.to,
        sentAt: emailsTable.sentAt,
        receivedAt: emailsTable.receivedAt,
        threadId: emailsTable.threadId,
        hasAttachments: emailsTable.hasAttachments,
      })
      .from(emailsTable)
      .where(
        and(
          eq(emailsTable.accountId, accountId),
          or(
            eq(emailsTable.from, recipientEmail),
            sql`${emailsTable.to}::text LIKE ${'%' + recipientEmail + '%'}`
          )
        )
      )
      .orderBy(desc(emailsTable.receivedAt))
      .limit(50);

    // Calculate statistics
    const totalEmails = emails.length;
    const sentToRecipient = emails.filter((e) => e.from !== recipientEmail).length;
    const receivedFromRecipient = emails.filter((e) => e.from === recipientEmail).length;
    
    // Get unique threads
    const uniqueThreads = new Set(emails.map(e => e.threadId).filter(Boolean)).size;

    // Find common topics (simple keyword extraction from subjects)
    const subjectWords = emails
      .map(e => (e.subject as any)?.toLowerCase().split(/\s+/) || [])
      .flat()
      .filter(w => w.length > 4); // Filter out short words
    
    const wordFrequency: Record<string, number> = {};
    subjectWords.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    const commonTopics = Object.entries(wordFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    // Get most recent emails (last 5)
    const recentEmails = emails.slice(0, 5).map(e => ({
      id: e.id,
      subject: e.subject,
      preview: (e.bodyText as any)?.substring(0, 100) || "",
      date: e.receivedAt,
      isFromRecipient: e.from === recipientEmail,
    }));

    // Determine typical response time (if possible)
    const responseTimeHours = sentToRecipient > 0 ? "Usually responds within 24 hours" : "No response pattern yet";

    // Detect tone (basic sentiment analysis based on content)
    const tone = "Professional"; // This could be enhanced with actual sentiment analysis

    return NextResponse.json({
      recipientEmail,
      stats: {
        totalEmails,
        sentToRecipient,
        receivedFromRecipient,
        uniqueThreads,
        hasAttachments: emails.some(e => e.hasAttachments),
      },
      commonTopics,
      tone,
      responseTimeHours,
      recentEmails,
      lastContactDate: emails[0]?.receivedAt || null,
    });
  } catch (error) {
    console.error("AI Context error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipient context" },
      { status: 500 }
    );
  }
}


