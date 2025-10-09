"use client";

import { useState } from "react";
import { 
  ChevronUp, 
  CreditCard, 
  LogOut, 
  Settings, 
  Sparkles,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SelectProfile } from "@/db/schema/profiles-schema";
import { CreditUsageDisplay } from "@/components/credit-usage-display";
import UpgradePlanPopup from "@/components/upgrade-plan-popup";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";

interface UserMenuProps {
  profile: SelectProfile | null;
  userEmail?: string;
  whopMonthlyPlanId: string;
  whopYearlyPlanId: string;
}

export function UserMenu({ profile, userEmail, whopMonthlyPlanId, whopYearlyPlanId }: UserMenuProps) {
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const { signOut } = useClerk();

  // Format the billing cycle end date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <>
      {profile && (
        <UpgradePlanPopup 
          profile={profile} 
          monthlyPlanId={whopMonthlyPlanId} 
          yearlyPlanId={whopYearlyPlanId}
          isOpen={showUpgradePopup}
          onOpenChange={setShowUpgradePopup}
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 w-full p-3 hover:bg-neutral-100/80 rounded-lg transition-all relative z-10">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center text-white font-medium text-sm">
                {userEmail?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
            <div className="hidden md:block flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {userEmail || "User"}
              </p>
              <p className="text-xs text-neutral-500">
                {profile?.membership === "premium" ? "Premium" : "Free"} Plan
              </p>
            </div>
            <ChevronUp className="hidden md:block w-4 h-4 text-neutral-400" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          className="w-[280px]" 
          align="end"
          side="top"
          sideOffset={8}
        >
          {/* User Info */}
          <DropdownMenuLabel>
            <div className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center text-white font-medium">
                {userEmail?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {userEmail || "User"}
                </p>
                <p className="text-xs text-neutral-500">
                  {profile?.membership === "premium" ? "Premium" : "Free"} Plan
                </p>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Plan & Credits Info */}
          {profile && (
            <div className="px-2 py-3">
              <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600 font-medium">Usage Credits</span>
                  <span className="text-neutral-900 font-semibold">
                    {profile.usedCredits ?? 0} of {profile.usageCredits ?? 0} used
                  </span>
                </div>
                
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-600 to-teal-600 transition-all duration-300"
                    style={{ 
                      width: `${Math.min(
                        ((profile.usedCredits ?? 0) / (profile.usageCredits ?? 1)) * 100,
                        100
                      )}%` 
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600">
                    {Math.max((profile.usageCredits ?? 0) - (profile.usedCredits ?? 0), 0)} left
                  </span>
                  {profile.billingCycleEnd && (
                    <div className="flex items-center gap-1 text-neutral-500">
                      <Calendar className="w-3 h-3" />
                      <span>Resets {formatDate(profile.billingCycleEnd)}</span>
                    </div>
                  )}
                </div>
              </div>

              {profile.membership !== "premium" && (
                <Button
                  onClick={() => setShowUpgradePopup(true)}
                  className="w-full mt-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              )}
            </div>
          )}

          <DropdownMenuSeparator />

          {/* Menu Items */}
          <Link href="/pricing">
            <DropdownMenuItem>
              <CreditCard className="w-4 h-4 mr-2" />
              <span>Billing & Plans</span>
            </DropdownMenuItem>
          </Link>

          <Link href="/dashboard/settings">
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => signOut(() => window.location.href = "/")}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

