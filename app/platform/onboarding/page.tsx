/**
 * Platform Admin - Onboarding Sessions List
 * View and manage all client onboarding sessions
 */

import { redirect } from "next/navigation";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { getOnboardingSessionsAction, getOnboardingAnalyticsAction } from "@/actions/onboarding-actions";
import { OnboardingSessionsList } from "@/components/platform/onboarding-sessions-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, Ban } from "lucide-react";

export default async function PlatformOnboardingPage() {
  const isAdmin = await isPlatformAdmin();
  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Fetch all sessions and analytics
  const [sessionsResult, analyticsResult] = await Promise.all([
    getOnboardingSessionsAction(),
    getOnboardingAnalyticsAction(),
  ]);

  const sessions = sessionsResult.isSuccess ? sessionsResult.data : [];
  const analytics = analyticsResult.isSuccess ? analyticsResult.data : null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Client Onboarding</h1>
        <p className="text-gray-600 mt-2">
          Manage and monitor all client onboarding sessions
        </p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.completed}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.completionRate.toFixed(1)}% completion rate
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
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{analytics.pending}</div>
              <p className="text-xs text-muted-foreground">Not started yet</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Onboarding Sessions</CardTitle>
          <CardDescription>
            View, manage, and send invitations for client onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingSessionsList sessions={sessions || []} />
        </CardContent>
      </Card>
    </div>
  );
}
