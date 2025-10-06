# Organization Contacts System - Explained

## What You Asked For

> "Organizations need contact persons (name, phone, email, other info). Organizations can have as many contacts as desired. Contacts can be added from the dashboard. A field is needed to select the organization to associate a contact with. The backend needs a CRM for contacts, but NOT pipelines, workflows, etc. Only projects can have project-related features such as pipelines."

## What We're Building

### Simple Contact Directory for Organizations
Think of this as an **address book** for each organization - NOT a full CRM system.

###Features:
1. **Multiple Contacts Per Organization**
   - Each organization can have unlimited contacts
   - Example: Acme Corp might have:
     - John Smith (CEO, primary contact)
     - Jane Doe (Project Manager)
     - Bob Johnson (Technical Lead)

2. **Full Contact Information**
   - Basic: First name, last name, job title, department
   - Contact: Email, phone, mobile, office phone
   - Address: Full address fields (line 1, line 2, city, state, postal, country)
   - Notes: Freeform text for additional information
   - Primary Contact: One contact can be marked as the main point of contact

3. **Simple Management**
   - Add contacts from organization dashboard
   - Edit contact details
   - Delete contacts (soft delete - just marks as inactive)
   - Search contacts by name, email, or phone

### What This Is NOT

❌ **NO Deal Pipelines** - Those stay in Projects  
❌ **NO Workflow Automation** - That's project-level  
❌ **NO Sales Stages** - Project feature only  
❌ **NO Complex CRM Features** - Just basic contact storage

### Database Structure

```
organizations (existing)
├── id: UUID
├── name: "Acme Corp"
└── ...

organization_contacts (NEW)
├── id: UUID
├── organization_id: UUID → references organizations(id)
├── first_name: "John"
├── last_name: "Smith"
├── job_title: "CEO"
├── department: "Executive"
├── email: "john@acme.com"
├── phone: "+1-555-0100"
├── mobile_phone: "+1-555-0101"
├── office_phone: "+1-555-0102"
├── address fields (line1, line2, city, state, postal, country)
├── notes: "Prefers email contact after 3pm"
├── is_primary: true (only one per org can be primary)
├── is_active: true (soft delete flag)
├── created_by: user_id
└── timestamps (created_at, updated_at)

projects (enhanced)
├── ... (existing fields)
└── primary_contact_id: UUID → optional reference to organization_contacts(id)
```

### User Experience Flow

#### Admin wants to add a contact:

1. **Navigate** to organization detail page (`/dashboard/organizations/acme-corp`)

2. **See contacts section** with all existing contacts displayed as cards:
   ```
   ┌─────────────────────────────────┐
   │ Organization Contacts (3)       │
   │                      [+ Add]    │
   ├─────────────────────────────────┤
   │ [★] John Smith                  │
   │     CEO, Executive              │
   │     ✉ john@acme.com            │
   │     ☎ +1-555-0100              │
   │     📍 New York, NY            │
   │                     [Edit] [🗑] │
   └─────────────────────────────────┘
   ```

3. **Click "+ Add Contact"** → Modal dialog opens with form:
   - First Name * (required)
   - Last Name * (required)
   - Job Title
   - Department
   - Email
   - Phone / Mobile / Office
   - Full Address
   - Notes
   - [ ] Set as primary contact

4. **Submit** → Contact created, appears in list immediately

#### From Projects:
- When creating a project, optionally select a primary contact from the organization's contacts
- This helps track who the main contact is for a specific project

### Key Design Principles

1. **Organization-Scoped**
   - Contacts belong to organizations
   - Can only be managed by users with roles in that organization

2. **Simple & Fast**
   - Single-page form (no wizard)
   - All fields visible at once
   - Quick search and filter

3. **Data Retention**
   - Soft delete (is_active = false) instead of hard delete
   - Prevents losing historical data

4. **Primary Contact Logic**
   - Only ONE contact per org can be marked primary
   - When setting a new primary, system auto-unsets the old one

5. **Self-Healing Integration**
   - All database operations wrapped with automatic error recovery
   - Database connection failures → auto-retry
   - Validation errors → safe defaults
   - Network timeouts → exponential backoff

### Separation from Projects CRM

```
┌─────────────────────────────────────────────┐
│ ORGANIZATION LEVEL                          │
│ ✅ organization_contacts                    │
│    - Simple contact directory               │
│    - Name, phone, email, address           │
│    - No workflows or pipelines             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ PROJECT LEVEL (existing, unchanged)         │
│ ✅ contacts (existing CRM contacts)         │
│ ✅ deals (pipelines, stages, workflows)     │
│ ✅ project tasks & management               │
│ ✅ Full CRM features                        │
└─────────────────────────────────────────────┘
```

**Why separate?**
- **Organizations** = Company-level contacts (address book)
- **Projects** = Deal-level contacts with full CRM pipeline

Example:
- **Organization "Acme Corp"** has 5 contact persons
- **Project "Q4 Marketing Campaign"** has its own CRM contacts & deals with stages

### Authorization & Security

**Who can manage organization contacts?**
- Users with a role in the organization (admin, member, viewer)
- Platform admins

**Permissions:**
- `admin` → Create, edit, delete contacts
- `member` → Create, edit contacts
- `viewer` → View contacts only

### Real-World Example

**Scenario**: You're managing multiple client organizations

**Organization: "Tech Startup Inc"**
Contacts:
- Sarah Johnson (CEO) ⭐ Primary
- Mike Chen (CTO)
- Lisa Rodriguez (Marketing Director)

**Organization: "Enterprise Corp"**
Contacts:
- David Williams (VP of Sales) ⭐ Primary  
- Emily Brown (Operations Manager)
- Chris Taylor (IT Director)
- Amanda Garcia (Finance)

When you create a **Project** for "Tech Startup Inc", you can optionally link it to Sarah Johnson as the primary project contact.

The project itself can still have its own CRM contacts, deals, and pipelines separate from the organization's contact directory.

### Summary

**This system gives you:**
✅ A simple, organized way to store contact information for each organization  
✅ Quick access to who's who in each organization  
✅ Optional linking of contacts to projects  
✅ All without the complexity of pipelines and workflows (which stay in Projects)

**Think of it as:**
- Your **phone contact list** for each organization
- NOT a sales CRM (that's in Projects)

**Does this match what you envisioned?** 🎯
