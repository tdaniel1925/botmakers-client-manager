/**
 * Voice AI Campaign - Task Generation Rules
 * Converts voice AI onboarding responses into actionable tasks
 */

import {
  TaskGenerationRule,
  calculateDueDate,
  hasTextResponse,
  getResponseValue,
  hasFileUploads,
} from "../onboarding-task-mapper";

export const voiceAIRules: TaskGenerationRule[] = [
  // Rule 1: Campaign Script Development
  {
    id: "voice-ai-script-development",
    name: "Campaign Script Development",
    description: "Create and refine voice AI campaign script",
    responseKey: ["campaign_goal", "target_audience", "key_message"],
    priority: 10,
    condition: (responses) => {
      return (
        hasTextResponse(responses, "campaign_goal") ||
        hasTextResponse(responses, "target_audience") ||
        hasTextResponse(responses, "key_message")
      );
    },
    generateTasks: (responses, context) => {
      const goal = getResponseValue(responses, "campaign_goal", "");
      const audience = getResponseValue(responses, "target_audience", "");
      const message = getResponseValue(responses, "key_message", "");

      return [
        {
          title: "Draft initial voice AI script",
          description: `Create the first draft of the voice AI campaign script:

Campaign Goal: ${goal}
Target Audience: ${audience}
Key Message: ${message}

Include:
- Opening hook (first 3 seconds)
- Value proposition
- Objection handling paths
- Call-to-action
- Fallback responses
- Transfer-to-human triggers

Keep script conversational and natural.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 3),
        },
        {
          title: "Test and refine script with AI voice",
          description: `Run test calls with the AI voice to refine:
- Pronunciation of key terms
- Pacing and pauses
- Natural language flow
- Response accuracy
- Edge case handling

Document 5-10 test call recordings and refinement notes.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 7),
        },
      ];
    },
  },

  // Rule 2: Voice Selection and Training
  {
    id: "voice-ai-voice-setup",
    name: "Voice Selection and Configuration",
    description: "Choose and configure AI voice for the campaign",
    responseKey: ["voice_preference", "tone_of_voice"],
    priority: 9,
    condition: (responses) => {
      return (
        hasTextResponse(responses, "voice_preference") ||
        hasTextResponse(responses, "tone_of_voice")
      );
    },
    generateTasks: (responses, context) => {
      const voicePref = getResponseValue(responses, "voice_preference", "Professional");
      const tone = getResponseValue(responses, "tone_of_voice", "Friendly");

      return [
        {
          title: `Configure ${voicePref} voice with ${tone} tone`,
          description: `Set up and train the AI voice:

Voice Type: ${voicePref}
Tone: ${tone}

Tasks:
- Select optimal voice from available options
- Configure voice parameters (speed, pitch, emphasis)
- Train custom pronunciation dictionary
- Set up emotional tone triggers
- Test with sample scripts
- Get client approval on voice selection`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 5),
        },
      ];
    },
  },

  // Rule 3: Contact List Management
  {
    id: "voice-ai-contact-list",
    name: "Contact List Setup",
    description: "Prepare and segment contact list",
    responseKey: ["contact_list", "list_size", "list_upload"],
    priority: 8,
    condition: (responses) => {
      return (
        hasFileUploads(responses, "contact_list") ||
        hasFileUploads(responses, "list_upload") ||
        hasTextResponse(responses, "list_size")
      );
    },
    generateTasks: (responses, context) => {
      const listSize = getResponseValue(responses, "list_size", "Not specified");

      return [
        {
          title: "Process and validate contact list",
          description: `Prepare contact list for campaign:

List Size: ${listSize}

Tasks:
- Import and validate contact data
- Remove duplicates and invalid numbers
- Segment by relevant criteria
- Add custom fields for personalization
- Set up DNC (Do Not Call) filtering
- Verify compliance requirements
- Create backup of original list`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 4),
        },
        {
          title: "Create contact segmentation strategy",
          description: `Develop segmentation plan:
- Define key segments
- Create personalized messaging for each segment
- Set up A/B testing groups
- Plan call timing for each segment
- Document segment characteristics`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 6),
        },
      ];
    },
  },

  // Rule 4: Integration Setup
  {
    id: "voice-ai-integrations",
    name: "System Integrations",
    description: "Set up CRM and calendar integrations",
    responseKey: ["crm_system", "calendar_integration", "webhook_url"],
    priority: 7,
    condition: (responses) => {
      return (
        hasTextResponse(responses, "crm_system") ||
        hasTextResponse(responses, "calendar_integration") ||
        hasTextResponse(responses, "webhook_url")
      );
    },
    generateTasks: (responses, context) => {
      const crm = getResponseValue(responses, "crm_system", "");
      const calendar = getResponseValue(responses, "calendar_integration", "");

      const tasks = [];

      if (crm) {
        tasks.push({
          title: `Integrate with ${crm} CRM`,
          description: `Set up CRM integration:

CRM: ${crm}

Tasks:
- Configure API credentials
- Map contact fields
- Set up lead status workflow
- Test data sync
- Configure webhook triggers
- Set up error handling
- Document integration settings`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 5),
        });
      }

      if (calendar) {
        tasks.push({
          title: `Set up ${calendar} calendar integration`,
          description: `Configure calendar booking:

Calendar: ${calendar}

Tasks:
- Connect calendar API
- Set booking rules and availability
- Configure confirmation emails
- Set up reminders
- Test booking flow
- Add to voice AI script`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 6),
        });
      }

      return tasks;
    },
  },

  // Rule 5: Compliance and Legal
  {
    id: "voice-ai-compliance",
    name: "Compliance Setup",
    description: "Ensure campaign meets legal requirements",
    responseKey: ["target_region", "industry"],
    priority: 9,
    condition: (responses) => {
      return hasTextResponse(responses, "target_region") || hasTextResponse(responses, "industry");
    },
    generateTasks: (responses, context) => {
      const region = getResponseValue(responses, "target_region", "");
      const industry = getResponseValue(responses, "industry", "");

      return [
        {
          title: "Complete compliance audit",
          description: `Ensure campaign meets legal requirements:

Region: ${region}
Industry: ${industry}

Review:
- TCPA compliance (US)
- GDPR requirements (EU)
- DNC list integration
- Consent requirements
- Recording disclosures
- Industry-specific regulations
- Data retention policies

Document compliance measures taken.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 3),
        },
      ];
    },
  },

  // Rule 6: Campaign Analytics Setup
  {
    id: "voice-ai-analytics",
    name: "Analytics and Tracking",
    description: "Set up campaign tracking and reporting",
    responseKey: "campaign_goal",
    priority: 6,
    condition: (responses) => {
      return hasTextResponse(responses, "campaign_goal");
    },
    generateTasks: (responses, context) => {
      return [
        {
          title: "Configure campaign analytics dashboard",
          description: `Set up comprehensive tracking:

Metrics to Track:
- Call completion rate
- Average call duration
- Positive response rate
- Appointment booking rate
- Transfer to human rate
- Objection patterns
- Best call times
- ROI calculation

Create real-time dashboard for client access.`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 7),
        },
        {
          title: "Set up A/B testing framework",
          description: `Create testing infrastructure:
- Define test variables (script variations, voice tone, timing)
- Set up control and test groups
- Configure success metrics
- Plan test duration
- Document testing methodology`,
          status: "todo" as const,
          priority: "low" as const,
          dueDate: calculateDueDate(context.completionDate, 10),
        },
      ];
    },
  },

  // Rule 7: Launch Preparation
  {
    id: "voice-ai-launch",
    name: "Campaign Launch Preparation",
    description: "Prepare for campaign launch",
    responseKey: ["launch_date", "daily_call_volume"],
    priority: 8,
    condition: (responses) => {
      return responses.launch_date !== undefined || hasTextResponse(responses, "daily_call_volume");
    },
    generateTasks: (responses, context) => {
      const launchDate = getResponseValue(responses, "launch_date", null);
      const callVolume = getResponseValue(responses, "daily_call_volume", "");

      return [
        {
          title: "Run pilot campaign test",
          description: `Execute small-scale test before full launch:

${callVolume ? `Target Volume: ${callVolume}` : ""}

Test with:
- 50-100 test calls
- All script paths
- Integration functionality
- Error handling
- Recording quality
- Analytics tracking

Document all issues and resolutions.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: launchDate
            ? calculateDueDate(new Date(launchDate), -3)
            : calculateDueDate(context.completionDate, 10),
        },
        {
          title: "Create campaign monitoring protocol",
          description: `Set up real-time monitoring:
- Define alert thresholds
- Create escalation procedures
- Set up 24/7 monitoring schedule
- Prepare emergency pause protocol
- Document troubleshooting steps
- Schedule daily check-ins during first week`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: launchDate
            ? calculateDueDate(new Date(launchDate), -2)
            : calculateDueDate(context.completionDate, 12),
        },
      ];
    },
  },
];

export default voiceAIRules;
