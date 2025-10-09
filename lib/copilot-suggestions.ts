/**
 * Context-aware suggestions for AI Co-Pilot
 * These suggestions adapt based on the current page and user context
 */

export interface SuggestionConfig {
  icon: string;
  text: string;
  category?: string;
}

// Page-specific suggestions
export const pageSuggestions: Record<string, SuggestionConfig[]> = {
  '/dashboard': [
    { icon: '📊', text: 'Show me today\'s campaign performance', category: 'analytics' },
    { icon: '📞', text: 'Create a new voice campaign', category: 'action' },
    { icon: '👥', text: 'Show my recent contacts', category: 'navigation' },
    { icon: '💰', text: 'Show deals in progress', category: 'navigation' },
  ],
  '/dashboard/contacts': [
    { icon: '🔍', text: 'Search for a specific contact', category: 'action' },
    { icon: '📥', text: 'Export all contacts to CSV', category: 'action' },
    { icon: '➕', text: 'Add a new contact', category: 'action' },
    { icon: '📊', text: 'Show contact engagement stats', category: 'analytics' },
  ],
  '/dashboard/campaigns': [
    { icon: '📞', text: 'Create a new campaign', category: 'action' },
    { icon: '📊', text: 'Analyze campaign performance', category: 'analytics' },
    { icon: '🔄', text: 'Show active campaigns only', category: 'filter' },
    { icon: '💰', text: 'Show campaign costs breakdown', category: 'analytics' },
  ],
  '/dashboard/deals': [
    { icon: '💼', text: 'Create a new deal', category: 'action' },
    { icon: '📈', text: 'Show pipeline summary', category: 'analytics' },
    { icon: '💰', text: 'Show total deal value', category: 'analytics' },
    { icon: '📥', text: 'Export deals to CSV', category: 'action' },
  ],
  '/dashboard/projects': [
    { icon: '📁', text: 'Create a new project', category: 'action' },
    { icon: '📊', text: 'Show project status overview', category: 'analytics' },
    { icon: '📥', text: 'Export projects to CSV', category: 'action' },
    { icon: '🔍', text: 'Find a specific project', category: 'action' },
  ],
  '/dashboard/activities': [
    { icon: '✅', text: 'Show overdue tasks', category: 'filter' },
    { icon: '📅', text: 'Show today\'s tasks', category: 'filter' },
    { icon: '📥', text: 'Export activities to CSV', category: 'action' },
    { icon: '➕', text: 'Create a new task', category: 'action' },
  ],
};

// QuickAgent-specific suggestions
export const quickAgentSuggestions: Record<string, SuggestionConfig[]> = {
  '/insurance': [
    { icon: '🚀', text: 'Create a life insurance agent', category: 'action' },
    { icon: '🏠', text: 'Create a home/auto insurance agent', category: 'action' },
    { icon: '💡', text: 'Show me example qualification questions', category: 'help' },
    { icon: '💵', text: 'What are the pricing plans?', category: 'help' },
  ],
  '/insurance/build': [
    { icon: '💡', text: 'Suggest qualification questions for life insurance', category: 'help' },
    { icon: '📍', text: 'What are popular area codes for Chicago?', category: 'help' },
    { icon: '🎯', text: 'Help me target the right age group', category: 'help' },
    { icon: '📝', text: 'Give me examples of good prompts', category: 'help' },
  ],
  '/life/build': [
    { icon: '💡', text: 'Suggest life insurance qualification questions', category: 'help' },
    { icon: '🎯', text: 'What age groups should I target?', category: 'help' },
    { icon: '💰', text: 'What coverage amounts are typical?', category: 'help' },
    { icon: '📋', text: 'Help me create a good script', category: 'help' },
  ],
};

// Time-based suggestions
export function getTimeSuggestions(): SuggestionConfig[] {
  const hour = new Date().getHours();

  if (hour < 12) {
    return [
      { icon: '☀️', text: 'Show today\'s scheduled calls', category: 'time' },
      { icon: '📊', text: 'Yesterday\'s campaign summary', category: 'time' },
    ];
  } else if (hour < 17) {
    return [
      { icon: '⏰', text: 'Show today\'s progress', category: 'time' },
      { icon: '📞', text: 'Calls completed today', category: 'time' },
    ];
  } else {
    return [
      { icon: '🌙', text: 'Today\'s final summary', category: 'time' },
      { icon: '📅', text: 'Plan tomorrow\'s campaigns', category: 'time' },
    ];
  }
}

// Get suggestions for current page
export function getSuggestionsForPage(pathname: string, app: 'clientflow' | 'quickagent'): SuggestionConfig[] {
  // Check for exact match
  if (app === 'clientflow') {
    if (pageSuggestions[pathname]) {
      return pageSuggestions[pathname];
    }
    
    // Partial match (e.g., /dashboard/campaigns/123 -> /dashboard/campaigns)
    const matchingPath = Object.keys(pageSuggestions).find(path => pathname.startsWith(path));
    if (matchingPath) {
      return pageSuggestions[matchingPath];
    }

    // Default suggestions for ClientFlow
    return [
      { icon: '🏠', text: 'Go to dashboard', category: 'navigation' },
      { icon: '👥', text: 'Show contacts', category: 'navigation' },
      { icon: '📞', text: 'View campaigns', category: 'navigation' },
      { icon: '💼', text: 'Show deals', category: 'navigation' },
    ];
  } else {
    // QuickAgent suggestions
    if (quickAgentSuggestions[pathname]) {
      return quickAgentSuggestions[pathname];
    }

    // Partial match
    const matchingPath = Object.keys(quickAgentSuggestions).find(path => pathname.startsWith(path));
    if (matchingPath) {
      return quickAgentSuggestions[matchingPath];
    }

    // Default QuickAgent suggestions
    return [
      { icon: '🚀', text: 'Create a new agent', category: 'action' },
      { icon: '💡', text: 'How does QuickAgent work?', category: 'help' },
      { icon: '💵', text: 'Show pricing', category: 'navigation' },
      { icon: '🎯', text: 'What insurance types are supported?', category: 'help' },
    ];
  }
}

// Get all suggestions including time-based
export function getAllSuggestions(pathname: string, app: 'clientflow' | 'quickagent'): SuggestionConfig[] {
  const pageSugs = getSuggestionsForPage(pathname, app);
  const timeSugs = app === 'clientflow' ? getTimeSuggestions() : [];
  
  return [...pageSugs, ...timeSugs];
}

