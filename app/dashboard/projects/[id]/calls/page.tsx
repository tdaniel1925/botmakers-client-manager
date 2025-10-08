import { getProjectCallsAction, getCallStatsAction } from "@/actions/calls-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Clock, Star, AlertTriangle } from "lucide-react";
import { CallsList } from "@/components/calls/calls-list";
import Link from "next/link";

export default async function ProjectCallsPage({ params }: { params: { id: string } }) {
  const { id: projectId } = params;
  
  const callsResult = await getProjectCallsAction(projectId);
  const statsResult = await getCallStatsAction(projectId);
  
  if (callsResult.error || !callsResult.calls) {
    return (
      <div className="p-8">
        <p className="text-red-500">{callsResult.error || "Failed to load calls"}</p>
      </div>
    );
  }
  
  const calls = callsResult.calls;
  const stats = statsResult.stats || {
    total: 0,
    avgDuration: 0,
    avgRating: 0,
    followUpCount: 0,
  };
  
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Call Records</h1>
          <p className="text-gray-500 mt-1">AI voice agent call tracking and analysis</p>
        </div>
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Project
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Total Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.avgDuration}m</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Follow-ups Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.followUpCount}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Calls List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <CallsList calls={calls} />
        </CardContent>
      </Card>
    </div>
  );
}
