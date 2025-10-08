// AI Campaign Generator - Uses GPT-4 to generate voice agent configurations

"use server";

import OpenAI from "openai";
import type { CampaignSetupAnswers, AIGeneratedConfig } from "@/types/voice-campaign-types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate AI voice agent configuration based on setup answers
 * Uses GPT-4 to create system prompts, first messages, and conversation guidelines
 * 
 * @param setupAnswers - Admin's answers to campaign setup questions
 * @returns AI-generated configuration
 */
export async function generateCampaignConfig(
  setupAnswers: CampaignSetupAnswers
): Promise<AIGeneratedConfig> {
  const prompt = buildGenerationPrompt(setupAnswers);
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating AI voice agent configurations. Generate professional, effective voice agent prompts and messages based on the campaign requirements provided."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    const generated = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      systemPrompt: generated.systemPrompt || "",
      firstMessage: generated.firstMessage || "",
      conversationGuidelines: generated.conversationGuidelines || [],
      dataToCollect: setupAnswers.must_collect || [],
      successCriteria: generated.successCriteria || "",
      voicemailMessage: generated.voicemailMessage || "",
      endCallPhrases: generated.endCallPhrases || ["goodbye", "have a great day", "talk to you later"],
      estimatedCallDuration: 5, // Default 5 minutes
    };
    
  } catch (error) {
    console.error("[AI Generator] Error generating config:", error);
    throw new Error("Failed to generate campaign configuration");
  }
}

/**
 * Build the prompt for GPT-4 to generate campaign config
 */
function buildGenerationPrompt(answers: CampaignSetupAnswers): string {
  const goalDescription = answers.campaign_goal === "custom" 
    ? answers.custom_goal 
    : getGoalDescription(answers.campaign_goal);
  
  const campaignTypeContext = getCampaignTypeContext(answers.campaign_type);
  
  return `Generate a complete voice AI agent configuration for the following campaign:

**Campaign Details:**
- Name: ${answers.campaign_name}
- Agent Name: ${answers.agent_name} (REQUIRED: Agent MUST introduce itself by this name)
- Company Name: ${answers.company_name} (REQUIRED: Agent MUST mention this company name)
- Type: ${answers.campaign_type} - ${campaignTypeContext.description}
- Business Context: ${answers.business_context}
- Campaign Goal: ${goalDescription}

**Agent Personality:**
- Style: ${getPersonalityDescription(answers.agent_personality)}
- Voice Preference: ${answers.voice_preference === "auto" ? "Choose based on personality" : answers.voice_preference}

**Key Information Agent Should Know:**
${answers.key_information}

**Required Data to Collect:**
${answers.must_collect?.join(", ") || "None specified"}

**Follow-up Triggers:**
${answers.follow_up_triggers?.join(", ") || "None specified"}

**Working Hours:**
${getWorkingHoursDescription(answers)}

---

Generate the following in JSON format:

{
  "systemPrompt": "A comprehensive system prompt (300-500 words) formatted in MARKDOWN with bullet points (*). CRITICAL REQUIREMENTS:\n- Agent MUST introduce itself as '${answers.agent_name}'\n- Agent MUST mention '${answers.company_name}'\n${campaignTypeContext.systemPromptGuidance}\n\nInclude:\n\n## Role Definition\n* You are ${answers.agent_name} from ${answers.company_name}\n* ${campaignTypeContext.roleContext}\n* Company representation\n\n## Personality & Tone\n* Specific personality traits\n* Communication style\n\n## Conversation Objectives\n* Primary goals\n* Key topics to cover\n\n## Data Collection Requirements\n* Information to gather\n* When and how to collect it\n\n## Handling Common Scenarios\n* Answering questions\n* Handling objections\n* Escalation procedures\n\n## Professional Etiquette\n* Call opening and closing\n* Active listening techniques",
  "firstMessage": "${campaignTypeContext.firstMessageInstruction}",
  "conversationGuidelines": [
    "Guideline 1: Specific instruction for agent behavior",
    "Guideline 2: How to handle objections",
    "Guideline 3: When to offer additional help",
    "Guideline 4: How to conclude calls",
    "Guideline 5: Escalation procedures"
  ],
  "successCriteria": "Clear definition of what makes this call successful (1-2 sentences)",
  "voicemailMessage": "${campaignTypeContext.voicemailInstruction}",
  "endCallPhrases": ["goodbye phrase 1", "goodbye phrase 2", "goodbye phrase 3"]
}

IMPORTANT: Format the systemPrompt using proper markdown with headers (##) and bullet points (*). Make it well-structured and easy to read. Keep the agent sounding natural, professional, and aligned with the specified personality.`;
}

function getCampaignTypeContext(campaignType: "inbound" | "outbound" | "both") {
  if (campaignType === "inbound") {
    return {
      description: "INBOUND - Customers call your number and the AI agent ANSWERS the call",
      roleContext: "You ANSWER incoming calls from customers who are reaching out to your company",
      systemPromptGuidance: "- You are ANSWERING calls (customers called you, NOT the other way around)\n- DO NOT say 'I'm calling you' or 'I'm reaching out' - customers called YOU\n- Start with welcoming phrases like 'Thanks for calling' or 'How can I help you today?'",
      firstMessageInstruction: "An engaging greeting message (2-3 sentences) for INBOUND calls that MUST:\n- Welcome the caller (e.g., 'Thanks for calling', 'Hello and welcome')\n- Introduce yourself as the agent\n- Mention the company name\n- Ask how you can help\n- DO NOT say 'I'm calling you' or 'I'm reaching out' (they called YOU)\n\nExample: 'Thanks for calling ${answers.company_name}, this is ${answers.agent_name}. How can I help you today?'",
      voicemailInstruction: "For INBOUND campaigns, voicemail messages are typically not used since customers are calling in. Generate a brief hold message or callback instruction instead (1-2 sentences)."
    };
  } else if (campaignType === "outbound") {
    return {
      description: "OUTBOUND - The AI agent CALLS customers proactively",
      roleContext: "You are MAKING calls to customers on behalf of the company",
      systemPromptGuidance: "- You are CALLING customers (you initiated the call, not them)\n- Clearly state why you're calling and the purpose\n- Be respectful of their time and ask if it's a good time to talk",
      firstMessageInstruction: "An engaging opening message (2-3 sentences) for OUTBOUND calls that MUST:\n- Greet the customer warmly\n- Introduce yourself by name\n- Mention the company name\n- State the PURPOSE of your call clearly\n- Ask if it's a good time to talk\n\nExample: 'Hi, this is ${answers.agent_name} from ${answers.company_name}. I'm calling today to [purpose]. Is this a good time to chat for a few minutes?'",
      voicemailInstruction: "Brief voicemail message for when customer doesn't answer (2-3 sentences) that MUST:\n- Identify yourself as '${answers.agent_name}'\n- Mention '${answers.company_name}'\n- State the purpose of the call\n- Provide a callback number or next steps\n\nExample: 'Hi, this is ${answers.agent_name} from ${answers.company_name}. I'm calling about [purpose]. Please call us back at [number] or I'll try reaching you again soon. Thanks!'"
    };
  } else {
    // "both"
    return {
      description: "HYBRID - Agent can both ANSWER incoming calls and MAKE outbound calls",
      roleContext: "You handle both inbound calls (customers calling you) and outbound calls (you calling customers)",
      systemPromptGuidance: "- Adapt your greeting based on call direction\n- For INBOUND: Welcome callers with 'Thanks for calling'\n- For OUTBOUND: Introduce purpose with 'I'm calling to...'\n- Always be clear about whether you're answering or initiating",
      firstMessageInstruction: "A versatile greeting (2-3 sentences) that works for BOTH call types:\n- Greet warmly and introduce yourself\n- Mention the company name\n- Be adaptable: 'Thanks for calling' for inbound OR 'I'm calling about...' for outbound\n\nExample (adaptable): 'Hi, this is ${answers.agent_name} from ${answers.company_name}. [For inbound: How can I help you today?] [For outbound: I'm calling about...]'",
      voicemailInstruction: "Brief voicemail message for OUTBOUND scenarios when customer doesn't answer (2-3 sentences). For INBOUND calls, this won't be used.\n\nExample: 'Hi, this is ${answers.agent_name} from ${answers.company_name}. I'm calling about [purpose]. Please call us back at [number]. Thanks!'"
    };
  }
}

function getGoalDescription(goal: string): string {
  const descriptions: Record<string, string> = {
    lead_qualification: "Qualify inbound leads by asking qualifying questions and assessing their fit for the product/service",
    appointment_booking: "Schedule appointments with prospects or customers for sales calls or service meetings",
    customer_support: "Provide customer support by answering questions, troubleshooting issues, and escalating when needed",
    sales_followup: "Follow up with leads or customers to move them through the sales pipeline",
    survey: "Conduct surveys to gather customer feedback and insights",
  };
  
  return descriptions[goal] || goal;
}

function getPersonalityDescription(personality: string): string {
  const descriptions: Record<string, string> = {
    professional: "Professional, formal, business-focused. Maintains a polished demeanor",
    friendly: "Friendly, warm, approachable. Makes callers feel comfortable and valued",
    enthusiastic: "Enthusiastic, energetic, positive. Shows excitement about helping",
    empathetic: "Empathetic, caring, understanding. Shows genuine concern for caller needs",
  };
  
  return descriptions[personality] || personality;
}

function getWorkingHoursDescription(answers: CampaignSetupAnswers): string {
  if (answers.working_hours === "24_7") {
    return "24/7 - Always available";
  } else if (answers.working_hours === "business_hours") {
    return "Business hours only (9am-5pm)";
  } else if (answers.working_hours === "custom" && answers.custom_hours_start && answers.custom_hours_end) {
    return `Custom hours: ${answers.custom_hours_start} - ${answers.custom_hours_end}`;
  }
  return "Standard business hours";
}

/**
 * Regenerate a specific part of the configuration
 * Useful for when admin wants to tweak a specific section
 */
export async function regenerateConfigSection(
  setupAnswers: CampaignSetupAnswers,
  section: "systemPrompt" | "firstMessage" | "voicemailMessage",
  additionalInstructions?: string
): Promise<string> {
  const sectionPrompts = {
    systemPrompt: "Generate a comprehensive system prompt for this voice agent",
    firstMessage: "Generate an engaging first message for when the agent answers/initiates the call",
    voicemailMessage: "Generate a brief voicemail message for when calls go to voicemail",
  };
  
  const prompt = `${buildGenerationPrompt(setupAnswers)}

Focus specifically on generating: ${sectionPrompts[section]}

${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ""}

Return ONLY the ${section} text, not JSON.`;
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });
    
    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("[AI Generator] Error regenerating section:", error);
    throw new Error(`Failed to regenerate ${section}`);
  }
}
