"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlanSelector } from "./plan-selector";
import { toast } from "sonner";
import { TrendingUp, Loader2 } from "lucide-react";
import type { SelectSubscriptionPlan } from "@/db/schema/billing-schema";

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  currentPlanSlug?: string;
  onSuccess?: () => void;
}

export function UpgradePrompt({
  open,
  onClose,
  organizationId,
  currentPlanSlug,
  onSuccess,
}: UpgradePromptProps) {
  const [plans, setPlans] = useState<SelectSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (open) {
      loadPlans();
    }
  }, [open]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/plans");
      
      if (!response.ok) {
        throw new Error("Failed to load plans");
      }

      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (
    plan: SelectSubscriptionPlan,
    provider: "stripe" | "square" | "paypal"
  ) => {
    try {
      setIsChanging(true);

      // Call API to change subscription
      const response = await fetch(`/api/organizations/${organizationId}/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          provider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change subscription");
      }

      // For providers that require redirect (like PayPal), handle it
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      toast.success(`Successfully ${plan.slug === "free" ? "downgraded" : "upgraded"} to ${plan.name} plan!`);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to change subscription");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Choose Your Plan
          </DialogTitle>
          <DialogDescription>
            Select a plan that fits your needs. You can change your plan at any time.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading plans...</p>
            </div>
          </div>
        ) : (
          <div className="py-6">
            <PlanSelector
              plans={plans}
              currentPlanSlug={currentPlanSlug}
              onSelectPlan={handleSelectPlan}
              isLoading={isChanging}
              showProviderSelector={true}
            />
          </div>
        )}

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={isChanging}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

