/**
 * Global Error Interceptor
 * Wraps functions to automatically capture errors and trigger self-healing
 */

import { analyzeAndHealError } from './healing-engine';

type ErrorCategory = 'api' | 'database' | 'runtime' | 'performance';

type WrapperContext = {
  source: string; // Function/file name where error occurred
  category: ErrorCategory;
};

/**
 * Wrap any function with self-healing capabilities
 * 
 * Usage:
 * ```typescript
 * export const myAction = withSelfHealing(
 *   async function myAction(arg1, arg2) {
 *     // Your code here
 *   },
 *   { source: 'myAction', category: 'database' }
 * );
 * ```
 */
export function withSelfHealing<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: WrapperContext
): T {
  return (async (...args: any[]) => {
    try {
      // Execute the original function
      return await fn(...args);
      
    } catch (error: any) {
      console.error(`[Self-Healing] Error caught in ${context.source}:`, error.message);
      
      // Build error event
      const errorEvent = {
        category: mapCategoryToErrorCategory(context.category),
        source: context.source,
        message: error.message || 'Unknown error',
        stack: error.stack,
        context: {
          args: sanitizeArgs(args),
          timestamp: new Date().toISOString(),
          errorType: error.constructor?.name || 'Error',
        },
      };
      
      // Attempt AI-powered self-healing
      const healingResult = await analyzeAndHealError(errorEvent, fn, args);
      
      if (healingResult.success) {
        // Healing succeeded - return healed result
        console.log(`[Self-Healing] Successfully healed error in ${context.source}`);
        return healingResult.data;
      }
      
      // Healing failed - re-throw original error but it's been logged
      console.error(`[Self-Healing] Failed to heal error in ${context.source}`);
      throw error;
    }
  }) as T;
}

/**
 * Map simplified category to full error category
 */
function mapCategoryToErrorCategory(category: ErrorCategory): 'api_failure' | 'database_error' | 'runtime_error' | 'performance_issue' {
  switch (category) {
    case 'api':
      return 'api_failure';
    case 'database':
      return 'database_error';
    case 'runtime':
      return 'runtime_error';
    case 'performance':
      return 'performance_issue';
    default:
      return 'runtime_error';
  }
}

/**
 * Sanitize function arguments to remove sensitive data before logging
 */
function sanitizeArgs(args: any[]): any[] {
  return args.map((arg, index) => {
    if (arg === null || arg === undefined) {
      return arg;
    }
    
    if (typeof arg === 'object') {
      return sanitizeObject(arg);
    }
    
    if (typeof arg === 'string') {
      // Don't log long strings (could be file contents, etc.)
      if (arg.length > 100) {
        return `[String: ${arg.length} chars]`;
      }
      // Check for common sensitive patterns
      if (isSensitiveString(arg)) {
        return '[REDACTED]';
      }
    }
    
    // Primitive types are safe
    return arg;
  });
}

/**
 * Sanitize object to remove sensitive fields
 */
function sanitizeObject(obj: any): any {
  if (Array.isArray(obj)) {
    // Limit array length in logs
    if (obj.length > 10) {
      return `[Array: ${obj.length} items]`;
    }
    return obj.map(item => sanitizeObject(item));
  }
  
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'apikey',
    'api_key',
    'accesstoken',
    'access_token',
    'refreshtoken',
    'refresh_token',
    'sessionid',
    'session_id',
    'creditcard',
    'credit_card',
    'ssn',
    'auth',
    'authorization',
  ];
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Check if key contains sensitive term
    if (sensitiveKeys.some(term => lowerKey.includes(term))) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(value);
    } else if (typeof value === 'string' && value.length > 200) {
      // Truncate long strings
      sanitized[key] = `${value.substring(0, 200)}... [truncated]`;
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Check if string contains sensitive data patterns
 */
function isSensitiveString(str: string): boolean {
  // JWT tokens
  if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(str)) {
    return true;
  }
  
  // API keys (common patterns)
  if (/^(sk|pk|api)_[a-zA-Z0-9]{20,}$/.test(str)) {
    return true;
  }
  
  // Long alphanumeric strings (likely tokens)
  if (str.length > 40 && /^[a-zA-Z0-9]+$/.test(str)) {
    return true;
  }
  
  return false;
}

/**
 * Capture error manually (for places where you can't use withSelfHealing)
 */
export async function captureError(
  error: Error,
  context: WrapperContext & { additionalContext?: any }
): Promise<void> {
  const errorEvent = {
    category: mapCategoryToErrorCategory(context.category),
    source: context.source,
    message: error.message || 'Unknown error',
    stack: error.stack,
    context: {
      ...context.additionalContext,
      timestamp: new Date().toISOString(),
      errorType: error.constructor?.name || 'Error',
    },
  };
  
  // Just log it - don't attempt healing since we don't have the original function
  await analyzeAndHealError(errorEvent, async () => {}, []);
}
