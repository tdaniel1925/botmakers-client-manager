# Self-Healing System - Integration Guide

**Status:** Ready to integrate with existing code  
**Estimated Time:** 1-2 hours  
**Impact:** Automatic error recovery across entire application

---

## Quick Start

The self-healing system is fully operational. To enable automatic error recovery in your code, wrap functions with `withSelfHealing()`.

### Example: Wrap a Server Action

```typescript
// Before:
export async function createContactAction(data: ContactData) {
  const { userId } = await auth();
  // ... rest of function
}

// After:
import { withSelfHealing } from '@/lib/self-healing/error-interceptor';

export const createContactAction = withSelfHealing(
  async function createContactAction(data: ContactData) {
    const { userId } = await auth();
    // ... rest of function (unchanged)
  },
  { source: 'createContactAction', category: 'database' }
);
```

### Example: Wrap an API Route

```typescript
// Before:
export async function POST(request: Request) {
  // ... your code
}

// After:
import { withSelfHealing } from '@/lib/self-healing/error-interceptor';

export const POST = withSelfHealing(
  async function POST(request: Request) {
    // ... your code (unchanged)
  },
  { source: 'api/onboarding/invite', category: 'api' }
);
```

---

## Categories

Choose the appropriate category for your function:

| Category | When to Use | Examples |
|----------|-------------|----------|
| `'database'` | Database queries, ORM operations | Contacts, deals, projects CRUD |
| `'api'` | External API calls | OpenAI, Resend, Twilio, UploadThing |
| `'runtime'` | General application logic | Business logic, calculations |
| `'performance'` | Performance-sensitive operations | Large data processing |

---

## Priority Actions to Wrap

### High Priority (Critical User Paths)

1. **Credits System** - `actions/credits-actions.ts`
   ```typescript
   export const useCredits = withSelfHealing(
     async function useCredits(...) { /* ... */ },
     { source: 'useCredits', category: 'database' }
   );
   ```

2. **Contacts** - `actions/contacts-actions.ts`
   - createContactAction
   - updateContactAction
   - deleteContactAction
   - getContactsAction

3. **Deals** - `actions/deals-actions.ts`
   - createDealAction
   - updateDealAction
   - moveDealAction

4. **Projects** - `actions/projects-actions.ts`
   - createProjectAction
   - updateProjectAction
   - getProjectByIdAction

5. **Client Onboarding** - `actions/client-onboarding-actions.ts`
   - startOnboardingAction
   - completeOnboardingAction
   - saveStepResponseAction

### Medium Priority (Admin Functions)

6. **Organizations** - `actions/organizations-actions.ts`
7. **Activities** - `actions/activities-actions.ts`
8. **Analytics** - `actions/analytics-actions.ts`
9. **Task Generation** - `actions/task-generation-actions.ts`
10. **Support** - `actions/support-actions.ts`

### API Routes to Wrap

1. **`app/api/onboarding/invite/route.ts`**
2. **`app/api/onboarding/session/[token]/route.ts`**
3. **`app/api/test-email/route.ts`**
4. **`app/api/seed-templates/route.ts`**

---

## Step-by-Step Integration Process

### Step 1: Add Import Statement

At the top of each action file:

```typescript
import { withSelfHealing } from '@/lib/self-healing/error-interceptor';
```

### Step 2: Wrap Each Function

**Pattern A: For exported async functions**

```typescript
// Original:
export async function myAction(arg1, arg2) {
  // function body
}

// Wrapped:
export const myAction = withSelfHealing(
  async function myAction(arg1, arg2) {
    // function body (unchanged)
  },
  { source: 'myAction', category: 'database' }
);
```

**Pattern B: For functions assigned to const**

```typescript
// Original:
const myAction = async (arg1, arg2) => {
  // function body
};
export { myAction };

// Wrapped:
const myAction = withSelfHealing(
  async (arg1, arg2) => {
    // function body (unchanged)
  },
  { source: 'myAction', category: 'database' }
);
export { myAction };
```

### Step 3: Choose Correct Category

- **Database operations**: `category: 'database'`
- **External APIs**: `category: 'api'`
- **Business logic**: `category: 'runtime'`
- **Heavy processing**: `category: 'performance'`

### Step 4: Test the Integration

1. Trigger an error in the wrapped function
2. Check `/platform/system-health` dashboard
3. Verify healing event was logged
4. Confirm AI analyzed the error
5. Check if healing was attempted

---

## Example: Complete File Integration

### Before: `actions/contacts-actions.ts`

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";
import { createContact, updateContact } from "@/db/queries/contacts-queries";

export async function createContactAction(data: ContactData) {
  const { userId } = await auth();
  if (!userId) {
    return { isSuccess: false, message: "Unauthorized" };
  }
  
  const contact = await createContact(data);
  return { isSuccess: true, data: contact };
}

export async function updateContactAction(id: string, data: ContactData) {
  const { userId } = await auth();
  if (!userId) {
    return { isSuccess: false, message: "Unauthorized" };
  }
  
  const contact = await updateContact(id, data);
  return { isSuccess: true, data: contact };
}
```

### After: `actions/contacts-actions.ts`

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";
import { createContact, updateContact } from "@/db/queries/contacts-queries";
import { withSelfHealing } from '@/lib/self-healing/error-interceptor'; // ✅ Added

export const createContactAction = withSelfHealing( // ✅ Wrapped
  async function createContactAction(data: ContactData) {
    const { userId } = await auth();
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const contact = await createContact(data);
    return { isSuccess: true, data: contact };
  },
  { source: 'createContactAction', category: 'database' } // ✅ Config
);

export const updateContactAction = withSelfHealing( // ✅ Wrapped
  async function updateContactAction(id: string, data: ContactData) {
    const { userId } = await auth();
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const contact = await updateContact(id, data);
    return { isSuccess: true, data: contact };
  },
  { source: 'updateContactAction', category: 'database' } // ✅ Config
);
```

---

## Environment Setup

Ensure you have these environment variables:

```bash
# Required for AI analysis (already exists)
OPENAI_API_KEY=sk-...

# Required for health check cron (add this)
CRON_SECRET=your-secret-key-here
```

Generate a CRON_SECRET:
```bash
openssl rand -base64 32
```

Or use any random string generator online.

---

## What Happens When an Error Occurs?

1. **Error Captured** - `withSelfHealing()` catches the error
2. **AI Analysis** - OpenAI GPT-4 analyzes the error (or rule-based fallback)
3. **Strategy Selection** - System picks best healing strategy (10 available)
4. **Healing Attempt** - Strategy executes automatically
5. **Result Logging** - Everything logged to database
6. **Pattern Learning** - System learns from success/failure
7. **Admin Notification** - If critical or failed, admins are notified
8. **Return Value** - If healing succeeds, returns healed data; if fails, original error thrown

---

## Testing Your Integration

### Manual Test

1. **Create a test error:**
```typescript
export const testAction = withSelfHealing(
  async function testAction() {
    throw new Error('Test error for self-healing system');
  },
  { source: 'testAction', category: 'runtime' }
);
```

2. **Call the action** from a page

3. **Check dashboard** at `/platform/system-health`

4. **Verify:**
   - Event appears in activity feed
   - AI analysis shows diagnosis
   - Healing strategy was attempted
   - Duration is logged

### Automated Test

```typescript
// Create a test route: app/api/test-healing/route.ts
import { withSelfHealing } from '@/lib/self-healing/error-interceptor';

export const GET = withSelfHealing(
  async function GET(request: Request) {
    // Simulate different error types
    const type = new URL(request.url).searchParams.get('type');
    
    if (type === 'database') {
      throw new Error('Connection timeout');
    }
    if (type === 'api') {
      throw new Error('Rate limit exceeded');
    }
    
    return Response.json({ success: true });
  },
  { source: 'test-healing-api', category: 'api' }
);
```

Then visit:
- `/api/test-healing?type=database`
- `/api/test-healing?type=api`

---

## Performance Impact

- **Overhead:** ~50-200ms per error (only when errors occur)
- **Success Path:** ~0ms (no overhead if no errors)
- **Health Checks:** Run every 2 minutes via cron (minimal impact)
- **AI Analysis:** Async, doesn't block user experience

---

## Best Practices

### ✅ DO:
- Wrap critical user-facing actions
- Wrap external API calls
- Wrap database operations
- Use descriptive source names
- Choose accurate categories

### ❌ DON'T:
- Wrap simple getters (no errors expected)
- Wrap already-wrapped functions (double wrapping)
- Use generic source names like 'action1'
- Wrap every single tiny function (overhead)

---

## Integration Checklist

Use this checklist to track your progress:

### Actions Files
- [ ] `actions/credits-actions.ts` - 2 functions
- [ ] `actions/contacts-actions.ts` - 5 functions
- [ ] `actions/deals-actions.ts` - 6 functions
- [ ] `actions/projects-actions.ts` - 8 functions
- [ ] `actions/client-onboarding-actions.ts` - 4 functions
- [ ] `actions/activities-actions.ts` - 5 functions
- [ ] `actions/organizations-actions.ts` - 6 functions
- [ ] `actions/analytics-actions.ts` - 3 functions
- [ ] `actions/task-generation-actions.ts` - 2 functions
- [ ] `actions/support-actions.ts` - 5 functions
- [ ] `actions/reminder-actions.ts` - 2 functions
- [ ] `actions/template-actions.ts` - 4 functions
- [ ] `actions/branding-actions.ts` - 3 functions
- [ ] `actions/manual-onboarding-actions.ts` - 5 functions

### API Routes
- [ ] `app/api/onboarding/invite/route.ts`
- [ ] `app/api/onboarding/session/[token]/route.ts`
- [ ] `app/api/test-email/route.ts`
- [ ] `app/api/seed-templates/route.ts`

### Testing
- [ ] Create test error in wrapped function
- [ ] Verify event appears in dashboard
- [ ] Confirm AI analysis ran
- [ ] Check healing strategy was applied
- [ ] Verify admin notification (if critical)
- [ ] Test with real errors in production

---

## Quick Reference

### Import Statement
```typescript
import { withSelfHealing } from '@/lib/self-healing/error-interceptor';
```

### Wrapping Pattern
```typescript
export const myAction = withSelfHealing(
  async function myAction(args) { /* ... */ },
  { source: 'myAction', category: 'database' }
);
```

### Categories
- `'database'` - Database operations
- `'api'` - External API calls
- `'runtime'` - Business logic
- `'performance'` - Heavy processing

### Dashboard URL
```
/platform/system-health
```

---

## Support

If you encounter issues:

1. Check `/platform/system-health` for error details
2. Review healing event logs
3. Verify `OPENAI_API_KEY` is set (for AI analysis)
4. Verify `CRON_SECRET` is set (for health checks)
5. Check browser console for client-side errors
6. Check server logs for detailed error messages

---

**Ready to integrate?** Start with the high-priority actions and test each one before moving to the next!
