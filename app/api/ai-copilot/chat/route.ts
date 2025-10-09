import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define available functions that the AI can call
const functions = [
  {
    name: 'navigate',
    description: 'Navigate to a different page in ClientFlow',
    parameters: {
      type: 'object',
      properties: {
        page: {
          type: 'string',
          description: 'The page to navigate to (e.g., "dashboard", "contacts", "campaigns", "deals")',
        },
        path: {
          type: 'string',
          description: 'The full path to navigate to (e.g., "/dashboard/contacts")',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'createCampaign',
    description: 'Start the campaign creation wizard',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The project ID to create the campaign for',
        },
      },
    },
  },
  {
    name: 'exportData',
    description: 'Export data to CSV',
    parameters: {
      type: 'object',
      properties: {
        dataType: {
          type: 'string',
          enum: ['contacts', 'deals', 'activities', 'projects'],
          description: 'The type of data to export',
        },
      },
      required: ['dataType'],
    },
  },
  {
    name: 'searchContacts',
    description: 'Search for contacts in the CRM',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'analyzeCampaign',
    description: 'Get analytics and performance data for a campaign',
    parameters: {
      type: 'object',
      properties: {
        campaignId: {
          type: 'string',
          description: 'The campaign ID to analyze',
        },
      },
    },
  },
  {
    name: 'answerQuestion',
    description: 'Provide information or answer questions about ClientFlow features, pricing, or how to use the platform',
    parameters: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'The topic of the question',
        },
      },
      required: ['topic'],
    },
  },
];

// System prompt that defines the AI's role and capabilities
const systemPrompt = `You are the ClientFlow AI Co-Pilot, an intelligent assistant designed to help users manage their CRM, voice campaigns, and client relationships.

**Your capabilities:**
1. Navigate users to different pages (Dashboard, Contacts, Campaigns, Deals, Projects, etc.)
2. Create new voice campaigns
3. Export data to CSV
4. Search for contacts
5. Analyze campaign performance
6. Answer questions about ClientFlow features and usage

**Context about ClientFlow:**
- Multi-tenant CRM platform for managing client organizations
- Features: Contact management, Deal pipeline, Project tracking, Voice campaigns, Task management
- Voice Campaigns: AI-powered phone calls for lead qualification, follow-ups, and outreach
- Integrations: Twilio, Vapi AI, Stripe for payments
- Plans: Starter ($29/mo), Professional ($99/mo), Enterprise (Custom)
- Campaign Analytics: Call duration, answer rate, cost tracking, sentiment analysis

**How to respond:**
- Be concise, friendly, and professional
- Use natural language
- When users want to create something, use the appropriate function
- When users ask to see something, use the navigate function
- Provide actionable insights and suggestions
- Always consider the user's context and provide the most helpful response

**Examples:**
- "Show me today's campaigns" → Navigate to campaigns page with filters
- "Create a new campaign" → Use createCampaign function
- "Export all my contacts" → Use exportData function
- "How are my campaigns performing?" → Navigate to analytics or provide summary
- "Search for John Smith" → Use searchContacts function`;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { messages, context } = await request.json();

    // Build the conversation history
    const conversation = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    // Call OpenAI with function calling
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: conversation as any,
      functions: functions as any,
      function_call: 'auto',
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = response.choices[0]?.message;

    // Check if the AI wants to call a function
    if (assistantMessage?.function_call) {
      const functionName = assistantMessage.function_call.name;
      const functionArgs = JSON.parse(assistantMessage.function_call.arguments || '{}');

      // Handle different function calls
      let actionData: any = null;
      let responseMessage = '';

      switch (functionName) {
        case 'navigate':
          actionData = {
            type: 'navigate',
            data: { url: functionArgs.path },
          };
          responseMessage = `Taking you to ${functionArgs.page || 'that page'}...`;
          break;

        case 'createCampaign':
          const projectId = functionArgs.projectId || 'new';
          actionData = {
            type: 'navigate',
            data: { url: `/dashboard/projects/${projectId}/campaigns/new` },
          };
          responseMessage = "I'll open the campaign wizard for you. Let's create a new voice campaign!";
          break;

        case 'exportData':
          actionData = {
            type: 'export',
            data: { dataType: functionArgs.dataType },
          };
          responseMessage = `Exporting your ${functionArgs.dataType} to CSV...`;
          break;

        case 'searchContacts':
          actionData = {
            type: 'navigate',
            data: { url: `/dashboard/contacts?search=${encodeURIComponent(functionArgs.query)}` },
          };
          responseMessage = `Searching for "${functionArgs.query}"...`;
          break;

        case 'analyzeCampaign':
          if (functionArgs.campaignId) {
            actionData = {
              type: 'navigate',
              data: { url: `/dashboard/campaigns/${functionArgs.campaignId}` },
            };
            responseMessage = "Opening the campaign analytics...";
          } else {
            actionData = {
              type: 'navigate',
              data: { url: `/dashboard/campaigns` },
            };
            responseMessage = "Let me show you all your campaigns...";
          }
          break;

        case 'answerQuestion':
          // Return a message without an action
          responseMessage = assistantMessage.content || "I'd be happy to help! Could you provide more details?";
          break;

        default:
          responseMessage = assistantMessage.content || "I'm not sure how to handle that request.";
      }

      return NextResponse.json({
        message: responseMessage,
        action: actionData,
      });
    }

    // If no function call, return the AI's text response
    return NextResponse.json({
      message: assistantMessage?.content || "I'm sorry, I didn't understand that.",
    });
  } catch (error) {
    console.error('AI Co-Pilot error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

