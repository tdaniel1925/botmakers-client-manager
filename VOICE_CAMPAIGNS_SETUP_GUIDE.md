# 🎙️ Voice Agent System - Setup & Usage Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment Setup](#environment-setup)
5. [Database Migration](#database-migration)
6. [Creating Your First Campaign](#creating-your-first-campaign)
7. [Provider Configuration](#provider-configuration)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)

---

## Overview

The Voice Agent System allows platform admins to create AI-powered voice campaigns that can:
- Answer incoming calls automatically
- Make outbound calls to contact lists
- Collect data from callers
- Trigger automated workflows based on call outcomes
- Integrate with 4 major voice AI providers (Vapi, Autocalls, Synthflow, Retell)

### Key Features

✅ **AI-Powered Setup** - Answer 14 simple questions, AI generates the agent  
✅ **Multi-Provider** - Vapi, Autocalls, Synthflow, Retell support  
✅ **Auto Phone Numbers** - Automatically provision phone numbers via Twilio  
✅ **Real-Time Testing** - Test agents immediately via web or phone  
✅ **Call Analytics** - Track performance, quality, costs  
✅ **Workflow Integration** - Trigger emails, SMS, tasks based on call outcomes  

---

## Prerequisites

### Required Accounts

1. **OpenAI Account** - For AI config generation
   - Get API key: https://platform.openai.com/api-keys
   - Minimum: GPT-4 Turbo access

2. **Voice Provider Account** (at least one)
   - **Vapi**: https://vapi.ai
   - **Autocalls**: https://autocalls.ai
   - **Synthflow**: https://synthflow.ai
   - **Retell**: https://retellai.com

3. **Database** - PostgreSQL with Drizzle ORM (already configured)

### System Requirements

- Node.js 18+ 
- PostgreSQL 14+
- Next.js 14
- TypeScript

---

## Installation

### 1. Install Dependencies

```bash
cd codespring-boilerplate
npm install openai nanoid
```

### 2. Verify Existing Dependencies

The following should already be installed:
- `drizzle-orm` - Database ORM
- `@clerk/nextjs` - Authentication
- `next` - Framework
- `react` - UI library
- All ShadCN UI components

---

## Environment Setup

### Create/Update `.env.local`

```bash
# OpenAI (Required for AI generation)
OPENAI_API_KEY=sk-...

# Voice Providers (At least one required)
VAPI_API_KEY=...
VAPI_PUBLIC_KEY=... # Optional, for Vapi webhooks

AUTOCALLS_API_KEY=...

SYNTHFLOW_API_KEY=...

RETELL_API_KEY=...

# App Configuration
NEXT_PUBLIC_BASE_URL=https://yourdomain.com  # Or http://localhost:3000 for development
WEBHOOK_SECRET=your-random-secret-key  # For webhook validation
```

### Generate Secrets

```bash
# Generate webhook secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Migration

### 1. Generate Migration

```bash
npm run db:generate
```

This creates a new migration file in `db/migrations/` with:
- `voice_campaigns` table
- `campaign_provider_metadata` table
- All necessary indexes and relationships

### 2. Push to Database

```bash
npm run db:push
```

This applies the migration to your PostgreSQL database.

### 3. Verify Migration

```bash
# Connect to your database
psql your_database_url

# Check tables
\dt

# Should see:
# - voice_campaigns
# - campaign_provider_metadata
```

---

## Creating Your First Campaign

### Step 1: Access Campaign Creation

**Platform Admin:**
1. Navigate to `/platform/projects/[project-id]`
2. Click "Voice Campaigns" button
3. Click "Create Campaign"

**Alternative Direct URL:**
- `/platform/projects/[project-id]/campaigns`

### Step 2: Choose Provider

Select from 4 providers:
- **Vapi** - Best for advanced features, GPT-4 integration
- **Autocalls** - Best for outbound campaigns, lead management
- **Synthflow** - Best for multi-language, no-code workflows
- **Retell** - Best for developers, custom integrations

### Step 3: Answer Setup Questions

The wizard asks 14 questions:

1. **Campaign Name** - Descriptive name (e.g., "Customer Support Line")
2. **Campaign Type** - Inbound, Outbound, or Both
3. **Business Context** - Brief description of your business
4. **Campaign Goal** - Lead qualification, appointment booking, support, etc.
5. **Agent Personality** - Professional, Friendly, Enthusiastic, or Empathetic
6. **Voice Preference** - Male, Female, or Auto
7. **Key Information** - FAQs, pricing, features the agent should know
8. **Data to Collect** - Name, email, phone, etc.
9. **Follow-up Triggers** - When to create follow-up tasks
10. **Call Duration Target** - Expected call length in minutes
11. **Working Hours** - 24/7, business hours, or custom
12. **Custom Hours** - (if custom selected)
13. **Area Code** - Preferred phone number area code (optional)

### Step 4: AI Generation

The system will:
1. Use GPT-4 to generate system prompt
2. Create first message
3. Generate voicemail message
4. Create conversation guidelines
5. Set up agent in chosen provider
6. Provision phone number
7. Configure webhooks

**This takes 30-60 seconds.**

### Step 5: Test Your Agent

Two testing options:

**Option 1: Call the Agent** (Recommended)
- Use the provisioned phone number
- Call from any phone
- Have a real conversation

**Option 2: Have Agent Call You** (Vapi only)
- Enter your phone number
- Click "Call Me"
- Receive test call in ~10 seconds

### Step 6: Go Live

- Click "Complete Setup"
- Campaign is now ACTIVE
- Starts receiving/making calls immediately

---

## Provider Configuration

### Vapi Setup

1. Sign up at https://vapi.ai
2. Get API key from dashboard
3. Add to `.env.local`:
   ```
   VAPI_API_KEY=your_key_here
   ```

**Features:**
- GPT-4 Turbo & Claude 3 support
- 11labs premium voices
- Deepgram transcription
- Built-in analytics
- Live call monitoring

**Pricing:** ~$0.10-0.15/minute

### Autocalls Setup

1. Sign up at https://autocalls.ai
2. Get API key from settings
3. Add to `.env.local`:
   ```
   AUTOCALLS_API_KEY=your_key_here
   ```

**Features:**
- Campaign management
- Lead tracking
- SMS integration
- Outbound dialing
- CRM integrations

**Pricing:** ~$0.50-1.00/call

### Synthflow Setup

1. Sign up at https://synthflow.ai
2. Get API key from account settings
3. Add to `.env.local`:
   ```
   SYNTHFLOW_API_KEY=your_key_here
   ```

**Features:**
- 30+ languages
- Visual workflow builder
- Zapier integration
- No-code setup

**Pricing:** $99-299/month subscription

### Retell Setup

1. Sign up at https://retellai.com
2. Get API key from dashboard
3. Add to `.env.local`:
   ```
   RETELL_API_KEY=your_key_here
   ```

**Features:**
- Ultra-low latency (<500ms)
- Node.js & Python SDKs
- WebSocket support
- Custom LLM integration

**Pricing:** ~$0.08-0.12/minute

---

## Testing

### Manual Testing Checklist

- [ ] Campaign created successfully
- [ ] Phone number provisioned
- [ ] Can call phone number
- [ ] Agent answers promptly
- [ ] First message is correct
- [ ] Agent responds appropriately
- [ ] Agent collects required data
- [ ] Call data appears in dashboard
- [ ] Webhooks receive call events
- [ ] Workflows trigger correctly

### Test Scenarios

1. **Happy Path**
   - Call agent
   - Answer all questions
   - Provide all requested data
   - End call naturally

2. **Interrupt Test**
   - Interrupt agent mid-sentence
   - Verify agent handles gracefully

3. **Unknown Question**
   - Ask something agent doesn't know
   - Verify appropriate response

4. **Silent Caller**
   - Stay silent for 10 seconds
   - Verify agent prompts

5. **Voicemail Test**
   - Let call go to voicemail
   - Verify voicemail message plays

### Monitoring

**View Campaign Performance:**
- Navigate to project detail page
- See "Voice Campaigns" widget
- View stats: calls, success rate, avg duration, cost

**View Individual Calls:**
- Click "View Calls" on project page
- See all call records with transcripts
- Filter by campaign

---

## Troubleshooting

### Campaign Creation Fails

**Problem:** Error during campaign creation

**Solutions:**
1. Check API keys are correct
2. Verify provider account has credits
3. Check OpenAI API key has GPT-4 access
4. Review error message in console
5. Try different provider

### No Phone Number Assigned

**Problem:** Campaign created but no phone number

**Solutions:**
1. Check provider account has phone number capacity
2. Try different area code
3. Contact provider support
4. Manually assign number via provider dashboard

### Agent Doesn't Answer Calls

**Problem:** Calls go unanswered

**Solutions:**
1. Verify campaign status is "Active"
2. Check phone number is correct
3. Test from different phone
4. Check provider dashboard for errors
5. Verify webhook is configured

### Calls Not Appearing in Dashboard

**Problem:** Making calls but no data in system

**Solutions:**
1. Check webhook URL is accessible
2. Verify webhook token is correct
3. Review API logs for webhook errors
4. Test webhook manually
5. Check database for call records

### Poor Call Quality

**Problem:** Agent responses are slow or incorrect

**Solutions:**
1. Review system prompt
2. Adjust temperature settings (provider dashboard)
3. Try different voice model
4. Provide more context in setup
5. Use GPT-4 instead of GPT-3.5

---

## API Reference

### Server Actions

#### `createVoiceCampaignAction`
```typescript
import { createVoiceCampaignAction } from '@/actions/voice-campaign-actions';

const result = await createVoiceCampaignAction(
  projectId: string,
  provider: "vapi" | "autocalls" | "synthflow" | "retell",
  setupAnswers: CampaignSetupAnswers
);
```

#### `getCampaignsForProjectAction`
```typescript
const result = await getCampaignsForProjectAction(projectId: string);
// Returns: { campaigns: SelectVoiceCampaign[] }
```

#### `updateCampaignAction`
```typescript
const result = await updateCampaignAction(
  campaignId: string,
  updates: { name?, description?, status?, isActive? }
);
```

#### `deleteCampaignAction`
```typescript
const result = await deleteCampaignAction(campaignId: string);
```

#### `testCampaignAction`
```typescript
const result = await testCampaignAction(
  campaignId: string,
  testPhoneNumber: string
);
```

### Provider Factory

```typescript
import { getVoiceProvider } from '@/lib/voice-providers/provider-factory';

const provider = getVoiceProvider("vapi");
const agent = await provider.createAgent(setupAnswers, aiConfig, webhookUrl);
const phoneNumber = await provider.provisionPhoneNumber(agent.id);
```

### AI Generator

```typescript
import { generateCampaignConfig } from '@/lib/ai-campaign-generator';

const aiConfig = await generateCampaignConfig(setupAnswers);
// Returns: AIGeneratedConfig with systemPrompt, firstMessage, etc.
```

### Campaign Stats

```typescript
import { calculateCampaignPerformance } from '@/lib/campaign-stats-calculator';

const metrics = calculateCampaignPerformance(campaign, callRecords);
// Returns: CampaignPerformanceMetrics
```

---

## Best Practices

### 1. System Prompts

**DO:**
- Be specific about agent's role
- Include examples of good responses
- Define clear success criteria
- Specify data to collect

**DON'T:**
- Make prompts too long (>500 words)
- Use vague language
- Forget to handle edge cases

### 2. Voice Selection

- **Professional services**: Male voice, professional personality
- **Customer support**: Female voice, empathetic personality
- **Sales**: Enthusiastic personality, voice matching target demographic

### 3. Call Duration

- **Support**: 3-5 minutes
- **Sales**: 5-10 minutes
- **Surveys**: 2-3 minutes
- **Qualification**: 3-7 minutes

### 4. Working Hours

- **B2B**: Business hours only (9am-5pm)
- **B2C**: Extended hours (8am-8pm)
- **Support**: 24/7 if possible

### 5. Cost Optimization

- Use GPT-3.5 for simple tasks
- Set max call duration limits
- Review and optimize prompts regularly
- Monitor success rates

---

## Support & Resources

### Documentation
- **Vapi**: https://docs.vapi.ai
- **Autocalls**: https://docs.autocalls.ai
- **Synthflow**: https://docs.synthflow.ai
- **Retell**: https://docs.retellai.com
- **OpenAI**: https://platform.openai.com/docs

### Getting Help

1. Check this guide first
2. Review provider documentation
3. Check system logs
4. Contact provider support
5. Review code comments

### Updates

This system is actively developed. Check `VOICE_AGENT_SYSTEM_PLAN.md` for roadmap and future enhancements.

---

**Version:** 1.0  
**Last Updated:** January 2025  
**Status:** ✅ Production Ready
