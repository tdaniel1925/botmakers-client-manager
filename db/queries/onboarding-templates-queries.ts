/**
 * Onboarding Templates Queries
 * Database queries for managing onboarding template library
 */

import { db } from "../db";
import { onboardingTemplatesLibraryTable, projectTypesRegistryTable } from "../schema/onboarding-schema";
import { eq, isNull, desc, sql, and } from "drizzle-orm";
import type { NewOnboardingTemplateLibrary, OnboardingTemplateLibrary } from "../schema/onboarding-schema";

/**
 * Get all active templates from library
 */
export async function getAllTemplates() {
  const templates = await db
    .select()
    .from(onboardingTemplatesLibraryTable)
    .where(isNull(onboardingTemplatesLibraryTable.archivedAt))
    .orderBy(desc(onboardingTemplatesLibraryTable.timesUsed));
  
  return templates;
}

/**
 * Get template by ID
 */
export async function getTemplateById(id: string) {
  const [template] = await db
    .select()
    .from(onboardingTemplatesLibraryTable)
    .where(eq(onboardingTemplatesLibraryTable.id, id))
    .limit(1);
  
  return template;
}

/**
 * Get template by project type
 */
export async function getTemplateByProjectType(projectType: string) {
  const [template] = await db
    .select()
    .from(onboardingTemplatesLibraryTable)
    .where(and(
      eq(onboardingTemplatesLibraryTable.projectType, projectType),
      isNull(onboardingTemplatesLibraryTable.archivedAt)
    ))
    .orderBy(desc(onboardingTemplatesLibraryTable.timesUsed))
    .limit(1);
  
  return template;
}

/**
 * Create new template
 */
export async function createTemplate(data: NewOnboardingTemplateLibrary) {
  const [template] = await db
    .insert(onboardingTemplatesLibraryTable)
    .values(data)
    .returning();
  
  return template;
}

/**
 * Update existing template
 */
export async function updateTemplate(id: string, data: Partial<OnboardingTemplateLibrary>) {
  const [updated] = await db
    .update(onboardingTemplatesLibraryTable)
    .set(data)
    .where(eq(onboardingTemplatesLibraryTable.id, id))
    .returning();
  
  return updated;
}

/**
 * Archive template (soft delete)
 */
export async function archiveTemplate(id: string) {
  const [archived] = await db
    .update(onboardingTemplatesLibraryTable)
    .set({ archivedAt: new Date() })
    .where(eq(onboardingTemplatesLibraryTable.id, id))
    .returning();
  
  return archived;
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsage(id: string) {
  await db
    .update(onboardingTemplatesLibraryTable)
    .set({ 
      timesUsed: sql`${onboardingTemplatesLibraryTable.timesUsed} + 1` 
    })
    .where(eq(onboardingTemplatesLibraryTable.id, id));
}

/**
 * Get template usage statistics
 */
export async function getTemplateStats(id: string) {
  const [stats] = await db
    .select({
      id: onboardingTemplatesLibraryTable.id,
      name: onboardingTemplatesLibraryTable.name,
      timesUsed: onboardingTemplatesLibraryTable.timesUsed,
      avgCompletionTime: onboardingTemplatesLibraryTable.avgCompletionTime,
      completionRate: onboardingTemplatesLibraryTable.completionRate,
    })
    .from(onboardingTemplatesLibraryTable)
    .where(eq(onboardingTemplatesLibraryTable.id, id))
    .limit(1);
  
  return stats;
}

/**
 * Update template statistics
 */
export async function updateTemplateStats(
  id: string,
  avgCompletionTime: number,
  completionRate: number
) {
  await db
    .update(onboardingTemplatesLibraryTable)
    .set({ 
      avgCompletionTime,
      completionRate: completionRate.toString(),
    })
    .where(eq(onboardingTemplatesLibraryTable.id, id));
}

/**
 * Get all project types
 */
export async function getAllProjectTypes() {
  const projectTypes = await db
    .select()
    .from(projectTypesRegistryTable)
    .where(eq(projectTypesRegistryTable.isActive, true))
    .orderBy(projectTypesRegistryTable.name);
  
  return projectTypes;
}

/**
 * Create new project type
 */
export async function createProjectType(data: {
  name: string;
  description?: string;
  templateId?: string;
}) {
  const [projectType] = await db
    .insert(projectTypesRegistryTable)
    .values(data)
    .returning();
  
  return projectType;
}

/**
 * Link project type to template
 */
export async function linkProjectTypeToTemplate(projectTypeName: string, templateId: string) {
  const [updated] = await db
    .update(projectTypesRegistryTable)
    .set({ templateId })
    .where(eq(projectTypesRegistryTable.name, projectTypeName))
    .returning();
  
  return updated;
}
