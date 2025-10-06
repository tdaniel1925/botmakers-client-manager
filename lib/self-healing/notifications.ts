/**
 * Self-Healing System Notifications
 * Sends alerts to platform admins for critical healing events
 */

import { sendNotification } from '@/lib/notification-service';
import { getPlatformAdmins } from '@/db/queries/platform-queries';
import { logAuditEvent } from '@/db/queries/audit-queries';
import type { SelectHealingEvent } from '@/db/schema/healing-schema';

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
 * Notify platform admins of critical healing events
 */
export async function notifyAdminsOfHealingEvent(
  healingEvent: SelectHealingEvent | any,
  aiAnalysis: AIAnalysis,
  healingResult: HealingResult
): Promise<void> {
  try {
    // Get all platform admins
    const admins = await getPlatformAdmins();
    
    if (!admins || admins.length === 0) {
      console.log('[Self-Healing] No platform admins to notify');
      return;
    }
    
    // Build notification subject and message
    const subject = buildNotificationSubject(aiAnalysis, healingResult);
    const message = buildNotificationMessage(healingEvent, aiAnalysis, healingResult);
    
    // Send notifications to all admins
    const notifiedAdmins: string[] = [];
    
    for (const admin of admins) {
      try {
        await sendNotification({
          userId: admin.id,
          channel: admin.notificationPreferences || 'email',
          subject,
          message,
        });
        
        notifiedAdmins.push(admin.id);
      } catch (error) {
        console.error(`[Self-Healing] Failed to notify admin ${admin.id}:`, error);
      }
    }
    
    // Log to audit trail
    await logAuditEvent({
      action: 'self_healing_alert_sent',
      userId: 'system',
      entityType: 'system_health',
      entityId: healingEvent.id || 'unknown',
      details: {
        severity: aiAnalysis.severity,
        healing_result: healingResult.success ? 'success' : 'failed',
        admins_notified: notifiedAdmins,
      },
    });
    
    console.log(`[Self-Healing] Notified ${notifiedAdmins.length} admins`);
    
  } catch (error) {
    console.error('[Self-Healing] Error sending notifications:', error);
    // Don't throw - notification failure shouldn't break the healing process
  }
}

/**
 * Build notification subject line
 */
function buildNotificationSubject(aiAnalysis: AIAnalysis, healingResult: HealingResult): string {
  const severityEmoji = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴',
  };
  
  const statusEmoji = healingResult.success ? '✅' : '❌';
  const emoji = severityEmoji[aiAnalysis.severity] || '🟡';
  
  if (healingResult.success) {
    return `${emoji} ${statusEmoji} Self-Healing Success: ${aiAnalysis.severity.toUpperCase()} Issue Resolved`;
  } else {
    return `${emoji} ${statusEmoji} Self-Healing Failed: ${aiAnalysis.severity.toUpperCase()} Issue Requires Attention`;
  }
}

/**
 * Build detailed notification message
 */
function buildNotificationMessage(
  healingEvent: any,
  aiAnalysis: AIAnalysis,
  healingResult: HealingResult
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.com';
  const dashboardUrl = `${appUrl}/platform/system-health`;
  
  let message = `
# System Self-Healing Alert

## Error Details
- **Source:** ${healingEvent.errorSource || healingEvent.error_source || 'Unknown'}
- **Category:** ${healingEvent.errorCategory || healingEvent.error_category || 'Unknown'}
- **Message:** ${healingEvent.errorMessage || healingEvent.error_message || 'Unknown error'}
- **Severity:** ${aiAnalysis.severity.toUpperCase()}

## AI Analysis
- **Diagnosis:** ${aiAnalysis.diagnosis}
- **Recommended Strategy:** ${aiAnalysis.recommended_strategy}
- **Confidence:** ${(aiAnalysis.confidence * 100).toFixed(0)}%
- **Reasoning:** ${aiAnalysis.reasoning}

## Healing Result
- **Status:** ${healingResult.success ? '✅ Successfully Healed' : '❌ Healing Failed'}
- **Actions Taken:**
${healingResult.actions_taken.map(action => `  • ${action}`).join('\n')}

${healingResult.success ? `
The issue has been automatically resolved and the system is operating normally.
` : `
⚠️ **Manual Intervention Required**

The self-healing system was unable to automatically resolve this issue. Please review the error details and take appropriate action.
`}

---

**View Full Details:** [System Health Dashboard](${dashboardUrl})

**Timestamp:** ${new Date().toLocaleString()}
`;
  
  return message.trim();
}

/**
 * Notify admins of health check failure
 */
export async function notifyAdminsOfHealthCheckFailure(
  checkName: string,
  checkType: string,
  metrics: any
): Promise<void> {
  try {
    const admins = await getPlatformAdmins();
    
    if (!admins || admins.length === 0) {
      return;
    }
    
    const subject = `🔴 Health Check Failed: ${checkName}`;
    const message = `
# System Health Alert

## Failed Health Check
- **Check Name:** ${checkName}
- **Check Type:** ${checkType}
- **Status:** UNHEALTHY

## Metrics
${JSON.stringify(metrics, null, 2)}

## Recommended Actions
1. Check service availability
2. Review recent deployments
3. Monitor for additional failures
4. Check system logs for details

---

**View Full Details:** [System Health Dashboard](${process.env.NEXT_PUBLIC_APP_URL}/platform/system-health)

**Timestamp:** ${new Date().toLocaleString()}
`;
    
    for (const admin of admins) {
      try {
        await sendNotification({
          userId: admin.id,
          channel: 'email', // Health checks always go to email
          subject,
          message,
        });
      } catch (error) {
        console.error(`[Self-Healing] Failed to notify admin of health check failure:`, error);
      }
    }
    
  } catch (error) {
    console.error('[Self-Healing] Error sending health check notifications:', error);
  }
}
