/**
 * AI-Powered Healing Engine
 * Uses OpenAI GPT-4 to analyze errors and determine optimal healing strategies
 */

import OpenAI from 'openai';
import {
  createHealingEvent,
  getHealingPattern,
  upsertHealingPattern,
} from '@/db/queries/healing-queries';
import { applyHealingStrategy, generateErrorSignature } from './healing-strategies';
import { notifyAdminsOfHealingEvent } from './notifications';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

type ErrorEvent = {
  category: 'api_failure' | 'database_error' | 'runtime_error' | 'performance_issue';
  source: string;
  message: string;
  stack?: string;
  context?: any;
};

type AIAnalysis = {
  diagnosis: string;
  recommended_strategy: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
  estimated_fix_time_ms: number;
};

type HealingResult = {
  success: boolean;
  data?: any;
  actions_taken: string[];
  error?: string;
};

/**
 * Main healing orchestrator - analyzes errors and attempts automated healing
 */
export async function analyzeAndHealError(
  errorEvent: ErrorEvent,
  originalFunction: Function,
  originalArgs: any[]
): Promise<HealingResult> {
  const startTime = Date.now();
  
  try {
    console.log('[Self-Healing] Analyzing error:', {
      category: errorEvent.category,
      source: errorEvent.source,
      message: errorEvent.message.substring(0, 100),
    });
    
    // 1. Check if we have a known healing pattern for this error
    const errorSignature = generateErrorSignature(errorEvent);
    const knownPattern = await getHealingPattern(errorSignature);
    
    if (knownPattern && parseFloat(knownPattern.successRate) > 80) {
      console.log('[Self-Healing] Using known pattern with', knownPattern.successRate, '% success rate');
      
      // Use proven healing strategy
      const result = await applyHealingStrategy(
        knownPattern.successfulHealingStrategy,
        errorEvent,
        originalFunction,
        originalArgs
      );
      
      if (result.success) {
        // Update pattern success
        await upsertHealingPattern(
          errorSignature,
          errorEvent.message,
          knownPattern.successfulHealingStrategy,
          true
        );
        
        // Log successful healing
        await createHealingEvent({
          eventType: 'healing_success',
          errorCategory: errorEvent.category,
          errorSource: errorEvent.source,
          errorMessage: errorEvent.message,
          errorStack: errorEvent.stack,
          errorContext: errorEvent.context,
          healingStrategy: knownPattern.successfulHealingStrategy,
          healingActions: result.actions_taken,
          healingResult: 'success',
          healingDurationMs: Date.now() - startTime,
          severity: 'low', // Known patterns are usually low severity
        });
        
        return result;
      }
    }
    
    // 2. Use AI to analyze error and determine fix
    const aiAnalysis = await analyzeErrorWithAI(errorEvent);
    
    console.log('[Self-Healing] AI Analysis:', {
      strategy: aiAnalysis.recommended_strategy,
      confidence: aiAnalysis.confidence,
      severity: aiAnalysis.severity,
    });
    
    // 3. Apply AI-recommended healing strategy
    const healingResult = await applyHealingStrategy(
      aiAnalysis.recommended_strategy,
      errorEvent,
      originalFunction,
      originalArgs
    );
    
    // 4. Log healing attempt
    const healingEvent = await createHealingEvent({
      eventType: healingResult.success ? 'healing_success' : 'healing_failed',
      errorCategory: errorEvent.category,
      errorSource: errorEvent.source,
      errorMessage: errorEvent.message,
      errorStack: errorEvent.stack,
      errorContext: errorEvent.context,
      aiAnalysis: aiAnalysis,
      aiConfidenceScore: aiAnalysis.confidence.toFixed(2),
      healingStrategy: aiAnalysis.recommended_strategy,
      healingActions: healingResult.actions_taken,
      healingResult: healingResult.success ? 'success' : 'failed',
      healingDurationMs: Date.now() - startTime,
      severity: aiAnalysis.severity,
      resolvedAt: healingResult.success ? new Date() : null,
    });
    
    // 5. Learn from result
    if (healingResult.success) {
      await upsertHealingPattern(
        errorSignature,
        errorEvent.message,
        aiAnalysis.recommended_strategy,
        true
      );
      
      console.log('[Self-Healing] Success! Learned new pattern.');
    } else {
      await upsertHealingPattern(
        errorSignature,
        errorEvent.message,
        aiAnalysis.recommended_strategy,
        false
      );
      
      console.log('[Self-Healing] Failed to heal. Pattern recorded.');
    }
    
    // 6. Notify admins if critical or failed
    if (aiAnalysis.severity === 'critical' || aiAnalysis.severity === 'high' || !healingResult.success) {
      await notifyAdminsOfHealingEvent(healingEvent, aiAnalysis, healingResult);
    }
    
    return healingResult;
    
  } catch (error: any) {
    console.error('[Self-Healing] Healing engine error:', error);
    
    // Log the healing engine failure itself
    await createHealingEvent({
      eventType: 'healing_failed',
      errorCategory: errorEvent.category,
      errorSource: errorEvent.source,
      errorMessage: errorEvent.message,
      errorStack: errorEvent.stack,
      healingResult: 'failed',
      healingDurationMs: Date.now() - startTime,
      severity: 'high',
      healingActions: [`Healing engine error: ${error.message}`],
    });
    
    // Return failure but don't throw - let original error propagate
    return {
      success: false,
      actions_taken: [`Healing engine failed: ${error.message}`],
      error: error.message,
    };
  }
}

/**
 * Use AI to analyze error and recommend healing strategy
 */
async function analyzeErrorWithAI(errorEvent: ErrorEvent): Promise<AIAnalysis> {
  // If no OpenAI API key, use rule-based fallback
  if (!openai) {
    return analyzeErrorWithRules(errorEvent);
  }
  
  try {
    const prompt = `You are a self-healing system AI. Analyze this error and recommend an automated fix.

Error Category: ${errorEvent.category}
Error Source: ${errorEvent.source}
Error Message: ${errorEvent.message}
Stack Trace: ${errorEvent.stack?.substring(0, 500) || 'Not available'}
Context: ${JSON.stringify(errorEvent.context)?.substring(0, 200) || 'Not available'}

Available Healing Strategies:
1. RETRY_WITH_BACKOFF - Retry the operation with exponential backoff (for transient failures)
2. FALLBACK_TO_CACHE - Use cached data if available (for API failures)
3. SWITCH_API_ENDPOINT - Try alternate API endpoint/service (for API failures)
4. CLEAR_CACHE_AND_RETRY - Clear relevant cache and retry (for stale data issues)
5. RESET_CONNECTION - Reset database/API connection and retry (for connection issues)
6. USE_DEFAULT_VALUE - Return safe default value (for non-critical operations)
7. SKIP_OPERATION - Skip non-critical operation and continue (for optional features)
8. QUEUE_FOR_LATER - Add to background job queue for retry (for async operations)
9. ROLLBACK_TRANSACTION - Rollback and retry with corrected data (for transaction errors)
10. RATE_LIMIT_BACKOFF - Wait and retry (for rate limit errors)

Respond in JSON with the following structure:
{
  "diagnosis": "Brief explanation of root cause (max 100 chars)",
  "recommended_strategy": "One of the strategies above (exact name)",
  "confidence": 0.85,
  "severity": "low",
  "reasoning": "Why this strategy will work (max 150 chars)",
  "estimated_fix_time_ms": 2000
}

Severity levels:
- low: Normal operational errors, expected occasionally
- medium: Unexpected but recoverable errors
- high: Errors affecting multiple users or core functionality
- critical: Errors causing system-wide issues or data loss`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1, // Low temperature for consistent, deterministic fixes
      max_tokens: 300,
    });
    
    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and return
    return {
      diagnosis: analysis.diagnosis || 'Unknown error',
      recommended_strategy: analysis.recommended_strategy || 'RETRY_WITH_BACKOFF',
      confidence: analysis.confidence || 0.5,
      severity: analysis.severity || 'medium',
      reasoning: analysis.reasoning || 'Default strategy',
      estimated_fix_time_ms: analysis.estimated_fix_time_ms || 5000,
    };
    
  } catch (error: any) {
    console.error('[Self-Healing] OpenAI analysis failed:', error.message);
    // Fallback to rule-based analysis
    return analyzeErrorWithRules(errorEvent);
  }
}

/**
 * Fallback rule-based error analysis when AI is unavailable
 */
function analyzeErrorWithRules(errorEvent: ErrorEvent): AIAnalysis {
  const message = errorEvent.message.toLowerCase();
  const source = errorEvent.source.toLowerCase();
  
  // Database errors
  if (errorEvent.category === 'database_error') {
    if (message.includes('connection') || message.includes('timeout')) {
      return {
        diagnosis: 'Database connection timeout or failure',
        recommended_strategy: 'RESET_CONNECTION',
        confidence: 0.8,
        severity: 'high',
        reasoning: 'Connection issues typically resolve with connection reset',
        estimated_fix_time_ms: 2000,
      };
    }
    if (message.includes('deadlock') || message.includes('transaction')) {
      return {
        diagnosis: 'Transaction deadlock or conflict',
        recommended_strategy: 'ROLLBACK_TRANSACTION',
        confidence: 0.75,
        severity: 'medium',
        reasoning: 'Rollback and retry resolves most transaction conflicts',
        estimated_fix_time_ms: 3000,
      };
    }
  }
  
  // API failures
  if (errorEvent.category === 'api_failure') {
    if (message.includes('rate limit') || message.includes('429')) {
      return {
        diagnosis: 'API rate limit exceeded',
        recommended_strategy: 'RATE_LIMIT_BACKOFF',
        confidence: 0.9,
        severity: 'low',
        reasoning: 'Wait for rate limit cooldown before retry',
        estimated_fix_time_ms: 5000,
      };
    }
    if (message.includes('timeout') || message.includes('econnrefused')) {
      return {
        diagnosis: 'API endpoint timeout or unavailable',
        recommended_strategy: 'SWITCH_API_ENDPOINT',
        confidence: 0.7,
        severity: 'medium',
        reasoning: 'Try backup endpoint or retry with backoff',
        estimated_fix_time_ms: 3000,
      };
    }
  }
  
  // Runtime errors
  if (errorEvent.category === 'runtime_error') {
    if (message.includes('null') || message.includes('undefined')) {
      return {
        diagnosis: 'Null or undefined value encountered',
        recommended_strategy: 'USE_DEFAULT_VALUE',
        confidence: 0.85,
        severity: 'low',
        reasoning: 'Safe default prevents crash while maintaining functionality',
        estimated_fix_time_ms: 100,
      };
    }
  }
  
  // Performance issues
  if (errorEvent.category === 'performance_issue') {
    return {
      diagnosis: 'Performance degradation detected',
      recommended_strategy: 'CLEAR_CACHE_AND_RETRY',
      confidence: 0.7,
      severity: 'medium',
      reasoning: 'Cache clear often resolves performance issues',
      estimated_fix_time_ms: 2000,
    };
  }
  
  // Default strategy for unknown errors
  return {
    diagnosis: 'Unknown error type',
    recommended_strategy: 'RETRY_WITH_BACKOFF',
    confidence: 0.6,
    severity: 'medium',
    reasoning: 'Retry with backoff is a safe default strategy',
    estimated_fix_time_ms: 5000,
  };
}
