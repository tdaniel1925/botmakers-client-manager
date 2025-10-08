"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { getActiveCampaignsForProjectAction, getCampaignAnalyticsAction } from "@/actions/voice-campaign-actions";
import type { SelectVoiceCampaign } from "@/db/schema";

interface CampaignDashboardWidgetProps {
  projectId: string;
  onCreateNew?: () => void;
  onViewAll?: () => void;
}

export function CampaignDashboardWidget({ 
  projectId, 
  onCreateNew,
  onViewAll 
}: CampaignDashboardWidgetProps) {
  const [campaigns, setCampaigns] = useState<SelectVoiceCampaign[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, [projectId]);
  
  const loadData = async () => {
    setLoading(true);
    const [campaignsResult, analyticsResult] = await Promise.all([
      getActiveCampaignsForProjectAction(projectId),
      getCampaignAnalyticsAction(projectId),
    ]);
    
    if (campaignsResult.campaigns) {
      setCampaigns(campaignsResult.campaigns);
    }
    
    if (analyticsResult.analytics) {
      setAnalytics(analyticsResult.analytics);
    }
    
    setLoading(false);
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Voice Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }
  
  // No campaigns yet
  if (campaigns.length === 0 && (!analytics || analytics.totalCampaigns === 0)) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Voice Campaigns
          </CardTitle>
          <CardDescription>
            Create AI voice agents to handle calls automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">No Voice Campaigns Yet</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
              Set up an AI voice agent in minutes to handle inbound or outbound calls
            </p>
            {onCreateNew && (
              <Button onClick={onCreateNew} size="default" className="w-full max-w-xs">
                <Plus className="h-4 w-4 mr-2" />
                Create First Campaign
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Voice Campaigns
            </CardTitle>
            <CardDescription>
              {analytics?.activeCampaigns || 0} active campaigns
            </CardDescription>
          </div>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold">{analytics?.totalCalls || 0}</div>
            <div className="text-xs text-gray-500">Total Calls</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold">{analytics?.successRate || 0}%</div>
            <div className="text-xs text-gray-500">Success Rate</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold">
              {analytics?.avgCallDuration 
                ? `${Math.floor(analytics.avgCallDuration / 60)}m`
                : "0m"}
            </div>
            <div className="text-xs text-gray-500">Avg Duration</div>
          </div>
        </div>
        
        {/* Active Campaigns List */}
        <div className="flex-1">
          <h4 className="text-sm font-semibold mb-3">Active Campaigns</h4>
          <div className="space-y-2">
            {campaigns.slice(0, 3).map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{campaign.name}</p>
                    <Badge variant="outline" className="text-xs uppercase shrink-0">
                      {campaign.provider}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1 truncate">
                      <Phone className="h-3 w-3 shrink-0" />
                      {campaign.phoneNumber || "No number"}
                    </span>
                    <span>•</span>
                    <span className="shrink-0">{campaign.totalCalls || 0} calls</span>
                  </div>
                </div>
                
                {campaign.totalCalls && campaign.totalCalls > 0 && (
                  <TrendingUp className="h-4 w-4 text-green-500 shrink-0 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {onCreateNew && (
            <Button variant="outline" size="sm" onClick={onCreateNew} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          )}
          {onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll} className="flex-1">
              View All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
