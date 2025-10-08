// Campaign Setup Questions - Configuration for campaign creation wizard

export interface SetupQuestion {
  id: string;
  question: string;
  type: "text" | "textarea" | "select" | "multi-select" | "number" | "radio";
  placeholder?: string;
  required: boolean;
  options?: Array<{ value: string; label: string; description?: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  showIf?: {
    field: string;
    value: string | string[];
  };
  helpText?: string;
}

export const CAMPAIGN_SETUP_QUESTIONS: SetupQuestion[] = [
  // BASIC INFO
  {
    id: "campaign_name",
    question: "What would you like to name this voice campaign?",
    type: "text",
    placeholder: "e.g., Q1 Lead Qualification, Customer Support Line",
    required: true,
    validation: {
      min: 3,
      max: 50,
      message: "Campaign name must be between 3 and 50 characters"
    },
    helpText: "Choose a descriptive name to identify this campaign"
  },
  
  // AGENT NAME
  {
    id: "agent_name",
    question: "What name should the AI agent introduce itself as?",
    type: "text",
    placeholder: "e.g., Sarah, David, Alex",
    required: true,
    validation: {
      min: 2,
      max: 30,
      message: "Agent name must be between 2 and 30 characters"
    },
    helpText: "This is the name the AI will use when speaking with callers"
  },
  
  // COMPANY NAME
  {
    id: "company_name",
    question: "What is your company name?",
    type: "text",
    placeholder: "e.g., ABC Corporation, Smith & Associates",
    required: true,
    validation: {
      min: 2,
      max: 50,
      message: "Company name must be between 2 and 50 characters"
    },
    helpText: "The AI will introduce itself as calling from or representing this company"
  },
  
  // CAMPAIGN TYPE
  {
    id: "campaign_type",
    question: "What type of campaign is this?",
    type: "radio",
    required: true,
    options: [
      {
        value: "inbound",
        label: "Inbound - Receive customer calls",
        description: "Customers call your phone number and the AI agent answers"
      },
      {
        value: "outbound",
        label: "Outbound - Call customers proactively",
        description: "AI agent makes calls to your contact list with smart scheduling"
      }
    ],
    helpText: "Inbound is most common for customer support, outbound for sales/surveys"
  },
  
  // BUSINESS CONTEXT
  {
    id: "business_context",
    question: "Tell us about your business (helps AI understand context)",
    type: "textarea",
    placeholder: "e.g., We're a SaaS company that helps small businesses manage their inventory. We offer a cloud-based platform with real-time tracking, automated reordering, and analytics.",
    required: true,
    validation: {
      min: 50,
      max: 500,
      message: "Please provide 50-500 characters of context"
    },
    helpText: "The more context you provide, the better the AI will understand your business"
  },
  
  // CAMPAIGN GOAL
  {
    id: "campaign_goal",
    question: "What is the main goal of this voice agent?",
    type: "select",
    required: true,
    options: [
      {
        value: "lead_qualification",
        label: "Qualify leads",
        description: "Ask questions to determine if caller is a good fit"
      },
      {
        value: "appointment_booking",
        label: "Book appointments",
        description: "Schedule meetings or service appointments"
      },
      {
        value: "customer_support",
        label: "Provide customer support",
        description: "Answer questions and help with issues"
      },
      {
        value: "sales_followup",
        label: "Sales follow-up",
        description: "Follow up with leads to move them through pipeline"
      },
      {
        value: "survey",
        label: "Conduct surveys",
        description: "Gather feedback and insights from callers"
      },
      {
        value: "custom",
        label: "Custom goal",
        description: "I have a different goal in mind"
      }
    ],
    helpText: "This helps the AI understand what success looks like"
  },
  
  // CUSTOM GOAL (conditional)
  {
    id: "custom_goal",
    question: "Describe your custom goal:",
    type: "textarea",
    placeholder: "e.g., Help customers troubleshoot technical issues and escalate complex problems to our support team",
    required: true,
    showIf: {
      field: "campaign_goal",
      value: "custom"
    },
    validation: {
      min: 20,
      max: 300,
      message: "Please provide 20-300 characters describing your goal"
    }
  },
  
  // AGENT PERSONALITY
  {
    id: "agent_personality",
    question: "How should the voice agent sound?",
    type: "radio",
    required: true,
    options: [
      {
        value: "professional",
        label: "Professional and formal",
        description: "Maintains a polished, business-focused demeanor"
      },
      {
        value: "friendly",
        label: "Friendly and casual",
        description: "Warm and approachable, makes callers feel comfortable"
      },
      {
        value: "enthusiastic",
        label: "Enthusiastic and energetic",
        description: "Shows excitement and positive energy"
      },
      {
        value: "empathetic",
        label: "Empathetic and caring",
        description: "Shows genuine concern and understanding"
      }
    ],
    helpText: "Choose the personality that fits your brand and goal"
  },
  
  // VOICE PREFERENCE
  {
    id: "voice_preference",
    question: "Preferred voice type:",
    type: "radio",
    required: true,
    options: [
      {
        value: "female",
        label: "Female voice",
        description: "Typically perceived as more approachable"
      },
      {
        value: "male",
        label: "Male voice",
        description: "Often sounds more authoritative"
      },
      {
        value: "auto",
        label: "Let AI decide",
        description: "AI will choose based on your campaign goal and personality"
      }
    ],
    helpText: "Studies show female voices perform better for support, male for sales"
  },
  
  // KEY INFORMATION
  {
    id: "key_information",
    question: "What key information should the agent know?",
    type: "textarea",
    placeholder: "e.g., Pricing: $99/month for starter, $299/month for pro. Features: Real-time tracking, automated alerts, mobile app. Support: 24/7 chat, email response within 4 hours. Free 14-day trial available.",
    required: true,
    validation: {
      min: 50,
      max: 1000,
      message: "Please provide 50-1000 characters of key information"
    },
    helpText: "Include FAQs, pricing, features, procedures - anything the agent needs to know"
  },
  
  // MUST COLLECT
  {
    id: "must_collect",
    question: "What information must the agent collect from callers?",
    type: "multi-select",
    required: false,
    options: [
      { value: "name", label: "Full name" },
      { value: "email", label: "Email address" },
      { value: "phone", label: "Phone number" },
      { value: "company", label: "Company name" },
      { value: "title", label: "Job title" },
      { value: "budget", label: "Budget / Price range" },
      { value: "timeline", label: "Timeline / Urgency" },
      { value: "current_solution", label: "Current solution they use" },
      { value: "pain_points", label: "Problems they're trying to solve" }
    ],
    helpText: "Select all that apply. Agent will naturally collect this info during conversation"
  },
  
  // FOLLOW-UP TRIGGERS
  {
    id: "follow_up_triggers",
    question: "When should the agent trigger a follow-up?",
    type: "multi-select",
    required: false,
    options: [
      { value: "high_interest", label: "Caller shows high interest", description: "Wants to learn more or buy" },
      { value: "needs_pricing", label: "Requests detailed pricing", description: "Needs custom quote or enterprise pricing" },
      { value: "technical_questions", label: "Complex technical questions", description: "Beyond agent's knowledge" },
      { value: "decision_maker", label: "Need to speak with decision maker", description: "Not the final decision maker" },
      { value: "negative_sentiment", label: "Negative sentiment detected", description: "Caller seems frustrated or unhappy" },
      { value: "all_calls", label: "After every call", description: "Create follow-up task for all calls" }
    ],
    helpText: "These will trigger automated workflows (tasks, emails, SMS)"
  },
  
  // WORKING HOURS
  {
    id: "working_hours",
    question: "When should this agent be available?",
    type: "radio",
    required: true,
    options: [
      {
        value: "24_7",
        label: "24/7 - Always available",
        description: "Agent answers calls any time, any day"
      },
      {
        value: "business_hours",
        label: "Business hours only (9am-5pm)",
        description: "Monday-Friday, 9am-5pm local time"
      },
      {
        value: "custom",
        label: "Custom schedule",
        description: "I'll set specific hours"
      }
    ],
    helpText: "For inbound: when agent answers. For outbound: when agent makes calls"
  },
  
  // CUSTOM HOURS START (conditional)
  {
    id: "custom_hours_start",
    question: "Start time:",
    type: "text",
    placeholder: "09:00",
    required: true,
    showIf: {
      field: "working_hours",
      value: "custom"
    },
    validation: {
      pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
      message: "Please use HH:MM format (e.g., 09:00)"
    }
  },
  
  // CUSTOM HOURS END (conditional)
  {
    id: "custom_hours_end",
    question: "End time:",
    type: "text",
    placeholder: "17:00",
    required: true,
    showIf: {
      field: "working_hours",
      value: "custom"
    },
    validation: {
      pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
      message: "Please use HH:MM format (e.g., 17:00)"
    }
  },
  
  // AREA CODE (optional)
  {
    id: "area_code",
    question: "Preferred area code for phone number (optional):",
    type: "text",
    placeholder: "e.g., 212, 415, 800",
    required: false,
    validation: {
      pattern: "^[0-9]{3}$",
      message: "Area code must be 3 digits"
    },
    helpText: "Leave blank for random assignment. Some providers may not support specific area codes."
  }
];

/**
 * Validate a single answer
 */
export function validateAnswer(question: SetupQuestion, value: any): string | null {
  if (question.required && (!value || (Array.isArray(value) && value.length === 0))) {
    return `${question.question} is required`;
  }
  
  if (!value) return null; // Not required and empty is ok
  
  const validation = question.validation;
  if (!validation) return null;
  
  if (question.type === "text" || question.type === "textarea") {
    const strValue = value.toString();
    
    if (validation.min && strValue.length < validation.min) {
      return validation.message || `Minimum ${validation.min} characters required`;
    }
    
    if (validation.max && strValue.length > validation.max) {
      return validation.message || `Maximum ${validation.max} characters allowed`;
    }
    
    if (validation.pattern && !new RegExp(validation.pattern).test(strValue)) {
      return validation.message || `Invalid format`;
    }
  }
  
  if (question.type === "number") {
    const numValue = typeof value === "number" ? value : parseFloat(value);
    
    if (isNaN(numValue)) {
      return "Must be a valid number";
    }
    
    if (validation.min !== undefined && numValue < validation.min) {
      return validation.message || `Minimum value is ${validation.min}`;
    }
    
    if (validation.max !== undefined && numValue > validation.max) {
      return validation.message || `Maximum value is ${validation.max}`;
    }
  }
  
  return null;
}

/**
 * Validate all answers
 */
export function validateAllAnswers(answers: Record<string, any>): Record<string, string> {
  const errors: Record<string, string> = {};
  
  for (const question of CAMPAIGN_SETUP_QUESTIONS) {
    // Check if question should be shown
    if (question.showIf) {
      const dependentValue = answers[question.showIf.field];
      const expectedValues = Array.isArray(question.showIf.value) 
        ? question.showIf.value 
        : [question.showIf.value];
      
      if (!expectedValues.includes(dependentValue)) {
        continue; // Skip validation if question shouldn't be shown
      }
    }
    
    const error = validateAnswer(question, answers[question.id]);
    if (error) {
      errors[question.id] = error;
    }
  }
  
  return errors;
}

/**
 * Get questions that should be displayed based on current answers
 */
export function getVisibleQuestions(answers: Record<string, any>): SetupQuestion[] {
  return CAMPAIGN_SETUP_QUESTIONS.filter(question => {
    if (!question.showIf) return true;
    
    const dependentValue = answers[question.showIf.field];
    const expectedValues = Array.isArray(question.showIf.value) 
      ? question.showIf.value 
      : [question.showIf.value];
    
    return expectedValues.includes(dependentValue);
  });
}
