import { getCallStatsAction } from "@/actions/calls-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Clock, Star, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CallsAnalyticsWidgetProps {
  projectId: string;
  viewType: "admin" | "org";
}

export async function CallsAnalyticsWidget({ projectId, viewType }: CallsAnalyticsWidgetProps) {
  const statsResult = await getCallStatsAction(projectId);
  
  if (statsResult.error || !statsResult.stats) {
    return null; // Don't show widget if no stats available
  }
  
  const stats = statsResult.stats;
  
  // Don't show if no calls yet
  if (stats.total === 0) {
    return null;
  }
  
  const baseUrl = viewType === "admin" ? "/platform" : "/dashboard";
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Call Analytics</CardTitle>
        <Link href={`${baseUrl}/projects/${projectId}/calls`}>
          <Button variant="outline" size="sm">
            View All Calls
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>Total Calls</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Avg Duration</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgDuration}m</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star className="h-4 w-4" />
              <span>Avg Rating</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgRating}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertTriangle className="h-4 w-4" />
              <span>Follow-ups</span>
            </div>
            <p className="text-2xl font-bold">{stats.followUpCount}</p>
          </div>
        </div>
        
        {/* Sentiment Distribution */}
        {stats.sentimentDistribution && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Sentiment Distribution
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Positive</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(stats.sentimentDistribution.positive / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-medium w-8 text-right">
                    {stats.sentimentDistribution.positive}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Neutral</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-500 h-2 rounded-full"
                      style={{
                        width: `${(stats.sentimentDistribution.neutral / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-medium w-8 text-right">
                    {stats.sentimentDistribution.neutral}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Negative</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${(stats.sentimentDistribution.negative / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-medium w-8 text-right">
                    {stats.sentimentDistribution.negative}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
