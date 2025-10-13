"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { SelectSubscriptionPlan } from "@/db/schema/billing-schema";

type PaymentProvider = "stripe" | "square" | "paypal";

interface PlanSelectorProps {
  plans: SelectSubscriptionPlan[];
  currentPlanSlug?: string;
  onSelectPlan: (plan: SelectSubscriptionPlan, provider: PaymentProvider) => void;
  isLoading?: boolean;
  showProviderSelector?: boolean;
}

export function PlanSelector({
  plans,
  currentPlanSlug,
  onSelectPlan,
  isLoading = false,
  showProviderSelector = true,
}: PlanSelectorProps) {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>("stripe");

  return (
    <div className="space-y-6">
      {/* Payment Provider Selector */}
      {showProviderSelector && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Choose Your Payment Provider
            </CardTitle>
            <CardDescription>
              Select your preferred payment method to process your subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedProvider}
              onValueChange={(value) => setSelectedProvider(value as PaymentProvider)}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="stripe" id="stripe" className="peer sr-only" />
                <Label
                  htmlFor="stripe"
                  className="flex flex-col items-center justify-center gap-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                >
                  <div className="text-center">
                    <div className="font-semibold text-lg mb-1">Stripe</div>
                    <div className="text-xs text-muted-foreground">
                      Credit cards, Apple Pay, Google Pay
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Most Popular
                  </Badge>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="square" id="square" className="peer sr-only" />
                <Label
                  htmlFor="square"
                  className="flex flex-col items-center justify-center gap-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                >
                  <div className="text-center">
                    <div className="font-semibold text-lg mb-1">Square</div>
                    <div className="text-xs text-muted-foreground">
                      Credit cards, Cash App
                    </div>
                  </div>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="paypal" id="paypal" className="peer sr-only" />
                <Label
                  htmlFor="paypal"
                  className="flex flex-col items-center justify-center gap-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                >
                  <div className="text-center">
                    <div className="font-semibold text-lg mb-1">PayPal</div>
                    <div className="text-xs text-muted-foreground">
                      PayPal balance, bank transfer
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.slug === currentPlanSlug;
          const pricePerMonth = plan.monthlyPrice / 100;
          const overageRate = plan.overageRatePerMinute / 100;
          
          return (
            <Card
              key={plan.id}
              className={`relative ${
                isCurrentPlan
                  ? "border-2 border-blue-500 shadow-lg"
                  : "hover:shadow-md transition-shadow"
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500">Current Plan</Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">
                  {plan.description || "Perfect for your needs"}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="space-y-1">
                  <div className="text-4xl font-bold">
                    ${pricePerMonth}
                    <span className="text-lg font-normal text-gray-500">/month</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {plan.includedMinutes.toLocaleString()} minutes included
                  </div>
                  <div className="text-xs text-gray-500">
                    Overage: ${overageRate.toFixed(2)}/min
                  </div>
                </div>
                
                {/* Features */}
                <div className="space-y-2 pt-4">
                  <div className="text-sm font-semibold text-gray-900">Features:</div>
                  <ul className="space-y-2">
                    {(plan.features as string[]).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Limits */}
                {plan.maxActiveCampaigns !== -1 && (
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Up to {plan.maxActiveCampaigns} active campaigns
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                <Button
                  onClick={() => onSelectPlan(plan, selectedProvider)}
                  disabled={isCurrentPlan || isLoading}
                  className="w-full"
                  variant={isCurrentPlan ? "outline" : "default"}
                >
                  {isCurrentPlan ? "Current Plan" : plan.slug === "free" ? "Downgrade" : "Select Plan"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
