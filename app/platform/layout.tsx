import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensurePlatformAdmin } from "@/lib/platform-admin";
import Link from "next/link";
import { ViewSwitcher } from "@/components/view-switcher";
import { getViewSwitcherDataAction } from "@/actions/view-switcher-actions";
import { GlassSidebarContainer } from "@/components/ui/glass-sidebar-container";
import { ImpersonationBanner } from "@/components/impersonation/impersonation-banner";
import { CompactAdminNav } from "@/components/platform/compact-admin-nav";

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
      {/* Impersonation Banner */}
      <ImpersonationBanner />
      
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Using shared GlassSidebarContainer for consistent styling */}
        <GlassSidebarContainer>
          <div className="p-6 border-b border-white/40">
            <h1 className="text-xl font-bold text-gray-900">ClientFlow</h1>
            <p className="text-sm text-gray-500 mt-1">Platform Admin</p>
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

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-end">
          <ViewSwitcher
            currentView={viewSwitcherData.currentView}
            availableOrganizations={viewSwitcherData.availableOrganizations}
            isPlatformAdmin={viewSwitcherData.isPlatformAdmin}
          />
        </div>
        
        {/* Page content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
    </>
  );
}

