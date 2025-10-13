/**
 * AI To-Do List Generator
 * Generates actionable to-do lists for admins and clients based on onboarding responses
 */

import OpenAI from 'openai';
import type { NewOnboardingTodo } from '../db/schema/onboarding-schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TodoGenerationResult {
  adminTodos: NewOnboardingTodo[];
  clientTodos: NewOnboardingTodo[];
  analysis: {
    complexity: 'low' | 'medium' | 'high';
    estimatedSetupTime: string;
    criticalIssues: string[];
    recommendations: string[];
  };
}

/**
 * Generate comprehensive to-do lists for both admin and client
 */
export async function generateTodosFromOnboarding(
  sessionId: string,
  projectType: string,
  onboardingResponses: any
): Promise<TodoGenerationResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not set, using fallback logic');
      return fallbackTodoGeneration(sessionId, projectType, onboardingResponses);
    }

    const prompt = `You are an expert project manager analyzing client onboarding responses. Generate comprehensive, actionable to-do lists for both the admin team and the client.

Project Type: ${projectType}
Onboarding Responses:
${JSON.stringify(onboardingResponses, null, 2)}

Generate two separate to-do lists:

1. ADMIN TO-DOS: Tasks the agency/admin must complete
2. CLIENT TO-DOS: Tasks the client must complete

For each to-do, provide:
- title: Clear, actionable title (max 60 chars)
- description: Detailed explanation
- category: One of: setup, compliance, content, integration, review, technical, planning
- priority: high, medium, or low
- estimatedMinutes: Realistic time estimate

Also analyze:
- Project complexity (low/medium/high)
- Estimated total setup time
- Critical issues or red flags
- Recommendations

Return ONLY valid JSON in this exact format:
{
  "adminTodos": [
    {
      "title": "string",
      "description": "string",
      "category": "string",
      "priority": "string",
      "estimatedMinutes": number
    }
  ],
  "clientTodos": [...],
  "analysis": {
    "complexity": "string",
    "estimatedSetupTime": "string",
    "criticalIssues": ["string"],
    "recommendations": ["string"]
  }
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert project manager who creates detailed, actionable to-do lists. Return only valid JSON, no markdown.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse and structure the response
    const result = JSON.parse(content);
    
    // Add session ID and ordering to each todo
    const adminTodos = result.adminTodos.map((todo: any, index: number) => ({
      sessionId,
      type: 'admin',
      title: todo.title,
      description: todo.description,
      category: todo.category,
      priority: todo.priority,
      estimatedMinutes: todo.estimatedMinutes,
      orderIndex: index,
      aiGenerated: true,
    }));

    const clientTodos = result.clientTodos.map((todo: any, index: number) => ({
      sessionId,
      type: 'client',
      title: todo.title,
      description: todo.description,
      category: todo.category,
      priority: todo.priority,
      estimatedMinutes: todo.estimatedMinutes,
      orderIndex: index,
      aiGenerated: true,
    }));

    return {
      adminTodos,
      clientTodos,
      analysis: result.analysis,
    };
  } catch (error) {
    console.error('Error generating todos with OpenAI:', error);
    return fallbackTodoGeneration(sessionId, projectType, onboardingResponses);
  }
}

/**
 * Generate admin-specific todos
 */
export async function generateAdminTodos(
  sessionId: string,
  projectType: string,
  onboardingResponses: any
): Promise<NewOnboardingTodo[]> {
  const result = await generateTodosFromOnboarding(sessionId, projectType, onboardingResponses);
  return result.adminTodos;
}

/**
 * Generate client-specific todos
 */
export async function generateClientTodos(
  sessionId: string,
  projectType: string,
  onboardingResponses: any
): Promise<NewOnboardingTodo[]> {
  const result = await generateTodosFromOnboarding(sessionId, projectType, onboardingResponses);
  return result.clientTodos;
}

/**
 * Prioritize todos based on dependencies and urgency
 */
export function prioritizeTasks(todos: NewOnboardingTodo[]): NewOnboardingTodo[] {
  // Sort by priority: high > medium > low, then by orderIndex
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  
  return todos.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - 
                        priorityOrder[b.priority as keyof typeof priorityOrder];
    if (priorityDiff !== 0) return priorityDiff;
    return (a.orderIndex || 0) - (b.orderIndex || 0);
  });
}

/**
 * Detect dependencies between todos
 */
export function detectDependencies(todos: NewOnboardingTodo[]): NewOnboardingTodo[] {
  // Simple dependency detection based on keywords and categories
  const updatedTodos = [...todos];
  
  // Rules for common dependencies
  updatedTodos.forEach((todo, index) => {
    const deps: number[] = [];
    
    // If integration task, depends on setup tasks
    if (todo.category === 'integration') {
      const setupIndex = updatedTodos.findIndex(t => t.category === 'setup');
      if (setupIndex !== -1 && setupIndex < index) {
        deps.push(setupIndex);
      }
    }
    
    // If review task, depends on content tasks
    if (todo.category === 'review') {
      const contentIndex = updatedTodos.findIndex(t => t.category === 'content');
      if (contentIndex !== -1 && contentIndex < index) {
        deps.push(contentIndex);
      }
    }
    
    if (deps.length > 0) {
      updatedTodos[index].dependencies = JSON.stringify(deps) as any;
    }
  });
  
  return updatedTodos;
}

/**
 * Categorize task based on content
 */
export function categorizeTask(task: { title: string; description: string }): string {
  const content = `${task.title} ${task.description}`.toLowerCase();
  
  if (content.includes('compliance') || content.includes('legal') || content.includes('hipaa') || content.includes('gdpr')) {
    return 'compliance';
  }
  if (content.includes('integrate') || content.includes('api') || content.includes('connect')) {
    return 'integration';
  }
  if (content.includes('content') || content.includes('copy') || content.includes('script') || content.includes('write')) {
    return 'content';
  }
  if (content.includes('setup') || content.includes('configure') || content.includes('install')) {
    return 'setup';
  }
  if (content.includes('review') || content.includes('approve') || content.includes('check')) {
    return 'review';
  }
  if (content.includes('technical') || content.includes('code') || content.includes('develop')) {
    return 'technical';
  }
  
  return 'planning';
}

/**
 * Estimate task duration based on complexity
 */
export function estimateTaskDuration(task: { title: string; description: string; category: string }): number {
  // Base estimates by category (in minutes)
  const categoryEstimates: Record<string, number> = {
    setup: 30,
    compliance: 45,
    content: 60,
    integration: 90,
    review: 20,
    technical: 120,
    planning: 30,
  };
  
  let estimate = categoryEstimates[task.category] || 30;
  
  // Adjust based on keywords suggesting complexity
  const content = `${task.title} ${task.description}`.toLowerCase();
  if (content.includes('complex') || content.includes('advanced') || content.includes('custom')) {
    estimate *= 1.5;
  }
  if (content.includes('simple') || content.includes('basic') || content.includes('quick')) {
    estimate *= 0.7;
  }
  
  return Math.round(estimate);
}

// ============================================================================
// Fallback Functions (when OpenAI is not available)
// ============================================================================

function fallbackTodoGeneration(
  sessionId: string,
  projectType: string,
  onboardingResponses: any
): TodoGenerationResult {
  // Generate basic todos based on project type
  let adminTodos: NewOnboardingTodo[] = [];
  let clientTodos: NewOnboardingTodo[] = [];
  
  if (projectType === 'outbound_calling' || projectType === 'voice_ai') {
    adminTodos = [
      {
        sessionId,
        type: 'admin',
        title: 'Review campaign requirements',
        description: 'Review all onboarding responses and validate campaign requirements',
        category: 'review',
        priority: 'high',
        estimatedMinutes: 30,
        orderIndex: 0,
        aiGenerated: true,
      },
      {
        sessionId,
        type: 'admin',
        title: 'Scrub call list against DNC',
        description: 'Ensure call list complies with Do Not Call regulations',
        category: 'compliance',
        priority: 'high',
        estimatedMinutes: 45,
        orderIndex: 1,
        aiGenerated: true,
      },
      {
        sessionId,
        type: 'admin',
        title: 'Setup calling system',
        description: 'Configure AI voice agent or calling platform',
        category: 'setup',
        priority: 'high',
        estimatedMinutes: 90,
        orderIndex: 2,
        aiGenerated: true,
      },
    ];
    
    clientTodos = [
      {
        sessionId,
        type: 'client',
        title: 'Upload final call list',
        description: 'Provide call list in CSV format with all required fields',
        category: 'content',
        priority: 'high',
        estimatedMinutes: 20,
        orderIndex: 0,
        aiGenerated: true,
      },
      {
        sessionId,
        type: 'client',
        title: 'Approve call script',
        description: 'Review and approve the final call script',
        category: 'review',
        priority: 'high',
        estimatedMinutes: 15,
        orderIndex: 1,
        aiGenerated: true,
      },
    ];
  } else if (projectType === 'inbound_calling') {
    adminTodos = [
      {
        sessionId,
        type: 'admin',
        title: 'Configure call routing',
        description: 'Setup IVR menu and call routing rules',
        category: 'setup',
        priority: 'high',
        estimatedMinutes: 60,
        orderIndex: 0,
        aiGenerated: true,
      },
      {
        sessionId,
        type: 'admin',
        title: 'Setup phone number',
        description: 'Configure or port phone number for inbound calls',
        category: 'setup',
        priority: 'high',
        estimatedMinutes: 30,
        orderIndex: 1,
        aiGenerated: true,
      },
    ];
    
    clientTodos = [
      {
        sessionId,
        type: 'client',
        title: 'Provide greeting script',
        description: 'Approve or provide the greeting message for callers',
        category: 'content',
        priority: 'high',
        estimatedMinutes: 15,
        orderIndex: 0,
        aiGenerated: true,
      },
    ];
  } else {
    // Generic todos for other project types
    adminTodos = [
      {
        sessionId,
        type: 'admin',
        title: 'Review project requirements',
        description: 'Review all onboarding responses and validate project scope',
        category: 'review',
        priority: 'high',
        estimatedMinutes: 30,
        orderIndex: 0,
        aiGenerated: true,
      },
      {
        sessionId,
        type: 'admin',
        title: 'Create project plan',
        description: 'Develop detailed project timeline and milestones',
        category: 'planning',
        priority: 'high',
        estimatedMinutes: 60,
        orderIndex: 1,
        aiGenerated: true,
      },
    ];
    
    clientTodos = [
      {
        sessionId,
        type: 'client',
        title: 'Provide additional materials',
        description: 'Upload any remaining documents or assets needed for the project',
        category: 'content',
        priority: 'medium',
        estimatedMinutes: 30,
        orderIndex: 0,
        aiGenerated: true,
      },
    ];
  }
  
  return {
    adminTodos,
    clientTodos,
    analysis: {
      complexity: 'medium',
      estimatedSetupTime: '2-3 weeks',
      criticalIssues: [],
      recommendations: ['Review onboarding responses for completeness'],
    },
  };
}
