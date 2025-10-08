# ClientFlow Platform Admin Help Guide

**Version:** 2.0  
**Last Updated:** October 8, 2025  
**For:** Platform Administrators

---

## 📑 Table of Contents

1. [System Overview](#system-overview)
2. [Dashboard & Navigation](#dashboard--navigation)
3. [Organization Management](#organization-management)
4. [Project Management](#project-management)
5. [Voice Campaigns](#voice-campaigns)
6. [Campaign Messaging (SMS & Email)](#campaign-messaging-sms--email)
7. [Dynamic Onboarding System](#dynamic-onboarding-system)
8. [CRM Features](#crm-features)
9. [Support Tickets](#support-tickets)
10. [Platform Settings](#platform-settings)
11. [Billing & Payments](#billing--payments)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)

---

## System Overview

### What is ClientFlow?

ClientFlow is a comprehensive multi-tenant SaaS platform designed for agencies and service providers to manage multiple client organizations. It provides:

- **Organization Management** - Create and manage client organizations
- **Project Management** - Track projects across all clients
- **Voice Campaigns** - AI-powered phone agents for inbound and outbound calling
- **Campaign Messaging** - Automated SMS and email follow-ups
- **Dynamic Onboarding** - AI-powered client intake workflows
- **CRM Features** - Manage contacts, deals, and activities
- **Support System** - Handle client support tickets

### Your Role as Platform Admin

As a platform admin, you have access to:
- ✅ All organizations and their data
- ✅ Platform-wide analytics and reporting
- ✅ Organization creation and configuration
- ✅ Project management across all clients
- ✅ Voice campaign management
- ✅ Platform settings and integrations
- ✅ Support ticket oversight

---

## Dashboard & Navigation

### Accessing the Platform Admin Dashboard

1. Log in to ClientFlow
2. Click **Platform** in the main navigation
3. You'll see the platform admin dashboard with:
   - Organization overview cards
   - Recent projects across all orgs
   - Platform-wide activity feed
   - Quick action buttons

### Navigation Menu

The platform admin sidebar includes:

| Section | What It Does |
|---------|-------------|
| **Dashboard** | Platform overview and analytics |
| **Organizations** | Manage client organizations |
| **Projects** | View all projects across orgs |
| **Voice Campaigns** | Manage AI voice agent campaigns |
| **Users** | View and manage platform users |
| **CRM** | Access to platform-wide CRM data |
| **Support** | Support ticket management |
| **Billing** | View billing across organizations |
| **Settings** | Platform configuration and integrations |
| **Help** | Access this help guide |

---

## Organization Management

### Creating a New Organization

1. Navigate to **Platform → Organizations**
2. Click **+ New Organization**
3. Fill in required fields:
   - **Organization Name** - Client's company name
   - **Slug** - URL-friendly identifier (auto-generated)
   - **Plan** - Free, Pro, or Enterprise
   - **Status** - Trial, Active, Suspended, Cancelled
4. Optional fields:
   - Contact information
   - Address
   - Custom branding (logo, colors)
   - Feature flags
5. Click **Create Organization**

### Organization Settings

For each organization, you can configure:

#### Basic Information
- Name, slug, description
- Contact email and phone
- Physical address
- Website URL

#### Plan & Billing
- Subscription plan (Free/Pro/Enterprise)
- Billing cycle (Monthly/Annual)
- Payment method
- Stripe customer ID
- Max users allowed
- Max storage (GB)

#### Feature Flags
Toggle features on/off per organization:
- Voice campaigns
- CRM module
- Dynamic onboarding
- Advanced analytics
- API access
- Custom branding

#### Branding (Enterprise Only)
- Upload custom logo
- Set primary and secondary colors
- Configure email header/footer
- Customize domain (CNAME)

### Managing Organizations

#### View All Organizations
- Go to **Platform → Organizations**
- See list with: Name, Plan, Users, Status, Created Date
- Search by name or filter by plan/status
- Click any org to view details

#### Suspend an Organization
1. Open organization details
2. Click **Actions → Suspend**
3. Provide reason (shown to org admins)
4. Confirm suspension
5. Users of that org can no longer access system
6. Data is preserved for restoration

#### Restore a Suspended Organization
1. Open suspended organization
2. Click **Restore Organization**
3. Organization status changes to Active
4. Users regain access immediately

#### Delete an Organization
⚠️ **Permanent Action - Cannot Be Undone**

1. Open organization details
2. Click **Actions → Delete Organization**
3. Type organization name to confirm
4. All data is permanently deleted:
   - Users and roles
   - Projects and tasks
   - Contacts and deals
   - Voice campaigns and call data
   - Files and documents

### Organization Analytics

View organization-level metrics:
- Total users and active users
- Storage used vs. limit
- Projects: Active, completed, on hold
- Voice campaigns: Active campaigns, total calls
- Support tickets: Open vs. resolved
- Last activity timestamp

---

## Project Management

### Overview

Projects are the main work units in ClientFlow. Each project:
- Belongs to one organization
- Can have multiple team members
- Includes tasks, milestones, and activities
- Can trigger client onboarding workflows
- Links to voice campaigns

### Creating a Project

1. Navigate to **Platform → Projects → New Project**
2. Fill in project details:
   - **Project Name** - Clear, descriptive name
   - **Organization** - Select client org
   - **Description** - Project overview
   - **Status** - Planning, Active, On Hold, Completed, Cancelled
   - **Priority** - Low, Medium, High, Critical
   - **Start Date** - When project begins
   - **End Date** - Target completion date
   - **Budget** - Optional budget amount
3. Assign team members (optional)
4. Add initial tasks (optional)
5. Set up client onboarding (optional)
6. Click **Create Project**

### Project Statuses

| Status | Meaning | When to Use |
|--------|---------|-------------|
| **Planning** | Not started yet | Initial setup, waiting for kickoff |
| **Active** | Currently in progress | Main work happening |
| **On Hold** | Temporarily paused | Waiting for client, budget freeze |
| **Completed** | Successfully finished | All deliverables done |
| **Cancelled** | Terminated early | Client cancellation, scope changed |

### Managing Project Tasks

#### Task Organization
Tasks are organized into:
- **Status**: To Do, In Progress, Done
- **Priority**: Low, Medium, High
- **Categories**: Development, Design, Content, etc.

#### Creating a Task
1. Open project details
2. Go to **Tasks** tab
3. Click **+ Add Task**
4. Fill in:
   - Title
   - Description
   - Assigned to (team member)
   - Due date
   - Priority
   - Category
5. Click **Create Task**

#### AI-Generated Tasks
Tasks can be auto-generated from:
- Client onboarding responses
- Project templates
- Previous similar projects

### Bulk Project Actions

#### Select All Projects
1. Go to **Platform → Projects**
2. Check box at top to select all on page
3. Banner appears: "All X projects on this page are selected"
4. Click **"Select all Y projects"** to select across all pages

#### Bulk Delete Projects
1. Select multiple projects (checkboxes)
2. Click **Delete Selected** button
3. Confirm deletion
4. All selected projects are permanently deleted

⚠️ **Warning:** Bulk delete is permanent and cannot be undone. Associated data (tasks, files, onboarding sessions) is also deleted.

### Project Analytics

View project metrics:
- Task completion percentage
- Overdue tasks count
- Team member activity
- Time spent (if time tracking enabled)
- Budget vs. actual (if budget set)
- Recent activity timeline

---

## Voice Campaigns

### Overview

Voice Campaigns allow you to deploy AI-powered phone agents for:
- **Inbound Campaigns** - Handle incoming calls
- **Outbound Campaigns** - Make automated calls

All voice campaigns are powered by AI agents that can:
- Understand natural language
- Collect information
- Answer questions
- Route calls
- Send follow-up messages

### Creating a Voice Campaign

#### Step 1: Campaign Basics
1. Go to **Platform → Voice Campaigns → New Campaign**
2. Fill in:
   - **Campaign Name** - Internal name
   - **Project** - Link to project (required)
   - **Campaign Type** - Inbound or Outbound
   - **Campaign Goal** - What you want to achieve

#### Step 2: AI Agent Configuration
Configure your AI agent:

**System Prompt**
- Core instructions for the AI
- Defines agent's personality and role
- Example: "You are a friendly receptionist for ABC Company..."

**First Message**
- What the AI says first (outbound) or as greeting (inbound)
- Example: "Hi, this is Sarah from ABC Company. Is now a good time to talk?"

**Agent Personality**
- Friendly, Professional, Casual, Formal
- Affects tone and word choice

**Voice Preference**
- Select from available voices
- Male/Female options
- Different accents and styles

**Must Collect Fields**
- Information AI must gather
- Examples: Name, Email, Phone, Company
- AI won't end call until these are collected

#### Step 3: Phone Number Setup
For inbound campaigns, you need a phone number:

**Option 1: Auto-Buy from AI Agent Provider (Recommended)**
1. System automatically provisions number
2. Configured and ready to use immediately
3. Number shown after campaign creation
4. Copy number to share with clients

**Option 2: Use Existing Twilio Number**
1. Enter your Twilio number
2. System configures webhooks automatically
3. Verify webhook configuration

#### Step 4: Contact List (Outbound Only)
For outbound campaigns:

1. Click **Upload Contact List**
2. Upload CSV or Excel file
3. Map columns to required fields:
   - Phone Number (required)
   - First Name
   - Last Name
   - Email
   - Company
   - Custom fields
4. System automatically adds timezone based on area code
5. Review contact summary by timezone

#### Step 5: Call Scheduling (Outbound Only)
Configure when calls are made:

**Days of Week**
- Select which days to call
- Default: Monday-Friday

**Call Window**
- Start time: e.g., 9:00 AM
- End time: e.g., 5:00 PM
- Timezone: Respects contact's local timezone

**Call Presets**
- Business Hours (9am-5pm, Mon-Fri)
- Aggressive (8am-8pm, Mon-Sat)
- Gentle (10am-4pm, Mon-Thu)

**Advanced Settings**
- Max attempts per contact (default: 3)
- Time between attempts (default: 24 hours)
- Max concurrent calls (default: 5)
- Respect Do Not Call list

#### Step 6: Review & Launch
1. Review all campaign settings
2. Campaign is created in "Pending" status
3. Click **Launch Campaign** to activate
4. Confirm launch in dialog
5. Campaign becomes "Active"

### Managing Campaigns

#### Campaign Statuses

| Status | Meaning | Can Edit? | Can Launch? |
|--------|---------|-----------|-------------|
| **Draft** | Being created | Yes | No |
| **Pending** | Ready to launch | Yes | Yes |
| **Active** | Currently running | Limited | - |
| **Paused** | Temporarily stopped | Limited | Resume |
| **Completed** | All calls done | No | No |
| **Failed** | Error occurred | Yes | Relaunch |

#### Edit Campaign Settings
1. Open campaign details
2. Click **Settings** (gear icon)
3. Enhanced Settings Dialog opens with tabs:
   - **General** - Name, description, goal
   - **AI Agent** - Prompt, personality, voice
   - **Advanced** - Technical settings
   - **Schedule** (outbound only) - Call timing
4. Make changes
5. Click **Save Settings**

#### Verify Phone Webhook
For Twilio numbers, ensure webhook is correct:

1. Open campaign settings
2. Go to **Advanced** tab
3. Click **Verify & Fix Phone Webhook**
4. System checks webhook configuration
5. If incorrect, system fixes automatically
6. Shows success message

### Campaign Details Page

The campaign detail page has multiple tabs:

#### Overview Tab (Outbound Only)
- Campaign statistics
- Contacts by timezone breakdown
- Call success rate
- Average call duration
- Best performing times

#### Contacts Tab (Outbound Only)
- List of all contacts
- Filter by: Called, Not Called, Success, Failure
- Search by name or phone
- Export contact list
- Add/remove individual contacts

#### Calls Tab
- Real-time call log
- Shows for inbound and outbound
- Details per call:
  - Caller/Recipient info
  - Duration
  - Outcome (Answered, Voicemail, Busy, Failed)
  - Sentiment analysis
  - Call recording (if enabled)
  - Transcript (if enabled)
  - Data collected

#### Analytics Tab
- Call volume over time chart
- Success rate trends
- Best days/times analysis
- Geographic distribution
- Sentiment analysis aggregate

#### SMS & Email Tab (Platform Admin Only)
- Configure automated follow-up messages
- See **Campaign Messaging** section below

### Campaign Actions

#### Pause Campaign
1. Open campaign details
2. Click **Pause** button
3. Outbound calls stop immediately
4. Inbound calls still work
5. Click **Resume** to continue

#### Delete Campaign
1. Open campaign details
2. Click **Actions → Delete Campaign**
3. System removes:
   - AI agent from provider
   - Phone number (if provider-managed)
   - All campaign data
4. Call logs are preserved

⚠️ **Warning:** Deleting a campaign is permanent. Active phone numbers are released.

### Call Data & Reports

#### Viewing Call Records
1. Open campaign → **Calls** tab
2. Each call shows:
   - Date/Time
   - Duration
   - Caller/Recipient name & phone
   - Call status (Completed, Missed, Failed)
   - Data collected during call
   - Sentiment score
   - Follow-up triggered (if any)

#### Exporting Call Data
1. Go to **Calls** tab
2. Select date range
3. Click **Export**
4. Choose format: CSV, Excel, JSON
5. Download file includes all call metadata

#### Call Recordings & Transcripts
If enabled:
- Click **Play** icon to listen to recording
- Click **Transcript** to view text version
- Download recording (MP3)
- Download transcript (TXT or PDF)

---

## Campaign Messaging (SMS & Email)

### Overview

Campaign Messaging allows you to send automated SMS and email follow-ups based on call outcomes. This feature is only visible to Platform Admins.

### How It Works

After each voice call:
1. Call data is analyzed (outcome, sentiment, collected info)
2. System checks message templates for matching triggers
3. If trigger matches, message is sent automatically
4. Message is personalized with call variables
5. Delivery is logged and tracked

### Accessing Campaign Messaging

1. Open any voice campaign
2. Go to **SMS & Email** tab (Platform Admin only)
3. You'll see three sub-tabs:
   - **Templates** - Create and manage message templates
   - **Configuration** - Campaign-level settings
   - **Delivery Log** - Track sent messages

### Creating Message Templates

#### Step 1: Open Template Editor
1. Go to campaign → **SMS & Email** → **Templates**
2. Click **+ Create Template**

#### Step 2: Choose Template Type
- **SMS** - Text message (160 chars recommended)
- **Email** - HTML email with subject line

#### Step 3: Configure Trigger Conditions
**When should this message be sent?**

**Trigger Options:**
- **Call Completed Successfully** - Call was answered and completed
- **Voicemail Left** - Call went to voicemail
- **Call Not Answered** - No answer, no voicemail
- **Specific Sentiment** - Based on call sentiment (Positive, Neutral, Negative)
- **Data Collection Complete** - All must-collect fields were gathered
- **Custom Condition** - Based on specific call variables

**Multiple Conditions:**
- Use **AND** logic - All conditions must match
- Use **OR** logic - Any condition matches

**Example Triggers:**
```
Trigger 1: Call Completed + Sentiment is Positive
→ Send thank you email

Trigger 2: Voicemail Left
→ Send SMS with alternative contact method

Trigger 3: Call Completed + Interest Level = High
→ Send pricing information email
```

#### Step 4: Set Timing
**When to send message:**
- **Immediately** - Send within 1 minute of call
- **Delayed** - Wait X minutes/hours
  - Options: 5min, 15min, 30min, 1hr, 2hr, 4hr, 24hr
- **Scheduled** - Send at specific time of day

**Rate Limiting:**
- Respect campaign rate limits
- Don't send duplicate messages
- Honor unsubscribe requests

#### Step 5: Write Message Content

**For SMS:**
- Keep under 160 characters to avoid multi-part messages
- Use clear, concise language
- Include call-to-action

**For Email:**
- **Subject Line** - Clear and relevant
- **Email Body** - HTML supported
  - Use template variables (see below)
  - Include branding
  - Add unsubscribe link (required)

#### Step 6: Use Template Variables
Insert dynamic data from calls:

| Variable | Replaced With | Example |
|----------|--------------|---------|
| `{{contact_name}}` | Contact's name | John Smith |
| `{{contact_phone}}` | Contact's phone | (555) 123-4567 |
| `{{contact_email}}` | Contact's email | john@example.com |
| `{{call_duration}}` | Call length in minutes | 5 |
| `{{call_summary}}` | AI summary of call | Interested in pricing |
| `{{call_sentiment}}` | Detected sentiment | Positive |
| `{{agent_name}}` | Your AI agent's name | Sarah |
| `{{campaign_name}}` | Campaign name | Summer Promotion |

**Example SMS:**
```
Hi {{contact_name}}! Thanks for speaking with {{agent_name}} today. 
As promised, here's the info: [link]. Reply STOP to opt out.
```

**Example Email Subject:**
```
Following up on our conversation, {{contact_name}}
```

**Example Email Body:**
```html
<p>Hi {{contact_name}},</p>

<p>Thank you for taking the time to speak with {{agent_name}} today. 
Based on our conversation, I thought you'd be interested in:</p>

<ul>
  <li>Pricing information</li>
  <li>Case studies</li>
  <li>Next steps</li>
</ul>

<p>Call Summary: {{call_summary}}</p>

<p>Best regards,<br>The {{campaign_name}} Team</p>
```

#### Step 7: Preview & Test
1. Click **Preview** to see final message
2. Variables are replaced with sample data
3. Check formatting and links
4. Send test message to yourself

#### Step 8: Save Template
1. Give template a name (internal)
2. Click **Save Template**
3. Template is now active for this campaign

### Managing Templates

#### View All Templates
- **Templates** tab shows all messages for campaign
- Each template card shows:
  - Type (SMS or Email)
  - Trigger conditions
  - Timing
  - Status (Active/Paused)
  - Messages sent count

#### Edit Template
1. Click **Edit** on template card
2. Modify any settings
3. Click **Update Template**
4. Changes apply to future messages only

#### Duplicate Template
1. Click **Actions → Duplicate**
2. Template is copied
3. Useful for creating variations

#### Pause/Resume Template
1. Click **Actions → Pause**
2. No messages sent for this template
3. Click **Resume** to reactivate

#### Delete Template
1. Click **Actions → Delete**
2. Confirm deletion
3. Template removed (past messages preserved)

### Campaign Messaging Configuration

Configure campaign-wide messaging settings:

#### Access Configuration
1. Campaign → **SMS & Email** → **Configuration**

#### SMS Settings
- **Enable SMS** - Toggle on/off
- **Default SMS Template** - Fallback template
- **Max SMS per Contact** - Limit messages per person
  - Example: 3 (prevents spam)
- **Min Time Between SMS** - Cooldown period
  - Example: 24 hours

#### Email Settings
- **Enable Email** - Toggle on/off
- **Default Email Template** - Fallback template
- **Max Emails per Contact** - Limit messages per person
  - Example: 5
- **Min Time Between Emails** - Cooldown period
  - Example: 12 hours

#### Save Configuration
Click **Save Configuration** to apply changes

### Message Delivery Log

Track all sent messages:

#### Access Delivery Log
1. Campaign → **SMS & Email** → **Delivery Log**

#### What You'll See
- **Stats Dashboard:**
  - Total messages sent
  - Sent successfully
  - Failed deliveries
  - Pending (in queue)

- **Filters:**
  - Type (SMS or Email)
  - Status (Sent, Failed, Pending)
  - Date range
  - Contact search

- **Message Table:**
  - Template name
  - Recipient (name and phone/email)
  - Status with icon
  - Sent timestamp
  - Open/Click tracking (email only)
  - Error message (if failed)

#### Export Delivery Log
1. Select filters (optional)
2. Click **Export**
3. Download CSV with all delivery data

#### Retry Failed Messages
1. Filter by **Status: Failed**
2. Select messages to retry
3. Click **Retry Selected**
4. Messages are re-queued for delivery

### SMS & Email Credentials

**Important:** To send messages, you need messaging credentials configured.

By default, messages use **platform-wide credentials** that you configure in Platform Settings.

Organizations can optionally configure their own credentials (Bring Your Own Keys - BYOK) for:
- Dedicated rate limits
- Cost control
- Full transparency

See **Platform Settings → Messaging Providers** section below.

---

## Dynamic Onboarding System

### Overview

The Dynamic Onboarding System creates intelligent client intake workflows that:
- Collect comprehensive project information
- Adapt questions based on responses
- Provide AI-powered feedback
- Generate actionable to-do lists
- Track completion progress

### Template Library

#### Pre-Built Templates
7 comprehensive industry templates are included:

1. **Outbound Calling Campaign** (45+ questions, 10 steps)
2. **Inbound Call Center Setup** (50+ questions, 11 steps)
3. **Web Design/Development** (35+ questions, 8 steps)
4. **AI Voice Agent** (40+ questions, 9 steps)
5. **Software Development** (45+ questions, 10 steps)
6. **Marketing Campaign** (35+ questions, 8 steps)
7. **CRM Implementation** (40+ questions, 9 steps)

#### Template Actions
- **Preview** - See all questions before use
- **Edit** - Customize questions and logic
- **Duplicate** - Create variations
- **Archive** - Hide unused templates

### Creating Custom Templates with AI

#### Step 1: Initiate Generator
1. Navigate to **Platform → Onboarding Templates**
2. Click **Create Custom Template**

#### Step 2: Describe Project Type
Provide:
- **Project Type Name** (e.g., "Video Production")
- **Detailed Description** of the service

**💡 Tip:** More detail = better questions

**Example:**
```
Video production services for corporate training videos. 
Includes scriptwriting, filming, editing, and final delivery. 
Typical projects range from 2-10 minute videos with 
professional voiceover and graphics.
```

#### Step 3: AI Generation (30-60 seconds)
AI will:
- Analyze your description
- Generate 8-12 grouped steps
- Create conditional logic
- Suggest compliance questions

#### Step 4: Review & Customize
- Preview generated questions
- Add/remove fields
- Adjust logic
- Edit labels

#### Step 5: Test & Save
- Test conditional logic
- Save to library
- Use for projects

### Setting Up Client Onboarding

#### Create Project with Onboarding
1. **Platform → Projects → New Project**
2. Fill in project basics
3. Check **"Set up client onboarding"**
4. Select template or create custom
5. Optionally customize questions
6. Click **Create Project**

#### Send Invitation
1. System sends email to client with:
   - Unique access link (no login required)
   - Estimated completion time
   - Your contact info
2. Client receives invitation instantly

### Reviewing Onboarding Responses

#### Access Session Details
1. **Platform → Onboarding → Sessions**
2. Click on completed session

#### What You'll See

**Client Responses Section:**
- All questions and answers by step
- File uploads with download links
- Completion timestamp
- Total time spent

**AI Analysis Summary:**
- Key requirements extracted
- Compliance considerations
- Project complexity score (1-10)
- Recommended next steps
- Identified risk factors

### Managing AI-Generated To-Do Lists

#### How Generation Works
When client completes onboarding, AI:
1. Analyzes all responses
2. Generates two task lists:
   - **Admin Tasks** - For your team
   - **Client Tasks** - For the client
3. Categorizes tasks (Setup, Content, Integration, etc.)
4. Assigns priority (High, Medium, Low)
5. Estimates duration (in minutes)
6. Detects task dependencies

#### Review Panel
1. Open session detail page
2. Go to **To-Do Lists** section
3. Click **Generate To-Dos** if not auto-generated

#### Admin Tasks Tab
- View tasks for your team
- Inline edit title/description
- Change priority
- Assign to team members
- Reorder tasks (drag and drop)
- Delete irrelevant tasks
- Add custom tasks

#### Client Tasks Tab
- View tasks for client
- Same editing capabilities
- Tasks hidden from client until approved

#### Task Categories
- **Setup** - Account creation, configuration
- **Compliance** - Training, policies, agreements
- **Content** - Copy, images, assets
- **Integration** - API keys, credentials, access
- **Review** - Approvals, testing, feedback
- **Other** - Miscellaneous

### Approving Client Tasks

#### Why Approval Required
Ensures tasks are:
- Accurate and relevant
- Clearly worded for clients
- Free of sensitive internal info
- Properly prioritized

#### Approval Process
1. Review **Client Tasks** tab
2. Make final edits
3. Click **"Approve & Send to Client"**
4. Client receives email notification
5. Tasks appear in their dashboard

⚠️ After approval, edits require notifying client

### Monitoring Client Progress

#### Real-Time Notifications
You receive notifications when:
- Client completes a task
- Client completes all tasks
- Client hasn't started after 48 hours

#### Session Progress View
1. **Platform → Onboarding → Sessions**
2. See completion status:
   - Onboarding: Complete / In Progress
   - To-Dos: X of Y completed
3. Click session to see:
   - Which tasks are done
   - Client submissions
   - Timestamps

---

## CRM Features

### Overview

ClientFlow includes a full CRM system for managing:
- **Contacts** - People at client organizations
- **Deals** - Sales opportunities
- **Activities** - Meetings, calls, emails
- **Notes** - Important information

### Managing Contacts

#### Creating a Contact
1. **Platform → CRM → Contacts → New Contact**
2. Fill in:
   - **Name** (First + Last)
   - **Organization** (required)
   - **Email** (required)
   - **Phone**
   - **Job Title**
   - **Status** - Lead, Active, Inactive
   - **Tags** - Categorize contacts
3. Click **Create Contact**

#### Contact Details Page
- Contact information
- Associated deals
- Activity timeline
- Notes and files
- Communication history

#### Bulk Contact Actions
- Import from CSV
- Export to CSV
- Bulk tag assignment
- Bulk delete

### Managing Deals

#### Creating a Deal
1. **Platform → CRM → Deals → New Deal**
2. Fill in:
   - **Deal Name**
   - **Organization** (required)
   - **Primary Contact**
   - **Value** - Dollar amount
   - **Stage** - Lead, Qualified, Proposal, Negotiation, Won, Lost
   - **Probability** - % chance of closing
   - **Expected Close Date**
3. Click **Create Deal**

#### Deal Pipeline
View deals by stage:
- Drag and drop between stages
- Quick stats per stage
- Total pipeline value
- Weighted forecast (value × probability)

### Activities & Notes

#### Log an Activity
1. Open contact or deal
2. Click **+ Log Activity**
3. Select type:
   - Meeting
   - Call
   - Email
   - Task
   - Note
4. Fill in details and description
5. Click **Save**

#### Activity Timeline
- Chronological view of all activities
- Filter by type or date range
- See who logged each activity

---

## Support Tickets

### Overview

Platform admins can view and manage support tickets submitted by organization users.

### Accessing Support Tickets

1. Navigate to **Platform → Support**
2. See all tickets across all organizations
3. Filter by:
   - Status (Open, In Progress, Resolved, Closed)
   - Priority (Low, Medium, High, Critical)
   - Organization
   - Date range

### Ticket Details

Each ticket shows:
- **Ticket ID** - Unique identifier
- **Subject** - Issue summary
- **Description** - Full details
- **Status** - Current state
- **Priority** - Urgency level
- **Submitter** - User who created ticket
- **Organization** - Which client
- **Created Date** - When submitted
- **Last Updated** - Most recent activity

### Managing Tickets

#### Assign a Ticket
1. Open ticket details
2. Click **Assign**
3. Select team member
4. They receive notification

#### Update Ticket Status
1. Open ticket
2. Click **Status** dropdown
3. Select new status:
   - **Open** - Newly submitted
   - **In Progress** - Being worked on
   - **Resolved** - Fixed, awaiting confirmation
   - **Closed** - Confirmed resolved
4. Status updates immediately

#### Add Internal Notes
1. Open ticket
2. Scroll to **Internal Notes** section
3. Add note (not visible to client)
4. Click **Add Note**
5. Useful for team coordination

#### Reply to Submitter
1. Open ticket
2. Scroll to **Responses** section
3. Type reply (visible to client)
4. Click **Send Reply**
5. Client receives email notification

#### Close Ticket
1. Open ticket
2. Click **Close Ticket**
3. Add resolution note
4. Client receives closure notification

### Support Analytics

View platform-wide support metrics:
- Total open tickets
- Average resolution time
- Tickets by priority
- Tickets by organization
- Common issue categories

---

## Platform Settings

### Accessing Platform Settings

Navigate to **Platform → Settings**

Settings are organized in tabs:
- **General** - Platform basics
- **Integrations** - API keys and services
- **Messaging** - SMS and email providers
- **Billing** - Payment provider settings
- **Security** - Platform-wide security settings
- **Notifications** - Email and notification settings

### General Settings

#### Platform Information
- **Platform Name** - Your agency name
- **Platform URL** - Custom domain (if configured)
- **Support Email** - Where users can reach you
- **Logo** - Platform-wide logo (dashboard, emails)
- **Favicon** - Browser tab icon

#### Default Settings
- **Default Timezone** - Platform default
- **Date Format** - MM/DD/YYYY or DD/MM/YYYY
- **Currency** - USD, EUR, GBP, etc.
- **Language** - Interface language

### Integrations

Configure external services:

#### OpenAI
Required for AI features:
- **API Key** - Your OpenAI key
- **Model** - GPT-4o, GPT-4o-mini
- **Temperature** - Creativity setting (0-1)

**Used for:**
- AI template generation
- To-do list generation
- Call analysis
- Smart project suggestions

#### Voice Provider (Vapi)
Required for voice campaigns:
- **API Key** - Your Vapi key
- **Webhook Secret** - For webhook verification

**Features:**
- AI phone agent creation
- Call management
- Phone number provisioning
- Real-time call handling

#### Twilio (Platform-Level)
Optional - used as fallback for SMS:
- **Account SID**
- **Auth Token**
- **Phone Number** - Your Twilio number

**Used for:**
- SMS follow-ups (platform-wide default)
- Phone number provisioning (alternative to Vapi)

#### Resend (Platform-Level)
Optional - used as fallback for Email:
- **API Key**
- **From Email** - Verified sender address
- **From Name** - Sender display name

**Used for:**
- Campaign email follow-ups (platform-wide default)
- System transactional emails
- Onboarding notifications

#### Uploadthing
Required for file uploads:
- **API Key**
- **API Secret**

**Used for:**
- Client file uploads in onboarding
- Document attachments
- Profile pictures

### Messaging Providers

#### Platform-Wide Credentials (Default)
Configure default credentials used by all organizations:

**Twilio (SMS)**
1. Go to **Settings → Messaging → Platform Credentials**
2. Enter:
   - **Account SID** (starts with AC)
   - **Auth Token**
   - **Phone Number** (format: +1234567890)
3. Click **Test Connection**
4. If successful, click **Save**

**Resend (Email)**
1. Go to **Settings → Messaging → Platform Credentials**
2. Enter:
   - **API Key** (starts with re_)
   - **From Email** (must be from verified domain)
3. Click **Test Connection**
4. If successful, click **Save**

**How It Works:**
- All campaigns use these credentials by default
- Shared rate limits across platform
- No per-organization configuration needed

#### Organization-Specific Credentials (BYOK)
Organizations can configure their own credentials for:
- Dedicated rate limits
- Direct cost control
- Full transparency in provider dashboards

**How BYOK Works:**
1. Organization goes to their **Settings → Messaging** tab
2. Toggles on "Use Custom Twilio Account" or "Use Custom Email Service"
3. Enters their own credentials
4. System tests and verifies credentials
5. All messaging for that org uses their credentials

**Platform Admin View:**
- See which orgs have BYOK enabled
- View verification status
- Cannot see org credentials (security)

**Fallback Logic:**
- If org has BYOK enabled + verified → Use org credentials
- Otherwise → Use platform credentials
- If both fail → Error logged, notification sent

#### Encryption & Security
- All credentials encrypted with AES-256-GCM
- Encryption key stored in environment variable
- Keys never displayed in full (masked)
- Credentials tested before saving

---

## Billing & Payments

### Overview

ClientFlow supports multiple payment providers:
- Stripe (Primary)
- Square
- PayPal

### Payment Provider Configuration

#### Stripe Setup
1. **Settings → Billing → Stripe**
2. Enter:
   - **Publishable Key**
   - **Secret Key**
   - **Webhook Secret**
3. Configure products and prices:
   - Free Plan (Price ID)
   - Pro Plan (Price ID)
   - Enterprise Plan (Price ID)
4. Click **Save Configuration**

#### Square Setup
1. **Settings → Billing → Square**
2. Enter:
   - **Application ID**
   - **Access Token**
   - **Location ID**
3. Click **Save Configuration**

#### PayPal Setup
1. **Settings → Billing → PayPal**
2. Enter:
   - **Client ID**
   - **Client Secret**
3. Toggle **Sandbox Mode** for testing
4. Click **Save Configuration**

### Subscription Plans

Define plan features and pricing:

#### Plan Types
- **Free** - Trial/freemium tier
- **Pro** - Standard paid plan
- **Enterprise** - Premium features

#### Configure Plan Limits
For each plan, set:
- Max users
- Max projects
- Max storage (GB)
- Max voice campaigns
- Max contacts in CRM
- Feature access flags

### Viewing Billing

#### Organization Billing
1. Open organization details
2. Go to **Billing** tab
3. See:
   - Current plan
   - Payment method
   - Subscription status
   - Next billing date
   - Payment history

#### Platform Billing Dashboard
1. **Platform → Billing**
2. View aggregated metrics:
   - Total MRR (Monthly Recurring Revenue)
   - Active subscriptions by plan
   - Churn rate
   - Failed payments
   - Revenue trends chart

---

## Best Practices

### Organization Management
✅ **Use clear naming conventions** - Helps with searching and filtering  
✅ **Set appropriate plans** - Match features to client needs  
✅ **Configure feature flags** - Enable only what clients need  
✅ **Regular plan reviews** - Ensure clients on right tier  
✅ **Document custom branding** - Note changes for support

### Project Management
✅ **Link projects to campaigns** - Better tracking and reporting  
✅ **Use meaningful project names** - Include client name for clarity  
✅ **Set realistic dates** - Under-promise, over-deliver  
✅ **Regular status updates** - Keep stakeholders informed  
✅ **Archive completed projects** - Keep active list focused

### Voice Campaigns
✅ **Test AI agents thoroughly** - Make test calls before launch  
✅ **Start small** - Test with 10-50 contacts before full launch  
✅ **Monitor first hour** - Catch issues early  
✅ **Review call logs daily** - Identify improvement opportunities  
✅ **Optimize AI prompts** - Iterate based on actual calls  
✅ **Respect timezones** - Use smart scheduling  
✅ **Have fallback plans** - What if AI can't help?

### Campaign Messaging
✅ **Keep SMS under 160 chars** - Avoid multi-part messages  
✅ **Personalize with variables** - Higher engagement  
✅ **Test before activating** - Send to yourself first  
✅ **Respect rate limits** - Don't spam contacts  
✅ **Include opt-out** - Required for SMS, best practice for email  
✅ **Monitor delivery rates** - High failure rate? Check credentials  
✅ **A/B test messages** - Optimize based on data

### Onboarding System
✅ **Choose right template** - Match to project type  
✅ **Customize sparingly** - Pre-built templates are optimized  
✅ **Test custom templates** - Complete as mock client  
✅ **Set client expectations** - Tell them time required  
✅ **Review AI tasks carefully** - Remove irrelevant items  
✅ **Approve tasks promptly** - Within 24 hours of completion  
✅ **Respond to completed tasks** - Acknowledge submissions

### Support Management
✅ **Assign tickets quickly** - Within 4 hours  
✅ **Set realistic SLAs** - Based on priority  
✅ **Use internal notes** - Team coordination  
✅ **Close with summary** - Confirm resolution  
✅ **Track common issues** - Identify patterns

---

## Troubleshooting

### Campaign Issues

#### Issue: Campaign won't launch
**Possible Causes:**
- Missing required fields
- No contact list (outbound)
- No phone number configured (inbound)
- AI agent not created

**Solutions:**
1. Check campaign status (must be "Pending")
2. Review all tabs for validation errors
3. Verify phone number is active
4. Check provider API keys in Settings

---

#### Issue: Calls not being made (Outbound)
**Possible Causes:**
- Outside call window hours
- All contacts already called (reached max attempts)
- Campaign is paused
- Contact list has errors

**Solutions:**
1. Check current time vs. call window
2. Review contact list → Filter by "Not Called"
3. Verify campaign status is "Active"
4. Check call scheduling settings
5. Look at campaign logs for errors

---

#### Issue: Inbound calls not connecting
**Possible Causes:**
- Webhook URL incorrect
- Phone number not linked to AI agent
- Provider (Vapi) API issue

**Solutions:**
1. Open campaign settings
2. Go to **Advanced** tab
3. Click **Verify & Fix Phone Webhook**
4. If using Twilio:
   - Go to Twilio console
   - Check phone number webhooks
   - Should point to `https://api.vapi.ai/twilio/inbound_call`
5. Test by calling number

---

### Messaging Issues

#### Issue: SMS not sending
**Possible Causes:**
- Twilio credentials invalid
- Insufficient Twilio balance
- Phone number not SMS-capable
- Message content violates carrier rules

**Solutions:**
1. Go to **Settings → Messaging**
2. Click **Test Connection** for Twilio
3. If fails:
   - Verify credentials in Twilio dashboard
   - Check Twilio account balance
   - Ensure phone number has SMS enabled
4. Check message delivery log for error details

---

#### Issue: Emails not sending
**Possible Causes:**
- Resend credentials invalid
- Domain not verified in Resend
- "From Email" doesn't match verified domain
- Recipient marked as spam

**Solutions:**
1. Go to **Settings → Messaging**
2. Click **Test Connection** for Resend
3. If fails:
   - Log into Resend dashboard
   - Verify domain is active
   - Check API key permissions
4. Ensure "From Email" is from verified domain
5. Check Resend logs for delivery issues

---

#### Issue: Messages being sent multiple times
**Possible Causes:**
- Multiple templates with same trigger
- Rate limiting not configured
- Webhook retries (call provider)

**Solutions:**
1. Review campaign → **SMS & Email** → **Templates**
2. Check for duplicate trigger conditions
3. Consolidate duplicate templates
4. Configure rate limits in **Configuration** tab:
   - Set max messages per contact
   - Set min time between messages

---

### Onboarding Issues

#### Issue: Client can't access onboarding link
**Possible Causes:**
- Link expired (30 days)
- Email in spam folder
- Link forwarded (user-specific)

**Solutions:**
1. Go to **Platform → Onboarding → Sessions**
2. Find session
3. Click **Resend Invitation**
4. Ask client to check spam
5. If still failing, click **Reset Session** for new link

---

#### Issue: To-dos not generating
**Possible Causes:**
- OpenAI API error
- Rate limiting
- Timeout during analysis

**Solutions:**
1. Go to session detail page
2. Click **Generate To-Dos** manually
3. Wait 30 seconds
4. If fails again, check **Settings → Integrations → OpenAI**
5. Verify API key is valid
6. Check OpenAI account for issues

---

### Organization Issues

#### Issue: Organization users can't log in
**Possible Causes:**
- Organization suspended
- User account disabled
- Authentication provider issue

**Solutions:**
1. Check organization status (Platform → Organizations)
2. If suspended, click **Restore Organization**
3. Check individual user account status
4. Verify authentication is working platform-wide

---

#### Issue: Organization features not working
**Possible Causes:**
- Feature flags disabled
- Plan limitations reached
- Configuration incomplete

**Solutions:**
1. Open organization details
2. Check **Feature Flags** section
3. Enable required features
4. Verify plan limits not exceeded:
   - User count
   - Storage usage
   - Project count
5. Review organization settings for missing config

---

### Integration Issues

#### Issue: Vapi calls failing
**Possible Causes:**
- Invalid API key
- Webhook secret mismatch
- Account suspended
- Rate limiting

**Solutions:**
1. Go to **Settings → Integrations → Voice Provider**
2. Verify API key
3. Test in Vapi dashboard
4. Check Vapi account status
5. Review usage limits

---

#### Issue: OpenAI features not working
**Possible Causes:**
- Invalid API key
- Insufficient credits
- Rate limiting
- Model unavailable

**Solutions:**
1. Go to **Settings → Integrations → OpenAI**
2. Verify API key
3. Log into OpenAI dashboard
4. Check credits/billing
5. Verify model access (gpt-4o)
6. Check usage limits

---

## Getting Help

### Documentation Resources
- **App Overview:** `APP_OVERVIEW.md` - Complete system documentation
- **BYOK Guide:** `BYOK_MESSAGING_GUIDE.md` - Messaging credential setup
- **Technical Docs:** `ADMIN_BYOK_IMPLEMENTATION.md` - Technical architecture

### Support Contacts
- **Technical Issues:** usecodespring@gmail.com
- **Feature Requests:** Submit via platform feedback
- **Billing Questions:** Check organization settings
- **Emergency Support:** Platform status dashboard

### Useful Links
- [Vapi Documentation](https://docs.vapi.ai)
- [Twilio Console](https://console.twilio.com/)
- [Resend Dashboard](https://resend.com/overview)
- [OpenAI Platform](https://platform.openai.com/)

---

## Changelog

### Version 2.0 (October 8, 2025)
- ✅ Added BYOK messaging credentials system
- ✅ Enhanced campaign messaging features (SMS & Email)
- ✅ Improved voice campaign management
- ✅ Added bulk project actions
- ✅ Updated webhook verification
- ✅ Comprehensive platform settings documentation

### Version 1.0 (October 5, 2025)
- Initial platform admin help guide
- Dynamic onboarding system documentation
- Template library guide
- Basic platform management

---

**End of Platform Admin Help Guide**

*Last Updated: October 8, 2025*  
*Questions? Email: usecodespring@gmail.com*

