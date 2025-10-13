'use server';

import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ConversationMessage {
  role: 'assistant' | 'user';
  content: string;
}

export interface NextQuestionResponse {
  question: string;
  fieldType: 'text' | 'textarea' | 'select' | 'radio';
  options?: string[];
  isComplete: boolean;
  reasoning?: string;
}

/**
 * Generate the next intelligent question based on conversation history
 * Stays focused on voice agent creation requirements
 */
export async function generateNextQuestionAction(
  conversationHistory: ConversationMessage[],
  campaignType?: 'inbound' | 'outbound'
): Promise<{ success: boolean; data?: NextQuestionResponse; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Build the system prompt to keep AI focused
    const systemPrompt = `You are an expert AI assistant helping users create voice AI campaigns. Your job is to ask intelligent follow-up questions to gather all necessary information to build an effective voice agent.

**STRICT RULES:**
1. ONLY ask questions related to building a voice AI agent/campaign
2. Focus on: business context, target audience, conversation goals, key information to collect, objection handling, tone/personality
3. NEVER ask about unrelated topics (weather, personal life, news, etc.)
4. Each question should build on previous answers
5. Ask ONE specific question at a time
6. After 8-10 relevant questions, determine if you have enough information

**CAMPAIGN TYPE:** ${campaignType || 'Not specified yet'}

**INFORMATION NEEDED:**
- Business/company details
- Campaign purpose and goals
- Target audience and ideal customer
- Key qualifying questions the agent should ask
- Information the agent needs to collect
- How to handle objections or common concerns
- Agent personality and tone
- Success criteria

**CONVERSATION HISTORY SO FAR:**
${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

**YOUR TASK:**
Analyze the conversation and decide:
1. If you have enough information (8-10 meaningful answers), respond with: {"isComplete": true, "reasoning": "explanation"}
2. If you need more info, generate the next most relevant question

Respond ONLY with valid JSON in this exact format:
{
  "question": "Your specific question here",
  "fieldType": "text" | "textarea" | "select" | "radio",
  "options": ["option1", "option2"] (only if fieldType is select or radio),
  "isComplete": false,
  "reasoning": "Why this question is important"
}

OR if complete:
{
  "isComplete": true,
  "reasoning": "We have gathered sufficient information about..."
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate the next question or determine if we have enough information.' }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return { success: false, error: 'No response from AI' };
    }

    const parsed: NextQuestionResponse = JSON.parse(response);
    
    return { success: true, data: parsed };
  } catch (error) {
    console.error('Error generating next question:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate question' 
    };
  }
}

/**
 * Generate final campaign configuration from conversation
 */
export async function generateCampaignConfigFromConversationAction(
  conversationHistory: ConversationMessage[]
): Promise<{ 
  success: boolean; 
  data?: {
    campaignName: string;
    agentName: string;
    companyName: string;
    campaignType: 'inbound' | 'outbound';
    systemPrompt: string;
    firstMessage: string;
    qualifyingQuestions: string[];
    objectionHandling: string;
    voiceSettings: {
      speed: number;
      stability: number;
      model: string;
    };
  }; 
  error?: string 
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const systemPrompt = `You are an expert at creating voice AI agent configurations. 

Based on the conversation history below, generate a complete voice agent configuration.

**CONVERSATION HISTORY:**
${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

**YOUR TASK:**
Generate a comprehensive voice agent configuration with:
1. Professional campaign and agent name
2. Detailed system prompt that defines the agent's role, personality, and conversation flow
3. Engaging first message for the agent to say
4. List of key qualifying questions the agent should ask
5. Objection handling strategies
6. Voice settings (speed: 1.0-1.3, stability: 0.5-0.8)

Respond ONLY with valid JSON in this exact format:
{
  "campaignName": "Professional campaign name",
  "agentName": "Human-like agent name",
  "companyName": "Company name from conversation",
  "campaignType": "inbound" or "outbound",
  "systemPrompt": "Detailed system prompt (300-500 words)",
  "firstMessage": "Warm, professional greeting (2-3 sentences)",
  "qualifyingQuestions": ["Question 1", "Question 2", ...],
  "objectionHandling": "How to handle common objections",
  "voiceSettings": {
    "speed": 1.1,
    "stability": 0.7,
    "model": "eleven_turbo_v2"
  }
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate the complete campaign configuration.' }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return { success: false, error: 'No response from AI' };
    }

    const config = JSON.parse(response);
    
    return { success: true, data: config };
  } catch (error) {
    console.error('Error generating campaign config:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate configuration' 
    };
  }
}






