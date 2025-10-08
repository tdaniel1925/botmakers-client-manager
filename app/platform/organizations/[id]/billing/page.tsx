"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface SubscriptionData {
  plan: {
    id: string;
    name: string;
    slug: string;
    priceMonthly: number;
    freeMinutes: number;
    perMinuteOverageRate: number;
    maxActiveCampaigns: number;
    features: string[];
  };
  subscription: {
    id: string;
    status: string;
    provider: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  };
  usage: {
    minutesUsed: number;
    minutesRemaining: number;
    overageMinutes: number;
    overageCost: number;
    activeCampaigns: number;
  };
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    amountDue: number;
    status: string;
    periodStart: Date;
    periodEnd: Date;
    paidAt?: Date;
  }>;
}

export default function BillingPage() {
  const params = useParams();
  const organizationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, [organizationId]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizations/${organizationId}/billing`);
      
      if (!response.ok) {
        throw new Error("Failed to load billing data");
      }

      const billingData = await response.json();
      setData(billingData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      active: { variant: "default", label: "Active" },
      trialing: { variant: "secondary", label: "Trial" },
      past_due: { variant: "destructive", label: "Past Due" },
      canceled: { variant: "outline", label: "Canceled" },
    };

    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      stripe: "Stripe",
      square: "Square",
      paypal: "PayPal",
    };
    return names[provider] || provider;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading billing information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No billing information available. Please contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const usagePercentage = (data.usage.minutesUsed / data.plan.freeMinutes) * 100;
  const daysUntilRenewal = Math.ceil(
    (new Date(data.subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription, view usage, and billing history
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{data.plan.name} Plan</CardTitle>
              <CardDescription>
                {formatCurrency(data.plan.priceMonthly)}/month • {data.plan.freeMinutes.toLocaleString()} minutes included
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(data.subscription.status)}
              <Badge variant="outline">{getProviderName(data.subscription.provider)}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage Alert */}
          {data.usage.overageMinutes > 0 && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-900">
                You've used {data.usage.overageMinutes.toLocaleString()} overage minutes this billing cycle.
                Overage charges: <strong>{formatCurrency(data.usage.overageCost)}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Cancelation Notice */}
          {data.subscription.cancelAtPeriodEnd && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your subscription will be canceled on {formatDate(data.subscription.currentPeriodEnd)}.
                You'll maintain access until then.
              </AlertDescription>
            </Alert>
          )}

          {/* Usage Meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Minutes Used This Cycle</span>
              <span className="font-semibold">
                {data.usage.minutesUsed.toLocaleString()} / {data.plan.freeMinutes.toLocaleString()}
              </span>
            </div>
            <Progress value={Math.min(usagePercentage, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {data.usage.minutesRemaining > 0 
                ? `${data.usage.minutesRemaining.toLocaleString()} minutes remaining`
                : `${data.usage.overageMinutes.toLocaleString()} overage minutes used`
              }
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Zap className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">
                  {data.usage.activeCampaigns}
                  {data.plan.maxActiveCampaigns > 0 && ` / ${data.plan.maxActiveCampaigns}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Days Until Renewal</p>
                <p className="text-2xl font-bold">{daysUntilRenewal}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Estimated Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.plan.priceMonthly + data.usage.overageCost)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            {data.plan.slug !== "enterprise" && (
              <Button onClick={() => setShowUpgradeModal(true)}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            )}
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment Method
            </Button>
            {!data.subscription.cancelAtPeriodEnd && (
              <Button variant="ghost">
                Cancel Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {data.invoices.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No invoices yet</p>
          ) : (
            <div className="space-y-3">
              {data.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(invoice.amountDue)}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.status === "paid" ? `Paid ${formatDate(invoice.paidAt!)}` : invoice.status}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

