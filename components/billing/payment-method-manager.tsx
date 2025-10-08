"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentMethodManagerProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  provider: "stripe" | "square" | "paypal";
  customerId?: string;
}

export function PaymentMethodManager({
  open,
  onClose,
  organizationId,
  provider,
  customerId,
}: PaymentMethodManagerProps) {
  const [loading, setLoading] = useState(false);

  const handleUpdatePaymentMethod = async () => {
    try {
      setLoading(true);

      // Call API to get payment method update URL or session
      const response = await fetch(`/api/organizations/${organizationId}/payment-method`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update payment method");
      }

      // Redirect to provider's payment method update page
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      toast.success("Payment method updated successfully");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update payment method");
    } finally {
      setLoading(false);
    }
  };

  const getProviderInfo = () => {
    switch (provider) {
      case "stripe":
        return {
          name: "Stripe",
          description: "Update your credit card or payment method via Stripe's secure portal",
          icon: "💳",
          features: ["Credit cards", "Debit cards", "Apple Pay", "Google Pay"],
        };
      case "square":
        return {
          name: "Square",
          description: "Manage your payment method through Square's secure interface",
          icon: "🔲",
          features: ["Credit cards", "Debit cards", "Cash App"],
        };
      case "paypal":
        return {
          name: "PayPal",
          description: "Update your PayPal payment source",
          icon: "🅿️",
          features: ["PayPal balance", "Bank account", "Credit cards"],
        };
      default:
        return {
          name: "Payment Provider",
          description: "Update your payment method",
          icon: "💰",
          features: [],
        };
    }
  };

  const providerInfo = getProviderInfo();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Update Payment Method
          </DialogTitle>
          <DialogDescription>
            Manage your payment method for {providerInfo.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Provider Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{providerInfo.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{providerInfo.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {providerInfo.description}
                  </p>
                  {providerInfo.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {providerInfo.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              You'll be redirected to {providerInfo.name}'s secure portal to update your payment details.
              Your subscription will continue without interruption.
            </AlertDescription>
          </Alert>

          {/* Current Customer Info */}
          {customerId && (
            <div className="text-xs text-muted-foreground">
              Customer ID: {customerId}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpdatePaymentMethod} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Update Payment Method
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

