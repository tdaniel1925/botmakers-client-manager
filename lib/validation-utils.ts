/**
 * Validation utilities for server-side data validation
 * ✅ FIX BUG-019: Required field validation for contacts, deals, and other entities
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate contact data before creation/update
 */
export function validateContact(data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  organizationId?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  } else if (data.firstName.trim().length > 100) {
    errors.push({ field: 'firstName', message: 'First name must be 100 characters or less' });
  }

  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  } else if (data.lastName.trim().length > 100) {
    errors.push({ field: 'lastName', message: 'Last name must be 100 characters or less' });
  }

  if (!data.organizationId || data.organizationId.trim().length === 0) {
    errors.push({ field: 'organizationId', message: 'Organization ID is required' });
  }

  // Optional fields with validation
  if (data.email) {
    if (!isValidEmail(data.email)) {
      errors.push({ field: 'email', message: 'Email address is not valid' });
    } else if (data.email.length > 255) {
      errors.push({ field: 'email', message: 'Email must be 255 characters or less' });
    }
  }

  if (data.phone && data.phone.length > 50) {
    errors.push({ field: 'phone', message: 'Phone number must be 50 characters or less' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate deal data before creation/update
 */
export function validateDeal(data: {
  title?: string;
  value?: string | number;
  stage?: string;
  probability?: number;
  organizationId?: string;
  contactId?: string | null;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.title || data.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Deal title is required' });
  } else if (data.title.trim().length > 255) {
    errors.push({ field: 'title', message: 'Deal title must be 255 characters or less' });
  }

  if (!data.organizationId || data.organizationId.trim().length === 0) {
    errors.push({ field: 'organizationId', message: 'Organization ID is required' });
  }

  // Value validation
  if (data.value !== undefined && data.value !== null) {
    const valueNum = typeof data.value === 'string' ? parseFloat(data.value) : data.value;
    if (isNaN(valueNum)) {
      errors.push({ field: 'value', message: 'Deal value must be a valid number' });
    } else if (valueNum < 0) {
      errors.push({ field: 'value', message: 'Deal value cannot be negative' });
    } else if (valueNum > 999999999999.99) {
      errors.push({ field: 'value', message: 'Deal value is too large' });
    }
  }

  // Probability validation
  if (data.probability !== undefined && data.probability !== null) {
    if (typeof data.probability !== 'number' || isNaN(data.probability)) {
      errors.push({ field: 'probability', message: 'Probability must be a number' });
    } else if (data.probability < 0 || data.probability > 100) {
      errors.push({ field: 'probability', message: 'Probability must be between 0 and 100' });
    }
  }

  // Stage validation (basic - not empty)
  if (data.stage && data.stage.trim().length === 0) {
    errors.push({ field: 'stage', message: 'Deal stage cannot be empty' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate activity data before creation/update
 */
export function validateActivity(data: {
  type?: string;
  subject?: string;
  dueDate?: Date | string;
  userId?: string;
  organizationId?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.type || data.type.trim().length === 0) {
    errors.push({ field: 'type', message: 'Activity type is required' });
  }

  if (!data.subject || data.subject.trim().length === 0) {
    errors.push({ field: 'subject', message: 'Activity subject is required' });
  } else if (data.subject.trim().length > 255) {
    errors.push({ field: 'subject', message: 'Activity subject must be 255 characters or less' });
  }

  if (!data.userId || data.userId.trim().length === 0) {
    errors.push({ field: 'userId', message: 'User ID is required' });
  }

  if (!data.organizationId || data.organizationId.trim().length === 0) {
    errors.push({ field: 'organizationId', message: 'Organization ID is required' });
  }

  // Due date validation
  if (data.dueDate) {
    const dueDate = typeof data.dueDate === 'string' ? new Date(data.dueDate) : data.dueDate;
    if (isNaN(dueDate.getTime())) {
      errors.push({ field: 'dueDate', message: 'Due date is not valid' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322 compliant regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (basic - accepts various formats)
 */
export function isValidPhone(phone: string): boolean {
  // Allow digits, spaces, dashes, parentheses, plus sign
  const phoneRegex = /^[\d\s\-\(\)\+]{7,50}$/;
  return phoneRegex.test(phone);
}

/**
 * Format validation errors into a user-friendly message
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0].message;
  
  return `Validation errors: ${errors.map(e => e.message).join('; ')}`;
}

/**
 * Sanitize string input (trim whitespace, limit length)
 */
export function sanitizeString(input: string | undefined | null, maxLength: number = 1000): string {
  if (!input) return '';
  return input.trim().substring(0, maxLength);
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(
  input: string | number | undefined | null,
  min?: number,
  max?: number
): number | null {
  if (input === undefined || input === null) return null;
  
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num)) return null;
  
  let sanitized = num;
  if (min !== undefined && sanitized < min) sanitized = min;
  if (max !== undefined && sanitized > max) sanitized = max;
  
  return sanitized;
}
