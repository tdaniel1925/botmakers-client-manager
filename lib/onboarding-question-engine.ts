/**
 * Onboarding Question Engine
 * Evaluates conditional logic and manages dynamic questionnaire flow
 */

export interface QuestionField {
  name: string;
  label: string;
  type: string;
  options?: any[];
  required: boolean;
  showIf?: ShowIfCondition | ShowIfCondition[];
  helpText?: string;
  placeholder?: string;
  aiPrompt?: string;
}

export interface ShowIfCondition {
  field: string;
  equals?: any;
  notEquals?: any;
  includes?: any;
  notIncludes?: any;
  fromStep?: string;
}

export interface ConditionalRule {
  condition: (responses: any) => boolean;
  affectedSteps: string[];
}

export interface QuestionStep {
  type: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  required: boolean;
  fields: QuestionField[];
}

/**
 * Evaluate if a field should be shown based on conditions
 */
export function evaluateShowIf(
  condition: ShowIfCondition | ShowIfCondition[],
  responses: any,
  currentStepResponses: any
): boolean {
  // Handle array of conditions (OR logic)
  if (Array.isArray(condition)) {
    return condition.some(c => evaluateSingleCondition(c, responses, currentStepResponses));
  }
  
  // Handle single condition
  return evaluateSingleCondition(condition, responses, currentStepResponses);
}

/**
 * Evaluate a single condition
 */
function evaluateSingleCondition(
  condition: ShowIfCondition,
  responses: any,
  currentStepResponses: any
): boolean {
  const { field, equals, notEquals, includes, notIncludes, fromStep } = condition;
  
  // Get the value to check
  let value;
  if (fromStep) {
    // Look in a specific previous step
    value = responses[fromStep]?.[field];
  } else {
    // Look in current step first, then all responses
    value = currentStepResponses?.[field] ?? responses[field];
    
    // If not found, search through all step responses
    if (value === undefined) {
      for (const stepKey in responses) {
        if (typeof responses[stepKey] === 'object' && responses[stepKey]?.[field] !== undefined) {
          value = responses[stepKey][field];
          break;
        }
      }
    }
  }
  
  // Evaluate condition
  if (equals !== undefined) {
    return value === equals;
  }
  
  if (notEquals !== undefined) {
    return value !== notEquals;
  }
  
  if (includes !== undefined) {
    if (Array.isArray(value)) {
      return value.includes(includes);
    }
    if (typeof value === 'string') {
      return value.includes(includes);
    }
    return false;
  }
  
  if (notIncludes !== undefined) {
    if (Array.isArray(value)) {
      return !value.includes(notIncludes);
    }
    if (typeof value === 'string') {
      return !value.includes(notIncludes);
    }
    return true;
  }
  
  return false;
}

/**
 * Get visible fields for a step based on responses
 */
export function getVisibleFields(
  step: QuestionStep,
  allResponses: any,
  currentStepResponses: any
): QuestionField[] {
  return step.fields.filter(field => {
    if (!field.showIf) {
      return true; // Always show if no condition
    }
    return evaluateShowIf(field.showIf, allResponses, currentStepResponses);
  });
}

/**
 * Evaluate conditional rules to determine which steps should be shown
 */
export function evaluateConditionalRules(
  rules: Record<string, ConditionalRule>,
  responses: any
): string[] {
  const visibleSteps: string[] = [];
  
  for (const [ruleKey, rule] of Object.entries(rules)) {
    try {
      if (rule.condition(responses)) {
        visibleSteps.push(...rule.affectedSteps);
      }
    } catch (error) {
      console.error(`Error evaluating rule ${ruleKey}:`, error);
    }
  }
  
  return visibleSteps;
}

/**
 * Determine if a step should be shown based on conditional rules
 */
export function shouldShowStep(
  stepId: string,
  conditionalRules: Record<string, ConditionalRule> | undefined,
  responses: any
): boolean {
  if (!conditionalRules) {
    return true; // No conditional rules, always show
  }
  
  // Check if any rule affects this step
  const visibleSteps = evaluateConditionalRules(conditionalRules, responses);
  
  // If no rules affect this step, show it by default
  const isAffectedByRules = Object.values(conditionalRules).some(rule =>
    rule.affectedSteps.includes(stepId)
  );
  
  if (!isAffectedByRules) {
    return true;
  }
  
  // If affected by rules, only show if in visible steps
  return visibleSteps.includes(stepId);
}

/**
 * Validate required fields in a step
 */
export function validateStepFields(
  step: QuestionStep,
  stepData: any,
  allResponses: any
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  const visibleFields = getVisibleFields(step, allResponses, stepData);
  
  for (const field of visibleFields) {
    if (field.required) {
      const value = stepData?.[field.name];
      
      if (value === undefined || value === null || value === '') {
        errors[field.name] = `${field.label} is required`;
      }
      
      // Additional validation for arrays (checkbox fields)
      if (Array.isArray(value) && value.length === 0) {
        errors[field.name] = `${field.label} requires at least one selection`;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Calculate completion percentage dynamically based on visible steps
 */
export function calculateCompletionPercentage(
  currentStepIndex: number,
  totalSteps: number,
  conditionalRules: Record<string, ConditionalRule> | undefined,
  responses: any,
  allSteps: any[]
): number {
  if (!conditionalRules) {
    // Simple calculation if no conditional logic
    return Math.round((currentStepIndex / totalSteps) * 100);
  }
  
  // Count visible steps up to current index
  let visibleStepsCount = 0;
  let totalVisibleSteps = 0;
  
  allSteps.forEach((step, index) => {
    const stepId = `step${index}`;
    const isVisible = shouldShowStep(stepId, conditionalRules, responses);
    
    if (isVisible) {
      totalVisibleSteps++;
      if (index <= currentStepIndex) {
        visibleStepsCount++;
      }
    }
  });
  
  if (totalVisibleSteps === 0) {
    return 0;
  }
  
  return Math.round((visibleStepsCount / totalVisibleSteps) * 100);
}

/**
 * Get next visible step index
 */
export function getNextVisibleStep(
  currentStepIndex: number,
  allSteps: any[],
  conditionalRules: Record<string, ConditionalRule> | undefined,
  responses: any
): number {
  if (!conditionalRules) {
    return currentStepIndex + 1;
  }
  
  // Find next visible step
  for (let i = currentStepIndex + 1; i < allSteps.length; i++) {
    const stepId = `step${i}`;
    if (shouldShowStep(stepId, conditionalRules, responses)) {
      return i;
    }
  }
  
  // No more visible steps
  return allSteps.length;
}

/**
 * Get previous visible step index
 */
export function getPreviousVisibleStep(
  currentStepIndex: number,
  allSteps: any[],
  conditionalRules: Record<string, ConditionalRule> | undefined,
  responses: any
): number {
  if (!conditionalRules) {
    return Math.max(0, currentStepIndex - 1);
  }
  
  // Find previous visible step
  for (let i = currentStepIndex - 1; i >= 0; i--) {
    const stepId = `step${i}`;
    if (shouldShowStep(stepId, conditionalRules, responses)) {
      return i;
    }
  }
  
  // Already at first visible step
  return 0;
}

/**
 * Evaluate industry-specific triggers
 */
export function evaluateIndustryTriggers(
  industryTriggers: Record<string, any> | undefined,
  responses: any
): {
  triggeredIndustries: string[];
  additionalQuestions: string[];
  complianceWarnings: string[];
} {
  const result = {
    triggeredIndustries: [] as string[],
    additionalQuestions: [] as string[],
    complianceWarnings: [] as string[],
  };
  
  if (!industryTriggers) {
    return result;
  }
  
  for (const [industry, trigger] of Object.entries(industryTriggers)) {
    const { triggerField, triggerValue, additionalQuestions, complianceWarnings } = trigger;
    
    // Check if industry is triggered
    let fieldValue;
    for (const stepKey in responses) {
      if (typeof responses[stepKey] === 'object' && responses[stepKey]?.[triggerField]) {
        fieldValue = responses[stepKey][triggerField];
        break;
      }
    }
    
    if (fieldValue === triggerValue) {
      result.triggeredIndustries.push(industry);
      if (additionalQuestions) {
        result.additionalQuestions.push(...additionalQuestions);
      }
      if (complianceWarnings) {
        result.complianceWarnings.push(...complianceWarnings);
      }
    }
  }
  
  return result;
}

/**
 * Get all visible steps for the entire questionnaire
 */
export function getAllVisibleSteps(
  allSteps: any[],
  conditionalRules: Record<string, ConditionalRule> | undefined,
  responses: any
): number[] {
  if (!conditionalRules) {
    return allSteps.map((_, index) => index);
  }
  
  const visibleIndices: number[] = [];
  
  allSteps.forEach((step, index) => {
    const stepId = `step${index}`;
    if (shouldShowStep(stepId, conditionalRules, responses)) {
      visibleIndices.push(index);
    }
  });
  
  return visibleIndices;
}
