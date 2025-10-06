/**
 * Proactive System Health Monitoring
 * Continuously checks system health and triggers self-healing when needed
 */

import { db } from '@/db/db';
import { sql } from 'drizzle-orm';
import { createHealthCheck, getRecentHealingEvents } from '@/db/queries/healing-queries';
import { notifyAdminsOfHealthCheckFailure } from './notifications';
import { analyzeAndHealError } from './healing-engine';

type HealthCheckResult = {
  healthy: boolean;
  [key: string]: any;
};

type HealthCheck = {
  name: string;
  type: 'api_health' | 'db_connection' | 'memory_usage' | 'response_time' | 'error_rate';
  check: () => Promise<HealthCheckResult>;
  threshold?: number;
};

/**
 * Define all system health checks
 */
const HEALTH_CHECKS: HealthCheck[] = [
  {
    name: 'OpenAI API Health',
    type: 'api_health',
    check: async () => {
      const start = Date.now();
      try {
        // Simple ping to OpenAI API
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        
        const responseTime = Date.now() - start;
        
        return {
          healthy: response.ok && responseTime < 5000,
          status_code: response.status,
          response_time_ms: responseTime,
          available: response.ok,
        };
      } catch (error: any) {
        return {
          healthy: false,
          error: error.message,
          response_time_ms: Date.now() - start,
        };
      }
    },
    threshold: 5000, // 5 second response time threshold
  },
  
  {
    name: 'Database Connection Pool',
    type: 'db_connection',
    check: async () => {
      try {
        const start = Date.now();
        await db.execute(sql`SELECT 1 as health_check`);
        const queryTime = Date.now() - start;
        
        return {
          healthy: queryTime < 1000, // Under 1 second is healthy
          query_time_ms: queryTime,
          connected: true,
        };
      } catch (error: any) {
        return {
          healthy: false,
          error: error.message,
          connected: false,
        };
      }
    },
    threshold: 1000,
  },
  
  {
    name: 'Email Service (Resend)',
    type: 'api_health',
    check: async () => {
      try {
        // Check if Resend API key is configured
        if (!process.env.RESEND_API_KEY) {
          return {
            healthy: false,
            error: 'RESEND_API_KEY not configured',
            configured: false,
          };
        }
        
        // Simple API availability check (not actually sending email)
        const response = await fetch('https://api.resend.com/api_keys/check', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          },
          signal: AbortSignal.timeout(5000),
        });
        
        return {
          healthy: response.ok,
          status_code: response.status,
          available: response.ok,
          configured: true,
        };
      } catch (error: any) {
        return {
          healthy: false,
          error: error.message,
          configured: true,
        };
      }
    },
  },
  
  {
    name: 'SMS Service (Twilio)',
    type: 'api_health',
    check: async () => {
      try {
        // Check if Twilio is configured
        const hasAuth = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
        
        if (!hasAuth) {
          return {
            healthy: false,
            error: 'Twilio credentials not configured',
            configured: false,
          };
        }
        
        // For Twilio, we'll just check if credentials are configured
        // Actual API check would require making a real API call
        return {
          healthy: true,
          configured: true,
          note: 'Basic configuration check only',
        };
      } catch (error: any) {
        return {
          healthy: false,
          error: error.message,
        };
      }
    },
  },
  
  {
    name: 'Error Rate Monitor',
    type: 'error_rate',
    check: async () => {
      try {
        const last5Minutes = await getRecentHealingEvents(5);
        const errorRate = last5Minutes.length / 5; // errors per minute
        
        // Unhealthy if more than 10 errors per minute
        const isHealthy = errorRate < 10;
        
        return {
          healthy: isHealthy,
          error_rate_per_minute: errorRate.toFixed(2),
          recent_errors: last5Minutes.length,
          threshold: 10,
        };
      } catch (error: any) {
        return {
          healthy: false,
          error: error.message,
        };
      }
    },
    threshold: 10,
  },
  
  {
    name: 'Memory Usage',
    type: 'memory_usage',
    check: async () => {
      try {
        const usage = process.memoryUsage();
        const usedMB = usage.heapUsed / 1024 / 1024;
        const totalMB = usage.heapTotal / 1024 / 1024;
        const percentUsed = (usedMB / totalMB) * 100;
        
        // Unhealthy if using more than 85% of heap
        const isHealthy = percentUsed < 85;
        
        return {
          healthy: isHealthy,
          used_mb: Math.round(usedMB),
          total_mb: Math.round(totalMB),
          percent_used: Math.round(percentUsed),
          threshold_percent: 85,
        };
      } catch (error: any) {
        return {
          healthy: false,
          error: error.message,
        };
      }
    },
    threshold: 85,
  },
  
  {
    name: 'UploadThing File Service',
    type: 'api_health',
    check: async () => {
      try {
        if (!process.env.UPLOADTHING_SECRET) {
          return {
            healthy: false,
            error: 'UPLOADTHING_SECRET not configured',
            configured: false,
          };
        }
        
        // UploadThing doesn't have a simple health endpoint
        // We'll just check if credentials are configured
        return {
          healthy: true,
          configured: true,
          note: 'Configuration check only',
        };
      } catch (error: any) {
        return {
          healthy: false,
          error: error.message,
        };
      }
    },
  },
];

/**
 * Run all health checks and log results
 */
export async function runHealthChecks(): Promise<{
  total: number;
  healthy: number;
  unhealthy: number;
  results: any[];
}> {
  console.log('[Health Monitor] Running system health checks...');
  
  const results = await Promise.all(
    HEALTH_CHECKS.map(async (check) => {
      try {
        const result = await check.check();
        
        // Log to database
        await createHealthCheck({
          checkType: check.type,
          checkName: check.name,
          status: result.healthy ? 'healthy' : 'unhealthy',
          metrics: result,
          thresholdBreached: !result.healthy,
        });
        
        // Trigger proactive healing if unhealthy
        if (!result.healthy) {
          console.warn(`[Health Monitor] ${check.name} is UNHEALTHY:`, result);
          
          // Notify admins of failure
          await notifyAdminsOfHealthCheckFailure(check.name, check.type, result);
          
          // Attempt proactive healing based on check type
          await triggerProactiveHealing(check.name, check.type, result);
        } else {
          console.log(`[Health Monitor] ${check.name} is healthy ✓`);
        }
        
        return {
          name: check.name,
          type: check.type,
          ...result,
        };
        
      } catch (error: any) {
        console.error(`[Health Monitor] Error running check ${check.name}:`, error);
        
        // Log failed check
        await createHealthCheck({
          checkType: check.type,
          checkName: check.name,
          status: 'unhealthy',
          metrics: { error: error.message },
          thresholdBreached: true,
        });
        
        return {
          name: check.name,
          type: check.type,
          healthy: false,
          error: error.message,
        };
      }
    })
  );
  
  const healthy = results.filter(r => r.healthy).length;
  const unhealthy = results.length - healthy;
  
  console.log(`[Health Monitor] Health check complete: ${healthy}/${results.length} healthy`);
  
  return {
    total: results.length,
    healthy,
    unhealthy,
    results,
  };
}

/**
 * Trigger proactive healing based on health check failure
 */
async function triggerProactiveHealing(
  checkName: string,
  checkType: string,
  metrics: any
): Promise<void> {
  try {
    console.log(`[Health Monitor] Triggering proactive healing for ${checkName}`);
    
    // Create an error event from the health check failure
    const errorEvent = {
      category: checkType === 'db_connection' ? 'database_error' as const : 'api_failure' as const,
      source: `health_check:${checkName}`,
      message: `Health check failed: ${checkName}`,
      stack: JSON.stringify(metrics, null, 2),
      context: {
        check_type: checkType,
        metrics,
        proactive: true,
      },
    };
    
    // Attempt self-healing
    await analyzeAndHealError(
      errorEvent,
      async () => {
        // Re-run the specific health check
        const check = HEALTH_CHECKS.find(c => c.name === checkName);
        if (check) {
          return await check.check();
        }
      },
      []
    );
    
  } catch (error) {
    console.error(`[Health Monitor] Proactive healing failed for ${checkName}:`, error);
  }
}

/**
 * Start continuous health monitoring (runs every 2 minutes)
 * Only use this in long-running Node.js processes, not in serverless
 */
export function startHealthMonitoring(intervalMinutes: number = 2): NodeJS.Timeout {
  console.log(`[Health Monitor] Starting continuous monitoring (every ${intervalMinutes} minutes)`);
  
  // Run immediately
  runHealthChecks();
  
  // Then schedule recurring
  return setInterval(runHealthChecks, intervalMinutes * 60 * 1000);
}

/**
 * Get current system health status
 */
export async function getSystemHealthStatus(): Promise<{
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: any[];
}> {
  const results = await runHealthChecks();
  
  let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (results.unhealthy > 0) {
    overall = results.unhealthy > 2 ? 'unhealthy' : 'degraded';
  }
  
  return {
    overall,
    checks: results.results,
  };
}
