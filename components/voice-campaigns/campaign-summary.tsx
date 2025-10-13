"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, Users, Clock, Globe2, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { getCampaignContactStatsAction } from "@/actions/campaign-contacts-actions";
import { SelectVoiceCampaign } from "@/db/schema";

interface CampaignSummaryProps {
  campaign: SelectVoiceCampaign;
}

const TIMEZONE_LABELS: Record<string, string> = {
  ET: "Eastern Time (UTC-5)",
  CT: "Central Time (UTC-6)",
  MT: "Mountain Time (UTC-7)",
  PT: "Pacific Time (UTC-8)",
  AKT: "Alaska Time (UTC-9)",
  HAT: "Hawaii Time (UTC-10)",
  unknown: "Unknown Timezone",
};

const TIMEZONE_COLORS: Record<string, string> = {
  ET: "bg-blue-100 text-blue-800 border-blue-200",
  CT: "bg-green-100 text-green-800 border-green-200",
  MT: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PT: "bg-purple-100 text-purple-800 border-purple-200",
  AKT: "bg-pink-100 text-pink-800 border-pink-200",
  HAT: "bg-orange-100 text-orange-800 border-orange-200",
  unknown: "bg-gray-100 text-gray-800 border-gray-200",
};

export function CampaignSummary({ campaign }: CampaignSummaryProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    total: number;
    pending: number;
    completed: number;
    failed: number;
    byTimezone: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    loadStats();
  }, [campaign.id]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const result = await getCampaignContactStatsAction(campaign.id);
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Summary</CardTitle>
          <CardDescription>Overview of your campaign contacts and call statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No contacts found. Upload a contact list to get started with outbound calling.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Calculate percentages
  const pendingPercent = Math.round((stats.pending / stats.total) * 100);
  const completedPercent = Math.round((stats.completed / stats.total) * 100);
  const failedPercent = Math.round((stats.failed / stats.total) * 100);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Campaign Summary
          </CardTitle>
          <CardDescription>Overview of contacts and call statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-sm">Total Contacts</span>
              </div>
              <div className="text-3xl font-bold">{stats.total.toLocaleString()}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Pending</span>
              </div>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{pendingPercent}% of total</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Completed</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{stats.completed.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{completedPercent}% of total</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">Failed</span>
              </div>
              <div className="text-3xl font-bold text-red-600">{stats.failed.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{failedPercent}% of total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timezone Distribution */}
      {Object.keys(stats.byTimezone).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="w-5 h-5" />
              Contacts by Timezone
            </CardTitle>
            <CardDescription>
              Geographic distribution for intelligent call scheduling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Visual bars */}
              <div className="space-y-3">
                {Object.entries(stats.byTimezone)
                  .sort(([, a], [, b]) => b - a)
                  .map(([tz, count]) => {
                    const percentage = Math.round((count / stats.total) * 100);
                    return (
                      <div key={tz} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{TIMEZONE_LABELS[tz] || tz}</span>
                          <span className="text-muted-foreground">
                            {count.toLocaleString()} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${TIMEZONE_COLORS[tz]?.replace("text-", "bg-").split(" ")[0] || "bg-gray-400"}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Badge summary */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {Object.entries(stats.byTimezone)
                  .sort(([, a], [, b]) => b - a)
                  .map(([tz, count]) => (
                    <Badge
                      key={tz}
                      variant="outline"
                      className={`px-3 py-1 ${TIMEZONE_COLORS[tz] || ""}`}
                    >
                      {tz}: {count.toLocaleString()}
                    </Badge>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call Statistics (from campaign) */}
      {campaign.totalCalls && campaign.totalCalls > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Call Statistics
            </CardTitle>
            <CardDescription>Performance metrics from completed calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Calls</div>
                <div className="text-2xl font-bold">{campaign.totalCalls}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold text-green-600">{campaign.completedCalls}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Failed</div>
                <div className="text-2xl font-bold text-red-600">{campaign.failedCalls}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Avg Duration</div>
                <div className="text-2xl font-bold">
                  {campaign.averageCallDuration ? `${Math.round(campaign.averageCallDuration / 60)}m` : "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
