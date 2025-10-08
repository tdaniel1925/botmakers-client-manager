# Campaign Scheduling UI - Implementation Summary

## Overview

Added **complete UI components** for call scheduling configuration that was previously only available in the backend. Users can now configure when and how outbound calls are made through an intuitive interface.

## What Was Added

### 1. Schedule Configuration Form Component

**File:** `components/voice-campaigns/schedule-config-form.tsx`

A comprehensive form component that allows configuration of:

#### Call Days
- Visual badge selector for days of the week
- Click to toggle days (Mon-Sun)
- Selected days highlighted in blue

#### Call Windows
- Multiple time windows with labels (e.g., "Morning", "Afternoon", "Evening")
- Time picker for start and end times
- Add/remove windows dynamically
- Each window has a custom label

#### Quick Presets
Three one-click presets for common scenarios:
- **Business Hours** - Mon-Fri, 9 AM-12 PM & 1 PM-5 PM, 3 attempts, 24h between
- **Aggressive** - Mon-Sat, 9 AM-8 PM (3 windows), 5 attempts, 12h between
- **Gentle** - Tue-Thu, 10 AM-12 PM & 2 PM-4 PM, 2 attempts, 48h between

#### Advanced Settings
- **Respect Timezones** - Toggle to call contacts in their local business hours
- **Max Attempts** - Number of times to attempt calling each contact (1-10)
- **Time Between Attempts** - Minimum hours between retry attempts (1-168)
- **Max Concurrent Calls** - Maximum simultaneous active calls (1-100)

#### Display Modes
- **Full Mode** - Complete form with all options (default)
- **Compact Mode** - Simplified view for tight spaces (only shows max attempts, time between, and timezone toggle)

#### Smart Display
- Only shows for **outbound** or **both** campaign types
- Shows info alert for inbound-only campaigns

---

### 2. Campaign Wizard Integration

**File:** `components/voice-campaigns/campaign-wizard.tsx`

#### Changes
- Added `ScheduleConfig` state with default business hours configuration
- Imported `ScheduleConfigForm` component
- Added schedule configuration section in the questions step
- Shows scheduling form conditionally (only for outbound/both campaigns)
- Passes `schedule_config` to campaign creation action

#### User Experience
1. User answers campaign setup questions
2. Selects phone number
3. **NEW:** Configures call scheduling (if outbound/both)
4. Proceeds to AI generation

#### Code Snippet
```typescript
{/* Call Scheduling Configuration */}
{(answers.campaign_type === "outbound" || answers.campaign_type === "both") && (
  <div className="border-t pt-6">
    <ScheduleConfigForm
      value={scheduleConfig}
      onChange={setScheduleConfig}
      campaignType={answers.campaign_type}
    />
  </div>
)}
```

---

### 3. Campaign Settings Dialog Integration

**File:** `components/voice-campaigns/campaign-settings-dialog-enhanced.tsx`

#### Changes
- Added `ScheduleConfig` state
- Imported `ScheduleConfigForm` component
- Added new "Schedule" tab to settings dialog (with Calendar icon)
- Updated tab grid from 5 to 6 columns
- Loads existing schedule configuration from campaign
- Saves schedule configuration when updating campaign

#### New Tab Structure
1. Basic (Settings icon)
2. Agent (MessageSquare icon)
3. Voice (Mic icon)
4. Data (Database icon)
5. **Schedule (Calendar icon)** ← NEW
6. Advanced (Code icon)

#### User Experience
1. Open campaign settings
2. Click "Schedule" tab
3. Modify scheduling configuration
4. Click "Save Changes"
5. Configuration synced to database and provider

---

### 4. Backend Updates

**File:** `actions/voice-campaign-actions.ts`

#### createVoiceCampaignAction
- Added `scheduleConfig: setupAnswers.schedule_config` to campaign creation
- Schedule configuration stored in database when campaign is created

#### updateCampaignConfigAction
- Added `scheduleConfig?: any` to config interface
- Added `if (config.scheduleConfig !== undefined) dbUpdates.scheduleConfig = config.scheduleConfig;`
- Schedule configuration updated when campaign settings are saved

---

## Configuration Structure

The schedule configuration is stored as JSONB in the database with this structure:

```typescript
interface ScheduleConfig {
  callDays: string[];                    // e.g., ["Monday", "Tuesday", "Wednesday"]
  callWindows: Array<{
    start: string;                       // e.g., "09:00"
    end: string;                         // e.g., "17:00"
    label: string;                       // e.g., "Morning"
  }>;
  respectTimezones: boolean;             // Call in contact's local timezone
  maxAttemptsPerContact: number;         // Max retry attempts (1-10)
  timeBetweenAttempts: number;           // Hours between attempts (1-168)
  maxConcurrentCalls: number;            // Max simultaneous calls (1-100)
}
```

### Example Configuration

```json
{
  "callDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "callWindows": [
    { "start": "09:00", "end": "12:00", "label": "Morning" },
    { "start": "13:00", "end": "17:00", "label": "Afternoon" }
  ],
  "respectTimezones": true,
  "maxAttemptsPerContact": 3,
  "timeBetweenAttempts": 24,
  "maxConcurrentCalls": 10
}
```

---

## How It Works

### 1. Creating a Campaign
1. User selects campaign type (outbound or both)
2. Scheduling form appears in wizard
3. User configures or uses a preset
4. Schedule saved when campaign is created
5. Backend scheduler uses this config to make calls

### 2. Editing Campaign Schedule
1. User opens campaign settings
2. Clicks "Schedule" tab
3. Modifies configuration
4. Saves changes
5. Active campaigns use new schedule immediately

### 3. Backend Scheduling (Already Implemented)
- **File:** `lib/campaign-scheduler.ts`
- `isWithinCallingHours()` - Checks if current time is within configured windows
- `getContactsReadyForCalling()` - Filters contacts based on schedule
- `processOutboundCalls()` - Main scheduler function (called by cron job)
- Respects timezones, call windows, retry limits, etc.

---

## Default Configuration

If no schedule is configured, the system uses these defaults:

```typescript
{
  callDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  callWindows: [
    { start: "09:00", end: "12:00", label: "Morning" },
    { start: "13:00", end: "17:00", label: "Afternoon" }
  ],
  respectTimezones: true,
  maxAttemptsPerContact: 3,
  timeBetweenAttempts: 24,
  maxConcurrentCalls: 10
}
```

This represents standard business hours with reasonable retry limits.

---

## Features Checklist

✅ **Schedule Configuration Form**
- Visual day selector
- Dynamic call windows
- Quick presets (Business, Aggressive, Gentle)
- Advanced settings (attempts, delays, concurrency)
- Responsive and intuitive UI

✅ **Campaign Wizard Integration**
- Appears in questions step
- Only for outbound/both campaigns
- Passed to campaign creation

✅ **Settings Dialog Integration**
- New "Schedule" tab
- Calendar icon
- Edit existing schedules
- Saves to database

✅ **Backend Integration**
- Campaign creation saves config
- Campaign updates save config
- Scheduler uses config (already implemented)

✅ **Smart Display**
- Only shows for relevant campaign types
- Informative alerts
- Helpful descriptions

---

## User Scenarios

### Scenario 1: Standard Business Campaign
**Goal:** Call leads Mon-Fri during business hours

1. Create outbound campaign
2. Use "Business Hours" preset
3. Launch campaign
4. System calls 9 AM-12 PM & 1 PM-5 PM, Mon-Fri only

### Scenario 2: Aggressive Sales Campaign
**Goal:** Maximum outreach, including Saturdays

1. Create outbound campaign
2. Use "Aggressive" preset
3. Adjust to add Sunday if needed
4. Launch campaign
5. System makes up to 5 attempts per contact with 12h delays

### Scenario 3: Gentle Follow-up Campaign
**Goal:** Non-intrusive follow-ups mid-week

1. Create outbound campaign
2. Use "Gentle" preset
3. Launch campaign
4. System calls Tue-Thu, 10 AM-12 PM & 2 PM-4 PM only, max 2 attempts

### Scenario 4: Custom Schedule
**Goal:** Specific call windows matching team availability

1. Create outbound campaign
2. Clear default windows
3. Add custom windows:
   - "Early": 8 AM-10 AM
   - "Lunch Break": 12 PM-1 PM
   - "Late Afternoon": 4 PM-6 PM
4. Select specific days
5. Adjust attempts and delays
6. Launch campaign

---

## Testing Checklist

### Campaign Wizard
- [ ] Schedule form appears for outbound campaigns
- [ ] Schedule form appears for both campaigns
- [ ] Schedule form does NOT appear for inbound campaigns
- [ ] Quick presets work and populate all fields
- [ ] Can toggle days on/off
- [ ] Can add/remove call windows
- [ ] Time pickers work correctly
- [ ] Advanced settings update values
- [ ] Schedule config saved to database on campaign creation

### Campaign Settings
- [ ] Schedule tab appears in settings dialog
- [ ] Existing schedule loads correctly
- [ ] Can modify all schedule fields
- [ ] Changes save to database
- [ ] Schedule config persists after page refresh

### Edge Cases
- [ ] Switching campaign type from inbound to outbound shows schedule form
- [ ] Switching from outbound to inbound hides/disables schedule
- [ ] Can't add invalid time windows (start > end)
- [ ] At least one day must be selected
- [ ] At least one call window must exist
- [ ] Numeric fields enforce min/max limits

---

## Future Enhancements

### Potential Additions
- [ ] **Timezone Preview** - Show "Currently X:XX PM in ET" for selected timezones
- [ ] **Schedule Visualization** - Calendar view of configured call times
- [ ] **Schedule Templates** - Save and reuse custom schedules across campaigns
- [ ] **Holiday Exclusions** - Don't call on specific dates
- [ ] **A/B Testing** - Test different schedules to optimize answer rates
- [ ] **Per-Contact Preferences** - Honor individual "do not call before/after" times
- [ ] **Schedule Analytics** - Show best performing call windows
- [ ] **Smart Scheduling** - AI-suggested optimal call times based on contact data

---

## Related Files

### Components
- `components/voice-campaigns/schedule-config-form.tsx` - Main form component
- `components/voice-campaigns/campaign-wizard.tsx` - Wizard integration
- `components/voice-campaigns/campaign-settings-dialog-enhanced.tsx` - Settings integration

### Backend
- `actions/voice-campaign-actions.ts` - Campaign CRUD with schedule config
- `lib/campaign-scheduler.ts` - Scheduler service (uses config)
- `db/schema/voice-campaigns-schema.ts` - Database schema (scheduleConfig field)

### Documentation
- `IMPLEMENTATION_COMPLETE.md` - Original backend implementation docs
- `CAMPAIGN_FEATURES_IMPLEMENTATION.md` - Feature implementation status
- `CAMPAIGN_SCHEDULING_UI.md` - This file

---

## Summary

The campaign scheduling feature now has a **complete user-facing UI** that allows users to:
- Configure when calls should be made (days and time windows)
- Control retry behavior (attempts and delays)
- Manage call volume (concurrent calls)
- Use quick presets or create custom schedules

This bridges the gap between the powerful backend scheduling engine and user control, making the entire system fully functional and user-friendly.

🎉 **Scheduling UI: COMPLETE**

