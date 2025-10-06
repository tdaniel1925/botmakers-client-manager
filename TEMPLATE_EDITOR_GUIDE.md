# Template Editor System - Complete Guide

## Overview

The Template Editor System provides a powerful, user-friendly interface for platform admins to customize all email and SMS notification templates used throughout ClientFlow. Templates support dynamic variables, rich text editing, live previews, and test sending.

## Key Features

### ✅ Dual Editor Modes
- **Visual Editor**: WYSIWYG rich text editor (TipTap) for emails
- **Code Editor**: Monaco Editor (VS Code) for HTML/text editing with syntax highlighting

### ✅ Live Previews
- **Email Preview**: Desktop and mobile responsive preview with iframe rendering
- **SMS Preview**: Realistic iPhone mockup with character counting and multi-message detection

### ✅ Variable System
- Dynamic variable substitution using `{{variableName}}` syntax
- Dropdown insertion for easy variable placement
- Sample data testing for realistic previews

### ✅ Test Sending
- Send test emails to any address
- Send test SMS to any phone number
- Real-time feedback on delivery

### ✅ Template Management
- View all templates in a searchable grid
- Filter by type (Email/SMS) or search by name/category
- Duplicate templates for quick variants
- Soft-delete custom templates (system templates protected)
- Usage statistics tracking

## Architecture

### Database Layer

**Table: `notification_templates`**
```sql
id                  UUID PRIMARY KEY
name                TEXT NOT NULL
type                TEXT NOT NULL (email|sms)
category            TEXT NOT NULL (e.g., 'onboarding_invite')
subject             TEXT (emails only)
body_text           TEXT NOT NULL
body_html           TEXT (emails only)
variables           JSONB (array of variable definitions)
is_active           BOOLEAN
is_system           BOOLEAN (protects from deletion)
usage_count         INTEGER
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

**Location**: `db/schema/templates-schema.ts`

### Query Layer

**File**: `db/queries/template-queries.ts`

Functions:
- `getAllTemplates()` - Get all active templates
- `getTemplatesByType(type)` - Filter by email/sms
- `getTemplateById(id)` - Single template lookup
- `getTemplateByCategory(category, type)` - Lookup for notification sending
- `createTemplate(data)` - Insert new template
- `updateTemplate(id, data)` - Edit template
- `deleteTemplate(id)` - Soft delete (non-system only)
- `duplicateTemplate(id)` - Clone template
- `incrementTemplateUsage(id)` - Track sends

### Service Layer

**File**: `lib/template-service.ts`

Functions:
- `replaceVariables(content, variables)` - Substitute {{var}} with values
- `extractVariables(content)` - Find all {{var}} in content
- `validateTemplate(content, type)` - Check for errors
- `renderTemplate(category, type, variables)` - Get and render template
- `previewTemplate(content, sampleData)` - Preview with sample data
- `getSMSInfo(content)` - Calculate SMS character/message count
- `sanitizeEmailHTML(html)` - Remove unsafe HTML

### Server Actions

**File**: `actions/template-actions.ts`

Actions (all require platform admin auth):
- `getTemplatesAction()` - List all templates
- `getTemplatesByTypeAction(type)` - Filter list
- `getTemplateByIdAction(id)` - Get single
- `createTemplateAction(data)` - Create new
- `updateTemplateAction(id, data)` - Edit existing
- `deleteTemplateAction(id)` - Delete
- `duplicateTemplateAction(id)` - Clone
- `previewTemplateAction(content, sampleData)` - Generate preview
- `extractVariablesAction(content)` - Find variables
- `sendTestEmailAction(templateId, email, sampleData)` - Test email
- `sendTestSMSAction(templateId, phone, sampleData)` - Test SMS

### UI Components

#### 1. Template Editor (`components/platform/template-editor.tsx`)
Main editing interface with:
- Name and subject editing
- Dual visual/code editor modes for emails
- Text editor for SMS
- Variables reference panel
- Save and test buttons
- Live preview with sample data

#### 2. Code Editor (`components/platform/code-editor.tsx`)
Monaco Editor wrapper with:
- Syntax highlighting (HTML/plaintext)
- Variable insertion dropdown
- Line numbers and word wrap
- Auto-formatting

#### 3. Rich Text Editor (`components/platform/rich-text-editor.tsx`)
TipTap WYSIWYG editor with:
- Bold, italic, heading, lists, quotes, links
- Undo/redo
- Toolbar with formatting buttons
- Note about switching to code view for variables

#### 4. Email Preview (`components/platform/email-preview.tsx`)
Email rendering component with:
- Sandboxed iframe for safe HTML rendering
- Desktop/mobile toggle
- Subject display
- Responsive sizing

#### 5. Phone Mockup (`components/platform/phone-mockup.tsx`)
Realistic iPhone SMS preview with:
- Message bubble rendering
- Character count display
- Multi-message warning
- Best practice tips

#### 6. Templates Page (`app/platform/templates/page.tsx`)
Main management dashboard with:
- Statistics cards (total, email, SMS counts)
- Search and filter functionality
- Template grid with edit/duplicate/delete actions
- Modal editor dialog
- Loading and error states

## Pre-Seeded Templates

The system comes with 14 production-ready templates:

### Email Templates (7)
1. **Onboarding Invitation** - Invite client to complete questionnaire
2. **Onboarding Complete** - Notify admin of completion
3. **To-Dos Approved** - Client's tasks are ready
4. **To-Do Completed** - Single task completion notification
5. **All To-Dos Complete** - All tasks finished
6. **Project Created** - New project notification
7. **Task Assigned** - Task assignment notification

### SMS Templates (7)
Same categories as emails, optimized for SMS format (under 160 chars)

## Using the Template Editor

### Accessing Templates

1. Navigate to **Platform Admin** → **Templates**
2. View statistics and template grid
3. Use search bar to find specific templates
4. Filter by Email/SMS or view all

### Editing a Template

1. Click **Edit** on any template card
2. Edit the template name (optional)
3. For emails: Edit subject line
4. Choose editing mode:
   - **Visual**: Rich text editor with formatting toolbar
   - **Code**: Full HTML access with syntax highlighting
5. Use **Insert Variable** dropdown to add variables
6. Switch to **Preview** tab to see rendered output
7. Enter sample data for variables
8. Click **Save Changes**

### Testing a Template

1. While editing, click **Send Test**
2. For Email: Enter test email address
3. For SMS: Enter phone number with country code (e.g., +1234567890)
4. Template sends with sample data
5. Check inbox/phone for delivery

### Creating Custom Templates

Currently, custom template creation is through duplication:

1. Find a similar existing template
2. Click the **Copy** icon
3. Edit the duplicate
4. Save with a new name

### Deleting Templates

- **System templates** (with System badge) cannot be deleted
- **Custom templates** can be deleted via the Trash icon
- Deletion is soft (sets `is_active = false`)

## Variable System

### Available Variables

Each template defines its own variables. Common ones:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{clientName}}` | Client's name | John Doe |
| `{{projectName}}` | Project name | Website Redesign |
| `{{link}}` | Action link | https://app.com/... |
| `{{adminName}}` | Admin's name | Jane Smith |
| `{{todoCount}}` | Number of tasks | 5 |
| `{{todoTitle}}` | Task title | Upload call list |
| `{{organizationName}}` | Org name | Acme Corp |
| `{{taskTitle}}` | Task name | Review mockups |
| `{{dueDate}}` | Due date | Dec 15, 2025 |

### Adding Variables to Content

**In Code Editor:**
1. Type `{{variableName}}` directly
2. Or click "Insert Variable" dropdown and select

**In Visual Editor:**
Switch to Code view to insert variables

### Variable Substitution

Variables are replaced at send time:
```javascript
import { renderTemplate } from '@/lib/template-service';

const rendered = await renderTemplate(
  'onboarding_invite',  // category
  'email',               // type
  {
    clientName: 'John Doe',
    projectName: 'Website Project',
    link: 'https://...',
    adminName: 'Jane Smith'
  }
);

// rendered.subject, rendered.text, rendered.html
```

## Best Practices

### Email Templates

✅ **Do:**
- Keep subject lines under 50 characters
- Use responsive HTML (inline styles)
- Include both HTML and text versions
- Test on desktop and mobile preview
- Use clear call-to-action buttons
- Include brand colors consistently

❌ **Don't:**
- Use JavaScript (will be stripped)
- Use external CSS files
- Assume images will load
- Use complex layouts
- Add event handlers (onclick, etc.)

### SMS Templates

✅ **Do:**
- Keep under 160 characters when possible
- Be concise and direct
- Include shortened URLs
- Test character count in preview
- Front-load important info

❌ **Don't:**
- Use excessive emojis (counts as multiple chars)
- Send long messages (splits into multiple SMS)
- Use complex formatting
- Assume delivery time

### Variables

✅ **Do:**
- Use descriptive variable names
- Provide example values
- Document in variable list
- Test with realistic data

❌ **Don't:**
- Use spaces in variable names
- Use special characters except underscore
- Forget to close braces `}}`

## Integration with Notification System

### Sending Notifications

The notification service automatically loads and renders templates:

```typescript
import { sendNotification } from '@/lib/notification-service';

await sendNotification(
  userId,
  'onboarding_invite',
  {
    isPlatformAdmin: false,
    orgId: 'org-uuid',
    emailFn: () => sendOnboardingInviteEmail(email, name, project, link),
    smsFn: () => sendOnboardingInviteSMS(phone, name, project, link)
  }
);
```

### Email Service Integration

**File**: `lib/email-service.ts`

Emails should use `renderTemplate()`:

```typescript
import { renderTemplate } from '@/lib/template-service';

export async function sendOnboardingInviteEmail(
  to: string,
  clientName: string,
  projectName: string,
  link: string,
  adminName: string
) {
  const rendered = await renderTemplate('onboarding_invite', 'email', {
    clientName,
    projectName,
    link,
    adminName
  });

  if (!rendered) {
    console.error('Template not found');
    return { isSuccess: false };
  }

  return sendEmail({
    to,
    subject: rendered.subject!,
    html: rendered.html!,
  });
}
```

### SMS Service Integration

**File**: `lib/sms-service.ts`

SMS should use `renderTemplate()`:

```typescript
import { renderTemplate } from '@/lib/template-service';

export async function sendOnboardingInviteSMS(
  phone: string,
  clientName: string,
  projectName: string,
  link: string
) {
  const rendered = await renderTemplate('onboarding_invite', 'sms', {
    clientName,
    projectName,
    link
  });

  if (!rendered) {
    console.error('Template not found');
    return { isSuccess: false };
  }

  return sendSMS({
    to: phone,
    message: rendered.text,
  });
}
```

## Security

### XSS Prevention
- Email HTML is sanitized before sending (removes `<script>` and event handlers)
- Preview iframe is sandboxed (`sandbox="allow-same-origin"`)
- Monaco Editor escapes content automatically

### Authorization
- Only platform admins can access templates
- System templates cannot be deleted
- Template usage is logged

### Template Validation
- Content cannot be empty
- Variable tags must be closed
- SMS length is validated
- HTML is checked for unsafe tags

## Troubleshooting

### Templates Not Loading
- Check console for error messages
- Verify database migration ran successfully
- Ensure user is platform admin

### Variables Not Substituting
- Check variable name matches exactly (case-sensitive)
- Verify variable is in template definition
- Ensure `{{` and `}}` are present

### Email Rendering Issues
- Test in both desktop and mobile preview
- Check HTML is valid
- Remove any `<script>` tags
- Use inline styles only

### SMS Character Count Off
- Emojis count as more than 1 character
- Unicode characters use more bytes
- Preview shows accurate count

### Test Emails Not Arriving
- Check spam folder
- Verify Resend API key is set
- Check email address is valid
- Review server logs

### Test SMS Not Arriving
- Verify Twilio is configured
- Check phone number format (include country code)
- Ensure Twilio account has credits
- Review Twilio console logs

## Future Enhancements

Potential additions:
- [ ] Organization-specific template overrides
- [ ] Template versioning and history
- [ ] A/B testing capabilities
- [ ] Template analytics (open rates, click rates)
- [ ] Scheduled template updates
- [ ] Approval workflow for template changes
- [ ] Multi-language template support
- [ ] Template library/marketplace

## Support

For issues or questions:
1. Check this documentation
2. Review console logs
3. Test with duplicate template first
4. Verify all environment variables are set
5. Check database migration status

---

**Version**: 1.0  
**Last Updated**: October 5, 2025  
**Maintained By**: ClientFlow Platform Team
