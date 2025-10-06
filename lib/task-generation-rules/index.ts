/**
 * Task Generation Rules Index
 * Exports all task generation rules by template type
 */

import { TaskGenerationRule } from "../onboarding-task-mapper";
import { webDesignRules } from "./web-design-rules";
import { voiceAIRules } from "./voice-ai-rules";
import { softwareDevRules } from "./software-dev-rules";
import { genericRules } from "./generic-rules";

export { webDesignRules, voiceAIRules, softwareDevRules, genericRules };

/**
 * Get task generation rules for a specific project type
 */
export function getRulesForProjectType(projectType: string): TaskGenerationRule[] {
  // Normalize project type
  const normalizedType = projectType.toLowerCase().replace(/[\s-_]/g, "");

  // Template-specific rules
  let templateRules: TaskGenerationRule[] = [];

  if (normalizedType.includes("web") || normalizedType.includes("website") || normalizedType.includes("design")) {
    templateRules = webDesignRules;
  } else if (normalizedType.includes("voice") || normalizedType.includes("ai") || normalizedType.includes("campaign")) {
    templateRules = voiceAIRules;
  } else if (
    normalizedType.includes("software") ||
    normalizedType.includes("app") ||
    normalizedType.includes("development") ||
    normalizedType.includes("saas")
  ) {
    templateRules = softwareDevRules;
  }

  // Always include generic rules that apply to all projects
  return [...templateRules, ...genericRules];
}

/**
 * Get all available project types
 */
export function getAvailableProjectTypes(): string[] {
  return ["Web Design", "Voice AI Campaign", "Software Development", "Generic"];
}

/**
 * Get rule count for a project type
 */
export function getRuleCount(projectType: string): number {
  return getRulesForProjectType(projectType).length;
}

/**
 * Get all rules (for admin/debugging)
 */
export function getAllRules(): Record<string, TaskGenerationRule[]> {
  return {
    webDesign: webDesignRules,
    voiceAI: voiceAIRules,
    softwareDev: softwareDevRules,
    generic: genericRules,
  };
}

/**
 * Search rules by keyword
 */
export function searchRules(keyword: string): TaskGenerationRule[] {
  const allRules = [
    ...webDesignRules,
    ...voiceAIRules,
    ...softwareDevRules,
    ...genericRules,
  ];

  const searchTerm = keyword.toLowerCase();

  return allRules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchTerm) ||
      rule.description.toLowerCase().includes(searchTerm) ||
      rule.id.toLowerCase().includes(searchTerm)
  );
}

export default {
  getRulesForProjectType,
  getAvailableProjectTypes,
  getRuleCount,
  getAllRules,
  searchRules,
};
