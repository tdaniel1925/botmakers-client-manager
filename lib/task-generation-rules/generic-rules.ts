/**
 * Generic Project Rules
 * Task generation rules that apply to all project types
 */

import {
  TaskGenerationRule,
  calculateDueDate,
  hasTextResponse,
  getResponseValue,
} from "../onboarding-task-mapper";

export const genericRules: TaskGenerationRule[] = [
  // Rule 1: Project Kickoff
  {
    id: "generic-kickoff",
    name: "Project Kickoff",
    description: "Initial project setup and kickoff meeting",
    responseKey: "project_name",
    priority: 10,
    condition: (responses) => {
      return hasTextResponse(responses, "project_name") || Object.keys(responses).length > 0;
    },
    generateTasks: (responses, context) => {
      return [
        {
          title: "Schedule project kickoff meeting",
          description: `Organize kickoff meeting with stakeholders:

Agenda:
- Review onboarding responses
- Clarify any unclear requirements
- Introduce team members
- Set communication channels
- Review timeline and milestones
- Discuss project management workflow
- Address initial questions

Send calendar invite with agenda 48 hours in advance.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 2),
        },
        {
          title: "Set up project management workspace",
          description: `Create organized project workspace:
- Create project in PM tool (Asana, Jira, Monday, etc.)
- Set up project channels (Slack, Teams)
- Create shared file repository
- Add all team members
- Set up notification preferences
- Create project dashboard
- Document communication protocols`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 1),
        },
      ];
    },
  },

  // Rule 2: Timeline and Milestones
  {
    id: "generic-timeline",
    name: "Project Timeline",
    description: "Create detailed project timeline",
    responseKey: ["deadline", "launch_date", "timeline", "expected_duration"],
    priority: 9,
    condition: (responses) => {
      return (
        responses.deadline ||
        responses.launch_date ||
        hasTextResponse(responses, "timeline") ||
        hasTextResponse(responses, "expected_duration")
      );
    },
    generateTasks: (responses, context) => {
      const deadline = getResponseValue(responses, "deadline", null) ||
                      getResponseValue(responses, "launch_date", null);

      return [
        {
          title: "Create detailed project timeline",
          description: `Develop comprehensive timeline:

${deadline ? `Target Date: ${new Date(deadline).toLocaleDateString()}` : ""}

Include:
- Project phases breakdown
- Major milestones with dates
- Task dependencies
- Resource allocation
- Buffer time for revisions
- Client review periods
- Testing phases
- Launch preparation

Share timeline with client for approval.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 3),
        },
      ];
    },
  },

  // Rule 3: Budget and Resources
  {
    id: "generic-budget",
    name: "Budget Planning",
    description: "Plan budget and resource allocation",
    responseKey: ["budget", "budget_range", "investment"],
    priority: 7,
    condition: (responses) => {
      return (
        hasTextResponse(responses, "budget") ||
        hasTextResponse(responses, "budget_range") ||
        hasTextResponse(responses, "investment")
      );
    },
    generateTasks: (responses, context) => {
      const budget = getResponseValue(responses, "budget", "") ||
                    getResponseValue(responses, "budget_range", "") ||
                    getResponseValue(responses, "investment", "");

      return [
        {
          title: "Create project budget breakdown",
          description: `Develop detailed budget allocation:

Total Budget: ${budget}

Break down by:
- Development/design costs
- Third-party services and tools
- Infrastructure/hosting costs
- Contingency fund (10-15%)
- Phase-wise budget distribution

Document all assumptions and get approval.`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 4),
        },
      ];
    },
  },

  // Rule 4: Stakeholder Management
  {
    id: "generic-stakeholders",
    name: "Stakeholder Management",
    description: "Identify and manage project stakeholders",
    responseKey: ["decision_makers", "team_members", "key_contacts"],
    priority: 6,
    condition: (responses) => {
      return (
        hasTextResponse(responses, "decision_makers") ||
        hasTextResponse(responses, "team_members") ||
        hasTextResponse(responses, "key_contacts")
      );
    },
    generateTasks: (responses, context) => {
      return [
        {
          title: "Create stakeholder map and communication plan",
          description: `Document all stakeholders:

For each stakeholder:
- Name and role
- Decision-making authority
- Communication preferences
- Availability
- Key interests and concerns
- Escalation path

Set up regular check-in schedule.`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 3),
        },
      ];
    },
  },

  // Rule 5: Risk Management
  {
    id: "generic-risk-management",
    name: "Risk Assessment",
    description: "Identify and plan for project risks",
    responseKey: ["concerns", "challenges", "constraints"],
    priority: 7,
    condition: (responses) => {
      return (
        hasTextResponse(responses, "concerns") ||
        hasTextResponse(responses, "challenges") ||
        hasTextResponse(responses, "constraints")
      );
    },
    generateTasks: (responses, context) => {
      const concerns = getResponseValue(responses, "concerns", "");
      const challenges = getResponseValue(responses, "challenges", "");

      return [
        {
          title: "Conduct risk assessment",
          description: `Identify and plan for project risks:

Client Concerns: ${concerns}
Challenges: ${challenges}

Create risk register with:
- Identified risks
- Probability and impact ratings
- Mitigation strategies
- Contingency plans
- Risk owners
- Review schedule

Update risk register weekly.`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 5),
        },
      ];
    },
  },

  // Rule 6: Quality Assurance
  {
    id: "generic-qa-plan",
    name: "Quality Assurance Plan",
    description: "Develop QA strategy and checklist",
    responseKey: "project_name",
    priority: 6,
    condition: () => true, // Always create QA plan
    generateTasks: (responses, context) => {
      return [
        {
          title: "Create quality assurance checklist",
          description: `Develop comprehensive QA plan:

Include:
- Acceptance criteria for each deliverable
- Review and approval process
- Testing procedures
- Client feedback loops
- Revision policies
- Quality standards documentation
- Final delivery checklist

Schedule QA reviews at each milestone.`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 7),
        },
      ];
    },
  },

  // Rule 7: Client Communication
  {
    id: "generic-communication-plan",
    name: "Communication Plan",
    description: "Establish regular communication rhythm",
    responseKey: ["preferred_communication", "meeting_frequency"],
    priority: 8,
    condition: (responses) => {
      return (
        hasTextResponse(responses, "preferred_communication") ||
        hasTextResponse(responses, "meeting_frequency") ||
        Object.keys(responses).length > 0
      );
    },
    generateTasks: (responses, context) => {
      const commPref = getResponseValue(responses, "preferred_communication", "");
      const meetingFreq = getResponseValue(responses, "meeting_frequency", "");

      return [
        {
          title: "Establish communication protocols",
          description: `Set up regular communication:

Preferences: ${commPref}
Meeting Frequency: ${meetingFreq}

Establish:
- Weekly status update format
- Progress reporting schedule
- Issue escalation process
- Response time expectations
- Meeting cadence
- Feedback collection methods
- Documentation sharing process

Send communication plan to client for agreement.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 2),
        },
      ];
    },
  },

  // Rule 8: Additional Notes/Requirements
  {
    id: "generic-additional-notes",
    name: "Review Additional Requirements",
    description: "Address any additional notes or special requests",
    responseKey: ["additional_notes", "special_requests", "other_requirements"],
    priority: 5,
    condition: (responses) => {
      return (
        hasTextResponse(responses, "additional_notes") ||
        hasTextResponse(responses, "special_requests") ||
        hasTextResponse(responses, "other_requirements")
      );
    },
    generateTasks: (responses, context) => {
      const notes = getResponseValue(responses, "additional_notes", "") ||
                   getResponseValue(responses, "special_requests", "") ||
                   getResponseValue(responses, "other_requirements", "");

      return [
        {
          title: "Address special requirements and notes",
          description: `Review and plan for additional requests:

Client Notes:
${notes}

Tasks:
- Clarify any ambiguous requirements
- Research feasibility of special requests
- Estimate additional effort required
- Document in project scope
- Get approval for any scope changes
- Update timeline if needed

Schedule follow-up call if clarification needed.`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 4),
        },
      ];
    },
  },
];

export default genericRules;
