/**
 * Condition Evaluator
 * Evaluates conditional logic for dynamic onboarding flows
 */

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "is_empty"
  | "is_not_empty"
  | "in_array"
  | "not_in_array"
  | "matches_regex";

export interface SimpleCondition {
  field: string;
  operator: ConditionOperator;
  value?: any;
}

export interface ComplexCondition {
  all?: (SimpleCondition | ComplexCondition)[];
  any?: (SimpleCondition | ComplexCondition)[];
}

export type Condition = SimpleCondition | ComplexCondition;

/**
 * Evaluates a simple condition against responses
 */
export function evaluateSimpleCondition(
  condition: SimpleCondition,
  responses: Record<string, any>
): boolean {
  const { field, operator, value } = condition;
  const responseValue = responses[field];

  switch (operator) {
    case "equals":
      return responseValue === value;

    case "not_equals":
      return responseValue !== value;

    case "contains":
      if (typeof responseValue === "string") {
        return responseValue.includes(String(value));
      }
      if (Array.isArray(responseValue)) {
        return responseValue.includes(value);
      }
      return false;

    case "not_contains":
      if (typeof responseValue === "string") {
        return !responseValue.includes(String(value));
      }
      if (Array.isArray(responseValue)) {
        return !responseValue.includes(value);
      }
      return true;

    case "greater_than":
      return Number(responseValue) > Number(value);

    case "less_than":
      return Number(responseValue) < Number(value);

    case "greater_than_or_equal":
      return Number(responseValue) >= Number(value);

    case "less_than_or_equal":
      return Number(responseValue) <= Number(value);

    case "is_empty":
      return (
        responseValue === null ||
        responseValue === undefined ||
        responseValue === "" ||
        (Array.isArray(responseValue) && responseValue.length === 0)
      );

    case "is_not_empty":
      return !(
        responseValue === null ||
        responseValue === undefined ||
        responseValue === "" ||
        (Array.isArray(responseValue) && responseValue.length === 0)
      );

    case "in_array":
      return Array.isArray(value) && value.includes(responseValue);

    case "not_in_array":
      return Array.isArray(value) && !value.includes(responseValue);

    case "matches_regex":
      try {
        const regex = new RegExp(String(value));
        return regex.test(String(responseValue));
      } catch {
        return false;
      }

    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

/**
 * Evaluates a condition (simple or complex) against responses
 */
export function evaluateCondition(
  condition: Condition,
  responses: Record<string, any>
): boolean {
  // Check if it's a complex condition with "all" (AND logic)
  if ("all" in condition && condition.all) {
    return condition.all.every((subCondition) =>
      evaluateCondition(subCondition, responses)
    );
  }

  // Check if it's a complex condition with "any" (OR logic)
  if ("any" in condition && condition.any) {
    return condition.any.some((subCondition) =>
      evaluateCondition(subCondition, responses)
    );
  }

  // Otherwise, it's a simple condition
  return evaluateSimpleCondition(condition as SimpleCondition, responses);
}

/**
 * Gets visible step indices based on conditions
 */
export function getVisibleSteps(
  steps: any[],
  responses: Record<string, any>
): number[] {
  const visibleIndices: number[] = [];

  steps.forEach((step, index) => {
    // If step has no condition, it's always visible
    if (!step.condition) {
      visibleIndices.push(index);
      return;
    }

    // Evaluate condition
    const isVisible = evaluateCondition(step.condition, responses);
    if (isVisible) {
      visibleIndices.push(index);
    }
  });

  return visibleIndices;
}

/**
 * Gets skipped step indices based on conditions
 */
export function getSkippedSteps(
  steps: any[],
  responses: Record<string, any>
): number[] {
  const skippedIndices: number[] = [];

  steps.forEach((step, index) => {
    if (step.condition) {
      const isVisible = evaluateCondition(step.condition, responses);
      if (!isVisible) {
        skippedIndices.push(index);
      }
    }
  });

  return skippedIndices;
}

/**
 * Validates condition for circular dependencies and syntax errors
 */
export function validateCondition(
  condition: Condition,
  maxDepth: number = 10,
  currentDepth: number = 0
): { valid: boolean; error?: string } {
  if (currentDepth > maxDepth) {
    return {
      valid: false,
      error: `Condition nesting too deep (max ${maxDepth})`,
    };
  }

  // Validate complex condition
  if ("all" in condition && condition.all) {
    for (const subCondition of condition.all) {
      const result = validateCondition(subCondition, maxDepth, currentDepth + 1);
      if (!result.valid) return result;
    }
    return { valid: true };
  }

  if ("any" in condition && condition.any) {
    for (const subCondition of condition.any) {
      const result = validateCondition(subCondition, maxDepth, currentDepth + 1);
      if (!result.valid) return result;
    }
    return { valid: true };
  }

  // Validate simple condition
  const simple = condition as SimpleCondition;
  if (!simple.field) {
    return { valid: false, error: "Condition must have a field" };
  }

  if (!simple.operator) {
    return { valid: false, error: "Condition must have an operator" };
  }

  const validOperators: ConditionOperator[] = [
    "equals",
    "not_equals",
    "contains",
    "not_contains",
    "greater_than",
    "less_than",
    "greater_than_or_equal",
    "less_than_or_equal",
    "is_empty",
    "is_not_empty",
    "in_array",
    "not_in_array",
    "matches_regex",
  ];

  if (!validOperators.includes(simple.operator)) {
    return { valid: false, error: `Invalid operator: ${simple.operator}` };
  }

  return { valid: true };
}

/**
 * Calculates dynamic completion percentage based on visible steps
 */
export function calculateDynamicProgress(
  currentStep: number,
  visibleSteps: number[]
): number {
  if (visibleSteps.length === 0) return 0;

  const currentStepIndex = visibleSteps.indexOf(currentStep);
  if (currentStepIndex === -1) return 0;

  return Math.round(((currentStepIndex + 1) / visibleSteps.length) * 100);
}
