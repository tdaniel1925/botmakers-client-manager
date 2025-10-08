# Quick Start Guide: Campaign Features

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install papaparse xlsx
npm install -D @types/papaparse
```

### Step 2: Run Database Migration
```bash
# Apply the migration
npx drizzle-kit push

# OR manually via psql
psql -d your_database -f db/migrations/add-campaign-features.sql
```

### Step 3: Verify Installation

Check that new tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN (
  'campaign_contacts',
  'campaign_contact_uploads',
  'campaign_message_templates',
  'campaign_messaging_config',
  'campaign_message_log'
);
```

---

## 📋 Basic Usage

### 1. Create a Campaign (Now with Pending Status)

When you create a campaign via the wizard, it will automatically be in **pending** status. You must launch it manually.

```typescript
// Campaign is created with status: "pending" and isActive: false
// User sees "Launch Campaign" button
```

### 2. Upload Contact List

Add to your campaign detail page:

```tsx
import { ContactListUpload } from "@/components/voice-campaigns/contact-list-upload";

<ContactListUpload
  campaignId={campaign.id}
  onUploadComplete={(stats) => {
    console.log("Uploaded:", stats);
    // Refresh the page to show updated contact count
  }}
/>
```

### 3. View Campaign Summary

```tsx
import { CampaignSummary } from "@/components/voice-campaigns/campaign-summary";

<CampaignSummary campaign={campaign} />
```

### 4. Launch Campaign

```tsx
import { LaunchCampaignDialog } from "@/components/voice-campaigns/launch-campaign-dialog";

<LaunchCampaignDialog
  campaign={campaign}
  onLaunched={() => router.refresh()}
/>
```

---

## 🎯 Complete Integration Example

Here's a complete campaign detail page with all features:

```tsx
// app/dashboard/campaigns/[id]/page.tsx
import { getCampaignById } from "@/db/queries/voice-campaigns-queries";
import { ContactListUpload } from "@/components/voice-campaigns/contact-list-upload";
import { CampaignSummary } from "@/components/voice-campaigns/campaign-summary";
import { LaunchCampaignDialog } from "@/components/voice-campaigns/launch-campaign-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const campaign = await getCampaignById(params.id);
  
  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Launch Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{campaign.name}</h1>
          <p className="text-muted-foreground">{campaign.description}</p>
        </div>
        <LaunchCampaignDialog campaign={campaign} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <CampaignSummary campaign={campaign} />
        </TabsContent>

        <TabsContent value="contacts">
          <ContactListUpload campaignId={campaign.id} />
        </TabsContent>

        <TabsContent value="messages">
          {/* Add MessageTemplateForm here */}
        </TabsContent>

        <TabsContent value="settings">
          {/* Campaign settings */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 🔄 Campaign Lifecycle

```
CREATE → pending (not active)
   ↓
UPLOAD CONTACTS → contacts added with timezone data
   ↓
REVIEW SUMMARY → see timezone distribution
   ↓
LAUNCH → pending → active (becomes active)
   ↓
SCHEDULER RUNS → calls placed based on schedule & timezone
   ↓
PAUSE (optional) → active → paused
   ↓
RESUME (optional) → paused → active
   ↓
COMPLETE → active → completed
```

---

## 📊 API Reference

### Actions

```typescript
// Campaign Contacts
await processContactListAction({ campaignId, fileName, parsedRows, ... });
await getCampaignContactsAction(campaignId);
await getCampaignContactStatsAction(campaignId);
await getCampaignContactUploadsAction(campaignId);

// Campaign Control
await launchCampaignAction(campaignId);
await pauseCampaignAction(campaignId);
await resumeCampaignAction(campaignId);
```

### Utilities

```typescript
// Timezone Mapping
import { 
  getTimezoneFromPhoneNumber,
  calculateTimezoneSummary,
  formatPhoneNumber
} from "@/lib/timezone-mapper";

const tz = getTimezoneFromPhoneNumber("+12125551234");
const summary = calculateTimezoneSummary(phoneNumbers);
const formatted = formatPhoneNumber("2125551234"); // +12125551234
```

```typescript
// CSV Parsing
import { parseContactFile, suggestColumnMapping } from "@/lib/csv-parser";

const data = await parseContactFile(file);
const mapping = suggestColumnMapping(data.headers);
```

```typescript
// Scheduling
import { processOutboundCalls, isWithinCallingHours } from "@/lib/campaign-scheduler";

const stats = await processOutboundCalls(campaignId);
const canCall = isWithinCallingHours("ET", scheduleConfig);
```

---

## 🎨 Customization

### Modify Timezone Colors

Edit `components/voice-campaigns/campaign-summary.tsx`:

```typescript
const TIMEZONE_COLORS: Record<string, string> = {
  ET: "bg-blue-100 text-blue-800 border-blue-200",
  CT: "bg-green-100 text-green-800 border-green-200",
  // ... customize as needed
};
```

### Adjust Schedule Defaults

Edit `lib/campaign-scheduler.ts`:

```typescript
const scheduleConfig: ScheduleConfig = {
  callDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  callWindows: [
    { start: "09:00", end: "12:00", label: "Morning" },
    { start: "13:00", end: "17:00", label: "Afternoon" }
  ],
  maxConcurrentCalls: 10, // Adjust based on your needs
};
```

---

## 🐛 Troubleshooting

### Migration Fails

```bash
# Check if tables already exist
psql -d your_database -c "\dt campaign_*"

# Drop and recreate if needed (BE CAREFUL - DELETES DATA)
# psql -d your_database -c "DROP TABLE IF EXISTS campaign_contacts CASCADE;"
```

### Contact Upload Not Working

1. Check file format (CSV, XLSX, XLS)
2. Verify phone numbers are in valid format
3. Check browser console for errors
4. Verify `papaparse` and `xlsx` are installed

### Timezone Not Detected

```typescript
// Test timezone detection
import { getTimezoneFromPhoneNumber } from "@/lib/timezone-mapper";

const result = getTimezoneFromPhoneNumber("+12125551234");
console.log(result); // Should show ET timezone
```

---

## 📞 Next Steps

1. **Set up Cron Job** for outbound call processing
2. **Customize message templates** for your use case
3. **Add schedule configuration UI** for visual editing
4. **Integrate with Vapi outbound API** when available
5. **Build contact management UI** for editing contacts

---

## ✅ Checklist

- [x] Dependencies installed (`papaparse`, `xlsx`)
- [x] Database migration applied
- [x] Components imported in pages
- [x] Campaign creation tested
- [x] Contact upload tested
- [x] Launch confirmation tested
- [x] Summary page displays correctly

---

**Everything is ready to go! 🎉**

See `CAMPAIGN_FEATURES_IMPLEMENTATION.md` for comprehensive documentation.
