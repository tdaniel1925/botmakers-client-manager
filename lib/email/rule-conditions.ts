/**
 * Rule Condition Evaluation
 * Evaluates email rule conditions against emails
 */

import type { SelectEmail } from '@/db/schema/email-schema';

export interface RuleCondition {
  field: 'from' | 'to' | 'subject' | 'body' | 'has_attachment' | 'date' | 'importance' | 'label';
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex' | 'is' | 'is_not';
  value: string | boolean | number;
}

export interface ConditionGroup {
  logic: 'AND' | 'OR';
  rules: RuleCondition[];
}

/**
 * Evaluate a single condition against an email
 */
export function evaluateCondition(email: SelectEmail, condition: RuleCondition): boolean {
  const { field, operator, value } = condition;

  // Get the field value from the email
  let fieldValue: string | boolean | number | null = null;

  switch (field) {
    case 'from':
      fieldValue = typeof email.fromAddress === 'object' 
        ? email.fromAddress?.email || '' 
        : email.fromAddress || '';
      break;
    case 'to':
      fieldValue = Array.isArray(email.toAddresses)
        ? email.toAddresses.map((addr: any) => addr.email || addr).join(',')
        : '';
      break;
    case 'subject':
      fieldValue = email.subject || '';
      break;
    case 'body':
      fieldValue = email.bodyText || email.bodyHtml || '';
      break;
    case 'has_attachment':
      fieldValue = email.hasAttachments || false;
      break;
    case 'date':
      fieldValue = email.receivedAt?.toISOString() || '';
      break;
    case 'importance':
      fieldValue = email.isImportant || false;
      break;
    case 'label':
      fieldValue = Array.isArray(email.labelIds) ? email.labelIds.join(',') : '';
      break;
    default:
      return false;
  }

  // Convert to string for comparison (except for boolean fields)
  const strFieldValue = String(fieldValue).toLowerCase();
  const strValue = String(value).toLowerCase();

  // Evaluate based on operator
  switch (operator) {
    case 'contains':
      return strFieldValue.includes(strValue);
    case 'equals':
      return strFieldValue === strValue;
    case 'starts_with':
      return strFieldValue.startsWith(strValue);
    case 'ends_with':
      return strFieldValue.endsWith(strValue);
    case 'regex':
      try {
        const regex = new RegExp(strValue, 'i');
        return regex.test(strFieldValue);
      } catch (e) {
        console.error('Invalid regex:', strValue, e);
        return false;
      }
    case 'is':
      if (typeof value === 'boolean') {
        return fieldValue === value;
      }
      return strFieldValue === strValue;
    case 'is_not':
      if (typeof value === 'boolean') {
        return fieldValue !== value;
      }
      return strFieldValue !== strValue;
    default:
      return false;
  }
}

/**
 * Evaluate a condition group (with AND/OR logic) against an email
 */
export function evaluateConditionGroup(email: SelectEmail, group: ConditionGroup): boolean {
  if (!group.rules || group.rules.length === 0) {
    return false;
  }

  const results = group.rules.map(condition => evaluateCondition(email, condition));

  if (group.logic === 'AND') {
    return results.every(result => result);
  } else {
    // OR logic
    return results.some(result => result);
  }
}



