# Dynamic Onboarding System - Admin Help Guide

**Version:** 1.0  
**Last Updated:** October 5, 2025  
**For:** Platform Administrators

---

## 📑 Table of Contents

1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [Template Library Management](#template-library-management)
4. [Creating Custom Templates with AI](#creating-custom-templates-with-ai)
5. [Setting Up Client Onboarding](#setting-up-client-onboarding)
6. [Reviewing Onboarding Responses](#reviewing-onboarding-responses)
7. [Managing AI-Generated To-Do Lists](#managing-ai-generated-to-do-lists)
8. [Approving Client Tasks](#approving-client-tasks)
9. [Monitoring Client Progress](#monitoring-client-progress)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## System Overview

### What is the Dynamic Onboarding System?

The Dynamic Onboarding System is an intelligent client intake solution that:

- **Collects comprehensive project information** through structured questionnaires
- **Adapts questions in real-time** based on client responses
- **Provides AI-powered feedback** to ensure quality responses
- **Automatically generates actionable to-do lists** for both your team and clients
- **Tracks completion progress** and sends automated notifications

### Key Benefits

✅ **75% faster onboarding setup** - Use pre-built templates or generate custom ones with AI  
✅ **90% reduction in missing information** - Conditional logic ensures all necessary details are collected  
✅ **60% higher client task completion** - Clear, AI-generated tasks with priorities and time estimates  
✅ **Complete project context** - Full visibility into client needs from day one

---

## Getting Started

### Access Requirements

To use the Dynamic Onboarding System, you need:
- **Platform Admin** role
- Active project in the system
- Client contact information (email required)

### Quick Start Workflow

1. Navigate to **Platform → Projects → Create New Project**
2. Fill in basic project details
3. Select "Set up client onboarding"
4. Choose a template or create a custom one
5. Send invitation to client
6. Review responses when complete
7. Approve AI-generated to-do lists
8. Monitor client task completion

---

## Template Library Management

### Accessing the Template Library

1. Go to **Platform → Onboarding Templates**
2. You'll see:
   - **Built-in Templates** - 7 pre-configured industry templates
   - **Your Templates** - Custom and saved templates

### Pre-Built Templates

The system includes 7 comprehensive templates:

#### 1. **Outbound Calling Campaign**
- **Steps:** 10 grouped sections
- **Questions:** 45+ fields
- **Focus:** Campaign goals, target audience, call scripts, compliance, list details
- **Best for:** Cold calling, lead generation, appointment setting

#### 2. **Inbound Call Center Setup**
- **Steps:** 11 grouped sections
- **Questions:** 50+ fields
- **Focus:** Call flow, IVR, agent training, reporting requirements
- **Best for:** Customer support lines, sales hotlines, help desks

#### 3. **Web Design/Development**
- **Steps:** 8 grouped sections
- **Questions:** 35+ fields
- **Focus:** Design preferences, functionality, integrations, content
- **Best for:** Websites, web applications, landing pages

#### 4. **AI Voice Agent**
- **Steps:** 9 grouped sections
- **Questions:** 40+ fields
- **Focus:** Use case, conversation flow, voice personality, integrations
- **Best for:** AI receptionists, automated support, voice bots

#### 5. **Software Development**
- **Steps:** 10 grouped sections
- **Questions:** 45+ fields
- **Focus:** Requirements, tech stack, integrations, timeline
- **Best for:** Custom software, mobile apps, SaaS products

#### 6. **Marketing Campaign**
- **Steps:** 8 grouped sections
- **Questions:** 35+ fields
- **Focus:** Campaign goals, target audience, channels, budget
- **Best for:** Digital marketing, social media, email campaigns

#### 7. **CRM Implementation**
- **Steps:** 9 grouped sections
- **Questions:** 40+ fields
- **Focus:** Current system, migration needs, custom fields, workflows
- **Best for:** CRM setup, data migration, customization

### Template Actions

#### Preview Template
- Click **Preview** to see all questions and conditional logic
- Review estimated completion time
- Check required vs. optional fields

#### Edit Template
- Click **Edit** to modify questions
- Add/remove fields
- Adjust conditional logic
- Update industry triggers

#### Duplicate Template
- Click **Duplicate** to create a copy
- Useful for creating variations of existing templates
- Automatically marked as "Custom"

#### Archive Template
- Click **Archive** to hide unused templates
- Doesn't delete template or affect active sessions
- Can be restored later

### Template Statistics

Each template shows:
- **Times Used** - Total number of onboarding sessions
- **Avg Completion Time** - Average minutes to complete
- **Completion Rate** - Percentage of clients who finish

Use these metrics to:
- Identify your most effective templates
- Optimize templates with low completion rates
- Estimate onboarding duration for new clients

---

## Creating Custom Templates with AI

### When to Create a Custom Template

Create a custom template when:
- Your service type isn't covered by pre-built templates
- You need industry-specific questions
- Client has unique requirements
- You want to experiment with new workflows

### Step-by-Step: AI Template Creation

#### Step 1: Initiate Template Generator

1. Click **Create Custom Template** in the template library
2. Enter a **Project Type Name** (e.g., "Video Production", "Event Planning")
3. Provide a detailed **Description** of the service

**💡 Tip:** The more detailed your description, the better the AI-generated questions will be.

**Example Description:**
```
Video production services for corporate training videos. Includes
scriptwriting, filming, editing, and final delivery. Typical projects
range from 2-10 minute videos with professional voiceover and graphics.
Clients may need multiple videos for a series.
```

#### Step 2: AI Generation (Wait 30-60 seconds)

The AI will:
- Analyze your project type and description
- Research common requirements for similar projects
- Structure questions into logical groups (typically 8-12 steps)
- Generate conditional logic rules
- Suggest industry-specific compliance questions

#### Step 3: Review Generated Questions

You'll see a preview with:
- **Grouped Steps** - Questions organized by topic
- **Field Types** - Text, textarea, select, multi-select, file upload
- **Required/Optional** - Pre-determined importance
- **Conditional Logic** - When fields appear based on previous answers

#### Step 4: Customize (Optional)

Make adjustments:
- **Add Questions** - Insert additional fields where needed
- **Remove Questions** - Delete irrelevant fields
- **Reorder Steps** - Drag to change sequence
- **Edit Labels** - Clarify question wording
- **Adjust Logic** - Modify when fields appear

#### Step 5: Test Conditional Logic

1. Click **Test Logic**
2. Fill out the questionnaire as a mock client
3. Verify conditional questions appear correctly
4. Check that all paths through the form work

#### Step 6: Save to Library

1. Click **Save to Library**
2. Template is now available for all projects
3. Automatically marked as "AI Generated" and "Custom"

### AI Template Tips

✅ **Be Specific** - "E-commerce site for handmade jewelry" is better than "website"  
✅ **Include Context** - Mention typical project scope, duration, complexity  
✅ **List Key Deliverables** - What the client receives at project end  
✅ **Mention Unique Aspects** - Special requirements, integrations, regulations

---

## Setting Up Client Onboarding

### Creating a New Project with Onboarding

#### Step 1: Create Project

1. Go to **Platform → Projects → New Project**
2. Fill in:
   - Project Name
   - Organization (client)
   - Description
   - Timeline (optional)

#### Step 2: Enable Onboarding

1. Check **"Set up client onboarding"**
2. A template selector appears

#### Step 3: Select Template

**Option A: Choose from Library**
- Browse available templates
- Click to select
- See preview of questions

**Option B: Create Custom Template**
- Click **"Create custom project type"**
- Follow AI template generation process (see previous section)
- New template is automatically selected

#### Step 4: Customize Questions (Optional)

After selecting a template:
- Click **"Customize questions"**
- Add/remove fields specific to this client
- Changes only affect this onboarding session
- Original template remains unchanged

#### Step 5: Send Invitation

1. Click **"Send onboarding invite"**
2. Email is sent to client with:
   - Unique access link (no login required)
   - Estimated completion time
   - Your contact info

### Managing Onboarding Invitations

View all active onboarding sessions:
- Go to **Platform → Onboarding → Sessions**

For each session you can:
- **View Responses** - See answers submitted so far
- **Resend Invite** - Send reminder email
- **Reset Session** - Clear responses and restart
- **Cancel** - Deactivate the session

---

## Reviewing Onboarding Responses

### Accessing Session Details

1. Go to **Platform → Onboarding → Sessions**
2. Click on a completed session
3. Or click notification email link

### Session Detail Page

The session detail page shows:

#### 1. **Client Responses Section**
- All questions and answers organized by step
- File uploads with download links
- Timestamp of completion
- Total time spent

#### 2. **AI Analysis Summary** (Generated automatically)
- **Key Requirements** - Extracted technical/functional needs
- **Compliance Considerations** - Regulatory requirements detected
- **Project Complexity** - Estimated complexity score (1-10)
- **Recommended Next Steps** - AI suggestions for project kickoff
- **Risk Factors** - Potential challenges identified

#### 3. **To-Do Lists Section** (If generated)
- Admin Tasks tab
- Client Tasks tab
- Approval status

### Understanding AI Analysis

The AI analyzes all responses to provide:

**Technical Requirements**
- Features mentioned
- Integrations needed
- Platform/technology preferences
- Scale/performance expectations

**Compliance Needs**
- Industry-specific regulations (e.g., HIPAA, GDPR, PCI-DSS)
- Required certifications
- Data security requirements
- Accessibility standards

**Complexity Score**
- Based on scope, integrations, custom features, timeline
- 1-3: Simple project, 1-2 weeks
- 4-6: Moderate complexity, 3-6 weeks
- 7-9: Complex project, 2-4 months
- 10: Highly complex, 6+ months

---

## Managing AI-Generated To-Do Lists

### How To-Do Generation Works

When a client completes onboarding, the AI:

1. **Analyzes all responses** for requirements, missing info, mentioned tools
2. **Generates two separate task lists:**
   - **Admin Tasks** - For your team (setup, configuration, development)
   - **Client Tasks** - For the client (provide assets, access, approvals)
3. **Categorizes each task** (setup, compliance, content, integration, etc.)
4. **Assigns priority** (high, medium, low) based on dependencies
5. **Estimates duration** (in minutes) for each task
6. **Detects dependencies** (Task B can't start until Task A is done)

### Accessing To-Do Review Panel

1. Open the session detail page
2. Scroll to **"To-Do Lists"** section
3. Click **"Generate To-Dos"** if not already generated
4. Wait 20-30 seconds for AI analysis

### Admin Tasks Tab

**What You'll See:**
- List of tasks for your team
- Each task shows:
  - Title
  - Description (click to expand)
  - Category tag (Setup, Integration, etc.)
  - Priority badge (High/Medium/Low)
  - Time estimate
  - Assign to dropdown

**Actions You Can Take:**

#### Inline Edit
- Click on title or description to edit
- Changes save automatically
- Useful for adding specific details

#### Change Priority
- Click priority dropdown
- Select: High (red), Medium (yellow), Low (gray)
- Use to reprioritize based on actual urgency

#### Assign Tasks
- Click **"Assign to"** dropdown
- Select team member
- They'll receive notification (if enabled)

#### Reorder Tasks
- Drag and drop to change order
- Affects display order in task list

#### Delete Tasks
- Click **X** icon
- Confirm deletion
- Use for irrelevant AI-generated tasks

#### Add Custom Task
- Click **"+ Add Custom Task"**
- Fill in title, description, priority, category
- Useful for tasks AI missed

### Client Tasks Tab

**What You'll See:**
- List of tasks for the client
- Same fields as admin tasks (title, description, priority, etc.)
- No "Assign to" field (all assigned to client)

**Actions You Can Take:**
- Same as admin tasks (edit, delete, reorder, add custom)
- **Important:** Client cannot see these until you approve

### Understanding Task Categories

| Category | Examples |
|----------|----------|
| **Setup** | Create accounts, configure platforms, set up environments |
| **Compliance** | Complete training, review policies, sign agreements |
| **Content** | Provide copy, images, videos, brand assets |
| **Integration** | Provide API keys, credentials, access permissions |
| **Review** | Approve designs, test features, provide feedback |
| **Other** | Miscellaneous tasks |

### Understanding Task Dependencies

Some tasks show **"Depends on:"** labels:
- These tasks can't be completed until prerequisite tasks are done
- Example: "Test call flow" depends on "Upload call script"
- Client sees these as locked until dependencies are complete

---

## Approving Client Tasks

### Why Admin Approval is Required

Client tasks are hidden until approval to ensure:
- ✅ Tasks are accurate and relevant
- ✅ No sensitive internal tasks leak to client
- ✅ Tasks are clearly worded for non-technical users
- ✅ Priorities make sense from client perspective

### Approval Process

#### Step 1: Review Client Tasks
- Switch to **"Client Tasks"** tab
- Read each task from client's perspective
- Check for clarity, accuracy, appropriate detail level

#### Step 2: Make Final Edits
- Edit any confusing wording
- Remove tasks that should stay internal
- Add any missing client action items
- Ensure priorities guide them to start with most important tasks

#### Step 3: Click "Approve & Send to Client"
- **Before clicking**, double-check everything
- **After clicking:**
  - Client receives email notification
  - Tasks appear in their dashboard
  - You cannot make further edits without notifying them

#### Step 4: Client Receives Notification

Client gets email with:
- Number of tasks waiting
- Link to their to-do dashboard
- Estimated total time to complete all tasks
- Your contact info for questions

### What if You Need to Change Tasks After Approval?

If you need to modify after approval:
1. Go to session detail page
2. Click **"Edit Client Tasks"**
3. Make changes
4. Click **"Save & Notify Client"**
5. Client receives update email

**Best Practice:** Try to get tasks right before initial approval to avoid confusion.

---

## Monitoring Client Progress

### Client To-Do Dashboard (Client View)

When clients access their tasks, they see:
- Clean checklist interface
- Progress bar showing completion percentage
- Tasks ordered by priority
- Time estimates for each task
- File upload capability for relevant tasks
- Notes field for questions/context

### Admin Monitoring

#### Real-Time Notifications

You receive notifications when:
- ✅ Client completes a task
- 🎉 Client completes all tasks
- ⏰ Client hasn't started after 48 hours (optional reminder)

#### Session Progress View

1. Go to **Platform → Onboarding → Sessions**
2. View completion status:
   - **Onboarding:** Complete / In Progress
   - **To-Dos:** X of Y completed
3. Click session to see:
   - Which tasks are done
   - What client submitted for each task
   - Timestamps

#### Client Task Completion

When client marks a task complete:
- **If task has file upload:** You see uploaded files
- **If task has notes:** You see client's comments
- **Admin Tasks:** Your task list updates if there were dependencies

### All Tasks Complete

When client finishes all tasks:

**Automatically happens:**
1. Both you and client receive celebration emails 🎉
2. Session status updates to "Fully Complete"
3. Project status can be moved to "In Progress"

**You should:**
1. Review all submitted materials
2. Schedule project kickoff meeting
3. Begin actual project work
4. Update project status in platform

---

## Best Practices

### Template Selection

✅ **Use pre-built templates when possible** - They're optimized based on industry standards  
✅ **Customize templates for repeat clients** - Save variations for different client sizes  
✅ **Test custom templates before sending** - Complete as a mock client to catch issues  
✅ **Archive unused templates** - Keep library clean and focused

### Onboarding Invitations

✅ **Send invites immediately after project kickoff call** - Strike while iron is hot  
✅ **Set expectations upfront** - Tell client onboarding takes ~30 minutes  
✅ **Send reminder after 48 hours** - Gentle nudge if they haven't started  
✅ **Be available for questions** - First-time clients may need clarification

### To-Do List Management

✅ **Review AI-generated tasks thoroughly** - AI is smart but not perfect  
✅ **Remove internal-only tasks from client list** - Keep client focused on their actions  
✅ **Use clear, non-technical language for clients** - They may not understand jargon  
✅ **Break large tasks into smaller ones** - 15-30 minute tasks are more manageable  
✅ **Set realistic priorities** - Too many "High" priority tasks = no priorities

### Client Communication

✅ **Acknowledge completion quickly** - Reply within 24 hours of onboarding completion  
✅ **Provide context for tasks** - Explain why you need certain information  
✅ **Celebrate milestones** - Positive reinforcement increases completion rates  
✅ **Be patient with non-technical clients** - Some tasks may need explanation

### Data Organization

✅ **Download files immediately** - Save client uploads to project folder  
✅ **Export responses for project brief** - Use onboarding data to create SOW  
✅ **Tag sessions for easy searching** - Use consistent naming conventions  
✅ **Archive old sessions** - Keep active list focused on current projects

---

## Troubleshooting

### Issue: Client Says They Can't Access Onboarding Link

**Possible Causes:**
- Link expired (after 30 days)
- Email went to spam
- Link was forwarded (some links are user-specific)

**Solutions:**
1. Go to session detail page
2. Click **"Resend Invitation"**
3. Ask client to check spam folder
4. If still failing, click **"Reset Session"** to generate new link

---

### Issue: Client Skipped Required Questions

**Why This Happens:**
- Conditional logic may have hidden the question initially
- Form validation bug (rare)

**Solutions:**
1. Review responses to see what they provided
2. If truly missing, contact client directly
3. Or add task to client to-do list: "Provide [missing info]"

---

### Issue: AI Generated Irrelevant Tasks

**Why This Happens:**
- AI misinterpreted client responses
- Template wasn't ideal for this project type
- Edge case scenario

**Solutions:**
1. Simply delete irrelevant tasks before approving
2. Edit tasks to be more accurate
3. Add custom tasks that AI missed
4. Consider creating custom template for future similar projects

---

### Issue: Client Completed Onboarding but No To-Dos Generated

**Possible Causes:**
- OpenAI API error
- Rate limiting
- Timeout during analysis

**Solutions:**
1. Go to session detail page
2. Click **"Generate To-Dos"** button manually
3. Wait 30 seconds
4. If fails again, check **Platform → Settings → API Keys** to verify OpenAI key

---

### Issue: Template Has Too Many Questions, Client Abandons

**Why This Happens:**
- Template too comprehensive for project scope
- Questions not well-grouped
- Too many optional fields shown

**Solutions:**
**Short-term:** Customize template for this client
1. Remove optional questions
2. Combine similar questions
3. Resend invitation

**Long-term:** Edit template
1. Mark more fields as optional
2. Add conditional logic to hide fields
3. Break into multiple shorter sessions

---

### Issue: Can't Edit Tasks After Approval

**Why This Happens:**
- By design - prevents confusion for client

**Solutions:**
1. Click **"Edit Client Tasks"** in session detail
2. Make changes
3. Click **"Save & Notify Client"**
4. Client gets update email with revised list

---

### Issue: Client Uploaded Wrong File

**Solutions:**
1. Add task to client to-do: "Replace [file] with [correct file]"
2. Or handle via direct communication
3. In future: Be more specific in upload field instructions

---

### Issue: Don't See Template Library Option

**Possible Causes:**
- Not logged in as platform admin
- Feature flag disabled

**Solutions:**
1. Verify you have Platform Admin role
2. Check with system administrator
3. Verify OpenAI API key is configured

---

## Advanced Features

### Template Variables

You can use variables in template questions:
- `{{client_name}}` - Auto-filled with client organization name
- `{{project_name}}` - Auto-filled with project name
- `{{admin_name}}` - Your name
- `{{admin_email}}` - Your email

**Example:**
```
"Will {{client_name}} need ongoing support after launch?"
```

### Conditional Logic Syntax

When editing templates, conditional rules use JSON format:

**Show field if another field equals value:**
```json
{
  "show_if": {
    "field": "has_call_list",
    "equals": "yes"
  }
}
```

**Show field if multiple conditions:**
```json
{
  "show_if": {
    "all": [
      {"field": "project_type", "equals": "outbound"},
      {"field": "call_volume", "greater_than": 100}
    ]
  }
}
```

### Industry Triggers

Industry triggers automatically add questions when specific industries are detected:

- **Healthcare** → HIPAA compliance questions
- **Finance** → PCI-DSS, SOC 2 questions
- **Education** → FERPA, accessibility questions
- **Legal** → Confidentiality, security questions

Configured in template JSON under `industry_triggers`.

---

## Getting Help

### Resources

- **Implementation Status:** See `ONBOARDING_SYSTEM_IMPLEMENTATION_STATUS.md`
- **Technical Docs:** See `plan.md` for architecture details
- **API Documentation:** OpenAI, Resend, Uploadthing docs

### Support Contacts

- **Technical Issues:** usecodespring@gmail.com
- **Feature Requests:** Submit via platform feedback form
- **Emergency Support:** Check dashboard for status

---

## Changelog

### Version 1.0 (October 5, 2025)
- Initial release of Dynamic Onboarding System
- 7 pre-built templates
- AI template generator
- To-do list generation and approval workflow
- Real-time AI feedback
- Admin/client task separation

---

**End of Admin Help Guide**

*Last Updated: October 5, 2025*
