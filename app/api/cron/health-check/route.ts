/**
 * Health Check Cron Endpoint
 * Called by Vercel Cron every 2 minutes to monitor system health
 */

import { NextRequest, NextResponse } from 'next/server';
import { runHealthChecks } from '@/lib/self-healing/health-monitor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max execution time

/**
 * Vercel Cron job handler
 * Runs every 2 minutes to check system health
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      console.error('[Health Check Cron] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Health Check Cron] Unauthorized attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Run all health checks
    console.log('[Health Check Cron] Starting health checks...');
    const results = await runHealthChecks();
    
    console.log('[Health Check Cron] Health checks complete:', {
      total: results.total,
      healthy: results.healthy,
      unhealthy: results.unhealthy,
    });
    
    // Return results
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        total: results.total,
        healthy: results.healthy,
        unhealthy: results.unhealthy,
        status: results.unhealthy === 0 ? 'healthy' : results.unhealthy > 2 ? 'unhealthy' : 'degraded',
      },
    });
    
  } catch (error: any) {
    console.error('[Health Check Cron] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
