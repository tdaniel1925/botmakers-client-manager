"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DealFormDialog } from "@/components/crm/deal-form-dialog";
import { DealCard } from "@/components/crm/deal-card";
import { getDealsByStageAction, updateDealAction, getDealStagesAction } from "@/actions/deals-actions";
import { getUserOrganizationsAction } from "@/actions/organizations-actions";
import { SelectDeal, SelectDealStage } from "@/db/schema";
import { Plus, Briefcase } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanSkeleton } from "@/components/crm/loading-skeleton";
import { ErrorState, EmptyState } from "@/components/crm/error-state";

function SortableDealCard({ deal }: { deal: SelectDeal & { contactName?: string } }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DealCard deal={deal} isDragging={isDragging} />
    </div>
  );
}

export default function DealsPage() {
  const [dealsByStage, setDealsByStage] = useState<Record<string, SelectDeal[]>>({});
  const [stages, setStages] = useState<SelectDealStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [activeDeal, setActiveDeal] = useState<SelectDeal | null>(null);
  
  // ✅ FIX BUG-009: Track which stages are showing all deals (for "Show More" functionality)
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const DEALS_PER_STAGE_DEFAULT = 10; // Show 10 deals per stage by default
  
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get user's organization
      const orgsResult = await getUserOrganizationsAction();
      if (!orgsResult.isSuccess || !orgsResult.data || orgsResult.data.length === 0) {
        setError("No organization found. Please contact your administrator.");
        setLoading(false);
        return;
      }
      
      const orgId = orgsResult.data[0].id;
      setOrganizationId(orgId);
      
      // Fetch deal stages
      const stagesResult = await getDealStagesAction(orgId);
      if (!stagesResult.isSuccess || !stagesResult.data) {
        setError(stagesResult.message || "Failed to load deal stages");
        setLoading(false);
        return;
      }
      setStages(stagesResult.data);
      
      // Fetch deals by stage
      const result = await getDealsByStageAction(orgId);
      if (result.isSuccess && result.data) {
        setDealsByStage(result.data);
      } else {
        setError(result.message || "Failed to load deals");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      toast({ title: "Error", description: "Failed to load deals", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const deal = Object.values(dealsByStage)
      .flat()
      .find((d) => d.id === active.id);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const dealId = active.id as string;
    const newStage = over.id as string;
    
    // Find the deal being moved
    let deal: SelectDeal | undefined;
    let oldStage: string | undefined;
    
    for (const [stage, stageDeals] of Object.entries(dealsByStage)) {
      const foundDeal = stageDeals.find((d) => d.id === dealId);
      if (foundDeal) {
        deal = foundDeal;
        oldStage = stage;
        break;
      }
    }
    
    if (!deal || !oldStage || oldStage === newStage) {
      setActiveDeal(null);
      return;
    }
    
    // Optimistic update
    const newDealsByStage = { ...dealsByStage };
    newDealsByStage[oldStage] = newDealsByStage[oldStage].filter((d) => d.id !== dealId);
    newDealsByStage[newStage] = [...(newDealsByStage[newStage] || []), { ...deal, stage: newStage }];
    setDealsByStage(newDealsByStage);
    setActiveDeal(null);
    
    // Update on server
    try {
      const result = await updateDealAction(dealId, organizationId, { stage: newStage });
      if (!result.isSuccess) {
        toast({ title: "Error", description: "Failed to update deal", variant: "destructive" });
        // Revert on error
        loadDeals();
      } else {
        toast({ title: "Success", description: `Deal moved to ${newStage}` });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update deal", variant: "destructive" });
      loadDeals();
    }
  };

  if (error && !organizationId) {
    return (
      <main className="p-4 md:p-6 lg:p-10">
        <ErrorState
          title="No Organization Found"
          message="You need to be part of an organization to manage deals."
          showHome={true}
        />
      </main>
    );
  }

  const getTotalValue = () => {
    return Object.values(dealsByStage)
      .flat()
      .reduce((sum, deal) => sum + parseFloat(deal.value.toString()), 0);
  };

  const totalDealsCount = Object.values(dealsByStage).flat().length;
  
  // ✅ FIX BUG-009: Toggle stage expansion
  const toggleStageExpansion = (stageName: string) => {
    setExpandedStages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stageName)) {
        newSet.delete(stageName);
      } else {
        newSet.add(stageName);
      }
      return newSet;
    });
  };
  
  // ✅ FIX BUG-009: Get visible deals for a stage
  const getVisibleDeals = (stageName: string, allDeals: SelectDeal[]) => {
    const isExpanded = expandedStages.has(stageName);
    return isExpanded ? allDeals : allDeals.slice(0, DEALS_PER_STAGE_DEFAULT);
  };

  return (
    <main className="p-4 md:p-6 lg:p-10">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Deals Pipeline</h1>
            <p className="text-sm md:text-base text-gray-600">
              {totalDealsCount} deals • ${getTotalValue().toLocaleString()} total value
            </p>
          </div>
          {organizationId && (
            <DealFormDialog organizationId={organizationId} onSuccess={loadDeals} />
          )}
        </div>
      </div>

      {error ? (
        <ErrorState
          title="Failed to Load Deals"
          message={error}
          onRetry={loadDeals}
        />
      ) : loading ? (
        <KanbanSkeleton />
      ) : stages.length === 0 ? (
        <EmptyState
          title="No deal stages configured"
          message="Contact your administrator to set up deal pipeline stages."
          icon={<Briefcase className="h-16 w-16" />}
        />
      ) : totalDealsCount === 0 ? (
        <EmptyState
          title="No deals yet"
          message="Create your first deal to start tracking opportunities in your pipeline."
          icon={<Briefcase className="h-16 w-16" />}
          action={{
            label: "Create First Deal",
            onClick: () => {}
          }}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const allStageDeals = dealsByStage[stage.name] || [];
              const visibleDeals = getVisibleDeals(stage.name, allStageDeals); // ✅ FIX BUG-009
              const hasMore = allStageDeals.length > DEALS_PER_STAGE_DEFAULT;
              const isExpanded = expandedStages.has(stage.name);
              
              const stageValue = allStageDeals.reduce(
                (sum, deal) => sum + parseFloat(deal.value.toString()),
                0
              );

              return (
                <div key={stage.id} className="flex-shrink-0 w-72 md:w-80">
                  <Card className="h-full">
                    <CardHeader 
                      className="pb-3"
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base md:text-lg">
                          {stage.name}
                        </CardTitle>
                        <span className="text-sm text-gray-500">
                          {allStageDeals.length}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        ${stageValue.toLocaleString()}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <SortableContext
                        items={visibleDeals.map((d) => d.id)}
                        strategy={verticalListSortingStrategy}
                        id={stage.name}
                      >
                        <div className="space-y-3 min-h-[200px]">
                          {allStageDeals.length === 0 ? (
                            <div className="text-center py-8 text-sm text-gray-400">
                              Drag deals here
                            </div>
                          ) : (
                            <>
                              {visibleDeals.map((deal) => (
                                <SortableDealCard key={deal.id} deal={deal} />
                              ))}
                              {/* ✅ FIX BUG-009: Show More/Less button */}
                              {hasMore && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full text-xs"
                                  onClick={() => toggleStageExpansion(stage.name)}
                                >
                                  {isExpanded 
                                    ? `Show Less (${visibleDeals.length - DEALS_PER_STAGE_DEFAULT} hidden)` 
                                    : `Show ${allStageDeals.length - DEALS_PER_STAGE_DEFAULT} More`}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </SortableContext>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeDeal ? <DealCard deal={activeDeal} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </main>
  );
}

