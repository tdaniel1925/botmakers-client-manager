# ClientFlow - Comprehensive Application Overview

**Version:** 1.7  
**Last Updated:** October 6, 2025  
**Type:** Multi-Tenant SaaS CRM Platform with AI-Powered Client Onboarding, Intelligent Workflow Automation, Self-Healing System & Complete Organization Contacts

---

## 🎯 Executive Summary

**ClientFlow** is a comprehensive multi-tenant SaaS CRM platform designed for agencies and service providers to manage multiple client organizations. It provides a two-tier architecture where:

1. **Platform Admins (Agency Level)** - Manage multiple client organizations, create projects, view platform-wide analytics, launch AI-powered client onboarding workflows, and monitor system health with self-healing capabilities
2. **Organization Users** - Manage organization contacts, projects, and activities within their own organization

The platform combines modern project management with AI-powered insights, intelligent client onboarding that collects requirements through dynamic context-aware forms, automated error recovery through self-healing systems, and comprehensive organization contact management for tracking all client stakeholders.

---

## 🏗️ Architecture Overview

### Multi-Tenant Model

ClientFlow uses a **shared database with row-level isolation** approach:

```
┌─────────────────────────────────────────────────────┐
│                  Platform Layer                      │
│              (Super Admin / Agency)                  │
│  • Create & Manage Organizations                    │
│  • Platform-Wide Analytics                          │
│  • Create Projects for Clients                      │
│  • Support Ticket Management                        │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼──────┐  ┌─────▼───────┐
│Organization 1 │  │Organization 2│  │Organization 3│
│              │  │              │  │              │
│ • Users      │  │ • Users      │  │ • Users      │
│ • Contacts   │  │ • Contacts   │  │ • Contacts   │
│ • Deals      │  │ • Deals      │  │ • Deals      │
│ • Projects   │  │ • Projects   │  │ • Projects   │
│ • Activities │  │ • Activities │  │ • Activities │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | React Server Components, streaming |
| **UI** | Tailwind CSS + ShadCN UI | Component library, consistent design |
| **Animation** | Framer Motion | Smooth transitions, micro-interactions |
| **Backend** | Next.js Server Actions | Type-safe API endpoints |
| **Database** | PostgreSQL (Supabase) | Production-ready hosted DB |
| **ORM** | Drizzle ORM | Type-safe database queries |
| **Authentication** | Clerk | User auth, session management |
| **File Storage** | Uploadthing | Reliable file uploads & CDN |
| **Payments** | Stripe, Square, PayPal | Multi-provider subscription billing |
| **AI/ML** | OpenAI GPT-4o | AI agents, project analysis, self-healing |
| **Voice AI** | Vapi | AI phone agents, call management |
| **Telephony** | Twilio | Phone number provisioning, SMS |
| **Email** | Resend | Transactional email delivery |
| **Deployment** | Vercel | Edge functions, global CDN, cron jobs |

---

## 🗄️ Database Schema

### Core Tables

#### Organizations
```typescript
organizations
  - id: UUID
  - name: TEXT
  - slug: TEXT (unique, for URLs)
  - plan: ENUM (free, pro, enterprise)
  - status: ENUM (active, trial, suspended, cancelled)
  - stripe_customer_id: TEXT
  - stripe_subscription_id: TEXT
  - max_users: INTEGER
  - max_storage_gb: INTEGER
  - settings: JSONB
  - feature_flags: JSONB
  - created_at, updated_at, suspended_at, cancelled_at
```

#### User Roles
```typescript
user_roles
  - id: UUID
  - user_id: TEXT (Clerk user ID)
  - organization_id: UUID → organizations
  - role: ENUM (admin, manager, member)
  - created_at, updated_at
```

#### Contacts
```typescript
contacts
  - id: UUID
  - organization_id: UUID → organizations
  - name: TEXT
  - email: TEXT
  - phone: TEXT
  - company: TEXT
  - position: TEXT
  - notes: TEXT
  - tags: TEXT[]
  - status: ENUM (lead, qualified, customer, churned)
  - source: TEXT
  - linkedin_url, twitter_url, website_url
  - created_at, updated_at
```

#### Deals
```typescript
deals
  - id: UUID
  - organization_id: UUID → organizations
  - title: TEXT
  - description: TEXT
  - value: DECIMAL
  - stage_id: UUID → deal_stages
  - contact_id: UUID → contacts
  - probability: INTEGER (0-100)
  - expected_close_date: DATE
  - priority: ENUM (low, medium, high)
  - created_at, updated_at
```

#### Projects
```typescript
projects
  - id: UUID
  - organization_id: UUID → organizations
  - name: TEXT
  - description: TEXT (detailed for AI)
  - status: ENUM (planning, active, on_hold, completed, cancelled)
  - priority: ENUM (low, medium, high, critical)
  - budget: DECIMAL
  - start_date, end_date: TIMESTAMP
  - created_by: TEXT (platform admin user ID)
  - assigned_to: TEXT (org user ID)
  - contact_id: UUID → contacts
  - deal_id: UUID → deals
  - metadata: JSONB (AI-generated data)
  - created_at, updated_at
```

#### Project Tasks
```typescript
project_tasks
  - id: UUID
  - project_id: UUID → projects
  - title: TEXT
  - description: TEXT
  - status: ENUM (todo, in_progress, done)
  - assigned_to: TEXT
  - due_date: TIMESTAMP
  - ai_generated: BOOLEAN
  - created_at, updated_at
```

#### Activities
```typescript
activities
  - id: UUID
  - organization_id: UUID → organizations
  - type: ENUM (call, email, meeting, note, task)
  - title: TEXT
  - description: TEXT
  - contact_id: UUID → contacts
  - deal_id: UUID → deals
  - due_date: TIMESTAMP
  - completed: BOOLEAN
  - created_by: TEXT (user ID)
  - created_at, updated_at
```

### Platform Admin Tables

#### Platform Admins
```typescript
platform_admins
  - id: UUID
  - user_id: TEXT (Clerk user ID, unique)
  - role: ENUM (super_admin, support_staff, billing_admin)
  - permissions: JSONB
  - created_at, updated_at
```

#### Support Tickets
```typescript
support_tickets
  - id: UUID
  - organization_id: UUID → organizations
  - created_by_user_id: TEXT
  - assigned_to_platform_admin_id: UUID → platform_admins
  - subject: TEXT
  - description: TEXT
  - status: ENUM (open, in_progress, resolved, closed)
  - priority: ENUM (low, medium, high, critical)
  - category: ENUM (billing, technical, feature, account, other)
  - created_at, updated_at, resolved_at
```

#### Audit Logs
```typescript
audit_logs
  - id: UUID
  - organization_id: UUID → organizations (optional)
  - user_id: TEXT
  - action: TEXT (e.g., 'organization.create', 'user.invite')
  - entity_type: TEXT (e.g., 'organization', 'project')
  - entity_id: UUID
  - changes: JSONB (old vs new values)
  - ip_address: INET
  - user_agent: TEXT
  - created_at
```

### AI Onboarding Tables

#### Client Onboarding Sessions
```typescript
client_onboarding_sessions
  - id: UUID
  - project_id: UUID → projects
  - organization_id: UUID → organizations
  - template_id: UUID → onboarding_templates (optional)
  - access_token: UUID (unique, for public access)
  - onboarding_type: ENUM (web_design, voice_ai, software_dev, generic, auto)
  - status: ENUM (pending, in_progress, completed, abandoned)
  - steps: JSONB (dynamic onboarding steps)
  - responses: JSONB (client responses to all steps)
  - current_step: INTEGER (progress tracking)
  - completion_percentage: INTEGER
  - expires_at: TIMESTAMP
  - created_at, updated_at, completed_at
```

#### Onboarding Templates
```typescript
onboarding_templates
  - id: UUID
  - name: TEXT (e.g., "Web Design Onboarding")
  - description: TEXT
  - template_type: ENUM (web_design, voice_ai, software_dev, generic)
  - steps: JSONB (pre-defined onboarding steps)
  - is_active: BOOLEAN
  - created_by: TEXT (platform admin user ID)
  - created_at, updated_at
```

#### Onboarding Responses
```typescript
onboarding_responses
  - id: UUID
  - session_id: UUID → client_onboarding_sessions
  - step_number: INTEGER
  - question_id: TEXT
  - response_type: ENUM (text, choice, file, date, array)
  - response_value: JSONB
  - created_at, updated_at
```

#### Notification Templates
```typescript
notification_templates
  - id: UUID
  - name: TEXT
  - type: TEXT (email | sms)
  - category: TEXT (e.g., 'onboarding_invite', 'todos_approved')
  - subject: TEXT (emails only)
  - body_text: TEXT (plain text content)
  - body_html: TEXT (HTML content for emails)
  - variables: JSONB (array of available variables)
  - is_active: BOOLEAN
  - is_system: BOOLEAN (protects from deletion)
  - usage_count: INTEGER
  - created_at, updated_at
```

#### Branding Settings
```typescript
branding_settings
  - id: UUID
  - organization_id: UUID (NULL for platform-wide branding)
  - logo_url: TEXT (main logo)
  - logo_dark_url: TEXT (logo for dark backgrounds)
  - favicon_url: TEXT
  - primary_color: TEXT DEFAULT '#00ff00' (neon green)
  - secondary_color: TEXT DEFAULT '#000000' (black)
  - accent_color: TEXT DEFAULT '#00ff00'
  - text_color: TEXT DEFAULT '#000000'
  - background_color: TEXT DEFAULT '#ffffff'
  - company_name: TEXT DEFAULT 'Botmakers'
  - company_address: TEXT (CAN-SPAM required)
  - company_phone: TEXT
  - company_email: TEXT
  - support_email: TEXT
  - twitter_url, linkedin_url, facebook_url, instagram_url: TEXT
  - website_url: TEXT
  - email_from_name: TEXT
  - email_footer_text: TEXT
  - show_logo_in_emails: BOOLEAN DEFAULT TRUE
  - show_social_links: BOOLEAN DEFAULT TRUE
  - created_at, updated_at
```

#### Organization Contacts
```typescript
organization_contacts
  - id: UUID
  - organization_id: UUID → organizations
  - first_name: TEXT
  - last_name: TEXT
  - full_name: TEXT (generated)
  - job_title: TEXT
  - department: TEXT
  - email: TEXT
  - phone: TEXT
  - mobile_phone: TEXT
  - office_phone: TEXT
  - address_line_1, address_line_2: TEXT
  - city, state, postal_code, country: TEXT
  - notes: TEXT
  - is_primary: BOOLEAN (one primary contact per org)
  - is_active: BOOLEAN (soft delete)
  - created_by: TEXT (user ID)
  - created_at, updated_at
```

### Self-Healing System Tables

#### Healing Events
```typescript
healing_events
  - id: UUID
  - event_type: TEXT (error_caught, healing_attempted, healing_success, etc.)
  - error_category: TEXT (api_failure, database_error, runtime_error, performance_issue)
  - error_source: TEXT (file/component where error occurred)
  - error_message: TEXT
  - error_stack: TEXT
  - error_context: JSONB (request data, user context)
  - ai_analysis: JSONB (AI diagnosis and recommended fix)
  - ai_confidence_score: DECIMAL (0.00-1.00)
  - healing_strategy: TEXT (retry, fallback, cache_clear, connection_reset, etc.)
  - healing_actions: JSONB (array of actions taken)
  - healing_result: TEXT (success, partial, failed, skipped)
  - healing_duration_ms: INTEGER
  - affected_users: TEXT[] (user IDs affected)
  - affected_organizations: TEXT[] (org IDs affected)
  - severity: TEXT (low, medium, high, critical)
  - resolved_at: TIMESTAMP
  - created_at: TIMESTAMP
  - admins_notified: TEXT[] (platform admin IDs notified)
  - notification_sent_at: TIMESTAMP
```

#### System Health Checks
```typescript
system_health_checks
  - id: UUID
  - check_type: TEXT (api_health, db_connection, memory_usage, response_time, error_rate)
  - check_name: TEXT
  - status: TEXT (healthy, degraded, unhealthy)
  - metrics: JSONB (specific metrics for this check)
  - threshold_breached: BOOLEAN
  - auto_healed: BOOLEAN
  - healing_event_id: UUID → healing_events
  - checked_at: TIMESTAMP
```

#### Healing Patterns
```typescript
healing_patterns
  - id: UUID
  - error_signature: TEXT (hash of error type + source, unique)
  - error_pattern: TEXT
  - successful_healing_strategy: TEXT
  - success_count: INTEGER
  - failure_count: INTEGER
  - success_rate: DECIMAL
  - last_used_at: TIMESTAMP
  - created_at: TIMESTAMP
```

---

## 👥 User Roles & Permissions

### Platform Admin (Agency Level)

**Access:**
- ✅ Create and manage all organizations
- ✅ View platform-wide analytics
- ✅ Create projects for any organization
- ✅ Launch AI-powered client onboarding workflows
- ✅ View and manage support tickets
- ✅ Access all platform features
- ✅ Generate AI insights for any project
- ✅ Reset and resend onboarding invitations

**Pages:**
- `/platform/dashboard` - Platform overview
- `/platform/organizations` - All organizations
- `/platform/projects` - All projects across orgs
- `/platform/onboarding` - All onboarding sessions
- `/platform/onboarding/[id]` - Session details & responses
- `/platform/analytics` - Platform-wide metrics
- `/platform/support` - Support tickets
- `/platform/templates` - Email & SMS template editor
- `/platform/help` - Interactive help center

### Organization Admin

**Access:**
- ✅ Manage organization settings
- ✅ Invite/remove team members
- ✅ View all contacts, deals, activities
- ✅ Create and edit contacts, deals
- ✅ View all projects assigned to org
- ✅ Update project status and tasks
- ❌ Cannot create new projects
- ❌ Cannot delete projects

**Pages:**
- `/dashboard` - Organization overview
- `/dashboard/contacts` - Contact management
- `/dashboard/deals` - Deal pipeline
- `/dashboard/projects` - Organization projects
- `/dashboard/activities` - Activity timeline
- `/dashboard/analytics` - Org analytics
- `/dashboard/settings` - Org settings

### Organization Manager

**Access:**
- ✅ View all contacts, deals, activities
- ✅ Create and edit contacts, deals
- ✅ View assigned projects
- ✅ Update tasks and status
- ❌ Cannot manage team members
- ❌ Cannot change organization settings
- ❌ Cannot create/delete projects

### Organization Member

**Access:**
- ✅ View assigned contacts
- ✅ View assigned deals
- ✅ View assigned projects
- ✅ Update own tasks
- ❌ Cannot create contacts or deals
- ❌ Cannot access all organization data
- ❌ Cannot manage projects

---

## 🎨 User Interface

### Platform Admin UI

#### Dashboard (`/platform/dashboard`)
- Organization count (total, active, trial, suspended)
- Total users across platform
- Recent organizations list
- Quick actions

#### Organizations (`/platform/organizations`)
- Grid view of all organizations
- Status badges (active, trial, suspended, cancelled)
- User count per org
- Plan information
- Create new organization button

#### Projects (`/platform/projects`)
- All projects across organizations
- Stats: total, active, planning, completed
- Filter by organization, status, priority
- Create project button

#### Analytics (`/platform/analytics`)
- Platform-wide metrics
- Organization breakdown by status
- Revenue metrics (placeholder)
- User growth

### Organization Dashboard UI

#### Dashboard (`/dashboard`)
- Quick stats (contacts, deals, activities)
- Recent activities
- Deal pipeline overview
- Upcoming tasks

#### Contacts (`/dashboard/contacts`)
- Searchable contact list
- Filter by status, tags
- Create/edit contact dialog
- Contact detail pages

#### Deals (`/dashboard/deals`)
- Kanban board by deal stages
- Drag-and-drop to change stage
- Deal value and probability
- Filter and search

#### Projects (`/dashboard/projects`)
- List of organization's projects
- Status and priority badges
- Project detail pages
- Task management (when assigned)

#### Activities (`/dashboard/activities`)
- Timeline view of all activities
- Filter by type (call, email, meeting, note, task)
- Mark as complete
- Link to contacts/deals

---

## 🤖 AI Features

### AI-Powered Client Onboarding ✨ NEW

**Overview:**
Intelligent, adaptive client onboarding that analyzes project requirements and generates context-aware onboarding workflows to collect exactly the information needed for each unique project.

**How It Works:**
1. **Platform admin creates a project** with detailed description
2. **AI analyzes the project** using OpenAI GPT-4:
   - Identifies project type (web design, voice AI, software development, etc.)
   - Extracts key requirements and deliverables
   - Determines optimal information to collect
3. **Dynamic onboarding steps generated**:
   - Welcome step with project overview
   - Custom form fields based on project type
   - File upload requests for relevant assets
   - Choice selections for preferences
   - Review and completion steps
4. **Client receives branded onboarding link** via email
5. **Responses automatically collected** and organized
6. **Platform admin reviews** collected information with rich file previews

**Pre-Built Templates:**
- **Web Design** - Brand assets, style preferences, page requirements, design inspirations
- **Voice AI** - Call flow, voice preferences, integration needs, sample scripts
- **Software Development** - Tech stack, feature requirements, API specs, UI mockups

**Key Features:**
- ✅ Token-based public access (no login required for clients)
- ✅ Multi-step wizard with progress tracking
- ✅ File uploads with drag-and-drop (Uploadthing CDN)
- ✅ Dynamic form validation
- ✅ Email notifications (invitations, reminders, completions)
- ✅ Admin dashboard with response viewer
- ✅ Reset and resend onboarding sessions
- ✅ Download individual files or bulk download all
- ✅ Auto-expires after 30 days

**AI Onboarding Utilities:**
```typescript
// lib/ai-onboarding-analyzer.ts
analyzeProjectForOnboarding(description, projectName)  // Detect project type
generateCustomOnboardingSteps(description, projectType) // Create dynamic steps
detectProjectComplexity(description)                    // Assess scope
generateWelcomeMessage(projectName, projectType)        // Personalized welcome
```

### Project Task Generation

**How It Works:**
1. Platform admin creates project with detailed description
2. Checks "Generate Tasks with AI" option
3. AI analyzes description and extracts:
   - Key deliverables
   - Project phases
   - Technical requirements
   - Timeline indicators
4. Generates logical task breakdown with:
   - Task titles and descriptions
   - Estimated durations
   - Suggested order
5. Tasks marked as `ai_generated: true`

**Current Implementation:**
- Keyword-based analysis (design, develop, test, deploy)
- Pattern recognition for common project types
- Ready for LLM integration (OpenAI, Anthropic, etc.)

### Project Insights

**Available Insights:**
- **Estimated Timeline** - Based on complexity and scope
- **Suggested Resources** - Team roles needed
- **Potential Risks** - Technical challenges, dependencies
- **Success Metrics** - KPIs and measurements
- **Milestones** - Key project phases

**AI Utilities:**
```typescript
// lib/ai-project-helper.ts
analyzeProjectDescription(description)  // Extract key info
generateProjectTasks(description)       // Auto-generate tasks
suggestProjectMilestones(description)   // Suggest milestones
extractProjectRequirements(description) // Parse requirements
generateProjectInsights(description)    // Comprehensive analysis
estimateProjectDuration(description)    // Calculate duration
```

---

## 📞 AI Voice Campaigns ✨ NEW (October 2025)

### Overview

**AI-powered voice campaign system** for creating and managing inbound/outbound calling campaigns using AI phone agents via Vapi integration. Organizations can create unlimited voice campaigns (within plan limits) with intelligent AI agents that handle customer calls automatically.

### Core Features

**Campaign Creation:**
- Multi-step wizard with AI-powered configuration
- Choose campaign type (inbound, outbound, or both)
- AI agent prompt generation using GPT-4o
- Custom agent names and company branding
- Voice preference selection (male/female/auto)
- Phone number provisioning via Twilio

**AI Agent Configuration:**
- **System Prompt** - Defines agent behavior and personality
- **First Message** - Greeting when answering/initiating calls
- **Voicemail Message** - Message left if call goes to voicemail
- **Conversation Guidelines** - Rules for agent interactions
- **End Call Phrases** - Natural conversation endings
- **Agent Personality** - Professional, friendly, enthusiastic, or empathetic
- **GPT-4o Model** - Latest OpenAI model for intelligent responses

**Campaign Types:**
- **Inbound Calling** - AI agent receives and handles incoming calls
- **Outbound Calling** - AI agent makes calls to contact lists
- **Both** - Agent can receive and initiate calls

**Phone Number Management:**
- Automatic Twilio number provisioning
- Area code selection
- Number assignment per campaign
- Polling for number availability
- Webhook configuration for call routing

**Campaign Settings:**
- **Status Control** - Active, paused, or completed
- **Working Hours** - 24/7, business hours, or custom schedule
- **Call Limits** - Based on subscription plan
- **Campaign Goals** - Lead qualification, appointment booking, customer support, sales follow-up, surveys

### Campaign Wizard Flow

**Step 1: Basic Info**
- Campaign name
- Agent name (how AI introduces itself)
- Company name (AI mentions this)

**Step 2: Campaign Type**
- Select inbound, outbound, or both
- Business context and goals

**Step 3: Agent Configuration**
- Campaign goal selection
- Agent personality type
- Voice preference
- Key information to collect
- Follow-up triggers

**Step 4: Working Hours**
- 24/7 availability
- Business hours (9-5)
- Custom schedule

**Step 5: Phone Number**
- Select area code
- Provision Twilio number
- Configure webhooks

**Step 6: AI Generation**
- GPT-4o analyzes requirements
- Generates system prompt
- Creates first message
- Writes voicemail script
- Suggests conversation guidelines

**Step 7: Review & Launch**
- Preview full configuration
- Test agent settings
- Activate campaign

### AI Prompt Generation

**GPT-4o Integration:**
```typescript
// AI generates personalized agent prompts
generateAIAgentConfig(campaignSetupAnswers) {
  // Analyzes: campaign type, business context, goals
  // Generates: system prompt, first message, voicemail, guidelines
  // Ensures: agent name and company name are included
  // Output: Complete agent configuration ready for Vapi
}
```

**Prompt Requirements:**
- Agent MUST introduce itself with specified agent name
- Agent MUST mention specified company name
- Prompt formatted in Markdown with bullet points
- 300-500 words comprehensive instructions
- Industry-specific conversation handling

### Vapi Integration

**AI Phone Agent Platform:**
- Create assistants via Vapi API
- Configure voice settings (11labs, OpenAI TTS)
- Set up phone numbers and call routing
- Real-time call transcription
- Call analytics and recordings

**API Operations:**
- `createAgent()` - Create AI assistant in Vapi
- `updateAgent()` - Update agent configuration
- `deleteAgent()` - Remove agent from Vapi
- `createPhoneNumber()` - Assign number to agent
- `deletePhoneNumber()` - Release phone number

### Campaign Management

**Campaign Dashboard:**
- List all campaigns with status indicators
- Quick stats (total calls, success rate, duration)
- Filter by status, type, or date
- Bulk actions (pause, resume, delete)
- Search and sort capabilities

**Campaign Cards:**
- Horizontal layout with key metrics
- Campaign name, description, and type
- Phone number display
- Call statistics (total, answered, completed, failed)
- Status badges (active, paused, completed)
- Action buttons (edit, pause/resume, delete, test)

**Campaign Details:**
- Full configuration view
- Edit settings (general, configuration, advanced)
- System prompt, first message, voicemail editing
- Real-time sync to Vapi when saved
- Call history and analytics
- Performance metrics

### Call Recording & Analytics

**Call Records:**
- Automatic recording of all calls
- Transcription via Vapi
- Duration tracking for billing
- Call status (answered, no-answer, busy, failed)
- Recording URLs for playback
- Sentiment analysis (future)

**Campaign Analytics:**
- Total calls made/received
- Answer rate and completion rate
- Average call duration
- Success metrics by goal
- Cost per call
- Time-based trends

### Campaign Settings Tabs

**General Tab:**
- Campaign name and description
- Active/inactive toggle
- Campaign goal

**Configuration Tab:**
- System prompt (editable)
- First message (editable)
- Voicemail message (editable)
- Changes sync to Vapi AI agent
- Confirmation on successful save

**Advanced Tab:**
- Agent personality settings
- Voice preference
- Working hours
- Data collection requirements
- Technical configuration

### Subscription Integration

**Plan Enforcement:**
- Free: 1 campaign max
- Starter: 5 campaigns max
- Professional: 20 campaigns max
- Enterprise: Unlimited campaigns

**Usage Tracking:**
- Minutes tracked per call
- Automatic billing for overages
- Real-time usage display
- Limit warnings and notifications

### Database Schema

```typescript
voice_campaigns
  - id: UUID
  - project_id: UUID → projects
  - name: TEXT (campaign name)
  - description: TEXT
  - campaign_type: ENUM (inbound, outbound, both)
  - provider: TEXT (vapi, retell, bland)
  - provider_assistant_id: TEXT (Vapi assistant ID)
  - phone_number: TEXT (Twilio number)
  - webhook_id: UUID → webhooks
  - system_prompt: TEXT (AI instructions)
  - first_message: TEXT (greeting)
  - voicemail_message: TEXT
  - agent_personality: TEXT
  - voice_preference: TEXT
  - campaign_goal: TEXT
  - is_active: BOOLEAN
  - status: ENUM (draft, provisioning, active, paused, completed, failed)
  - setup_answers: JSONB (wizard responses)
  - total_calls, completed_calls, failed_calls: INTEGER
  - average_call_duration: DECIMAL
  - last_call_at: TIMESTAMP
  - deleted_at: TIMESTAMP (soft delete)
  - created_at, updated_at: TIMESTAMP

call_records
  - id: UUID
  - campaign_id: UUID → voice_campaigns
  - call_id: TEXT (provider call ID)
  - phone_number: TEXT
  - direction: TEXT (inbound, outbound)
  - status: TEXT (completed, failed, busy, no-answer)
  - duration_seconds: INTEGER
  - recording_url: TEXT
  - transcript: TEXT
  - cost: DECIMAL
  - created_at: TIMESTAMP
```

### Server Actions

```typescript
// Campaign Management
createVoiceCampaignAction() // Create new campaign with AI config
updateCampaignAction() // Update campaign settings
updateCampaignConfigAction() // Update and sync agent prompts
deleteCampaignAction() // Soft delete campaign
restoreCampaignAction() // Restore soft-deleted campaign
pauseCampaignAction() // Pause active campaign
resumeCampaignAction() // Resume paused campaign
duplicateCampaignAction() // Clone existing campaign

// Campaign Queries
getCampaignsForProjectAction() // Get all campaigns
getActiveCampaignsForProjectAction() // Get only active
getCampaignByIdAction() // Get single campaign details
getCampaignAnalyticsAction() // Get campaign metrics

// Bulk Operations
bulkDeleteCampaignsAction() // Delete multiple campaigns
bulkPauseCampaignsAction() // Pause multiple campaigns
bulkResumeCampaignsAction() // Resume multiple campaigns
```

### Voice Provider Architecture

**Provider Factory Pattern:**
```typescript
// lib/voice-providers/provider-factory.ts
getVoiceProvider(providerName) {
  // Returns: VapiProvider | RetellProvider | BlandProvider
}
```

**Vapi Provider:**
- Full implementation with GPT-4o model
- Phone number provisioning
- Webhook configuration
- Agent CRUD operations
- Call analytics integration

**Provider Interface:**
```typescript
interface VoiceProvider {
  createAgent(setupAnswers, aiConfig, webhookUrl): Promise<ProviderAgent>
  updateAgent(agentId, updates): Promise<ProviderAgent>
  deleteAgent(agentId): Promise<void>
  createPhoneNumber(agentId, areaCode): Promise<ProviderPhoneNumber>
  deletePhoneNumber(phoneNumberId): Promise<void>
  getCallRecords(agentId): Promise<ProviderCallRecord[]>
}
```

### Webhook Integration

**Call Events:**
- `/api/webhooks/calls/[token]` - Receives call events from Vapi
- Processes: call started, call ended, call failed
- Records: duration, status, transcript, recording URL
- Triggers: usage recording for billing
- Updates: campaign statistics

**Event Handling:**
- Validates webhook signatures
- Parses call data
- Creates call records
- Updates usage tracking
- Queues AI analysis
- Sends notifications

### Testing Features

**Test Campaign:**
- Make test call to validate configuration
- Verify AI responses
- Check phone number routing
- Test voicemail behavior
- Preview before going live

**Call Simulation:**
- Test AI prompts without making real calls
- Preview conversation flow
- Validate data collection
- Check error handling

### Error Handling & Recovery

**Provisioning Failures:**
- Automatic retry with exponential backoff
- Fallback to different area codes
- Clear error messaging
- Transaction rollback on failure

**Call Failures:**
- Record failure reason
- Update campaign statistics
- Alert if high failure rate
- Self-healing integration

**Sync Issues:**
- Detect configuration drift
- Auto-sync to provider
- Confirmation notifications
- Manual sync option

### Integration Points

**Projects:**
- Campaigns linked to projects
- Project context informs AI prompts
- Client information from projects
- Progress tracking integration

**Billing:**
- Usage tracked per minute
- Automatic overage charges
- Campaign limits enforced
- Cost analytics

**Organizations:**
- Multi-tenant isolation
- Plan-based campaign limits
- Usage aggregation
- Team access control

### Future Enhancements

- **Contact List Management** - Upload and manage call lists
- **Call Scheduling** - Schedule outbound campaigns
- **A/B Testing** - Test different agent configurations
- **Advanced Analytics** - Sentiment analysis, conversion tracking
- **CRM Integration** - Sync with contacts and deals
- **Call Recording Playback** - In-app audio player
- **Real-Time Monitoring** - Live call dashboard
- **Call Queuing** - Queue management for inbound campaigns

---

## 🔐 Authentication & Security

### Clerk Integration

- **User Authentication** - Email, OAuth (Google, GitHub)
- **Session Management** - JWT tokens, secure cookies
- **User Metadata** - Stored in Clerk, synced to DB
- **Protected Routes** - Middleware checks on all dashboard routes

### Access Control

**Middleware Protection:**
```typescript
// middleware.ts
- /dashboard/*    → Requires authenticated user
- /platform/*     → Requires platform admin
- /api/*          → Public webhooks excluded
```

**Server-Side Checks:**
```typescript
// Every server action
auth()                           // Get current user
ensurePlatformAdmin()           // Require platform admin
requireOrganizationAccess(orgId) // Verify org membership
```

### Audit Trail

All sensitive actions logged:
- Organization create/update/delete
- User invite/remove
- Project create/update/delete
- Contact/deal modifications
- Settings changes

---

## 💳 Billing & Subscriptions

### Voice Campaign SaaS Billing System ✨ NEW (October 2025)

**Multi-Provider Usage-Based Billing** for AI voice campaigns with automatic overage tracking and metered billing.

### Payment Providers

1. **Stripe** - Full subscription + native metered billing (recommended)
2. **Square** - Full subscription + invoice-based overage
3. **PayPal** - Full subscription + manual invoicing

### Voice Campaign Subscription Plans

| Plan | Price | Free Minutes | Overage Rate | Max Campaigns | Features |
|------|-------|--------------|--------------|---------------|----------|
| **Free** | $0/mo | 100 min | $0.15/min | 1 | Basic access, email support |
| **Starter** | $99/mo | 1,000 min | $0.10/min | 5 | Advanced analytics, priority support |
| **Professional** | $299/mo | 3,000 min | $0.08/min | 20 | Priority support, custom integrations |
| **Enterprise** | $999/mo | 10,000 min | $0.06/min | Unlimited | Dedicated manager, SLA, 24/7 support |

### Key Features

- **Usage-Based Billing** - Per-minute tracking for all voice calls
- **Automatic Overage Charges** - Metered billing beyond included minutes
- **30-Day Rolling Cycle** - Billing from subscription date
- **Campaign Limits** - Enforced based on plan tier
- **Multi-Provider Choice** - Users select preferred payment method
- **Real-Time Usage Tracking** - Live minute consumption monitoring
- **Billing Dashboard** - Full-featured customer portal
- **Invoice Generation** - Automatic monthly invoices with usage details

### Billing Architecture

**Database Tables:**
- `subscription_plans` - Plan definitions with pricing tiers
- `organization_subscriptions` - Active subscriptions per organization
- `usage_records` - Per-call minute tracking and costs
- `invoices` - Monthly billing statements

**Payment Flow:**
1. User selects plan and payment provider (Stripe/Square/PayPal)
2. Subscription created in provider's system
3. Base subscription fee charged monthly
4. Voice calls tracked in real-time
5. Overage calculated automatically
6. Metered billing charges applied (Stripe) or invoices generated (Square/PayPal)

**Webhook Integration:**
- `stripe-billing` - Subscription events, payment updates
- `square-billing` - Subscription events, payment updates
- `paypal-billing` - Subscription events, payment updates
- `voice-calls` - Call completion triggers usage recording

### Usage Tracking

**Real-Time Monitoring:**
```typescript
// Automatic tracking on call completion
recordCallUsage(organizationId, campaignId, callId, durationSeconds)
  → Calculates minutes used
  → Updates subscription usage
  → Reports overage to provider (Stripe metered billing)
  → Creates usage record for auditing
```

**Campaign Creation Guards:**
- ✅ Checks for active subscription before allowing campaign creation
- ✅ Enforces campaign limits based on plan tier
- ✅ Prevents usage if no subscription (new organizations)
- ✅ Existing organizations auto-migrated to Free tier

### Billing Dashboard Features

**Customer Portal** (`/platform/organizations/[id]/billing`):
- Current plan display with status badges
- Usage meter with visual progress bar
- Minutes used vs. included (with overage tracking)
- Active campaigns count
- Days until renewal
- Estimated monthly total (base + overage)
- Upgrade/downgrade options
- Payment method management
- Complete billing history with invoice downloads

**Admin Features:**
- Plan selector with provider choice (Stripe/Square/PayPal)
- Instant plan changes with provider redirect
- Payment method update portals
- Invoice viewing and downloads
- Usage analytics across all organizations

### Provider-Specific Features

**Stripe:**
- ✅ Native metered billing for automatic overage charges
- ✅ Customer portal for self-service management
- ✅ Instant payment method updates
- ✅ Automatic invoice generation

**Square:**
- ✅ Subscription management via Square dashboard
- ✅ Invoice-based overage billing (generated at cycle end)
- ✅ Card management through Square

**PayPal:**
- ✅ Subscription management via PayPal dashboard
- ✅ Manual invoicing for overage charges
- ✅ PayPal balance, bank, or card payments

### Migration & Onboarding

**Existing Organizations:**
- Automatically assigned to Free tier (100 minutes/month)
- Can upgrade anytime through billing dashboard
- No interruption to existing services

**New Organizations:**
- Must select a plan before creating campaigns
- Can start with Free tier or paid plans
- Multiple payment provider options

### Subscription Management

- **Upgrade/Downgrade** - Instant plan changes with prorated billing
- **Cancel Anytime** - Access maintained until period end
- **Usage Alerts** - Notifications when approaching limits
- **Automatic Renewal** - Monthly billing on subscription date
- **Grace Period** - Continued access during payment failures
- **Self-Service Portal** - Complete billing control for customers

---

## 📊 Analytics & Reporting

### Platform Analytics

- Total organizations (by status)
- Total users across platform
- Revenue metrics (MRR, ARR)
- Growth trends
- Organization breakdown

### Organization Analytics

- Contact count by status
- Deal pipeline value
- Win rate and conversion metrics
- Activity volume
- Project completion rate

---

## 🔔 Support System

### Support Tickets

**Organization Users Can:**
- Create support tickets
- View their organization's tickets
- Reply to existing tickets
- Track ticket status

**Platform Admins Can:**
- View all tickets across organizations
- Assign tickets to support staff
- Change priority and status
- Add internal notes
- Resolve and close tickets

**Ticket Categories:**
- Billing
- Technical
- Feature Request
- Account
- Other

---

## 📱 Pages & Routes

### Public Pages
- `/` - Marketing homepage
- `/pricing` - Pricing plans
- `/login` - Sign in
- `/signup` - Create account

### Platform Admin Pages
- `/platform/dashboard` - Overview
- `/platform/organizations` - All orgs
- `/platform/organizations/new` - Create org
- `/platform/organizations/[id]` - Org details
- `/platform/organizations/[id]/billing` - **✨ NEW** - Billing dashboard (usage, plans, invoices)
- `/platform/projects` - All projects
- `/platform/projects/new` - Create project
- `/platform/projects/[id]` - Project details
- `/platform/onboarding` - All onboarding sessions
- `/platform/onboarding/[id]` - Session details & client responses
- `/platform/analytics` - Platform metrics
- `/platform/support` - Support tickets
- `/platform/help` - **✨ NEW** - Interactive help center with searchable documentation
- `/platform/templates` - **✨ NEW** - Email & SMS template editor
- `/platform/system-health` - **✨ NEW** - Self-healing system dashboard & health monitoring
- `/platform/admin/seed-plans` - **✨ NEW** - Subscription plan seeding tool
- `/platform/settings` - Platform settings
- `/platform/settings/branding` - **✨ NEW** - Branding & design customization (logo, colors, company info)

### Public Client Pages
- `/onboarding/[token]` - Client onboarding wizard (no login required)

### Organization Dashboard Pages
- `/dashboard` - Org overview (monitoring projects, activity, analytics)
- `/dashboard/projects` - Org projects
- `/dashboard/projects/[id]` - Project details
- `/dashboard/activities` - Activity timeline
- `/dashboard/analytics` - Org analytics
- `/dashboard/org-contacts` - **✨ NEW** - Organization contact persons (NOT CRM contacts)
- `/dashboard/settings` - Org settings
- `/dashboard/members` - Team management

### Test Pages (Development Only)
- `/test/email` - Email sending test page
- `/test/upload` - File upload test page

### API Routes

**Billing & Payments:**
- `/api/webhooks/stripe-billing` - **✨ NEW** - Stripe billing webhooks
- `/api/webhooks/square-billing` - **✨ NEW** - Square billing webhooks
- `/api/webhooks/paypal-billing` - **✨ NEW** - PayPal billing webhooks
- `/api/organizations/[id]/billing` - **✨ NEW** - Billing data API
- `/api/organizations/[id]/subscription` - **✨ NEW** - Subscription management
- `/api/organizations/[id]/payment-method` - **✨ NEW** - Payment method updates
- `/api/plans` - **✨ NEW** - List subscription plans
- `/api/admin/seed-plans` - **✨ NEW** - Seed subscription plans

**Legacy Payments:**
- `/api/whop/webhooks` - Whop payment webhooks
- `/api/stripe/webhooks` - Stripe payment webhooks

**Other:**
- `/api/user/status` - User status check
- `/api/uploadthing` - Uploadthing file upload handler
- `/api/test-email` - Test email sending
- `/api/organizations` - Get user's organizations
- `/api/diagnostic` - System configuration check

---

## 🛠️ Development

### File Structure

```
codespring-boilerplate/
├── actions/                          # Server actions
│   ├── activities-actions.ts
│   ├── contacts-actions.ts
│   ├── deals-actions.ts
│   ├── onboarding-actions.ts        # Admin onboarding management
│   ├── client-onboarding-actions.ts # Enhanced with AI analysis
│   ├── onboarding-template-actions.ts # ✨ NEW - Template CRUD operations
│   ├── onboarding-todos-actions.ts  # ✨ NEW - To-do CRUD & approval
│   ├── platform-actions.ts
│   ├── projects-actions.ts
│   └── organizations-actions.ts
├── app/
│   ├── (auth)/                      # Auth pages
│   ├── (marketing)/                 # Public pages
│   ├── dashboard/                   # Org dashboard
│   ├── onboarding/                  # ✨ NEW - Public onboarding
│   │   └── [token]/
│   │       ├── page.tsx             # Onboarding wizard
│   │       └── layout.tsx
│   ├── platform/                    # Platform admin
│   │   ├── onboarding/              # ✨ NEW - Onboarding management
│   │   │   ├── page.tsx             # All sessions list
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Session details & responses
│   │   ├── help/                    # ✨ NEW - Interactive help center
│   │   │   └── page.tsx             # Searchable documentation
│   │   ├── projects/
│   │   └── ...
│   ├── test/                        # Test pages
│   │   ├── email/
│   │   ├── upload/
│   │   └── auto-test-uploads/       # ✨ NEW - Automated upload testing
│   └── api/                         # API routes
│       ├── uploadthing/             # ✨ NEW - Uploadthing file router
│       ├── test-email/
│       ├── diagnostic/
│       └── ...
├── components/
│   ├── ui/                          # ShadCN components
│   ├── crm/                         # CRM-specific components
│   ├── platform/                    # Platform admin components
│   │   ├── onboarding-sessions-list.tsx
│   │   ├── onboarding-session-overview.tsx
│   │   ├── onboarding-responses-viewer.tsx
│   │   ├── project-onboarding-section.tsx
│   │   ├── admin-template-manager.tsx          # ✨ NEW - Template library UI
│   │   └── admin-todo-review-panel.tsx         # ✨ NEW - To-do review & approval
│   ├── onboarding/                  # Onboarding wizard components
│   │   ├── onboarding-wizard.tsx    # Enhanced with conditional logic
│   │   ├── step-renderer.tsx
│   │   ├── client-todo-list.tsx     # ✨ NEW - Client to-do dashboard
│   │   └── step-types/
│   │       ├── welcome-step.tsx
│   │       ├── form-step.tsx
│   │       ├── upload-step.tsx
│   │       ├── choice-step.tsx
│   │       ├── review-step.tsx
│   │       └── complete-step.tsx
│   ├── project/                     # ✨ NEW - Project task management components
│   │   ├── task-card.tsx
│   │   ├── sortable-task-card.tsx
│   │   ├── kanban-column.tsx
│   │   ├── project-tasks-kanban.tsx
│   │   ├── project-tasks-list.tsx
│   │   ├── create-task-dialog.tsx
│   │   ├── task-detail-dialog.tsx
│   │   ├── task-view-toggle.tsx
│   │   ├── project-tasks-section.tsx
│   │   ├── project-progress-meter.tsx
│   │   ├── project-notes-timeline.tsx
│   │   ├── add-project-note-dialog.tsx
│   │   ├── override-progress-dialog.tsx
│   │   └── project-progress-and-notes-section.tsx
│   ├── file-upload.tsx              # Uploadthing file upload component
│   ├── sidebar.tsx
│   └── header.tsx
├── db/
│   ├── schema/                      # Drizzle schemas
│   │   ├── crm-schema.ts
│   │   ├── platform-schema.ts
│   │   ├── projects-schema.ts
│   │   ├── support-schema.ts
│   │   ├── audit-schema.ts
│   │   └── onboarding-schema.ts     # Enhanced with templates & to-dos
│   ├── queries/                     # Database queries
│   │   ├── ...
│   │   ├── onboarding-queries.ts
│   │   ├── onboarding-templates-queries.ts # ✨ NEW - Template CRUD
│   │   └── onboarding-todos-queries.ts     # ✨ NEW - To-do CRUD
│   └── migrations/                  # SQL migrations
│       └── 0030_onboarding_templates_library.sql # ✨ NEW
├── lib/
│   ├── utils.ts
│   ├── platform-admin.ts
│   ├── organization-context.tsx
│   ├── server-organization-context.ts
│   ├── ai-project-helper.ts
│   ├── ai-onboarding-analyzer.ts    # Enhanced with real-time feedback
│   ├── ai-onboarding-completion-analyzer.ts # ✨ NEW - Post-onboarding analysis
│   ├── ai-template-generator.ts     # ✨ NEW - Custom template generation via AI
│   ├── ai-todo-generator.ts         # ✨ NEW - AI to-do list generation
│   ├── onboarding-question-engine.ts # ✨ NEW - Dynamic conditional logic
│   ├── task-utils.ts                # Task management utilities
│   ├── project-progress-calculator.ts # Project progress tracking
│   ├── audit-logger.ts
│   ├── email-service.ts             # Enhanced with to-do notification emails
│   ├── email-html-builder.ts
│   ├── uploadthing.ts               # Uploadthing client utils
│   └── onboarding-templates/        # ✨ NEW - Pre-built templates (7 total)
│       ├── index.ts
│       ├── outbound-calling-template.ts
│       ├── inbound-calling-template.ts
│       ├── web-design-template.ts
│       ├── ai-voice-agent-template.ts
│       ├── software-development-template.ts
│       ├── marketing-campaign-template.ts
│       └── crm-implementation-template.ts
└── types/                           # TypeScript types
```

### Key Commands

```bash
# Development
npm run dev              # Start dev server

# Database
npm run db:generate      # Generate migration
npm run db:migrate       # Apply migrations

# Build
npm run build           # Production build
npm run start           # Start production server

# Type checking
npm run type-check      # TypeScript validation
```

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Payments (Whop)
WHOP_API_KEY="..."
WHOP_PLAN_ID_MONTHLY="..."
WHOP_PLAN_ID_YEARLY="..."

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="onboarding@resend.dev"
RESEND_REPLY_TO="support@yourdomain.com"

# File Storage (Uploadthing)
UPLOADTHING_SECRET="sk_live_xxxxxxxxxxxxx"
UPLOADTHING_APP_ID="your_app_id_here"
UPLOADTHING_TOKEN="your_token_here"

# AI (OpenAI)
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxx"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository in Vercel
3. Add environment variables
4. Deploy

### Database Migrations

```bash
# Generate migration
npm run db:generate

# Apply to production (via Vercel CLI or direct DB connection)
npm run db:migrate
```

---

## 📈 Key Features Summary

### ✅ Implemented Features

**Platform Admin:**
- ✅ Organization CRUD
- ✅ Organization suspend/activate
- ✅ Platform-wide analytics
- ✅ Project creation for any org
- ✅ Project management
- ✅ Support ticket system
- ✅ Audit logging

**CRM Features:**
- ✅ Contact management
- ✅ Deal pipeline (Kanban)
- ✅ Activities timeline
- ✅ Organization analytics
- ✅ User roles and permissions

**Project Management:**
- ✅ Project creation (platform admin only)
- ✅ AI task generation
- ✅ Project status tracking
- ✅ Budget and timeline management
- ✅ Link to contacts and deals
- ✅ **Task Management UI - COMPLETE**
  - Kanban board with drag-and-drop
  - List view with sorting/filtering
  - Full CRUD operations
  - Due dates with visual badges
  - Assignee management
  - Bulk actions
  - Auto-progress updates
- ✅ **Project Progress Tracking**
  - Auto-calculated from task completion
  - Manual override capability
  - Progress meter with visual display
- ✅ **Project Notes & Timeline**
  - Timestamped notes by admins
  - Chronological timeline view
  - Read-only for org users

**AI Features:**
- ✅ Task generation from description
- ✅ Project insights and suggestions
- ✅ Risk identification
- ✅ Resource recommendations
- ✅ AI-powered client onboarding (OpenAI GPT-4)
- ✅ Project type detection
- ✅ Dynamic onboarding flow generation
- ✅ Pre-built templates (Web Design, Voice AI, Software Dev)

**Client Onboarding:**
- ✅ Token-based public access
- ✅ Multi-step wizard UI
- ✅ File uploads with Uploadthing
- ✅ Email invitations & reminders
- ✅ Admin response viewer
- ✅ Reset & resend functionality
- ✅ Download files (individual & bulk)

### 🟡 Partially Implemented

- 🟡 Organization dashboard projects view (backend ready, UI pending)

### 🔴 Not Yet Implemented

- ❌ Project templates
- ❌ Time tracking
- ❌ Gantt chart view
- ❌ Reporting exports (PDF, CSV)
- ❌ Custom fields
- ❌ Webhooks for integrations
- ❌ Mobile app

### 🟢 Recently Added (AI Onboarding - COMPLETE)

**AI-Powered Client Onboarding:**
- ✅ OpenAI GPT-4 integration for project analysis
- ✅ Automatic project type detection (web design, voice AI, software dev)
- ✅ Dynamic onboarding flow generation
- ✅ 3 pre-built templates with industry-specific questions
- ✅ Public onboarding wizard (`/onboarding/[token]`)
- ✅ Multi-step progress tracking
- ✅ File uploads with drag-and-drop
- ✅ Email invitations, reminders, and completion notices
- ✅ Platform admin onboarding dashboard
- ✅ Response viewer with rich file previews
- ✅ Reset & resend onboarding functionality
- ✅ Individual & bulk file downloads
- ✅ Botmakers logo branding
- ✅ Automated testing suite

### 🚀 Latest Enhancements (October 2025 - COMPLETE)

**📧 Scheduled Reminders & Nurture Sequences:**
- ✅ Automated email sequences (Day 2, 5, 7 reminders)
- ✅ Smart send logic (skips if client active or completed)
- ✅ Customizable schedules (standard, aggressive, gentle)
- ✅ Manual reminder sending capability
- ✅ Email tracking (opens, clicks)
- ✅ Reminder analytics dashboard
- ✅ Hourly cron job automation
- ✅ Beautiful HTML email templates with progress bars

**🔗 Onboarding-to-Tasks Integration:**
- ✅ Automatic task generation from onboarding responses
- ✅ 29 pre-built task generation rules
- ✅ Template-specific rules (Web Design, Voice AI, Software Dev, Generic)
- ✅ Task preview before creation
- ✅ Bulk task creation with one click
- ✅ Source tracking (links tasks back to onboarding)
- ✅ Task regeneration capability
- ✅ Validation and deduplication
- ✅ Priority and due date assignment

**🎯 Conditional Logic for Dynamic Flows:**
- ✅ 13 condition operators (equals, contains, regex, etc.)
- ✅ Complex nested conditions (AND/OR logic)
- ✅ Dynamic step visibility based on responses
- ✅ Real-time progress calculation
- ✅ Automatic step skipping
- ✅ Circular dependency detection
- ✅ Integrated into onboarding wizard
- ✅ Personalized client experience

**Infrastructure (Phase 0):**
- ✅ Email system (Resend)
- ✅ File upload system (Uploadthing)
- ✅ Token-based public access
- ✅ CDN file delivery
- ✅ Type-safe file router
- ✅ HTML email builder

### 🚀 Planned Onboarding Enhancements (Schema Complete)

**📧 Scheduled Reminders & Nurture Sequences:**
- 🟡 Automated email campaigns (Day 2, 5, 7 reminders)
- 🟡 Smart scheduling (skips if actively working)
- 🟡 Admin controls (manual send, schedule selection)
- 🟡 Analytics (open rates, click-through, completion boost)
- ✅ Database schema complete
- ✅ Reminder tracking table created

**🔗 Onboarding-to-Tasks Integration:**
- 🟡 Auto-generate project tasks from responses
- 🟡 Template-specific mapping rules
- 🟡 AI-enhanced task suggestions
- 🟡 Preview before creation
- 🟡 Link tasks back to responses
- ✅ Database schema complete
- ✅ Task source tracking added

**🎯 Conditional Logic:**
- 🟡 Dynamic step visibility based on answers
- 🟡 Personalized flows (skip irrelevant questions)
- 🟡 Visual condition builder for admins
- 🟡 Multiple operators (equals, contains, greater_than, etc.)
- 🟡 Nested conditions (AND/OR logic)
- ✅ Database schema complete
- ✅ Step visibility tracking added

**Status:** Database schemas designed and ready for migration. See `ONBOARDING_ENHANCEMENTS_SUMMARY.md` for detailed implementation plan.

**Expected Impact:**
- 60% increase in completion rates (reminders)
- 30% reduction in completion time (conditional logic)
- 80% of projects with auto-generated tasks
- 45 minutes saved per onboarding

---

## 🎯 Use Cases

### 1. Digital Agency Managing Clients

**Scenario:** Agency has 20 client companies
- Platform admin creates organization for each client
- Assigns projects to each client org
- Uses AI to generate task breakdowns
- Tracks all projects from platform view
- Clients log in to see their projects and deals

### 2. Consulting Firm with Teams

**Scenario:** Consulting firm with multiple practice areas
- Each practice area is an organization
- Platform admin creates projects for each practice
- Teams manage contacts and deals within their org
- Platform admin monitors overall performance

### 3. SaaS Company Selling CRM

**Scenario:** Selling ClientFlow as white-label CRM
- Each customer is an organization
- Platform team provides support
- Customers manage their own CRM data
- Usage-based billing per organization

---

## 📚 Documentation

### Available Docs

- **`APP_OVERVIEW.md`** - This file (comprehensive app overview)
- **`ADMIN_HELP_GUIDE.md`** - ✨ NEW - Complete admin guide (200+ sections) - also available in UI at `/platform/help`
- **`DYNAMIC_ONBOARDING_COMPLETE.md`** - ✨ NEW - V1.5 implementation summary
- **`IMPLEMENTATION_SUMMARY_V1.5.md`** - ✨ NEW - Quick reference for V1.5
- **`HELP_CENTER_IMPLEMENTATION.md`** - ✨ NEW - Interactive help center documentation
- **`BRANDING_SYSTEM_COMPLETE.md`** - ✨ NEW - Complete branding system implementation guide
- **`BRANDING_QUICK_START.md`** - ✨ NEW - 5-minute branding setup guide
- **`EMAIL_TEMPLATE_SETUP.md`** - ✨ NEW - Email template customization guide
- **`BEAUTIFUL_EMAIL_TEMPLATES_COMPLETE.md`** - ✨ NEW - Professional email template documentation
- **`ONBOARDING_SYSTEM_IMPLEMENTATION_STATUS.md`** - Technical implementation details
- **`PROJECTS_IMPLEMENTATION_SUMMARY.md`** - Projects feature guide
- **`TASK_MANAGEMENT_IMPLEMENTATION.md`** - Complete task management system guide
- **`ONBOARDING_ENHANCEMENTS_SUMMARY.md`** - Onboarding enhancements overview & implementation plan
- **`UPLOADTHING_SETUP.md`** - File upload setup guide
- **`UPLOADTHING_MIGRATION_SUMMARY.md`** - Uploadthing migration details
- **`PRD/AI_ONBOARDING_PRD.md`** - AI Onboarding requirements (original)
- **`PRD/PHASE_0_INFRASTRUCTURE_PLAN.md`** - Email & file upload plan
- **`PRD/PHASE_0_COMPLETE_SUMMARY.md`** - Phase 0 implementation guide
- **`plan.md`** - Current implementation plans
- **`README.md`** - Quick start guide
- **`CRM_IMPLEMENTATION_SUMMARY.md`** - CRM features

### Developer Reference Guides (Planned)

- **`REMINDER_SYSTEM_GUIDE.md`** - 🟡 Reminder system architecture & customization
- **`TASK_INTEGRATION_GUIDE.md`** - 🟡 Onboarding-to-task mapping rules & setup  
- **`CONDITIONAL_LOGIC_GUIDE.md`** - 🟡 Conditional flow syntax & best practices

---

## 🐛 Known Limitations

1. **No Custom Fields** - Fixed schema only, custom fields not supported
2. **Limited AI Templates** - Currently 3 pre-built templates (more coming)
3. **Assignee System** - Currently stores user ID as string, full user management integration needed

---

## 🔮 Roadmap

### Q4 2024
- ✅ Multi-tenant architecture
- ✅ Platform admin layer
- ✅ Projects feature with AI
- ✅ **Task management UI - COMPLETE**
- ✅ Project progress tracking & notes
- 🟡 Organization projects dashboard

### Q4 2024 - Q1 2025
- ✅ Email system (Resend) - COMPLETE
- ✅ File upload system (Uploadthing) - COMPLETE
- ✅ AI-Powered Client Onboarding - COMPLETE
  - Phase 0: Infrastructure ✅
  - Phase 1: Database schema ✅
  - Phase 2: AI analysis ✅
  - Phase 3: Platform admin UI ✅
  - Phase 4: Client onboarding UI ✅
- ✅ Real AI/LLM integration (OpenAI GPT-4) - COMPLETE
- 🟡 **Onboarding Enhancements** - Database schemas complete
  - ✅ Schema: Reminder system
  - ✅ Schema: Task integration
  - ✅ Schema: Conditional logic
  - 🟡 Implementation: Core libraries
  - 🟡 Implementation: Server actions
  - 🟡 Implementation: UI components
- 🟡 Project templates (in progress)
- 🟡 Time tracking (in progress)

### Q2 2025
- Mobile app (React Native)
- Advanced reporting
- Custom fields
- Webhooks API
- Third-party integrations

---

## 💡 Tips for Developers

### Adding a New Feature

1. **Database First** - Create schema in `/db/schema/`
2. **Generate Migration** - `npm run db:generate`
3. **Apply Migration** - `npm run db:migrate`
4. **Create Queries** - Add to `/db/queries/`
5. **Create Actions** - Add to `/actions/`
6. **Build UI** - Create pages in `/app/`
7. **Update Navigation** - Add to sidebars
8. **Test Permissions** - Verify access control

### Best Practices

- Always use server actions for mutations
- Check permissions in every action
- Log sensitive actions to audit trail
- Use TypeScript types from schema
- Keep UI components small and reusable
- Test with multiple organizations

---

## 📞 Support

**Need Help?**
- Email: usecodespring@gmail.com
- Check `/docs` folder for guides
- Review implementation summaries

---

**Last Updated:** October 7, 2025  
**Version:** 1.8  
**Status:** Production Ready 🚀

**Latest Updates (Version 1.8 - October 7, 2025):**
- ✅ **AI Voice Campaigns System** - COMPLETE - Full-featured voice campaign platform with Vapi integration
- ✅ **Multi-Provider SaaS Billing System** - COMPLETE - Usage-based billing for voice campaigns (Stripe, Square, PayPal)

**Version 1.7 Updates (October 6, 2025):**
- ✅ **AI-Powered Self-Healing System** - Automatic error recovery with AI analysis & 10+ healing strategies
- ✅ **Organization Contacts System** - Multiple contact persons per organization with full details
- ✅ **Manual Onboarding System** - In progress (database schema complete)
- ✅ **User Dashboard Cleanup** - Removed CRM, focused on projects/analytics
- ✅ **Bug Fixes & Stability** - 15+ critical improvements

**Version 1.6 Updates (October 5, 2025):**
- ✅ **Dynamic Onboarding System with AI Templates & To-Do Lists** - COMPLETE
  - **Template Library System**
    - 7 pre-built industry-specific templates (Outbound Calling, Inbound Calling, Web Design, AI Voice Agent, Software Development, Marketing Campaign, CRM Implementation)
    - Each template with 8-12 grouped steps, conditional logic, and industry triggers
    - Template usage statistics tracking (times used, completion rates, avg time)
    - Admin template manager UI with search, preview, edit, duplicate, and archive
  - **AI Template Generator**
    - Custom template creation via GPT-4 based on project type description
    - Automatic question structuring into logical groups
    - Smart conditional logic generation
    - Industry-specific compliance question suggestions
  - **Dynamic Questionnaire Engine**
    - Real-time conditional logic evaluation (show/hide fields based on answers)
    - Industry-triggered questions (e.g., HIPAA for healthcare)
    - Required vs. optional field validation
    - Dynamic progress calculation
  - **Real-Time AI Feedback System**
    - Contextual suggestions as users type
    - Smart validation with helpful feedback
    - Gap detection in responses
    - Data enrichment suggestions
    - AI suggestion caching to reduce API costs
  - **Post-Onboarding AI Analysis**
    - Comprehensive response analysis
    - Technical requirement extraction
    - Compliance need detection
    - Project complexity estimation
  - **AI To-Do Generator**
    - Automatically generates separate task lists for admins and clients
    - Smart task categorization (setup, compliance, content, integration)
    - Priority assignment (high/medium/low)
    - Time estimation for each task
    - Dependency detection
    - Context-aware task generation (e.g., call list upload, CRM integration, HIPAA compliance)
  - **Admin Review & Approval Workflow**
    - Admin to-do review panel with inline editing
    - Add/delete/reorder tasks
    - Assign admin tasks to team members
    - Client tasks hidden until admin approval
    - Draft save capability
  - **Client To-Do Dashboard**
    - Clean checklist interface (post-approval only)
    - File upload for asset-required tasks
    - Task completion tracking
    - Progress indicator
    - Real-time admin notifications
  - **Email Notification System**
    - To-dos approved notification (client)
    - Task completion notifications (admin)
    - All tasks complete celebration emails (both parties)
  - **Database Enhancements**
    - `onboarding_templates_library` table (versioned templates)
    - `onboarding_todos` table (separate admin/client tasks)
    - `project_types_registry` table (custom project types)
    - AI analysis storage in sessions
    - Template usage analytics
  - **Admin Help Center**
    - Interactive help section built into admin dashboard
    - 7 main sections with searchable content
    - All 200+ help topics from guide converted to UI
    - Step-by-step workflows with visual guides
    - Troubleshooting section with solutions
    - Accessible via Platform → Help in sidebar
  - **Twilio SMS Notifications**
    - SMS notifications for all notification events (in addition to email)
    - User preference management (email only, SMS only, or both)
    - Per-notification-type delivery preferences
    - Platform admin and organization user support
    - Phone number collection and validation
    - Simple on/off toggle in settings
    - 7 pre-configured SMS templates
    - Character counting and multi-message detection
  - **Template Editor System**
    - Visual WYSIWYG editor (TipTap) for rich email formatting
    - Code editor (Monaco/VS Code) for HTML and plain text with syntax highlighting
    - Live preview for emails (desktop/mobile responsive views)
    - Realistic iPhone mockup for SMS preview
    - Dynamic variable system with {{variableName}} syntax
    - Variable insertion dropdown for easy placement
    - Test email/SMS sending with sample data
    - Template management dashboard with search and filters
    - Duplicate templates for quick variants
    - System template protection (cannot be deleted)
    - Usage statistics tracking
    - 14 pre-seeded templates (7 email + 7 SMS)
    - Comprehensive validation and error checking
    - Accessible via Platform → Templates in sidebar
  - **Branding & Design System**
    - Centralized branding management dashboard at `/platform/settings/branding`
    - Logo upload with Vercel Blob integration (automatic CDN hosting)
    - Dual logo support (light and dark backgrounds)
    - Complete color customization (primary, secondary, accent, text, background)
    - Default Botmakers color scheme (black, white, neon green #00ff00)
    - Company information management (CAN-SPAM compliance)
    - Social media links integration (Twitter, LinkedIn, Facebook, Instagram)
    - Email settings customization (from name, footer text, logo visibility)
    - Live color preview with sample UI
    - Beautiful professional email templates with branding integration
    - 5-tab interface: Logo, Colors, Company, Email, Social
    - Platform-wide or organization-specific branding options
    - Automatic branding application to all emails and onboarding pages
    - File upload validation (type, size limits)
    - CAN-SPAM compliant footer generation
    - Database migration complete with default branding values
  - **Expected Impact:**
    - 75% faster onboarding setup for admins
    - 90% reduction in missing information
    - 60% improvement in client task completion
    - Complete project context capture from day one
    - Instant SMS notifications for time-sensitive updates
    - Consistent branded messaging across all channels

**Latest Updates (Version 1.8 - October 7, 2025):**

- ✅ **AI Voice Campaigns System** - COMPLETE
  - **Campaign Creation Wizard**
    - Multi-step campaign setup with 7 guided steps
    - Campaign type selection (inbound, outbound, both)
    - AI-powered agent configuration using GPT-4o
    - Custom agent names and company branding
    - Voice preference and personality selection
    - Automatic phone number provisioning via Twilio
    - Working hours configuration (24/7, business, custom)
  - **AI Agent Configuration**
    - GPT-4o generates personalized agent prompts
    - System prompt (300-500 words, markdown formatted)
    - First message with agent/company name inclusion
    - Voicemail message script generation
    - Conversation guidelines and end phrases
    - Real-time sync to Vapi on configuration changes
  - **Vapi Integration**
    - Create and manage AI phone assistants via Vapi API
    - GPT-4o model for intelligent responses
    - Phone number assignment and webhook routing
    - Call transcription and recording
    - Real-time call analytics
  - **Campaign Management**
    - Campaign dashboard with horizontal card layout
    - Status indicators (active, paused, completed, failed)
    - Quick stats (calls, success rate, duration)
    - Bulk actions (pause, resume, delete multiple)
    - Search, filter, and sort capabilities
  - **Campaign Settings**
    - Three-tab interface (General, Configuration, Advanced)
    - Editable system prompts with instant Vapi sync
    - Editable first message and voicemail
    - Campaign goal and personality adjustments
    - Voice preference and working hours
  - **Call Recording & Analytics**
    - Automatic call recording for all campaigns
    - Transcription via Vapi
    - Duration tracking for billing integration
    - Call status tracking (answered, failed, busy)
    - Campaign-level analytics (total calls, answer rate, avg duration)
  - **Database Architecture**
    - `voice_campaigns` table with full configuration
    - `call_records` table for call history
    - `webhooks` table for event routing
    - Soft delete support for campaign recovery
    - JSONB storage for setup answers
  - **Subscription Integration**
    - Campaign limits based on subscription tier
    - Free: 1 campaign, Starter: 5, Pro: 20, Enterprise: unlimited
    - Usage tracking per call minute
    - Automatic billing for overages
  - **Server Actions**
    - 15+ campaign management actions
    - CRUD operations with transaction support
    - Bulk operations for efficiency
    - Real-time status updates
    - Self-healing integration
  - **Voice Provider Architecture**
    - Factory pattern for multiple providers (Vapi, Retell, Bland)
    - Full Vapi provider implementation
    - Extensible interface for future providers
    - Provider-specific configuration handling
  - **Webhook System**
    - `/api/webhooks/calls/[token]` endpoint
    - Signature validation for security
    - Call event processing (started, ended, failed)
    - Usage recording triggers
    - Statistics updates
  - **Error Handling**
    - Automatic retry with exponential backoff
    - Transaction rollback on failures
    - Clear error messaging
    - Self-healing integration for recovery
  - **Expected Impact:**
    - Complete AI voice agent platform
    - Automated inbound/outbound calling
    - Scalable campaign management
    - Real-time usage tracking and billing
    - Enterprise-grade reliability

**Version 1.7 Updates (October 6, 2025):**

- ✅ **Multi-Provider SaaS Billing System for Voice Campaigns** - COMPLETE
  - **Multi-Provider Payment Support**
    - Full Stripe integration with native metered billing
    - Full Square integration with invoice-based overage
    - Full PayPal integration with manual invoicing
    - Customer choice of payment provider during subscription
    - Provider-specific webhook handlers for all billing events
  - **4 Subscription Tiers**
    - Free: $0/mo, 100 minutes, $0.15/min overage, 1 campaign
    - Starter: $99/mo, 1,000 minutes, $0.10/min overage, 5 campaigns
    - Professional: $299/mo, 3,000 minutes, $0.08/min overage, 20 campaigns
    - Enterprise: $999/mo, 10,000 minutes, $0.06/min overage, unlimited campaigns
  - **Usage-Based Billing**
    - Real-time per-minute tracking for all voice calls
    - Automatic overage calculation beyond included minutes
    - Stripe metered billing for instant overage charges
    - Square/PayPal invoice generation for overage at cycle end
    - 30-day rolling billing cycle from subscription date
  - **Campaign Creation Guards**
    - Subscription required before creating campaigns
    - Campaign limits enforced based on plan tier
    - Usage limit checks before allowing new calls
    - Existing organizations auto-migrated to Free tier
  - **Customer Billing Dashboard**
    - Full-featured portal at `/platform/organizations/[id]/billing`
    - Real-time usage meter with visual progress bar
    - Minutes used vs. included with overage tracking
    - Active campaigns count and days until renewal
    - Estimated monthly total (base + overage costs)
    - Complete billing history with invoice downloads
    - Upgrade/downgrade with instant plan changes
    - Payment method management with provider portals
  - **Database Architecture**
    - `subscription_plans` - Plan definitions with tiered pricing
    - `organization_subscriptions` - Active subscriptions per org
    - `usage_records` - Per-call minute tracking and costs
    - `invoices` - Monthly billing statements
  - **Webhook Integration**
    - `/api/webhooks/stripe-billing` - Subscription & payment events
    - `/api/webhooks/square-billing` - Subscription & payment events
    - `/api/webhooks/paypal-billing` - Subscription & payment events
    - `/api/webhooks/calls/[token]` - Call completion triggers usage recording
  - **Admin Features**
    - Plan seeding tool at `/platform/admin/seed-plans`
    - Usage analytics across all organizations
    - Provider performance tracking
    - Invoice management and downloads
  - **Expected Impact:**
    - Monetization of AI voice campaign platform
    - 3 payment provider options for customer flexibility
    - Automatic usage tracking eliminates manual billing
    - Fair tiered pricing with pay-as-you-go overage
    - Zero-touch billing cycle management

- ✅ **AI-Powered Self-Healing System** - COMPLETE
  - **Global Error Capture**
    - Automatic error interception for all server actions
    - Wraps critical functions with self-healing capabilities
    - Error categorization (API failures, database errors, runtime errors)
    - Context preservation (user data, request details, stack traces)
  - **AI Healing Engine**
    - OpenAI GPT-4 analysis of errors for root cause diagnosis
    - Intelligent strategy recommendation (10+ healing strategies)
    - Confidence scoring for healing attempts
    - Fallback to rule-based analysis when AI unavailable
    - Learning from past successful healing patterns
  - **Automated Remediation Actions**
    - Retry with exponential backoff
    - Fallback to cached data
    - Switch API endpoints
    - Clear cache and retry
    - Reset database/API connections
    - Use safe default values
    - Skip non-critical operations
    - Queue for background retry
    - Rate limit backoff handling
  - **Proactive Health Monitoring**
    - Continuous health checks (OpenAI API, Database, Email, SMS, UploadThing)
    - Performance monitoring (memory usage, error rates, response times)
    - Automated Vercel cron jobs (every 2 minutes)
    - Threshold breach detection
    - Auto-trigger healing on degraded status
  - **Admin Dashboard**
    - Real-time system health overview
    - Healing activity feed with event cards
    - Success rate tracking
    - Mean time to recovery metrics
    - Service health status table
    - Critical/high/medium/low severity filtering
  - **Alert & Notification System**
    - Email/SMS alerts to platform admins for critical events
    - Healing success/failure notifications
    - Failed healing requires manual intervention alerts
    - Audit log integration for all healing events
  - **Learning System**
    - Stores successful healing patterns
    - Reuses proven strategies for similar errors
    - Tracks success/failure rates per strategy
    - Error signature matching for instant remediation
  - **Expected Impact:**
    - 95% of transient errors auto-recovered
    - 80% reduction in manual intervention
    - <2 second mean time to recovery
    - 99.9% uptime for critical services
    - Zero user-facing downtime from common errors

- ✅ **Organization Contacts System** - COMPLETE
  - **Multiple Contacts per Organization**
    - Unlimited contact persons per organization
    - Full contact details (name, job title, department, multiple phones, email, address)
    - Primary contact designation (one per organization)
    - Soft delete capability (is_active flag)
    - Created by tracking for audit trail
  - **Comprehensive Contact Information**
    - Personal: First name, last name, full name (generated), job title, department
    - Communication: Email, phone, mobile phone, office phone
    - Location: Address line 1 & 2, city, state, postal code, country
    - Additional: Notes field for extra context
  - **Primary Contact Integration**
    - Projects table now links to primary organization contact
    - Auto-suggest primary contact during project creation
    - Visual indicators for primary contacts in UI
  - **Platform Admin Features**
    - View all contacts for any organization
    - Add/edit/delete contacts from organization detail pages
    - Mark/unmark primary contacts
    - Search and filter contacts
    - Contact activity tracking
  - **Database Layer**
    - New `organization_contacts` table with full schema
    - Foreign key relationship to organizations (cascade delete)
    - Generated column for full_name (first + last)
    - Indexes for performance (organization_id, email, name, primary, active)
    - Atomic operations with self-healing integration
  - **Self-Healing Integration**
    - All contact server actions wrapped with error recovery
    - Automatic retry on transient failures
    - Audit logging for all contact operations
    - Database transaction rollback on errors
  - **UI Components**
    - OrganizationContactCard with responsive design
    - AddOrganizationContactDialog with full form validation
    - EditOrganizationContactDialog with pre-populated data
    - Integrated into Platform Admin organization detail pages
    - Loading states and empty states
  - **Expected Impact:**
    - Complete stakeholder tracking for all clients
    - Faster project communication with correct contacts
    - Better relationship management across organization touchpoints
    - Reduced confusion about who to contact for what

- ✅ **Manual Onboarding System** - IN PROGRESS
  - Database schema complete with tracking fields
  - Completion mode support (client, manual, hybrid)
  - Section attribution tracking (who filled what)
  - Client review workflow support
  - Abandoned session conversion capability
  - Implementation in progress (see plan.md for details)

- ✅ **User Dashboard Cleanup** - COMPLETE
  - Removed CRM features (Contacts, Deals) from user dashboard
  - User dashboard now focused on: monitoring projects, viewing activity, and analytics
  - Organization contacts accessible via `/dashboard/org-contacts`
  - CRM functionality remains in Platform Admin only

- ✅ **Bug Fixes & Stability Improvements** - COMPLETE
  - Fixed conflicting schema exports
  - Added missing database query functions
  - Enhanced error handling across all server actions
  - Improved validation for required fields
  - Added database indexes for performance
  - Implemented atomic credit operations
  - Added timezone-aware date handling
  - Soft delete for organizations
  - Unique constraints for data integrity
  - Rate limiting for API endpoints
  - Debouncing for search inputs
  - XSS prevention with HTML escaping

**Previous Updates (Version 1.6 - October 5, 2025):**
- ✅ **Dynamic Onboarding System with AI Templates & To-Do Lists** - See full details above
- ✅ **Twilio SMS Notifications** - Complete
- ✅ **Template Editor System** - Complete
- ✅ **Branding & Design System** - Complete

**Previous Updates (Version 1.5):**
- ✅ **Onboarding Enhancements - Database Schemas Complete**
  - Scheduled reminders & nurture sequences (schema ready)
  - Onboarding-to-tasks integration (schema ready)
  - Conditional logic for dynamic flows (schema ready)
  - 11 new database fields added
  - 4 new enums created
  - Full implementation plan documented

**Previous Updates (Version 1.3):**
- ✅ **Complete Task Management System** - COMPLETE
  - Kanban board with drag-and-drop (@dnd-kit integration)
  - List view with search, filter, sort
  - Full CRUD operations (create, edit, delete)
  - Due date badges with color indicators
  - Assignee avatars and management
  - Bulk actions (select multiple, delete)
  - Status updates with instant UI feedback
  - AI-generated task indicators
  - Auto-progress integration
- ✅ **Project Progress Tracking System**
  - Auto-calculated progress from task completion
  - Manual override capability for admins
  - Visual progress meter with percentage
  - Recalculates on task changes
- ✅ **Project Notes & Timeline**
  - Platform admins can add timestamped notes
  - Chronological timeline display
  - Read-only view for organization users
  - Delete notes capability

**Previous Updates (Version 1.2):**
- ✅ **AI-Powered Client Onboarding System** - COMPLETE
  - OpenAI GPT-4 integration for project analysis
  - Dynamic onboarding flow generation
  - 3 pre-built templates (Web Design, Voice AI, Software Dev)
  - Multi-step wizard with progress tracking
  - Token-based public access
  - File uploads with Uploadthing CDN
  - Email notifications (invitations, reminders, completions)
  - Admin dashboard with response viewer
  - Reset & resend onboarding functionality
  - Individual & bulk file downloads
- ✅ Botmakers branding integration
- ✅ Comprehensive automated testing suite

**Updates (Version 1.1):**
- ✅ Phase 0 Complete: Email & File Upload Infrastructure
- ✅ Email system with Resend integration
- ✅ File upload system with Uploadthing
- ✅ Test pages for email and file upload
- ✅ Comprehensive diagnostics and automated testing

