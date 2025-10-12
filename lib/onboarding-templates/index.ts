/**
 * Onboarding Templates Index
 * Centralized export of all onboarding templates
 */

import outboundCallingTemplate from './outbound-calling-template';
import inboundCallingTemplate from './inbound-calling-template';
import marketingCampaignTemplate from './marketing-campaign-template';
import crmImplementationTemplate from './crm-implementation-template';

// Import existing templates (will be updated later)
import { webDesignTemplate } from './web-design-template';
import { voiceAITemplate } from './voice-ai-template';
import { softwareDevTemplate } from './software-dev-template';

export interface OnboardingTemplateDefinition {
  id: string;
  name: string;
  projectType: string;
  description: string;
  estimatedTime: number;
  conditionalRules?: any;
  industryTriggers?: any;
  steps: any[];
}

// Standardized templates with full metadata
export const ONBOARDING_TEMPLATES: OnboardingTemplateDefinition[] = [
  outboundCallingTemplate,
  inboundCallingTemplate,
  marketingCampaignTemplate,
  crmImplementationTemplate,
  // Wrap existing templates in standard format
  {
    id: 'web-design',
    name: 'Web Design & Development',
    projectType: 'web_design',
    description: 'Website and web application design and development projects',
    estimatedTime: 28,
    conditionalRules: {},
    industryTriggers: {},
    steps: webDesignTemplate
  },
  {
    id: 'voice-ai',
    name: 'AI Voice Agent',
    projectType: 'voice_ai',
    description: 'AI-powered voice assistant and conversational AI setup',
    estimatedTime: 30,
    conditionalRules: {},
    industryTriggers: {},
    steps: voiceAITemplate
  },
  {
    id: 'software-dev',
    name: 'Software Development',
    projectType: 'software_dev',
    description: 'Custom software development and application projects',
    estimatedTime: 32,
    conditionalRules: {},
    industryTriggers: {},
    steps: softwareDevTemplate
  }
];

// Helper functions
export function getTemplateById(id: string): OnboardingTemplateDefinition | undefined {
  return ONBOARDING_TEMPLATES.find(t => t.id === id);
}

export function getTemplateByProjectType(projectType: string): OnboardingTemplateDefinition | undefined {
  return ONBOARDING_TEMPLATES.find(t => t.projectType === projectType);
}

export function getAllTemplateOptions() {
  return ONBOARDING_TEMPLATES.map(t => ({
    value: t.id,
    label: t.name,
    description: t.description,
    estimatedTime: t.estimatedTime
  }));
}

// Alias for backward compatibility
export const getTemplateByType = getTemplateByProjectType;

export default ONBOARDING_TEMPLATES;