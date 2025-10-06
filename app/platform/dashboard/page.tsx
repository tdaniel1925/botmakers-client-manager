import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlatformStatsAction, getAllOrganizationsAction } from "@/actions/platform-actions";
import { Building2, Users, TrendingUp, AlertCircle, LineChart } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function PlatformDashboardPage() {
  // Fetch platform stats and organizations
  const [statsResult, orgsResult] = await Promise.all([
    getPlatformStatsAction(),
    getAllOrganizationsAction(),
  ]);

  const stats = statsResult.data || {
    totalOrganizations: 0,
    totalUsers: 0,
    organizationsByStatus: {},
  };

  const organizations = orgsResult.data || [];
  const recentOrgs = organizations.slice(0, 5);

  const activeOrgs = stats.organizationsByStatus?.active || 0;
  const trialOrgs = stats.organizationsByStatus?.trial || 0;
  const suspendedOrgs = stats.organizationsByStatus?.suspended || 0;

  return (
    <main className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Dashboard</h1>
        <p className="text-gray-600">Overview of all organizations and platform metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
            <p className="text-xs text-gray-500 mt-1">
              {activeOrgs} active, {trialOrgs} trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Across all organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Organizations</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrgs}</div>
            <p className="text-xs text-gray-500 mt-1">Paid subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspendedOrgs}</div>
            <p className="text-xs text-gray-500 mt-1">Suspended orgs</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Organizations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Organizations</CardTitle>
            <Link
              href="/platform/organizations"
              className="text-sm text-blue-600 hover:underline"
            >
              View all →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrgs.length === 0 ? (
            <p className="text-sm text-gray-500">No organizations yet</p>
          ) : (
            <div className="space-y-4">
              {recentOrgs.map((org) => (
                <Link
                  key={org.id}
                  href={`/platform/organizations/${org.id}`}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{org.name}</p>
                        <p className="text-sm text-gray-500">
                          {org.userCount} user{org.userCount !== 1 ? 's' : ''} · Created{' '}
                          {new Date(org.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                      {org.status}
                    </Badge>
                    <Badge variant="outline">{org.plan}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/platform/organizations/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Create Organization</p>
                  <p className="text-xs text-gray-500">Add a new client</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/platform/organizations">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Manage Organizations</p>
                  <p className="text-xs text-gray-500">View and edit all orgs</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/platform/analytics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <LineChart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">View Analytics</p>
                  <p className="text-xs text-gray-500">Platform insights</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
}

