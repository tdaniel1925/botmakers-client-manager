/**
 * Organization Dashboard Overview Page
 * Displays project metrics, recent activities, and quick actions
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription, GradientCardContent } from "@/components/ui/gradient-card";
import { getUserOrganizationsAction } from "@/actions/organizations-actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { DashboardMetricsSkeleton } from "@/components/crm/loading-skeleton";
import { ErrorState } from "@/components/crm/error-state";
import { auth } from "@clerk/nextjs/server";
import { isPlatformAdmin } from "@/db/queries/platform-queries";
import { getProjectStats, getProjectsByOrganization } from "@/db/queries/projects-queries";
import { getActivities } from "@/db/queries/activities-queries";
import { ProjectSummaryCards } from "@/components/dashboard/project-summary-cards";
import { RecentActivitiesWidget } from "@/components/dashboard/recent-activities-widget";
import { ProjectProgressOverview } from "@/components/dashboard/project-progress-overview";
import { RecentlyViewedWidget } from "@/components/dashboard/recently-viewed-widget";
import { DashboardTourWrapper } from "@/components/onboarding/dashboard-tour-wrapper";
import { FolderKanban, Activity, BarChart3, ArrowRight } from "lucide-react";

// Cache revalidation (stats refresh every 5 minutes)
export const revalidate = 300;

/**
 * Main organization dashboard page component
 */
export default async function DashboardPage() {
  // Check if user is platform admin
  const { userId } = await auth();
  const isAdmin = userId ? await isPlatformAdmin(userId) : false;
  
  // Get user's organizations
  const orgsResult = await getUserOrganizationsAction();
  
  if (!orgsResult.isSuccess) {
    return (
      <main className="p-4 md:p-6 lg:p-10">
        <ErrorState
          title="Failed to Load Organizations"
          message={orgsResult.message || "Unable to fetch your organizations. Please try again."}
          showHome={true}
        />
      </main>
    );
  }
  
  if (!orgsResult.data || orgsResult.data.length === 0) {
    // No organizations - show onboarding
    return (
      <main className="p-4 md:p-6 lg:p-10">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Welcome to ClientFlow</h1>
          <p className="text-gray-600 mb-8">
            You don't have access to any organizations yet. Please contact your administrator.
          </p>
          {isAdmin && (
            <Link href="/platform/organizations">
              <Button>
                Go to Platform Admin
              </Button>
            </Link>
          )}
        </div>
      </main>
    );
  }
  
  // Get the first organization (for now, handle multi-org later)
  const currentOrg = orgsResult.data[0];
  
  return (
    <main className="p-8 max-w-[1400px] mx-auto space-y-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600 mt-2">
            Welcome back! Here's an overview of {currentOrg.name}
          </p>
        </div>
        {isAdmin && (
          <Link href="/platform/dashboard">
            <Button variant="outline" className="rounded-full">
              Platform Admin →
            </Button>
          </Link>
        )}
      </div>
      
      <Suspense fallback={<DashboardMetricsSkeleton />}>
        <DashboardContent organizationId={currentOrg.id} />
      </Suspense>
      
      {/* Onboarding Tour */}
      <DashboardTourWrapper />
    </main>
  );
}

/**
 * Dashboard content component with data fetching
 */
async function DashboardContent({ organizationId }: { organizationId: string }) {
  try {
    // Fetch all data in parallel
    const [projectStats, projects, activitiesResult] = await Promise.all([
      getProjectStats(organizationId),
      getProjectsByOrganization(organizationId),
      getActivities(organizationId, { limit: 10, sortBy: "createdAt", sortOrder: "desc" }),
    ]);

    // Calculate stats
    const stats = {
      total: projects.length,
      active: projectStats.active || 0,
      planning: projectStats.planning || 0,
      completed: projectStats.completed || 0,
    };

    return (
      <div className="space-y-8">
        {/* Project Summary Cards */}
        <ProjectSummaryCards stats={stats} />

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <RecentActivitiesWidget activities={activitiesResult.activities} />

          {/* Recently Viewed */}
          <RecentlyViewedWidget />

          {/* Quick Actions */}
          <GradientCard variant="indigo">
            <GradientCardHeader>
              <GradientCardTitle className="text-xl">Quick Actions</GradientCardTitle>
              <GradientCardDescription>
                Navigate to key areas of your organization
              </GradientCardDescription>
            </GradientCardHeader>
            <GradientCardContent className="space-y-3">
              <Link href="/dashboard/projects">
                <Button variant="outline" className="w-full justify-start rounded-full" size="lg">
                  <FolderKanban className="mr-2 h-5 w-5" />
                  View All Projects
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/activities">
                <Button variant="outline" className="w-full justify-start rounded-full" size="lg">
                  <Activity className="mr-2 h-5 w-5" />
                  View All Activities
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full justify-start rounded-full" size="lg">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Analytics
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
            </GradientCardContent>
          </GradientCard>
        </div>

        {/* Active Projects Overview */}
        <ProjectProgressOverview projects={projects} />
      </div>
    );
  } catch (error) {
    console.error("Error loading dashboard:", error);
    return (
      <ErrorState
        title="Failed to Load Dashboard"
        message="We encountered an error while loading your dashboard. Please try refreshing the page."
      />
    );
  }
}