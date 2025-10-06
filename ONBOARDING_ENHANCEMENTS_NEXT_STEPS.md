# Onboarding Enhancements - Next Steps Guide

**Date:** October 5, 2025  
**Status:** Database schemas complete - Ready for implementation

---

## ✅ What's Already Done

### 1. Database Schemas (100% Complete)
- [x] Created `reminder-schema.ts` with `onboarding_reminders` table
- [x] Updated `onboarding-schema.ts` with 11 new fields
- [x] Updated `projects-schema.ts` with task source tracking
- [x] Added 4 new enums (reminder types, task sources, etc.)
- [x] Exported all schemas from `index.ts`
- [x] Zero linting errors

### 2. Documentation (100% Complete)
- [x] `ONBOARDING_ENHANCEMENTS_SUMMARY.md` - Full feature overview
- [x] `APP_OVERVIEW.md` updated to Version 1.4
- [x] Implementation plan documented
- [x] Expected impact metrics defined
- [x] Developer guides outlined

---

## 🚀 Next Steps to Complete Implementation

### Step 1: Run Database Migrations (CRITICAL - Do This First!)

```bash
cd codespring-boilerplate

# Generate migration from schema changes
npm run db:generate

# Apply migration to database
npm run db:migrate
```

**Expected Output:**
- New migration file in `db/migrations/`
- Should include: `onboarding_reminders` table
- Should include: ALTER statements for `client_onboarding_sessions` and `project_tasks`

**Verify:**
```sql
-- Check if reminders table exists
SELECT * FROM onboarding_reminders LIMIT 1;

-- Check if new columns exist
SELECT reminder_schedule, tasks_generated, visible_steps 
FROM client_onboarding_sessions LIMIT 1;

-- Check if task source tracking exists
SELECT source_type, source_id FROM project_tasks LIMIT 1;
```

---

### Step 2: Build Core Libraries (Week 1-2)

#### A. Reminder Scheduler (`lib/reminder-scheduler.ts`)

**Purpose:** Schedule and manage reminder emails

```typescript
// Example structure
export async function scheduleReminders(sessionId: string) {
  // Calculate reminder dates based on schedule
  // Create reminder records
  // Return scheduled reminders
}

export async function cancelReminders(sessionId: string) {
  // Cancel all pending reminders for session
}

export async function sendPendingReminders() {
  // Called by cron job
  // Find reminders due now
  // Send emails
  // Update sent status
}
```

**Key Functions:**
- `scheduleReminders(sessionId, schedule)` - Create reminder schedule
- `cancelReminders(sessionId)` - Cancel all reminders
- `sendPendingReminders()` - Process pending reminders (called by cron)
- `getReminderHistory(sessionId)` - Get all reminders for session
- `sendManualReminder(sessionId, type)` - Send immediate reminder

#### B. Reminder Email Templates (`lib/reminder-email-templates.ts`)

**Purpose:** Generate email HTML for each reminder type

```typescript
// Example structure
export function buildGentleReminderEmail(session, project) {
  const subject = `Quick reminder: Your ${project.name} onboarding awaits`;
  const body = `
    <h1>Hi there!</h1>
    <p>Just a friendly reminder to complete your onboarding...</p>
    <p>Progress: ${session.completionPercentage}%</p>
    <a href="${onboardingUrl}">Continue Onboarding</a>
  `;
  return { subject, body };
}
```

**Templates Needed:**
- `buildGentleReminderEmail()` - Day 2
- `buildEncouragementEmail()` - Day 5
- `buildFinalReminderEmail()` - Day 7
- `buildAbandonmentEmail()` - Step-specific

#### C. Condition Evaluator (`lib/condition-evaluator.ts`)

**Purpose:** Evaluate conditions against responses

```typescript
// Example structure
export function evaluateCondition(condition, responses) {
  const { field, operator, value } = condition;
  const responseValue = responses[field];
  
  switch (operator) {
    case 'equals':
      return responseValue === value;
    case 'greater_than':
      return responseValue > value;
    // ... more operators
  }
}

export function evaluateComplexCondition(condition, responses) {
  if (condition.all) {
    return condition.all.every(c => evaluateCondition(c, responses));
  }
  if (condition.any) {
    return condition.any.some(c => evaluateCondition(c, responses));
  }
  return evaluateCondition(condition, responses);
}
```

**Key Functions:**
- `evaluateCondition(condition, responses)` - Single condition
- `evaluateComplexCondition(condition, responses)` - Nested AND/OR
- `getVisibleSteps(steps, responses)` - Filter steps by conditions
- `validateCondition(condition)` - Check for circular dependencies

#### D. Task Mapper (`lib/onboarding-task-mapper.ts`)

**Purpose:** Convert responses into project tasks

```typescript
// Example structure
export function generateTasksFromResponses(session, responses, rules) {
  const tasks = [];
  
  for (const [key, value] of Object.entries(responses)) {
    const rule = rules.find(r => r.matches(key, value));
    if (rule) {
      tasks.push(...rule.generateTasks(value));
    }
  }
  
  return tasks;
}
```

**Key Functions:**
- `generateTasksFromResponses(session, rules)` - Main mapping function
- `applyRule(response, rule)` - Apply single rule
- `enrichWithAI(tasks, projectDescription)` - Enhance with GPT-4
- `validateTasks(tasks)` - Ensure tasks are valid

#### E. Task Generation Rules (`lib/task-generation-rules/`)

Create rule files for each template:

**web-design-rules.ts:**
```typescript
export const webDesignRules = [
  {
    responseKey: 'logo_upload',
    condition: (response) => response && response.length > 0,
    generateTasks: (response) => [{
      title: 'Review and optimize logo files',
      description: `Client uploaded ${response.length} logo file(s)`,
      status: 'todo',
      dueDate: addDays(new Date(), 2),
      priority: 'high'
    }]
  },
  // ... more rules
];
```

**Create:**
- `web-design-rules.ts` - 10-15 rules
- `voice-ai-rules.ts` - 10-15 rules
- `software-dev-rules.ts` - 10-15 rules
- `generic-rules.ts` - 5-10 common rules

---

### Step 3: Create Database Queries (Week 2)

#### `db/queries/reminder-queries.ts`

```typescript
export async function createReminder(data: InsertOnboardingReminder) {
  return db.insert(onboardingRemindersTable).values(data).returning();
}

export async function getPendingReminders() {
  return db.select()
    .from(onboardingRemindersTable)
    .where(
      and(
        eq(onboardingRemindersTable.status, 'pending'),
        lte(onboardingRemindersTable.scheduledAt, new Date())
      )
    );
}

export async function updateReminderStatus(id: string, status: string) {
  return db.update(onboardingRemindersTable)
    .set({ status, sentAt: new Date() })
    .where(eq(onboardingRemindersTable.id, id));
}

// ... more query functions
```

**Functions Needed:**
- `createReminder()`
- `getPendingReminders()`
- `getRemindersBySession()`
- `updateReminderStatus()`
- `cancelReminders()`

---

### Step 4: Create Server Actions (Week 2-3)

#### `actions/reminder-actions.ts`

```typescript
export async function scheduleRemindersAction(sessionId: string) {
  try {
    await requirePlatformAdmin();
    
    // Get session
    const session = await getOnboardingSession(sessionId);
    
    // Schedule reminders
    const reminders = await scheduleReminders(sessionId, session.reminderSchedule);
    
    revalidatePath(`/platform/onboarding/${sessionId}`);
    
    return { isSuccess: true, data: reminders };
  } catch (error) {
    return { isSuccess: false, message: error.message };
  }
}
```

**Actions Needed:**
- `scheduleRemindersAction()`
- `cancelRemindersAction()`
- `sendManualReminderAction()`
- `updateReminderSettingsAction()`

#### `actions/onboarding-task-generation-actions.ts`

```typescript
export async function generateTasksFromOnboardingAction(sessionId: string) {
  try {
    await requirePlatformAdmin();
    
    // Get session and responses
    const session = await getOnboardingSession(sessionId);
    
    // Load appropriate rules
    const rules = await getTaskGenerationRules(session.onboardingType);
    
    // Generate tasks
    const tasks = await generateTasksFromResponses(session, rules);
    
    // Create tasks
    const created = await bulkCreateTasks(tasks);
    
    // Update session
    await updateSession(sessionId, {
      tasksGenerated: true,
      tasksGeneratedAt: new Date(),
      taskCount: created.length
    });
    
    return { isSuccess: true, data: created };
  } catch (error) {
    return { isSuccess: false, message: error.message };
  }
}
```

**Actions Needed:**
- `generateTasksFromOnboardingAction()`
- `previewTasksAction()` - Preview before creating
- `updateTaskRulesAction()` - Admin customization

---

### Step 5: Build Cron Job (Week 3)

#### `app/api/cron/send-reminders/route.ts`

```typescript
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get pending reminders
  const pending = await getPendingReminders();
  
  // Send each reminder
  const results = [];
  for (const reminder of pending) {
    try {
      const session = await getOnboardingSession(reminder.sessionId);
      
      // Skip if completed or client is active
      if (session.status === 'completed' || 
          isRecentlyActive(session.lastActivityAt)) {
        await cancelReminder(reminder.id);
        continue;
      }
      
      // Send email
      await sendOnboardingReminder(reminder, session);
      
      // Update status
      await updateReminderStatus(reminder.id, 'sent');
      
      results.push({ id: reminder.id, status: 'sent' });
    } catch (error) {
      await updateReminderStatus(reminder.id, 'failed');
      results.push({ id: reminder.id, status: 'failed', error: error.message });
    }
  }
  
  return Response.json({
    processed: pending.length,
    results
  });
}
```

**Add to `vercel.json`:**
```json
{
  "crons": [{
    "path": "/api/cron/send-reminders",
    "schedule": "0 * * * *"
  }]
}
```

---

### Step 6: Build UI Components (Week 3-4)

#### A. Reminder Settings Dialog

**File:** `components/platform/reminder-settings-dialog.tsx`

**Features:**
- Enable/disable reminders
- Choose schedule (standard/aggressive/gentle/custom)
- Preview emails
- Send manual reminder
- View reminder history

#### B. Task Generation Preview

**File:** `components/platform/task-generation-preview.tsx`

**Features:**
- Show all tasks that will be created
- Edit task before creating
- Show which response generated each task
- Bulk create button

#### C. Condition Builder

**File:** `components/platform/condition-builder.tsx`

**Features:**
- Drag-and-drop interface
- Add conditions (field, operator, value)
- Nest conditions (AND/OR groups)
- Preview flow diagram
- Test with sample data

#### D. Update Onboarding Wizard

**File:** `components/onboarding/onboarding-wizard.tsx`

**Changes:**
- Evaluate conditions before showing steps
- Update progress bar dynamically
- Track visible/skipped steps
- Save condition evaluation results

---

### Step 7: Testing (Week 4)

#### Unit Tests
- [ ] Condition evaluator with all operators
- [ ] Task mapping rules
- [ ] Reminder scheduling logic
- [ ] Email template rendering

#### Integration Tests
- [ ] Full reminder sequence
- [ ] Task generation end-to-end
- [ ] Conditional flow navigation
- [ ] Cron job execution

#### E2E Tests
- [ ] Complete conditional onboarding
- [ ] Receive and click reminder email
- [ ] View generated tasks
- [ ] Admin management workflows

---

## 📋 Implementation Checklist

### Database & Schema
- [x] Create reminder schema
- [x] Update onboarding schema
- [x] Update projects schema
- [ ] Run `npm run db:generate`
- [ ] Run `npm run db:migrate`
- [ ] Verify migrations in database

### Core Libraries
- [ ] Reminder scheduler (`lib/reminder-scheduler.ts`)
- [ ] Email templates (`lib/reminder-email-templates.ts`)
- [ ] Condition evaluator (`lib/condition-evaluator.ts`)
- [ ] Task mapper (`lib/onboarding-task-mapper.ts`)
- [ ] Task rules (4 files in `lib/task-generation-rules/`)

### Data Layer
- [ ] Reminder queries (`db/queries/reminder-queries.ts`)
- [ ] Reminder actions (`actions/reminder-actions.ts`)
- [ ] Task generation actions (`actions/onboarding-task-generation-actions.ts`)

### API & Cron
- [ ] Cron job (`app/api/cron/send-reminders/route.ts`)
- [ ] Add to `vercel.json`
- [ ] Set `CRON_SECRET` environment variable

### UI Components
- [ ] Reminder settings dialog
- [ ] Task generation preview
- [ ] Condition builder
- [ ] Update onboarding wizard
- [ ] Update admin pages

### Documentation
- [x] Enhancement summary
- [x] APP_OVERVIEW.md updated
- [ ] REMINDER_SYSTEM_GUIDE.md
- [ ] TASK_INTEGRATION_GUIDE.md
- [ ] CONDITIONAL_LOGIC_GUIDE.md

### Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] Monitor metrics

---

## 🎯 Success Metrics to Track

Once implemented, track these KPIs:

### Reminder System
- Onboarding completion rate (target: +60%)
- Email open rate (target: >40%)
- Email click rate (target: >15%)
- Time from reminder to completion (target: <24 hours)

### Task Integration
- Projects with auto-generated tasks (target: 80%)
- Tasks created per onboarding (target: 10+)
- Task completion rate (target: >70%)
- Time saved per project (target: 30 minutes)

### Conditional Logic
- Average onboarding time (target: -30%)
- Steps shown per user (track distribution)
- Client satisfaction (target: 4.5/5)
- Error rate on conditions (target: <1%)

---

## ❓ Questions? Issues?

**Common Issues:**

1. **Migration fails:**
   - Check for conflicting enum names
   - Ensure all referenced tables exist
   - Review migration file before applying

2. **Cron not firing:**
   - Verify `vercel.json` configuration
   - Check cron secret authentication
   - Monitor Vercel cron logs

3. **Conditions not evaluating:**
   - Validate condition syntax
   - Check for circular dependencies
   - Test with sample data first

4. **Tasks not generating:**
   - Verify response data format
   - Check rule matching logic
   - Review AI API limits

**Need Help?**
- Review `ONBOARDING_ENHANCEMENTS_SUMMARY.md`
- Check plan in `plan.md`
- Email: usecodespring@gmail.com

---

**Status:** Ready to begin implementation!  
**Estimated Time:** 4 weeks full-time  
**Priority:** High-impact features for user engagement
