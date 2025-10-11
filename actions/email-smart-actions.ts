/**
 * AI-Powered Smart Actions for Emails
 * Generates contextually relevant action buttons based on email content
 */

'use server';

import OpenAI from 'openai';
import type { SelectEmail } from '@/db/schema/email-schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SmartAction {
  icon: string; // Icon name from lucide-react
  label: string;
  description: string;
  action: string; // Action identifier (e.g., 'create_folder', 'add_to_calendar', 'create_task')
  params?: Record<string, any>; // Action-specific parameters
  color?: string; // Tailwind color class
}

// Cache for smart actions with aggressive TTL
const actionsCache = new Map<string, { actions: SmartAction[]; timestamp: number }>();
const ACTIONS_CACHE_TTL = 60 * 60 * 1000; // 60 minutes (email content doesn't change)

export async function generateSmartActions(email: SelectEmail): Promise<SmartAction[]> {
  // Check cache first
  const cacheKey = `smart-actions-${email.id}`;
  const cached = actionsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ACTIONS_CACHE_TTL) {
    return cached.actions;
  }

  try {
    const emailContent = buildEmailContext(email);

    const prompt = `Analyze this email and suggest 3-5 contextually relevant actions the user might want to take. Be specific and practical.

Email:
${emailContent}

Return actions in this JSON format:
{
  "actions": [
    {
      "icon": "lucide icon name (e.g., FolderPlus, Calendar, ListTodo, Receipt, MapPin, Phone, ShoppingCart)",
      "label": "Short action label (2-4 words)",
      "description": "Brief description",
      "action": "action_type (e.g., create_folder, add_to_calendar, create_task, save_receipt, add_contact)",
      "params": { "key": "value" },
      "color": "blue|green|purple|orange|red"
    }
  ]
}

Examples:
- Receipt email: {"icon": "Receipt", "label": "Save Receipt", "action": "create_folder", "params": {"folderName": "Receipts 2024"}, "color": "green"}
- Event email: {"icon": "Calendar", "label": "Add to Calendar", "action": "add_to_calendar", "params": {"eventName": "Team Meeting"}, "color": "blue"}
- Task email: {"icon": "ListTodo", "label": "Create Task", "action": "create_task", "params": {"taskName": "Review proposal"}, "color": "purple"}
- Shopping email: {"icon": "ShoppingCart", "label": "Track Order", "action": "track_order", "color": "orange"}
- Contact email: {"icon": "UserPlus", "label": "Add Contact", "action": "add_contact", "color": "blue"}

Be creative and relevant to the email content!`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use mini for speed
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that generates contextually relevant email actions. Be specific, practical, and creative.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return getDefaultActions(email);
    }

    const result = JSON.parse(content);
    const actions = result.actions || [];

    // Cache the result
    actionsCache.set(cacheKey, { actions, timestamp: Date.now() });

    return actions.slice(0, 5); // Limit to 5 actions
  } catch (error) {
    console.error('Error generating smart actions:', error);
    return getDefaultActions(email);
  }
}

function buildEmailContext(email: SelectEmail): string {
  const from = typeof email.fromAddress === 'object'
    ? `${email.fromAddress.name || ''} <${email.fromAddress.email}>`
    : email.fromAddress;

  return `
From: ${from}
Subject: ${email.subject}
Content: ${email.bodyText?.substring(0, 1000) || email.snippet || '(No content)'}
Has Attachments: ${email.hasAttachments ? 'Yes' : 'No'}
  `.trim();
}

function getDefaultActions(email: SelectEmail): SmartAction[] {
  const actions: SmartAction[] = [
    {
      icon: 'Reply',
      label: 'Quick Reply',
      description: 'Reply to this email',
      action: 'reply',
      color: 'blue',
    },
    {
      icon: 'Calendar',
      label: 'Schedule',
      description: 'Add to calendar',
      action: 'add_to_calendar',
      color: 'green',
    },
    {
      icon: 'ListTodo',
      label: 'Create Task',
      description: 'Add to task list',
      action: 'create_task',
      color: 'purple',
    },
  ];

  // Add folder action if has attachments
  if (email.hasAttachments) {
    actions.push({
      icon: 'FolderPlus',
      label: 'Save Attachments',
      description: 'Save to folder',
      action: 'save_attachments',
      color: 'orange',
    });
  }

  return actions;
}

