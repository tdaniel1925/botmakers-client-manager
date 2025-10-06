/**
 * AI Template Generator
 * Creates custom onboarding templates using AI based on project type
 */

import OpenAI from 'openai';
import type { OnboardingTemplateDefinition } from './onboarding-templates';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GeneratedTemplate {
  name: string;
  projectType: string;
  description: string;
  estimatedTime: number;
  conditionalRules: any;
  industryTriggers: any;
  steps: any[];
}

/**
 * Generate complete onboarding template using AI
 */
export async function generateOnboardingTemplate(
  projectTypeName: string,
  projectDescription: string
): Promise<GeneratedTemplate> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not set, using fallback template generation');
      return fallbackTemplateGeneration(projectTypeName, projectDescription);
    }

    const prompt = `You are an expert onboarding specialist. Create a comprehensive client onboarding questionnaire for a "${projectTypeName}" project.

Project Description: ${projectDescription}

Generate a structured onboarding template with 5-8 steps. Each step should collect specific information needed to successfully complete this type of project.

Return ONLY valid JSON in this exact format (no markdown):
{
  "name": "Display name for this template",
  "projectType": "${projectTypeName.toLowerCase().replace(/\s+/g, '_')}",
  "description": "Brief description of what this template covers",
  "estimatedTime": 25,
  "steps": [
    {
      "type": "form",
      "title": "Step Title",
      "description": "What this step covers",
      "estimatedMinutes": 5,
      "required": true,
      "fields": [
        {
          "name": "fieldName",
          "label": "Field Label",
          "type": "text|textarea|select|checkbox|radio|date|number",
          "options": ["option1", "option2"],
          "placeholder": "Example text",
          "required": true,
          "helpText": "Helper text",
          "aiPrompt": "What AI should analyze about this field"
        }
      ]
    }
  ],
  "conditionalRules": {},
  "industryTriggers": {}
}

Guidelines:
- Start with business context (industry, description)
- Include project goals and success criteria
- Ask about target audience/customers
- Collect technical requirements
- Include compliance/legal considerations if relevant
- Ask about existing assets/resources
- Include review/confirmation step at end
- Make critical fields required
- Add helpful placeholder text and help text
- Each step should take 3-7 minutes
- Use appropriate field types (text for short answers, textarea for descriptions, select for choices, checkbox for multiple selections)`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating client onboarding questionnaires. Return only valid JSON, no markdown formatting.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const template = JSON.parse(content) as GeneratedTemplate;
    
    // Add conditional rules and industry triggers using AI
    const enhancedTemplate = await enhanceTemplateWithLogic(template);
    
    return enhancedTemplate;
  } catch (error) {
    console.error('Error generating template with OpenAI:', error);
    return fallbackTemplateGeneration(projectTypeName, projectDescription);
  }
}

/**
 * Enhance template with conditional logic and industry triggers
 */
async function enhanceTemplateWithLogic(template: GeneratedTemplate): Promise<GeneratedTemplate> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return template;
    }

    const prompt = `Analyze this onboarding template and suggest conditional logic rules and industry triggers.

Template: ${JSON.stringify(template, null, 2)}

Return ONLY valid JSON with suggested enhancements:
{
  "conditionalRules": {
    "ruleName": {
      "description": "When to trigger this rule",
      "condition": "responses['stepX']['fieldName'] === 'value'",
      "affectedSteps": ["stepId1", "stepId2"]
    }
  },
  "industryTriggers": {
    "industryName": {
      "triggerField": "industry",
      "triggerValue": "Industry Name",
      "additionalQuestions": ["question1", "question2"],
      "complianceWarnings": ["warning1", "warning2"]
    }
  }
}

Focus on:
- Questions that should only appear based on previous answers
- Industry-specific compliance requirements
- Technical requirements that depend on other choices`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at designing conditional logic for questionnaires. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const enhancements = JSON.parse(content);
      return {
        ...template,
        conditionalRules: enhancements.conditionalRules || {},
        industryTriggers: enhancements.industryTriggers || {},
      };
    }
    
    return template;
  } catch (error) {
    console.error('Error enhancing template with logic:', error);
    return template;
  }
}

/**
 * Analyze project context and structure questions into logical groups
 */
export async function analyzeAndStructureQuestions(
  projectTypeName: string,
  projectDescription: string
): Promise<{
  suggestedCategories: string[];
  estimatedComplexity: 'low' | 'medium' | 'high';
  recommendedStepCount: number;
}> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        suggestedCategories: ['Business Context', 'Requirements', 'Technical Details', 'Review'],
        estimatedComplexity: 'medium',
        recommendedStepCount: 6,
      };
    }

    const prompt = `Analyze this project type and suggest how to structure an onboarding questionnaire.

Project Type: ${projectTypeName}
Description: ${projectDescription}

Return JSON with:
{
  "suggestedCategories": ["Category 1", "Category 2", ...],
  "estimatedComplexity": "low|medium|high",
  "recommendedStepCount": 5
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a project management expert. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
    
    throw new Error('No response');
  } catch (error) {
    console.error('Error analyzing project context:', error);
    return {
      suggestedCategories: ['Business Context', 'Requirements', 'Technical Details', 'Review'],
      estimatedComplexity: 'medium',
      recommendedStepCount: 6,
    };
  }
}

/**
 * Generate conditional logic rules for template
 */
export async function generateConditionalLogic(
  steps: any[]
): Promise<Record<string, any>> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {};
    }

    const prompt = `Given these onboarding steps, suggest conditional logic rules.

Steps: ${JSON.stringify(steps, null, 2)}

Identify fields that should trigger showing/hiding other questions or steps.

Return JSON:
{
  "ruleName": {
    "condition": "(responses) => responses['stepX']['field'] === 'value'",
    "affectedSteps": ["stepId"]
  }
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at questionnaire logic. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
    
    return {};
  } catch (error) {
    console.error('Error generating conditional logic:', error);
    return {};
  }
}

/**
 * Suggest industry-specific questions
 */
export async function suggestIndustrySpecificQuestions(
  industry: string,
  projectType: string
): Promise<{
  questions: any[];
  complianceRequirements: string[];
  warnings: string[];
}> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        questions: [],
        complianceRequirements: [],
        warnings: [],
      };
    }

    const prompt = `For a ${projectType} project in the ${industry} industry, what specific questions and compliance requirements should be included in the onboarding?

Return JSON:
{
  "questions": [
    {
      "name": "fieldName",
      "label": "Question text",
      "type": "text|textarea|select|checkbox",
      "required": true,
      "helpText": "Why this matters"
    }
  ],
  "complianceRequirements": ["HIPAA", "GDPR", etc.],
  "warnings": ["Important considerations"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a compliance and industry expert. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
    
    return {
      questions: [],
      complianceRequirements: [],
      warnings: [],
    };
  } catch (error) {
    console.error('Error suggesting industry-specific questions:', error);
    return {
      questions: [],
      complianceRequirements: [],
      warnings: [],
    };
  }
}

/**
 * Validate generated template
 */
export function validateTemplate(template: GeneratedTemplate): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!template.name) errors.push('Template name is required');
  if (!template.projectType) errors.push('Project type is required');
  if (!template.steps || template.steps.length === 0) {
    errors.push('Template must have at least one step');
  }

  // Check steps
  if (template.steps) {
    template.steps.forEach((step, index) => {
      if (!step.title) errors.push(`Step ${index + 1}: Title is required`);
      if (!step.type) errors.push(`Step ${index + 1}: Type is required`);
      
      if (step.fields) {
        step.fields.forEach((field: any, fieldIndex: number) => {
          if (!field.name) {
            errors.push(`Step ${index + 1}, Field ${fieldIndex + 1}: Name is required`);
          }
          if (!field.label) {
            errors.push(`Step ${index + 1}, Field ${fieldIndex + 1}: Label is required`);
          }
          if (!field.type) {
            errors.push(`Step ${index + 1}, Field ${fieldIndex + 1}: Type is required`);
          }
        });
      }
    });

    // Warnings
    if (template.steps.length < 3) {
      warnings.push('Template has fewer than 3 steps - consider adding more structure');
    }
    if (template.steps.length > 12) {
      warnings.push('Template has more than 12 steps - consider consolidating');
    }
    
    const totalTime = template.steps.reduce((sum, step) => sum + (step.estimatedMinutes || 0), 0);
    if (totalTime > 45) {
      warnings.push('Total estimated time exceeds 45 minutes - consider shortening');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Fallback Functions
// ============================================================================

function fallbackTemplateGeneration(
  projectTypeName: string,
  projectDescription: string
): GeneratedTemplate {
  return {
    name: projectTypeName,
    projectType: projectTypeName.toLowerCase().replace(/\s+/g, '_'),
    description: projectDescription || `Custom onboarding for ${projectTypeName} projects`,
    estimatedTime: 25,
    conditionalRules: {},
    industryTriggers: {},
    steps: [
      {
        type: 'form',
        title: 'Business Context',
        description: 'Tell us about your business',
        estimatedMinutes: 4,
        required: true,
        fields: [
          {
            name: 'industry',
            label: 'What industry are you in?',
            type: 'select',
            options: ['Technology', 'Healthcare', 'Financial Services', 'Retail', 'Other'],
            required: true,
          },
          {
            name: 'business_description',
            label: 'Briefly describe your business',
            type: 'textarea',
            placeholder: 'Tell us what your business does...',
            required: true,
          },
        ],
      },
      {
        type: 'form',
        title: 'Project Goals',
        description: 'What do you want to achieve?',
        estimatedMinutes: 5,
        required: true,
        fields: [
          {
            name: 'project_goals',
            label: 'What are your main goals for this project?',
            type: 'textarea',
            required: true,
          },
          {
            name: 'success_criteria',
            label: 'How will you measure success?',
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
      },
      {
        type: 'form',
        title: 'Requirements',
        description: 'What do you need for this project?',
        estimatedMinutes: 6,
        required: true,
        fields: [
          {
            name: 'requirements',
            label: 'Describe your specific requirements',
            type: 'textarea',
            placeholder: 'Features, functionality, technical needs...',
            required: true,
          },
          {
            name: 'existing_resources',
            label: 'What existing resources or assets do you have?',
            type: 'textarea',
            required: false,
          },
        ],
      },
      {
        type: 'form',
        title: 'Technical Details',
        description: 'Technical specifications and integrations',
        estimatedMinutes: 5,
        required: true,
        fields: [
          {
            name: 'integrations_needed',
            label: 'What integrations or systems need to connect?',
            type: 'textarea',
            required: false,
          },
          {
            name: 'technical_constraints',
            label: 'Any technical constraints or preferences?',
            type: 'textarea',
            required: false,
          },
        ],
      },
      {
        type: 'review',
        title: 'Review & Confirm',
        description: 'Review your information',
        estimatedMinutes: 2,
        required: true,
        fields: [
          {
            name: 'review_acknowledgment',
            label: 'I confirm all information is accurate',
            type: 'checkbox',
            options: ['Yes'],
            required: true,
          },
          {
            name: 'additional_notes',
            label: 'Any additional notes or requirements?',
            type: 'textarea',
            required: false,
          },
        ],
      },
    ],
  };
}
