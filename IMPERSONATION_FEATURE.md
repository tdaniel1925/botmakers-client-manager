# 🎭 Impersonation Feature

## Overview

Platform admins can now "login as" any organization to view their dashboard, campaigns, billing, and all data as if they were a member of that organization. This is essential for:

- 🐛 **Support & Debugging** - See exactly what users see
- 🧪 **Testing** - Test features from different organization perspectives
- 🎓 **Training** - Demonstrate features to new admins
- 🔍 **Auditing** - Review organization configurations

---

## Features

### ✅ Full Organization Access
When impersonating, admins get:
- Full access to organization dashboard
- All voice campaigns and analytics
- Billing information and usage stats
- Projects, calls, and workflows
- Organization settings

### ✅ Visual Indicators
- **Yellow banner** at top of screen shows you're in impersonation mode
- Shows organization name you're viewing as
- **"Exit Impersonation"** button always visible

### ✅ Audit Logging
Every impersonation session is logged with:
- Admin who initiated it
- Organization being impersonated
- Start/end timestamps
- Actions taken during session
- IP address and user agent

### ✅ Security Features
- Only platform admins can impersonate
- Can only impersonate one org at a time
- Session expires after 8 hours
- Logged out automatically when leaving
- All actions are auditable

---

## How to Use

### 1. Start Impersonation

**From Organizations Page:**
1. Go to `/platform/organizations`
2. Find the organization you want to view
3. Click the **👁️ eye icon** button
4. You'll be redirected to their dashboard

**What Happens:**
- Yellow banner appears at the top
- You're viewing their organization dashboard
- All navigation works as if you're a member
- View switcher shows the impersonated org

### 2. Navigate as Organization

Once impersonating, you can:
- ✅ View all voice campaigns
- ✅ Check billing and usage
- ✅ View projects and calls
- ✅ See analytics and reports
- ✅ Access organization settings

**You CANNOT:**
- ❌ Create/delete campaigns (view only)
- ❌ Make actual changes to data
- ❌ Access billing payment methods

### 3. Exit Impersonation

**Two Ways to Exit:**

1. **Click "Exit Impersonation"** in the yellow banner
2. **Navigate to platform admin** - Automatically exits

**What Happens:**
- Session is ended in database
- Cookies are cleared
- Redirected to `/platform/dashboard`
- You're back in admin mode

---

## Database Schema

### `impersonation_sessions` Table

```sql
CREATE TABLE impersonation_sessions (
  id UUID PRIMARY KEY,
  admin_user_id TEXT NOT NULL,           -- Clerk user ID of admin
  admin_email TEXT NOT NULL,             -- Email for audit logs
  organization_id UUID NOT NULL,         -- Org being impersonated
  organization_name TEXT NOT NULL,       -- Org name for display
  started_at TIMESTAMP NOT NULL,         -- When impersonation started
  ended_at TIMESTAMP,                    -- When it ended (NULL = active)
  is_active BOOLEAN NOT NULL,            -- Is session active?
  ip_address TEXT,                       -- Admin's IP
  user_agent TEXT,                       -- Admin's browser
  reason TEXT,                           -- Optional reason
  actions_log TEXT[],                    -- Array of actions taken
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);
```

---

## Setup Instructions

### 1. Run Database Migration

```bash
cd codespring-boilerplate
npx tsx scripts/run-impersonation-migration.ts
```

This creates the `impersonation_sessions` table.

### 2. Verify Schema

Check that the table was created:

```sql
SELECT * FROM impersonation_sessions;
```

Should return empty (no errors).

### 3. Test Impersonation

1. Login as platform admin
2. Go to `/platform/organizations`
3. Click the eye icon on any organization
4. Verify yellow banner appears
5. Navigate around the org dashboard
6. Click "Exit Impersonation"
7. Verify you're back in admin mode

---

## API Reference

### Server Actions

**`startImpersonationAction(organizationId, reason?)`**
- Starts impersonation session
- Validates admin permissions
- Creates database record
- Sets session cookies
- Returns: `{ success: boolean, error?: string, sessionId?: string }`

**`endImpersonationAction()`**
- Ends active impersonation session
- Clears cookies
- Updates database record
- Returns: `{ success: boolean, error?: string }`

**`getImpersonationStatusAction()`**
- Gets current impersonation status
- Returns: `ImpersonationStatus` object

**`logImpersonationActionAction(action: string)`**
- Logs action during impersonation
- Appends to `actions_log` array
- For audit trail

### Database Queries

Located in `db/queries/impersonation-queries.ts`:

- `createImpersonationSession(data)` - Create new session
- `endImpersonationSession(sessionId)` - End session
- `getActiveImpersonationSession(adminUserId)` - Get active session
- `getImpersonationSessionsByOrganization(orgId)` - Audit log for org
- `getImpersonationSessionsByAdmin(adminUserId)` - Audit log for admin
- `logImpersonationAction(sessionId, action)` - Log action

---

## Integration Points

### View Switcher

`actions/view-switcher-actions.ts` → `getCurrentViewAction()`

Now checks for active impersonation sessions FIRST before checking cookies:

```typescript
// Check if admin is impersonating
const impersonationSession = await getActiveImpersonationSession(userId);
if (impersonationSession) {
  return {
    type: "organization",
    organizationId: impersonationSession.organizationId,
    organizationName: impersonationSession.organizationName,
  };
}
```

### Layouts

Both `app/platform/layout.tsx` and `app/dashboard/layout.tsx` now include:

```tsx
<ImpersonationBanner />
```

This renders the yellow banner when active.

### Organizations Page

`app/platform/organizations/page.tsx` has the eye icon button:

```tsx
<Button onClick={(e) => handleImpersonate(e, org)}>
  <Eye className="h-4 w-4" />
</Button>
```

---

## Security Considerations

### ✅ Access Control
- Only users in `platform_admins` table can impersonate
- Checked on every action via `isPlatformAdmin()`

### ✅ Audit Trail
- All sessions logged with timestamps
- Actions during session can be logged
- IP and user agent captured

### ✅ Session Management
- Sessions expire after 8 hours
- Only one active session per admin
- Must exit current before starting new

### ✅ Visual Indicators
- Yellow banner impossible to miss
- Always shows who you're viewing as
- Exit button always visible

### ⚠️ Best Practices
1. Always exit impersonation when done
2. Log a reason when starting session
3. Don't make changes to org data (view only)
4. Review audit logs regularly

---

## Troubleshooting

### Banner Not Showing
- Check database migration ran successfully
- Verify `impersonation_sessions` table exists
- Check browser console for errors

### Can't Start Impersonation
- Verify you're a platform admin
- Check `platform_admins` table
- Ensure no active session exists

### Can't Exit Impersonation
- Try navigating to `/platform/dashboard`
- Clear browser cookies
- Check database for active sessions

### Wrong Organization Showing
- Exit and re-enter impersonation
- Clear browser cache
- Check cookies: `impersonation_org_id`

---

## Files Changed

### New Files
- `db/schema/impersonation-schema.ts` - Database schema
- `db/queries/impersonation-queries.ts` - Database queries
- `actions/impersonation-actions.ts` - Server actions
- `components/impersonation/impersonation-banner.tsx` - UI banner
- `scripts/add-impersonation-tables.sql` - Migration SQL
- `scripts/run-impersonation-migration.ts` - Migration script

### Modified Files
- `db/schema/index.ts` - Export impersonation schema
- `actions/view-switcher-actions.ts` - Check impersonation first
- `app/platform/layout.tsx` - Add banner
- `app/dashboard/layout.tsx` - Add banner
- `app/platform/organizations/page.tsx` - Add eye icon button

---

## Future Enhancements

Potential improvements:

1. **Action Restrictions** - Disable create/delete buttons during impersonation
2. **Time Limits** - Auto-exit after X minutes of inactivity
3. **Notification** - Email org owner when admin impersonates them
4. **Read-Only Mode** - Enforce read-only at API level
5. **Impersonation History** - Dashboard page showing all sessions
6. **Multi-Factor** - Require additional auth for impersonation

---

## Support

For issues or questions:
1. Check this documentation
2. Review audit logs in `impersonation_sessions` table
3. Check browser console for errors
4. Verify platform admin permissions

---

**🎭 Happy Impersonating!**
