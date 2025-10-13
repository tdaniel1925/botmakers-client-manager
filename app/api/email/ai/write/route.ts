import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/db/db";
import { emailsTable, emailThreadsTable } from "@/db/schema/email-schema";
import { eq, and, or, desc } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { recipientEmail, prompt, accountId, tone, contextLimit = 20 } = await req.json();

    if (!recipientEmail || !prompt || !accountId) {
      return NextResponse.json(
        { error: "Recipient email, prompt, and account ID are required" },
        { status: 400 }
      );
    }

    // Fetch email history with this recipient
    const emailHistory = await db
      .select({
        id: emailsTable.id,
        subject: emailsTable.subject,
        bodyText: emailsTable.bodyText,
        bodyHtml: emailsTable.bodyHtml,
        from: emailsTable.from,
        to: emailsTable.to,
        sentAt: emailsTable.sentAt,
        receivedAt: emailsTable.receivedAt,
      })
      .from(emailsTable)
      .where(
        and(
          eq(emailsTable.accountId, accountId),
          or(
            eq(emailsTable.from, recipientEmail),
            eq(emailsTable.to, JSON.stringify([{ email: recipientEmail }]))
          )
        )
      )
      .orderBy(desc(emailsTable.receivedAt))
      .limit(contextLimit);

    // Build context from email history
    const contextMessages = emailHistory.map((email) => {
      const isFromRecipient = email.from === recipientEmail;
      const direction = isFromRecipient ? "FROM recipient" : "TO recipient";
      const body = (email.bodyText as any) || (email.bodyHtml as any)?.substring(0, 500) || "";
      return `[${direction}] Subject: ${(email.subject as any)}\n${body.substring(0, 300)}...`;
    }).join("\n\n---\n\n");

    const toneInstructions = tone
      ? `The tone should be: ${tone}.`
      : "Analyze the email history and match the tone that has been used in past communications.";

    const systemPrompt = `You are an expert email writing assistant. You will write a complete email based on:
1. The user's prompt/request
2. The historical context of emails with this recipient

${toneInstructions}

IMPORTANT RULES:
1. Write a complete, professional email body
2. Match the communication style from the email history
3. Be natural and conversational if that's the established pattern
4. Do NOT include greetings like "Dear X" or "Hi X" - start with the main content
5. Do NOT include signatures or closing phrases - just the message body
6. Keep it concise and to the point
7. Output ONLY the email body text - no explanations, no meta-commentary
8. Return the result as clean text without markdown formatting

EMAIL HISTORY WITH RECIPIENT:
${contextMessages || "No previous email history with this recipient."}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Write an email about: ${prompt}` },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const generatedText = response.choices[0]?.message?.content || "";

    // Generate subject if not in prompt
    const subjectResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Generate a concise, professional email subject line (max 60 characters). Output ONLY the subject line, nothing else.",
        },
        { role: "user", content: generatedText },
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    const suggestedSubject = subjectResponse.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({
      generatedText: generatedText.trim(),
      suggestedSubject,
      contextUsed: emailHistory.length,
      tokensUsed: response.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.error("AI Write error:", error);
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 }
    );
  }
}



