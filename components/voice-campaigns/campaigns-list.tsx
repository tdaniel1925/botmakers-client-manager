"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { CampaignCard } from "./campaign-card";
import { useCampaignStore } from "@/lib/stores/campaign-store";
import { CampaignListSkeleton } from "@/components/ui/loading-skeleton";
import { useBulkPhoneNumberPolling } from "@/hooks/use-phone-number-polling";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import type { SelectVoiceCampaign } from "@/db/schema";

interface CampaignsListProps {
  projectId: string;
  onCreateNew?: () => void;
  onEditCampaign?: (campaign: SelectVoiceCampaign) => void;
  onViewDetails?: (campaign: SelectVoiceCampaign) => void;
}

export function CampaignsList({ 
  projectId, 
  onCreateNew, 
  onEditCampaign,
  onViewDetails 
}: CampaignsListProps) {
  const router = useRouter();
  const { campaigns, loading, fetchCampaigns } = useCampaignStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    fetchCampaigns(projectId);
  }, [projectId, fetchCampaigns]);

  // Auto-poll pending phone numbers
  const { pollingCount } = useBulkPhoneNumberPolling(
    campaigns.map((c) => ({ id: c.id, phoneNumber: c.phoneNumber || "" }))
  );
  
  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign) => {
    // Search filter
    if (searchQuery && !campaign.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== "all" && campaign.status !== statusFilter) {
      return false;
    }
    
    // Provider filter
    if (providerFilter !== "all" && campaign.provider !== providerFilter) {
      return false;
    }
    
    return true;
  });
  
  if (loading) {
    return <CampaignListSkeleton count={6} />;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Voice Campaigns</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-600 text-sm">
              Manage your AI voice agents and phone campaigns
            </p>
            {pollingCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                {pollingCount} provisioning
              </Badge>
            )}
          </div>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        )}
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={providerFilter} onValueChange={setProviderFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="vapi">AI Agent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Stats Summary */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">{campaigns.length}</div>
            <div className="text-sm text-blue-700">Total Campaigns</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-900">
              {campaigns.filter(c => c.status === "active").length}
            </div>
            <div className="text-sm text-green-700">Active</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-900">
              {campaigns.reduce((sum, c) => sum + (c.totalCalls || 0), 0)}
            </div>
            <div className="text-sm text-purple-700">Total Calls</div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-900">
              ${(campaigns.reduce((sum, c) => sum + (c.totalCost || 0), 0) / 100).toFixed(2)}
            </div>
            <div className="text-sm text-orange-700">Total Cost</div>
          </div>
        </div>
      )}
      
      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {campaigns.length === 0 ? "No campaigns yet" : "No campaigns match your filters"}
          </h3>
          <p className="text-gray-500 mb-4">
            {campaigns.length === 0 
              ? "Create your first voice campaign to get started"
              : "Try adjusting your search or filters"}
          </p>
          {campaigns.length === 0 && onCreateNew && (
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Button>
          )}
        </div>
      ) : (
          <div className="space-y-3">
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="relative">
                <CampaignCard
                  campaign={campaign}
                  onEdit={() => onEditCampaign?.(campaign)}
                  onViewDetails={() => onViewDetails?.(campaign)}
                  onDeleted={() => fetchCampaigns(projectId, true)}
                />
                {campaign.phoneNumber === "pending" && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="secondary" className="shadow-md animate-pulse">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      <span className="text-xs">Provisioning...</span>
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
      )}
    </div>
  );
}
