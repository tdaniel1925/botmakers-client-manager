import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensurePlatformAdmin } from "@/lib/platform-admin";
import Link from "next/link";
import { Building2, LayoutDashboard, LineChart, MessageSquare, Settings, FolderKanban, CheckCircle, HelpCircle, FileText } from "lucide-react";

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

  const navigation = [
    { name: "Dashboard", href: "/platform/dashboard", icon: LayoutDashboard },
    { name: "Organizations", href: "/platform/organizations", icon: Building2 },
    { name: "Projects", href: "/platform/projects", icon: FolderKanban },
    { name: "Onboarding", href: "/platform/onboarding", icon: CheckCircle },
    { name: "Analytics", href: "/platform/analytics", icon: LineChart },
    { name: "Support", href: "/platform/support", icon: MessageSquare },
    { name: "Templates", href: "/platform/templates", icon: FileText },
    { name: "Help", href: "/platform/help", icon: HelpCircle },
    { name: "Settings", href: "/platform/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">ClientFlow</h1>
          <p className="text-sm text-gray-500 mt-1">Platform Admin</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to User Dashboard
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

