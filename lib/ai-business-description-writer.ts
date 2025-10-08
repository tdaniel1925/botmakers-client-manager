/**
 * AI Business Description Writer
 * Generates detailed company descriptions from minimal input
 */

"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface BusinessDescriptionInput {
  companyType?: string;
  industry?: string;
  mainProduct?: string;
  targetCustomer?: string;
  keyFeatures?: string;
}

/**
 * Generate a detailed business description from minimal input
 * This helps create better AI agent prompts
 */
export async function generateBusinessDescription(
  input: BusinessDescriptionInput | string
): Promise<string> {
  try {
    // If input is a string, treat it as raw text
    const inputText = typeof input === "string" ? input : formatInputForPrompt(input);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a professional business copywriter who creates clear, concise business descriptions. 
Your descriptions are:
- Factual and professional
- 2-4 sentences long
- Include key products/services, target audience, and value proposition
- Written in third person
- Focused on what's relevant for an AI voice agent to know

Do NOT add promotional fluff or exaggerations. Stick to facts.`
        },
        {
          role: "user",
          content: `Based on this information about a company, write a clear, professional business description (2-4 sentences):

${inputText}

The description will be used to train an AI voice agent, so include:
- What the company does (products/services)
- Who they serve (target customers)
- Key differentiators or unique value
- Any relevant business context

Keep it factual and concise.`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });
    
    return response.choices[0].message.content?.trim() || "";
    
  } catch (error) {
    console.error("[AI Description Writer] Error:", error);
    throw new Error("Failed to generate business description");
  }
}

/**
 * Format structured input into a prompt-friendly format
 */
function formatInputForPrompt(input: BusinessDescriptionInput): string {
  const parts: string[] = [];
  
  if (input.companyType) {
    parts.push(`Company type: ${input.companyType}`);
  }
  if (input.industry) {
    parts.push(`Industry: ${input.industry}`);
  }
  if (input.mainProduct) {
    parts.push(`Main product/service: ${input.mainProduct}`);
  }
  if (input.targetCustomer) {
    parts.push(`Target customers: ${input.targetCustomer}`);
  }
  if (input.keyFeatures) {
    parts.push(`Key features/benefits: ${input.keyFeatures}`);
  }
  
  return parts.join("\n");
}
