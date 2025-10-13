import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlatformStatsAction } from "@/actions/platform-actions";

export default async function PlatformAnalyticsPage() {
  const statsResult = await getPlatformStatsAction();
  const stats = statsResult.data;

  return (
    <main className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
        <p className="text-gray-600">Insights and metrics across all organizations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalOrganizations || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.organizationsByStatus?.active || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Organizations by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats?.organizationsByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="capitalize text-gray-700">{status}</span>
                <span className="font-semibold">{String(count)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

