import OpenAI from "openai";
import {
  updateCallAnalysisStatus,
  updateCallAnalysis,
} from "@/db/queries/calls-queries";
import { checkAndExecuteWorkflows } from "./workflow-engine";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeCallTranscript(
  callRecordId: string,
  transcript: string,
  structuredData?: any
) {
  // Mark as processing
  await updateCallAnalysisStatus(callRecordId, "processing");
  
  try {
    const analysis = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are analyzing a phone call transcript from an AI voice agent. 
Extract key information and provide structured analysis. Be concise but thorough.`,
        },
        {
          role: "user",
          content: `Analyze this call transcript and provide:
1. Main topic/purpose of the call (1-3 words max)
2. Brief summary (2-3 sentences)
3. List of questions the caller asked (array of strings)
4. Overall sentiment (must be exactly: positive, neutral, or negative)
5. Quality rating (1-10, based on clarity, engagement, outcome)
6. Whether follow-up is needed (true/false)
7. If follow-up needed, explain why and rate urgency (must be exactly: low, medium, high, or urgent)

Transcript:
${transcript}

${structuredData ? `Additional structured data from voice agent: ${JSON.stringify(structuredData, null, 2)}` : ''}

Return JSON in this exact format:
{
  "call_topic": "string (1-3 words)",
  "call_summary": "string (2-3 sentences)",
  "questions_asked": ["question1", "question2"],
  "call_sentiment": "positive|neutral|negative",
  "call_quality_rating": 1-10,
  "follow_up_needed": true|false,
  "follow_up_reason": "string or null",
  "follow_up_urgency": "low|medium|high|urgent|null",
  "additional_insights": {}
}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    const result = JSON.parse(analysis.choices[0].message.content || "{}");
    
    // Validate and normalize the response
    const normalizedResult = {
      call_topic: result.call_topic || "Unknown",
      call_summary: result.call_summary || "No summary available",
      questions_asked: Array.isArray(result.questions_asked) ? result.questions_asked : [],
      call_sentiment: ["positive", "neutral", "negative"].includes(result.call_sentiment) 
        ? result.call_sentiment 
        : "neutral",
      call_quality_rating: typeof result.call_quality_rating === "number" 
        ? Math.max(1, Math.min(10, result.call_quality_rating))
        : 5,
      follow_up_needed: Boolean(result.follow_up_needed),
      follow_up_reason: result.follow_up_reason || null,
      follow_up_urgency: ["low", "medium", "high", "urgent"].includes(result.follow_up_urgency)
        ? result.follow_up_urgency
        : null,
      additional_insights: result.additional_insights || {},
    };
    
    // Update call record with analysis
    await updateCallAnalysis(callRecordId, {
      aiAnalysisStatus: "completed",
      aiAnalysisCompletedAt: new Date(),
      callTopic: normalizedResult.call_topic,
      callSummary: normalizedResult.call_summary,
      questionsAsked: normalizedResult.questions_asked,
      callSentiment: normalizedResult.call_sentiment,
      callQualityRating: normalizedResult.call_quality_rating,
      followUpNeeded: normalizedResult.follow_up_needed,
      followUpReason: normalizedResult.follow_up_reason,
      followUpUrgency: normalizedResult.follow_up_urgency,
      aiInsights: normalizedResult.additional_insights,
    });
    
    // Check for workflow triggers
    await checkAndExecuteWorkflows(callRecordId);
    
    console.log(`✅ Successfully analyzed call ${callRecordId}`);
    
  } catch (error) {
    console.error(`❌ AI analysis error for call ${callRecordId}:`, error);
    await updateCallAnalysisStatus(callRecordId, "failed");
    throw error;
  }
}
