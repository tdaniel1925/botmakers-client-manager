# QuickAgent Setup Instructions

## Overview
QuickAgent is now a multi-industry platform. The first industry is "Insurance Agents" for life insurance lead qualification.

## Setup Steps

### 1. Database Schema (✅ Complete)
The `quickagent_industries` table has been created via `npx drizzle-kit push`.

### 2. Industry Record Setup

You have two options:

#### Option A: Run SQL Script (Simpler)
```bash
# From the codespring-boilerplate directory
psql $DATABASE_URL -f scripts/setup-insurance-industry.sql
```

Or run this SQL directly in your database:
```sql
INSERT INTO quickagent_industries (
  slug, name, description, tagline, is_active, config, created_at, updated_at
) VALUES (
  'insurance-agents',
  'QuickAgent for Insurance Agents',
  'AI-powered lead qualification for life insurance agents.',
  'Build Your Lead Qualification Agent in 5 Minutes',
  true,
  '{"builtAgentPurpose": "Lead qualification for life insurance", "builtAgentType": "both"}',
  NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;
```

#### Option B: Run TypeScript Setup Script (Creates Maya)
This creates the industry record AND a full Maya campaign in ClientFlow.

Requirements:
- OPENAI_API_KEY in `.env.local`
- VAPI_API_KEY in `.env.local`
- Server running

```bash
# From the codespring-boilerplate directory
npx tsx scripts/setup-quickagent-maya.ts
```

### 3. Create Maya Campaign Manually (If using Option A)

If you used Option A (SQL script), you'll need to create the Maya setup assistant manually:

1. Go to ClientFlow Platform Admin
2. Create a new organization called "QuickAgent System"
3. Create a new project called "QuickAgent - Insurance Agents"
4. Create a new campaign:
   - Name: "Maya - Insurance Agents"
   - Type: Inbound
   - System Prompt: Copy from `quickagent/lib/industries/insurance.ts` → `generateInsuranceMayaPrompt()`
   - First Message: "Hi! I'm Maya, and I'm excited to help you build your lead qualification agent..."
   - Provider: Vapi
   - Model: gpt-4o
   - Phone: Skip (not needed for setup assistant)
5. Note the campaign ID
6. Update the industry record:
   ```sql
   UPDATE quickagent_industries 
   SET setup_assistant_campaign_id = 'YOUR_CAMPAIGN_ID'
   WHERE slug = 'insurance-agents';
   ```

### 4. Test the Flow

1. **Start QuickAgent Dev Server:**
   ```bash
   cd quickagent
   npm run dev
   ```
   Runs on http://localhost:3001

2. **Ensure ClientFlow is Running:**
   ```bash
   cd codespring-boilerplate
   npm run dev
   ```
   Runs on http://localhost:3000

3. **Test the Flow:**
   - Visit http://localhost:3001
   - Click "Insurance Agents"
   - Click "Build My AI Agent Now"
   - Talk to Maya and complete the setup
   - Check that processing and success pages work
   - Verify the agent was created in ClientFlow

## Architecture

### QuickAgent (http://localhost:3001)
- Industry selection homepage
- Industry-specific landing pages
- Voice interface with Maya (setup assistant)
- Processing page (calls ClientFlow API)
- Success page

### ClientFlow Backend (http://localhost:3000)
- API endpoints under `/api/quickagent/`
- Industries database table
- Phone number provisioning
- Campaign/project/org creation
- Email notifications

## Environment Variables

### QuickAgent (quickagent/.env.local)
```env
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
NEXT_PUBLIC_CLIENTFLOW_API_URL=http://localhost:3000
```

### ClientFlow (codespring-boilerplate/.env.local)
Already configured with:
- DATABASE_URL
- VAPI_API_KEY
- OPENAI_API_KEY
- RESEND_API_KEY
- etc.

## Adding New Industries

1. Create industry config in `quickagent/lib/industries/[industry-name].ts`
2. Add to `quickagent/lib/industries/index.ts`
3. Run setup script or create database record
4. Create Maya campaign for that industry
5. Update homepage to show new industry

## Troubleshooting

### "Industry not found" error
- Make sure the industry record exists in the database
- Check `quickagent_industries` table

### Maya doesn't connect
- Verify VAPI_PUBLIC_KEY is correct
- Check that the setup_assistant_campaign_id is set and valid
- Check browser console for errors

### Agent creation fails
- Check ClientFlow server logs
- Verify all API keys are set
- Check database connection

## Next Steps

1. Set up the industry record (Option A or B above)
2. Test the complete flow
3. Deploy both applications
4. Add more industries as needed

