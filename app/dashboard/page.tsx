/**
 * CRM Dashboard Overview Page
 * Displays key metrics, charts, and recent activity
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserOrganizationsAction } from "@/actions/organizations-actions";
import { getContactCountByStatusAction } from "@/actions/contacts-actions";
import { getTotalDealValueAction, getDealValueByStageAction } from "@/actions/deals-actions";
import { getOverdueActivitiesAction, getTodaysActivitiesAction } from "@/actions/activities-actions";
import { redirect } from "next/navigation";
import { UserCircle, Briefcase, DollarSign, TrendingUp, AlertCircle, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { DashboardMetricsSkeleton } from "@/components/crm/loading-skeleton";
import { ErrorState } from "@/components/crm/error-state";
import { getPlatformAdminPreferences } from "@/db/queries/notification-preferences-queries";
import { auth } from "@clerk/nextjs/server";

// ✅ FIX BUG-028: Add cache revalidation (stats refresh every 5 minutes)
export const revalidate = 300; // 5 minutes in seconds

/**
 * Main CRM dashboard page component
 */
export default async function DashboardPage() {
  // Check if user is platform admin
  const { userId } = await auth();
  const isPlatformAdmin = userId ? !!(await getPlatformAdminPreferences(userId)) : false;
  
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
        <div className="max-w-2xl mx-auto text-center mt-10 md:mt-20">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Welcome to Your CRM!</h1>
          <p className="text-gray-600 mb-8 text-sm md:text-base">
            To get started, you need to create an organization. This will be your workspace for managing contacts, deals, and activities.
          </p>
          <Card className="p-6">
            <p className="text-sm text-gray-500">Contact your administrator to be added to an organization.</p>
          </Card>
        </div>
      </main>
    );
  }
  
  const currentOrg = orgsResult.data[0];
  
  // Fetch dashboard metrics
  const [contactCounts, totalDealValue, dealValueByStage, overdueActivities, todaysActivities] = await Promise.all([
    getContactCountByStatusAction(currentOrg.id),
    getTotalDealValueAction(currentOrg.id),
    getDealValueByStageAction(currentOrg.id),
    getOverdueActivitiesAction(currentOrg.id),
    getTodaysActivitiesAction(currentOrg.id),
  ]);
  
  const totalContacts = Object.values(contactCounts.data || {}).reduce((sum, count) => sum + count, 0);
  const activeDealsValue = Object.entries(dealValueByStage.data || {})
    .filter(([stage]) => !["Won", "Lost"].includes(stage))
    .reduce((sum, [, value]) => sum + value, 0);
  
  return (
    <main className="p-4 md:p-6 lg:p-10">
      <div className="mb-6 md:mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600">{currentOrg.name} • <span className="capitalize">{currentOrg.role}</span></p>
        </div>
        
        {/* Platform Admin Access Button */}
        {isPlatformAdmin && (
          <Link href="/platform/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Platform Admin</span>
            </Button>
          </Link>
        )}
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <UserCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
            <p className="text-xs text-gray-500 mt-1">
              {contactCounts.data?.lead || 0} leads
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${activeDealsValue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pipeline value
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won Deals</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(dealValueByStage.data?.Won || 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Revenue closed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaysActivities.data?.length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {overdueActivities.data?.length || 0} overdue
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Overdue Activities
            </CardTitle>
            <CardDescription>
              Tasks that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!overdueActivities.data || overdueActivities.data.length === 0 ? (
              <p className="text-sm text-gray-500">No overdue activities</p>
            ) : (
              <div className="space-y-3">
                {overdueActivities.data.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start justify-between border-b pb-2 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.subject}</p>
                      <p className="text-xs text-gray-500">
                        {activity.dueDate && new Date(activity.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
                {overdueActivities.data.length > 5 && (
                  <Link href="/dashboard/activities" className="text-sm text-blue-600 hover:underline">
                    View all {overdueActivities.data.length} overdue
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Activities</CardTitle>
            <CardDescription>
              Your schedule for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!todaysActivities.data || todaysActivities.data.length === 0 ? (
              <p className="text-sm text-gray-500">No activities scheduled for today</p>
            ) : (
              <div className="space-y-3">
                {todaysActivities.data.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start justify-between border-b pb-2 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.subject}</p>
                      <p className="text-xs text-gray-500">
                        {activity.dueDate && new Date(activity.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge variant={activity.completed ? "secondary" : "default"} className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
                {todaysActivities.data.length > 5 && (
                  <Link href="/dashboard/activities" className="text-sm text-blue-600 hover:underline">
                    View all {todaysActivities.data.length} today
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-6 md:mt-8">
        <h2 className="text-lg md:text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/dashboard/contacts">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <UserCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Add Contact</p>
                  <p className="text-xs text-gray-500">Create a new contact</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/dashboard/deals">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Create Deal</p>
                  <p className="text-xs text-gray-500">Start a new opportunity</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/dashboard/activities">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Log Activity</p>
                  <p className="text-xs text-gray-500">Track your work</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
} 