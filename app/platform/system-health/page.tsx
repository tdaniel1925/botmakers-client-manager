/**
 * System Health & Self-Healing Dashboard
 * Real-time view of system health, healing events, and AI performance
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getHealingEventsAction,
  getLatestHealthChecksAction,
  getHealingStatsAction,
} from "@/actions/healing-actions";
import { HealingEventCard } from "@/components/platform/healing-event-card";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  Clock,
  Shield,
  Brain,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/date-utils";

export default async function SystemHealthPage() {
  // Fetch all data
  const [eventsResult, healthChecksResult, statsResult] = await Promise.all([
    getHealingEventsAction({ limit: 20 }),
    getLatestHealthChecksAction(),
    getHealingStatsAction(),
  ]);
  
  const events = eventsResult.data || [];
  const healthChecks = healthChecksResult.data || [];
  const stats = statsResult.data || {
    total_events: 0,
    healed_today: 0,
    healing_success_rate: 0,
    active_issues: 0,
    avg_healing_time_ms: 0,
    uptime_percentage: 100,
    overall_health: 'healthy',
  };
  
  return (
    <main className="p-6 lg:p-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Health & Self-Healing</h1>
        <p className="text-gray-600">
          AI-powered automatic error recovery and proactive system monitoring
        </p>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Overall Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-600" />
              Overall Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  stats.overall_health === 'healthy'
                    ? 'default'
                    : stats.overall_health === 'degraded'
                    ? 'secondary'
                    : 'destructive'
                }
                className="text-base px-3 py-1"
              >
                {stats.overall_health === 'healthy' && '✓ Healthy'}
                {stats.overall_health === 'degraded' && '⚠ Degraded'}
                {stats.overall_health === 'unhealthy' && '✕ Unhealthy'}
              </Badge>
              <span className="text-2xl font-bold">{stats.uptime_percentage}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">System uptime</p>
          </CardContent>
        </Card>
        
        {/* Auto-Healed Today */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-gray-600" />
              Auto-Healed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.healed_today}</p>
            <p className="text-sm text-gray-600 mt-1">
              {stats.healing_success_rate}% success rate
            </p>
          </CardContent>
        </Card>
        
        {/* Active Issues */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-gray-600" />
              Active Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl font-bold ${
                stats.active_issues === 0
                  ? 'text-green-600'
                  : stats.active_issues > 5
                  ? 'text-red-600'
                  : 'text-orange-600'
              }`}
            >
              {stats.active_issues}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {stats.active_issues === 0 ? 'All systems normal' : 'Requires attention'}
            </p>
          </CardContent>
        </Card>
        
        {/* Avg Healing Time */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              Avg Healing Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.avg_healing_time_ms}ms</p>
            <p className="text-sm text-gray-600 mt-1">Mean time to recovery</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Service Health Checks */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Service Health Checks
          </CardTitle>
          <CardDescription>Real-time status of all system services</CardDescription>
        </CardHeader>
        <CardContent>
          {healthChecks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p>No health checks available yet</p>
              <p className="text-sm mt-1">Health checks run every 2 minutes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthChecks.map((check: any) => (
                <div
                  key={check.id}
                  className={`p-4 rounded-lg border-2 ${
                    check.status === 'healthy'
                      ? 'border-green-200 bg-green-50'
                      : check.status === 'degraded'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm">{check.checkName}</h3>
                    {check.status === 'healthy' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <Badge
                    variant={check.status === 'healthy' ? 'default' : 'destructive'}
                    className="text-xs mb-2"
                  >
                    {check.status}
                  </Badge>
                  <p className="text-xs text-gray-600 mt-2">
                    Last checked: {formatRelativeDate(check.checkedAt)}
                  </p>
                  {check.metrics && Object.keys(check.metrics).length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      {check.metrics.response_time_ms && (
                        <div>Response: {check.metrics.response_time_ms}ms</div>
                      )}
                      {check.metrics.error && (
                        <div className="text-red-600 mt-1">{check.metrics.error}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* AI Performance Insight */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Healing Performance
          </CardTitle>
          <CardDescription>How well the AI is handling errors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Events</p>
              <p className="text-2xl font-bold">{stats.total_events}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-green-600">{stats.healing_success_rate}%</p>
                {stats.healing_success_rate >= 80 && (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Healing Speed</p>
              <p className="text-2xl font-bold">
                {stats.avg_healing_time_ms < 1000 ? 'Fast' : stats.avg_healing_time_ms < 5000 ? 'Good' : 'Slow'}
              </p>
              <p className="text-xs text-gray-500">{stats.avg_healing_time_ms}ms avg</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Healing Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Self-Healing Activity Feed
          </CardTitle>
          <CardDescription>Recent automatic error recovery attempts</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <p className="text-lg font-medium">No healing events yet</p>
              <p className="text-sm mt-1">
                The system will automatically capture and heal errors as they occur
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event: any) => (
                <HealingEventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
