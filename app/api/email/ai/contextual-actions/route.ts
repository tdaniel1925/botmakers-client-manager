/**
 * AI Contextual Actions API
 * Analyzes email content and extracts smart action buttons
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { emailsTable, aiContextualActionsTable } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + 60000 }); // 1 minute window
    return true;
  }

  if (userLimit.count >= 30) { // 30 requests per minute
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { emailId } = body;

    if (!emailId) {
      return NextResponse.json(
        { error: 'Email ID is required' },
        { status: 400 }
      );
    }

    // Check for cached analysis (valid for 24 hours)
    const now = new Date();
    const cachedAnalysis = await db
      .select()
      .from(aiContextualActionsTable)
      .where(
        and(
          eq(aiContextualActionsTable.emailId, emailId),
          eq(aiContextualActionsTable.userId, userId),
          gt(aiContextualActionsTable.expiresAt, now)
        )
      )
      .limit(1);

    if (cachedAnalysis.length > 0) {
      return NextResponse.json({
        success: true,
        actions: cachedAnalysis[0].actions || [],
        extractedEvents: cachedAnalysis[0].extractedEvents || [],
        extractedContacts: cachedAnalysis[0].extractedContacts || [],
        extractedTasks: cachedAnalysis[0].extractedTasks || [],
        cached: true,
      });
    }

    // Fetch email content
    const email = await db
      .select()
      .from(emailsTable)
      .where(and(eq(emailsTable.id, emailId), eq(emailsTable.userId, userId)))
      .limit(1);

    if (email.length === 0) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    const emailData = email[0];
    const emailContent = emailData.bodyText || emailData.bodyHtml || '';
    const subject = emailData.subject || '';

    // Analyze with OpenAI
    const systemPrompt = `You are an AI assistant that analyzes emails and extracts actionable information.
Analyze the email and extract:
1. Calendar events (dates, times, locations, event titles)
2. Contact information (names, emails, phone numbers, companies)
3. Tasks and action items
4. Suggested contextual actions

Return a JSON object with this exact structure:
{
  "actions": [
    {
      "type": "add_to_calendar" | "set_reminder" | "save_receipt" | "create_task" | "save_contact" | "book_meeting",
      "label": "Action button label",
      "icon": "Calendar" | "Clock" | "Receipt" | "CheckSquare" | "UserPlus" | "Video",
      "data": {
        // Action-specific data
      },
      "confidence": 0-100
    }
  ],
  "extractedEvents": [
    {
      "title": "Event name",
      "startTime": "ISO 8601 datetime",
      "endTime": "ISO 8601 datetime",
      "location": "Location if available",
      "description": "Event description"
    }
  ],
  "extractedContacts": [
    {
      "name": "Full name",
      "email": "email@example.com",
      "phone": "Phone number",
      "company": "Company name"
    }
  ],
  "extractedTasks": [
    {
      "title": "Task title",
      "description": "Task details",
      "dueDate": "ISO 8601 date if mentioned",
      "priority": "high" | "medium" | "low"
    }
  ]
}

Rules:
- Only suggest actions if confidence is > 60
- For calendar events, try to extract complete datetime information
- For contacts, only extract if there's clear contact information in the email
- For tasks, identify action items, follow-ups, or things to do
- Limit to 3-4 most relevant actions
- Return valid JSON only, no markdown`;

    const userPrompt = `Subject: ${subject}

Content:
${emailContent.substring(0, 3000)}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0]?.message?.content || '{}';
    const parsedResponse = JSON.parse(aiResponse);

    // Store in cache (expires in 24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await db.insert(aiContextualActionsTable).values({
      emailId,
      userId,
      actions: parsedResponse.actions || [],
      extractedEvents: parsedResponse.extractedEvents || [],
      extractedContacts: parsedResponse.extractedContacts || [],
      extractedTasks: parsedResponse.extractedTasks || [],
      analysisModel: 'gpt-4-turbo-preview',
      confidence: Math.round(
        (parsedResponse.actions || []).reduce((sum: number, a: any) => sum + (a.confidence || 0), 0) /
        Math.max((parsedResponse.actions || []).length, 1)
      ),
      tokensUsed: completion.usage?.total_tokens || 0,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      actions: parsedResponse.actions || [],
      extractedEvents: parsedResponse.extractedEvents || [],
      extractedContacts: parsedResponse.extractedContacts || [],
      extractedTasks: parsedResponse.extractedTasks || [],
      cached: false,
      tokensUsed: completion.usage?.total_tokens || 0,
    });

  } catch (error: any) {
    console.error('AI Contextual Actions Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze email', details: error.message },
      { status: 500 }
    );
  }
}

