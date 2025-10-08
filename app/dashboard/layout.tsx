/**
 * Dashboard layout for Template App
 * This layout removes the global header from all dashboard pages
 * and applies the dashboard-specific styling
 */
import React, { ReactNode } from "react";
import { getProfileByUserId, updateProfile } from "@/db/queries/profiles-queries";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { revalidatePath } from "next/cache";
import CancellationPopup from "@/components/cancellation-popup";
import WelcomeMessagePopup from "@/components/welcome-message-popup";
import PaymentSuccessPopup from "@/components/payment-success-popup";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { DashboardClientWrapper } from "@/components/dashboard-client-wrapper";
import { ViewSwitcher } from "@/components/view-switcher";
import { getViewSwitcherDataAction } from "@/actions/view-switcher-actions";
import { ImpersonationBanner } from "@/components/impersonation/impersonation-banner";
import { createProfileAction } from "@/actions/profiles-actions";
import { claimPendingProfile } from "@/actions/whop-actions";

/**
 * Check if a free user with an expired billing cycle needs their credits downgraded
 * This function handles users who canceled their subscription but still have pro-level credits
 * When their billing cycle ends, we reduce their credit allowance to the free tier level
 */
async function checkExpiredSubscriptionCredits(profile: any | null): Promise<any | null> {
  if (!profile) return profile;

  // Only check free users with billing cycle info (canceled subscriptions)
  if (profile.membership === "free" && profile.billingCycleEnd) {
    const billingCycleEnd = new Date(profile.billingCycleEnd);
    const now = new Date();
    
    // If billing cycle ended and they still have pro-level credits
    if (now > billingCycleEnd && (profile.usageCredits || 0) > 5) {
      console.log(`User ${profile.userId} has expired billing cycle, downgrading credits to free tier`);
      
      // Set up the update data
      const updateData: any = {
        usageCredits: 5,
        usedCredits: 0,  // Reset to 0 for a clean slate
        status: "canceled" // Update status to reflect canceled subscription
      };
      
      // If they don't have a nextCreditRenewal date, set one
      if (!profile.nextCreditRenewal) {
        const nextRenewal = new Date();
        nextRenewal.setDate(nextRenewal.getDate() + 28); // 4 weeks from now
        updateData.nextCreditRenewal = nextRenewal;
      }
      
      // We keep the billingCycleEnd to remember when they canceled
      // but we'll no longer check it after this point
      
      // Update profile with free tier credit limit
      const updatedProfile = await updateProfile(profile.userId, updateData);
      
      // Revalidate pages that display credit information
      revalidatePath("/dashboard");
      revalidatePath("/notes");
      
      return updatedProfile;
    }
  }
  
  return profile;
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Fetch user profile once at the layout level
  const { userId } = await auth();

  if (!userId) {
    return redirect("/login");
  }

  let profile = await getProfileByUserId(userId);

  if (!profile) {
    // No profile exists, try to create one
    try {
      const user = await currentUser();
      const email = user?.emailAddresses?.[0]?.emailAddress;
      
      if (email) {
        // Try to claim any pending profile first
        const claimResult = await claimPendingProfile(userId, email);
        
        if (!claimResult.success) {
          // Only create a new profile if we couldn't claim a pending one
          await createProfileAction({ userId, email });
        }
      } else {
        // No email available, create a basic profile
        await createProfileAction({ userId });
      }
      
      // Fetch the newly created profile
      profile = await getProfileByUserId(userId);
      
      if (!profile) {
        return redirect("/signup");
      }
    } catch (error) {
      console.error("Error creating user profile:", error);
      return redirect("/signup");
    }
  }

  // Run just-in-time credit check for expired subscriptions
  profile = await checkExpiredSubscriptionCredits(profile);
  
  // Verify profile is still valid after check
  if (!profile) {
    return redirect("/signup");
  }

  // Get the current user to extract email
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";
  
  // Check if user is a platform admin
  const isPlatformAdminUser = await isPlatformAdmin();
  
  // Get view switcher data
  const viewSwitcherData = await getViewSwitcherDataAction();
  
  // Log profile details for debugging
  console.log('Dashboard profile:', {
    userId: profile.userId,
    membership: profile.membership,
    createdAt: profile.createdAt,
    usageCredits: profile.usageCredits,
    isPlatformAdmin: isPlatformAdminUser
  });

  return (
    <>
      {/* Impersonation Banner */}
      <ImpersonationBanner />
      
      <div className="flex h-screen bg-gray-50 relative overflow-hidden">
        {/* Show welcome message popup - component handles visibility logic */}
        <WelcomeMessagePopup profile={profile} />
        
        {/* Show payment success popup - component handles visibility logic */}
        <PaymentSuccessPopup profile={profile} />
        
        {/* Show cancellation popup directly if status is canceled */}
        {profile.status === "canceled" && (
          <CancellationPopup profile={profile} />
        )}
      
      {/* Sidebar component with profile data and user email */}
      <Sidebar 
        profile={profile} 
        userEmail={userEmail} 
        whopMonthlyPlanId={process.env.WHOP_PLAN_ID_MONTHLY || ''}
        whopYearlyPlanId={process.env.WHOP_PLAN_ID_YEARLY || ''}
        isPlatformAdmin={isPlatformAdminUser}
      />
      
      {/* Main content area wrapped with client-side organization context */}
      <div className="flex-1 overflow-auto relative flex flex-col">
        {/* View Switcher Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-end">
          <ViewSwitcher
            currentView={viewSwitcherData.currentView}
            availableOrganizations={viewSwitcherData.availableOrganizations}
            isPlatformAdmin={viewSwitcherData.isPlatformAdmin}
          />
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <DashboardClientWrapper>
            {children}
          </DashboardClientWrapper>
        </div>
      </div>
    </div>
    </>
  );
} 