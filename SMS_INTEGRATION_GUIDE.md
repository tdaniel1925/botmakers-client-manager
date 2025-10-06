# SMS Notifications Integration Guide

**Date:** October 5, 2025  
**Status:** Implementation Complete  
**Twilio Integration**

---

## 🎯 Overview

This system adds Twilio SMS notifications alongside existing email notifications. Users can choose email, SMS, or both for each notification type via their settings page.

---

## ✅ What's Been Implemented

### 1. **Database Schema**
- ✅ Added `phone_number`, `sms_notifications_enabled`, `notification_preferences` to `platform_admins` table
- ✅ Added same fields to `user_roles` table
- ✅ Migration file: `0031_add_sms_notifications.sql`

### 2. **Core Services**
- ✅ `lib/sms-service.ts` - Twilio integration with 8 SMS templates
- ✅ `lib/notification-service.ts` - Unified routing logic (email/SMS/both)
- ✅ `db/queries/notification-preferences-queries.ts` - Database operations

### 3. **Server Actions**
- ✅ `actions/notification-preferences-actions.ts` - Get/update preferences, test SMS

### 4. **UI Components**
- ✅ `components/settings/sms-notification-settings.tsx` - Full settings interface
- ✅ Added to `/platform/settings` (platform admins)
- ✅ Added to `/dashboard/settings` (organization users)

---

## 📋 Setup Instructions

### Step 1: Get Twilio Credentials

1. Sign up at [twilio.com](https://www.twilio.com)
2. Get your Account SID and Auth Token
3. Purchase a phone number (US: ~$1/month)

### Step 2: Add Environment Variables

Add to `.env` or `.env.local`:

```bash
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+15551234567"  # Your Twilio number
```

### Step 3: Run Database Migration

```bash
cd codespring-boilerplate
npm run db:migrate
```

This applies migration `0031_add_sms_notifications.sql` to add SMS fields to the database.

### Step 4: Verify Installation

1. Start the dev server: `npm run dev`
2. Log in as platform admin
3. Go to `/platform/settings`
4. You should see "SMS Notifications" card
5. Toggle "Enable SMS Notifications"
6. Enter your phone number (with country code)
7. Click "Test SMS" button
8. You should receive a test message!

---

## 🔗 How to Integrate SMS into Existing Notifications

There are **7 notification types** that can be sent via SMS:
1. `onboarding_invite` - Client invited to complete onboarding
2. `onboarding_complete` - Client completed onboarding
3. `todo_approved` - Admin approved client's to-do list
4. `todo_completed` - Client completed a to-do
5. `all_todos_complete` - Client finished all to-dos
6. `project_created` - New project created
7. `task_assigned` - Task assigned to user

### Integration Pattern

Replace direct email calls with the unified notification service:

#### Before (Email Only):
```typescript
import { sendOnboardingInviteEmail } from '@/lib/email-service';

// In your action/function:
await sendOnboardingInviteEmail({
  clientEmail: 'client@example.com',
  clientName: 'John',
  projectName: 'My Project',
  onboardingLink: 'https://...',
});
```

#### After (Email or SMS based on user preference):
```typescript
import { sendNotification } from '@/lib/notification-service';
import { sendOnboardingInviteEmail } from '@/lib/email-service';
import { sendOnboardingInviteSMS } from '@/lib/sms-service';

// In your action/function:
await sendNotification({
  userId: adminUserId,  // The admin/user receiving the notification
  type: 'onboarding_invite',
  isPlatformAdmin: true,  // or false for org users
  orgId: orgId,  // Required if not platform admin
  emailFn: () => sendOnboardingInviteEmail({
    clientEmail: 'client@example.com',
    clientName: 'John',
    projectName: 'My Project',
    onboardingLink: 'https://...',
  }),
  smsFn: () => sendOnboardingInviteSMS(
    adminPhone,  // Phone from user preferences (fetched automatically)
    'John',
    'My Project',
    'https://...'
  ),
});
```

### Example Integrations

#### 1. Onboarding Complete Notification (Admin)

**File:** `actions/client-onboarding-actions.ts`

```typescript
import { sendNotification } from '@/lib/notification-service';
import { sendOnboardingCompleteEmail } from '@/lib/email-service';
import { sendOnboardingCompleteSMS } from '@/lib/sms-service';

// After client submits onboarding
await sendNotification({
  userId: project.createdBy,  // Admin who created the project
  type: 'onboarding_complete',
  isPlatformAdmin: true,
  emailFn: () => sendOnboardingCompleteEmail({
    adminEmail: adminEmail,
    clientName: session.contactName,
    projectName: project.name,
  }),
  smsFn: () => sendOnboardingCompleteSMS(
    adminPhone,
    session.contactName,
    project.name
  ),
});
```

#### 2. To-Dos Approved Notification (Client)

**File:** `actions/onboarding-todos-actions.ts`

```typescript
import { sendNotification } from '@/lib/notification-service';
import { sendTodosApprovedEmail } from '@/lib/email-service';
import { sendTodosApprovedSMS } from '@/lib/sms-service';

// After admin approves to-dos
await sendNotification({
  userId: clientUserId,
  type: 'todo_approved',
  isPlatformAdmin: false,
  orgId: project.organizationId,
  emailFn: () => sendTodosApprovedEmail({
    clientEmail: clientEmail,
    clientName: clientName,
    projectName: projectName,
    todoCount: clientTodos.length,
    todosUrl: `${process.env.NEXT_PUBLIC_APP_URL}/todos/${sessionId}`,
  }),
  smsFn: () => sendTodosApprovedSMS(
    clientPhone,
    clientName,
    projectName,
    clientTodos.length,
    `${process.env.NEXT_PUBLIC_APP_URL}/todos/${sessionId}`
  ),
});
```

#### 3. Task Assigned Notification

**File:** `actions/project-tasks-actions.ts`

```typescript
import { sendNotification } from '@/lib/notification-service';
import { sendTaskAssignedSMS } from '@/lib/sms-service';

// After assigning a task to a user
if (assignedTo) {
  await sendNotification({
    userId: assignedTo,
    type: 'task_assigned',
    isPlatformAdmin: false,
    orgId: task.organizationId,
    emailFn: () => sendTaskAssignedEmail({
      userEmail: userEmail,
      taskTitle: task.title,
      projectName: projectName,
      dueDate: task.dueDate,
    }),
    smsFn: () => sendTaskAssignedSMS(
      userPhone,
      task.title,
      projectName,
      task.dueDate
    ),
  });
}
```

---

## 📱 Available SMS Templates

All SMS templates are in `lib/sms-service.ts`:

1. **sendOnboardingInviteSMS** - Invite client to start onboarding
2. **sendOnboardingCompleteSMS** - Notify admin of completion
3. **sendTodosApprovedSMS** - Notify client their tasks are ready
4. **sendTodoCompletedSMS** - Notify admin of task completion
5. **sendAllTodosCompleteSMS** - Celebration message
6. **sendProjectCreatedSMS** - New project notification
7. **sendTaskAssignedSMS** - Task assignment notification
8. **sendTestSMS** - Test SMS functionality

### Creating New SMS Templates

Add to `lib/sms-service.ts`:

```typescript
export async function sendNewNotificationSMS(
  phone: string,
  param1: string,
  param2: string
) {
  const message = `Your custom message with ${param1} and ${param2}`;
  return sendSMS({ to: phone, message });
}
```

**SMS Best Practices:**
- Keep messages under 160 characters when possible
- Include key information only
- Add link for more details
- Use emojis sparingly (✓, 🎉, etc.)

---

## 🎨 User Experience Flow

### Admin Flow:

1. **Setup:**
   - Admin goes to `/platform/settings`
   - Toggles "Enable SMS Notifications"
   - Enters phone number with country code
   - Clicks "Test SMS" to verify
   - Selects preference (Email/SMS/Both) for each notification type
   - Clicks "Save Preferences"

2. **Usage:**
   - When a notification event occurs (e.g., client completes onboarding)
   - System checks admin's preferences
   - If "SMS" or "Both" selected for that event → Sends SMS
   - If "Email" or "Both" selected → Sends email
   - If SMS fails → Falls back to email

### Organization User Flow:

Same as admin, but on `/dashboard/settings` page.

---

## 🔧 How the System Works

### Notification Routing Logic

1. **Event occurs** (e.g., client completes onboarding)
2. **Code calls `sendNotification()`** with:
   - User ID
   - Notification type
   - Email function
   - SMS function
3. **System fetches user preferences** from database
4. **Checks if SMS enabled** and phone number exists
5. **Reads preference** for this notification type
6. **Routes accordingly:**
   - `"email"` → Calls `emailFn()`
   - `"sms"` → Calls `smsFn()`
   - `"both"` → Calls both in parallel
7. **If SMS fails** → Falls back to email

### Preference Storage

Stored as JSONB in database:

```json
{
  "onboarding_invite": "email",
  "onboarding_complete": "sms",
  "todo_approved": "both",
  "todo_completed": "email",
  "all_todos_complete": "both",
  "project_created": "email",
  "task_assigned": "sms"
}
```

---

## 🧪 Testing Guide

### Test Checklist:

- [ ] Install Twilio package
- [ ] Add environment variables
- [ ] Run database migration
- [ ] Verify SMS settings appear on `/platform/settings`
- [ ] Verify SMS settings appear on `/dashboard/settings`
- [ ] Enable SMS notifications
- [ ] Add phone number
- [ ] Test SMS button works
- [ ] Save preferences
- [ ] Trigger an actual notification
- [ ] Verify SMS received based on preference
- [ ] Test "Both" option (receive email + SMS)
- [ ] Test fallback (disable SMS, verify email still works)

### Manual Testing:

```typescript
// In a server action or API route:
import { sendTestSMS } from '@/lib/sms-service';

export async function testSMSAction() {
  const result = await sendTestSMS('+15551234567');
  console.log(result);
}
```

---

## 💰 Cost Considerations

**Twilio Pricing (as of 2025):**
- Phone number: ~$1/month
- Outbound SMS (US): $0.0079 per message
- Outbound SMS (International): Varies by country

**Example costs:**
- 100 notifications/month = $0.79
- 1,000 notifications/month = $7.90
- 10,000 notifications/month = $79.00

**Cost Optimization Tips:**
1. Encourage users to select "SMS" only for urgent notifications
2. Use "Email" for routine updates
3. Reserve "Both" for critical events
4. Monitor usage via Twilio dashboard

---

## 🚨 Troubleshooting

### Issue: Test SMS not sending

**Check:**
1. ✅ Twilio credentials in `.env` are correct
2. ✅ Phone number includes country code (e.g., `+1` for US)
3. ✅ Twilio account has credit
4. ✅ Phone number is verified (for trial accounts)

### Issue: SMS sent but not received

**Check:**
1. ✅ Phone number format is correct
2. ✅ Carrier not blocking messages
3. ✅ Check Twilio logs for delivery status
4. ✅ Try with a different phone number

### Issue: "SMS service not configured" error

**Solution:**
- Verify all 3 environment variables are set:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
- Restart dev server after adding variables

### Issue: Preferences not saving

**Check:**
1. ✅ Database migration ran successfully
2. ✅ User has proper permissions
3. ✅ Check browser console for errors
4. ✅ Verify server action is being called

---

## 📊 Monitoring & Analytics

### Track SMS Usage:

**Via Twilio Dashboard:**
- View all sent messages
- See delivery status
- Check error rates
- Monitor costs

**In Your App:**
Add logging to track:
- Number of SMS sent per notification type
- User preferences distribution
- Fallback to email frequency

### Recommended Metrics:

```typescript
// Add to your analytics:
- SMS delivery rate
- User preference distribution (email vs SMS vs both)
- Most common notification types
- Cost per notification
- SMS failures and fallback rate
```

---

## 🔐 Security & Privacy

### Best Practices:

1. **Phone Number Validation:**
   - Validate format before saving
   - Send verification SMS
   - Allow users to update anytime

2. **Opt-in Required:**
   - SMS disabled by default
   - User must explicitly enable
   - Easy to disable anytime

3. **Privacy:**
   - Phone numbers stored securely
   - Not shared with third parties
   - Users can delete anytime

4. **Compliance:**
   - Follow TCPA regulations (US)
   - Respect opt-out requests
   - Include unsubscribe instructions if needed

---

## 🎯 Next Steps (Optional Enhancements)

### Phase 2 Ideas:

1. **Phone Number Verification:**
   - Send OTP code to verify phone number
   - Add `phone_verified` boolean field
   - Require verification before enabling SMS

2. **Quiet Hours:**
   - Don't send SMS between 10 PM - 8 AM
   - Add `quiet_hours_start` and `quiet_hours_end` fields
   - Automatically defer to email during quiet hours

3. **SMS Delivery Tracking:**
   - Store SMS delivery status
   - Retry failed messages
   - Alert admin if SMS consistently fails

4. **Group Notifications:**
   - Send SMS to multiple users at once
   - Notify entire team of critical events

5. **Custom SMS Templates:**
   - Allow admins to customize SMS text
   - Template variables ({{name}}, {{project}}, etc.)
   - Preview before sending

6. **International Support:**
   - Detect country code
   - Show appropriate format examples
   - Warn about international SMS costs

---

## 📚 Files Reference

### Created Files:
```
lib/sms-service.ts                              - Twilio integration
lib/notification-service.ts                     - Unified routing
db/queries/notification-preferences-queries.ts  - Database ops
actions/notification-preferences-actions.ts     - Server actions
components/settings/sms-notification-settings.tsx - UI component
db/migrations/0031_add_sms_notifications.sql   - Migration
SMS_INTEGRATION_GUIDE.md                        - This document
```

### Modified Files:
```
db/schema/platform-schema.ts                    - Added SMS fields
db/schema/crm-schema.ts                         - Added SMS fields
app/platform/settings/page.tsx                  - Added SMS settings
app/dashboard/settings/page.tsx                 - Added SMS settings
```

### Files to Update (Notification Integration Points):
```
actions/client-onboarding-actions.ts            - Onboarding notifications
actions/onboarding-todos-actions.ts             - To-do notifications
actions/projects-actions.ts                     - Project notifications
actions/project-tasks-actions.ts                - Task notifications (if exists)
```

---

## ✅ Implementation Status

**Core System:** ✅ Complete  
**Database:** ✅ Complete  
**UI Components:** ✅ Complete  
**Documentation:** ✅ Complete  

**Remaining:**
- ⏳ Run database migration on your environment
- ⏳ Add Twilio credentials to environment variables
- ⏳ Integrate `sendNotification()` into existing notification points
- ⏳ Test end-to-end with real phone numbers

---

**Ready to use!** Follow the setup instructions above to get started.

*Last Updated: October 5, 2025*
