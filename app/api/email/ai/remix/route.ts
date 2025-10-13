import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text, tone } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const toneInstructions = tone
      ? `The tone should be: ${tone}.`
      : "Maintain a professional and clear tone.";

    const systemPrompt = `You are an expert email writing assistant. Your task is to take poorly written, misspelled, or grammatically incorrect text and transform it into a polished, professional email.

${toneInstructions}

IMPORTANT RULES:
1. Preserve the original intent and meaning
2. Fix all spelling and grammar errors
3. Improve sentence structure and clarity
4. Keep the message concise and professional
5. Do NOT add greetings, signatures, or closing phrases unless they were in the original
6. Output ONLY the improved email body text - no explanations, no meta-commentary
7. Return the result as clean text without markdown formatting`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const remixedText = response.choices[0]?.message?.content || "";

    // Generate a simple list of changes made (for UI display)
    const changes = [
      "Fixed spelling and grammar",
      "Improved sentence structure",
      "Enhanced clarity and professionalism",
    ];

    return NextResponse.json({
      originalText: text,
      remixedText: remixedText.trim(),
      changes,
      tokensUsed: response.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.error("AI Remix error:", error);
    return NextResponse.json(
      { error: "Failed to remix email" },
      { status: 500 }
    );
  }
}


