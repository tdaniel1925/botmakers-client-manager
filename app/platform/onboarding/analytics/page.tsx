/**
 * Platform Admin - Onboarding Analytics
 * Detailed analytics and tracking for all onboarding sessions
 */

import { redirect } from "next/navigation";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { getOnboardingSessionsAction, getOnboardingAnalyticsAction } from "@/actions/onboarding-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, CheckCircle, Clock, Ban } from "lucide-react";

export default async function OnboardingAnalyticsPage() {
  const isAdmin = await isPlatformAdmin();
  if (!isAdmin) {
    redirect("/dashboard");
  }

  const [sessionsResult, analyticsResult] = await Promise.all([
    getOnboardingSessionsAction(),
    getOnboardingAnalyticsAction(),
  ]);

  const sessions = sessionsResult.isSuccess ? sessionsResult.data : [];
  const analytics = analyticsResult.isSuccess ? analyticsResult.data : null;

  if (!analytics) {
    return <div className="p-8">Failed to load analytics</div>;
  }

  // Calculate additional metrics
  const avgCompletionRate = analytics.completionRate;
  const sessionsByTemplate: Record<string, number> = {};
  const completionsByTemplate: Record<string, { total: number; completed: number }> = {};

  sessions.forEach((session: any) => {
    const type = session.onboardingType || 'other';
    sessionsByTemplate[type] = (sessionsByTemplate[type] || 0) + 1;
    
    if (!completionsByTemplate[type]) {
      completionsByTemplate[type] = { total: 0, completed: 0 };
    }
    completionsByTemplate[type].total++;
    if (session.status === 'completed') {
      completionsByTemplate[type].completed++;
    }
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Onboarding Analytics</h1>
        <p className="text-gray-600 mt-2">
          Track and analyze client onboarding performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {avgCompletionRate.toFixed(1)}%
            </div>
            <Progress value={avgCompletionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.completed} of {analytics.total} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Currently active sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abandoned</CardTitle>
            <Ban className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.abandoned}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.total > 0 ? ((analytics.abandoned / analytics.total) * 100).toFixed(1) : 0}% abandonment rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Start</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analytics.pending}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Invitations not yet opened
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Template Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance by Template Type</CardTitle>
          <CardDescription>
            Compare completion rates across different onboarding templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(completionsByTemplate).map(([type, data]) => {
              const rate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium capitalize">
                        {type.replace('_', ' ')}
                      </h4>
                      <span className="text-sm text-gray-500">
                        ({data.completed}/{data.total})
                      </span>
                    </div>
                    <span className="text-sm font-medium">{rate.toFixed(1)}%</span>
                  </div>
                  <Progress value={rate} />
                </div>
              );
            })}
            {Object.keys(completionsByTemplate).length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No template data available yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Session Distribution by Type</CardTitle>
          <CardDescription>
            Total sessions created for each onboarding template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(sessionsByTemplate).map(([type, count]) => {
              const percentage = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="capitalize font-medium">
                    {type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{count} sessions</span>
                    <span className="text-sm font-medium w-16 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
            {Object.keys(sessionsByTemplate).length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No session data available yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
