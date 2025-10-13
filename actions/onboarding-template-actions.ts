/**
 * Onboarding Template Actions
 * Server actions for managing onboarding template library
 */

'use server';

import { revalidatePath } from 'next/cache';
import {
  getAllTemplates,
  getTemplateById,
  getTemplateByProjectType,
  createTemplate,
  updateTemplate,
  archiveTemplate,
  incrementTemplateUsage,
  getTemplateStats,
  getAllProjectTypes,
  createProjectType,
  linkProjectTypeToTemplate,
} from '../db/queries/onboarding-templates-queries';
import { ONBOARDING_TEMPLATES, getTemplateById as getStaticTemplate } from '../lib/onboarding-templates';
import type { ActionResult } from '../types/actions/actions-types';
import type { OnboardingTemplateLibrary, NewOnboardingTemplateLibrary } from '../db/schema/onboarding-schema';

/**
 * Get all available templates
 */
export async function getTemplateLibraryAction(): Promise<ActionResult<OnboardingTemplateLibrary[]>> {
  try {
    const templates = await getAllTemplates();
    
    return {
      isSuccess: true,
      message: 'Templates retrieved successfully',
      data: templates,
    };
  } catch (error) {
    console.error('Error getting template library:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to get templates',
    };
  }
}

/**
 * Get template by ID
 */
export async function getTemplateByIdAction(id: string): Promise<ActionResult<OnboardingTemplateLibrary>> {
  try {
    const template = await getTemplateById(id);
    
    if (!template) {
      return {
        isSuccess: false,
        message: 'Template not found',
      };
    }
    
    return {
      isSuccess: true,
      message: 'Template retrieved successfully',
      data: template,
    };
  } catch (error) {
    console.error('Error getting template:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to get template',
    };
  }
}

/**
 * Get built-in templates (from code)
 */
export async function getBuiltInTemplatesAction(): Promise<ActionResult<typeof ONBOARDING_TEMPLATES>> {
  try {
    return {
      isSuccess: true,
      message: 'Built-in templates retrieved successfully',
      data: ONBOARDING_TEMPLATES,
    };
  } catch (error) {
    console.error('Error getting built-in templates:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to get built-in templates',
    };
  }
}

/**
 * Save built-in template to database
 */
export async function saveBuiltInTemplateAction(templateId: string, createdBy?: string): Promise<ActionResult<OnboardingTemplateLibrary>> {
  try {
    const staticTemplate = getStaticTemplate(templateId);
    
    if (!staticTemplate) {
      return {
        isSuccess: false,
        message: 'Template not found',
      };
    }
    
    // Check if already exists
    const existing = await getTemplateByProjectType(staticTemplate.projectType);
    if (existing) {
      return {
        isSuccess: false,
        message: 'Template already exists in database',
      };
    }
    
    const templateData: NewOnboardingTemplateLibrary = {
      name: staticTemplate.name,
      projectType: staticTemplate.projectType,
      description: staticTemplate.description,
      questions: staticTemplate.steps as any,
      conditionalRules: staticTemplate.conditionalRules as any,
      industryTriggers: staticTemplate.industryTriggers as any,
      isAiGenerated: false,
      isCustom: false,
      avgCompletionTime: staticTemplate.estimatedTime,
      createdBy,
    };
    
    const created = await createTemplate(templateData);
    
    revalidatePath('/platform/onboarding/templates');
    
    return {
      isSuccess: true,
      message: 'Template saved successfully',
      data: created,
    };
  } catch (error) {
    console.error('Error saving built-in template:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to save template',
    };
  }
}

/**
 * Create custom template (AI-generated or manual)
 */
export async function createCustomTemplateAction(
  templateData: NewOnboardingTemplateLibrary
): Promise<ActionResult<OnboardingTemplateLibrary>> {
  try {
    const created = await createTemplate({
      ...templateData,
      isCustom: true,
    });
    
    revalidatePath('/platform/onboarding/templates');
    
    return {
      isSuccess: true,
      message: 'Template created successfully',
      data: created,
    };
  } catch (error) {
    console.error('Error creating template:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to create template',
    };
  }
}

/**
 * Update existing template
 */
export async function updateTemplateAction(
  id: string,
  changes: Partial<OnboardingTemplateLibrary>
): Promise<ActionResult<OnboardingTemplateLibrary>> {
  try {
    const updated = await updateTemplate(id, changes);
    
    if (!updated) {
      return {
        isSuccess: false,
        message: 'Template not found',
      };
    }
    
    revalidatePath('/platform/onboarding/templates');
    revalidatePath(`/platform/onboarding/templates/${id}`);
    
    return {
      isSuccess: true,
      message: 'Template updated successfully',
      data: updated,
    };
  } catch (error) {
    console.error('Error updating template:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to update template',
    };
  }
}

/**
 * Archive template (soft delete)
 */
export async function archiveTemplateAction(id: string): Promise<ActionResult<OnboardingTemplateLibrary>> {
  try {
    const archived = await archiveTemplate(id);
    
    if (!archived) {
      return {
        isSuccess: false,
        message: 'Template not found',
      };
    }
    
    revalidatePath('/platform/onboarding/templates');
    
    return {
      isSuccess: true,
      message: 'Template archived successfully',
      data: archived,
    };
  } catch (error) {
    console.error('Error archiving template:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to archive template',
    };
  }
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsageAction(id: string): Promise<ActionResult<void>> {
  try {
    await incrementTemplateUsage(id);
    
    revalidatePath('/platform/onboarding/templates');
    
    return {
      isSuccess: true,
      message: 'Usage count updated',
    };
  } catch (error) {
    console.error('Error incrementing template usage:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to update usage count',
    };
  }
}

/**
 * Get template usage statistics
 */
export async function getTemplateStatsAction(id: string): Promise<ActionResult<any>> {
  try {
    const stats = await getTemplateStats(id);
    
    if (!stats) {
      return {
        isSuccess: false,
        message: 'Template not found',
      };
    }
    
    return {
      isSuccess: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  } catch (error) {
    console.error('Error getting template stats:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to get statistics',
    };
  }
}

/**
 * Get all project types
 */
export async function getAllProjectTypesAction(): Promise<ActionResult<any[]>> {
  try {
    const projectTypes = await getAllProjectTypes();
    
    return {
      isSuccess: true,
      message: 'Project types retrieved successfully',
      data: projectTypes,
    };
  } catch (error) {
    console.error('Error getting project types:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to get project types',
    };
  }
}

/**
 * Create new project type
 */
export async function createProjectTypeAction(
  name: string,
  description?: string,
  templateId?: string
): Promise<ActionResult<any>> {
  try {
    const projectType = await createProjectType({ name, description, templateId });
    
    revalidatePath('/platform/onboarding/templates');
    
    return {
      isSuccess: true,
      message: 'Project type created successfully',
      data: projectType,
    };
  } catch (error) {
    console.error('Error creating project type:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to create project type',
    };
  }
}

/**
 * Link project type to template
 */
export async function linkProjectTypeToTemplateAction(
  projectTypeName: string,
  templateId: string
): Promise<ActionResult<any>> {
  try {
    const updated = await linkProjectTypeToTemplate(projectTypeName, templateId);
    
    if (!updated) {
      return {
        isSuccess: false,
        message: 'Project type not found',
      };
    }
    
    revalidatePath('/platform/onboarding/templates');
    
    return {
      isSuccess: true,
      message: 'Project type linked to template successfully',
      data: updated,
    };
  } catch (error) {
    console.error('Error linking project type to template:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to link project type',
    };
  }
}
