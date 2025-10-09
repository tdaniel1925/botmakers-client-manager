"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientCard } from "@/components/ui/gradient-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DealFormDialog } from "@/components/crm/deal-form-dialog";
import { 
  getDealsByStageAction,
  getDealsAction,
  updateDealAction,
  deleteDealAction,
  getDealStagesAction,
  getDealValueByStageAction,
  getTotalDealValueAction
} from "@/actions/deals-actions";
import { SelectDeal, SelectDealStage } from "@/db/schema";
import { 
  DollarSign,
  Search,
  Filter,
  Plus,
  Mail,
  Calendar,
  MoreVertical,
  Loader2,
  X,
  TrendingUp,
  ChevronDown,
  List,
  LayoutGrid,
  Download,
  Tag,
  CheckSquare
} from "lucide-react";
import { toast } from "sonner";
import { useOrganization } from "@/lib/organization-context";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { SkeletonStats, SkeletonKanbanBoard } from "@/components/ui/skeleton-card";
import { EmptyState, FilteredEmptyState } from "@/components/ui/empty-state";

const STAGE_COLORS: Record<string, string> = {
  lead: "bg-gray-100 text-gray-800 border-gray-200",
  qualified: "bg-blue-100 text-blue-800 border-blue-200",
  proposal: "bg-purple-100 text-purple-800 border-purple-200",
  negotiation: "bg-yellow-100 text-yellow-800 border-yellow-200",
  closed_won: "bg-green-100 text-green-800 border-green-200",
  closed_lost: "bg-red-100 text-red-800 border-red-200",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "No date";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

interface DealCardProps {
  deal: SelectDeal & { contactName?: string };
  onEdit: (deal: SelectDeal) => void;
  onDelete: (dealId: string) => void;
  onClick: (dealId: string) => void;
}

function DealCard({ deal, onEdit, onDelete, onClick }: DealCardProps) {
  const probability = deal.probability || 0;
  
  return (
    <Card 
      className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(deal.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm line-clamp-2">{deal.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit(deal);
              }}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onClick(deal.id);
              }}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(deal.id);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2">
          {deal.contactName && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px]">
                  {deal.contactName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{deal.contactName}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-green-600">
              {formatCurrency(Number(deal.value))}
            </span>
            <Badge variant="outline" className="text-xs">
              {probability}%
            </Badge>
          </div>
          
          {deal.expectedCloseDate && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(deal.expectedCloseDate)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface KanbanColumnProps {
  stage: SelectDealStage;
  deals: (SelectDeal & { contactName?: string })[];
  onEdit: (deal: SelectDeal) => void;
  onDelete: (dealId: string) => void;
  onDealClick: (dealId: string) => void;
  totalValue: number;
}

function KanbanColumn({ stage, deals, onEdit, onDelete, onDealClick, totalValue }: KanbanColumnProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedDeals = showAll ? deals : deals.slice(0, 10);
  const hasMore = deals.length > 10;
  
  return (
    <div className="flex-shrink-0 w-80">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">{stage.name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {deals.length} deal{deals.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-semibold">
              {formatCurrency(totalValue)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 max-h-[calc(100vh-300px)] overflow-y-auto">
          {deals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <DollarSign className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No deals</p>
            </div>
          ) : (
            <>
              {displayedDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onClick={onDealClick}
                />
              ))}
              {hasMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Show Less" : `Show ${deals.length - 10} More`}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DealsPage() {
  const { confirm, ConfirmDialog } = useConfirm();
  const { organizationId } = useOrganization();
  const router = useRouter();
  
  const [dealsByStage, setDealsByStage] = useState<Record<string, (SelectDeal & { contactName?: string })[]>>({});
  const [stages, setStages] = useState<SelectDealStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [stageValues, setStageValues] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<SelectDeal | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (organizationId) {
      loadDeals();
      loadStages();
      loadMetrics();
    }
  }, [organizationId]);

  const loadDeals = async () => {
    if (!organizationId) return;
    
    setIsLoading(true);
    try {
      const result = await getDealsByStageAction(organizationId);
      
      if (result.isSuccess && result.data) {
        setDealsByStage(result.data);
      } else {
        toast.error(result.message || "Failed to load deals");
      }
    } catch (error) {
      console.error("Error loading deals:", error);
      toast.error("Failed to load deals");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStages = async () => {
    if (!organizationId) return;
    
    try {
      const result = await getDealStagesAction(organizationId);
      if (result.isSuccess && result.data) {
        setStages(result.data);
      }
    } catch (error) {
      console.error("Error loading stages:", error);
    }
  };

  const loadMetrics = async () => {
    if (!organizationId) return;
    
    try {
      const [totalResult, stageResult] = await Promise.all([
        getTotalDealValueAction(organizationId),
        getDealValueByStageAction(organizationId),
      ]);
      
      if (totalResult.isSuccess && totalResult.data) {
        setTotalValue(totalResult.data);
      }
      
      if (stageResult.isSuccess && stageResult.data) {
        setStageValues(stageResult.data);
      }
    } catch (error) {
      console.error("Error loading metrics:", error);
    }
  };

  const handleEdit = (deal: SelectDeal) => {
    setEditDeal(deal);
    setEditDialogOpen(true);
  };

  const handleDelete = async (dealId: string) => {
    if (!organizationId) return;
    
    const confirmed = await confirm({
      title: "Delete Deal",
      description: "Are you sure you want to delete this deal? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive"
    });

    if (!confirmed) return;

    const result = await deleteDealAction(dealId, organizationId);
    
    if (result.isSuccess) {
      toast.success("Deal deleted successfully");
      loadDeals();
      loadMetrics();
    } else {
      toast.error(result.message || "Failed to delete deal");
    }
  };

  const handleDealClick = (dealId: string) => {
    router.push(`/dashboard/deals/${dealId}`);
  };

  const handleSuccess = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setEditDeal(null);
    loadDeals();
    loadMetrics();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStageFilter("all");
  };

  const hasActiveFilters = searchQuery || stageFilter !== "all";

  // Filter deals based on search and stage
  const filteredDealsByStage = Object.entries(dealsByStage).reduce((acc, [stage, deals]) => {
    let filtered = deals;
    
    if (searchQuery) {
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.contactName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (stageFilter !== "all" && stage !== stageFilter) {
      return acc;
    }
    
    acc[stage] = filtered;
    return acc;
  }, {} as Record<string, (SelectDeal & { contactName?: string })[]>);

  const allFilteredDeals = Object.values(filteredDealsByStage).flat();
  const filteredTotalValue = allFilteredDeals.reduce((sum, deal) => sum + Number(deal.value), 0);

  const handleExportCSV = () => {
    // Prepare CSV data
    const headers = ['Title', 'Contact', 'Stage', 'Value', 'Probability', 'Expected Close Date', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...allFilteredDeals.map(deal => [
        `"${deal.title}"`,
        `"${deal.contactName || 'N/A'}"`,
        stages.find(s => s.id === deal.stageId)?.name || 'Unknown',
        deal.value,
        `${deal.probability || 0}%`,
        deal.expectedCloseDate || 'N/A',
        new Date(deal.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deals-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${allFilteredDeals.length} deals to CSV`);
  };

  if (!organizationId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Organization Selected</h3>
          <p className="text-gray-600">Please select an organization to view deals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Deals Pipeline</h1>
          <p className="text-neutral-600">
            Track and manage your sales opportunities
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Metrics */}
      {isLoading ? (
        <SkeletonStats />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <GradientCard variant="teal" className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-teal-600" />
            <span className="text-3xl font-semibold text-teal-600">
              {formatCurrency(hasActiveFilters ? filteredTotalValue : totalValue)}
            </span>
          </div>
          <span className="text-sm text-neutral-600">Total Pipeline Value</span>
        </GradientCard>
        
        <GradientCard variant="none" className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-5 h-5 text-neutral-600" />
            <span className="text-3xl font-semibold">
              {hasActiveFilters ? allFilteredDeals.length : Object.values(dealsByStage).flat().length}
            </span>
          </div>
          <span className="text-sm text-neutral-600">Total Deals</span>
        </GradientCard>
        
        <GradientCard variant="indigo" className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span className="text-3xl font-semibold text-indigo-600">
              {formatCurrency(
                allFilteredDeals.length > 0
                  ? filteredTotalValue / allFilteredDeals.length
                  : 0
              )}
            </span>
          </div>
          <span className="text-sm text-neutral-600">Avg Deal Value</span>
        </GradientCard>
        
        <GradientCard variant="emerald" className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            <span className="text-3xl font-semibold text-emerald-600">
              {formatCurrency(stageValues['closed_won'] || 0)}
            </span>
          </div>
          <span className="text-sm text-neutral-600">Closed Won</span>
        </GradientCard>
      </div>
      )}

      {/* Search and View Controls */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar and View Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search deals by title or contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 border rounded-md">
                <Button
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                >
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Kanban
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-gray-100" : ""}
              >
                <Filter className="h-4 w-4" />
              </Button>
              {allFilteredDeals.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleExportCSV}
                  title="Export to CSV"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filter Bar */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Stage:</span>
                  <Select value={stageFilter} onValueChange={setStageFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        viewMode === "kanban" ? (
          <SkeletonKanbanBoard />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      ) : viewMode === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageDeals = filteredDealsByStage[stage.id] || [];
            const stageTotal = stageDeals.reduce((sum, deal) => sum + Number(deal.value), 0);
            
            return (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                deals={stageDeals}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDealClick={handleDealClick}
                totalValue={stageTotal}
              />
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            {allFilteredDeals.length === 0 ? (
              hasActiveFilters ? (
                <FilteredEmptyState 
                  onClearFilters={clearFilters}
                  resourceName="deals"
                />
              ) : (
                <EmptyState
                  icon={DollarSign}
                  title="No deals yet"
                  description="Start tracking your sales opportunities by creating your first deal. Monitor progress, value, and close rates all in one place."
                  action={{
                    label: "Add Deal",
                    onClick: () => setCreateDialogOpen(true),
                    icon: Plus
                  }}
                />
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allFilteredDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onClick={handleDealClick}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <DealFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSuccess}
        organizationId={organizationId}
      />

      {editDeal && (
        <DealFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleSuccess}
          organizationId={organizationId}
          deal={editDeal}
          mode="edit"
        />
      )}

      <ConfirmDialog />
    </div>
  );
}

