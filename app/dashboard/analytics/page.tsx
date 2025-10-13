import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserOrganizationsAction } from "@/actions/organizations-actions";
import { getSalesMetricsAction, getActivityMetricsAction, getPipelineMetricsAction } from "@/actions/analytics-actions";
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AnalyticsPage() {
  // Get user's organization
  const orgsResult = await getUserOrganizationsAction();
  
  if (!orgsResult.isSuccess || !orgsResult.data || orgsResult.data.length === 0) {
    return (
      <main className="p-6 md:p-10">
        <div className="max-w-2xl mx-auto text-center mt-20">
          <h1 className="text-3xl font-bold mb-4">No Organization Found</h1>
          <p className="text-gray-600">You need to be part of an organization to view analytics.</p>
        </div>
      </main>
    );
  }
  
  const currentOrg = orgsResult.data[0];
  
  // Fetch all metrics
  const [salesMetrics, activityMetrics, pipelineMetrics] = await Promise.all([
    getSalesMetricsAction(currentOrg.id),
    getActivityMetricsAction(currentOrg.id),
    getPipelineMetricsAction(currentOrg.id),
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <main className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Performance metrics and insights</p>
      </div>

      {/* Sales Metrics */}
      {salesMetrics.isSuccess && salesMetrics.data && (
        <>
          <h2 className="text-xl font-bold mb-4">Sales Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
                <Target className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesMetrics.data.totalDeals}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    Won: {salesMetrics.data.wonDeals}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Lost: {salesMetrics.data.lostDeals}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(salesMetrics.data.totalValue)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Won: {formatCurrency(salesMetrics.data.wonValue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatPercent(salesMetrics.data.winRate)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Of closed deals
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(salesMetrics.data.averageDealSize)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Per deal
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Pipeline Distribution */}
      {pipelineMetrics.isSuccess && pipelineMetrics.data && (
        <>
          <h2 className="text-xl font-bold mb-4">Pipeline Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Deals by Stage</CardTitle>
                <CardDescription>Distribution across pipeline stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelineMetrics.data.stageDistribution.map((stage) => (
                    <div key={stage.stage}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{stage.stage}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{stage.count} deals</Badge>
                          <span className="text-sm text-gray-600">
                            {formatCurrency(stage.value)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              salesMetrics.data
                                ? (stage.count / salesMetrics.data.totalDeals) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Average Deal Velocity</span>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(pipelineMetrics.data.avgDealVelocity)} days
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    From creation to close
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Conversion Rate</span>
                    <Target className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold">
                    {salesMetrics.data && formatPercent(salesMetrics.data.conversionRate)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Contacts to deals
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Deals Created (30d)</span>
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold">
                    {pipelineMetrics.data.dealsCreatedOverTime.reduce((sum, d) => sum + d.count, 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Last 30 days
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Activity Metrics */}
      {activityMetrics.isSuccess && activityMetrics.data && (
        <>
          <h2 className="text-xl font-bold mb-4">Activity Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                <Activity className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activityMetrics.data.totalActivities}</div>
                <p className="text-xs text-gray-500 mt-1">
                  All time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {activityMetrics.data.completedActivities}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatPercent(activityMetrics.data.completionRate)} completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {activityMetrics.data.overdueActivities}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Need attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Common</CardTitle>
                <Activity className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {Object.entries(activityMetrics.data.activitiesByType)
                    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Activity type
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activities by Type</CardTitle>
              <CardDescription>Breakdown of activity types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(activityMetrics.data.activitiesByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{type}</span>
                        <Badge variant="outline">{count} activities</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${(count / (activityMetrics.data?.totalActivities || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}



