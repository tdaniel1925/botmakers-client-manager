"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneCall, Clock, DollarSign, TrendingUp, CheckCircle2, XCircle } from "lucide-react";

interface CampaignStats {
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  todayCalls: number;
  weekCalls: number;
  averageDuration: number;
  totalCost: number;
  successRate: number;
}

interface StatsDashboardProps {
  stats: CampaignStats;
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCost = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Calls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          <PhoneCall className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCalls}</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.todayCalls} today, {stats.weekCalls} this week
          </p>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.successRate}%</div>
          <div className="flex items-center gap-3 mt-1 text-xs">
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {stats.completedCalls} completed
            </span>
            <span className="text-red-600 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              {stats.failedCalls} failed
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Average Duration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatDuration(stats.averageDuration)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Per call average
          </p>
        </CardContent>
      </Card>

      {/* Total Cost */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCost(stats.totalCost)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.totalCalls > 0
              ? `${formatCost(Math.round(stats.totalCost / stats.totalCalls))} per call`
              : "No calls yet"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
