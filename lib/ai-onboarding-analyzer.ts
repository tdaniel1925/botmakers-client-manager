/**
 * AI Onboarding Analyzer
 * Uses OpenAI GPT-4 to analyze project descriptions and generate customized onboarding flows
 * Enhanced with real-time feedback capabilities
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cache for AI suggestions to reduce API calls
const suggestionCache = new Map<string, any>();
const CACHE_DURATION = 3600000; // 1 hour

export interface ProjectAnalysis {
  projectType: 'web_design' | 'voice_ai' | 'software_dev' | 'marketing' | 'custom' | 'other';
  confidence: number; // 0-1
  reasoning: string;
  suggestedTemplate: string;
  estimatedCompletionTime: number; // minutes
}

export interface OnboardingStep {
  type: 'welcome' | 'form' | 'upload' | 'choice' | 'review' | 'complete';
  title: string;
  description: string;
  fields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'number' | 'date';
    placeholder?: string;
    options?: string[];
    required: boolean;
    helpText?: string;
  }>;
  uploadCategories?: Array<{
    name: string;
    label: string;
    description: string;
    accept?: string;
    maxFiles?: number;
    required: boolean;
  }>;
  choices?: Array<{
    id: string;
    label: string;
    description?: string;
    imageUrl?: string;
  }>;
  required: boolean;
  estimatedMinutes: number;
}

/**
 * Analyzes project description to determine project type and best onboarding approach
 */
export async function analyzeProjectForOnboarding(
  projectDescription: string,
  projectName?: string
): Promise<ProjectAnalysis> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not set, using fallback logic');
      return fallbackProjectAnalysis(projectDescription);
    }

    const prompt = `Analyze this project and categorize it. Return ONLY valid JSON with no markdown formatting.

Project Name: ${projectName || 'Not specified'}
Project Description: ${projectDescription}

Categorize as one of: web_design, voice_ai, software_dev, marketing, or other

Return JSON format:
{
  "projectType": "type_here",
  "confidence": 0.95,
  "reasoning": "Brief explanation of why this classification",
  "suggestedTemplate": "Name of template to use",
  "estimatedCompletionTime": 30
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that analyzes project descriptions and categorizes them for onboarding purposes. Always return valid JSON only, no markdown.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const analysis = JSON.parse(content) as ProjectAnalysis;
    return analysis;
  } catch (error) {
    console.error('Error analyzing project with OpenAI:', error);
    return fallbackProjectAnalysis(projectDescription);
  }
}

/**
 * Generates custom onboarding steps based on project description using AI
 */
export async function generateCustomSteps(
  projectDescription: string,
  projectType: string
): Promise<OnboardingStep[]> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not set, using fallback logic');
      return fallbackGenerateSteps(projectType);
    }

    const prompt = `Generate 5-8 onboarding steps for this project. Return ONLY valid JSON array with no markdown formatting.

Project Type: ${projectType}
Project Description: ${projectDescription}

Each step should collect specific information or assets needed to complete the project.

Return JSON array of steps. Each step must have:
- type: "welcome", "form", "upload", "choice", or "review"
- title: Short step title
- description: What the client needs to do
- fields: Array of form fields (if type=form)
- uploadCategories: Array of upload categories (if type=upload)
- required: boolean
- estimatedMinutes: time estimate

Example format:
[
  {
    "type": "form",
    "title": "Brand Information",
    "description": "Tell us about your brand",
    "fields": [
      {
        "name": "brandName",
        "label": "Brand Name",
        "type": "text",
        "required": true
      }
    ],
    "required": true,
    "estimatedMinutes": 5
  }
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that generates onboarding steps for projects. Always return valid JSON array only, no markdown.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const steps = JSON.parse(content) as OnboardingStep[];
    return steps;
  } catch (error) {
    console.error('Error generating custom steps with OpenAI:', error);
    return fallbackGenerateSteps(projectType);
  }
}

/**
 * Generates a personalized welcome message for the onboarding
 */
export async function generateWelcomeMessage(
  projectName: string,
  projectType: string,
  projectDescription?: string
): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return `Welcome to the ${projectName} onboarding! We're excited to start working with you on this ${projectType.replace('_', ' ')} project.`;
    }

    const prompt = `Write a warm, professional welcome message for a client onboarding.

Project Name: ${projectName}
Project Type: ${projectType}
${projectDescription ? `Description: ${projectDescription}` : ''}

Keep it friendly, concise (2-3 sentences), and exciting. Don't use markdown formatting.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a friendly, professional copywriter. Write concise welcome messages.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || `Welcome to ${projectName}!`;
  } catch (error) {
    console.error('Error generating welcome message:', error);
    return `Welcome to the ${projectName} onboarding! We're excited to start working with you.`;
  }
}

/**
 * Suggests required asset types based on project type
 */
export async function suggestRequiredAssets(projectType: string): Promise<string[]> {
  const assetMap: Record<string, string[]> = {
    web_design: ['Logo files', 'Brand guidelines', 'Content documents', 'Competitor examples', 'Existing design assets'],
    voice_ai: ['Script drafts', 'Call data CSVs', 'Reference audio', 'Campaign brief', 'Target list'],
    software_dev: ['Wireframes', 'API documentation', 'Database schemas', 'Existing codebase', 'Design mockups'],
    marketing: ['Brand assets', 'Previous campaigns', 'Target audience data', 'Product images', 'Content calendar'],
    custom: ['Project brief', 'Requirements document', 'Reference materials', 'Brand assets'],
    other: ['Project files', 'Reference documents', 'Brand assets'],
  };

  return assetMap[projectType] || assetMap.other;
}

/**
 * Estimates completion time based on number and complexity of steps
 */
export function estimateCompletionTime(steps: OnboardingStep[]): number {
  return steps.reduce((total, step) => total + (step.estimatedMinutes || 5), 0);
}

// ============================================================================
// Fallback Functions (when OpenAI is not available)
// ============================================================================

function fallbackProjectAnalysis(description: string): ProjectAnalysis {
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes('website') || lowerDesc.includes('web design') || lowerDesc.includes('landing page')) {
    return {
      projectType: 'web_design',
      confidence: 0.8,
      reasoning: 'Description mentions website/web design keywords',
      suggestedTemplate: 'Web Design Template',
      estimatedCompletionTime: 25,
    };
  }

  if (lowerDesc.includes('voice') || lowerDesc.includes('ai call') || lowerDesc.includes('phone') || lowerDesc.includes('campaign')) {
    return {
      projectType: 'voice_ai',
      confidence: 0.8,
      reasoning: 'Description mentions voice/AI calling keywords',
      suggestedTemplate: 'Voice AI Campaign Template',
      estimatedCompletionTime: 30,
    };
  }

  if (lowerDesc.includes('software') || lowerDesc.includes('app') || lowerDesc.includes('development') || lowerDesc.includes('api')) {
    return {
      projectType: 'software_dev',
      confidence: 0.8,
      reasoning: 'Description mentions software development keywords',
      suggestedTemplate: 'Software Development Template',
      estimatedCompletionTime: 35,
    };
  }

  if (lowerDesc.includes('marketing') || lowerDesc.includes('campaign') || lowerDesc.includes('ads') || lowerDesc.includes('social media')) {
    return {
      projectType: 'marketing',
      confidence: 0.7,
      reasoning: 'Description mentions marketing keywords',
      suggestedTemplate: 'Marketing Campaign Template',
      estimatedCompletionTime: 20,
    };
  }

  return {
    projectType: 'other',
    confidence: 0.5,
    reasoning: 'Could not confidently categorize project type',
    suggestedTemplate: 'Custom Template',
    estimatedCompletionTime: 30,
  };
}

function fallbackGenerateSteps(projectType: string): OnboardingStep[] {
  // Return basic steps based on project type
  const baseSteps: OnboardingStep[] = [
    {
      type: 'welcome',
      title: 'Welcome',
      description: 'Introduction to the onboarding process',
      required: true,
      estimatedMinutes: 2,
    },
    {
      type: 'form',
      title: 'Project Details',
      description: 'Tell us more about your project',
      fields: [
        {
          name: 'projectGoals',
          label: 'What are your main goals for this project?',
          type: 'textarea',
          required: true,
        },
        {
          name: 'targetAudience',
          label: 'Who is your target audience?',
          type: 'textarea',
          required: true,
        },
        {
          name: 'timeline',
          label: 'When do you need this completed?',
          type: 'date',
          required: false,
        },
      ],
      required: true,
      estimatedMinutes: 10,
    },
    {
      type: 'upload',
      title: 'Assets & Documents',
      description: 'Upload any relevant files',
      uploadCategories: [
        {
          name: 'brand_assets',
          label: 'Brand Assets',
          description: 'Logo, brand guidelines, style guides',
          required: false,
        },
        {
          name: 'reference_files',
          label: 'Reference Files',
          description: 'Examples, inspiration, or existing materials',
          required: false,
        },
      ],
      required: false,
      estimatedMinutes: 8,
    },
    {
      type: 'review',
      title: 'Review Your Information',
      description: 'Please review everything before submitting',
      required: true,
      estimatedMinutes: 3,
    },
    {
      type: 'complete',
      title: 'All Done!',
      description: 'Thank you for completing the onboarding',
      required: true,
      estimatedMinutes: 1,
    },
  ];

  return baseSteps;
}

// ============================================================================
// Real-Time AI Feedback System
// ============================================================================

export interface FieldSuggestion {
  type: 'tip' | 'warning' | 'success' | 'info';
  message: string;
  suggestedValue?: string;
}

/**
 * Provide real-time AI suggestions for a field
 */
export async function provideFieldSuggestion(
  fieldName: string,
  fieldValue: any,
  context: {
    projectType?: string;
    previousResponses?: any;
    fieldLabel?: string;
  }
): Promise<FieldSuggestion | null> {
  try {
    // Skip if no value
    if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim().length < 3)) {
      return null;
    }

    // Check cache first
    const cacheKey = `${fieldName}-${JSON.stringify(fieldValue)}-${context.projectType}`;
    const cached = suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.suggestion;
    }

    if (!process.env.OPENAI_API_KEY) {
      return fallbackFieldSuggestion(fieldName, fieldValue, context);
    }

    const prompt = `Provide helpful feedback for this onboarding field response.

Field: ${context.fieldLabel || fieldName}
User's Response: ${typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : fieldValue}
Project Type: ${context.projectType || 'general'}
${context.previousResponses ? `Context: ${JSON.stringify(context.previousResponses)}` : ''}

Analyze and provide:
1. Type: tip, warning, success, or info
2. Message: Brief, helpful feedback (max 100 chars)
3. Suggested improvement (optional)

Return ONLY valid JSON:
{
  "type": "tip|warning|success|info",
  "message": "Your feedback message",
  "suggestedValue": "optional improved value"
}

Only provide feedback if there's something valuable to say. Return null if the response is fine as-is.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful onboarding assistant. Provide concise, actionable feedback. Return JSON or null.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content || content.toLowerCase().includes('null')) {
      return null;
    }

    const suggestion = JSON.parse(content) as FieldSuggestion;
    
    // Cache the result
    suggestionCache.set(cacheKey, {
      suggestion,
      timestamp: Date.now(),
    });

    return suggestion;
  } catch (error) {
    console.error('Error providing field suggestion:', error);
    return fallbackFieldSuggestion(fieldName, fieldValue, context);
  }
}

/**
 * Validate response with smart feedback
 */
export async function validateResponse(
  fieldName: string,
  fieldValue: any,
  projectType: string
): Promise<{ isValid: boolean; feedback?: string }> {
  try {
    // Basic validation
    if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
      return { isValid: false, feedback: 'This field is required' };
    }

    // Pattern-based validation
    if (fieldName.includes('email')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(fieldValue)) {
        return { isValid: false, feedback: 'Please enter a valid email address' };
      }
    }

    if (fieldName.includes('phone')) {
      const phoneRegex = /^[\d\s\-\(\)\+]+$/;
      if (!phoneRegex.test(fieldValue)) {
        return { isValid: false, feedback: 'Please enter a valid phone number' };
      }
    }

    if (fieldName.includes('url') || fieldName.includes('website') || fieldName.includes('link')) {
      try {
        new URL(fieldValue);
      } catch {
        return { isValid: false, feedback: 'Please enter a valid URL (including http:// or https://)' };
      }
    }

    return { isValid: true };
  } catch (error) {
    console.error('Error validating response:', error);
    return { isValid: true }; // Default to valid if validation fails
  }
}

/**
 * Detect missing information in responses
 */
export async function detectMissingInfo(
  responses: any,
  projectType: string
): Promise<string[]> {
  const missing: string[] = [];

  // Check for common critical fields
  const criticalFields = [
    { key: 'industry', label: 'Industry' },
    { key: 'business_description', label: 'Business description' },
    { key: 'project_goals', label: 'Project goals' },
    { key: 'target_audience', label: 'Target audience' },
  ];

  for (const field of criticalFields) {
    let found = false;
    for (const stepKey in responses) {
      if (typeof responses[stepKey] === 'object' && responses[stepKey]?.[field.key]) {
        found = true;
        break;
      }
    }
    if (!found) {
      missing.push(field.label);
    }
  }

  return missing;
}

/**
 * Enrich response data with AI suggestions
 */
export async function enrichResponseData(
  responses: any
): Promise<{ suggestions: string[]; improvements: Record<string, string> }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return { suggestions: [], improvements: {} };
    }

    const prompt = `Analyze these onboarding responses and suggest improvements.

Responses: ${JSON.stringify(responses, null, 2)}

Provide:
1. General suggestions to improve the quality of information
2. Specific field improvements (if any are unclear or incomplete)

Return JSON:
{
  "suggestions": ["suggestion 1", "suggestion 2"],
  "improvements": {
    "fieldName": "improved value or suggestion"
  }
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant who improves onboarding data quality. Return JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }

    return { suggestions: [], improvements: {} };
  } catch (error) {
    console.error('Error enriching response data:', error);
    return { suggestions: [], improvements: {} };
  }
}

// ============================================================================
// Fallback Functions for Real-Time Feedback
// ============================================================================

function fallbackFieldSuggestion(
  fieldName: string,
  fieldValue: any,
  context: any
): FieldSuggestion | null {
  const value = typeof fieldValue === 'string' ? fieldValue : JSON.stringify(fieldValue);

  // List size feedback
  if (fieldName.includes('list_size') || fieldName.includes('contact')) {
    if (value.includes('<500') || value.includes('Less than')) {
      return {
        type: 'tip',
        message: 'Small list - consider quality over quantity for better results',
      };
    }
    if (value.includes('10000+') || value.includes('10,000+')) {
      return {
        type: 'info',
        message: 'Large list detected - ensure proper segmentation for best results',
      };
    }
  }

  // Script length feedback
  if (fieldName.includes('script') && typeof fieldValue === 'string') {
    const wordCount = fieldValue.split(' ').length;
    if (wordCount > 200) {
      return {
        type: 'warning',
        message: 'Script seems long - consider shortening for better engagement',
      };
    }
    if (wordCount < 50) {
      return {
        type: 'tip',
        message: 'Consider adding more details like objection handling',
      };
    }
  }

  // Timeline feedback
  if (fieldName.includes('timeline') || fieldName.includes('duration')) {
    if (value.includes('ASAP') || value.includes('1 week')) {
      return {
        type: 'warning',
        message: 'Tight timeline - ensure all requirements are ready',
      };
    }
  }

  // Generic positive feedback for longer responses
  if (typeof fieldValue === 'string' && fieldValue.length > 200) {
    return {
      type: 'success',
      message: 'Great detail! This will help us deliver exactly what you need',
    };
  }

  return null;
}
