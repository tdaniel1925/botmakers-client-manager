import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensurePlatformAdmin } from "@/lib/platform-admin";
import Link from "next/link";
import { getViewSwitcherDataAction } from "@/actions/view-switcher-actions";
import { GlassSidebarContainer } from "@/components/ui/glass-sidebar-container";
import { ImpersonationBanner } from "@/components/impersonation/impersonation-banner";
import { CompactAdminNav } from "@/components/platform/compact-admin-nav";
import { BrowserFrame } from "@/components/ui/browser-frame";
import { OrgSwitcherDropdown } from "@/components/org-switcher-dropdown";
import { InstantSidebarToggle } from "@/components/instant-sidebar-toggle";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  // Auto-create platform admin for current user on first access
  const isAdmin = await ensurePlatformAdmin();
  
  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Get view switcher data
  const viewSwitcherData = await getViewSwitcherDataAction();

  return (
    <>
      {/* Instant client-side sidebar toggle (0ms delay) */}
      <InstantSidebarToggle />
      
      {/* Impersonation Banner */}
      <ImpersonationBanner />
      
      {/* Browser Frame Wrapper */}
      <BrowserFrame 
        url="app.clientflow.ai/platform" 
        className="h-screen"
      >
        <div className="flex h-full bg-app-bg">
          {/* Sidebar - always rendered, hidden via CSS instantly when needed */}
          <div className="app-sidebar">
            <GlassSidebarContainer className="py-3">
              {/* Organization Switcher */}
              <div className="px-4 py-3">
                <OrgSwitcherDropdown
                  currentView={viewSwitcherData.currentView}
                  availableOrganizations={viewSwitcherData.availableOrganizations}
                  isPlatformAdmin={viewSwitcherData.isPlatformAdmin}
                />
              </div>
              
              <CompactAdminNav />
              
              <div className="p-4 border-t border-white/40">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back to User Dashboard
                </Link>
              </div>
            </GlassSidebarContainer>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden main-content-area">
            {/* Page content */}
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </div>
        </div>
      </BrowserFrame>
    </>
  );
}

