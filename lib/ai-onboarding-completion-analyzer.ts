/**
 * AI Onboarding Completion Analyzer
 * Analyzes completed onboarding sessions to extract insights and requirements
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface OnboardingAnalysis {
  projectRequirements: {
    technical: string[];
    functional: string[];
    integrations: string[];
  };
  complianceNeeds: {
    regulations: string[];
    certifications: string[];
    warnings: string[];
  };
  projectComplexity: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    estimatedEffort: string;
  };
  missingInformation: {
    critical: string[];
    recommended: string[];
  };
  recommendations: string[];
  risks: string[];
}

/**
 * Analyze completed onboarding session
 */
export async function analyzeCompletedOnboarding(
  projectType: string,
  responses: any
): Promise<OnboardingAnalysis> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not set, using fallback analysis');
      return fallbackAnalysis(projectType, responses);
    }

    const prompt = `Analyze this completed client onboarding for a ${projectType} project.

Onboarding Responses:
${JSON.stringify(responses, null, 2)}

Provide a comprehensive analysis including:
1. Project Requirements (technical, functional, integrations needed)
2. Compliance Needs (regulations, certifications, warnings)
3. Project Complexity (low/medium/high with factors and estimated effort)
4. Missing Information (critical and recommended items)
5. Recommendations for successful project execution
6. Potential Risks to address

Return ONLY valid JSON in this exact format:
{
  "projectRequirements": {
    "technical": ["string"],
    "functional": ["string"],
    "integrations": ["string"]
  },
  "complianceNeeds": {
    "regulations": ["string"],
    "certifications": ["string"],
    "warnings": ["string"]
  },
  "projectComplexity": {
    "level": "low|medium|high",
    "factors": ["string"],
    "estimatedEffort": "string"
  },
  "missingInformation": {
    "critical": ["string"],
    "recommended": ["string"]
  },
  "recommendations": ["string"],
  "risks": ["string"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert business analyst who evaluates project requirements. Return only valid JSON, no markdown.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing onboarding with OpenAI:', error);
    return fallbackAnalysis(projectType, responses);
  }
}

/**
 * Extract technical requirements from responses
 */
export function identifyProjectRequirements(responses: any): {
  technical: string[];
  functional: string[];
  integrations: string[];
} {
  const requirements = {
    technical: [] as string[],
    functional: [] as string[],
    integrations: [] as string[],
  };

  // Extract from responses
  Object.entries(responses).forEach(([key, value]: [string, any]) => {
    if (typeof value === 'object' && value !== null) {
      // Check for CRM mentions
      if (value.crm_system && value.crm_system !== 'No CRM' && value.crm_system !== 'None') {
        requirements.integrations.push(`${value.crm_system} CRM integration`);
      }
      
      // Check for calendar system
      if (value.calendar_system && value.calendar_system !== 'None (manual booking)') {
        requirements.integrations.push(`${value.calendar_system} calendar integration`);
      }
      
      // Check for phone system
      if (value.existing_phone_system && value.existing_phone_system !== 'none') {
        requirements.technical.push(`Integration with existing ${value.existing_phone_system} phone system`);
      }
      
      // Check for AI capabilities
      if (value.calling_method === 'ai_voice' || value.calling_method === 'hybrid') {
        requirements.technical.push('AI voice agent setup');
      }
      
      // Check for call recording
      if (value.call_recording === 'yes_all' || value.call_recording === 'all') {
        requirements.technical.push('Call recording system with compliant storage');
      }
    }
  });

  return requirements;
}

/**
 * Detect compliance and regulatory needs
 */
export function detectComplianceNeeds(projectType: string, responses: any): {
  regulations: string[];
  certifications: string[];
  warnings: string[];
} {
  const compliance = {
    regulations: [] as string[],
    certifications: [] as string[],
    warnings: [] as string[],
  };

  // Check industry-specific compliance
  Object.entries(responses).forEach(([key, value]: [string, any]) => {
    if (typeof value === 'object' && value !== null) {
      const industry = value.industry;
      
      if (industry === 'Healthcare') {
        compliance.regulations.push('HIPAA');
        compliance.warnings.push('PHI data handling requires special security measures');
        compliance.certifications.push('HIPAA compliance certification may be required');
      }
      
      if (industry === 'Financial Services' || industry === 'Insurance') {
        compliance.regulations.push('GLBA', 'SEC regulations');
        compliance.warnings.push('Financial data requires encrypted storage and transmission');
      }
      
      // Check for call recording compliance
      if (value.call_recording && value.call_recording !== 'no') {
        compliance.regulations.push('Two-party consent laws (state-dependent)');
        compliance.warnings.push('Recording consent disclosure required at start of calls');
      }
      
      // Check for TCPA compliance (outbound calling)
      if (projectType === 'outbound_calling') {
        compliance.regulations.push('TCPA', 'Do Not Call Registry');
        compliance.warnings.push('DNC list scrubbing required before calling');
      }
      
      // Check for data privacy
      if (value.sensitive_data && Array.isArray(value.sensitive_data)) {
        if (value.sensitive_data.includes('Credit card details')) {
          compliance.regulations.push('PCI-DSS');
          compliance.certifications.push('PCI compliance required');
        }
        if (value.sensitive_data.includes('Social Security numbers')) {
          compliance.warnings.push('SSN handling requires strict data protection measures');
        }
      }
    }
  });

  return compliance;
}

/**
 * Calculate project complexity
 */
export function calculateProjectComplexity(
  projectType: string,
  responses: any
): {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  estimatedEffort: string;
} {
  let complexityScore = 0;
  const factors: string[] = [];

  Object.entries(responses).forEach(([key, value]: [string, any]) => {
    if (typeof value === 'object' && value !== null) {
      // Check call volume (for calling projects)
      if (value.call_volume) {
        if (value.call_volume === '500-1000' || value.call_volume === '1000+') {
          complexityScore += 2;
          factors.push('High call volume requires robust infrastructure');
        }
      }
      
      // Check list size (for outbound)
      if (value.list_size) {
        if (value.list_size === '5000-10000' || value.list_size === '10000+') {
          complexityScore += 2;
          factors.push('Large contact list requires careful management');
        }
      }
      
      // Check for multi-department routing
      if (value.department_routing && value.department_routing !== 'no') {
        complexityScore += 1;
        factors.push('Multi-department routing adds complexity');
      }
      
      // Check for integrations
      if (value.integrations_needed && Array.isArray(value.integrations_needed)) {
        const integrationCount = value.integrations_needed.filter((i: string) => i !== 'None').length;
        if (integrationCount > 3) {
          complexityScore += 2;
          factors.push('Multiple integrations required');
        } else if (integrationCount > 0) {
          complexityScore += 1;
        }
      }
      
      // Check for AI features
      if (value.ai_capabilities && Array.isArray(value.ai_capabilities)) {
        const aiFeatures = value.ai_capabilities.filter((f: string) => f !== 'None (all calls to humans)').length;
        if (aiFeatures > 3) {
          complexityScore += 2;
          factors.push('Advanced AI capabilities require custom training');
        }
      }
      
      // Check for hybrid staffing
      if (value.calling_method === 'hybrid' || value.staffing_model === 'hybrid') {
        complexityScore += 1;
        factors.push('Hybrid AI-human workflow requires careful orchestration');
      }
    }
  });

  // Determine level and effort
  let level: 'low' | 'medium' | 'high';
  let estimatedEffort: string;
  
  if (complexityScore <= 2) {
    level = 'low';
    estimatedEffort = '1-2 weeks';
  } else if (complexityScore <= 5) {
    level = 'medium';
    estimatedEffort = '2-4 weeks';
  } else {
    level = 'high';
    estimatedEffort = '4-8 weeks';
  }

  if (factors.length === 0) {
    factors.push('Standard project configuration');
  }

  return { level, factors, estimatedEffort };
}

/**
 * Identify missing critical information
 */
export function detectMissingInfo(responses: any): {
  critical: string[];
  recommended: string[];
} {
  const missing = {
    critical: [] as string[],
    recommended: [] as string[],
  };

  // Check for common missing items across all response steps
  let hasContactInfo = false;
  let hasScript = false;
  let hasList = false;

  Object.entries(responses).forEach(([key, value]: [string, any]) => {
    if (typeof value === 'object' && value !== null) {
      if (value.script_status === 'yes_complete' || value.script_status === 'yes_draft') {
        hasScript = true;
      }
      if (value.list_available === 'yes_ready') {
        hasList = true;
      }
      if (value.phone_number || value.calendar_link) {
        hasContactInfo = true;
      }
    }
  });

  if (!hasScript) {
    missing.critical.push('Call script or messaging not provided');
  }
  if (!hasList) {
    missing.recommended.push('Contact list not yet provided - will need before launch');
  }

  return missing;
}

// ============================================================================
// Fallback Functions
// ============================================================================

function fallbackAnalysis(projectType: string, responses: any): OnboardingAnalysis {
  return {
    projectRequirements: identifyProjectRequirements(responses),
    complianceNeeds: detectComplianceNeeds(projectType, responses),
    projectComplexity: calculateProjectComplexity(projectType, responses),
    missingInformation: detectMissingInfo(responses),
    recommendations: [
      'Review all onboarding responses for completeness',
      'Schedule kickoff call to clarify requirements',
      'Create detailed project timeline',
    ],
    risks: [
      'Incomplete information may delay project start',
      'Ensure all compliance requirements are met before launch',
    ],
  };
}
