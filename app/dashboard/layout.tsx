/**
 * Dashboard layout for Template App
 * This layout removes the global header from all dashboard pages
 * and applies the dashboard-specific styling
 */
import React, { ReactNode } from "react";
// import { getProfileByUserId, updateProfile } from "@/db/queries/profiles-queries"; // TODO: Recreate
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Sidebar from "@/components/sidebar";
// import { revalidatePath } from "next/cache";
// import CancellationPopup from "@/components/cancellation-popup";
// import WelcomeMessagePopup from "@/components/welcome-message-popup";
// import PaymentSuccessPopup from "@/components/payment-success-popup";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { DashboardClientWrapper } from "@/components/dashboard-client-wrapper";
import { getViewSwitcherDataAction } from "@/actions/view-switcher-actions";
import { ImpersonationBanner } from "@/components/impersonation/impersonation-banner";
// import { createProfileAction } from "@/actions/profiles-actions"; // TODO: Recreate
// import { claimPendingProfile } from "@/actions/whop-actions";
import { BrowserFrame } from "@/components/ui/browser-frame";

// TODO: Recreate profiles system and restore this function
// For now, using mock profile data

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Check authentication
  const { userId } = await auth();

  if (!userId) {
    return redirect("/login");
  }

  // Check if current route is emails or calendar page - if so, render without sidebar
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isEmailsPage = pathname.includes("/emails");
  const isCalendarPage = pathname.includes("/calendar");

  // If emails or calendar page, render children without sidebar
  if (isEmailsPage || isCalendarPage) {
    return <>{children}</>;
  }

  // Get the current user to extract email
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";
  
  // Check if user is a platform admin
  const isPlatformAdminUser = await isPlatformAdmin();
  
  // Get view switcher data
  const viewSwitcherData = await getViewSwitcherDataAction();
  
  // Create a mock profile for now (TODO: Recreate profiles system)
  const mockProfile = {
    userId,
    email: userEmail,
    membership: "free",
    status: "active",
    usageCredits: 5,
    usedCredits: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <>
      {/* Impersonation Banner */}
      <ImpersonationBanner />
      
      {/* Browser Frame Wrapper */}
      <BrowserFrame 
        url="app.clientflow.ai/dashboard" 
        className="h-screen"
      >
        <div className="flex h-full bg-app-bg relative overflow-hidden">
          {/* Sidebar component with mock profile data and user email */}
          <Sidebar 
            profile={mockProfile} 
            userEmail={userEmail} 
            whopMonthlyPlanId={process.env.WHOP_PLAN_ID_MONTHLY || ''}
            whopYearlyPlanId={process.env.WHOP_PLAN_ID_YEARLY || ''}
            isPlatformAdmin={isPlatformAdminUser}
            currentView={viewSwitcherData.currentView}
            availableOrganizations={viewSwitcherData.availableOrganizations}
          />
          
          {/* Main content area wrapped with client-side organization context */}
          <div className="flex-1 overflow-auto relative">
            <DashboardClientWrapper>
              {children}
            </DashboardClientWrapper>
          </div>
        </div>
      </BrowserFrame>
    </>
  );
} 